// Shared between the post page (resolving a legacy "-> " CTA line's href at
// render time) and the rich-text editor's paste converter (picking a sensible
// default href when convention-formatted plain text is pasted). Keep both
// call sites' fallback behavior identical: unmatched text defaults to /insights.
export const CTA_ROUTES: Array<{ test: RegExp; href: string }> = [
  { test: /hiring cost calculator/i, href: "/resources/hiring-cost-calculator" },
  { test: /interview (kit|question|prep)/i, href: "/resources/ai-interview-generator" },
];

export function resolveCtaHref(text: string): string {
  return CTA_ROUTES.find((r) => r.test.test(text))?.href ?? "/insights";
}
