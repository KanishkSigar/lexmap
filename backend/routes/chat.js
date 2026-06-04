require('dotenv').config();
const express = require('express');
const Groq    = require('groq-sdk');
const router  = express.Router();

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const BASE_PROMPT = `You are Lex, an expert AI legal assistant integrated into LexMap platform. You have deep expertise in:

- Indian constitutional law (Constitution of India, fundamental rights, directive principles, amendments)
- Supreme Court and High Court judgments and landmark cases
- Indian Penal Code, CrPC, CPC, and other major statutes
- International law and comparative legal systems
- Legal reasoning, argumentation, and jurisprudence
- Legal concepts, doctrines, and terminology
- Law school concepts and bar exam preparation

You assist lawyers, law students, researchers, and general users with accurate, well-reasoned legal information. When discussing cases, cite the case name, year, and court. When discussing constitutional provisions, cite the specific article. Be precise, thorough, and educational.

You are also a general-purpose assistant and can help with non-legal queries, but legal topics are your primary expertise.`;

function buildSystemPrompt(context) {
    const { judgmentText, graphData } = context || {};
    const hasText  = !!(judgmentText?.trim());
    const hasGraph = !!(graphData?.nodes?.length);

    if (!hasText && !hasGraph) return BASE_PROMPT;

    let extra = '\n\n---\n## ACTIVE EXPLORER CONTEXT\n\n';
    extra += 'The user is working in LexMap. ';
    extra += 'The following judgment and/or reasoning graph is currently loaded. ';
    extra += 'When they ask about "this case", "the claims", "the judgment", "what was decided", "explain the graph" etc., ';
    extra += 'always answer using the context below — do not ask them to paste text.\n\n';

    if (hasText) {
        const truncated = judgmentText.length > 4500
            ? judgmentText.slice(0, 4500) + '\n...[text truncated for brevity]'
            : judgmentText;
        extra += `### Full Judgment Text\n\`\`\`\n${truncated}\n\`\`\`\n\n`;
    }

    if (hasGraph) {
        const nodes  = graphData.nodes;
        const edges  = graphData.edges || [];
        const byType = { claim: [], reasoning: [], conclusion: [], precedent: [] };

        nodes.forEach(n => {
            if (byType[n.type]) byType[n.type].push({ id: n.id, text: n.text });
        });

        extra += `### Extracted Reasoning Graph (${nodes.length} nodes, ${edges.length} edges)\n\n`;

        if (byType.claim.length) {
            extra += `**Claims / Arguments raised:**\n`;
            byType.claim.forEach((n, i) => { extra += `  ${i+1}. ${n.text}\n`; });
            extra += '\n';
        }
        if (byType.reasoning.length) {
            extra += `**Court's Reasoning:**\n`;
            byType.reasoning.forEach((n, i) => { extra += `  ${i+1}. ${n.text}\n`; });
            extra += '\n';
        }
        if (byType.conclusion.length) {
            extra += `**Conclusions / Decisions:**\n`;
            byType.conclusion.forEach((n, i) => { extra += `  ${i+1}. ${n.text}\n`; });
            extra += '\n';
        }
        if (byType.precedent.length) {
            extra += `**Precedents Cited:**\n`;
            byType.precedent.forEach((n, i) => { extra += `  ${i+1}. ${n.text}\n`; });
            extra += '\n';
        }

        if (edges.length) {
            extra += `**How nodes connect (logical flow):**\n`;
            edges.slice(0, 20).forEach(e => {
                const src = nodes.find(n => n.id === e.source);
                const tgt = nodes.find(n => n.id === e.target);
                if (src && tgt) extra += `  - [${src.type}] "${src.text.slice(0,60)}..." --${e.relation}--> [${tgt.type}] "${tgt.text.slice(0,60)}..."\n`;
            });
            extra += '\n';
        }
    }

    return BASE_PROMPT + extra;
}

// Inject context as a priming conversation so the model reliably "sees" it
function buildPrimingMessages(context) {
    const { judgmentText, graphData } = context || {};
    const hasText  = !!(judgmentText?.trim());
    const hasGraph = !!(graphData?.nodes?.length);

    if (!hasText && !hasGraph) return [];

    let contextBlock = 'The user has loaded the following content into LexMap:\n\n';

    if (hasText) {
        const truncated = judgmentText.length > 4000
            ? judgmentText.slice(0, 4000) + '\n...[truncated]'
            : judgmentText;
        contextBlock += `JUDGMENT TEXT:\n"""\n${truncated}\n"""\n\n`;
    }

    if (hasGraph) {
        const nodes  = graphData.nodes;
        const edges  = graphData.edges || [];
        const byType = { claim: [], reasoning: [], conclusion: [], precedent: [] };
        nodes.forEach(n => { if (byType[n.type]) byType[n.type].push(n.text); });

        contextBlock += `EXTRACTED REASONING GRAPH (${nodes.length} nodes, ${edges.length} edges):\n`;
        if (byType.claim.length)      contextBlock += `\nClaims:\n${byType.claim.map((t,i)=>`${i+1}. ${t}`).join('\n')}`;
        if (byType.reasoning.length)  contextBlock += `\n\nReasoning:\n${byType.reasoning.map((t,i)=>`${i+1}. ${t}`).join('\n')}`;
        if (byType.conclusion.length) contextBlock += `\n\nConclusions:\n${byType.conclusion.map((t,i)=>`${i+1}. ${t}`).join('\n')}`;
        if (byType.precedent.length)  contextBlock += `\n\nPrecedents cited:\n${byType.precedent.map((t,i)=>`${i+1}. ${t}`).join('\n')}`;
    }

    return [
        { role: 'user',      content: contextBlock },
        { role: 'assistant', content: 'I have read the judgment and the extracted reasoning graph in full. I am ready to answer any questions about this case — its claims, reasoning, conclusions, precedents, or anything else.' }
    ];
}

router.post('/', async (req, res) => {
    const { messages, context } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required.' });
    }

    try {
        console.log('[Chat] context received:', {
            hasContext: !!context,
            textLength: context?.judgmentText?.length || 0,
            nodeCount: context?.graphData?.nodes?.length || 0
        });
        const systemPrompt = buildSystemPrompt(context);
        const primingMessages = buildPrimingMessages(context);

        const completion = await client.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            max_tokens: 1024,
            messages: [
                { role: 'system', content: systemPrompt },
                ...primingMessages,
                ...messages.map(m => ({ role: m.role, content: m.content }))
            ]
        });

        res.json({ reply: completion.choices[0].message.content });
    } catch (err) {
        console.error('[Chat] Groq API error:', err.message);
        res.status(500).json({ error: 'Failed to get response from AI. Please try again.' });
    }
});

module.exports = router;
