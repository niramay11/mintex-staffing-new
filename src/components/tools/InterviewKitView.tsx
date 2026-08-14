import Link from "next/link";
import type { InterviewKit } from "@/lib/interviewKit/schema";
import KitSection from "@/components/tools/KitSection";
import ExpandKit from "@/components/tools/ExpandKit";
import { stateToSlug } from "@/lib/interviewKit/legalRights";

// Pure display component — no client state, no hooks. Used by the indexed
// /interview-questions/[slug] candidate page, the /hiring/[slug]-interview-
// guide employer page, and the hub tool widget, so the kit rendering logic
// only lives in one place.
//
// `view` controls the parts that differ by audience: candidates see probes
// and how_to_respond scripts; employers see a printable scorecard with note
// space and the lawful_alternative phrasing instead. The question content
// itself (competencies, question text, rubric anchors) is identical either
// way — interview questions are already addressed to the candidate, a
// manager just reads the same ones aloud.

type View = "candidate" | "employer";

const WEIGHT_STYLES: Record<string, string> = {
  critical: "bg-steel/20 text-navy",
  important: "bg-mist text-navy/80",
  "nice-to-have": "bg-mist text-navy/50",
};

export default function InterviewKitView({
  kit,
  view = "candidate",
  roleSlug,
  path = "public",
}: {
  kit: InterviewKit;
  view?: View;
  roleSlug?: string;
  /** Which pipeline generated this kit — controls whether the "+" expansion
   * feature allows employer-possessive language (jd path) or bans it
   * entirely (public path), same rule as the base generation. */
  path?: "public" | "jd";
}) {
  const isEmployer = view === "employer";

  return (
    <div className="space-y-8">
      <section>
        <h3 className="font-heading text-xl font-semibold text-navy">Competency map</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {kit.competency_map.map((c) => (
            <span
              key={c.competency}
              title={c.why_it_matters}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${WEIGHT_STYLES[c.weight] ?? WEIGHT_STYLES["nice-to-have"]}`}
            >
              {c.competency}
            </span>
          ))}
        </div>
      </section>

      {kit.sections.map((section) => (
        <KitSection key={section.stage} kit={kit} section={section} isEmployer={isEmployer} roleSlug={roleSlug} path={path} />
      ))}

      {!isEmployer && <ExpandKit kit={kit} path={path} />}

      <section className="rounded-2xl border border-navy/10 bg-white p-6">
        <h3 className="font-heading text-xl font-semibold text-navy">
          {isEmployer ? "Scorecard" : "How you'll be scored"}
        </h3>
        <div className="mt-4 space-y-4">
          {kit.how_youll_be_scored.map((d) => (
            <div key={d.dimension} className="rounded-xl border border-navy/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-navy">{d.dimension}</p>
                {isEmployer && (
                  <div className="flex gap-1.5 print:hidden">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span
                        key={n}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-navy/20 text-xs text-navy/60"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {(["1", "3", "5"] as const).map((n) => (
                  <div key={n} className="rounded-lg bg-mist p-3 text-sm text-navy/75">
                    <p className="font-semibold text-navy">{n} / 5</p>
                    <p className="mt-1">{d.anchors[n]}</p>
                  </div>
                ))}
              </div>
              {isEmployer && (
                <div className="mt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-navy/50">Notes</p>
                  <div className="mt-1 h-12 rounded-lg border border-dashed border-navy/20 print:h-16" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-steel/40 bg-steel/[0.08] p-6">
        <h3 className="font-heading text-xl font-semibold text-navy">
          {isEmployer ? `Compliance in ${kit.region.state}` : `Know your rights in ${kit.region.state}`}
        </h3>
        <p className="mt-1 text-xs text-navy/50">
          Not legal advice — verify anything specific with {kit.region.state}&apos;s labor office before relying on
          it.{" "}
          <Link href={`/interview-rights/${stateToSlug(kit.region.state)}`} className="font-medium text-steel hover:text-navy">
            Full {kit.region.state} rights guide →
          </Link>
        </p>
        <div className="mt-4 space-y-3">
          {kit.your_rights.cannot_be_asked.map((item) => (
            <div key={item.question} className="rounded-xl bg-white p-4 text-sm">
              <p className="text-navy/50 line-through">
                <span className="sr-only">Prohibited question: </span>
                {item.question}
              </p>
              <p className="mt-1 text-navy/70">{item.why}</p>
              {isEmployer ? (
                <p className="mt-1 font-medium text-navy">Ask this instead: {item.lawful_alternative}</p>
              ) : (
                <p className="mt-1 font-medium text-navy">If you&apos;re asked this: {item.how_to_respond}</p>
              )}
              <p className="mt-2 text-xs text-navy/40">Source: {item.source.label}</p>
            </div>
          ))}
        </div>
        {kit.your_rights.state_specific.length > 0 && (
          <ul className="mt-4 space-y-2 text-sm text-navy/70">
            {kit.your_rights.state_specific.map((note) => (
              <li key={note.text} className="list-disc pl-4 marker:text-navy/30">
                {note.text}
                <span className="block text-xs text-navy/40">Source: {note.source.label}</span>
              </li>
            ))}
          </ul>
        )}
        {kit.your_rights.legally_confused.length > 0 && (
          <div className="mt-5 border-t border-navy/10 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-navy/50">Often assumed illegal — but isn&apos;t</p>
            <div className="mt-3 space-y-3">
              {kit.your_rights.legally_confused.map((item) => (
                <div key={item.question} className="rounded-xl bg-white p-4 text-sm">
                  <p className="font-medium text-navy">{item.question}</p>
                  <p className="mt-1 text-navy/70">{item.why}</p>
                  <p className="mt-1 text-navy/70">{item.guidance}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {!isEmployer && (
        <section className="rounded-2xl border border-navy/10 bg-white p-6">
          <h3 className="font-heading text-xl font-semibold text-navy">Prep before you go in</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-navy">Think through these before the interview</p>
              <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm text-navy/70">
                {kit.prep.star_prompts.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-navy">Questions to ask them</p>
              <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm text-navy/70">
                {kit.prep.questions_to_ask_them.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          {kit.prep.likely_skills_tests.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-navy">You may also be tested on</p>
              <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm text-navy/70">
                {kit.prep.likely_skills_tests.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
