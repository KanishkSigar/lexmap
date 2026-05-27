import type { VercelRequest, VercelResponse } from '@vercel/node';
import Groq from 'groq-sdk';

const BASE_PROMPT = `You are Lex, an expert AI legal assistant integrated into the Legal Case Reasoning Explorer platform. You have deep expertise in:

- Indian constitutional law (Constitution of India, fundamental rights, directive principles, amendments)
- Supreme Court and High Court judgments and landmark cases
- Indian Penal Code, CrPC, CPC, and other major statutes
- International law and comparative legal systems
- Legal reasoning, argumentation, and jurisprudence
- Legal concepts, doctrines, and terminology
- Law school concepts and bar exam preparation

You assist lawyers, law students, researchers, and general users with accurate, well-reasoned legal information. When discussing cases, cite the case name, year, and court. When discussing constitutional provisions, cite the specific article. Be precise, thorough, and educational.

You are also a general-purpose assistant and can help with non-legal queries, but legal topics are your primary expertise.`;

type GraphNode = { id: string; type: 'claim' | 'reasoning' | 'conclusion' | 'precedent'; text: string };
type GraphEdge = { source: string; target: string; relation: string };
type Ctx = { judgmentText?: string; graphData?: { nodes: GraphNode[]; edges?: GraphEdge[] } };

function buildSystemPrompt(context: Ctx | undefined): string {
    const { judgmentText, graphData } = context || {};
    const hasText = !!judgmentText?.trim();
    const hasGraph = !!graphData?.nodes?.length;
    if (!hasText && !hasGraph) return BASE_PROMPT;

    let extra = '\n\n---\n## ACTIVE EXPLORER CONTEXT\n\n';
    extra += 'The user is working in the Legal Case Reasoning Explorer. ';
    extra += 'The following judgment and/or reasoning graph is currently loaded. ';
    extra += 'When they ask about "this case", "the claims", "the judgment", "what was decided", "explain the graph" etc., ';
    extra += 'always answer using the context below — do not ask them to paste text.\n\n';

    if (hasText) {
        const t = judgmentText!;
        const truncated = t.length > 4500 ? t.slice(0, 4500) + '\n...[text truncated for brevity]' : t;
        extra += `### Full Judgment Text\n\`\`\`\n${truncated}\n\`\`\`\n\n`;
    }

    if (hasGraph) {
        const nodes = graphData!.nodes;
        const edges = graphData!.edges || [];
        const byType: Record<string, { id: string; text: string }[]> = { claim: [], reasoning: [], conclusion: [], precedent: [] };
        nodes.forEach((n) => { if (byType[n.type]) byType[n.type].push({ id: n.id, text: n.text }); });

        extra += `### Extracted Reasoning Graph (${nodes.length} nodes, ${edges.length} edges)\n\n`;
        const sect = (label: string, key: string) => {
            if (!byType[key].length) return;
            extra += `**${label}:**\n`;
            byType[key].forEach((n, i) => { extra += `  ${i + 1}. ${n.text}\n`; });
            extra += '\n';
        };
        sect('Claims / Arguments raised', 'claim');
        sect("Court's Reasoning", 'reasoning');
        sect('Conclusions / Decisions', 'conclusion');
        sect('Precedents Cited', 'precedent');

        if (edges.length) {
            extra += `**How nodes connect (logical flow):**\n`;
            edges.slice(0, 20).forEach((e) => {
                const src = nodes.find((n) => n.id === e.source);
                const tgt = nodes.find((n) => n.id === e.target);
                if (src && tgt) {
                    extra += `  - [${src.type}] "${src.text.slice(0, 60)}..." --${e.relation}--> [${tgt.type}] "${tgt.text.slice(0, 60)}..."\n`;
                }
            });
            extra += '\n';
        }
    }

    return BASE_PROMPT + extra;
}

function buildPrimingMessages(context: Ctx | undefined): { role: 'user' | 'assistant'; content: string }[] {
    const { judgmentText, graphData } = context || {};
    const hasText = !!judgmentText?.trim();
    const hasGraph = !!graphData?.nodes?.length;
    if (!hasText && !hasGraph) return [];

    let block = 'The user has loaded the following content into the Legal Case Reasoning Explorer:\n\n';
    if (hasText) {
        const t = judgmentText!;
        const truncated = t.length > 4000 ? t.slice(0, 4000) + '\n...[truncated]' : t;
        block += `JUDGMENT TEXT:\n"""\n${truncated}\n"""\n\n`;
    }
    if (hasGraph) {
        const nodes = graphData!.nodes;
        const edges = graphData!.edges || [];
        const byType: Record<string, string[]> = { claim: [], reasoning: [], conclusion: [], precedent: [] };
        nodes.forEach((n) => { if (byType[n.type]) byType[n.type].push(n.text); });
        block += `EXTRACTED REASONING GRAPH (${nodes.length} nodes, ${edges.length} edges):\n`;
        if (byType.claim.length)      block += `\nClaims:\n${byType.claim.map((t, i) => `${i + 1}. ${t}`).join('\n')}`;
        if (byType.reasoning.length)  block += `\n\nReasoning:\n${byType.reasoning.map((t, i) => `${i + 1}. ${t}`).join('\n')}`;
        if (byType.conclusion.length) block += `\n\nConclusions:\n${byType.conclusion.map((t, i) => `${i + 1}. ${t}`).join('\n')}`;
        if (byType.precedent.length)  block += `\n\nPrecedents cited:\n${byType.precedent.map((t, i) => `${i + 1}. ${t}`).join('\n')}`;
    }

    return [
        { role: 'user', content: block },
        { role: 'assistant', content: 'I have read the judgment and the extracted reasoning graph in full. I am ready to answer any questions about this case — its claims, reasoning, conclusions, precedents, or anything else.' },
    ];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS — frontend is on a different origin (GitHub Pages).
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { messages, context } = req.body || {};
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required.' });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'Server misconfigured: GROQ_API_KEY missing.' });

    try {
        const client = new Groq({ apiKey });
        const systemPrompt = buildSystemPrompt(context);
        const priming = buildPrimingMessages(context);

        const completion = await client.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            max_tokens: 1024,
            messages: [
                { role: 'system', content: systemPrompt },
                ...priming,
                ...messages.map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })),
            ],
        });

        return res.status(200).json({ reply: completion.choices[0].message.content });
    } catch (err) {
        console.error('[chat] Groq error:', err);
        return res.status(500).json({ error: 'Failed to get response from AI. Please try again.' });
    }
}
