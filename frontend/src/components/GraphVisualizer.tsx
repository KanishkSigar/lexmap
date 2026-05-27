import React, { useEffect, useState, useCallback } from 'react';
import ReactFlow, {
    Node, Edge,
    useNodesState, useEdgesState,
    MarkerType, Controls, Background,
    BackgroundVariant, MiniMap, Handle,
    Position, useReactFlow, ReactFlowProvider,
    EdgeProps, getBezierPath,
} from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';

interface GraphVisualizerProps {
    graphData: {
        nodes: { id: string; type: string; text: string }[];
        edges: { source: string; target: string; relation: string }[];
    } | null;
}

const NODE_W = 200;
const NODE_H = 100;

const TYPE_STYLES: Record<string, { bg: string; border: string; color: string; dot: string; label: string; tag: string }> = {
    claim:      { bg: '#eff6ff', border: '#3b82f6', color: '#1e3a8a', dot: '#3b82f6', label: 'Claim',      tag: '#dbeafe' },
    reasoning:  { bg: '#ecfdf5', border: '#10b981', color: '#064e3b', dot: '#10b981', label: 'Reasoning',  tag: '#d1fae5' },
    conclusion: { bg: '#fffbeb', border: '#f59e0b', color: '#78350f', dot: '#f59e0b', label: 'Conclusion', tag: '#fef3c7' },
    precedent:  { bg: '#faf5ff', border: '#a855f7', color: '#581c87', dot: '#a855f7', label: 'Precedent',  tag: '#f3e8ff' },
};

const EDGE_COLORS: Record<string, string> = {
    supports: '#3b82f6',
    cites:    '#a855f7',
    raises:   '#10b981',
    leads_to: '#f59e0b',
};

// ── Custom bezier edge with label ─────────────────────────
const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, markerEnd, style }: EdgeProps) => {
    const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
    const color = style?.stroke as string || '#94a3b8';
    return (
        <g>
            <path id={id} d={edgePath} fill="none" stroke={color} strokeWidth={1.5}
                strokeOpacity={0.7} markerEnd={markerEnd as string} />
            {data?.label && (
                <g transform={`translate(${labelX},${labelY})`}>
                    <rect x={-18} y={-9} width={36} height={18} rx={4}
                        fill="#ffffff" fillOpacity={0.92} stroke={color} strokeWidth={0.8} strokeOpacity={0.4} />
                    <text textAnchor="middle" dominantBaseline="middle"
                        style={{ fontSize: 8, fontWeight: 700, fill: color, fontFamily: 'Inter, sans-serif', letterSpacing: '0.3px' }}>
                        {data.label}
                    </text>
                </g>
            )}
        </g>
    );
};

// ── Custom node ───────────────────────────────────────────
const CustomNode = ({ data, selected }: { data: any; selected: boolean }) => {
    const s = TYPE_STYLES[data.nodeType] || TYPE_STYLES.claim;
    return (
        <div style={{
            width: NODE_W, height: NODE_H,
            background: `linear-gradient(145deg, ${s.bg} 0%, #ffffff 100%)`,
            border: `1.5px solid ${selected ? s.border : s.border + '99'}`,
            borderRadius: '12px',
            padding: '10px 13px',
            fontFamily: 'Inter, sans-serif',
            cursor: 'pointer',
            boxShadow: selected
                ? `0 0 0 3px ${s.border}33, 0 6px 20px ${s.border}28`
                : `0 2px 8px rgba(0,0,0,0.06), 0 0 0 0px ${s.border}00`,
            transition: 'box-shadow 0.18s, border-color 0.18s',
            display: 'flex', flexDirection: 'column', gap: 6, overflow: 'hidden',
        }}>
            <Handle type="target" position={Position.Left}
                style={{ background: s.dot, border: `2px solid white`, width: 9, height: 9, left: -5 }} />

            {/* Badge */}
            <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: s.tag, borderRadius: 6, padding: '2px 8px',
                width: 'fit-content'
            }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
                <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.7px', color: s.dot }}>
                    {s.label}
                </span>
            </div>

            {/* Text */}
            <p style={{
                fontSize: 11, color: s.color, lineHeight: 1.5, margin: 0,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
            }}>
                {data.fullText}
            </p>

            <Handle type="source" position={Position.Right}
                style={{ background: s.dot, border: `2px solid white`, width: 9, height: 9, right: -5 }} />
        </div>
    );
};

const nodeTypes = { customNode: CustomNode };
const edgeTypes = { customEdge: CustomEdge };

// ── Dagre layout — LR so nodes stack vertically per type ─
const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: 'LR', ranksep: 100, nodesep: 20, marginx: 40, marginy: 40 });

    nodes.forEach(n => g.setNode(n.id, { width: NODE_W, height: NODE_H }));
    edges.forEach(e => g.setEdge(e.source, e.target));
    dagre.layout(g);

    nodes.forEach(n => {
        const pos = g.node(n.id);
        n.position = { x: pos.x - NODE_W / 2, y: pos.y - NODE_H / 2 };
    });
    return { nodes, edges };
};

// ── Detail panel ──────────────────────────────────────────
const DetailPanel = ({ node, onClose }: { node: { type: string; text: string } | null; onClose: () => void }) => {
    if (!node) return null;
    const s = TYPE_STYLES[node.type] || TYPE_STYLES.claim;
    return (
        <div style={{
            position: 'absolute', top: 12, right: 12, width: 272,
            background: '#fff', borderRadius: '14px',
            boxShadow: '0 8px 32px rgba(0,57,62,0.13)',
            border: `1.5px solid ${s.border}33`,
            zIndex: 20, overflow: 'hidden',
            animation: 'panelIn 0.18s ease-out',
        }}>
            <div style={{
                background: s.tag, padding: '11px 14px',
                borderBottom: `1px solid ${s.border}22`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.dot }} />
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.6px', color: s.dot }}>{s.label}</span>
                </div>
                <button onClick={onClose} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#41848c', fontSize: 14, lineHeight: 1, padding: '2px 5px',
                    borderRadius: 4,
                }}>✕</button>
            </div>
            <div style={{ padding: '14px', maxHeight: 250, overflowY: 'auto' }}>
                <p style={{ fontSize: 13, color: '#00393e', lineHeight: 1.7, margin: 0 }}>
                    {node.text}
                </p>
            </div>
        </div>
    );
};

// ── Inner component ───────────────────────────────────────
const GraphInner: React.FC<GraphVisualizerProps> = ({ graphData }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selected, setSelected]          = useState<{ type: string; text: string } | null>(null);
    const { fitView } = useReactFlow();

    useEffect(() => {
        if (!graphData) return;
        setSelected(null);

        const rfNodes: Node[] = graphData.nodes.map(n => ({
            id: n.id, type: 'customNode', position: { x: 0, y: 0 },
            data: { nodeType: n.type, fullText: n.text },
        }));

        const rfEdges: Edge[] = graphData.edges.map((e, i) => ({
            id: `e${i}`, source: e.source, target: e.target,
            type: 'customEdge',
            data: { label: e.relation },
            style: { stroke: EDGE_COLORS[e.relation] || '#94a3b8' },
            markerEnd: {
                type: MarkerType.ArrowClosed,
                color: EDGE_COLORS[e.relation] || '#94a3b8',
                width: 14, height: 14,
            },
        }));

        const { nodes: ln, edges: le } = getLayoutedElements(rfNodes, rfEdges);
        setNodes(ln);
        setEdges(le);
        setTimeout(() => fitView({ padding: 0.18, duration: 500 }), 60);
    }, [graphData, setNodes, setEdges, fitView]);

    const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        setSelected({ type: node.data.nodeType, text: node.data.fullText });
    }, []);

    if (!graphData) return null;

    return (
        <div className="graph-container" style={{ position: 'relative' }}>
            <ReactFlow
                nodes={nodes} edges={edges}
                nodeTypes={nodeTypes} edgeTypes={edgeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                onPaneClick={() => setSelected(null)}
                fitView fitViewOptions={{ padding: 0.18 }}
                minZoom={0.1} maxZoom={3}
                zoomOnScroll panOnScroll={false}
                style={{ background: 'transparent' }}
            >
                <Controls style={{ bottom: 16, left: 16 }} />
                <MiniMap
                    nodeColor={n => TYPE_STYLES[n.data?.nodeType]?.dot || '#94a3b8'}
                    style={{ width: 130, height: 85, bottom: 16, right: 16,
                        background: '#fff', borderRadius: 10,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.07)' }}
                    maskColor="rgba(235,253,255,0.65)"
                />
                <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#d1f5fa" />
            </ReactFlow>

            <DetailPanel node={selected} onClose={() => setSelected(null)} />

            <style>{`
                @keyframes panelIn {
                    from { opacity:0; transform:translateY(-6px) scale(0.97); }
                    to   { opacity:1; transform:translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
};

const GraphVisualizer: React.FC<GraphVisualizerProps> = ({ graphData }) => (
    <ReactFlowProvider>
        <GraphInner graphData={graphData} />
    </ReactFlowProvider>
);

export default GraphVisualizer;
