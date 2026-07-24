import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const variants = {
  primary: "bg-tan text-navy hover:bg-tan-light",
  secondary: "bg-white text-navy hover:bg-mist border border-navy/10",
  outline: "border border-white text-white hover:bg-white hover:text-navy",
} as const;

const baseClasses =
  "inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-steel";

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
