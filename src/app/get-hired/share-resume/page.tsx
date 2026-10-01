import type { ReactNode } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Section from "@/components/ui/Section";
import ResumeForm from "@/components/forms/ResumeForm";
import { getSiteImages } from "@/lib/siteImages";
import { getIndustries } from "@/lib/industries";
import { pageMetadata } from "@/lib/pageMetadata";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbSchema";

export const metadata: Metadata = pageMetadata({
  title: "Share Your Resume",
  description:
    "Share your resume with Mintex Staffing and stay visible to our recruiters, so you're considered first for new roles across every industry we serve.",
  path: "/get-hired/share-resume",
});

function IconRadar({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" />
    </svg>
  );
}

function IconLayers({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="m12 3 8.5 4.5L12 12 3.5 7.5 12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="m3.5 12 8.5 4.5L20.5 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m3.5 16.5 8.5 4.5 8.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconLock({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 11V7.5a4 4 0 0 1 8 0V11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 14.5v2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

// Card design copied from the /industries grid (IndustriesExplorer's
// IndustryCard): small label top-left, "Mintex / Your resume" top-right, big
// light title + text at the bottom, outlined arrow pill. Unlike those cards
// this one isn't a single link (the body has its own links), so the pill is
// the link.
const SANS_HEADING = { fontFamily: "var(--font-sans), Arial, Helvetica, sans-serif" } as const;
const CARD_LINK = "font-medium text-steel hover:text-navy dark:text-steel-light dark:hover:text-cream";

function InfoCard({
  index,
  label,
  title,
  icon: Icon,
  href,
  linkLabel,
  children,
}: {
  index: number;
  label: string;
  title: string;
  icon: (props: { className?: string }) => ReactNode;
  href: string;
  linkLabel: string;
  children: ReactNode;
}) {
  // Content flows from the top and only the arrow is pinned to the bottom —
  // the cards in a row stretch to the tallest one (the industries list), and
  // bottom-aligning everything left a big empty gap at the top of the others.
  return (
    <div className="group flex min-w-0 flex-col rounded-[28px] bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-28px_rgba(0,48,96,0.35)] sm:p-8 dark:bg-navy-800">
      <div className="flex items-start justify-between gap-4 text-[11px] uppercase tracking-[0.12em]">
        <span className="min-w-0 font-medium leading-snug text-navy/45 dark:text-cream/45">
          {String(index + 1).padStart(2, "0")} · {label}
        </span>
        <span className="flex-shrink-0 text-right sm:whitespace-nowrap">
          <span className="block font-bold text-navy dark:text-cream">Mintex</span>
          <span className="mt-1 block font-semibold text-steel dark:text-steel-light">Your resume</span>
        </span>
      </div>

      <span className="mt-8 flex h-12 w-12 items-center justify-center rounded-full bg-steel/15 text-steel transition-colors duration-300 group-hover:bg-navy group-hover:text-white dark:text-steel-light dark:group-hover:bg-steel dark:group-hover:text-navy-950">
        <Icon className="h-5 w-5" />
      </span>

      <h3 style={SANS_HEADING} className="mt-6 break-words text-[26px] font-normal leading-[1.15] tracking-[-0.025em] text-navy sm:text-[28px] dark:text-cream">
        {title}
      </h3>
      <p className="mt-4 text-[14px] leading-relaxed text-navy/70 dark:text-cream/70">{children}</p>

      <div className="mt-auto pt-7">
        <Link
          href={href}
          aria-label={linkLabel}
          className="inline-flex h-9 w-14 items-center justify-center rounded-full border border-navy/80 text-navy transition-all duration-300 group-hover:w-[72px] group-hover:bg-navy group-hover:text-white dark:border-cream/60 dark:text-cream dark:group-hover:bg-cream dark:group-hover:text-navy-950"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

function IconInbox({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 13.5 6.5 5h11L20 13.5v4a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5v-4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M4 13.5h5l1 2h4l1-2h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconClock({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.5V12l3.2 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const benefits = [
  {
    title: "Always in the running",
    description:
      "Your profile stays on file, so you're one of the first candidates we consider when a matching role opens.",
    icon: IconRadar,
  },
  {
    title: "One profile, every opportunity",
    description:
      "Our recruiters can match you across every industry we staff, not just a single job posting.",
    icon: IconLayers,
  },
  {
    title: "Confidential and secure",
    description:
      "Your information is only ever shared with your consent, once we've found a strong potential fit.",
    icon: IconLock,
  },
];

export default async function ShareResumePage() {
  const siteImages = await getSiteImages();
  const industries = await getIndustries();
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Get Hired", path: "/get-hired" },
    { name: "Share Your Resume", path: "/get-hired/share-resume" },
  ]);
  return (
    <>
      <script
        id="share-resume-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Section background="mist" className="relative !py-12 sm:!py-14 lg:!py-16">
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div>
            <div className="inline-flex items-center gap-2.5 rounded-full border border-navy/10 bg-white px-4 py-2 text-[14.5px] font-medium text-navy/70 dark:border-white/10 dark:bg-navy-900 dark:text-cream/70">
              <span className="h-[7px] w-[7px] rounded-full bg-steel shadow-[0_0_0_4px_rgba(74,115,140,0.25)]" />
              For job seekers
            </div>
            <h1 className="mt-5 font-heading text-4xl font-bold text-navy sm:text-5xl dark:text-cream">Share Your Resume</h1>
            <p className="mt-4 max-w-xl text-steel dark:text-steel-light">
              Don&apos;t see the right role yet? Share your resume once and stay visible to our
              recruiters across every industry we staff, we&apos;ll reach out when a match comes
              up.
            </p>
          </div>

          <div className="relative hidden lg:flex lg:items-center lg:justify-center">
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-steel/15 blur-[100px]"
            />
            <div className="relative aspect-[4/5] w-full max-w-[300px] overflow-hidden rounded-[32px] border border-navy/10 shadow-[0_40px_90px_-25px_rgba(0,48,96,0.3)] dark:border-white/10">
              <Image src={siteImages["share-resume:hero-visual"]} alt="Candidate preparing their resume to share with Mintex Staffing's recruitment team" fill sizes="(min-width: 640px) 300px, 100vw" className="object-cover" />
            </div>
          </div>
        </div>
      </Section>

      <Section background="white">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          <div>
            <p className="text-[14.5px] font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">Why share it</p>
            <h2 className="mt-2.5 font-heading text-2xl font-bold text-navy sm:text-3xl dark:text-cream">What happens next</h2>
            <div className="mt-7 space-y-4">
              {benefits.map(({ title, description, icon: Icon }) => (
                <div
                  key={title}
                  className="group flex gap-4 rounded-2xl border border-navy/[0.08] bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-steel/40 hover:shadow-[0_20px_45px_-20px_rgba(0,48,96,0.3)] dark:border-white/10 dark:bg-navy-800"
                >
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-steel/15 text-steel transition-colors duration-300 group-hover:bg-steel group-hover:text-white dark:text-steel-light">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-navy dark:text-cream">{title}</h3>
                    <p className="mt-1 text-sm text-navy/70 dark:text-cream/70">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-7 shadow-[0_1px_3px_rgba(0,48,96,0.05)] sm:p-10 dark:bg-navy-800">
            <h2 className="text-2xl font-bold text-navy dark:text-cream">Submit your resume</h2>
            <div className="mt-2 h-1 w-12 rounded-full bg-steel" />
            <p className="mt-3 text-sm text-navy/70 dark:text-cream/70">
              Takes less than two minutes &mdash; we&apos;ll take it from there.
            </p>
            <div className="mt-6">
              <ResumeForm />
            </div>
          </div>
        </div>
      </Section>

      <Section background="cream">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[14.5px] font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">Good to know</p>
          <h2 className="mt-2.5 font-heading text-3xl font-bold text-navy sm:text-4xl dark:text-cream">What to expect after you submit</h2>
          <p className="mt-3 text-steel dark:text-steel-light">
            No surprises, here&apos;s exactly what happens to your resume once it&apos;s in our hands.
          </p>
        </div>

        {/* Same card design as the /industries grid (IndustriesExplorer). */}
        <div className="mt-11 grid gap-2.5 md:grid-cols-2 2xl:grid-cols-4">
          <InfoCard
            index={0}
            label="After you submit"
            icon={IconInbox}
            title="What happens to your resume"
            href="/get-hired"
            linkLabel="Browse open roles"
          >
            Your resume and contact details go straight into our candidate database, and our team
            is notified right away, with a confirmation email sent to you so you know it went
            through. From there, a recruiter reviews your background and adds you to the pool we
            search whenever a matching role opens, today or next month.
          </InfoCard>

          <InfoCard
            index={1}
            label="On file"
            icon={IconClock}
            title="How long we keep it on file"
            href="/contact"
            linkLabel="Contact us about your resume"
          >
            We don&apos;t put an expiration date on it. Your resume stays on file indefinitely, so
            you&apos;re considered for new openings as they come up, not just whatever was available
            the week you applied. Prefer we remove it?{" "}
            <a href="/contact" className={CARD_LINK}>Contact us</a> and we will, per our{" "}
            <a href="/privacy" className={CARD_LINK}>Privacy Policy</a>.
          </InfoCard>

          <InfoCard
            index={2}
            label="Roles"
            icon={IconLayers}
            title="Which roles you're considered for"
            href="/industries"
            linkLabel="See every industry we staff"
          >
            Sharing your resume this way isn&apos;t tied to one posting, it puts you in front of
            recruiters across every industry we staff, including{" "}
            {industries.map((industry, index) => (
              <span key={industry.slug}>
                <a href={`/industries/${industry.slug}`} className={CARD_LINK}>
                  {industry.name}
                </a>
                {index < industries.length - 2 ? ", " : index === industries.length - 2 ? ", and " : ""}
              </span>
            ))}
            . A preferred industry on the form gets prioritized first, but your profile stays
            visible for any role that fits.
          </InfoCard>

          <InfoCard
            index={3}
            label="Privacy"
            icon={IconLock}
            title="Privacy"
            href="/privacy"
            linkLabel="Read our Privacy Policy"
          >
            Your resume is stored privately and never published or made publicly searchable. Only
            Mintex&apos;s own recruiting team can access it internally, and it&apos;s only ever
            shared with a specific employer once we&apos;ve confirmed a real fit and you&apos;ve
            agreed, we never submit your details without your consent first.
          </InfoCard>
        </div>
      </Section>
    </>
  );
}
