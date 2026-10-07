import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { getSiteImages } from "@/lib/siteImages";
import { pageMetadata } from "@/lib/pageMetadata";
import { BUSINESS, SITE_URL } from "@/lib/site";
import { personSchemaId } from "@/lib/localBusinessSchema";
import { getTeamMembers } from "@/lib/teamMembers";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbSchema";

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

const PAGE_DESCRIPTION =
  "Mintex Staffing has placed talent since 2003 from Edison, NJ: 14,000+ placements, 93% client retention. Meet the leadership team behind the work.";

// Exact title via `absolute` — it already carries the brand, so the layout's
// "| Mintex Staffing" template must not be appended.
export const metadata: Metadata = {
  ...pageMetadata({ title: "About Mintex Staffing", description: PAGE_DESCRIPTION, path: "/about" }),
  title: { absolute: "About Mintex Staffing | Edison, NJ Recruiters Since 2003" },
};

// Clean company URL for schema sameAs — the admin social link carries a
// "/posts/?feedView=all" suffix that isn't a canonical profile URL.
const LINKEDIN_COMPANY_URL = "https://www.linkedin.com/company/mintex-staffing/";

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
  { value: "14,000+", label: "placements" },
  { value: "93%", label: "client retention" },
  { value: "12", label: "industries" },
  { value: "9-day", label: "average time to fill" },
];

const storyPoints = [
  {
    title: "2003: Started in IT.",
    description:
      "Mintex began by placing technology professionals. Early on, the team learned every way an IT contract can be set up: C2C, W-2, 1099 and full-time.",
  },
  {
    title: "Through the pandemic: kept placing.",
    description: "While hiring froze across much of the market, Mintex kept making placements.",
  },
  {
    title: "Today: beyond IT.",
    description:
      "We still support tech teams, but most of our work is now outside IT. Our deepest bench is in legal and hospitality. We also build teams for startups, including founding and leadership hires.",
  },
];

const values = [
  {
    icon: IconShield,
    title: "Integrity",
    description: "We tell clients and candidates the truth, including when a role or a fit isn't right.",
  },
  {
    icon: IconBolt,
    title: "Speed",
    description:
      "An open seat costs money every day. We move fast so you aren't paying for it longer than you have to.",
  },
  {
    icon: IconPartnership,
    title: "Partnership",
    description: "We work as an extension of your hiring team, not a vendor who disappears after the invoice.",
  },
  {
    icon: IconTarget,
    title: "Quality",
    description: "Every candidate we send is someone we'd be comfortable seeing in the role.",
  },
];

export default async function AboutPage() {
  const [siteImages, teamMembers] = await Promise.all([getSiteImages(), getTeamMembers()]);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
  ]);

  // AboutPage about the business (the site-wide EmploymentAgency node, which
  // already carries foundingDate, founder and address), plus one Person per
  // leader — built from the admin-managed team_members rows so edits there
  // flow through.
  const aboutPageSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${SITE_URL}/about#webpage`,
    url: `${SITE_URL}/about`,
    name: "About Mintex Staffing",
    description: PAGE_DESCRIPTION,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: {
      "@id": `${SITE_URL}/#business`,
      sameAs: [LINKEDIN_COMPANY_URL],
    },
    mentions: teamMembers.map((member) => ({
      "@type": "Person",
      "@id": personSchemaId(member.name),
      name: member.name,
      jobTitle: member.title,
      worksFor: { "@id": `${SITE_URL}/#business` },
      ...(member.photo_url ? { image: member.photo_url } : {}),
      ...(member.linkedin_url ? { sameAs: [member.linkedin_url] } : {}),
    })),
  };

  return (
    <>
      <script
        id="about-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        id="about-page-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageSchema) }}
      />
      {/* Hero — flat, edge-to-edge */}
      <section className="bg-page dark:bg-navy-900">
        <div className="grid lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-stretch">
          <div className="flex flex-col justify-center px-6 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24 xl:px-24">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-navy/60 dark:text-cream/60">
              <Link href="/" className="font-medium text-navy transition-colors hover:text-navy-secondary dark:text-cream">
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <span>About Us</span>
            </nav>
            <h1 className="mt-5 font-heading text-[44px] font-bold leading-[1.05] text-navy sm:text-[56px] lg:text-[64px] dark:text-cream">
              About Mintex Staffing
            </h1>
            <span aria-hidden="true" className="mt-4 block h-1.5 w-20 rounded-full bg-steel" />
            <p className="mt-5 max-w-lg text-[19px] leading-relaxed text-steel dark:text-steel-light">
              {`Mintex Staffing has been matching people with jobs since ${BUSINESS.foundingYear}. ${BUSINESS.founder} started it as a small recruiting operation in Edison, New Jersey. More than 14,000 placements later, he still runs it, and he still judges the business by how many clients come back.`}
            </p>
            <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-steel dark:text-steel-light">
              <span>{BUSINESS.streetAddress}, {BUSINESS.addressLocality}, {BUSINESS.addressRegion} {BUSINESS.postalCode}</span>
              <span aria-hidden="true">&middot;</span>
              <a href={`tel:${BUSINESS.telephone}`} className="font-medium text-navy hover:text-navy-secondary dark:text-cream">{BUSINESS.telephoneDisplay}</a>
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
      <section className="border-y border-navy/[0.06] bg-page dark:border-white/10 dark:bg-navy-900">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-3 px-6 py-7 sm:px-10 sm:gap-4 lg:px-16">
          {highlights.map((item) => (
            <span
              key={item.label}
              className="inline-flex items-center gap-2 rounded-full border border-navy/10 bg-mist px-4 py-2 text-[15px] text-navy/70 dark:border-white/10 dark:bg-navy-800 dark:text-cream/70"
            >
              <span className="font-heading font-semibold text-navy dark:text-cream">{item.value}</span>
              {item.label}
            </span>
          ))}
        </div>
      </section>

      {/* Our Story */}
      <section className="bg-page dark:bg-navy-900">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 lg:px-16 lg:py-24">
          <div className="grid items-center gap-14 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
            <div>
              <p className="text-[14.5px] font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">
                Our story
              </p>
              <h2 className="mt-2.5 font-heading text-3xl font-bold leading-tight text-navy sm:text-4xl dark:text-cream">
                From IT recruiting to 12 industries
              </h2>
              {/* Timeline: a vertical rule with a dot per milestone */}
              <ol className="relative mt-8 space-y-7 border-l-2 border-steel/25 pl-7">
                {storyPoints.map((point) => (
                  <li key={point.title} className="relative">
                    <span
                      aria-hidden="true"
                      className="absolute -left-[37px] top-1.5 h-4 w-4 rounded-full border-[3px] border-page bg-steel dark:border-navy-900"
                    />
                    <p className="text-[18px] leading-relaxed text-steel dark:text-steel-light">
                      <strong className="font-semibold text-navy dark:text-cream">{point.title}</strong>{" "}
                      {point.description}
                    </p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="relative mx-auto aspect-[4/3] w-full max-w-[480px] overflow-hidden rounded-2xl shadow-[0_25px_55px_-20px_rgba(0,48,96,0.35)]">
              <Image
                src={siteImages["about:story-visual"]}
                alt="Mintex Staffing recruiter greeting a candidate during a staffing and recruitment consultation"
                fill
                sizes="(min-width: 640px) 480px, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* The Mintex Approach */}
      <section className="border-t border-navy/[0.06] bg-page dark:border-white/10 dark:bg-navy-900">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 lg:px-16 lg:py-24">
          <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1fr] lg:gap-16">
            <div className="relative mx-auto aspect-[4/3] w-full max-w-[480px] overflow-hidden rounded-2xl shadow-[0_25px_55px_-20px_rgba(0,48,96,0.35)] lg:order-1">
              <Image
                src={siteImages["about:approach-visual"]}
                alt="Mintex Staffing team discussing a tailored hiring strategy with a client"
                fill
                sizes="(min-width: 640px) 480px, 100vw"
                className="object-cover"
              />
            </div>

            <div className="lg:order-2">
              <p className="text-[14.5px] font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">
                Our approach
              </p>
              <h2 className="mt-2.5 font-heading text-3xl font-bold leading-tight text-navy sm:text-4xl dark:text-cream">
                Quality over quantity
              </h2>
              <p className="mt-5 text-[18px] leading-relaxed text-steel dark:text-steel-light">
                We don&apos;t try to mass-produce placements or take over your whole hiring function. We take on
                searches we can do well, and we do them carefully.
              </p>
              <p className="mt-4 flex gap-3 text-[18px] leading-relaxed text-steel dark:text-steel-light">
                <span className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-steel/15 text-steel dark:text-steel-light">
                  <IconCheck className="h-3.5 w-3.5" />
                </span>
                <span>
                  <strong className="font-semibold text-navy dark:text-cream">In practice:</strong> fewer resumes,
                  better-matched candidates and recruiters who change course when your industry does.
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="border-t border-navy/[0.06] bg-page dark:border-white/10 dark:bg-navy-900">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 lg:px-16 lg:py-24">
          <div className="flex items-center justify-center gap-4">
            <span aria-hidden="true" className="h-px flex-1 bg-navy/10 dark:bg-white/10" />
            <p className="flex-shrink-0 text-[14.5px] font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">
              Our values
            </p>
            <span aria-hidden="true" className="h-px flex-1 bg-navy/10 dark:bg-white/10" />
          </div>
          <h2 className="mt-4 text-center font-heading text-3xl font-bold leading-tight text-navy sm:text-4xl dark:text-cream">
            What we hold ourselves to
          </h2>

          <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div key={value.title}>
                <value.icon className="h-8 w-8 text-navy dark:text-cream" />
                <h3 className="mt-4 font-heading text-lg font-semibold text-navy dark:text-cream">{value.title}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-steel dark:text-steel-light">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      {teamMembers.length > 0 && (
        <section id="leadership" className="scroll-mt-28 border-t border-navy/[0.06] bg-page dark:border-white/10 dark:bg-navy-900">
          <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10 lg:px-16 lg:py-24">
            <div className="flex items-center justify-center gap-4">
              <span aria-hidden="true" className="h-px flex-1 bg-navy/10 dark:bg-white/10" />
              <p className="flex-shrink-0 text-[14.5px] font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">
                Leadership
              </p>
              <span aria-hidden="true" className="h-px flex-1 bg-navy/10 dark:bg-white/10" />
            </div>
            <h2 className="mt-4 text-center font-heading text-3xl font-bold leading-tight text-navy sm:text-4xl dark:text-cream">
              The people behind Mintex
            </h2>

            <div className="mt-12 grid grid-cols-1 items-start gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-navy/[0.08] bg-white shadow-[0_1px_3px_rgba(0,48,96,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_-24px_rgba(1,35,64,0.3)] dark:border-white/10 dark:bg-navy-800"
                >
                  <div className="relative aspect-[4/5] w-full bg-navy/10 dark:bg-white/10">
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
                      <span className="flex h-full w-full items-center justify-center font-heading text-3xl font-semibold text-navy/40 dark:text-cream/40">
                        {initials(member.name)}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-heading text-lg font-semibold text-navy dark:text-cream">{member.name}</h3>
                    <p className="text-sm font-medium text-steel dark:text-steel-light">{member.title}</p>

                    {member.bio && (
                      <details className="group mt-3">
                        <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                          {/* Bio rendered once — only the clamp toggles. It
                              used to be written out twice (clamped + full),
                              which put every bio in the HTML twice. */}
                          <span className="line-clamp-4 text-[15px] leading-relaxed text-steel group-open:line-clamp-none dark:text-steel-light">
                            {member.bio}
                          </span>
                          <span className="mt-1.5 block text-[13.5px] font-semibold text-navy-secondary group-open:hidden">
                            Read more
                          </span>
                          <span className="mt-1.5 hidden text-[13.5px] font-semibold text-navy-secondary group-open:block">
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
                          className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-navy hover:text-navy-secondary dark:text-cream"
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

      {/* Closing CTA — replaces the old "Learn More About Us" → /contact button */}
      <section className="border-t border-navy/[0.06] bg-page dark:border-white/10 dark:bg-navy-900">
        <div className="mx-auto max-w-2xl px-6 py-20 text-center sm:px-10 lg:py-24">
          <h2 className="font-heading text-[34px] font-bold leading-tight text-navy sm:text-[42px] dark:text-cream">
            Work with us
          </h2>
          <p className="mt-4 text-[19px] leading-relaxed text-steel dark:text-steel-light">
            Hiring? Let&apos;s talk about the role. Looking for work? Let&apos;s talk about what&apos;s next.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3.5">
            <ButtonLink
              href="/seek-talent"
              variant="primary"
              className="!bg-navy !text-white hover:!bg-navy-deep dark:!bg-steel dark:!text-navy-950 dark:hover:!bg-steel-light"
            >
              Request talent
            </ButtonLink>
            <ButtonLink
              href="/get-hired"
              variant="outline"
              className="!border-navy !text-navy hover:!bg-navy hover:!text-white dark:!border-steel dark:!text-cream dark:hover:!bg-steel dark:hover:!text-navy-950"
            >
              Find a job
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
