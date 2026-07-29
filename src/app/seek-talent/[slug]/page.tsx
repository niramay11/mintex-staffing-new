import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Section from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { hiringServices, getHiringServiceBySlug } from "@/content/hiringServices";
import { getSiteImages } from "@/lib/siteImages";
import { pageMetadata } from "@/lib/pageMetadata";

export function generateStaticParams() {
  return hiringServices.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getHiringServiceBySlug(slug);
  if (!service) return {};

  return pageMetadata({
    title: service.name,
    description: service.tagline,
    path: `/seek-talent/${service.slug}`,
  });
}

function IconArrowLeft({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M19 12H5m0 0 6-6m-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M20 7 9 18l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconArrowRight({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconBadge({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 13.5 7.5 21l4.5-2.5 4.5 2.5-1.5-7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconHeadset({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 13v-1a8 8 0 0 1 16 0v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="3" y="13" width="4" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <rect x="17" y="13" width="4" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M21 19v1a3 3 0 0 1-3 3h-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

const pointIcons = [IconBadge, IconPeople, IconHeadset, IconCheck];

function IconPeople({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H4v-2a4 4 0 0 1 3-3.87m5-3.13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 3a4 4 0 0 0-3-3.87"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default async function HiringServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getHiringServiceBySlug(slug);
  if (!service) notFound();

  const siteImages = await getSiteImages();
  const Icon = service.icon;
  const accentText = service.accent === "tan" ? "text-tan" : "text-steel";
  const accentBg = service.accent === "tan" ? "bg-tan/15" : "bg-steel/15";

  return (
    <>
      <Section background="navy" className="relative !py-12 sm:!py-14 lg:!py-16">
        <Link
          href="/seek-talent"
          className="flex w-fit items-center gap-1.5 text-sm font-medium text-white/60 transition-colors hover:text-white"
        >
          <IconArrowLeft className="h-4 w-4" />
          Seek Talent
        </Link>

        <div className="mt-6 flex w-fit items-center gap-2.5 rounded-full border border-tan-light/35 bg-tan/[0.14] px-4 py-2 text-[13px] font-medium text-tan-light">
          <Icon className="h-4 w-4 flex-shrink-0" />
          {service.badge}
        </div>
        <h1 className="mt-5 text-4xl font-bold sm:text-5xl">{service.name}</h1>
        <p className="mt-4 max-w-2xl text-white/80">{service.intro}</p>
        <div className="mt-8 flex flex-wrap gap-3.5">
          <ButtonLink href="/contact" variant="primary" className="inline-flex items-center gap-2">
            Discuss your hiring needs
            <IconArrowRight className="h-4 w-4" />
          </ButtonLink>
          <ButtonLink href="/seek-talent" variant="outline" className="inline-flex items-center gap-2">
            See all services
            <IconArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>
      </Section>

      <Section background="cream" className="!py-12 sm:!py-14 lg:!py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-tan">Why choose us</p>
          <h2 className="mt-2.5 text-3xl font-bold text-navy sm:text-4xl">What&apos;s included</h2>
        </div>

        <div className="mx-auto mt-10 max-w-5xl space-y-10 lg:space-y-14">
          {service.points.map((point, index) => {
            const PointIcon = pointIcons[index % pointIcons.length];
            const imageFirst = index % 2 === 0;
            return (
              <div
                key={point.title}
                className={`flex flex-col items-center gap-6 lg:items-start lg:gap-10 ${imageFirst ? "lg:flex-row" : "lg:flex-row-reverse"}`}
              >
                <div className="relative hidden flex-shrink-0 lg:block" style={{ width: 320 }}>
                  <div
                    aria-hidden="true"
                    className="absolute -inset-3 rounded-[2rem] border border-navy/10"
                  />
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] shadow-[0_20px_45px_-20px_rgba(0,48,96,0.25)]">
                    <Image
                      src={siteImages[`seek-talent-service:${slug}:point-${index + 1}-visual`]}
                      alt={`Mintex Staffing recruiters reviewing candidates for ${service.name.toLowerCase()} placements`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                <div className="group flex w-full flex-1 gap-4 rounded-2xl border border-navy/[0.08] bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-tan/40 hover:shadow-[0_20px_45px_-20px_rgba(0,48,96,0.3)]">
                  <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${accentBg} ${accentText}`}>
                    <PointIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-navy">{point.title}</h3>
                    <p className="mt-1 text-sm text-navy/70">{point.description}</p>
                    {index === service.points.length - 1 && (
                      <ButtonLink
                        href="/seek-talent/get-started"
                        variant="primary"
                        className="mt-4 inline-flex items-center gap-2"
                      >
                        Get started
                        <IconArrowRight className="h-4 w-4" />
                      </ButtonLink>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>
    </>
  );
}
