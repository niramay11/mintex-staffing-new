import type { Metadata } from "next";
import Image from "next/image";
import Section from "@/components/ui/Section";
import ResumeForm from "@/components/forms/ResumeForm";
import { getSiteImages } from "@/lib/siteImages";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata: Metadata = pageMetadata({
  title: "Share Your Resume",
  description:
    "Share your resume with Mintex Staffing and stay visible to our recruiters across every industry we serve.",
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
  return (
    <>
      <Section background="mist" className="relative !py-12 sm:!py-14 lg:!py-16">
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div>
            <div className="inline-flex items-center gap-2.5 rounded-full border border-navy/10 bg-white px-4 py-2 text-[13px] font-medium text-navy/70 dark:border-white/10 dark:bg-navy-900 dark:text-cream/70">
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
              <Image src={siteImages["share-resume:hero-visual"]} alt="Candidate preparing their resume to share with Mintex Staffing's recruitment team" fill className="object-cover" />
            </div>
          </div>
        </div>
      </Section>

      <Section background="white">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">Why share it</p>
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
    </>
  );
}
