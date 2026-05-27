import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

export interface PdfExtractResult {
    text: string;
    pages: number;
    filename: string;
    size: number;
}

const MAX_BYTES = 5 * 1024 * 1024;

export async function extractPdfText(file: File): Promise<PdfExtractResult> {
    if (file.size > MAX_BYTES) {
        throw new Error('File too large. Maximum size is 5MB.');
    }

    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer), verbosity: 0 }).promise;

    const pageTexts: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
            .map((item) => ('str' in item ? (item as { str: string }).str : ''))
            .join(' ')
            .replace(/ {2,}/g, ' ')
            .trim();
        if (pageText) pageTexts.push(pageText);
    }

    const text = pageTexts.join('\n\n');
    if (!text || text.length < 20) {
        throw new Error('Could not extract text. The PDF may be scanned or image-based.');
    }

    return { text, pages: pdf.numPages, filename: file.name, size: file.size };
}
