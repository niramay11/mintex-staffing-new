import type { Metadata } from "next";
import Image from "next/image";
import Section from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import ClientStories from "@/components/home/ClientStories";
import Testimonials from "@/components/home/Testimonials";
import { getIndustries } from "@/lib/industries";
import { getSiteImages } from "@/lib/siteImages";
import { getHomepageTestimonials } from "@/lib/caseStudies";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const siteImages = await getSiteImages();
  const homepageTestimonials = await getHomepageTestimonials();
  const industries = await getIndustries();
  return (
    <>
      {/* Sec 1 — Hero */}
      <Section
        background="navy"
        backgroundMedia={
          <>
            <Image src={siteImages["home:hero-banner"]} alt="" fill preload fetchPriority="high" className="object-cover object-center" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,#012340_0%,rgba(1,35,64,0.97)_18%,rgba(1,35,64,0.86)_32%,rgba(1,35,64,0.62)_46%,rgba(1,35,64,0.32)_60%,rgba(1,35,64,0.08)_74%,rgba(1,35,64,0)_86%)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/40 via-transparent to-transparent" />
          </>
        }
      >
        <div className="relative flex min-h-[420px] flex-col justify-center sm:min-h-[500px] lg:min-h-[540px]">
          <div className="flex max-w-3xl flex-col items-start">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-tan-light/35 bg-tan/[0.14] px-4 py-2 text-[13px] font-medium text-tan-light shadow-[0_0_24px_-6px_rgba(191,174,153,0.4)] backdrop-blur-sm [text-shadow:0_1px_3px_rgba(0,0,0,0.45)] sm:backdrop-blur-none sm:[text-shadow:none]">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4 flex-shrink-0">
                <path
                  d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Trusted staffing partner across USA
            </div>
            <h1 className="mt-5 text-[44px] font-semibold leading-[1.08] text-white sm:text-[56px] lg:text-[64px]">
              Staffing and Recruitment solutions across{" "}
              <span className="bg-gradient-to-r from-tan via-tan-light to-tan bg-clip-text text-transparent">
                IT, healthcare, legal and more
              </span>
            </h1>
            <p className="mt-3 max-w-xl text-lg text-steel-lighter sm:text-xl">
              Connecting exceptional talent with leading employers
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3.5">
              <ButtonLink
                href="/seek-talent"
                variant="primary"
                className="gap-2 shadow-[0_14px_36px_-10px_rgba(191,174,153,0.55)] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_44px_-8px_rgba(191,174,153,0.65)]"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4 flex-shrink-0">
                  <path
                    d="M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H4v-2a4 4 0 0 1 3-3.87m5-3.13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 3a4 4 0 0 0-3-3.87"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Hire Talent
              </ButtonLink>
              <ButtonLink
                href="/get-hired"
                variant="outline"
                className="gap-2 transition-all hover:-translate-y-0.5"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4 flex-shrink-0">
                  <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
                  <path
                    d="M5 20c0-3.5 3.13-6 7-6s7 2.5 7 6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
                Get Hired
              </ButtonLink>
            </div>
          </div>
        </div>
      </Section>

      {/* Sec 1.5 — What We Do */}
      <Section background="white" className="!py-16 sm:!py-20">
        <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-steel">
              What we do
            </p>
            <h2 className="mt-3.5 font-heading text-[32px] font-semibold leading-tight text-navy sm:text-[36px]">
              Staffing that starts with a real understanding of your team
            </h2>
            <p className="mt-5 text-[15.5px] leading-[1.85] text-steel">
              Mintex Staffing connects employers with vetted, ready-to-work talent across IT,
              healthcare, engineering, manufacturing, finance, and six more specialized industries.
              We source candidates who match your team&apos;s actual skill and culture needs, and
              screen them for a real delivery track record rather than just a polished resume.
            </p>
            <p className="mt-4 text-[15.5px] leading-[1.85] text-steel">
              We place candidates as contract, contract-to-hire, or permanent hires, whichever
              model fits the work, backed by an active talent network that&apos;s already screened
              long before your search begins. That approach has produced 14,000+ placements to
              date, with a 93% client retention rate.
            </p>
          </div>

          <div className="relative mx-auto aspect-[4/3] w-full max-w-[480px] overflow-hidden rounded-2xl shadow-[0_25px_55px_-20px_rgba(0,48,96,0.35)]">
            <Image
              src={siteImages["home:what-we-do-visual"]}
              alt="Mintex Staffing recruiter discussing a candidate's fit with a client"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </Section>

      {/* Sec 2 — You need to see it to believe it. ClientStories owns its own
          Section-equivalent wrapper and the show/hide decision entirely
          client-side (checked fresh on every load via /api/client-stories),
          since this static homepage's own server-rendered HTML can lag an
          admin toggle by a page load or two (Next's on-demand revalidation
          serves the previous version once before catching up) — not
          acceptable for something that should just reliably work. */}
      <ClientStories />

      {/* Sec 3 — Why Us? */}
      <Section background="white">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-steel">
            Why us
          </p>
          <h2 className="mt-3.5 font-heading text-[36px] font-semibold leading-tight text-navy sm:text-[40px]">
            A decade of staffing expertise, backed by process
          </h2>
          <p className="mt-4 text-lg text-steel">
            Candidates screened for skills and company fit, not based on a resume that looks good
on paper.
          </p>
        </div>

        <div className="mt-11 grid grid-cols-2 gap-5 sm:grid-cols-3">
          <div className="group rounded-2xl border border-navy/[0.08] p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-tan/40 hover:shadow-[0_20px_45px_-24px_rgba(1,35,64,0.3)]">
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-tan/[0.14] text-tan transition-colors duration-300 group-hover:bg-tan group-hover:text-white">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path
                  d="M8 21h8M12 17v4M6 4h12v3a6 6 0 0 1-12 0V4Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 5H4a2 2 0 0 0 2 2M18 5h2a2 2 0 0 1-2 2"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <div className="mt-3.5 font-heading text-3xl font-semibold text-navy">14,000+</div>
            <p className="mt-1 text-sm text-steel">Placements made</p>
          </div>
          <div className="group rounded-2xl border border-navy/[0.08] p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-tan/40 hover:shadow-[0_20px_45px_-24px_rgba(1,35,64,0.3)]">
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-tan/[0.14] text-tan transition-colors duration-300 group-hover:bg-tan group-hover:text-white">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path
                  d="M20.8 8.6c0 5-8.8 10.4-8.8 10.4S3.2 13.6 3.2 8.6a4.6 4.6 0 0 1 8.8-1.9A4.6 4.6 0 0 1 20.8 8.6Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div className="mt-3.5 font-heading text-3xl font-semibold text-navy">93%</div>
            <p className="mt-1 text-sm text-steel">Client retention</p>
          </div>
          <div className="group col-span-2 rounded-2xl bg-navy p-6 text-center text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_-24px_rgba(1,35,64,0.5)] sm:col-span-1">
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.12] text-tan-light">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path d="M12 7v5.5l3.5 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </span>
            <div className="mt-3.5 font-heading text-3xl font-semibold">9 days</div>
            <p className="mt-1 text-sm text-steel-lighter">Avg. time to fill</p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          <div className="group rounded-2xl border border-navy/[0.08] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-tan/40 hover:shadow-[0_20px_45px_-24px_rgba(1,35,64,0.3)]">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-tan/[0.14] text-tan transition-colors duration-300 group-hover:bg-tan group-hover:text-white">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path
                  d="m4 13 4 4L20 5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <h3 className="mt-4 font-heading font-semibold text-navy">Proven achievements</h3>
            <p className="mt-2 text-[14.5px] text-steel">
              A track record of fast, durable placements across nine industries.
            </p>
          </div>
          <div className="group rounded-2xl border border-navy/[0.08] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-tan/40 hover:shadow-[0_20px_45px_-24px_rgba(1,35,64,0.3)]">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-tan/[0.14] text-tan transition-colors duration-300 group-hover:bg-tan group-hover:text-white">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path
                  d="M4 20V10M10 20V4M16 20v-7"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <h3 className="mt-4 font-heading font-semibold text-navy">Sector insights</h3>
            <p className="mt-2 text-[14.5px] text-steel">
              Ongoing research on hiring trends, so you&apos;re never staffing blind.
            </p>
          </div>
          <div className="group rounded-2xl border border-navy/[0.08] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-tan/40 hover:shadow-[0_20px_45px_-24px_rgba(1,35,64,0.3)]">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-tan/[0.14] text-tan transition-colors duration-300 group-hover:bg-tan group-hover:text-white">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path
                  d="M6 4h9l3 3v13H6V4Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <path d="M9 10h6M9 14h6M9 18h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
            <h3 className="mt-4 font-heading font-semibold text-navy">Practical guides</h3>
            <p className="mt-2 text-[14.5px] text-steel">
              Calculators, checklists, and interview tools for hiring teams and candidates.
            </p>
          </div>
        </div>
      </Section>

      {/* Sec 3.5 — How We're Different */}
      <Section background="cream">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-steel">
            How we&apos;re different
          </p>
          <h2 className="mt-3.5 font-heading text-[32px] font-semibold leading-tight text-navy sm:text-[36px]">
            Not a resume-forwarding service
          </h2>
        </div>

        <div className="mt-11 grid gap-5 sm:grid-cols-3">
          {[
            {
              title: "Screened Before You Ask",
              text: "Our talent network is pre-vetted for skill and delivery history year-round, not sourced cold once your req opens. That's how we hit a 9-day average time to hire.",
              path: "M9 12l2 2 4-4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
            },
            {
              title: "Flexible By Design",
              text: "Contract, contract-to-hire, or permanent, we match the engagement model to the actual shape of the work, not a one-size-fits-all default.",
              path: "M4 4h16v4H4zM4 10h10v4H4zM4 16h13v4H4z",
            },
            {
              title: "Nine Industries, One Standard",
              text: "From IT to healthcare to logistics, every candidate goes through the same rigorous screening bar, tailored to what that specific industry actually demands.",
              path: "M4 20V10M10 20V4M16 20v-7",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-navy/[0.08] bg-white p-8 shadow-[0_1px_3px_rgba(0,48,96,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-tan/40 hover:shadow-[0_20px_45px_-24px_rgba(1,35,64,0.3)]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-tan/[0.14] text-tan">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                  <path d={item.path} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <h3 className="mt-5 font-heading text-[17px] font-semibold tracking-tight text-navy">{item.title}</h3>
              <span aria-hidden="true" className="mt-3 block h-px w-8 bg-tan/40" />
              <p className="mt-3.5 text-[14.5px] leading-[1.85] text-steel">{item.text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Sec 4 — Industries we served */}
      <Section id="industries" background="cream">
        <Image
          src={siteImages["home:industries-mark"]}
          alt=""
          aria-hidden="true"
          width={784}
          height={395}
          className="pointer-events-none absolute bottom-0 left-1/2 hidden h-[320px] w-auto -translate-x-1/2 select-none object-contain opacity-[0.05] md:block lg:h-[400px]"
        />
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-steel">
            Industries we serve
          </p>
          <h2 className="mt-3 font-heading text-[30px] font-semibold leading-tight text-navy sm:text-[34px]">
            Deep talent pools across all specialized sectors
          </h2>
          <p className="mt-3 text-base text-steel">
            Our expertise lies in specialized sectors — deeper market insights and qualified talent
            pools that match your standards and speed up hiring.
          </p>
        </div>

        <div className="mt-11 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((industry) => {
            const label = industry.name;
            const achievement = industry.stats[0];
            return (
              <a
                key={industry.slug}
                href={`/industries/${industry.slug}`}
                className="group relative rounded-2xl border border-navy/[0.08] bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-tan/40 hover:bg-tan/5 hover:shadow-[0_20px_45px_-20px_rgba(1,35,64,0.3)]"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-tan/[0.16] font-heading text-[15px] font-semibold text-tan transition-colors duration-300 group-hover:bg-tan group-hover:text-white">
                    {label.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="font-heading text-[22px] font-semibold text-navy">
                    {achievement?.value}
                  </div>
                </div>
                <h3 className="text-[15.5px] font-semibold text-navy">{label}</h3>
                <p className="mt-1 text-[12.5px] text-steel">placements made</p>
              </a>
            );
          })}
        </div>
      </Section>

      {/* Sec 5 — Testimonials, sourced from the same case_studies "client"
          entries shown on /case-studies — a homepage teaser row, not a
          separate content source to manage. */}
      <Testimonials stories={homepageTestimonials} />

      {/* Sec — Final CTA */}
      <Section background="mist" className="!bg-transparent !py-14 sm:!py-16 lg:!py-20">
        <div className="relative mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-[0.85fr_1fr] lg:gap-16">
          <div className="relative mx-auto aspect-square w-full max-w-[360px] lg:mx-0 lg:-ml-6">
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-tan/[0.12] blur-[70px]"
            />
            <div
              aria-hidden="true"
              className="absolute bottom-0 right-0 h-[36%] w-[30%] rounded-[2rem] bg-navy/[0.05]"
            />
            <div
              aria-hidden="true"
              className="absolute right-0 top-[8%] h-[80%] w-[80%] rounded-[2.5rem] border-2 border-steel/40"
            />
            <div className="absolute left-0 top-0 h-[80%] w-[80%] overflow-hidden rounded-[2.5rem] shadow-[0_25px_60px_-20px_rgba(1,35,64,0.25)]">
              <Image src={siteImages["home:industries-collage"]} alt="" fill className="object-cover" />
            </div>
          </div>

          <div>
            <h2 className="font-heading text-[38px] font-semibold leading-tight text-navy sm:text-[46px]">
              Let&apos;s build your team, together
            </h2>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-steel">
              Whether you&apos;re hiring or looking to be hired, we&apos;ll get you there faster.
            </p>
            <div className="mt-8 flex flex-wrap gap-3.5">
              <ButtonLink href="/seek-talent" variant="primary">
                Hire Talent
              </ButtonLink>
              <ButtonLink
                href="/get-hired"
                variant="outline"
                className="!border-navy !text-navy hover:!bg-navy hover:!text-white"
              >
                Get Hired
              </ButtonLink>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
