import Link from "next/link";
import type { Industry } from "@/content/types";

export default function IndustryCard({ industry }: { industry: Industry }) {
  return (
    <Link
      href={`/industries/${industry.slug}`}
      className="group flex flex-col justify-between rounded-lg border border-navy/10 bg-white p-6 transition-shadow hover:shadow-lg"
    >
      <div>
        <h3 className="text-lg font-semibold text-navy">{industry.name}</h3>
        <p className="mt-2 text-sm text-navy/70">{industry.intro}</p>
      </div>
      <span className="mt-4 text-sm font-semibold text-steel group-hover:text-navy">
        Explore roles &rarr;
      </span>
    </Link>
  );
}
