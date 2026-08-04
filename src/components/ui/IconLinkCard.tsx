import Link from "next/link";

export default function IconLinkCard({
  href,
  tag,
  title,
  description,
  iconPath,
}: {
  href: string;
  tag: string;
  title: string;
  description: string;
  iconPath: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-navy/[0.08] bg-white p-7 shadow-[0_1px_3px_rgba(0,48,96,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-tan/40 hover:shadow-[0_20px_45px_-24px_rgba(1,35,64,0.3)]"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-tan/[0.14] text-tan">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
          <path d={iconPath} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-tan">{tag}</p>
      <h3 className="mt-1.5 font-heading text-[17px] font-semibold tracking-tight text-navy">{title}</h3>
      <p className="mt-2 text-[14.5px] leading-[1.7] text-steel">{description}</p>
      <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-navy transition-colors group-hover:text-tan">
        Read more
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4">
          <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </Link>
  );
}

export const ARTICLE_ICON_PATH =
  "M7 4h7l3 3v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z M14 4v3h3 M9 11h6 M9 15h6";
