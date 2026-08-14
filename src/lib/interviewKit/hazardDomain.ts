// "Safety" focus was semantically unstable when left to the model to
// interpret on its own — data privacy for a Marketing Manager, OSHA for a
// warehouse role, patient safety for a nurse, all under the same label.
// Resolving it from industry instead of guessing avoids that.
//
// Keys are the exact industry names from the `industries` Supabase table
// (see src/lib/industries.ts) — not the doc's illustrative placeholder
// names. Industries absent here don't get a hazard domain, and the UI
// hides the "Safety" option entirely rather than generating something
// strained for, say, an Administrative or Hospitality role.
export const HAZARD_DOMAIN: Record<string, string> = {
  "Healthcare Staffing": "patient safety, infection control, medication error prevention",
  "Industrial & Manufacturing Staffing": "OSHA compliance, machine guarding, lockout/tagout, PPE",
  "Transportation & Logistics Staffing": "DOT compliance, hours of service, load securement, forklift safety",
  "Engineering Staffing": "site safety, structural and design risk, regulatory sign-off",
  "IT Staffing": "information security, data privacy, incident response",
  "Finance & Accounting Staffing": "financial controls, fraud prevention, regulatory compliance",
};

export function getHazardDomain(industryName: string): string | undefined {
  return HAZARD_DOMAIN[industryName];
}

export function hasHazardDomain(industryName: string): boolean {
  return industryName in HAZARD_DOMAIN;
}
