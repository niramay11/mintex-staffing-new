import type { Metadata } from "next";
import Section from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <Section background="navy" className="!py-20 text-center sm:!py-28">
      <p className="font-heading text-[88px] font-bold leading-none text-tan-light sm:text-[120px]">
        404
      </p>
      <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-tan" />
      <h1 className="mt-6 text-3xl font-bold sm:text-4xl">Page not found</h1>
      <p className="mx-auto mt-4 max-w-md text-white/80">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
        <ButtonLink href="/" variant="primary">
          Back to Home
        </ButtonLink>
        <ButtonLink href="/contact" variant="outline">
          Contact Us
        </ButtonLink>
      </div>
    </Section>
  );
}
