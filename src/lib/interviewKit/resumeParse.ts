// Text extraction only — no page rendering, so no canvas/native dependency
// needed. Using pdfjs-dist directly (Mozilla's own PDF.js) rather than the
// popular `pdf-parse` wrapper: pdf-parse v1 has a well-documented bug where
// requiring it in certain bundled/serverless contexts triggers a debug code
// path that tries to read a test fixture off disk, and v2 pulls in
// `@napi-rs/canvas` (a native binding) for page rendering we don't need at
// all. pdfjs-dist's legacy Node build has zero dependencies of its own.
import mammoth from "mammoth";

export class ResumeParseError extends Error {}

const SUPPORTED_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export function isSupportedResumeType(mimeType: string): boolean {
  return SUPPORTED_TYPES.has(mimeType);
}

async function parsePdf(buffer: Buffer): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  // pdfjs defaults to spinning up a Worker (or a "fake worker" fallback
  // that dynamically imports the worker script) — under Next.js's bundler
  // that dynamic import path doesn't resolve, so it's pointed explicitly at
  // the worker module here instead of left to guess.
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/legacy/build/pdf.worker.mjs",
    import.meta.url
  ).toString();
  const doc = await pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    // Disable everything font/rendering related — we only want text streams,
    // and text extraction doesn't need actual font/glyph data to work.
    // verbosity silences a harmless "no standardFontDataUrl" warning that
    // would otherwise log on every single PDF upload.
    useSystemFonts: false,
    verbosity: pdfjsLib.VerbosityLevel.ERRORS,
  }).promise;

  const pageTexts: string[] = [];
  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => ("str" in item ? item.str : "")).join(" ");
    pageTexts.push(pageText);
  }
  return pageTexts.join("\n\n");
}

async function parseDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

/** Parses in memory only — the buffer is never written to disk. */
export async function extractResumeText(buffer: Buffer, mimeType: string): Promise<string> {
  try {
    if (mimeType === "application/pdf") return (await parsePdf(buffer)).trim();
    if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      return (await parseDocx(buffer)).trim();
    }
  } catch {
    throw new ResumeParseError("Couldn't read that file — it may be corrupted, scanned as an image, or password-protected.");
  }
  throw new ResumeParseError("Unsupported file type — upload a PDF or Word (.docx) file.");
}
