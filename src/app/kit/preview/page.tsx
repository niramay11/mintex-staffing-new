import type { Metadata } from "next";
import KitPreviewClient from "@/components/tools/KitPreviewClient";

// Private path result page for the JD-paste flow. Never indexed — the
// content here is entirely client-held (sessionStorage), so there is
// nothing for a crawler to see anyway, but the noindex is explicit rather
// than relying on that accident.
export const metadata: Metadata = {
  title: "Your Interview Kit | Mintex Staffing",
  robots: { index: false, follow: false },
};

export default function KitPreviewPage() {
  return <KitPreviewClient />;
}
