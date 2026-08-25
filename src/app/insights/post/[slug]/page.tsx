import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Section from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { getInsightCategories } from "@/components/insights/InsightsListing";
import { supabase } from "@/lib/supabase";
import type { InsightPost } from "@/content/types";
import { pageMetadata } from "@/lib/pageMetadata";
import { SITE_URL } from "@/lib/site";

export const revalidate = 60;

// Post bodies are plain paragraph arrays, but longer articles embed structure
// via a few plain-text conventions the admin authors write directly:
//   "1. A short line with no closing punctuation"  -> subheading
//   "→ A short line"                                -> CTA button
//   "Sources: ..." / a short "...legal advice" line -> footnote
// Short simple posts contain none of these, so they render as plain prose —
// this only upgrades posts that already carry that structure.
function isCtaLine(text: string): boolean {
  return /^→\s*/.test(text.trim());
}
function isSourcesLine(text: string): boolean {
  return /^Sources:/i.test(text.trim());
}
function isDisclaimerLine(text: string): boolean {
  return text.length < 220 && /(legal advice|financial advice|informational purposes only)/i.test(text);
}
function isHeadingLine(text: string): boolean {
  const t = text.trim();
  if (!t || t.length > 70 || isCtaLine(t) || isSourcesLine(t)) return false;
  return !/[.!,;:]$/.test(t);
}

// The admin's "Sources" section (a repeatable label+URL list, not a rich-text
// editor) serializes each entry as "[label](url)" into the Sources: line —
// this turns that markdown-lite syntax back into real, clickable links.
function renderInlineLinks(text: string) {
  const parts: Array<string | { label: string; url: string }> = [];
  const linkRe = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = linkRe.exec(text))) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    parts.push({ label: match[1], url: match[2] });
    lastIndex = linkRe.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));

  return parts.map((part, i) =>
    typeof part === "string" ? (
      <span key={i}>{part}</span>
    ) : (
      <a
        key={i}
        href={part.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline decoration-blue-600/50 underline-offset-2 hover:text-blue-700 hover:decoration-blue-700 dark:text-blue-400 dark:decoration-blue-400/50 dark:hover:text-blue-300 dark:hover:decoration-blue-300"
      >
        {part.label}
      </a>
    )
  );
}

const CTA_ROUTES: Array<{ test: RegExp; href: string }> = [
  { test: /hiring cost calculator/i, href: "/resources/hiring-cost-calculator" },
  { test: /interview (kit|question|prep)/i, href: "/resources/ai-interview-generator" },
];
function resolveCtaHref(text: string): string {
  return CTA_ROUTES.find((r) => r.test.test(text))?.href ?? "/insights";
}

const SHARE_ICON_DEFS = [
  {
    key: "facebook",
    label: "Share on Facebook",
    fill: true,
    path: "M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.91c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.45 2.91h-2.33v7.03C18.34 21.21 22 17.06 22 12.06Z",
    hrefFor: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    key: "linkedin",
    label: "Share on LinkedIn",
    fill: true,
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.114 20.452H3.558V9h3.556v11.452z",
    hrefFor: (url: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    key: "x",
    label: "Share on X",
    fill: true,
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
    hrefFor: (url: string, title: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    key: "email",
    label: "Share via email",
    fill: false,
    path: "M4 6.5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z M3.5 7.5l8.5 6 8.5-6",
    hrefFor: (url: string, title: string) => `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
  },
];

function ShareIcons({ postUrl, title }: { postUrl: string; title: string }) {
  return (
    <div className="flex items-center gap-4">
      {SHARE_ICON_DEFS.map((icon) => (
        <a
          key={icon.key}
          href={icon.hrefFor(postUrl, title)}
          target={icon.key === "email" ? undefined : "_blank"}
          rel="noopener noreferrer"
          aria-label={icon.label}
          className="text-navy/70 transition-colors hover:text-navy dark:text-cream/60 dark:hover:text-cream"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            {...(icon.fill
              ? { fill: "currentColor" }
              : { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const })}
          >
            <path d={icon.path} />
          </svg>
        </a>
      ))}
    </div>
  );
}

async function getInsightBySlug(slug: string): Promise<InsightPost | null> {
  const { data } = await supabase.from("insights").select("*").eq("slug", slug).maybeSingle();
  return (data as InsightPost | null) ?? null;
}

async function getRelatedInsights(category: string, excludeSlug: string): Promise<InsightPost[]> {
  const { data } = await supabase
    .from("insights")
    .select("*")
    .eq("category", category)
    .neq("slug", excludeSlug)
    .order("published_at", { ascending: false })
    .limit(3);
  return (data ?? []) as InsightPost[];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getInsightBySlug(slug);
  if (!post) return {};

  return pageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/insights/post/${post.slug}`,
  });
}

export default async function InsightPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getInsightBySlug(slug);
  if (!post) notFound();

  const [categories, related] = await Promise.all([
    getInsightCategories(),
    getRelatedInsights(post.category, post.slug),
  ]);
  const categoryLabel = categories.find((c) => c.slug === post.category)?.label ?? post.category;

  const wordCount = post.body.join(" ").trim().split(/\s+/).filter(Boolean).length;
  const readingMinutes = Math.max(1, Math.round(wordCount / 200));
  const postUrl = `${SITE_URL}/insights/post/${post.slug}`;
  const publishedLabel = new Date(post.published_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const mainLines = post.body.filter((p) => !isSourcesLine(p) && !isDisclaimerLine(p));
  const footnoteLines = post.body.filter((p) => isSourcesLine(p) || isDisclaimerLine(p));
  const tocItems = mainLines.map((text, i) => ({ text, i })).filter(({ text }) => isHeadingLine(text));
  const firstHeadingIndex = tocItems[0]?.i;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Insights", item: `${SITE_URL}/insights` },
      { "@type": "ListItem", position: 3, name: post.title, item: postUrl },
    ],
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: new Date(post.published_at).toISOString(),
    dateModified: new Date(post.published_at).toISOString(),
    author: {
      "@type": "Person",
      name: post.author,
      ...(post.author_title ? { jobTitle: post.author_title } : {}),
    },
    publisher: { "@id": `${SITE_URL}/#business` },
    ...(post.image_url ? { image: post.image_url } : {}),
    mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
  };

  return (
    <>
      <script
        id="insight-breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        id="insight-article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <Section background="mist" id="top" className="!py-10 sm:!py-12 lg:!py-14">
        <Link
          href="/insights"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-navy/60 transition-colors hover:text-navy dark:text-cream/60 dark:hover:text-cream"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <path d="M11 5 4 12l7 7M4 12h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Insights
        </Link>

        <h1 className="mt-4 font-heading text-4xl font-bold leading-tight text-navy dark:text-cream sm:text-5xl">
          {post.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold uppercase tracking-wide text-navy/60 dark:text-cream/60">
          <span>{publishedLabel}</span>
          <span aria-hidden="true">&middot;</span>
          <span>By {post.author}</span>
          <span aria-hidden="true">&middot;</span>
          <span>{readingMinutes} min read</span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={`/insights/category/${post.category}`}
            className="rounded-full border border-steel/50 px-4 py-1.5 text-sm font-medium text-steel transition-colors hover:bg-steel/10 dark:border-steel-light/40 dark:text-steel-light dark:hover:bg-steel-light/10"
          >
            {categoryLabel}
          </Link>
        </div>

        <div className="mt-5">
          <ShareIcons postUrl={postUrl} title={post.title} />
        </div>
      </Section>

      <Section background="white" className="!pt-10 sm:!pt-12 lg:!pt-14">
        {post.image_url && (
          <div className="relative aspect-[2.5/1] w-full overflow-hidden rounded-2xl">
            <Image src={post.image_url} alt={post.title} fill priority className="object-cover" />
          </div>
        )}

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px] lg:gap-16">
          <div className="min-w-0 space-y-5 text-[16px] leading-[1.8] text-navy/80 dark:text-cream/80">
            {mainLines.map((paragraph, i) => {
              if (isCtaLine(paragraph)) {
                return (
                  <div key={i} className="!mt-8">
                    <Link
                      href={resolveCtaHref(paragraph)}
                      className="inline-flex items-center rounded-full bg-navy px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-navy-secondary dark:bg-steel dark:text-navy-950 dark:hover:bg-steel-light"
                    >
                      {paragraph.replace(/^→\s*/, "")}
                    </Link>
                  </div>
                );
              }
              if (isHeadingLine(paragraph)) {
                const heading = (
                  <h2
                    key={i}
                    id={`section-${i}`}
                    className="!mt-10 scroll-mt-28 font-heading text-2xl font-bold text-navy dark:text-cream sm:text-[28px]"
                  >
                    {paragraph}
                  </h2>
                );
                if (i !== firstHeadingIndex || tocItems.length < 2) return heading;
                return (
                  <div key={`toc-wrap-${i}`}>
                    <nav className="!mt-8 rounded-[32px] bg-steel/[0.08] p-8 dark:bg-steel/[0.12] sm:p-10">
                      <p className="font-heading text-lg font-bold text-navy dark:text-cream">{post.title}</p>
                      <ol className="mt-4 space-y-2.5">
                        {tocItems.map((item) => (
                          <li key={item.i}>
                            <a
                              href={`#section-${item.i}`}
                              className="text-steel underline decoration-steel/40 underline-offset-2 transition-colors hover:text-navy hover:decoration-navy/50 dark:text-steel-light dark:decoration-steel-light/40 dark:hover:text-cream"
                            >
                              {item.text}
                            </a>
                          </li>
                        ))}
                      </ol>
                    </nav>
                    {heading}
                  </div>
                );
              }
              return <p key={i}>{paragraph}</p>;
            })}

            {footnoteLines.length > 0 && (
              <div className="!mt-10 space-y-3 border-t border-navy/10 pt-6 text-sm leading-relaxed text-navy dark:border-white/10 dark:text-cream">
                {footnoteLines.map((line, i) => {
                  if (isSourcesLine(line)) {
                    const entries = line.replace(/^Sources:\s*/i, "").split(/\s*·\s*/).filter(Boolean);
                    return (
                      <div key={i} className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
                        <span className="font-semibold">Sources:</span>
                        {entries.map((entry, j) => (
                          <span key={j} className="inline-flex items-baseline">
                            {renderInlineLinks(entry)}
                            {j < entries.length - 1 && (
                              <span className="ml-1.5 text-navy/40 dark:text-cream/40">·</span>
                            )}
                          </span>
                        ))}
                      </div>
                    );
                  }
                  return (
                    <p key={i} className={isDisclaimerLine(line) ? "italic" : ""}>
                      {renderInlineLinks(line)}
                    </p>
                  );
                })}
              </div>
            )}

            {post.author_bio && (
              <div className="!mt-10 flex items-start gap-4 border-t border-navy/10 pt-8 dark:border-white/10">
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-navy/10 dark:bg-navy-800">
                  {post.author_photo_url ? (
                    <Image src={post.author_photo_url} alt={post.author} fill className="object-cover object-top" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center font-heading text-lg font-semibold text-navy/40 dark:text-cream/40">
                      {post.author.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("")}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-navy/50 dark:text-cream/50">About the author</p>
                  <p className="mt-1 font-semibold text-navy dark:text-cream">
                    {post.author}
                    {post.author_title && <span className="font-normal text-navy/60 dark:text-cream/60"> · {post.author_title}</span>}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-navy/70 dark:text-cream/70">{post.author_bio}</p>
                </div>
              </div>
            )}

            <div className="!mt-10">
              <ButtonLink href="/insights">&larr; Back to all Insights</ButtonLink>
            </div>
          </div>

          {related.length > 0 && (
            <aside>
              <p className="text-xs font-semibold uppercase tracking-wide text-navy/50 dark:text-cream/50">Related articles</p>
              <ul className="mt-4 space-y-4">
                {related.map((item) => (
                  <li key={item.slug}>
                    <Link href={`/insights/post/${item.slug}`} className="group flex gap-3">
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-mist dark:bg-navy-800">
                        {item.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-supplied URL
                          <img src={item.image_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-steel to-navy-secondary">
                            <span className="font-heading text-[10px] font-semibold uppercase tracking-wide text-white/70">
                              {categoryLabel}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-medium text-steel underline decoration-steel/30 underline-offset-2 group-hover:text-navy group-hover:decoration-navy/50 dark:text-steel-light dark:decoration-steel-light/30 dark:group-hover:text-cream">
                        {item.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      </Section>

      <Section background="white">
        <h2 className="font-heading text-2xl font-bold text-navy dark:text-cream sm:text-3xl">Ready to build your team?</h2>
        <p className="mt-3 max-w-2xl italic text-navy/70 dark:text-cream/70">
          Mintex connects you with vetted talent who can start fast — contract, temp-to-hire, or direct placement.
        </p>
        <div className="mt-6">
          <Link
            href="/seek-talent/get-started"
            className="inline-flex items-center rounded-full bg-navy px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-navy-secondary dark:bg-steel dark:text-navy-950 dark:hover:bg-steel-light"
          >
            Get Started
          </Link>
        </div>
        <div className="mt-6">
          <ShareIcons postUrl={postUrl} title={post.title} />
        </div>
      </Section>
    </>
  );
}
