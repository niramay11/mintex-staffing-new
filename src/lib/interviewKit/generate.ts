import { InterviewKitSchema, type GenerateKitInput, type InterviewKit } from "./schema";
import { buildKitPrompt, buildRepairPrompt } from "./prompt";

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

async function callGemini(prompt: string): Promise<string> {
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

function parseJson(text: string): unknown {
  // Models occasionally wrap JSON in ```json fences despite instructions not to.
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/```$/, "");
  return JSON.parse(cleaned);
}

export async function generateInterviewKit(input: GenerateKitInput): Promise<InterviewKit> {
  const prompt = buildKitPrompt(input);
  const rawFirst = await callGemini(prompt);

  let parsed: unknown;
  try {
    parsed = parseJson(rawFirst);
  } catch {
    throw new KitGenerationError("Model returned invalid JSON.", 502);
  }

  const firstAttempt = InterviewKitSchema.safeParse(parsed);
  if (firstAttempt.success) return firstAttempt.data;

  console.error("Interview kit failed validation (attempt 1):", JSON.stringify(firstAttempt.error.issues, null, 2));

  // One targeted repair retry, per the plan's "fail one check -> repair, not
  // full regeneration" rule.
  const repairPrompt = buildRepairPrompt(rawFirst, JSON.stringify(firstAttempt.error.issues.slice(0, 10)));
  const rawSecond = await callGemini(repairPrompt);

  let repaired: unknown;
  try {
    repaired = parseJson(rawSecond);
  } catch {
    throw new KitGenerationError("Model returned invalid JSON after repair attempt.", 502);
  }

  const secondAttempt = InterviewKitSchema.safeParse(repaired);
  if (secondAttempt.success) return secondAttempt.data;

  console.error("Interview kit failed validation (attempt 2):", JSON.stringify(secondAttempt.error.issues, null, 2));
  throw new KitGenerationError("Model output failed schema validation twice.", 502);
}
