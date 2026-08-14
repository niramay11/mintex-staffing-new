// Set NEXT_PUBLIC_GEMINI_PAID_TIER=true in .env.local once you've actually
// verified (Google AI Studio or Cloud Console billing — see the API key's
// project) that the Gemini key this app uses is on a paid tier whose terms
// exclude API inputs from model training. Until that's confirmed, this
// stays false and the resume-upload consent copy stays deliberately
// cautious rather than asserting a privacy guarantee that might not be
// true. NEXT_PUBLIC_ because the consent copy is decided client-side.
export const GEMINI_PAID_TIER_CONFIRMED = process.env.NEXT_PUBLIC_GEMINI_PAID_TIER === "true";
