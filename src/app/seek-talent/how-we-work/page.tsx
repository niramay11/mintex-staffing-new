import type { Metadata } from "next";
import Image from "next/image";
import Section from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { getSiteImages } from "@/lib/siteImages";

export const metadata: Metadata = {
  title: "How We Work",
  description:
    "See how Mintex Staffing scopes, sources, and supports every search, plus how existing clients sign in to the client portal.",
};

function IconSearchTalent({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M20 20l-4.5-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconLayers({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 3 3 8l9 5 9-5-9-5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M3 13l9 5 9-5M3 8l9 5 9-5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

function IconTarget({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="0.9" fill="currentColor" />
    </svg>
  );
}

const steps = [
  {
    number: "1",
    title: "Scope",
    description: "We learn your team, culture, and must-haves before writing a single job spec.",
    icon: IconSearchTalent,
  },
  {
    number: "2",
    title: "Source & Screen",
    description: "We tap our active talent network, then screen for skill and fit.",
    icon: IconLayers,
  },
  {
    number: "3",
    title: "Support",
    description: "We stay involved through offer, onboarding, and beyond.",
    icon: IconTarget,
  },
];

export default async function HowWeWorkPage() {
  const siteImages = await getSiteImages();
  return (
    <>
      <Section background="navy" className="!py-12 sm:!py-14 lg:!py-16">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-tan-light">
          Our process
        </p>
        <h1 className="mt-2.5 text-4xl font-bold sm:text-5xl">How We Work</h1>
        <p className="mt-4 max-w-2xl text-white/80">
          Every engagement starts with a scoping call to understand your team, your timeline,
          and what &ldquo;a great fit&rdquo; actually looks like for you &mdash; then we build a
          shortlist around that, not a generic template.
        </p>
      </Section>

      <Section background="cream">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-14 lg:grid-cols-[0.8fr_1fr] lg:gap-20">
            <div className="relative mx-auto w-full max-w-[440px]">
              <div
                aria-hidden="true"
                className="absolute -inset-4 -z-10 rounded-[36px] border-2 border-tan/25"
              />
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[28px] shadow-[0_25px_55px_-20px_rgba(0,48,96,0.35)]">
                <Image
                  src={siteImages["seek-talent:how-we-work-visual"]}
                  alt="Hiring manager and candidate discussing a role over a laptop"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-tan">
                Step by step
              </p>
              <h2 className="mt-2.5 text-3xl font-bold leading-tight text-navy sm:text-4xl">
                From kickoff to placement
              </h2>

              <div className="relative mt-8">
                <div
                  aria-hidden="true"
                  className="absolute left-[18px] top-9 bottom-9 border-l-2 border-dashed border-navy/20"
                />
                <div className="space-y-6">
                  {steps.map((step) => (
                    <div key={step.number} className="relative flex gap-4">
                      <span className="relative z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
                        {step.number}
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-navy">{step.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-navy/65">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <ButtonLink href="/contact" variant="primary">
                  Discuss your hiring needs
                </ButtonLink>
              </div>
            </div>
          </div>

          <div className="mt-14 flex flex-col items-start justify-between gap-5 rounded-2xl border border-navy/10 bg-white p-7 shadow-[0_15px_35px_-15px_rgba(0,48,96,0.15)] sm:flex-row sm:items-center sm:p-8">
            <div>
              <h3 className="text-lg font-semibold text-navy">Already a client?</h3>
              <p className="mt-1 text-sm text-navy/70">
                Sign in to the client portal to review candidates, track open roles, and manage
                your account.
              </p>
            </div>
            <ButtonLink href="/client-portal" variant="secondary" className="flex-shrink-0">
              Client Login
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  );
}
