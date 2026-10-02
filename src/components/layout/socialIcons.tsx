function IconInstagram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
    </svg>
  );
}

function IconFacebook({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      {/* Full-size Facebook logo (same as the insight share buttons) — the old
          lone "f" only filled the middle third and looked tiny next to the others. */}
      <path
        d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.91c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.45 2.91h-2.33v7.03C18.34 21.21 22 17.06 22 12.06Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconLinkedin({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="7.5" cy="8.2" r="1.2" fill="currentColor" />
      <path d="M7.5 11v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M11 17v-3.5c0-1.4 1-2.5 2.3-2.5s2.2 1 2.2 2.5V17"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M11 11v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconTwitter({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="m4 4 6.5 8.4L4.3 20H6.7l5-5.7 4 5.7H20l-6.9-8.8L19.5 4h-2.4l-4.6 5.2L8.3 4Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconYoutube({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="6" width="18" height="12" rx="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10.5 9.5 15 12l-4.5 2.5Z" fill="currentColor" />
    </svg>
  );
}

function IconLink({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M10 14a4 4 0 0 0 5.7 0l2-2a4 4 0 1 0-5.7-5.7l-1 1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M14 10a4 4 0 0 0-5.7 0l-2 2a4 4 0 1 0 5.7 5.7l1-1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SocialIcon({ label, className }: { label: string; className?: string }) {
  const key = label.toLowerCase();
  if (key.includes("instagram")) return <IconInstagram className={className} />;
  if (key.includes("facebook")) return <IconFacebook className={className} />;
  if (key.includes("linkedin")) return <IconLinkedin className={className} />;
  if (key.includes("twitter") || key === "x") return <IconTwitter className={className} />;
  if (key.includes("youtube")) return <IconYoutube className={className} />;
  return <IconLink className={className} />;
}
