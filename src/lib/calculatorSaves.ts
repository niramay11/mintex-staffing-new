import { randomInt } from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
import type { CalculatorBreakdownPayload } from "@/lib/calculatorShare";

// Server-only — pulls in the service-role Supabase client, so this must
// never be imported into a "use client" component (see mintex_supabase_
// admin_client_bundle_gotcha). Used by the save API route and the
// saved-results page, both server-side.

// No 0/O/1/I — visually ambiguous when someone reads the code off a screen.
const CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const CODE_LENGTH = 8;
const UNIQUE_VIOLATION = "23505";

function generateCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return code;
}

export async function saveCalculatorResult(payload: CalculatorBreakdownPayload): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode();
    const { error } = await supabaseAdmin.from("calculator_saved_results").insert({
      code,
      mode: payload.mode,
      heading: payload.heading,
      headline_label: payload.headlineLabel,
      headline_value: payload.headlineValue,
      lines: payload.lines,
    });
    if (!error) return code;
    if (error.code !== UNIQUE_VIOLATION) throw new Error(error.message);
  }
  throw new Error("Couldn't generate a unique code — please try again.");
}

export async function getCalculatorResultByCode(code: string): Promise<CalculatorBreakdownPayload | null> {
  const { data, error } = await supabaseAdmin
    .from("calculator_saved_results")
    .select("mode, heading, headline_label, headline_value, lines")
    .eq("code", code)
    .maybeSingle();
  if (error || !data) return null;

  return {
    mode: data.mode,
    heading: data.heading,
    headlineLabel: data.headline_label,
    headlineValue: data.headline_value,
    lines: data.lines,
  };
}
