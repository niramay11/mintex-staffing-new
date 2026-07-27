import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Section from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { hiringServices, getHiringServiceBySlug } from "@/content/hiringServices";
import HiringInquiryForm from "@/components/forms/HiringInquiryForm";
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
                className={`flex flex-col items-center gap-6 lg:gap-10 ${imageFirst ? "lg:flex-row" : "lg:flex-row-reverse"}`}
              >
                <div
                  className="relative hidden flex-shrink-0 lg:block"
                  style={{ width: 240, height: 300 }}
                >
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      left: -22,
                      top: 0,
                      width: 240,
                      height: 300,
                      borderRadius: "14% / 22%",
                      backgroundColor: "rgba(0,48,96,0.2)",
                      zIndex: 0,
                    }}
                  />
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      right: -16,
                      top: -16,
                      width: 240,
                      height: 300,
                      borderRadius: "14% / 22%",
                      border: "4px solid #4a738c",
                      zIndex: 1,
                    }}
                  />
                  <div
                    className="relative overflow-hidden"
                    style={{
                      width: 240,
                      height: 300,
                      borderRadius: "14% / 22%",
                      boxShadow: "0 20px 45px -18px rgba(0,48,96,0.35)",
                      zIndex: 2,
                    }}
                  >
                    <Image
                      src={siteImages[`seek-talent-service:${slug}:point-${index + 1}-visual`]}
                      alt="Hiring team reviewing candidates together"
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
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section background="cream" className="relative overflow-hidden !py-12 sm:!py-14 lg:!py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-24 h-[360px] w-[360px] rounded-full bg-tan/20 blur-[110px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-28 -right-16 h-[380px] w-[380px] rounded-full bg-steel/20 blur-[120px]"
        />

        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] border border-navy/[0.06] bg-white p-7 shadow-[0_30px_70px_-25px_rgba(0,48,96,0.25)] sm:p-10">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-tan">Get in touch</p>
              <h3 className="mt-2 text-2xl font-bold text-navy sm:text-3xl">Connect with our experts</h3>
              <p className="mt-1.5 text-sm text-navy/70">
                Tell us what you need and we&apos;ll scope a search built around your team.
              </p>
              <div className="mt-7">
                <HiringInquiryForm />
              </div>
            </div>

            <div className="relative mx-auto hidden lg:block" style={{ width: 380, height: 475 }}>
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  right: -46,
                  top: 0,
                  width: 380,
                  height: 475,
                  borderRadius: "14% / 22%",
                  backgroundColor: "rgba(0,48,96,0.2)",
                  zIndex: 0,
                }}
              />
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: -30,
                  top: -30,
                  width: 380,
                  height: 475,
                  borderRadius: "14% / 22%",
                  border: "4px solid #4a738c",
                  zIndex: 1,
                }}
              />
              <div
                className="relative overflow-hidden"
                style={{
                  width: 380,
                  height: 475,
                  borderRadius: "14% / 22%",
                  boxShadow: "0 25px 55px -20px rgba(0,48,96,0.3)",
                  zIndex: 2,
                }}
              >
                <Image
                  src={siteImages[`seek-talent-service:${slug}:recruiter-visual`]}
                  alt="Recruiter ready to discuss your hiring needs"
                  fill
                  className="object-cover"
                />
              </div>

            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
