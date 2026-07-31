// TODO: confirm the real production domain and set NEXT_PUBLIC_SITE_URL in
// production env vars — this fallback is a placeholder, not a confirmed domain.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mintexstaffing.com";

export const BUSINESS = {
  name: "Mintex Staffing",
  telephone: "+1-732-983-5723",
  // Human-facing display format — kept separate from `telephone` (used for
  // schema.org/tel: links) so the number reads the same way everywhere a
  // visitor actually sees it, instead of two different-looking formats.
  telephoneDisplay: "+1 (732) 983-5723",
  streetAddress: "2163 Oak Tree Rd",
  addressLocality: "Edison",
  addressRegion: "NJ",
  postalCode: "08820",
  addressCountry: "US",
};
