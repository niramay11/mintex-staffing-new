import sanitizeHtml from "sanitize-html";

// The rich-text editor (Tiptap) only ever produces this fixed set of tags —
// sanitizing on the way into the database (not just on render) means a
// stored row can never carry anything the post page didn't intend to render,
// regardless of what a future editor version or a pasted clipboard payload
// might smuggle in.
export function sanitizeInsightBodyHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ["p", "h2", "h3", "strong", "em", "ul", "ol", "li", "a", "blockquote", "hr", "br"],
    allowedAttributes: { a: ["href", "class", "rel"] },
    allowedClasses: { a: ["cta-button"] },
    allowedSchemes: ["http", "https", "mailto"],
    allowProtocolRelative: false,
  }).trim();
}
