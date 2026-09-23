import type { Metadata } from "next";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import ClientStories from "@/components/home/ClientStories";
import Testimonials from "@/components/home/Testimonials";
import IndustriesCarousel from "@/components/home/IndustriesCarousel";
import HeroPhotoCollage from "@/components/home/HeroPhotoCollage";
import { getIndustries } from "@/lib/industries";
import { getSiteImages } from "@/lib/siteImages";
import { industryCardImageKey, INDUSTRY_CARD_FALLBACK_IMAGES } from "@/lib/imageLocations";
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
      {/* Sec 1 — Hero. min-h fills the viewport minus the sticky header's
          own flow height (~6rem incl. its top-4 gap), so the hero is the
          only thing on screen at load — the next section isn't visible
          until the user actually scrolls, on any device. */}
      <section className="relative flex min-h-[calc(100vh-6rem)] flex-col justify-center bg-[#f9f6f1] dark:bg-navy-900">
        {/* Fills the strip behind the floating header with the section's own
            background, so the page's plain bg-cream doesn't show through
            above the header — matches the hero image's own bleed-to-top
            treatment further down, just for the side with no image to do it. */}
        <div aria-hidden="true" className="absolute inset-x-0 -top-[62px] hidden h-[62px] bg-[#f9f6f1] lg:block dark:bg-navy-900" />
        <div className="grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-stretch xl:grid-cols-[minmax(0,0.96fr)_minmax(0,1.04fr)]">
          <div className="flex flex-col justify-center px-6 py-16 sm:px-10 sm:py-20 lg:px-14 lg:py-24 xl:px-16 2xl:px-20">
            <div className="flex max-w-xl flex-col items-start lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl">
              <h1 className="font-heading text-[38px] font-bold leading-[1.12] text-navy sm:text-[46px] lg:text-[50px] xl:text-[58px] 2xl:text-[66px] dark:text-cream">
                Staffing and Recruitment solutions across{" "}
                <span className="relative inline-block text-steel dark:text-steel-light">
                  IT, healthcare, legal and more
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 320 14"
                    preserveAspectRatio="none"
                    className="absolute -bottom-1.5 left-0 h-3 w-full text-steel dark:text-steel-light"
                  >
                    <path
                      d="M2 9c40-8 80-8 120 0s80 8 120 0 60-6 76-2"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-[20px] text-steel sm:text-xl lg:text-[22px] xl:mt-6 xl:max-w-2xl xl:text-[26px] dark:text-steel-light">
                Connecting exceptional talent with leading employers
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3.5 xl:mt-10 xl:gap-5">
                <ButtonLink
                  href="/seek-talent"
                  variant="primary"
                  className="!border-navy !bg-navy !text-white shadow-[0_14px_36px_-10px_rgba(0,48,96,0.35)] transition-all hover:-translate-y-0.5 hover:!bg-navy-secondary hover:shadow-[0_18px_44px_-8px_rgba(0,48,96,0.45)] xl:!px-9 xl:!py-4.5 xl:!text-lg dark:!bg-steel dark:!border-steel dark:!text-navy-950 dark:hover:!bg-steel-light"
                >
                  Hire Talent
                </ButtonLink>
                <ButtonLink
                  href="/get-hired"
                  variant="outline"
                  className="!border-navy !text-navy transition-all hover:-translate-y-0.5 hover:!bg-navy hover:!text-white xl:!px-9 xl:!py-4.5 xl:!text-lg dark:!border-white/15 dark:!text-cream"
                >
                  Get Hired
                </ButtonLink>
              </div>
            </div>
          </div>

          {/* Hidden below lg — this collage only earns its place once the
              grid actually has room to run it beside the text; stacked below
              the heading on narrower screens it was just dead scroll length. */}
          <div className="hidden lg:mx-0 lg:mb-0 lg:flex lg:min-h-[560px] lg:items-center lg:justify-end lg:pr-8 xl:min-h-[680px] xl:pr-16 2xl:min-h-[760px]">
            <HeroPhotoCollage
              photo1Src={siteImages["home:hero-photo-1"]}
              photo2Src={siteImages["home:hero-banner"]}
            />
          </div>
        </div>
      </section>

      {/* Sec 1.5 — What We Do */}
      <section className="border-t border-navy/[0.06] bg-[#f9f6f1] dark:bg-navy-900 dark:border-white/10">
        <div className="mx-auto max-w-[1920px] px-6 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              <p className="text-[14.5px] font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">
                What we do
              </p>
              <h2 className="mt-3.5 font-heading text-[32px] font-bold leading-tight text-navy sm:text-[36px] dark:text-cream">
                Staffing that starts with a real understanding of your team
              </h2>
              <p className="mt-5 text-[18px] leading-[1.85] text-steel dark:text-steel-light">
                Mintex Staffing connects employers with vetted, ready-to-work talent across IT,
                healthcare, engineering, manufacturing, finance, and six more specialized industries.
                We source candidates who match your team&apos;s actual skill and culture needs, and
                screen them for a real delivery track record rather than just a polished resume.
              </p>
              <p className="mt-4 text-[18px] leading-[1.85] text-steel dark:text-steel-light">
                We place candidates as contract, contract-to-hire, or permanent hires, whichever
                model fits the work, backed by an active talent network that&apos;s already screened
                long before your search begins. That approach has produced 14,000+ placements to
                date, with a 93% client retention rate.
              </p>
            </div>

            <div className="relative mx-auto flex w-full max-w-[480px] items-center justify-center">
              <div
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 h-[85%] w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-steel/15 blur-[90px]"
              />
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-[0_25px_55px_-20px_rgba(0,48,96,0.35)]">
                <Image
                  src={siteImages["home:what-we-do-visual"]}
                  alt="Mintex Staffing recruiter discussing a candidate's fit with a client"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sec 2 — You need to see it to believe it. ClientStories owns its own
          flat section wrapper and the show/hide decision entirely
          client-side (checked fresh on every load via /api/client-stories),
          since this static homepage's own server-rendered HTML can lag an
          admin toggle by a page load or two (Next's on-demand revalidation
          serves the previous version once before catching up) — not
          acceptable for something that should just reliably work. */}
      <ClientStories />

      {/* Sec 3 — Why Us? */}
      <section className="border-t border-navy/[0.06] bg-[#f9f6f1] dark:bg-navy-900 dark:border-white/10">
        <div className="mx-auto max-w-[1920px] px-6 py-20 sm:px-10 lg:px-16 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[14.5px] font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">
              Why us
            </p>
            <h2 className="mt-3.5 font-heading text-[36px] font-bold leading-tight text-navy sm:text-[40px] dark:text-cream">
              A decade of staffing expertise, backed by process
            </h2>
            <p className="mt-4 text-[20px] text-steel dark:text-steel-light">
              Candidates screened for skills and company fit, not based on a resume that looks good
on paper.
            </p>
          </div>

          <div className="mt-11 grid grid-cols-2 gap-5 sm:grid-cols-3">
            <div className="group rounded-2xl border-2 border-navy/15 p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-steel/40 hover:shadow-[0_20px_45px_-24px_rgba(1,35,64,0.3)] dark:border-white/15">
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-steel/[0.14] text-steel transition-colors duration-300 group-hover:bg-steel group-hover:text-white dark:text-steel-light">
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
              <div className="mt-3.5 font-heading text-3xl font-semibold text-navy dark:text-cream">14,000+</div>
              <p className="mt-1 text-sm text-steel dark:text-steel-light">Placements made</p>
            </div>
            <div className="group rounded-2xl border-2 border-navy/15 p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-steel/40 hover:shadow-[0_20px_45px_-24px_rgba(1,35,64,0.3)] dark:border-white/15">
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-steel/[0.14] text-steel transition-colors duration-300 group-hover:bg-steel group-hover:text-white dark:text-steel-light">
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
              <div className="mt-3.5 font-heading text-3xl font-semibold text-navy dark:text-cream">93%</div>
              <p className="mt-1 text-sm text-steel dark:text-steel-light">Client retention</p>
            </div>
            <div className="group col-span-2 rounded-2xl border-2 border-navy/15 p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-steel/40 hover:shadow-[0_20px_45px_-24px_rgba(1,35,64,0.3)] dark:border-white/15 sm:col-span-1">
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-steel/[0.14] text-steel transition-colors duration-300 group-hover:bg-steel group-hover:text-white dark:text-steel-light">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                  <path d="M12 7v5.5l3.5 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </span>
              <div className="mt-3.5 font-heading text-3xl font-semibold text-navy dark:text-cream">9 days</div>
              <p className="mt-1 text-sm text-steel dark:text-steel-light">Avg. time to fill</p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            <div className="group rounded-2xl border-2 border-navy/15 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-steel/40 hover:shadow-[0_20px_45px_-24px_rgba(1,35,64,0.3)] dark:border-white/15">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-steel/[0.14] text-steel transition-colors duration-300 group-hover:bg-steel group-hover:text-white dark:text-steel-light">
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
              <h3 className="mt-4 font-heading font-semibold text-navy dark:text-cream">Proven achievements</h3>
              <p className="mt-2 text-[16px] text-steel dark:text-steel-light">
                A track record of fast, durable placements across nine industries.
              </p>
            </div>
            <div className="group rounded-2xl border-2 border-navy/15 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-steel/40 hover:shadow-[0_20px_45px_-24px_rgba(1,35,64,0.3)] dark:border-white/15">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-steel/[0.14] text-steel transition-colors duration-300 group-hover:bg-steel group-hover:text-white dark:text-steel-light">
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
              <h3 className="mt-4 font-heading font-semibold text-navy dark:text-cream">Sector insights</h3>
              <p className="mt-2 text-[16px] text-steel dark:text-steel-light">
                Ongoing research on hiring trends, so you&apos;re never staffing blind.
              </p>
            </div>
            <div className="group rounded-2xl border-2 border-navy/15 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-steel/40 hover:shadow-[0_20px_45px_-24px_rgba(1,35,64,0.3)] dark:border-white/15">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-steel/[0.14] text-steel transition-colors duration-300 group-hover:bg-steel group-hover:text-white dark:text-steel-light">
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
              <h3 className="mt-4 font-heading font-semibold text-navy dark:text-cream">Practical guides</h3>
              <p className="mt-2 text-[16px] text-steel dark:text-steel-light">
                Calculators, checklists, and interview tools for hiring teams and candidates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sec 3.5 — How We're Different */}
      <section className="border-t border-navy/[0.06] bg-[#f9f6f1] dark:bg-navy-900 dark:border-white/10">
        <div className="mx-auto max-w-[1920px] px-6 py-20 sm:px-10 lg:px-16 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[14.5px] font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">
              How we&apos;re different
            </p>
            <h2 className="mt-3.5 font-heading text-[32px] font-bold leading-tight text-navy sm:text-[36px] dark:text-cream">
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
                title: "9+ Industries, One Standard",
                text: "From IT to healthcare to logistics, every candidate goes through the same rigorous screening bar, tailored to what that specific industry actually demands.",
                path: "M4 20V10M10 20V4M16 20v-7",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-navy/[0.08] bg-white p-8 shadow-[0_1px_3px_rgba(0,48,96,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-steel/40 hover:shadow-[0_20px_45px_-24px_rgba(1,35,64,0.3)] dark:bg-navy-800 dark:border-white/10"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-steel/[0.14] text-steel dark:text-steel-light">
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <path d={item.path} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <h3 className="mt-5 font-heading text-[18.5px] font-semibold tracking-tight text-navy dark:text-cream">{item.title}</h3>
                <span aria-hidden="true" className="mt-3 block h-px w-8 bg-steel/40" />
                <p className="mt-3.5 text-[16px] leading-[1.85] text-steel dark:text-steel-light">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sec 4 — Industries we served */}
      <section id="industries" className="group relative overflow-hidden border-t border-navy/[0.06] bg-[#f9f6f1] dark:bg-navy-900 dark:border-white/10">
        {/* Big, centered behind the whole section, including the card row —
            mostly hidden behind the opaque cards at rest. `group` on the
            section means hovering any card (a descendant) still counts as
            hovering the section, so the mark brightens/grows right when the
            user is interacting with a card, instead of needing to see
            through the card itself (which the photo fills anyway). */}
        <span className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[320px] w-auto -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-out md:block lg:h-[400px] group-hover:scale-[1.06]">
          <Image
            src={siteImages["home:industries-mark"]}
            alt=""
            aria-hidden="true"
            width={784}
            height={395}
            className="h-full w-auto select-none object-contain opacity-[0.14] transition-opacity duration-500 group-hover:opacity-[0.26] dark:hidden"
          />
          <Image
            src={siteImages["global:navy-section-mark"]}
            alt=""
            aria-hidden="true"
            width={784}
            height={395}
            className="hidden h-full w-auto select-none object-contain opacity-70 transition-opacity duration-500 group-hover:opacity-100 dark:block"
          />
        </span>
        <div className="relative mx-auto max-w-[1920px] px-6 py-20 sm:px-10 lg:px-16 lg:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[14.5px] font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">
              Industries we serve
            </p>
            <h2 className="mt-3 font-heading text-[30px] font-bold leading-tight text-navy sm:text-[34px] dark:text-cream">
              Deep talent pools across all specialized sectors
            </h2>
            <p className="mt-3 text-[18px] text-steel dark:text-steel-light">
              Our expertise lies in specialized sectors — deeper market insights and qualified talent
              pools that match your standards and speed up hiring.
            </p>
          </div>

          <IndustriesCarousel
            items={industries.map((industry, index) => ({
              industry,
              imageSrc:
                siteImages[industryCardImageKey(industry.slug)] ??
                INDUSTRY_CARD_FALLBACK_IMAGES[index % INDUSTRY_CARD_FALLBACK_IMAGES.length],
            }))}
          />
        </div>
      </section>

      {/* Sec 5 — Testimonials, sourced from the same case_studies "client"
          entries shown on /case-studies — a homepage teaser row, not a
          separate content source to manage. */}
      <Testimonials stories={homepageTestimonials} backgroundClassName="bg-[#f9f6f1]" edgeFadeFromClassName="from-[#f9f6f1]" />

      {/* Sec — Final CTA */}
      <section className="border-t border-navy/[0.06] bg-[#f9f6f1] dark:bg-navy-900 dark:border-white/10">
        <div className="relative mx-auto grid max-w-5xl items-center gap-12 px-6 py-14 sm:px-10 sm:py-16 lg:grid-cols-[0.85fr_1fr] lg:gap-16 lg:px-16 lg:py-20">
          <div className="relative mx-auto aspect-square w-full max-w-[360px] lg:mx-0 lg:-ml-6">
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-steel/[0.12] blur-[70px]"
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
              <Image
                src={siteImages["home:industries-collage"]}
                alt="Mintex Staffing recruiters collaborating with clients across industries"
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div>
            <h2 className="font-heading text-[38px] font-bold leading-tight text-navy sm:text-[46px] dark:text-cream">
              Let&apos;s build your team, together
            </h2>
            <p className="mt-4 max-w-md text-[20px] leading-relaxed text-steel dark:text-steel-light">
              Whether you&apos;re hiring or looking to be hired, we&apos;ll get you there faster.
            </p>
            <div className="mt-8 flex flex-wrap gap-3.5">
              <ButtonLink href="/seek-talent" variant="primary">
                Hire Talent
              </ButtonLink>
              <ButtonLink
                href="/get-hired"
                variant="outline"
                className="!border-navy !text-navy hover:!bg-navy hover:!text-white dark:!border-white/15 dark:!text-cream"
              >
                Get Hired
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
