import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const variants = {
  // Solid navy pill — the homepage hero "Request talent" look, site-wide.
  primary:
    "border border-navy bg-navy text-white shadow-[0_14px_36px_-10px_rgba(0,48,96,0.35)] hover:-translate-y-0.5 hover:border-navy-secondary hover:bg-navy-secondary hover:shadow-[0_18px_44px_-8px_rgba(0,48,96,0.45)] dark:border-steel dark:bg-steel dark:text-navy-950 dark:hover:border-steel-light dark:hover:bg-steel-light",
  // Every action button on the site uses the same navy look (kept as its own
  // key so existing variant="secondary" call sites keep working).
  secondary:
    "border border-navy bg-navy text-white shadow-[0_14px_36px_-10px_rgba(0,48,96,0.35)] hover:-translate-y-0.5 hover:border-navy-secondary hover:bg-navy-secondary hover:shadow-[0_18px_44px_-8px_rgba(0,48,96,0.45)] dark:border-steel dark:bg-steel dark:text-navy-950 dark:hover:border-steel-light dark:hover:bg-steel-light",
  outline: "border border-white text-white hover:bg-white hover:text-navy",
} as const;

const baseClasses =
  "inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm font-semibold transition-all focus-visible:outline-2 focus-visible:outline-steel disabled:pointer-events-none disabled:opacity-60";

// For hand-built buttons (form submits, client components with their own
// markup) so they match ButtonLink/Button exactly. PRIMARY_BUTTON_COLORS is
// the look alone, for compact buttons that keep their own size (job cards).
export const PRIMARY_BUTTON_COLORS = variants.primary;
export const PRIMARY_BUTTON = `${baseClasses} ${variants.primary}`;

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  return (
    <Link href={href} className={`${baseClasses} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: keyof typeof variants;
}) {
  return (
    <button className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
