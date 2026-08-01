import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { getSiteImages } from "@/lib/siteImages";
import { pageMetadata } from "@/lib/pageMetadata";
import { BUSINESS } from "@/lib/site";
import { getTeamMembers } from "@/lib/teamMembers";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function IconLinkedIn({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center rounded bg-[#0A66C2] text-white ${className}`}>
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-[65%] w-[65%]">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    </span>
  );
}

export const metadata: Metadata = pageMetadata({
  title: "About Us",
  description:
    "We connect exceptional talent with leading employers and build lasting partnerships across the United States.",
  path: "/about",
});

function IconShield({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconBolt({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M13 3 4 14h6l-1 7 9-11h-6l1-7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function IconPartnership({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="9" cy="12" r="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="15" cy="12" r="5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function IconTarget({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="0.9" fill="currentColor" />
    </svg>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M20 7 9 18l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const highlights = [
  { value: "14K+", label: "Placements" },
  { value: "93%", label: "Client Retention" },
  { value: "9+", label: "Industries" },
  { value: "9 Days", label: "Avg. Time to Hire" },
];

const storyPoints = [
  {
    title: "IT Sector Roots",
    description:
      "We began our journey in the IT sector, successfully navigating diverse hiring models (C2C, W2, 1099, and full-time placements). Our resilience and dedication allowed us to continue making successful placements even through the challenges of the pandemic.",
  },
  {
    title: "Evolving With the Market",
    description:
      "Today, we have expanded our expertise to include non-IT fields. While we continue to support tech-driven organizations, we now specialize in building teams for startups and placing key founding and leadership roles. Currently, our most prominent presence is within the Legal and Hospitality sectors.",
  },
];

const approachPoints = [
  {
    title: "Integrity-Driven",
    description: "We build lasting, meaningful connections rather than quick fixes.",
  },
  {
    title: "Highly Adaptable",
    description: "We pivot with the changing landscape of your industry to find exactly what you need.",
  },
];

const values = [
  {
    icon: IconShield,
    title: "Integrity",
    description: "We do the right thing. Always transparent and reliable.",
  },
  {
    icon: IconBolt,
    title: "Speed",
    description: "We move fast to deliver the right talent when you need them.",
  },
  {
    icon: IconPartnership,
    title: "Partnership",
    description: "Your success is our priority. We work as your partner.",
  },
  {
    icon: IconTarget,
    title: "Quality",
    description: "We focus on quality candidates and the right fit for your team.",
  },
];

export default async function AboutPage() {
  const siteImages = await getSiteImages();
  const teamMembers = await getTeamMembers();

  return (
    <>
      {/* Hero — flat, edge-to-edge */}
      <section className="bg-mist">
        <div className="grid lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-stretch">
          <div className="flex flex-col justify-center px-6 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24 xl:px-24">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-navy/60">
              <Link href="/" className="font-medium text-navy transition-colors hover:text-tan">
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <span>About Us</span>
            </nav>
            <h1 className="mt-5 font-heading text-[44px] font-bold leading-[1.05] text-navy sm:text-[56px] lg:text-[64px]">
              About Us
            </h1>
            <span aria-hidden="true" className="mt-4 block h-1.5 w-20 rounded-full bg-tan" />
            <p className="mt-5 max-w-md text-lg leading-relaxed text-steel">
              Mintex Staffing is a professional recruitment firm dedicated to connecting the
              right talent with the right opportunities. Since our founding, we have built our
              reputation on trust, precision, and a genuine commitment to the success of both
              our clients and candidates.
            </p>
            <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-steel">
              <span>{BUSINESS.streetAddress}, {BUSINESS.addressLocality}, {BUSINESS.addressRegion} {BUSINESS.postalCode}</span>
              <span aria-hidden="true">&middot;</span>
              <a href={`tel:${BUSINESS.telephone}`} className="font-medium text-navy hover:text-tan">{BUSINESS.telephoneDisplay}</a>
            </p>
          </div>

          <div className="relative mx-6 mb-2 aspect-[4/3] overflow-hidden rounded-2xl shadow-[0_20px_45px_-20px_rgba(0,48,96,0.25)] sm:mx-10 sm:aspect-[16/10] lg:mx-0 lg:mb-0 lg:aspect-auto lg:min-h-[480px] lg:overflow-visible lg:rounded-none lg:shadow-none xl:min-h-[560px]">
            <Image
              src={siteImages["about:hero-visual"]}
              alt="Mintex Staffing office, home to our staffing and recruitment services team"
              fill
              preload
              quality={95}
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-cover lg:[mask-image:linear-gradient(to_right,transparent_0%,black_22%)] lg:[-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_22%)]"
              style={{
                objectPosition: "85% 42%",
              }}
            />
          </div>
        </div>
      </section>

      {/* Highlights strip */}
      <section className="border-y border-navy/[0.06] bg-white">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-3 px-6 py-7 sm:px-10 sm:gap-4 lg:px-16">
          {highlights.map((item) => (
            <span
              key={item.label}
              className="inline-flex items-center gap-2 rounded-full border border-navy/10 bg-mist px-4 py-2 text-[13.5px] text-navy/70"
            >
              <span className="font-heading font-semibold text-navy">{item.value}</span>
              {item.label}
            </span>
          ))}
        </div>
      </section>

      {/* Our Story */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 lg:px-16 lg:py-24">
          <div className="grid items-center gap-14 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-tan">
                Our Story
              </p>
              <h2 className="mt-2.5 font-heading text-3xl font-bold leading-tight text-navy sm:text-4xl">
                Built on People. Driven by Purpose.
              </h2>
              <ul className="mt-6 space-y-4">
                {storyPoints.map((point) => (
                  <li key={point.title} className="flex gap-3">
                    <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-tan/15 text-tan">
                      <IconCheck className="h-3.5 w-3.5" />
                    </span>
                    <p className="text-[15.5px] leading-relaxed text-steel">
                      <span className="font-semibold text-navy">{point.title}:</span>{" "}
                      {point.description}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <ButtonLink
                  href="/contact"
                  variant="primary"
                  className="!bg-navy !text-white hover:!bg-navy-deep"
                >
                  Learn More About Us
                </ButtonLink>
              </div>
            </div>

            <div className="relative mx-auto aspect-[4/3] w-full max-w-[480px] overflow-hidden rounded-2xl shadow-[0_25px_55px_-20px_rgba(0,48,96,0.35)]">
              <Image
                src={siteImages["about:story-visual"]}
                alt="Mintex Staffing recruiter greeting a candidate during a staffing and recruitment consultation"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* The Mintex Approach */}
      <section className="border-t border-navy/[0.06] bg-mist">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 lg:px-16 lg:py-24">
          <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1fr] lg:gap-16">
            <div className="relative mx-auto aspect-[4/3] w-full max-w-[480px] overflow-hidden rounded-2xl shadow-[0_25px_55px_-20px_rgba(0,48,96,0.35)] lg:order-1">
              <Image
                src={siteImages["about:approach-visual"]}
                alt="Mintex Staffing team discussing a tailored hiring strategy with a client"
                fill
                className="object-cover"
              />
            </div>

            <div className="lg:order-2">
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-tan">
                Our Approach
              </p>
              <h2 className="mt-2.5 font-heading text-3xl font-bold leading-tight text-navy sm:text-4xl">
                The Mintex Approach
              </h2>
              <p className="mt-5 text-[15.5px] leading-relaxed text-steel">
                We believe in quality over quantity. Rather than trying to mass-produce
                placements or take over your entire hiring process, we take a focused and
                thoughtful approach.
              </p>
              <ul className="mt-6 space-y-4">
                {approachPoints.map((point) => (
                  <li key={point.title} className="flex gap-3">
                    <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-tan/15 text-tan">
                      <IconCheck className="h-3.5 w-3.5" />
                    </span>
                    <p className="text-[15.5px] leading-relaxed text-steel">
                      <span className="font-semibold text-navy">{point.title}:</span>{" "}
                      {point.description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="border-t border-navy/[0.06] bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 lg:px-16 lg:py-24">
          <div className="flex items-center justify-center gap-4">
            <span aria-hidden="true" className="h-px flex-1 bg-navy/10" />
            <p className="flex-shrink-0 text-[13px] font-semibold uppercase tracking-[0.14em] text-tan">
              Our Values
            </p>
            <span aria-hidden="true" className="h-px flex-1 bg-navy/10" />
          </div>

          <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div key={value.title}>
                <value.icon className="h-8 w-8 text-navy" />
                <h3 className="mt-4 font-heading text-lg font-semibold text-navy">{value.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-steel">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      {teamMembers.length > 0 && (
        <section className="border-t border-navy/[0.06] bg-mist">
          <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10 lg:px-16 lg:py-24">
            <div className="flex items-center justify-center gap-4">
              <span aria-hidden="true" className="h-px flex-1 bg-navy/10" />
              <p className="flex-shrink-0 text-[13px] font-semibold uppercase tracking-[0.14em] text-tan">
                Leadership
              </p>
              <span aria-hidden="true" className="h-px flex-1 bg-navy/10" />
            </div>

            <div className="mt-12 grid grid-cols-1 items-start gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex h-full flex-col overflow-hidden rounded-2xl border border-navy/[0.08] bg-white shadow-[0_1px_3px_rgba(0,48,96,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_-24px_rgba(1,35,64,0.3)]"
                >
                  <div className="relative aspect-[4/5] w-full bg-navy/10">
                    {member.photo_url ? (
                      <Image
                        src={member.photo_url}
                        alt={member.name}
                        fill
                        quality={95}
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover object-top"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center font-heading text-3xl font-semibold text-navy/40">
                        {initials(member.name)}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-heading text-lg font-semibold text-navy">{member.name}</h3>
                    <p className="text-sm font-medium text-tan">{member.title}</p>

                    {member.bio && (
                      <details className="group mt-3">
                        <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                          <span className="line-clamp-4 text-[13.5px] leading-relaxed text-steel group-open:hidden">
                            {member.bio}
                          </span>
                          <span className="hidden text-[13.5px] leading-relaxed text-steel group-open:inline">
                            {member.bio}
                          </span>
                          <span className="mt-1.5 block text-xs font-semibold text-tan group-open:hidden">
                            Read more
                          </span>
                          <span className="mt-1.5 hidden text-xs font-semibold text-tan group-open:block">
                            Read less
                          </span>
                        </summary>
                      </details>
                    )}

                    {member.linkedin_url && (
                      <div className="mt-auto pt-4">
                        <a
                          href={member.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy hover:text-tan"
                        >
                          LinkedIn
                          <IconLinkedIn className="h-4 w-4" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
