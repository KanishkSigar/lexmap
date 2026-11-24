import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputSection      from './components/InputSection';
import ResultSection     from './components/ResultSection';
import GraphVisualizer   from './components/GraphVisualizer';
import ChatBot           from './components/ChatBot';
import { processText }   from './services/api';

function MainApp() {
    // ── Core state ──────────────────────────────────────
    const [inputText,  setInputText]  = useState<string>('');
    const [graphData,  setGraphData]  = useState<any>(null);
    const [loading,    setLoading]    = useState<boolean>(false);
    const [error,      setError]      = useState<string | null>(null);
    const [viewMode,   setViewMode]   = useState<'json' | 'graph'>('graph');

    const navigate = useNavigate();

    // ── Process text ─────────────────────────────────────
    const handleProcess = async () => {
        if (!inputText.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const result = await processText(inputText);
            setGraphData(result);
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Failed to process text');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-layout">
            <ChatBot judgmentText={inputText} graphData={graphData} />
            {/* ── Header ── */}
            <header className="app-header">
                <div className="header-brand">
                    <div className="header-logo">⚖️</div>
                    <div>
                        <div className="header-title">LexMap</div>
                        <div className="header-subtitle">Judicial reasoning visualization platform</div>
                    </div>
                </div>

                {/* Right side: view toggle and home */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginLeft: 'auto' }}>
                    {/* View toggle */}
                    {graphData && (
                        <div className="view-toggle">
                            <button
                                id="json-view-btn"
                                className={`view-toggle-btn ${viewMode === 'json' ? 'active' : ''}`}
                                onClick={() => setViewMode('json')}
                            >
                                {'{ }'} JSON
                            </button>
                            <button
                                id="graph-view-btn"
                                className={`view-toggle-btn ${viewMode === 'graph' ? 'active' : ''}`}
                                onClick={() => setViewMode('graph')}
                            >
                                ◎ Graph
                            </button>
                        </div>
                    )}

                    <button onClick={() => navigate('/')} style={{
                        background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
                        color: 'white', borderRadius: 8, padding: '6px 14px',
                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        transition: 'background 0.15s'
                    }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                        onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                    >
                        Home
                    </button>
                </div>
            </header>

            {/* ── Main ── */}
            <main className="main-content">
                {/* Input panel */}
                <InputSection
                    inputText={inputText}
                    setInputText={setInputText}
                    onProcess={handleProcess}
                    loading={loading}
                />

                {/* Output panel */}
                <div className="output-panel">
                    {error && (
                        <div style={{ padding: '12px 20px' }}>
                            <div className="error-banner">⚠️ {error}</div>
                        </div>
                    )}

                    <ResultSection graphData={graphData} viewMode={viewMode}>
                        <GraphVisualizer graphData={graphData} />
                    </ResultSection>
                </div>
            </main>
        </div>
    );
}

export default MainApp;
