import type { Metadata } from "next";
import Section from "@/components/ui/Section";
import TestimonialCard from "@/components/ui/TestimonialCard";
import { supabase } from "@/lib/supabase";
import type { CaseStudy } from "@/content/types";

export const metadata: Metadata = {
  title: "Case Studies",
  description: "Client testimonials, candidate testimonials, and other Mintex Staffing case studies.",
};

export const revalidate = 60;

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
      <Section background="navy" className="!py-12 sm:!py-14 lg:!py-16">
        <h1 className="text-4xl font-bold sm:text-5xl">Case Studies</h1>
        <p className="mt-4 max-w-2xl text-white/80">
          Real outcomes from the clients and candidates we&apos;ve partnered with.
        </p>
      </Section>

      <Section id="client" background="cream">
        <h2 className="text-3xl font-bold text-navy">Client Testimonials</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {clientStudies.map((cs) => (
            <TestimonialCard key={cs.id} caseStudy={cs} />
          ))}
        </div>
        {clientStudies.length === 0 && <p className="mt-4 text-sm text-navy/50">No client testimonials yet.</p>}
      </Section>

      <Section id="candidate" background="white">
        <h2 className="text-3xl font-bold text-navy">Candidate Testimonials</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {candidateStudies.map((cs) => (
            <TestimonialCard key={cs.id} caseStudy={cs} />
          ))}
        </div>
        {candidateStudies.length === 0 && <p className="mt-4 text-sm text-navy/50">No candidate testimonials yet.</p>}
      </Section>

      <Section id="other" background="mist">
        <h2 className="text-3xl font-bold text-navy">Other Case Studies</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {otherStudies.map((cs) => (
            <TestimonialCard key={cs.id} caseStudy={cs} />
          ))}
        </div>
        {otherStudies.length === 0 && <p className="mt-4 text-sm text-navy/50">No other case studies yet.</p>}
      </Section>
    </>
  );
}
