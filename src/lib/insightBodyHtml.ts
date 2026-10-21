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

const INLINE_OPEN = /<(?:strong|em|b|i|a|u|span)\b[^>]*>/gi;
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
