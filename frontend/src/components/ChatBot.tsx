import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../services/api';

interface Message {
    role: 'user' | 'assistant' | 'system-notice';
    content: string;
}

interface ChatBotProps {
    judgmentText?: string;
    graphData?: any;
}

const ChatBot: React.FC<ChatBotProps> = ({ judgmentText, graphData }) => {
    const [isOpen, setIsOpen]     = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hello! I'm Lex, your AI legal assistant. Load a judgment in the explorer and I'll be able to answer questions about it — or ask me anything about law." }
    ]);
    const [sharedJudgment, setSharedJudgment] = useState<string | undefined>();
    const shareContext = Boolean(judgmentText && sharedJudgment === judgmentText);
    const [input, setInput]       = useState('');
    const [loading, setLoading]   = useState(false);
    const messagesEndRef          = useRef<HTMLDivElement>(null);
    const inputRef                = useRef<HTMLTextAreaElement>(null);
    const prevContextRef          = useRef<{ hasText: boolean; hasGraph: boolean }>({ hasText: false, hasGraph: false });

    const hasText  = !!(judgmentText?.trim());
    const hasGraph = !!(graphData?.nodes?.length);

    // Inject a notice message (not a reset) when context changes
    useEffect(() => {
        const prev = prevContextRef.current;
        const notices: string[] = [];

        if (hasText && !prev.hasText)
            notices.push(`📄 Judgment text loaded (${judgmentText!.length.toLocaleString()} chars). I can now answer questions about this document.`);
        if (!hasText && prev.hasText)
            notices.push('📄 Judgment text cleared.');
        if (hasGraph && !prev.hasGraph)
            notices.push(`🔗 Reasoning graph generated — ${graphData.nodes.length} nodes (${graphData.nodes.filter((n:any)=>n.type==='claim').length} claims, ${graphData.nodes.filter((n:any)=>n.type==='reasoning').length} reasoning, ${graphData.nodes.filter((n:any)=>n.type==='conclusion').length} conclusions, ${graphData.nodes.filter((n:any)=>n.type==='precedent').length} precedents). Ask me to explain any part of it.`);
        if (!hasGraph && prev.hasGraph)
            notices.push('🔗 Graph cleared.');

        if (notices.length) {
            setMessages(prev => [...prev, ...notices.map(n => ({ role: 'system-notice' as const, content: n }))]);
        }

        prevContextRef.current = { hasText, hasGraph };
    }, [hasText, hasGraph]);

    // Scroll to latest message when a new one arrives
    useEffect(() => {
        if (isOpen && messages.length > 0) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [messages.length, isOpen]);

    useEffect(() => {
        if (isOpen) inputRef.current?.focus();
    }, [isOpen]);

    const handleSend = async () => {
        const text = input.trim();
        if (!text || loading) return;

        // Only include user/assistant messages for history (not system-notices)
        const chatHistory = messages.filter(m => m.role === 'user' || m.role === 'assistant') as { role: 'user' | 'assistant'; content: string }[];
        const newMessages = [...chatHistory, { role: 'user' as const, content: text }];

        setMessages(prev => [...prev, { role: 'user', content: text }]);
        setInput('');
        setLoading(true);

        try {
            // Always send context — backend handles empty gracefully
            const context = shareContext ? { judgmentText, graphData } : undefined;
            const data = await sendChatMessage(newMessages, context);
            setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const clearChat = () => setMessages([
        { role: 'assistant', content: "Hello! I'm Lex, your AI legal assistant. Load a judgment in the explorer and I'll be able to answer questions about it — or ask me anything about law." }
    ]);

    return (
        <>
            {/* Floating button */}
            <button onClick={() => setIsOpen(o => !o)} title="Chat with Lex AI" style={{
                position: 'fixed', bottom: 28, right: 28,
                width: 56, height: 56, borderRadius: '50%',
                background: '#005cc1', color: 'white', border: 'none',
                cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,92,193,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, zIndex: 1000,
                transition: 'transform 0.2s, box-shadow 0.2s',
                transform: isOpen ? 'scale(0.92)' : 'scale(1)'
            }}
                onMouseOver={e => { if (!isOpen) e.currentTarget.style.transform = 'scale(1.08)'; }}
                onMouseOut={e => { if (!isOpen) e.currentTarget.style.transform = 'scale(1)'; }}
            >
                {isOpen ? '✕' : '⚖️'}
            </button>

            {/* Panel */}
            {isOpen && (
                <div style={{
                    position: 'fixed', bottom: 96, right: 28,
                    width: 380, height: 560,
                    background: '#ffffff', borderRadius: 20,
                    boxShadow: '0 20px 60px rgba(0,57,62,0.15)',
                    border: '1px solid rgba(0,57,62,0.08)',
                    display: 'flex', flexDirection: 'column',
                    zIndex: 999, overflow: 'hidden',
                    animation: 'chatSlideIn 0.22s ease-out'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '14px 18px', background: '#005cc1', color: 'white',
                        display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0
                    }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: 'rgba(255,255,255,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
                        }}>⚖️</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 15 }}>Lex AI</div>
                            <div style={{ fontSize: 11, opacity: 0.8 }}>Legal Assistant</div>
                        </div>
                        <button onClick={clearChat} style={{
                            background: 'rgba(255,255,255,0.15)', border: 'none',
                            color: 'white', borderRadius: 6, padding: '4px 10px',
                            fontSize: 11, cursor: 'pointer', fontWeight: 600
                        }}>Clear</button>
                    </div>

                    {/* Context badge */}
                    {(hasText || hasGraph) && (
                        <div style={{
                            padding: '7px 14px', background: '#f0fdf4',
                            borderBottom: '1px solid #bbf7d0',
                            display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0
                        }}>
                            <span style={{ fontSize: 11 }}>✅</span>
                            <span style={{ fontSize: 11, color: '#15803d', fontWeight: 600 }}>
                                Judgment available to share
                            </span>
                            <span style={{ fontSize: 11, color: '#41848c', marginLeft: 'auto' }}>
                                {[hasText && 'text', hasGraph && 'graph'].filter(Boolean).join(' + ')}
                            </span>
                        </div>
                    )}

                    {/* Messages */}
                    <div style={{
                        flex: 1, overflowY: 'auto', padding: '14px',
                        display: 'flex', flexDirection: 'column', gap: 10,
                        background: '#f8fbfc'
                    }}>
                        {messages.map((msg, i) => {
                            if (msg.role === 'system-notice') return (
                                <div key={i} style={{
                                    background: '#f0f9ff', border: '1px solid #bae6fd',
                                    borderRadius: 10, padding: '8px 12px',
                                    fontSize: 12, color: '#0369a1', lineHeight: 1.5
                                }}>
                                    {msg.content}
                                </div>
                            );
                            return (
                                <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                    <div style={{
                                        maxWidth: '85%', padding: '10px 14px',
                                        borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                        background: msg.role === 'user' ? '#005cc1' : '#ffffff',
                                        color: msg.role === 'user' ? '#ffffff' : '#00393e',
                                        fontSize: 13.5, lineHeight: 1.55,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                                        border: msg.role === 'assistant' ? '1px solid rgba(0,57,62,0.07)' : 'none',
                                        whiteSpace: 'pre-wrap', wordBreak: 'break-word'
                                    }}>
                                        {msg.content}
                                    </div>
                                </div>
                            );
                        })}

                        {loading && (
                            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <div style={{
                                    padding: '10px 16px', borderRadius: '16px 16px 16px 4px',
                                    background: '#ffffff', border: '1px solid rgba(0,57,62,0.07)',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                                    display: 'flex', gap: 4, alignItems: 'center'
                                }}>
                                    {[0, 1, 2].map(n => (
                                        <span key={n} style={{
                                            width: 6, height: 6, borderRadius: '50%',
                                            background: '#005cc1', opacity: 0.4,
                                            animation: `chatDot 1.2s ease-in-out ${n * 0.2}s infinite`
                                        }} />
                                    ))}
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {judgmentText && (
                        <label style={{ padding: '8px 14px', fontSize: 12, color: '#00393e' }}>
                            <input type="checkbox" checked={shareContext}
                                onChange={event => setSharedJudgment(event.target.checked ? judgmentText : undefined)} />
                            {' Include this judgment and graph when sending messages to Lex and its model provider'}
                        </label>
                    )}

                    {/* Input */}
                    <div style={{
                        padding: '10px 14px', borderTop: '1px solid rgba(0,57,62,0.08)',
                        background: '#ffffff', display: 'flex', gap: 8,
                        alignItems: 'flex-end', flexShrink: 0
                    }}>
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={shareContext ? 'Ask about this judgment...' : 'Ask about cases, laws, constitution...'}
                            rows={1}
                            style={{
                                flex: 1, padding: '10px 14px', borderRadius: 12,
                                border: '1px solid rgba(0,57,62,0.15)',
                                background: '#f8fbfc', fontSize: 13.5, color: '#00393e',
                                outline: 'none', resize: 'none',
                                fontFamily: 'Inter, sans-serif', lineHeight: 1.5,
                                maxHeight: 100, overflowY: 'auto'
                            }}
                            onFocus={e => { e.target.style.borderColor = '#005cc1'; e.target.style.background = '#fff'; }}
                            onBlur={e => { e.target.style.borderColor = 'rgba(0,57,62,0.15)'; e.target.style.background = '#f8fbfc'; }}
                            onInput={e => {
                                const t = e.currentTarget;
                                t.style.height = 'auto';
                                t.style.height = Math.min(t.scrollHeight, 100) + 'px';
                            }}
                        />
                        <button onClick={handleSend} disabled={!input.trim() || loading} style={{
                            width: 38, height: 38, borderRadius: 10,
                            background: input.trim() && !loading ? '#005cc1' : '#e2eaf4',
                            color: input.trim() && !loading ? '#fff' : '#8aa5c4',
                            border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 16, transition: 'background 0.15s', flexShrink: 0
                        }}>▶</button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes chatSlideIn {
                    from { opacity:0; transform:translateY(16px) scale(0.97); }
                    to   { opacity:1; transform:translateY(0) scale(1); }
                }
                @keyframes chatDot {
                    0%,60%,100% { opacity:0.4; transform:scale(1); }
                    30% { opacity:1; transform:scale(1.3); }
                }
            `}</style>
        </>
    );
};

export default ChatBot;
