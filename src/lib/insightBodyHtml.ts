// Small HTML helpers shared by the admin rich-text editor
// (components/admin/InsightBodyEditor.tsx) and the live post page
// (insights/post/[slug]/page.tsx). Plain string/regex only — safe to import
// from client components.

const OWN_ORIGIN = /^https?:\/\/(?:www\.)?mintexstaffing\.com/i;

// "https://www.mintexstaffing.com/seek-talent" -> "/seek-talent". A full URL
// to our own site makes the browser leave and re-enter the site (and the
// apex domain adds a redirect); external URLs are returned unchanged.
export function toSiteRelativeHref(href: string): string {
  const trimmed = href.trim();
  if (!OWN_ORIGIN.test(trimmed)) return trimmed;
  const rest = trimmed.replace(OWN_ORIGIN, "");
  return rest.startsWith("/") ? rest : `/${rest}`;
}

// Marketing's copy docs open with publishing notes for whoever posts them
// ("Post date: …", "SEO title: …", "Meta description: …", "URL slug: …").
// Confirmed live: pasted into the body, three of them became H2 section
// titles ("01 Post date…") and showed in the table of contents. A line that
// is exactly one of these labels + value is a note, never article content.
export type PostNotes = { slug?: string; title?: string; excerpt?: string; date?: string };

const POST_NOTE_LABELS: [RegExp, keyof PostNotes | null][] = [
  [/^(?:post|publish|published|publication)\s+date$/i, "date"],
  [/^(?:seo|meta|page)\s+title$/i, "title"],
  [/^meta\s+description$/i, "excerpt"],
  [/^(?:url\s+)?slug$|^url$/i, "slug"],
  [/^focus\s+key\s*(?:word|phrase)s?$/i, null],
];

export function parsePostNoteLine(text: string): { key: keyof PostNotes | null; value: string } | null {
  const m = text.replace(/\s+/g, " ").trim().match(/^([A-Za-z ]{2,30}?)\s*:\s*(\S.*)$/);
  if (!m) return null;
  const entry = POST_NOTE_LABELS.find(([re]) => re.test(m[1].trim()));
  return entry ? { key: entry[1], value: m[2].trim() } : null;
}

// "/insights/post/nj-abc-test/" -> "nj-abc-test"
export function slugFromNote(value: string): string {
  return value.replace(/[?#].*$/, "").replace(/\/+$/, "").split("/").pop() ?? "";
}

// "Monday, October 26, 2026" -> "2026-10-26"; "" when it isn't a date.
export function dateFromNote(value: string): string {
  const d = new Date(value.replace(/^[A-Za-z]+day,?\s*/i, ""));
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const INLINE_OPEN =/<(?:strong|em|b|i|a|u|span)\b[^>]*>/gi;
const INLINE_CLOSE = /<\/(?:strong|em|b|i|a|u|span)>/gi;
const isBalanced = (s: string) => (s.match(INLINE_OPEN) ?? []).length === (s.match(INLINE_CLOSE) ?? []).length;
const hasContent = (s: string) => s.replace(/<[^>]+>|&nbsp;|\s/g, "") !== "";

// Pasted text often arrives as one <p> holding several "paragraphs" separated
// by <br><br>. Confirmed live: a CTA button added in such a block landed
// after the whole block (below its legal disclaimer) instead of under the
// line it belonged to. Each double break becomes a real paragraph boundary —
// only when no bold/italic/link spans the break, so tags never get split.
export function splitParagraphBreaks(html: string): string {
  return html.replace(/<p([^>]*)>([\s\S]*?)<\/p>/g, (whole, pAttrs: string, inner: string) => {
    const pieces = inner.split(/(?:\s*<br\s*\/?>\s*){2,}/i);
    if (pieces.length < 2 || !pieces.every(isBalanced)) return whole;
    const kept = pieces.map((p) => p.trim()).filter(hasContent);
    return kept.length ? kept.map((p) => `<p${pAttrs}>${p}</p>`).join("") : whole;
  });
}
