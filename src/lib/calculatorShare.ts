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
