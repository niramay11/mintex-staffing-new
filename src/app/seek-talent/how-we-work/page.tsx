import type { Metadata } from "next";
import Image from "next/image";
import Section from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import IndustryAccordion from "@/components/industries/IndustryAccordion";
import { getSiteImages } from "@/lib/siteImages";
import { pageMetadata } from "@/lib/pageMetadata";
import { buildBreadcrumbSchema } from "@/lib/breadcrumbSchema";
import { SITE_URL } from "@/lib/site";

const PATH = "/seek-talent/how-we-work";
const PAGE_DESCRIPTION =
  "From scoping call to post-placement check-in: how Mintex Staffing runs a search for employers and supports job seekers, step by step.";

export const metadata: Metadata = pageMetadata({
  title: "How Our Staffing Process Works",
  description: PAGE_DESCRIPTION,
  path: PATH,
});

const breadcrumbSchema = buildBreadcrumbSchema([
  { name: "Home", path: "/" },
  { name: "Seek Talent", path: "/seek-talent" },
  { name: "How We Work", path: PATH },
]);

// HowTo isn't eligible for rich results on service pages, so the steps are
// described with a plain WebPage node instead.
const webPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}${PATH}#webpage`,
  url: `${SITE_URL}${PATH}`,
  name: "How Our Staffing Process Works",
  description: PAGE_DESCRIPTION,
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: { "@id": `${SITE_URL}/#business` },
};

const EMPLOYER_STEPS = [
  {
    title: "Scoping call.",
    text: "We ask what you need, how soon you need it and where the team is heading. Nothing gets sourced until this is clear.",
  },
  {
    title: "Pick the model.",
    text: "Contract, contract-to-hire, permanent or executive search, based on the work, not on what's easiest for us.",
  },
  { title: "Search.", text: "We start with our pre-screened talent network, then recruit outward if needed." },
  {
    title: "Shortlist.",
    text: "You get candidates screened for skills, delivery track record and culture fit. Healthcare candidates arrive with licenses verified and credentialing done.",
  },
  { title: "Interviews and offer.", text: "We schedule interviews, collect feedback and help close the offer." },
  {
    title: "After the start date.",
    text: "We check in with you and the new hire, and contract placements can convert to permanent when both sides agree.",
  },
];

const JOB_SEEKER_STEPS = [
  { title: "Apply or share your resume.", text: "Pick a role or send your resume for future openings." },
  { title: "Recruiter review.", text: "A real recruiter compares your experience with the role's requirements." },
  {
    title: "A conversation.",
    text: "If it's a match, we call to talk about the role and where you want your career to go.",
  },
  { title: "Presented to the employer.", text: "We introduce you, schedule interviews and prep you for them." },
  { title: "Offer and start.", text: "We handle the offer details and stay in touch after you start." },
];

const FAQS = [
  {
    question: "How quickly can Mintex fill an open role?",
    answer: "Our average time to fill is 9 days, drawing on an active, pre-vetted talent network.",
  },
  {
    question: "What hiring arrangements do you offer?",
    answer: "Contract, contract-to-hire, permanent and executive search.",
  },
  {
    question: "Can a contract hire become a full-time employee?",
    answer:
      "Yes. Many contract placements are set up with a path to permanent hire once both sides confirm the fit.",
  },
  {
    question: "What industries do you recruit for?",
    answer:
      "Twelve: IT, healthcare, engineering, manufacturing, finance and accounting, administrative, sales and marketing, customer service, logistics, creative and design, legal and hospitality.",
  },
  {
    question: "How do I get started?",
    answer:
      "Employers can submit a hiring inquiry and we'll schedule a scoping call. Job seekers can browse open roles or share a resume.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

function Eyebrow({ children }: { children: string }) {
  return (
    <p className="text-[14.5px] font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">{children}</p>
  );
}

function StepList({ steps }: { steps: { title: string; text: string }[] }) {
  return (
    <ol className="mt-8 space-y-3.5">
      {steps.map((step, index) => (
        <li
          key={step.title}
          className="flex items-start gap-4 rounded-2xl border border-navy/[0.08] bg-white p-5 shadow-[0_1px_3px_rgba(0,48,96,0.05)] dark:border-white/10 dark:bg-navy-800"
        >
          <span
            aria-hidden="true"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white dark:bg-steel dark:text-navy-950"
          >
            {index + 1}
          </span>
          <p className="pt-0.5 text-[16.5px] leading-relaxed text-navy/70 dark:text-cream/70">
            <strong className="font-semibold text-navy dark:text-cream">{step.title}</strong> {step.text}
          </p>
        </li>
      ))}
    </ol>
  );
}

function SidePhoto({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative mx-auto w-full max-w-[440px] lg:sticky lg:top-28">
      <div aria-hidden="true" className="absolute -inset-4 -z-10 rounded-[36px] border-2 border-steel/25" />
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[28px] shadow-[0_25px_55px_-20px_rgba(0,48,96,0.35)]">
        <Image src={src} alt={alt} fill sizes="(min-width: 640px) 440px, 100vw" className="object-cover" />
      </div>
    </div>
  );
}

export default async function HowWeWorkPage() {
  const siteImages = await getSiteImages();

  return (
    <>
      <script
        id="how-we-work-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        id="how-we-work-webpage-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        id="how-we-work-faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Sec 1 — Hero */}
      <Section background="mist" className="!py-12 sm:!py-14 lg:!py-16">
        <Eyebrow>Our process</Eyebrow>
        <h1 className="mt-2.5 font-heading text-4xl font-bold text-navy sm:text-5xl dark:text-cream">
          How our staffing process works
        </h1>
        <p className="mt-4 max-w-2xl text-[18px] leading-relaxed text-steel dark:text-steel-light">
          Every search starts with a conversation, not a candidate. Here&apos;s exactly what happens after you
          reach out, whether you&apos;re hiring or looking for work.
        </p>
        <div className="mt-8 flex flex-wrap gap-3.5">
          <ButtonLink href="#employers" variant="primary">
            I&apos;m hiring
          </ButtonLink>
          <ButtonLink
            href="#job-seekers"
            variant="outline"
            className="!border-navy !text-navy hover:!bg-navy hover:!text-white dark:!border-steel dark:!text-cream dark:hover:!bg-steel dark:hover:!text-navy-950"
          >
            I&apos;m looking for a job
          </ButtonLink>
        </div>
      </Section>

      {/* Sec 2 — For employers (target of the /for-clients redirect) */}
      <Section background="white" id="employers" className="scroll-mt-24">
        <div className="mx-auto grid max-w-6xl items-start gap-14 lg:grid-cols-[1fr_0.8fr] lg:gap-20">
          <div>
            <Eyebrow>For employers</Eyebrow>
            <h2 className="mt-2.5 text-3xl font-bold leading-tight text-navy sm:text-4xl dark:text-cream">
              How we work with employers
            </h2>
            <p className="mt-5 text-[18px] leading-relaxed text-navy/70 dark:text-cream/70">
              No two searches look the same, so no two shortlists should either.
            </p>
            <StepList steps={EMPLOYER_STEPS} />
            <p className="mt-7 text-[18px] text-navy/75 dark:text-cream/75">
              Average time from scoping call to filled role:{" "}
              <strong className="font-heading text-[22px] font-bold text-navy dark:text-cream">9 days.</strong>
            </p>
            <div className="mt-7">
              <ButtonLink href="/seek-talent/get-started" variant="primary">
                Let&apos;s talk hiring
              </ButtonLink>
            </div>
          </div>

          <SidePhoto
            src={siteImages["seek-talent:how-we-work-clients-visual"]}
            alt="Mintex Staffing recruiter discussing hiring needs with a client team"
          />
        </div>
      </Section>

      {/* Sec 3 — Client portal */}
      <Section background="white" className="!py-10 sm:!py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 rounded-2xl border border-navy/10 bg-white p-7 shadow-[0_15px_35px_-15px_rgba(0,48,96,0.15)] sm:flex-row sm:items-center sm:p-8 dark:border-white/10 dark:bg-navy-900">
          <div>
            <h2 className="text-xl font-semibold text-navy dark:text-cream">Already a client?</h2>
            <p className="mt-1 text-[15px] text-navy/70 dark:text-cream/70">
              Sign in to the client portal to review candidates, track open roles and manage your account.
            </p>
          </div>
          <ButtonLink href="/client-portal" variant="secondary" className="flex-shrink-0">
            Client login
          </ButtonLink>
        </div>
      </Section>

      {/* Sec 4 — For job seekers (target of the /for-job-seekers redirect) */}
      <Section background="white" id="job-seekers" className="scroll-mt-24">
        <div className="mx-auto grid max-w-6xl items-start gap-14 lg:grid-cols-[0.8fr_1fr] lg:gap-20">
          <div className="order-2 lg:order-1">
            <SidePhoto
              src={siteImages["seek-talent:how-we-work-visual"]}
              alt="Mintex Staffing recruiter talking a job seeker through an open role"
            />
          </div>

          <div className="order-1 lg:order-2">
            <Eyebrow>For job seekers</Eyebrow>
            <h2 className="mt-2.5 text-3xl font-bold leading-tight text-navy sm:text-4xl dark:text-cream">
              How we work with job seekers
            </h2>
            <p className="mt-5 text-[18px] leading-relaxed text-navy/70 dark:text-cream/70">
              Applying for jobs shouldn&apos;t feel like dropping resumes into a void. Here&apos;s what happens with
              yours.
            </p>
            <StepList steps={JOB_SEEKER_STEPS} />
            <p className="mt-7 text-[18px] text-navy/75 dark:text-cream/75">
              <strong className="font-semibold text-navy dark:text-cream">It&apos;s free.</strong> The employer pays
              our fee, never you.
            </p>
            <div className="mt-7">
              <ButtonLink href="/get-hired" variant="primary">
                Browse open roles
              </ButtonLink>
            </div>
          </div>
        </div>
      </Section>

      {/* Sec 5 — FAQ (also feeds the FAQPage schema above) */}
      <Section background="white">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <Eyebrow>Common questions</Eyebrow>
            <h2 className="mt-2.5 text-3xl font-bold leading-tight text-navy sm:text-4xl dark:text-cream">
              Frequently asked questions
            </h2>
          </div>
          <div className="mt-10">
            <IndustryAccordion items={FAQS} />
          </div>
        </div>
      </Section>
    </>
  );
}
