import type { Metadata } from "next";
import Image from "next/image";
import Section from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import IconLinkCard, { ARTICLE_ICON_PATH } from "@/components/ui/IconLinkCard";
import { getSiteImages } from "@/lib/siteImages";
import { getInsightsByCategory } from "@/lib/insights";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata: Metadata = pageMetadata({
  title: "How We Help Our Clients",
  description:
    "See how Mintex Staffing scopes, sources, and supports every client engagement, from the first scoping call through onboarding and beyond.",
  path: "/seek-talent/how-we-work/for-clients",
});

const clientSteps = [
  {
    number: "1",
    description:
      "At Mintex Staffing, our hiring process starts with listening, what you want, how soon you want and your future goals for the business. We partner with employers to help them with IT staffing, healthcare staffing, engineering staffing, manufacturing staffing, finance staffing, administrative staffing, sales staffing, customer service staffing, legal staffing and logistics staffing, which means no two searches look the same, and no two shortlists should either.",
  },
  {
    number: "2",
    description:
      "Every engagement begins with a scoping call, where we learn your team's culture, timeline, and what “great fit” really means for your business, before we start the hunt. From there, we source and screen candidates from our active talent network, vetting for skill, experience, and cultural fit so you only meet people worth your time.",
  },
  {
    number: "3",
    description:
      "Placement isn't the finish line. We stay involved through offer negotiations, onboarding, and beyond, making sure the fit holds up in the real world.",
  },
  {
    number: "4",
    description:
      "This is what lets Mintex Staffing deliver consistent, high-quality hires across industries, not just fast ones. Ready to build a shortlist around your team?",
  },
];

const clientResources = [
  {
    href: "/resources/hiring-cost-calculator",
    tag: "Calculator",
    title: "Hiring Cost Calculator",
    description: "Estimate your true cost-per-hire across ad spend, agency fees, and internal time.",
    path: "M9 7h6M9 11h6M9 15h4M5 21h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z",
  },
  {
    href: "/resources/ai-interview-generator",
    tag: "AI tool",
    title: "AI Interview Question Generator",
    description: "Generate tailored interview questions by industry and role level.",
    path: "M8 10h8M8 14h5M21 12c0 4.97-4.03 9-9 9-1.66 0-3.22-.45-4.56-1.24L3 21l1.24-4.44A8.94 8.94 0 0 1 3 12c0-4.97 4.03-9 9-9s9 4.03 9 9Z",
  },
];

export default async function HowWeHelpClientsPage() {
  const [siteImages, insights] = await Promise.all([
    getSiteImages(),
    getInsightsByCategory("market", 2),
  ]);
  return (
    <>
      <Section background="navy" className="!py-12 sm:!py-14 lg:!py-16">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-tan-light">
          For clients
        </p>
        <h1 className="mt-2.5 text-4xl font-bold sm:text-5xl">How We Help Our Clients</h1>
        <p className="mt-4 max-w-2xl text-white/80">
          A closer look at how Mintex Staffing scopes, sources, and supports every client
          engagement, from the first conversation through onboarding and beyond.
        </p>
      </Section>

      <Section background="cream">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-14 lg:grid-cols-[1fr_0.8fr] lg:gap-20">
            <div>
              <div className="relative mt-2">
                <div
                  aria-hidden="true"
                  className="absolute left-[18px] top-9 bottom-9 border-l-2 border-dashed border-navy/20"
                />
                <div className="space-y-6">
                  {clientSteps.map((step) => (
                    <div key={step.number} className="relative flex gap-4">
                      <span className="relative z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
                        {step.number}
                      </span>
                      <p className="mt-1 text-sm leading-relaxed text-navy/65">{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <ButtonLink href="/seek-talent/get-started" variant="primary">
                  Let&apos;s Talk Hiring
                </ButtonLink>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[440px]">
              <div
                aria-hidden="true"
                className="absolute -inset-4 -z-10 rounded-[36px] border-2 border-tan/25"
              />
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[28px] shadow-[0_25px_55px_-20px_rgba(0,48,96,0.35)]">
                <Image
                  src={siteImages["seek-talent:how-we-work-clients-visual"]}
                  alt="Mintex Staffing recruiter discussing hiring needs with a client team"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          <div className="mt-20">
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-tan">
              Helpful for hiring teams
            </p>
            <h2 className="mt-2.5 text-3xl font-bold leading-tight text-navy sm:text-4xl">
              Resources
            </h2>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {clientResources.map((item) => (
                <IconLinkCard
                  key={item.href}
                  href={item.href}
                  tag={item.tag}
                  title={item.title}
                  description={item.description}
                  iconPath={item.path}
                />
              ))}
            </div>
          </div>

          {insights.length > 0 && (
            <div className="mt-16">
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-tan">
                Job market insights
              </p>
              <h2 className="mt-2.5 text-3xl font-bold leading-tight text-navy sm:text-4xl">
                Insights
              </h2>

              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                {insights.map((post) => (
                  <IconLinkCard
                    key={post.slug}
                    href={`/insights/post/${post.slug}`}
                    tag="Article"
                    title={post.title}
                    description={post.excerpt}
                    iconPath={ARTICLE_ICON_PATH}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>
    </>
  );
}
