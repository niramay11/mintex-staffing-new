import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Section from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { IconBriefcase, IconPeople } from "@/components/jobs/icons";
import { hiringServices } from "@/content/hiringServices";
import { getSiteImages } from "@/lib/siteImages";
import { pageMetadata } from "@/lib/pageMetadata";
import Testimonials from "@/components/home/Testimonials";
import { getHomepageTestimonials } from "@/lib/caseStudies";

export const metadata: Metadata = pageMetadata({
  title: "Seek Talent",
  description:
    "Hire contract, permanent, or executive talent with Mintex Staffing, built around how your team actually works.",
  path: "/seek-talent",
});

function IconArrowRight({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const seekTalentPoints = [
  "Finding the right talent shouldn’t affect your business. At Mintex Staffing, we know that hiring isn’t one-size-fits-all — the best staffing strategy is one built around your specific hiring objectives, industry, and workforce needs.",
  "We provide tailored solutions across IT staffing, healthcare staffing, engineering staffing, manufacturing staffing, finance staffing, administrative staffing, sales staffing, customer service staffing, legal staffing and logistics staffing. Whether you’re scaling a growing team, filling a hard-to-source technical role, or need reliable talent on a tight timeline, our recruiters bring talent that matches your hiring requirements and fits into your company culture.",
  "From initial staffing consultation to finding the right talent match, we work as an extension of your team, understanding your company culture, role requirements, and growth plans before we ever share a candidate profile. We focus on overall company fit, not just speed — that’s what sets our approach apart.",
  "Let’s build your stronger, more talented workforce. Discuss your hiring needs with our recruiters or explore how our proven process connects you with qualified talent across our specialized industries (IT staffing, healthcare staffing, engineering staffing, manufacturing staffing, finance staffing, administrative staffing, sales staffing, customer service staffing, legal staffing and logistics staffing) — we believe in working efficiently, reliably, and without the guesswork.",
];

export default async function SeekTalentPage() {
  const siteImages = await getSiteImages();
  const testimonials = await getHomepageTestimonials();
  return (
    <>
      <Section background="navy" className="!py-12 sm:!py-14 lg:!py-16">
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
          <div>
            <div className="inline-flex items-center gap-2.5 rounded-full border border-tan-light/35 bg-tan/[0.14] px-4 py-2 text-[13px] font-medium text-tan-light">
              <IconBriefcase className="h-4 w-4 flex-shrink-0" />
              For Employers
            </div>
            <h1 className="mt-5 text-4xl font-bold sm:text-5xl">Seek Talent</h1>
            <p className="mt-4 max-w-xl text-white/80">
              Hire top talent fast with Mintex Staffing&apos;s tailored staffing solutions across
              IT, healthcare, engineering &amp; more. Discuss your hiring needs today.
            </p>
            <div className="mt-7 flex flex-wrap gap-3.5">
              <ButtonLink href="/seek-talent/get-started" variant="primary">
                Discuss your hiring needs
              </ButtonLink>
              <ButtonLink href="/seek-talent/how-we-work" variant="outline">
                See how we work
              </ButtonLink>
            </div>
          </div>

          <div className="relative hidden lg:flex lg:items-center lg:justify-center lg:pl-6">
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-tan/15 blur-[100px]"
            />
            <div className="relative aspect-[4/5] w-full max-w-[280px] overflow-hidden rounded-[32px] border border-white/10 shadow-[0_40px_90px_-25px_rgba(0,48,96,0.6)]">
              <Image
                src={siteImages["seek-talent:hero-visual"]}
                alt="Employer welcoming a new hire placed through Mintex Staffing's staffing and recruitment services"
                fill
                className="object-cover"
              />
            </div>

            <div className="absolute -left-8 -top-8 z-20 flex items-center gap-3 rounded-2xl border border-white/10 bg-white px-4 py-3 shadow-[0_25px_60px_-15px_rgba(0,48,96,0.55)]">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-steel/15 text-steel">
                <IconPeople className="h-5 w-5" />
              </span>
              <div>
                <p className="font-heading text-xl font-bold leading-none text-navy">14k+</p>
                <p className="mt-1 text-xs leading-none text-navy/50">Placements made</p>
              </div>
            </div>

            <div className="absolute -bottom-8 -right-8 z-20 flex items-center gap-3 rounded-2xl border border-white/10 bg-white px-4 py-3 shadow-[0_25px_60px_-15px_rgba(0,48,96,0.55)]">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-steel/15 text-steel">
                <IconBriefcase className="h-5 w-5" />
              </span>
              <div>
                <p className="font-heading text-xl font-bold leading-none text-navy">9 days</p>
                <p className="mt-1 text-xs leading-none text-navy/50">Avg. time to fill</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section background="cream" className="relative">
        <div className="mx-auto grid w-full items-start gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <h2 className="text-4xl font-bold leading-tight text-navy sm:text-5xl">
              How can we help you?
            </h2>
            <div className="mt-5 h-[3px] w-12 bg-steel" />

            <div className="mt-7 space-y-5">
              {seekTalentPoints.map((point, index) => (
                <div key={index} className="flex gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-navy text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <p className="text-base leading-relaxed text-navy/70">{point}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl py-8">
            <div
              aria-hidden="true"
              className="absolute -left-10 -top-10 h-60 w-60 rounded-full bg-tan/25 blur-[90px]"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-10 -right-8 h-60 w-60 rounded-full bg-steel/25 blur-[90px]"
            />
            <div
              aria-hidden="true"
              className="absolute -right-4 -top-4 h-full w-full rounded-[2.5rem] border-2 border-tan/30"
            />

            <div className="relative aspect-[5/4] overflow-hidden rounded-[2.5rem] shadow-[0_35px_80px_-25px_rgba(0,48,96,0.45)]">
              <Image
                src={siteImages["seek-talent:cta-visual"]}
                alt="Employer team collaborating around a table with Mintex Staffing's hiring consultants"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/40 via-navy/0 to-navy/0" />
            </div>
          </div>
        </div>

        <div className="relative z-20 mt-14 grid gap-6 lg:grid-cols-3">
          {hiringServices.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={service.slug}
                id={service.slug}
                className="group flex scroll-mt-24 flex-col justify-between rounded-[20px] border border-navy/[0.06] bg-white p-9 shadow-[0_15px_35px_-10px_rgba(0,48,96,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_25px_50px_-15px_rgba(0,48,96,0.15)]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-steel/15 text-steel">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="font-heading text-4xl font-extrabold text-navy/10">
                      0{index + 1}
                    </span>
                  </div>
                  <div className="mt-9 h-[3px] w-6 bg-steel" />
                  <h3 className="mt-4 text-2xl font-bold tracking-tight text-navy">{service.name}</h3>
                  <p className="mt-3 text-navy/60">{service.tagline}</p>
                </div>
                <Link
                  href={`/seek-talent/${service.slug}`}
                  className="mt-9 inline-flex w-fit items-center gap-3 rounded-[10px] bg-steel/10 px-7 py-3.5 text-sm font-bold text-navy transition-colors duration-200 group-hover:bg-steel group-hover:text-white"
                >
                  Explore Service
                  <IconArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
            );
          })}
        </div>
      </Section>

      <Testimonials stories={testimonials} />

      <Section background="white" className="!py-10 sm:!py-12">
        <Link
          href="/seek-talent/how-we-work"
          className="group mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 rounded-2xl border border-navy/10 bg-mist p-7 transition-all duration-300 hover:-translate-y-0.5 hover:border-tan/40 hover:shadow-[0_20px_45px_-20px_rgba(0,48,96,0.3)] sm:flex-row sm:items-center sm:p-8"
        >
          <div>
            <h3 className="text-lg font-semibold text-navy">How We Work</h3>
            <p className="mt-1 text-sm text-navy/70">
              See our scoping-to-support process, and sign in to the client portal if
              you&apos;re already a client.
            </p>
          </div>
          <span className="inline-flex flex-shrink-0 items-center gap-2 rounded-full border border-navy/15 bg-white px-6 py-2.5 text-sm font-semibold text-navy transition-colors group-hover:bg-navy group-hover:text-white">
            See how we work
            <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      </Section>
    </>
  );
}
