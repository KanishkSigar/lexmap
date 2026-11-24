import React, { useEffect, useRef, useState } from 'react';
import NodeLegend from './NodeLegend';
import { uploadPDF } from '../services/api';

interface InputSectionProps {
    inputText: string;
    setInputText: (text: string) => void;
    onProcess: () => void;
    loading: boolean;
    passage?: { start: number; end: number };
}

const InputSection: React.FC<InputSectionProps> = ({
    inputText, setInputText, onProcess, loading, passage
}) => {
    const fileInputRef                = useRef<HTMLInputElement>(null);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [pdfError, setPdfError]     = useState<string | null>(null);
    const [pdfFile, setPdfFile]       = useState<string | null>(null);
    const [pdfPages, setPdfPages]     = useState<number | null>(null);
    const [showText, setShowText]     = useState(false);
    const [dragging, setDragging]     = useState(false);

    const textRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (!passage) return;
        if (!textRef.current) {
            setShowText(true);
            return;
        }
        textRef.current.focus();
        textRef.current.setSelectionRange(passage.start, passage.end);
    }, [passage, showText, inputText]);

    const handleFile = async (file: File) => {
        setPdfError(null);
        setPdfLoading(true);
        setPdfFile(file.name);
        setPdfPages(null);
        setShowText(false);
        setInputText('');

        try {
            const data = await uploadPDF(file);
            setInputText(data.text);
            setPdfPages(data.pages);
        } catch (err: any) {
            setPdfError(err.message || 'Failed to extract text from PDF.');
            setPdfFile(null);
        } finally {
            setPdfLoading(false);
        }
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
        e.target.value = '';
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };

    const clearPdf = () => {
        setPdfFile(null);
        setPdfPages(null);
        setPdfError(null);
        setShowText(false);
        setInputText('');
    };

    // Whether a PDF has been successfully loaded
    const pdfReady = !!pdfFile && !!inputText && !pdfLoading;

    return (
        <div className="input-panel">
            <div className="panel-header">
                <div className="panel-title">
                    <div className="panel-icon">📄</div>
                    Input Judgment
                </div>
                <span className="char-count">{inputText.length.toLocaleString()} chars</span>
            </div>

            <div className="panel-body">
                {/* PDF Upload Zone */}
                <div
                    onDragOver={e => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={onDrop}
                    onClick={() => !pdfLoading && fileInputRef.current?.click()}
                    style={{
                        border: `2px dashed ${dragging ? '#005cc1' : pdfReady ? '#bbf7d0' : 'rgba(0,57,62,0.15)'}`,
                        borderRadius: '12px',
                        padding: '16px 20px',
                        background: dragging ? 'rgba(0,92,193,0.04)' : pdfReady ? '#f0fdf4' : 'rgba(248,251,252,0.8)',
                        cursor: pdfLoading ? 'wait' : 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        flexShrink: 0
                    }}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={onFileChange}
                        style={{ display: 'none' }}
                    />

                    <div style={{
                        width: '40px', height: '40px', flexShrink: 0,
                        background: pdfLoading ? '#e8f0fe' : pdfReady ? '#dcfce7' : '#eff6ff',
                        borderRadius: '10px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '18px'
                    }}>
                        {pdfLoading ? '⏳' : pdfReady ? '✅' : '📎'}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        {pdfLoading ? (
                            <>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: '#005cc1' }}>Extracting text…</div>
                                <div style={{ fontSize: '11px', color: '#41848c', marginTop: '2px' }}>{pdfFile}</div>
                            </>
                        ) : pdfReady ? (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#15803d', flex: 1 }}>
                                        Text extracted successfully
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                                        <button
                                            onClick={() => setShowText(s => !s)}
                                            style={{
                                                background: showText ? '#005cc1' : '#ffffff',
                                                border: '1px solid ' + (showText ? '#005cc1' : 'rgba(0,57,62,0.2)'),
                                                color: showText ? '#ffffff' : '#41848c',
                                                borderRadius: '6px', padding: '4px 10px',
                                                fontSize: '11px', fontWeight: 600,
                                                cursor: 'pointer', whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {showText ? 'Hide text' : 'Show text'}
                                        </button>
                                        <button
                                            onClick={clearPdf}
                                            style={{
                                                background: 'none', border: '1px solid rgba(0,57,62,0.15)',
                                                cursor: 'pointer', color: '#41848c',
                                                borderRadius: '6px', padding: '4px 8px',
                                                fontSize: '13px', lineHeight: 1
                                            }}
                                            title="Remove PDF"
                                        >✕</button>
                                    </div>
                                </div>
                                <div style={{ fontSize: '11px', color: '#41848c', marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {pdfFile} · {pdfPages} {pdfPages === 1 ? 'page' : 'pages'} · {inputText.length.toLocaleString()} chars
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: '#00393e' }}>Upload PDF judgment</div>
                                <div style={{ fontSize: '11px', color: '#41848c', marginTop: '2px' }}>Drag & drop or click · Max 5MB</div>
                            </>
                        )}
                    </div>
                </div>

                {/* PDF error */}
                {pdfError && (
                    <div style={{
                        padding: '10px 14px', background: '#fff1f2',
                        border: '1px solid #ffe4e6', borderRadius: '8px',
                        color: '#e11d48', fontSize: '13px', fontWeight: 500, flexShrink: 0
                    }}>
                        ⚠️ {pdfError}
                    </div>
                )}

                {/* Divider — only show when no PDF loaded */}
                {!pdfReady && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(0,57,62,0.08)' }} />
                        <span style={{ fontSize: '11px', color: '#41848c', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>or type / paste</span>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(0,57,62,0.08)' }} />
                    </div>
                )}

                {/* Textarea — always shown when no PDF, toggled when PDF loaded */}
                {(!pdfReady || showText) && (
                    <div className="textarea-wrapper">
                        <textarea
                            id="legal-text-input"
                            ref={textRef}
                            className="legal-textarea"
                            value={inputText}
                            onChange={e => { setInputText(e.target.value); if (pdfFile) { setPdfFile(null); setPdfPages(null); } }}
                            placeholder="Paste legal judgment text here…&#10;&#10;The system will extract claims, reasoning, precedents, and conclusions automatically."
                        />
                    </div>
                )}

                {/* Process button */}
                <button
                    id="process-btn"
                    className="btn-primary"
                    onClick={onProcess}
                    disabled={loading || pdfLoading || !inputText.trim()}
                >
                    {loading ? (
                        <><span className="btn-spinner" />Analyzing…</>
                    ) : (
                        <>⚡ Analyze & Visualize</>
                    )}
                </button>

                <NodeLegend />
            </div>
        </div>
    );
};

export default InputSection;
