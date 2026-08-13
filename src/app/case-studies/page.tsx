import type { Metadata } from "next";
import Section from "@/components/ui/Section";
import TestimonialCard from "@/components/ui/TestimonialCard";
import { supabase } from "@/lib/supabase";
import type { CaseStudy } from "@/content/types";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata: Metadata = pageMetadata({
  title: "Case Studies",
  description: "Client testimonials, candidate testimonials, and other Mintex Staffing case studies.",
  path: "/case-studies",
});

export const revalidate = 60;

function CaseStudyGroup({
  id,
  background,
  eyebrow,
  title,
  intro,
  emptyText,
  studies,
}: {
  id: string;
  background: "cream" | "white" | "mist";
  eyebrow: string;
  title: string;
  intro: string;
  emptyText: string;
  studies: CaseStudy[];
}) {
  return (
    <Section id={id} background={background}>
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-steel">{eyebrow}</p>
        <h2 className="mt-3.5 font-heading text-[32px] font-semibold leading-tight text-navy sm:text-[36px]">
          {title}
        </h2>
        <p className="mt-4 text-lg text-steel">{intro}</p>
      </div>

      {studies.length > 0 ? (
        <div className="mx-auto mt-11 grid max-w-5xl items-start gap-6 sm:grid-cols-2">
          {studies.map((cs) => (
            <TestimonialCard key={cs.id} caseStudy={cs} />
          ))}
        </div>
      ) : (
        <p className="mt-11 text-center text-sm text-navy/50">{emptyText}</p>
      )}
    </Section>
  );
}

export default async function CaseStudiesPage() {
  const { data } = await supabase
    .from("case_studies")
    .select("*")
    .order("sort_order", { ascending: true });

  const caseStudies = (data ?? []) as CaseStudy[];
  const clientStudies = caseStudies.filter((cs) => cs.type === "client");
  const candidateStudies = caseStudies.filter((cs) => cs.type === "candidate");
  const otherStudies = caseStudies.filter((cs) => cs.type === "other");

  return (
    <>
      <Section background="mist" className="!py-12 sm:!py-14 lg:!py-16">
        <h1 className="font-heading text-4xl font-bold text-navy sm:text-5xl">Case Studies</h1>
        <div className="mt-3 h-1 w-16 rounded-full bg-steel" />
        <p className="mt-4 max-w-2xl text-steel">
          Real outcomes from the clients and candidates we&apos;ve partnered with.
        </p>
      </Section>

      <CaseStudyGroup
        id="client"
        background="white"
        eyebrow="Client stories"
        title="Client Testimonials"
        intro="Hear directly from the hiring teams and leaders we've partnered with."
        emptyText="No client testimonials yet."
        studies={clientStudies}
      />

      <CaseStudyGroup
        id="candidate"
        background="mist"
        eyebrow="Candidate stories"
        title="Candidate Testimonials"
        intro="Real career moves made possible by the right introduction at the right time."
        emptyText="No candidate testimonials yet."
        studies={candidateStudies}
      />

      <CaseStudyGroup
        id="other"
        background="white"
        eyebrow="More outcomes"
        title="Other Case Studies"
        intro="Additional wins from across the industries we serve."
        emptyText="No other case studies yet."
        studies={otherStudies}
      />
    </>
  );
}
