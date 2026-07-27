import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { getSiteImages } from "@/lib/siteImages";
import { pageMetadata } from "@/lib/pageMetadata";

export const metadata: Metadata = pageMetadata({
  title: "About Us",
  description:
    "We connect exceptional talent with leading employers and build lasting partnerships across the United States.",
  path: "/about",
});

function IconShield({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconBolt({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M13 3 4 14h6l-1 7 9-11h-6l1-7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function IconPartnership({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="9" cy="12" r="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="15" cy="12" r="5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function IconTarget({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="0.9" fill="currentColor" />
    </svg>
  );
}

const highlights = [
  { value: "14K+", label: "Placements" },
  { value: "93%", label: "Client Retention" },
  { value: "9+", label: "Industries" },
  { value: "9 Days", label: "Avg. Time to Hire" },
];

const values = [
  {
    icon: IconShield,
    title: "Integrity",
    description: "We do the right thing. Always transparent and reliable.",
  },
  {
    icon: IconBolt,
    title: "Speed",
    description: "We move fast to deliver the right talent when you need them.",
  },
  {
    icon: IconPartnership,
    title: "Partnership",
    description: "Your success is our priority. We work as your partner.",
  },
  {
    icon: IconTarget,
    title: "Quality",
    description: "We focus on quality candidates and the right fit for your team.",
  },
];

export default async function AboutPage() {
  const siteImages = await getSiteImages();

  return (
    <>
      {/* Hero — flat, edge-to-edge */}
      <section className="bg-mist">
        <div className="grid lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-stretch">
          <div className="flex flex-col justify-center px-6 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24 xl:px-24">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-navy/60">
              <Link href="/" className="font-medium text-navy transition-colors hover:text-tan">
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <span>About Us</span>
            </nav>
            <h1 className="mt-5 font-heading text-[44px] font-bold leading-[1.05] text-navy sm:text-[56px] lg:text-[64px]">
              About Us
            </h1>
            <span aria-hidden="true" className="mt-4 block h-1.5 w-20 rounded-full bg-tan" />
            <p className="mt-5 max-w-md text-lg leading-relaxed text-steel">
              We connect exceptional talent with leading employers and build lasting
              partnerships across the United States.
            </p>
          </div>

          <div className="relative mx-6 mb-2 aspect-[4/3] overflow-hidden rounded-2xl shadow-[0_20px_45px_-20px_rgba(0,48,96,0.25)] sm:mx-10 sm:aspect-[16/10] lg:mx-0 lg:mb-0 lg:aspect-auto lg:min-h-[480px] lg:overflow-visible lg:rounded-none lg:shadow-none xl:min-h-[560px]">
            <Image
              src={siteImages["about:hero-visual"]}
              alt="Mintex Staffing office"
              fill
              preload
              quality={95}
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-cover lg:[mask-image:linear-gradient(to_right,transparent_0%,black_22%)] lg:[-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_22%)]"
              style={{
                objectPosition: "85% 42%",
              }}
            />
          </div>
        </div>
      </section>

      {/* Highlights strip */}
      <section className="border-y border-navy/[0.06] bg-white">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-3 px-6 py-7 sm:px-10 sm:gap-4 lg:px-16">
          {highlights.map((item) => (
            <span
              key={item.label}
              className="inline-flex items-center gap-2 rounded-full border border-navy/10 bg-mist px-4 py-2 text-[13.5px] text-navy/70"
            >
              <span className="font-heading font-semibold text-navy">{item.value}</span>
              {item.label}
            </span>
          ))}
        </div>
      </section>

      {/* Our Story */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 lg:px-16 lg:py-24">
          <div className="grid items-center gap-14 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-tan">
                Our Story
              </p>
              <h2 className="mt-2.5 font-heading text-3xl font-bold leading-tight text-navy sm:text-4xl">
                Built on People. Driven by Purpose.
              </h2>
              <div className="mt-5 space-y-4 text-[15.5px] leading-relaxed text-steel">
                <p>Mintex Staffing was founded with a simple belief: great people drive great companies.</p>
                <p>
                  Since our beginning, we&apos;ve focused on connecting exceptional talent with the
                  right opportunities.
                </p>
                <p>
                  Today, we partner with organizations across the U.S. to deliver staffing
                  solutions that help them grow, adapt, and succeed.
                </p>
              </div>
              <div className="mt-8">
                <ButtonLink
                  href="/contact"
                  variant="primary"
                  className="!bg-navy !text-white hover:!bg-navy-deep"
                >
                  Learn More About Us
                </ButtonLink>
              </div>
            </div>

            <div className="relative mx-auto aspect-[4/3] w-full max-w-[480px] overflow-hidden rounded-2xl shadow-[0_25px_55px_-20px_rgba(0,48,96,0.35)]">
              <Image
                src={siteImages["about:story-visual"]}
                alt="Mintex Staffing recruiter greeting a candidate"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="border-t border-navy/[0.06] bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 lg:px-16 lg:py-24">
          <div className="flex items-center justify-center gap-4">
            <span aria-hidden="true" className="h-px flex-1 bg-navy/10" />
            <p className="flex-shrink-0 text-[13px] font-semibold uppercase tracking-[0.14em] text-tan">
              Our Values
            </p>
            <span aria-hidden="true" className="h-px flex-1 bg-navy/10" />
          </div>

          <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div key={value.title}>
                <value.icon className="h-8 w-8 text-navy" />
                <h3 className="mt-4 font-heading text-lg font-semibold text-navy">{value.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-steel">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
