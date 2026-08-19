import type { Metadata } from "next";
import Image from "next/image";
import Section from "@/components/ui/Section";
import AiInterviewGenerator from "@/components/tools/AiInterviewGenerator";
import { getSiteImages } from "@/lib/siteImages";
import { getIndustries } from "@/lib/industries";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata: Metadata = pageMetadata({
  title: "AI Interview Question Generator",
  description: "Generate tailored interview questions by industry and role level.",
  path: "/resources/ai-interview-generator",
});

const interviewPrepPoints = [
  "Interviews can be overstimulating and stressful, and getting nervous just before entering the room and panicking is the fastest way to lose an opportunity you’ve worked hard to earn. We understand the pressure, and that’s why we’ve designed an AI interview question generator that helps job seekers across all industries (IT, Healthcare, Legal, Engineering, Manufacturing, Finance, Administration, Sales, Logistics, Customer service, and more) prepare for success.",
  "Select your industry and experience level, and our AI instantly generates role specific questions tailored to what hiring managers ask. Whether you’re a first-time candidate or an experienced professional targeting a leadership role, you’ll get relevant practice questions in seconds, not hours of guesswork.",
  "Use the tool to rehearse your answers, identify gaps in your responses, and refine your talking points before interview day. Pair it with Mintex Staffing’s recruiting expertise to strengthen both your preparation and your job search strategy.",
  "Best of all, it’s completely free and available anytime, no sign-up, no waiting. Start preparing smarter today and walk into your next interview ready to make a lasting impression on any hiring team, in any industry.",
];

export default async function AiInterviewGeneratorPage() {
  const siteImages = await getSiteImages();
  const industries = await getIndustries();
  return (
    <>
      <Section background="mist" className="!py-12 sm:!py-14 lg:!py-16">
        <h1 className="font-heading text-4xl font-bold text-navy dark:text-cream sm:text-5xl">AI Interview Question Generator</h1>
        <p className="mt-4 max-w-2xl text-steel dark:text-steel-light">
          Generate tailored interview questions for IT, healthcare, engineering &amp; more. Free AI-powered tool from Mintex Staffing, no sign-up required.
        </p>
      </Section>

      <Section background="white">
        <div className="mx-auto grid w-full items-start gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-24">
          <div>
            <div className="inline-flex items-center gap-2.5 rounded-full border border-navy/10 bg-white px-4 py-2 text-[13px] font-medium text-navy/70 dark:border-white/10 dark:bg-navy-800 dark:text-cream/70">
              <span className="h-[7px] w-[7px] rounded-full bg-steel" />
              AI-Powered Prep
            </div>
            <h2 className="mt-5 font-heading text-[32px] font-semibold leading-tight text-navy dark:text-cream sm:text-[40px]">
              Walk into your next interview ready for anything
            </h2>
            <div className="mt-6 space-y-5">
              {interviewPrepPoints.map((point, index) => (
                <div key={index} className="flex gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-navy text-xs font-semibold text-white dark:bg-steel dark:text-navy-950">
                    {index + 1}
                  </span>
                  <p className="text-base leading-relaxed text-steel dark:text-steel-light">{point}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto aspect-[6/5] w-full max-w-2xl">
            <div
              aria-hidden="true"
              className="absolute left-[4%] top-[2%] h-[76%] w-[76%] rounded-[45%_55%_60%_40%/50%_45%_55%_50%] bg-navy/[0.05]"
            />
            <div
              aria-hidden="true"
              className="absolute left-0 top-[12%] h-[68%] w-[68%] rounded-[55%_45%_40%_60%/45%_55%_45%_55%] bg-steel-lighter/40"
            />

            <div className="absolute left-0 top-0 h-[64%] w-[64%] overflow-hidden rounded-[2rem] shadow-[0_25px_60px_-20px_rgba(0,48,96,0.35)]">
              <Image
                src={siteImages["ai-interview-generator:handshake-visual"]}
                alt="Candidate shaking hands with a hiring manager after a job interview prepared with Mintex Staffing's AI interview question generator"
                fill
                className="object-cover"
              />
            </div>

            <div className="absolute right-0 top-[6%] h-[38%] w-[44%] overflow-hidden rounded-[1.5rem] shadow-[0_20px_45px_-18px_rgba(0,48,96,0.35)]">
              <Image
                src={siteImages["ai-interview-generator:confident-visual"]}
                alt="Confident candidate smiling during a job interview, prepared using Mintex Staffing's interview resources"
                fill
                className="object-cover"
              />
            </div>

            <div className="absolute bottom-0 right-[8%] h-[40%] w-[42%] overflow-hidden rounded-[1.5rem] shadow-[0_20px_45px_-18px_rgba(0,48,96,0.35)]">
              <Image
                src={siteImages["ai-interview-generator:meeting-visual"]}
                alt="Job interview taking place in an office setting, supported by Mintex Staffing's staffing and recruitment services"
                fill
                className="object-cover"
              />
            </div>

            <div
              className="absolute left-0 flex items-center gap-3 rounded-2xl border border-navy/10 bg-white px-5 py-4 text-navy shadow-[0_20px_45px_-18px_rgba(0,48,96,0.3)] dark:border-white/10 dark:bg-navy-900 dark:text-cream"
              style={{ top: "70%" }}
            >
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-steel/15 text-steel dark:text-steel-light">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
                  <path d="M11.5 3 13 8l5 1.5-5 1.5-1.5 5L10 11 5 9.5 10 8z" strokeLinejoin="round" />
                  <path d="M18.5 15.5 19.5 18l2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" strokeLinejoin="round" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-semibold leading-none">Full interview kits</p>
                <p className="mt-1 text-xs text-navy/50 dark:text-cream/50">competencies, three rounds, scoring rubric</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section background="cream">
        <AiInterviewGenerator industries={industries} />
      </Section>
    </>
  );
}
