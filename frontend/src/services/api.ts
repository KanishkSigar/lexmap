import axios from 'axios';
import { extractNodes } from '../lib/reasoningEngine';
import { buildGraph, type CaseGraph } from '../lib/graphBuilder';
import { extractPdfText, type PdfExtractResult } from '../lib/pdfExtractor';

// Chat endpoint — the only thing that still needs a server.
// Defaults to local Express in dev (VITE_CHAT_API_URL unset),
// in production points to the Vercel function.
const CHAT_URL =
    (import.meta.env.VITE_CHAT_API_URL as string | undefined) ||
    'http://localhost:5000/api/chat';

// ── Local NLP pipeline (was POST /api/process) ──────────────
export const processText = async (text: string): Promise<CaseGraph> => {
    if (!text || !text.trim()) {
        throw new Error('Text input is required');
    }
    const nodes = extractNodes(text);
    return buildGraph(nodes);
};

// ── Local PDF extraction (was POST /api/upload-pdf) ─────────
export const uploadPDF = async (file: File): Promise<PdfExtractResult> => {
    return extractPdfText(file);
};

// ── Client-side "auth" — soft gate, no real JWT ─────────────
// Kept as async to preserve the existing UI flow.
export const login = async (name: string, email: string) => {
    if (!name?.trim() || !email?.trim()) {
        throw new Error('Name and email are required.');
    }
    const user = { name: name.trim(), email: email.trim() };
    // Token is a client-only marker — no security claim.
    const token = btoa(`${user.email}:${Date.now()}`);
    return { token, user };
};

export const verifyToken = async (token: string) => {
    if (!token) throw new Error('No token');
    // Client-side check only: token exists and decodes.
    try {
        atob(token);
        return { valid: true };
    } catch {
        throw new Error('Invalid token');
    }
};

// ── Chat (Lex AI) — hits the Vercel serverless function ─────
export const sendChatMessage = async (
    messages: { role: 'user' | 'assistant'; content: string }[],
    context?: { judgmentText?: string; graphData?: CaseGraph | null }
) => {
    const response = await axios.post(CHAT_URL, { messages, context });
    return response.data as { reply: string };
};
