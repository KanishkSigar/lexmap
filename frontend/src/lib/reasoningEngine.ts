export type NodeType = 'claim' | 'reasoning' | 'conclusion' | 'precedent';

export interface ReasoningNode {
    id: string;
    type: NodeType;
    text: string;
    source?: { start: number; end: number };
    metadata?: Record<string, unknown>;
}

const patterns: Record<NodeType, RegExp> = {
    conclusion: /\b(held that|holds that|it is held|therefore|thus|accordingly|consequently|we conclude|court concludes|verdict is|judgment is|decision is|hereby orders|dismissed|allowed|quashed|upheld|set aside)\b/i,
    reasoning:  /\b(because|since|as it appears|in view of|on account of|in light of|having regard to|considering that|it follows that|this is so because|the reason being|for the foregoing reasons|it is evident|it is clear that|the court is of the opinion)\b/i,
    claim:      /\b(argued|claimed|contended|submitted|alleged|pleaded|urged|asserted|maintained|averred|it is the case of|the petitioner claims|the appellant submits|the respondent argues)\b/i,
    precedent:  /\b(vs\.?|v\.s\.?|cited|relied on|referred to|as held in|in the case of|the ratio in|following the decision|the principle in|the judgment in|as per|pursuant to)\b/i,
};

const abbreviations = /\b(vs|v\.s|no|art|sec|cl|para|p|vol|ed|approx|dept|govt|hon|sr|jr|dr|mr|mrs|ms)\./gi;

function splitSentences(text: string) {
    const protectedText = text.replace(abbreviations, (match) => match.replace(/\./g, '·'));
    return Array.from(protectedText.matchAll(/[^.!?]+(?:[.!?]+|$)/g), (match) => {
        const raw = text.slice(match.index, match.index + match[0].length);
        const clean = raw.trim();
        const start = match.index + raw.length - raw.trimStart().length;
        return { text: clean, start, end: start + clean.length };
    });
}

export function extractNodes(text: string): ReasoningNode[] {
    const sentences = splitSentences(text);
    const nodes: ReasoningNode[] = [];

    sentences.forEach((sentence, index) => {
        const clean = sentence.text;
        if (!clean || clean.length < 10) return;

        let type: NodeType | null = null;
        if (patterns.conclusion.test(clean)) type = 'conclusion';
        else if (patterns.reasoning.test(clean)) type = 'reasoning';
        else if (patterns.claim.test(clean)) type = 'claim';
        else if (patterns.precedent.test(clean)) type = 'precedent';

        if (type) nodes.push({ id: `node-${index}`, type, text: clean, source: { start: sentence.start, end: sentence.end } });
    });

    return nodes;
}
