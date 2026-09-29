"use client";

// Social share icons for Insights posts. Facebook / LinkedIn / X are
// <button>s that open the share window on click, not <a href> links:
// Facebook and X block crawlers, so as plain links they showed up in SEO
// audits (Ahrefs) as "restricted domain — not crawled" on every post.
// Visitors get the exact same share popup. Email stays a real mailto link.
const SHARE_ICON_DEFS = [
  {
    key: "facebook",
    label: "Share on Facebook",
    fill: true,
    path: "M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.91c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.45 2.91h-2.33v7.03C18.34 21.21 22 17.06 22 12.06Z",
    hrefFor: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    key: "linkedin",
    label: "Share on LinkedIn",
    fill: true,
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.114 20.452H3.558V9h3.556v11.452z",
    hrefFor: (url: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    key: "x",
    label: "Share on X",
    fill: true,
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
    hrefFor: (url: string, title: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    key: "email",
    label: "Share via email",
    fill: false,
    path: "M4 6.5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z M3.5 7.5l8.5 6 8.5-6",
    hrefFor: (url: string, title: string) => `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
  },
];

const ICON_CLASS = "text-navy/70 transition-colors hover:text-navy dark:text-cream/60 dark:hover:text-cream";

export default function ShareIcons({ postUrl, title }: { postUrl: string; title: string }) {
  return (
    <div className="flex items-center gap-4">
      {SHARE_ICON_DEFS.map((icon) => {
        const svg = (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            {...(icon.fill
              ? { fill: "currentColor" }
              : { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const })}
          >
            <path d={icon.path} />
          </svg>
        );
        const href = icon.hrefFor(postUrl, title);

        if (icon.key === "email") {
          return (
            <a key={icon.key} href={href} aria-label={icon.label} className={ICON_CLASS}>
              {svg}
            </a>
          );
        }
        return (
          <button
            key={icon.key}
            type="button"
            aria-label={icon.label}
            className={ICON_CLASS}
            onClick={() => window.open(href, "_blank", "noopener,noreferrer,width=640,height=560")}
          >
            {svg}
          </button>
        );
      })}
    </div>
  );
}
