// Shared base64url-ish encode/decode for packing calculator state into a URL
// fragment (`#s=...`) — used by the "Save these numbers" share link and by
// the "Email me this breakdown" hand-off between the calculator and the
// email-results page. Kept in one place so both stay byte-for-byte compatible.
export const packState = (o: unknown): string => {
  try {
    const json = JSON.stringify(o);
    const bytes = encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1: string) =>
      String.fromCharCode(parseInt(p1, 16))
    );
    return btoa(bytes);
  } catch {
    return "";
  }
};

export const unpackState = (token: string): Record<string, unknown> | null => {
  try {
    const bytes = atob(token);
    const json = decodeURIComponent(
      Array.from(bytes)
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
};

export interface CalculatorBreakdownLine {
  label: string;
  value: string;
  strong?: boolean;
  accent?: boolean;
}

export interface CalculatorBreakdownPayload {
  mode: "employer" | "staffing" | "search";
  heading: string;
  headlineLabel: string;
  headlineValue: string;
  lines: CalculatorBreakdownLine[];
}

const MAX_BREAKDOWN_LINES = 40;
const MAX_BREAKDOWN_TEXT = 200;

// Shared by the email-results and save API routes so a caller can't post an
// oversized or malformed breakdown — trims to sane limits instead of
// trusting whatever shape the client sends.
export function sanitizeBreakdownPayload(body: unknown): CalculatorBreakdownPayload | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;

  if (b.mode !== "employer" && b.mode !== "staffing" && b.mode !== "search") return null;
  const heading = String(b.heading ?? "").trim().slice(0, MAX_BREAKDOWN_TEXT);
  const headlineLabel = String(b.headlineLabel ?? "").trim().slice(0, MAX_BREAKDOWN_TEXT);
  const headlineValue = String(b.headlineValue ?? "").trim().slice(0, MAX_BREAKDOWN_TEXT);
  const rawLines = Array.isArray(b.lines) ? b.lines : [];

  const lines: CalculatorBreakdownLine[] = rawLines
    .slice(0, MAX_BREAKDOWN_LINES)
    .map((line: unknown) => {
      const l = (line ?? {}) as Record<string, unknown>;
      return {
        label: String(l.label ?? "").trim().slice(0, MAX_BREAKDOWN_TEXT),
        value: String(l.value ?? "").trim().slice(0, MAX_BREAKDOWN_TEXT),
        strong: l.strong === true,
        accent: l.accent === true,
      };
    })
    .filter((l) => l.label && l.value);

  if (!heading || !headlineLabel || !headlineValue || lines.length === 0) return null;
  return { mode: b.mode, heading, headlineLabel, headlineValue, lines };
}
