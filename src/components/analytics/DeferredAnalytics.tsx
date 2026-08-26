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
      // Must push the `arguments` object itself, NOT `[...arguments]`/rest-param
      // spread — gtag.js's own dataLayer.push override only recognizes a real
      // Arguments object as a command; a plain array is silently dropped, so
      // this exact form (Google's own boilerplate) is required, not a style
      // choice. Confirmed live: rest-param spread never sent a single hit to
      // google-analytics.com no matter how long we waited; switching to
      // `arguments` fixed it instantly (GA Realtime showed 0 active users
      // despite `dataLayer` filling up with "js"/"config" entries and the
      // patched dataLayer.push being present — the hit itself never fired).
      window.gtag = function gtag() {
        // eslint-disable-next-line prefer-rest-params -- see comment above, this must stay `arguments`
        window.dataLayer.push(arguments);
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
