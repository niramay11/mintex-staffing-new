"use client";

import { useEffect } from "react";

const CALENDLY_URL = "https://calendly.com/meet-mintextech/your-success-partner";

declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (options: { url: string }) => void;
    };
  }
}

const SCRIPT_ID = "calendly-widget-script";

// Injects Calendly's own popup widget script/stylesheet once, on demand,
// rather than bundling anything ourselves or loading it site-wide.
function loadCalendly(): HTMLScriptElement {
  const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) return existing;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "https://assets.calendly.com/assets/external/widget.css";
  document.head.appendChild(link);

  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.src = "https://assets.calendly.com/assets/external/widget.js";
  script.async = true;
  document.body.appendChild(script);
  return script;
}

// Opens the scheduler as an overlay on the current page instead of
// navigating away to calendly.com. Safe to call before the script has
// loaded (e.g. from the floating contact button on any page): it loads it
// and opens once ready. If the script can't load (blocked, offline), falls
// back to opening Calendly in a new tab.
export function openCalendlyPopup() {
  if (window.Calendly) {
    window.Calendly.initPopupWidget({ url: CALENDLY_URL });
    return;
  }
  const script = loadCalendly();
  script.addEventListener("load", () => window.Calendly?.initPopupWidget({ url: CALENDLY_URL }), { once: true });
  script.addEventListener("error", () => window.open(CALENDLY_URL, "_blank", "noopener,noreferrer"), { once: true });
}

// On /contact the script is preloaded on mount so the first click is instant.
export default function CalendlyButton({ className }: { className?: string }) {
  useEffect(() => {
    loadCalendly();
  }, []);

  return (
    <button
      type="button"
      onClick={openCalendlyPopup}
      className={
        className ??
        "inline-flex items-center justify-center gap-1.5 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-secondary dark:bg-steel dark:text-navy-950 dark:hover:bg-steel-light"
      }
    >
      Book a Meeting
    </button>
  );
}
