// Normalizes a hand-typed or pasted URL slug: lowercase, spaces/underscores
// to dashes, anything outside a-z/0-9/dash dropped, no leading/trailing or
// doubled dashes. A post once got its full title saved as its slug
// ("The $100,000 H-1B fee…") and 404'd, since the encoded URL never matched
// the stored text. Same rules as the admin editor's live slug formatting.
export function cleanSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}
