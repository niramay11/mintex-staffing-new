import type { Metadata } from "next";
import Section from "@/components/ui/Section";
import ContactForm from "@/components/forms/ContactForm";
import { pageMetadata } from "@/lib/pageMetadata";
import { BUSINESS } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Contact Us",
  description: "Get in touch with Mintex Staffing by phone, email, or contact form.",
  path: "/contact",
});

function IconPin({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function IconPhone({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 5a2 2 0 012-2h2.28a1 1 0 01.97.76l1.06 4.24a1 1 0 01-.5 1.11L7.1 10.24a11 11 0 006.66 6.66l1.13-1.7a1 1 0 011.11-.5l4.24 1.06a1 1 0 01.76.97V19a2 2 0 01-2 2h-1C10.4 21 3 13.6 3 4.5V5z"
      />
    </svg>
  );
}

function IconEnvelope({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l9 7 9-7" />
    </svg>
  );
}

function IconFax({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 9V4h8l3 3v2" />
      <rect x="3" y="9" width="18" height="8" rx="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="7" y="13" width="10" height="6" rx="0.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconArrowRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

const OFFICE_ADDRESS = "2163 Oak Tree Rd, Edison, NJ 08820";

const contactCards = [
  {
    label: "Our Office",
    detail: (
      <>
        2163 Oak Tree Rd
        <br />
        Edison, NJ 08820
      </>
    ),
    icon: IconPin,
  },
  {
    label: "Phone",
    detail: (
      <>
        <a href={`tel:${BUSINESS.telephone}`} className="hover:text-navy">{BUSINESS.telephoneDisplay}</a>
        <br />
        Mon - Fri: 9AM - 6PM
      </>
    ),
    icon: IconPhone,
  },
  {
    label: "Email",
    detail: <a href="mailto:info@mintexstaffing.com" className="hover:text-navy">info@mintexstaffing.com</a>,
    icon: IconEnvelope,
  },
  {
    label: "Fax",
    detail: "(908) 251-5038",
    icon: IconFax,
  },
];

export default function ContactPage() {
  return (
    <>
      <Section background="mist" className="!py-12 sm:!py-14 lg:!py-16">
        <h1 className="font-heading text-4xl font-bold text-navy sm:text-5xl">Contact Us</h1>
        <div className="mt-3 h-1 w-16 rounded-full bg-steel" />
        <p className="mt-4 max-w-2xl text-steel">
          Have a question or want to discuss your hiring needs?{" "}
          <br className="hidden sm:block" />
          We&apos;re here to help and will get back to you as soon as possible.
        </p>
      </Section>

      <Section background="white">
        <div className="grid items-start gap-6 lg:grid-cols-3">
          <div className="rounded-3xl bg-white p-7 shadow-[0_1px_3px_rgba(0,48,96,0.05)] sm:p-8">
            <h2 className="text-2xl font-bold text-navy">Get in Touch</h2>
            <div className="mt-2 h-1 w-12 rounded-full bg-steel" />
            <p className="mt-3 text-sm text-navy/70">
              Reach out to us through any of the following ways.
            </p>

            <div className="mt-6 space-y-4">
              {contactCards.map(({ label, detail, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-4 rounded-2xl bg-mist p-5 shadow-[0_1px_3px_rgba(0,48,96,0.05)]"
                >
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-navy text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="font-semibold text-navy">{label}</div>
                    <div className="mt-0.5 text-sm text-navy/70">{detail}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-navy/10">
              <iframe
                title={`Mintex Staffing office location — ${OFFICE_ADDRESS}`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(OFFICE_ADDRESS)}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block h-[220px] w-full border-0"
              />
            </div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(OFFICE_ADDRESS)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-steel"
            >
              Get Directions
              <IconArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="rounded-3xl bg-white p-7 shadow-[0_1px_3px_rgba(0,48,96,0.05)] sm:p-10 lg:col-span-2">
            <h2 className="text-2xl font-bold text-navy">Send Us a Message</h2>
            <div className="mt-2 h-1 w-12 rounded-full bg-steel" />
            <p className="mt-3 text-sm text-navy/70">
              Fill out the form below and our team will get back to you.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
