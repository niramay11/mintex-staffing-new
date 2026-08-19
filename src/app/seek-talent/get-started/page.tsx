import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Section from "@/components/ui/Section";
import { IconBriefcase } from "@/components/jobs/icons";
import HiringInquiryForm from "@/components/forms/HiringInquiryForm";
import { getSiteImages } from "@/lib/siteImages";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata: Metadata = pageMetadata({
  title: "Find Skilled Talent, Faster",
  description: "From IT staffing to healthcare staffing to logistics staffing, we connect businesses with the right people, right on time.",
  path: "/seek-talent/get-started",
});

function IconArrowLeft({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M19 12H5m0 0 6-6m-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default async function SeekTalentGetStartedPage() {
  const siteImages = await getSiteImages();
  return (
    <>
      <Section background="mist" className="relative !py-12 sm:!py-14 lg:!py-16">
        <Link
          href="/seek-talent"
          className="flex w-fit items-center gap-1.5 text-sm font-medium text-navy/60 transition-colors hover:text-navy dark:text-cream/60 dark:hover:text-cream"
        >
          <IconArrowLeft className="h-4 w-4" />
          Seek Talent
        </Link>

        <div className="mt-6 flex w-fit items-center gap-2.5 rounded-full border border-navy/10 bg-white px-4 py-2 text-[13px] font-medium text-navy/70 dark:border-white/10 dark:bg-navy-900 dark:text-cream/70">
          <IconBriefcase className="h-4 w-4 flex-shrink-0" />
          For Employers
        </div>
        <h1 className="mt-5 font-heading text-4xl font-bold text-navy sm:text-5xl dark:text-cream">Find Skilled Talent, Faster</h1>
        <p className="mt-4 max-w-2xl text-steel dark:text-steel-light">
          From IT staffing to healthcare staffing to logistics staffing, we connect businesses
          with the right people, right on time.
        </p>
      </Section>

      <Section background="white" className="relative overflow-hidden !py-12 sm:!py-14 lg:!py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-24 h-[360px] w-[360px] rounded-full bg-steel-lighter/40 blur-[110px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-28 -right-16 h-[380px] w-[380px] rounded-full bg-steel/20 blur-[120px]"
        />

        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] border border-navy/[0.06] bg-white p-7 shadow-[0_30px_70px_-25px_rgba(0,48,96,0.25)] sm:p-10 dark:border-white/10 dark:bg-navy-900">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-steel dark:text-steel-light">Get in touch</p>
              <h2 className="mt-2 text-2xl font-bold text-navy sm:text-3xl dark:text-cream">Connect with our experts</h2>
              <p className="mt-1.5 text-sm text-navy/70 dark:text-cream/70">
                Share your hiring goals and our recruiters will design a candidate search
                customized to your business.
              </p>
              <div className="mt-7">
                <HiringInquiryForm />
              </div>
            </div>

            <div className="relative mx-auto hidden w-full max-w-lg lg:block">
              <div
                aria-hidden="true"
                className="absolute -left-5 -top-5 h-full w-full rounded-[1.75rem] border-[3px] border-steel"
              />
              <div className="relative aspect-[5/4] overflow-hidden rounded-[1.5rem] shadow-[0_25px_55px_-20px_rgba(0,48,96,0.35)]">
                <Image
                  src={siteImages["seek-talent:get-started-visual"]}
                  alt="Mintex Staffing recruiter ready to discuss your hiring needs"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
