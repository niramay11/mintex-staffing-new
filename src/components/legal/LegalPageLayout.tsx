import type { ReactNode } from "react";
import Link from "next/link";
import Section from "@/components/ui/Section";

export interface LegalSection {
  id: string;
  title: string;
  content: ReactNode;
}

export default function LegalPageLayout({
  title,
  intro,
  lastUpdated,
  sections,
}: {
  title: string;
  intro: ReactNode;
  lastUpdated: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <Section background="mist" className="!py-12 sm:!py-14 lg:!py-16">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-navy/60">
          <Link href="/" className="font-medium text-navy transition-colors hover:text-navy-secondary">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span>{title}</span>
        </nav>
        <h1 className="mt-4 font-heading text-4xl font-bold text-navy sm:text-5xl">{title}</h1>
        <div className="mt-3 h-1 w-16 rounded-full bg-steel" />
        <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-navy/10 bg-white px-4 py-1.5 text-[13px] font-medium text-navy/70">
          Last updated {lastUpdated}
        </span>
      </Section>

      <Section background="white">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[240px_1fr] lg:gap-14">
            <nav className="hidden lg:block">
              <div className="sticky top-28 rounded-2xl border border-navy/10 bg-white p-5 shadow-[0_1px_3px_rgba(0,48,96,0.05)]">
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-navy/40">
                  On this page
                </p>
                <ul className="mt-3 space-y-1">
                  {sections.map((section) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className="block rounded-lg px-2.5 py-1.5 text-sm text-navy/70 transition-colors hover:bg-mist hover:text-navy"
                      >
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>

            <div className="min-w-0">
              <p className="max-w-2xl text-[15.5px] leading-relaxed text-navy/70">{intro}</p>

              <div className="mt-8 space-y-5">
                {sections.map((section, index) => (
                  <div
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-28 rounded-2xl border border-navy/10 bg-white p-6 shadow-[0_1px_3px_rgba(0,48,96,0.05)] sm:p-8"
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-steel/15 text-sm font-bold text-steel">
                        {index + 1}
                      </span>
                      <h2 className="text-xl font-bold text-navy">{section.title}</h2>
                    </div>
                    <div className="mt-4 space-y-3 pl-[46px] text-[15px] leading-relaxed text-navy/70 [&_a]:font-medium [&_a]:text-steel [&_a:hover]:underline [&_li]:pl-1 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
                      {section.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
