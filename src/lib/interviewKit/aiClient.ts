import type { z } from "zod";

// Shared Gemini call + schema-validation-with-one-repair-retry, used by both
// the public title-based generator and the JD-paste path (jdGenerate.ts) —
// factored out once a second real call site needed the exact same retry
// behavior, not speculatively.

// Model availability shifts by account/key — older stable names (2.5-flash,
// 2.5-flash-lite) return 404 "no longer available to new users" on freshly
// created keys, and 2.0-flash/2.0-flash-lite hit a hard quota wall on this
// key. Benchmarked against the real kit prompt: gemini-3-flash-preview took
// ~35s (2500 "thinking" tokens before the answer); gemini-3.1-flash-lite
// produces the same valid output in ~8-11s with no thinking overhead and
// isn't a preview model. Override via env if this one gets deprecated too.
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

function geminiUrl(model: string): string {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
}

export class KitGenerationError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new KitGenerationError(
      "AI generation isn't configured yet — add GEMINI_API_KEY to the environment.",
      501
    );
  }

  const res = await fetch(`${geminiUrl(GEMINI_MODEL)}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.6,
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new KitGenerationError(`Gemini request failed (${res.status}): ${body.slice(0, 300)}`, 502);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string" || !text.trim()) {
    throw new KitGenerationError("Gemini returned an empty response.", 502);
  }
  return text;
}

export function parseJson(text: string): unknown {
  // Models occasionally wrap JSON in ```json fences despite instructions not to.
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/```$/, "");
  return JSON.parse(cleaned);
}

/**
 * Calls Gemini, validates against `schema`, and — on a validation failure —
 * makes exactly one targeted repair attempt (per the "fail one check ->
 * repair, not full regeneration" rule) before giving up.
 */
export async function generateWithSchema<T>(
  schema: z.ZodType<T>,
  prompt: string,
  buildRepairPrompt: (previousOutput: string, validationError: string) => string,
  label: string
): Promise<T> {
  const rawFirst = await callGemini(prompt);

  let parsed: unknown;
  try {
    parsed = parseJson(rawFirst);
  } catch {
    throw new KitGenerationError(`Model returned invalid JSON (${label}).`, 502);
  }

  const firstAttempt = schema.safeParse(parsed);
  if (firstAttempt.success) return firstAttempt.data;

  console.error(`${label} failed validation (attempt 1):`, JSON.stringify(firstAttempt.error.issues, null, 2));

  const repairPrompt = buildRepairPrompt(rawFirst, JSON.stringify(firstAttempt.error.issues.slice(0, 10)));
  const rawSecond = await callGemini(repairPrompt);

  let repaired: unknown;
  try {
    repaired = parseJson(rawSecond);
  } catch {
    throw new KitGenerationError(`Model returned invalid JSON after repair attempt (${label}).`, 502);
  }

  const secondAttempt = schema.safeParse(repaired);
  if (secondAttempt.success) return secondAttempt.data;

  console.error(`${label} failed validation (attempt 2):`, JSON.stringify(secondAttempt.error.issues, null, 2));
  throw new KitGenerationError(`Model output failed schema validation twice (${label}).`, 502);
}
