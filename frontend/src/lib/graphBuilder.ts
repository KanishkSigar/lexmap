import type { NodeType, ReasoningNode } from './reasoningEngine';

export type EdgeRelation = 'raises' | 'supports' | 'leads_to' | 'cites';

export interface GraphEdge {
    source: string;
    target: string;
    relation: EdgeRelation;
}

export interface CaseGraph {
    nodes: ReasoningNode[];
    edges: GraphEdge[];
}

const docIndex = (n: ReasoningNode): number => {
    const m = n.id.match(/node-(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
};

const nearest = (source: ReasoningNode, targets: ReasoningNode[]): ReasoningNode | null => {
    if (!targets.length) return null;
    const si = docIndex(source);
    const after = targets.filter((t) => docIndex(t) > si);
    const before = targets.filter((t) => docIndex(t) < si);
    if (after.length) return after.reduce((a, b) => (docIndex(a) - si < docIndex(b) - si ? a : b));
    if (before.length) return before.reduce((a, b) => (si - docIndex(a) < si - docIndex(b) ? a : b));
    return null;
};

export function buildGraph(nodes: ReasoningNode[]): CaseGraph {
    const byType = (type: NodeType) =>
        nodes.filter((n) => n.type === type).sort((a, b) => docIndex(a) - docIndex(b));

    const claims = byType('claim');
    const reasonings = byType('reasoning');
    const conclusions = byType('conclusion');
    const precedents = byType('precedent');

    const edges: GraphEdge[] = [];
    const link = (src: ReasoningNode, tgt: ReasoningNode | null, relation: EdgeRelation) => {
        if (tgt) edges.push({ source: src.id, target: tgt.id, relation });
    };

    claims.forEach((c) => link(c, nearest(c, reasonings), 'raises'));
    claims.forEach((c) => link(c, nearest(c, conclusions), 'supports'));
    reasonings.forEach((r) => link(r, nearest(r, conclusions), 'leads_to'));
    conclusions.forEach((c) => link(c, nearest(c, precedents), 'cites'));

    return { nodes, edges };
}
