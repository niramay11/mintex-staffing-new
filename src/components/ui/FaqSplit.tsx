import { ButtonLink } from "@/components/ui/Button";
import IndustryAccordion from "@/components/industries/IndustryAccordion";

// Two-column FAQ block: heading, intro and CTA on the left, accordion on the
// right; stacks on mobile. Render inside the page's own section wrapper.
export default function FaqSplit({
  eyebrow = "FAQ",
  title,
  intro = "Answers to the questions we hear most. Don't see yours? Our team is happy to help.",
  cta = { href: "/contact", label: "Talk to our team" },
  items,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  cta?: { href: string; label: string };
  items: { question: string; answer: string }[];
}) {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
      {/* Sticky only takes effect where no ancestor clips overflow (the
          homepage); inside <Section> it's a harmless no-op. */}
      <div className="lg:sticky lg:top-32 lg:self-start">
        <p className="text-[14.5px] font-semibold uppercase tracking-[0.14em] text-steel dark:text-steel-light">
          {eyebrow}
        </p>
        <h2 className="mt-3.5 font-heading text-[32px] font-bold leading-tight text-navy sm:text-[36px] dark:text-cream">
          {title}
        </h2>
        <p className="mt-4 max-w-sm text-[17px] leading-relaxed text-steel dark:text-steel-light">{intro}</p>
        <div className="mt-8">
          <ButtonLink href={cta.href} variant="primary">
            {cta.label}
          </ButtonLink>
        </div>
      </div>
      <div className="lg:pt-2">
        <IndustryAccordion items={items} wideAnswers />
      </div>
    </div>
  );
}
