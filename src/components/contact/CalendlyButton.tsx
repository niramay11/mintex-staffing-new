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

// Loads Calendly's own popup widget script/stylesheet on demand (only when
// this button is mounted, i.e. only on /contact — not site-wide) rather
// than bundling anything ourselves. Clicking calls Calendly's own
// initPopupWidget, which renders the scheduler as an overlay on top of this
// page instead of navigating away to calendly.com.
export default function CalendlyButton({ className }: { className?: string }) {
  useEffect(() => {
    if (document.getElementById("calendly-widget-script")) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://assets.calendly.com/assets/external/widget.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.id = "calendly-widget-script";
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.Calendly?.initPopupWidget({ url: CALENDLY_URL })}
      className={
        className ??
        "inline-flex items-center justify-center gap-1.5 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-secondary dark:bg-steel dark:text-navy-950 dark:hover:bg-steel-light"
      }
    >
      Book a Meeting
    </button>
  );
}
