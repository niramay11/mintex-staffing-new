import type { Metadata } from "next";
import Image from "next/image";
import Section from "@/components/ui/Section";
import AiInterviewGenerator from "@/components/tools/AiInterviewGenerator";
import { getSiteImages } from "@/lib/siteImages";

export const metadata: Metadata = {
  title: "AI Interview Question Generator",
  description: "Generate tailored interview questions by industry and role level.",
};

export default async function AiInterviewGeneratorPage() {
  const siteImages = await getSiteImages();
  return (
    <>
      <Section background="navy" className="!py-12 sm:!py-14 lg:!py-16">
        <h1 className="text-4xl font-bold sm:text-5xl">AI Interview Question Generator</h1>
        <p className="mt-4 max-w-2xl text-white/80">
          Pick an industry and role level to generate a tailored set of interview questions.
        </p>
      </Section>

      <Section background="cream">
        <div className="mx-auto grid w-full items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-24">
          <div>
            <div className="inline-flex items-center gap-2.5 rounded-full border border-navy/10 bg-white px-4 py-2 text-[13px] font-medium text-navy/70">
              <span className="h-[7px] w-[7px] rounded-full bg-tan" />
              AI-Powered Prep
            </div>
            <h2 className="mt-5 font-heading text-[32px] font-semibold leading-tight text-navy sm:text-[40px]">
              Walk into your next interview ready for anything
            </h2>
            <p className="mt-4 max-w-md text-lg text-steel">
              Generate tailored interview questions in seconds, practice your answers, and
              show up on interview day feeling prepared and confident.
            </p>
          </div>

          <div className="relative mx-auto aspect-[6/5] w-full max-w-2xl">
            <div
              aria-hidden="true"
              className="absolute left-[4%] top-[2%] h-[76%] w-[76%] rounded-[45%_55%_60%_40%/50%_45%_55%_50%] bg-navy/[0.05]"
            />
            <div
              aria-hidden="true"
              className="absolute left-0 top-[12%] h-[68%] w-[68%] rounded-[55%_45%_40%_60%/45%_55%_45%_55%] bg-tan/[0.12]"
            />

            <div className="absolute left-0 top-0 h-[64%] w-[64%] overflow-hidden rounded-[2rem] shadow-[0_25px_60px_-20px_rgba(0,48,96,0.35)]">
              <Image
                src={siteImages["ai-interview-generator:handshake-visual"]}
                alt="Candidate shaking hands with a hiring manager after a job interview"
                fill
                className="object-cover"
              />
            </div>

            <div className="absolute right-0 top-[6%] h-[38%] w-[44%] overflow-hidden rounded-[1.5rem] shadow-[0_20px_45px_-18px_rgba(0,48,96,0.35)]">
              <Image
                src={siteImages["ai-interview-generator:confident-visual"]}
                alt="Confident candidate smiling during a job interview"
                fill
                className="object-cover"
              />
            </div>

            <div className="absolute bottom-0 right-[8%] h-[40%] w-[42%] overflow-hidden rounded-[1.5rem] shadow-[0_20px_45px_-18px_rgba(0,48,96,0.35)]">
              <Image
                src={siteImages["ai-interview-generator:meeting-visual"]}
                alt="Interview taking place in an office setting"
                fill
                className="object-cover"
              />
            </div>

            <div
              className="absolute left-0 flex items-center gap-3 rounded-2xl border border-navy/10 bg-white px-5 py-4 text-navy shadow-[0_20px_45px_-18px_rgba(0,48,96,0.3)]"
              style={{ top: "70%" }}
            >
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-tan/15 text-tan">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
                  <path d="M11.5 3 13 8l5 1.5-5 1.5-1.5 5L10 11 5 9.5 10 8z" strokeLinejoin="round" />
                  <path d="M18.5 15.5 19.5 18l2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" strokeLinejoin="round" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-semibold leading-none">500+ questions</p>
                <p className="mt-1 text-xs text-navy/50">across 12 industries</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section background="cream">
        <AiInterviewGenerator />
      </Section>
    </>
  );
}
