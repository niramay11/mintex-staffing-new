import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Section from "@/components/ui/Section";
import { IconBriefcase, IconBars, IconArrowRight } from "@/components/jobs/icons";
import { getSiteImages } from "@/lib/siteImages";
import { pageMetadata } from "@/lib/pageMetadata";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbSchema";

function IconChat({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4 5h16v11H8l-4 4V5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8 9.5h8M8 12.5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

const resourcesPoints = [
  {
    icon: IconBriefcase,
    title: "Free, practical tools",
    description:
      "Great hiring decisions and strong interview performance both start with the right information. Mintex Staffing’s Resources hub gives employers and candidates free, practical tools to make smarter, faster decisions.",
    imageAlt: "Mintex Staffing's free staffing and recruitment resources for employers and job seekers",
  },
  {
    icon: IconBars,
    title: "Know your true cost-per-hire",
    description:
      "For hiring teams, our Hiring Cost Calculator breaks down your true cost-per-hire across ad spend, agency fees, and internal time, so you can see exactly where your recruiting budget goes and identify opportunities to hire more efficiently. Understanding your real cost-per-hire is the first step toward building a staffing strategy that fits your budget and timeline.",
    imageAlt: "Hiring team using Mintex Staffing's cost-per-hire calculator for their recruitment budget",
  },
  {
    icon: IconChat,
    title: "Interview-ready in minutes",
    description:
      "For job seekers, our AI Interview Question Generator creates tailored interview questions by industry and role level, across IT, healthcare, engineering, manufacturing, finance, administrative, sales, customer service, legal and logistics, helping you walk into your next interview prepared and confident.",
    imageAlt: "Job seeker using Mintex Staffing's AI interview question generator to prepare for an interview",
  },
  {
    icon: IconArrowRight,
    title: "Built to save you time",
    description:
      "Whether you’re refining your hiring strategy or getting ready for interview day, these tools are built to save you time and remove the guesswork. Explore the resources below and check back often as we continue adding new tools for both employers and candidates.",
    imageAlt: "Employer and candidate exploring Mintex Staffing's staffing and recruitment services together",
  },
] as const;

export const metadata: Metadata = pageMetadata({
  title: "Resources",
  description:
    "Hiring calculators and an AI interview question generator from Mintex Staffing.",
  path: "/resources",
});

const tools = [
  {
    href: "/resources/hiring-cost-calculator",
    image: "resources:hiring-cost-card",
    position: "50% 45%",
    title: "Hiring Cost Calculator",
    description: "Estimate your true cost-per-hire across ad spend, agency fees, and internal time.",
    tags: ["Ad spend", "Agency fees", "Internal time"],
    time: "2 min",
  },
  {
    href: "/resources/ai-interview-generator",
    image: "resources:ai-interview-card",
    position: "88% 30%",
    title: "AI Interview Question Generator",
    description: "Generate tailored interview questions by industry and role level.",
    tags: ["IT", "Healthcare", "Engineering"],
    time: "1 min",
  },
] as const;

export default async function ResourcesPage() {
  const siteImages = await getSiteImages();
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Resources", path: "/resources" },
  ]);
  return (
    <>
      <script
        id="resources-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Section background="mist" className="!py-12 sm:!py-14 lg:!py-16">
        <h1 className="font-heading text-4xl font-bold text-navy dark:text-cream sm:text-5xl">Resources</h1>
        <p className="mt-4 max-w-2xl text-steel dark:text-steel-light">
          Free tools for hiring teams and job seekers, hiring cost calculator, and AI interview
          question generator from Mintex Staffing.
        </p>
      </Section>

      <Section background="white" className="!py-12 sm:!py-14 lg:!py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">Why it helps</p>
          <h2 className="mt-2.5 text-3xl font-bold text-navy dark:text-cream sm:text-4xl">Built for hiring teams and candidates</h2>
        </div>

        <div className="mx-auto mt-10 max-w-5xl space-y-10 lg:space-y-14">
          {resourcesPoints.map((point, index) => {
            const PointIcon = point.icon;
            const imageFirst = index % 2 === 0;
            return (
              <div
                key={point.title}
                className={`flex flex-col items-center gap-6 lg:items-start lg:gap-10 ${imageFirst ? "lg:flex-row" : "lg:flex-row-reverse"}`}
              >
                <div className="relative hidden flex-shrink-0 lg:block" style={{ width: 320 }}>
                  <div
                    aria-hidden="true"
                    className="absolute -inset-3 rounded-[2rem] border border-navy/10 dark:border-white/10"
                  />
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] shadow-[0_20px_45px_-20px_rgba(0,48,96,0.25)]">
                    <Image
                      src={siteImages[`resources:point-${index + 1}-visual`]}
                      alt={point.imageAlt}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                <div className="group flex w-full flex-1 gap-4 rounded-2xl border border-navy/[0.08] bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-steel/40 hover:shadow-[0_20px_45px_-20px_rgba(0,48,96,0.3)] dark:border-white/10 dark:bg-navy-900">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-steel/15 text-steel dark:text-steel-light">
                    <PointIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-navy dark:text-cream">{point.title}</h3>
                    <p className="mt-1 text-sm text-navy/70 dark:text-cream/70">{point.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section background="cream" className="!border-t-0 before:absolute before:inset-x-0 before:top-0 before:h-px before:content-[''] before:bg-gradient-to-r before:from-transparent before:via-navy/10 before:to-transparent dark:before:via-white/10">
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_1px_3px_rgba(0,48,96,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-16px_rgba(0,48,96,0.35)] dark:bg-navy-900"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src={siteImages[tool.image]}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  style={{ objectPosition: tool.position }}
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-navy shadow-sm backdrop-blur-sm">
                  {tool.time}
                </span>
                <div className="absolute inset-x-0 bottom-0 bg-navy/85 px-4 py-2 text-center text-xs font-medium text-white backdrop-blur-sm">
                  Free — no sign-up required
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-heading text-lg font-semibold leading-snug text-navy dark:text-cream">{tool.title}</h2>
                  <span className="flex flex-shrink-0 items-center gap-1 text-sm font-semibold text-steel transition-colors group-hover:text-navy dark:text-steel-light dark:group-hover:text-cream">
                    Open tool
                    <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-0.5">
                      &rarr;
                    </span>
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-navy/70 dark:text-cream/70">{tool.description}</p>
                <div className="mt-auto flex flex-wrap gap-2 pt-1">
                  {tool.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-mist px-3 py-1 text-xs font-medium text-navy/70 dark:bg-navy-800 dark:text-cream/70">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
