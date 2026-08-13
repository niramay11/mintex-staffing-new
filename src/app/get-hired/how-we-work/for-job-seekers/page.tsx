import type { Metadata } from "next";
import Image from "next/image";
import Section from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import IconLinkCard, { ARTICLE_ICON_PATH } from "@/components/ui/IconLinkCard";
import { getSiteImages } from "@/lib/siteImages";
import { getInsightsByCategory } from "@/lib/insights";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata: Metadata = pageMetadata({
  title: "How We Help Job Seekers",
  description:
    "See how Mintex Staffing matches you with roles that fit, from the first conversation through your offer and beyond.",
  path: "/get-hired/how-we-work/for-job-seekers",
});

const steps = [
  {
    number: "1",
    description:
      "Finding the right job shouldn't feel like sending resumes into a void. At Mintex Staffing, we take time to understand where you've been and where you want to go and then match you with roles across IT, healthcare, engineering, manufacturing, finance, administrative, sales, customer service, legal and logistics that actually fit.",
  },
  {
    number: "2",
    description:
      "It starts with a conversation, not a form. We understand your skills, your goals, and the kind of workplace culture where you'll thrive and grow. From there, we tap our active employer network to connect you with roles that match your experience, and we screen every opportunity before it reaches you, so your time is never wasted on a bad fit.",
  },
  {
    number: "3",
    description:
      "Once you're placed, we don't disappear. We stay involved through your offer, your first days on the job, and beyond, because your success is our success.",
  },
  {
    number: "4",
    description:
      "Whether you're exploring a career change or ready for your next step, Mintex Staffing is here to help you find your desired position that fits your standards. Ready to get started?",
  },
];

const jobSeekerResources = [
  {
    href: "/resources/ai-interview-generator",
    tag: "AI tool",
    title: "AI Interview Question Generator",
    description: "Practice with tailored interview questions for your industry and role level.",
    path: "M8 10h8M8 14h5M21 12c0 4.97-4.03 9-9 9-1.66 0-3.22-.45-4.56-1.24L3 21l1.24-4.44A8.94 8.94 0 0 1 3 12c0-4.97 4.03-9 9-9s9 4.03 9 9Z",
  },
  {
    href: "/get-hired/share-resume",
    tag: "Get started",
    title: "Share Your Resume",
    description: "Get matched to roles across every industry we serve, even before you apply.",
    path: "M9 12h6M9 16h6M9 8h6M7 3h7l3 3v15H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z",
  },
];

export default async function HowWeHelpJobSeekersPage() {
  const [siteImages, insights] = await Promise.all([
    getSiteImages(),
    getInsightsByCategory("career", 2),
  ]);
  return (
    <>
      <Section background="mist" className="!py-12 sm:!py-14 lg:!py-16">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-steel">
          For job seekers
        </p>
        <h1 className="mt-2.5 font-heading text-4xl font-bold text-navy sm:text-5xl">How We Help Job Seekers</h1>
        <p className="mt-4 max-w-2xl text-steel">
          A closer look at how Mintex Staffing matches you with roles that fit, from the first
          conversation through your offer and beyond.
        </p>
      </Section>

      <Section background="white">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-14 lg:grid-cols-[0.8fr_1fr] lg:gap-20">
            <div className="relative mx-auto w-full max-w-[440px]">
              <div
                aria-hidden="true"
                className="absolute -inset-4 -z-10 rounded-[36px] border-2 border-steel/25"
              />
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[28px] shadow-[0_25px_55px_-20px_rgba(0,48,96,0.35)]">
                <Image
                  src={siteImages["seek-talent:how-we-work-visual"]}
                  alt="Hiring manager and candidate discussing a staffing role with Mintex Staffing's recruitment guidance"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <div>
              <div className="relative mt-2">
                <div
                  aria-hidden="true"
                  className="absolute left-[18px] top-9 bottom-9 border-l-2 border-dashed border-navy/20"
                />
                <div className="space-y-6">
                  {steps.map((step) => (
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
                <ButtonLink href="/get-hired" variant="primary">
                  Browse Open Roles
                </ButtonLink>
              </div>
            </div>
          </div>

          <div className="mt-20">
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-steel">
              Helpful for your search
            </p>
            <h2 className="mt-2.5 text-3xl font-bold leading-tight text-navy sm:text-4xl">
              Resources
            </h2>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {jobSeekerResources.map((item) => (
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
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-steel">
                Career insights
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
