import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatBot from './components/ChatBot';

const LandingPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0);
    const navigate = useNavigate();
    const featRef = useRef<HTMLDivElement>(null);
    const howRef = useRef<HTMLDivElement>(null);

    const scrollTo = (ref: React.RefObject<HTMLDivElement>) =>
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const handleCTA = () => navigate('/app');

    const tabs = [
        { title: 'NLP Extraction',       headline: 'Contextual Legal NLP',        desc: 'Automatically identify and extract claims, precedents, reasoning chains, and conclusions from verbose legal texts with domain-trained natural language processing.' },
        { title: 'Graph Visualization',  headline: 'Interactive Reasoning Graphs', desc: 'Visualize complex legal argument topologies with high-performance auto-layout directional graphs. Click any node to read the full text.' },
        { title: 'AI Legal Assistant',   headline: 'Ask Lex Anything',             desc: 'Chat with Lex AI — aware of your loaded judgment. Ask about claims, precedents, reasoning or any legal concept. Powered by state-of-the-art LLMs.' },
    ];

    const features = [
        { icon: '🔍', title: 'Smart Extraction',    text: 'Pull claims, precedents, reasoning and conclusions automatically from any judgment text or PDF.' },
        { icon: '🕸️', title: 'Reasoning Graphs',    text: 'See how arguments connect. Visual DAGs show the logical flow from claims to conclusions.' },
        { icon: '💬', title: 'Lex AI Assistant',    text: 'Ask questions about any loaded judgment. Lex knows your document and answers in context.' },
        { icon: '📄', title: 'PDF Support',         text: 'Upload judgments as PDF up to 5MB. Text is extracted automatically and ready to analyze.' },
        { icon: '🗂️', title: 'JSON Export',         text: 'Export the full reasoning graph as structured JSON for integration into your own systems.' },
        { icon: '🔒', title: 'Secure Sessions',     text: 'JWT-based session management keeps your workspace private and your data protected.' },
    ];

    const steps = [
        { n: '01', title: 'Input Your Judgment',   desc: 'Paste text directly or upload a PDF. The system accepts any Indian or international court judgment.' },
        { n: '02', title: 'Analyze & Extract',     desc: 'Click Analyze. The NLP engine classifies every sentence as a claim, reasoning, conclusion or precedent.' },
        { n: '03', title: 'Explore the Graph',     desc: 'Navigate the interactive reasoning graph. Click nodes to read full text. Zoom, pan, and explore.' },
        { n: '04', title: 'Ask Lex',               desc: 'Open the Lex AI chat. It already knows your judgment — ask anything about it instantly.' },
    ];

    // ── Shared styles ─────────────────────────────────────
    const S = {
        btn: (primary: boolean): React.CSSProperties => ({
            padding: '13px 28px',
            background: primary ? '#000000' : 'transparent',
            color: primary ? '#ffffff' : '#00393e',
            border: primary ? 'none' : '1.5px solid rgba(0,57,62,0.2)',
            borderRadius: 8, fontSize: 13, fontWeight: 700,
            letterSpacing: '0.04em', textTransform: 'uppercase',
            cursor: 'pointer', transition: 'all 0.2s',
            fontFamily: 'Inter, sans-serif',
        }),
        input: (): React.CSSProperties => ({
            width: '100%', padding: '16px 18px',
            borderRadius: 12, border: '1px solid rgba(193,199,204,0.5)',
            background: '#f8fbfc', fontSize: 15, color: '#00393e',
            outline: 'none', fontFamily: 'Inter, sans-serif',
            boxSizing: 'border-box',
        }),
    };

    return (
        <div style={{ fontFamily: 'Inter, sans-serif', color: '#00393e', background: '#ebfdff' }}>

            {/* ── NAV ───────────────────────────────────── */}
            <nav style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '20px 60px', position: 'sticky', top: 0,
                background: 'rgba(235,253,255,0.85)', backdropFilter: 'blur(14px)',
                zIndex: 100, borderBottom: '1px solid rgba(0,57,62,0.06)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, background: '#000', color: '#fff', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>⚖️</div>
                        <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.03em' }}>LexMap</span>
                    </div>
                    <div style={{ display: 'flex', gap: 24, fontSize: 13, fontWeight: 500, color: '#1f6870', alignItems: 'center' }}>
                        <span style={{ cursor: 'pointer' }} onClick={() => scrollTo(featRef)}>Features</span>
                        <span style={{ cursor: 'pointer' }} onClick={() => scrollTo(howRef)}>How It Works</span>
                        <span style={{ cursor: 'pointer' }} onClick={() => handleCTA()}>Get Started</span>
                    </div>
                </div>

                {/* GitHub link */}
                <a href="https://github.com/KanishkSigar/lexmap" target="_blank" rel="noopener noreferrer" style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    fontSize: 13, fontWeight: 600, color: '#00393e',
                    textDecoration: 'none',
                    padding: '7px 14px',
                    border: '1px solid rgba(0,57,62,0.15)',
                    borderRadius: 8,
                    transition: 'background 0.15s, border-color 0.15s',
                }}
                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(0,57,62,0.05)'; e.currentTarget.style.borderColor = 'rgba(0,57,62,0.3)'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(0,57,62,0.15)'; }}
                >
                    <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                    </svg>
                    GitHub
                </a>
            </nav>

            {/* ── HERO ──────────────────────────────────── */}
            <section style={{ padding: '110px 20px 80px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
                <div style={{ background: '#005cc1', color: '#fff', padding: '5px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Powered by Lex AI Assistant
                </div>
                <h1 style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.06, maxWidth: 900, margin: 0 }}>
                    Visualize Legal Reasoning<br />Through Interactive Graphs
                </h1>
                <p style={{ fontSize: '1.2rem', color: '#1f6870', maxWidth: 560, margin: 0, lineHeight: 1.6 }}>
                    Transform unstructured court judgments into structured reasoning graphs. Understand judicial logic at a glance.
                </p>
                <div style={{ display: 'flex', gap: 14, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button style={{ ...S.btn(true), padding: '15px 32px', fontSize: 14, boxShadow: '0 8px 20px rgba(0,0,0,0.12)' }} onClick={handleCTA}>
                        Open Explorer →
                    </button>
                    <button style={{ ...S.btn(false), padding: '15px 32px', fontSize: 14 }} onClick={() => scrollTo(howRef)}>
                        See How It Works
                    </button>
                </div>
                {/* Stats row */}
                <div style={{ display: 'flex', gap: 48, marginTop: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {[['4', 'Node Types'], ['PDF', 'Upload Support'], ['AI', 'Legal Assistant'], ['Free', 'To Use']].map(([val, label]) => (
                        <div key={label} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: '#005cc1' }}>{val}</div>
                            <div style={{ fontSize: 12, color: '#41848c', fontWeight: 500, marginTop: 2 }}>{label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── FEATURES ──────────────────────────────── */}
            <section ref={featRef} style={{ padding: '80px 60px', maxWidth: 1300, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
                <div style={{ textAlign: 'center', marginBottom: 52 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#41848c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>What You Get</div>
                    <h2 style={{ fontSize: '2.4rem', fontWeight: 700, letterSpacing: '-0.03em', margin: 0 }}>Everything You Need</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 320px))', gap: 20, justifyContent: 'center' }}>
                    {features.map((f, i) => (
                        <div key={i} style={{
                            background: '#fff', border: '1px solid rgba(0,57,62,0.06)',
                            borderRadius: 16, padding: '28px 28px',
                            boxShadow: '0 4px 20px rgba(0,57,62,0.05)',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                        }}
                            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,57,62,0.1)'; }}
                            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,57,62,0.05)'; }}
                        >
                            <div style={{ fontSize: 28, marginBottom: 14 }}>{f.icon}</div>
                            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.01em' }}>{f.title}</h3>
                            <p style={{ fontSize: 14, color: '#1f6870', lineHeight: 1.65, margin: 0 }}>{f.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CAPABILITIES TABS ─────────────────────── */}
            <section style={{ padding: '80px 60px', background: '#fff', boxSizing: 'border-box' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#41848c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Platform Capabilities</div>
                        <h2 style={{ fontSize: '2.4rem', fontWeight: 700, letterSpacing: '-0.03em', margin: 0 }}>Built for Legal Work</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 40 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {tabs.map((tab, idx) => (
                                <button key={idx} onClick={() => setActiveTab(idx)} style={{
                                    padding: '16px 20px', textAlign: 'center',
                                    background: activeTab === idx ? '#000' : 'transparent',
                                    color: activeTab === idx ? '#fff' : '#00393e',
                                    border: activeTab === idx ? 'none' : '1px solid rgba(0,57,62,0.1)',
                                    borderRadius: 10, fontSize: 12, fontWeight: 700,
                                    letterSpacing: '0.04em', textTransform: 'uppercase',
                                    cursor: 'pointer', transition: 'all 0.2s',
                                    fontFamily: 'Inter, sans-serif',
                                    boxShadow: activeTab === idx ? '0 8px 20px rgba(0,0,0,0.12)' : 'none',
                                }}>
                                    {tab.title}
                                </button>
                            ))}
                        </div>
                        <div style={{
                            background: '#f8fbfc', borderRadius: 20, padding: '48px 48px',
                            border: '1px solid rgba(0,57,62,0.05)',
                            boxShadow: '0 8px 32px rgba(0,57,62,0.06)'
                        }}>
                            <h3 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', color: '#005cc1', margin: '0 0 16px 0' }}>
                                {tabs[activeTab].headline}
                            </h3>
                            <p style={{ fontSize: 16, color: '#1f6870', lineHeight: 1.7, margin: '0 0 32px 0', maxWidth: 520 }}>
                                {tabs[activeTab].desc}
                            </p>
                            <button style={{ ...S.btn(true), padding: '12px 24px' }} onClick={handleCTA}>
                                Try It Now →
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ──────────────────────────── */}
            <section ref={howRef} style={{ padding: '80px 60px', maxWidth: 1200, margin: '0 auto', boxSizing: 'border-box' }}>
                <div style={{ textAlign: 'center', marginBottom: 52 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#41848c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Simple Process</div>
                    <h2 style={{ fontSize: '2.4rem', fontWeight: 700, letterSpacing: '-0.03em', margin: 0 }}>How It Works</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
                    {steps.map((step, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div style={{
                                width: 48, height: 48, background: '#000', color: '#fff',
                                borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 13, fontWeight: 800, letterSpacing: '0.02em'
                            }}>{step.n}</div>
                            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>{step.title}</h3>
                            <p style={{ fontSize: 14, color: '#1f6870', lineHeight: 1.65, margin: 0 }}>{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── FOOTER ────────────────────────────────── */}
            <footer style={{
                padding: '32px 60px', background: '#000', color: '#ffffff',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                flexWrap: 'wrap', gap: 16
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 28, height: 28, background: '#fff', color: '#000', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>⚖️</div>
                    <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.02em' }}>LexMap</span>
                </div>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>LexMap · Built for legal research</span>
                <div style={{ display: 'flex', gap: 20, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                    <span style={{ cursor: 'pointer' }} onClick={() => scrollTo(featRef)}>Features</span>
                    <span style={{ cursor: 'pointer' }} onClick={() => scrollTo(howRef)}>How It Works</span>
                    <span style={{ cursor: 'pointer' }} onClick={() => handleCTA()}>Get Started</span>
                </div>
            </footer>

            {/* Chatbot — general legal assistant on landing page */}
            <ChatBot />
        </div>
    );
};

export default LandingPage;
