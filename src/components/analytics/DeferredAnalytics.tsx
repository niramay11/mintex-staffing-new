"use client";

import { useEffect } from "react";

const GA_ID = "G-X8S5R27JY4";
const INTERACTION_EVENTS = ["scroll", "pointerdown", "keydown", "touchstart"] as const;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

export default function DeferredAnalytics() {
  useEffect(() => {
    function load() {
      INTERACTION_EVENTS.forEach((event) => window.removeEventListener(event, load));

      const script = document.createElement("script");
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
      script.async = true;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag(...args: unknown[]) {
        window.dataLayer.push(args);
      };
      window.gtag("js", new Date());
      window.gtag("config", GA_ID);
    }

    INTERACTION_EVENTS.forEach((event) =>
      window.addEventListener(event, load, { once: true, passive: true })
    );
    return () => INTERACTION_EVENTS.forEach((event) => window.removeEventListener(event, load));
  }, []);

  return null;
}
