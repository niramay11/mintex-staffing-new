import Link from "next/link";

const rows = [
  {
    title: "Salary Guide",
    description: "Benchmarks across roles & industries.",
    href: "/resources/salary-guide",
    icon: (
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    ),
  },
  {
    title: "AI Interview Generator",
    description: "Tailored interview questions by industry & level.",
    href: "/resources/ai-interview-generator",
    icon: <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />,
  },
  {
    title: "Free Hiring Consultation",
    description: "Talk to a specialist recruiter today.",
    href: "/contact",
    highlight: true,
    icon: (
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    ),
  },
];

export default function ResourceRows() {
  return (
    <div className="flex flex-col gap-3.5">
      {rows.map((row) => (
        <Link
          key={row.href}
          href={row.href}
          className={`flex items-center gap-4 rounded-2xl p-5 transition-colors ${
            row.highlight
              ? "bg-white border border-navy hover:bg-mist dark:bg-navy-900 dark:border-white/10 dark:hover:bg-navy-800"
              : "bg-mist hover:bg-mist-dark dark:bg-navy-900 dark:hover:bg-navy-800"
          }`}
        >
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-white dark:bg-navy-800">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 text-navy dark:text-cream"
            >
              {row.icon}
            </svg>
          </span>
          <span className="flex-1">
            <span className="block font-heading text-[15.5px] font-semibold text-navy dark:text-cream">
              {row.title}
            </span>
            <span className="block text-[13px] text-steel dark:text-steel-light">{row.description}</span>
          </span>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-[18px] w-[18px] flex-none text-steel dark:text-steel-light"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      ))}
    </div>
  );
}
