import type { Metadata } from "next";
import Image from "next/image";
import Section from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <Section
      background="white"
      className="!py-20 text-center sm:!py-28"
      backgroundMedia={
        <span className="pointer-events-none absolute -right-20 top-1/2 hidden h-[300px] w-auto -translate-y-1/2 md:block lg:h-[380px]">
          <Image
            src="/mintex-m-navy.svg"
            alt=""
            aria-hidden="true"
            width={784}
            height={395}
            className="h-full w-auto select-none object-contain dark:hidden"
            style={{
              opacity: 0.25,
              maskImage: "linear-gradient(115deg, transparent 5%, black 90%)",
              WebkitMaskImage: "linear-gradient(115deg, transparent 5%, black 90%)",
            }}
          />
          <Image
            src="/mintex-m.svg"
            alt=""
            aria-hidden="true"
            width={784}
            height={395}
            className="hidden h-full w-auto select-none object-contain dark:block"
            style={{
              maskImage: "linear-gradient(115deg, transparent 5%, black 90%)",
              WebkitMaskImage: "linear-gradient(115deg, transparent 5%, black 90%)",
            }}
          />
        </span>
      }
    >
      <p className="font-heading text-[88px] font-bold leading-none text-steel dark:text-steel-light sm:text-[120px]">
        404
      </p>
      <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-steel" />
      <h1 className="mt-6 text-3xl font-bold text-navy dark:text-cream sm:text-4xl">Page not found</h1>
      <p className="mx-auto mt-4 max-w-md text-steel dark:text-steel-light">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
        <ButtonLink href="/" variant="primary">
          Back to Home
        </ButtonLink>
        <ButtonLink href="/contact" variant="secondary">
          Contact Us
        </ButtonLink>
      </div>
    </Section>
  );
}
