import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Section from "@/components/ui/Section";
import { US_STATES } from "@/lib/interviewKit/schema";
import { getVerifiedRights, slugToState, stateToSlug, FEDERAL_DISPLAY_NOTICE } from "@/lib/interviewKit/legalRights";
import { pageMetadata } from "@/lib/pageMetadata";

// Standalone, indexed legal reference — separate from any generated kit.
// Per implementation-notes.md this is the single best-citable asset in the
// whole feature: static, verified (once lastVerified is actually populated
// — see the honesty note below), and answers a real, high-intent search
// query ("what can't an employer ask me in an interview in {state}") on
// its own, with no kit generation required.
export async function generateStaticParams() {
  return US_STATES.map((state) => ({ state: stateToSlug(state) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string }>;
}): Promise<Metadata> {
  const { state: slug } = await params;
  const state = slugToState(slug);
  if (!state) return {};

  const rights = getVerifiedRights(state);
  const mentionsSalaryHistory = rights.cannot_be_asked.some((item) => item.question.toLowerCase().includes("salary"));

  return pageMetadata({
    title: `Illegal Interview Questions in ${state} — Know Your Rights`,
    description: `What questions can't employers ask in a job interview in ${state}${mentionsSalaryHistory ? ", including salary history" : ""}? What to say if you're asked anyway, and the lawful way for hiring managers to ask instead.`,
    path: `/interview-rights/${slug}`,
  });
}

export default async function InterviewRightsPage({
  params,
}: {
  params: Promise<{ state: string }>;
}) {
  const { state: slug } = await params;
  const state = slugToState(slug);
  if (!state) notFound();

  const rights = getVerifiedRights(state);

  return (
    <>
      <Section background="mist" className="!py-12 sm:!py-14 lg:!py-16">
        <h1 className="font-heading text-4xl font-bold text-navy sm:text-5xl">
          Your Rights in a Job Interview — {state}
          <span className="ml-2 align-middle text-base font-normal text-navy/40">({rights.stateCode})</span>
        </h1>
        <p className="mt-4 max-w-2xl text-steel">
          What an employer legally cannot ask you in {state}, what to say if you&apos;re asked anyway, and — for
          hiring managers — the lawful way to ask for the same information.
        </p>
        <p className="mt-3 text-xs text-navy/40">
          {rights.lastVerified
            ? `Verified ${rights.lastVerified}`
            : "Not yet independently verified against current statutes — confirm anything specific with your state's labor office before relying on it."}
        </p>
      </Section>

      <Section background="cream">
        {rights.isFederalOnly && (
          <p className="mb-6 rounded-xl bg-steel/10 px-4 py-3 text-sm text-navy/70">{FEDERAL_DISPLAY_NOTICE}</p>
        )}

        <div className="space-y-4">
          {rights.cannot_be_asked.map((item) => (
            <div key={item.question} className="rounded-2xl border border-navy/10 bg-white p-5">
              <p className="text-navy/50 line-through">
                <span className="sr-only">Prohibited question: </span>
                {item.question}
              </p>
              <p className="mt-2 text-sm text-navy/70">{item.why}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-mist p-3 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-navy/50">If you&apos;re a candidate</p>
                  <p className="mt-1 text-navy/75">{item.how_to_respond}</p>
                </div>
                <div className="rounded-xl bg-mist p-3 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-navy/50">If you&apos;re hiring</p>
                  <p className="mt-1 text-navy/75">Ask this instead: {item.lawful_alternative}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-navy/40">Source: {item.source.label}</p>
            </div>
          ))}
        </div>

        {rights.state_specific.length > 0 && (
          <div className="mt-8 rounded-2xl border border-steel/40 bg-steel/[0.08] p-6">
            <h2 className="font-heading text-lg font-semibold text-navy">More about {state}&apos;s protections</h2>
            <ul className="mt-3 space-y-2.5 text-sm text-navy/70">
              {rights.state_specific.map((note) => (
                <li key={note.text} className="list-disc pl-4 marker:text-navy/30">
                  {note.text}
                  <span className="block text-xs text-navy/40">Source: {note.source.label}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {rights.legally_confused.length > 0 && (
          <div className="mt-8">
            <h2 className="font-heading text-lg font-semibold text-navy">Often assumed illegal — but isn&apos;t</h2>
            <div className="mt-3 space-y-3">
              {rights.legally_confused.map((item) => (
                <div key={item.question} className="rounded-2xl border border-navy/10 bg-white p-5">
                  <p className="font-medium text-navy">{item.question}</p>
                  <p className="mt-1 text-sm text-navy/70">{item.why}</p>
                  <p className="mt-1 text-sm text-navy/70">{item.guidance}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="mt-8 text-sm text-navy/50">
          Preparing for an interview in {state}?{" "}
          <Link href="/resources/ai-interview-generator" className="font-medium text-steel hover:text-navy">
            Generate a free interview kit →
          </Link>
        </p>
      </Section>
    </>
  );
}
