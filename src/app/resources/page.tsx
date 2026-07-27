import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Section from "@/components/ui/Section";
import { getSiteImages } from "@/lib/siteImages";
import { pageMetadata } from "@/lib/pageMetadata";

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
    tag: "Calculator",
    time: "2 min",
  },
  {
    href: "/resources/ai-interview-generator",
    image: "resources:ai-interview-card",
    position: "88% 30%",
    title: "AI Interview Question Generator",
    description: "Generate tailored interview questions by industry and role level.",
    tag: "AI tool",
    time: "1 min",
  },
] as const;

export default async function ResourcesPage() {
  const siteImages = await getSiteImages();
  return (
    <>
      <Section background="navy" className="!py-12 sm:!py-14 lg:!py-16">
        <h1 className="text-4xl font-bold sm:text-5xl">Resources</h1>
        <p className="mt-4 max-w-2xl text-white/80">
          Practical tools for hiring teams and candidates, from cost calculators to interview
          prep.
        </p>
      </Section>

      <Section background="cream">
        <div className="grid gap-6 sm:grid-cols-2 max-w-3xl">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group relative flex aspect-[3/4] flex-col overflow-hidden rounded-3xl shadow-[0_1px_3px_rgba(0,48,96,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-16px_rgba(0,48,96,0.35)]"
            >
              <Image
                src={siteImages[tool.image]}
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                style={{ objectPosition: tool.position }}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />

              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-navy-deep via-navy-deep/70 to-transparent"
              />

              <div className="relative mt-auto flex flex-col gap-3 p-5 text-white">
                <h2 className="font-heading text-lg font-semibold leading-snug">{tool.title}</h2>
                <p className="text-sm leading-relaxed text-white/75">{tool.description}</p>

                <span className="mt-1 flex w-full items-center justify-center gap-2 rounded-full bg-white py-3 text-sm font-semibold text-navy transition-colors duration-300 group-hover:bg-tan-light">
                  Open tool
                  <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-0.5">
                    &rarr;
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
