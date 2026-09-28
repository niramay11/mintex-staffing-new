import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Section from "@/components/ui/Section";
import { getInsightCategories } from "@/components/insights/InsightsListing";
import InsightImage from "@/components/insights/InsightImage";
import { supabase } from "@/lib/supabase";
import type { InsightPost } from "@/content/types";
import { pageMetadata } from "@/lib/pageMetadata";
import { SITE_URL } from "@/lib/site";
import { resolveCtaHref } from "@/lib/insightCtaRoutes";

export const revalidate = 60;

// Post bodies are plain paragraph arrays, but longer articles embed structure
// via a few plain-text conventions the admin authors write directly:
//   "1. A short line with no closing punctuation"  -> subheading
//   "→ A short line"                                -> CTA button
//   "Sources: ..." / a short "...legal advice" line -> footnote
// Short simple posts contain none of these, so they render as plain prose —
// this only upgrades posts that already carry that structure.
function isCtaLine(text: string): boolean {
  return /^(→|->)\s*/.test(text.trim());
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

// Posts written with the rich-text editor store real sanitized HTML in
// body_html instead of the plain-paragraph convention array. The h2 tags it
// contains have no ids (Tiptap doesn't add them) — this stamps sequential
// ids onto them for anchor scrolling and pulls out the same list to build
// the table of contents, mirroring what the legacy path derives from
// isHeadingLine.
function prepareRichBody(html: string): { html: string; tocItems: { id: string; text: string }[] } {
  // Some post bodies (pasted from Word/Docs) carry a literal <h1> — the page
  // already renders the real <h1> (the post title) above, so a surviving
  // <h1> in the body would give the page two. Same fix already applied to
  // job descriptions in components/jobs/utils.ts (demoteDescriptionHeadings).
  const demoted = html.replace(/<(\/?)h1(\s|>)/gi, "<$1h2$2");
  let i = 0;
  const tocItems: { id: string; text: string }[] = [];
  const withIds = demoted.replace(/<h2>([\s\S]*?)<\/h2>/g, (_match, inner: string) => {
    const id = `section-${i++}`;
    tocItems.push({ id, text: inner.replace(/<[^>]+>/g, "").trim() });
    return `<h2 id="${id}">${inner}</h2>`;
  });
  return { html: withIds, tocItems };
}

const RICH_BODY_CLASSNAME =
  "[&_h2]:!mt-10 [&_h2]:scroll-mt-28 [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-navy dark:[&_h2]:text-cream [&_h2]:sm:text-[28px] " +
  "[&_h3]:!mt-8 [&_h3]:font-heading [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-navy dark:[&_h3]:text-cream " +
  "[&_p]:!mt-5 [&_ul]:!mt-5 [&_ol]:!mt-5 [&_blockquote]:!mt-5 " +
  "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 " +
  "[&_blockquote]:border-l-4 [&_blockquote]:border-steel/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-navy/70 dark:[&_blockquote]:text-cream/70 " +
  "[&_hr]:!my-8 [&_hr]:border-navy/10 dark:[&_hr]:border-white/10 " +
  "[&_strong]:font-semibold [&_strong]:text-navy dark:[&_strong]:text-cream " +
  "[&_a]:text-blue-600 [&_a]:underline [&_a]:decoration-blue-600/50 [&_a]:underline-offset-2 hover:[&_a]:text-blue-700 dark:[&_a]:text-blue-400 " +
  "[&_a.cta-button]:!mt-8 [&_a.cta-button]:inline-flex [&_a.cta-button]:items-center [&_a.cta-button]:rounded-full [&_a.cta-button]:bg-navy [&_a.cta-button]:px-8 [&_a.cta-button]:py-4 [&_a.cta-button]:text-base [&_a.cta-button]:font-semibold [&_a.cta-button]:text-white [&_a.cta-button]:no-underline hover:[&_a.cta-button]:bg-navy-secondary dark:[&_a.cta-button]:bg-steel dark:[&_a.cta-button]:text-navy-950";

// The article is laid out as numbered sections (big sticky "01 / 02 / 03"
// on the left, heading + body on the right), split at the post's own
// sub-headings. Content before the first sub-heading becomes the intro.
type ArticleSection =
  | { kind: "html"; id: string; heading: string; html: string }
  | { kind: "lines"; id: string; heading: string; lines: string[] };

function splitRichSections(html: string): { introHtml: string; sections: ArticleSection[] } {
  // split() with capture groups yields [intro, id, heading, body, id, heading, body, ...]
  const parts = html.split(/<h2 id="(section-\d+)">([\s\S]*?)<\/h2>/);
  const sections: ArticleSection[] = [];
  for (let i = 1; i < parts.length; i += 3) {
    sections.push({
      kind: "html",
      id: parts[i],
      heading: (parts[i + 1] ?? "").replace(/<[^>]+>/g, "").trim(),
      html: parts[i + 2] ?? "",
    });
  }
  return { introHtml: parts[0] ?? "", sections };
}

// Authors often number their own sub-headings ("1. The supply peaks…"),
// which would read "01 / 1. The supply peaks…" next to the big section
// number — drop that leading "1." / "1)" from the displayed heading.
function stripHeadingNumber(heading: string): string {
  return heading.replace(/^\s*\d{1,2}\s*[.)]\s+/, "").trim() || heading;
}

function splitLineSections(lines: string[]): { introLines: string[]; sections: ArticleSection[] } {
  const introLines: string[] = [];
  const sections: { kind: "lines"; id: string; heading: string; lines: string[] }[] = [];
  lines.forEach((line, i) => {
    if (isHeadingLine(line)) sections.push({ kind: "lines", id: `section-${i}`, heading: line, lines: [] });
    else if (sections.length === 0) introLines.push(line);
    else sections[sections.length - 1].lines.push(line);
  });
  return { introLines, sections };
}

function ArticleLines({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((paragraph, i) =>
        isCtaLine(paragraph) ? (
          <div key={i} className="!mt-8">
            <Link
              href={resolveCtaHref(paragraph)}
              className="inline-flex items-center rounded-full bg-navy px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-navy-secondary dark:bg-steel dark:text-navy-950 dark:hover:bg-steel-light"
            >
              {paragraph.replace(/^(→|->)\s*/, "")}
            </Link>
          </div>
        ) : (
          <p key={i}>{paragraph}</p>
        )
      )}
    </>
  );
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

// Confirmed live: one post's excerpt field was literally the placeholder
// string "NA" — pageMetadata() happily used it as-is, giving that page a
// 2-character search-result description. Same class of problem as
// hasSubstantiveDescription in components/jobs/utils.ts (a Ceipal job
// description that's really just a pasted-in title, non-empty but not
// real content) — falls back to a real snippet pulled from the post's own
// body instead of trusting whatever landed in the excerpt field.
function resolvePostDescription(post: InsightPost): string {
  const excerpt = (post.excerpt || "").trim();
  const isPlaceholder = /^(n\/?a|tbd|todo|placeholder|coming soon)$/i.test(excerpt);
  const plainBody =
    post.body.join(" ").trim() ||
    (post.body_html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  if (excerpt && !isPlaceholder && excerpt.length >= 30) {
    if (excerpt.length >= 110 || !plainBody) return excerpt;
    // A real but short excerpt (e.g. 78 chars) is still flagged as "meta
    // description too short" — top it up with the opening of the body;
    // pageMetadata() then trims the result to ~155 chars at a word boundary.
    return `${excerpt}${/[.!?…]$/.test(excerpt) ? "" : "."} ${plainBody}`;
  }

  return plainBody.slice(0, 155).trim();
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
    description: resolvePostDescription(post),
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

  const hasRichBody = Boolean(post.body_html && post.body_html.trim());
  const richBody = hasRichBody ? prepareRichBody(post.body_html as string) : null;

  const wordCount = hasRichBody
    ? (post.body_html as string).replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length
    : post.body.join(" ").trim().split(/\s+/).filter(Boolean).length;
  const readingMinutes = Math.max(1, Math.round(wordCount / 200));
  const postUrl = `${SITE_URL}/insights/post/${post.slug}`;
  const publishedLabel = new Date(post.published_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const mainLines = post.body.filter((p) => !isSourcesLine(p) && !isDisclaimerLine(p));
  const footnoteLines = post.body.filter((p) => isSourcesLine(p) || isDisclaimerLine(p));

  const rich = richBody ? splitRichSections(richBody.html) : null;
  const legacy = rich ? null : splitLineSections(mainLines);
  let sections: ArticleSection[] = rich ? rich.sections : legacy!.sections;
  let introHtml = rich ? rich.introHtml.trim() : "";
  let introLines = legacy ? legacy.introLines : [];
  // A short post with no sub-headings still gets one numbered section
  // instead of an unnumbered wall of text.
  if (sections.length === 0) {
    sections = rich
      ? [{ kind: "html", id: "section-0", heading: "Overview", html: introHtml }]
      : [{ kind: "lines", id: "section-0", heading: "Overview", lines: introLines }];
    introHtml = "";
    introLines = [];
  }
  const hasIntro = Boolean(introHtml) || introLines.length > 0;

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
    description: resolvePostDescription(post),
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

        <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13.5px] font-semibold uppercase tracking-wide text-navy/60 dark:text-cream/60">
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

      {/* Numbered sections. overflow-visible: Section clips by default,
          which would break the sticky section numbers. */}
      <Section background="white" className="!overflow-visible !pt-10 sm:!pt-12 lg:!pt-14">
        {post.image_url && (
          <div className="relative mb-16 aspect-[2.5/1] w-full overflow-hidden rounded-2xl lg:mb-24">
            <InsightImage src={post.image_url} alt={post.title} sizes="(min-width: 1920px) 1792px, 100vw" priority />
          </div>
        )}

        {hasIntro && (
          <div className="mb-16 lg:mb-24 lg:grid lg:grid-cols-12 lg:gap-10">
            <div className="min-w-0 lg:col-span-8 lg:col-start-4">
              {introHtml ? (
                <div
                  className={`text-[19px] leading-[1.7] text-navy/80 sm:text-[21px] dark:text-cream/80 ${RICH_BODY_CLASSNAME}`}
                  dangerouslySetInnerHTML={{ __html: introHtml }}
                />
              ) : (
                <div className="space-y-5 text-[19px] leading-[1.7] text-navy/80 sm:text-[21px] dark:text-cream/80">
                  <ArticleLines lines={introLines} />
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-20 lg:space-y-32">
          {sections.map((section, index) => (
            <section key={section.id} id={section.id} className="scroll-mt-28 lg:grid lg:grid-cols-12 lg:gap-10">
              <div className="lg:col-span-3">
                <span
                  aria-hidden="true"
                  className="block font-heading text-[72px] font-bold leading-[0.85] text-navy sm:text-[96px] lg:sticky lg:top-28 lg:text-[150px] xl:text-[170px] dark:text-cream"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="mt-6 min-w-0 border-t-[3px] border-navy pt-7 lg:col-span-9 lg:mt-0 dark:border-cream">
                <div className="md:grid md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.6fr)] md:gap-10">
                  <div className="md:sticky md:top-28 md:self-start">
                    <h2 className="font-heading text-[28px] font-bold leading-[1.1] text-navy sm:text-[32px] dark:text-cream">
                      {stripHeadingNumber(section.heading)}
                    </h2>
                    <p className="mt-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-navy/50 dark:text-cream/50">
                      Part {index + 1} of {sections.length}
                    </p>
                  </div>
                  <div className="mt-6 min-w-0 space-y-5 text-[16.5px] leading-[1.8] text-navy/70 md:mt-0 dark:text-cream/70">
                    {section.kind === "html" ? (
                      <div className={RICH_BODY_CLASSNAME} dangerouslySetInnerHTML={{ __html: section.html }} />
                    ) : (
                      <ArticleLines lines={section.lines} />
                    )}
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>

        {(footnoteLines.length > 0 || post.author_bio || related.length > 0) && (
          <div className="mt-20 lg:mt-28 lg:grid lg:grid-cols-12 lg:gap-10">
            <div className="min-w-0 space-y-10 lg:col-span-9 lg:col-start-4">
              {footnoteLines.length > 0 && (
                <div className="space-y-3 border-t border-navy/15 pt-6 text-sm leading-relaxed text-navy dark:border-white/15 dark:text-cream">
                  {footnoteLines.map((line, i) => {
                    if (isSourcesLine(line)) {
                      const entries = line.replace(/^Sources:\s*/i, "").split(/\s*·\s*/).filter(Boolean);
                      return (
                        <div key={i} className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
                          <span className="font-semibold">Sources:</span>
                          {entries.map((entry, j) => (
                            <span key={j} className="inline-flex items-baseline">
                              {renderInlineLinks(entry)}
                              {j < entries.length - 1 && <span className="ml-1.5 text-navy/40 dark:text-cream/40">·</span>}
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
                <div className="flex items-start gap-4 border-t border-navy/15 pt-8 dark:border-white/15">
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
                    <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-navy/50 dark:text-cream/50">About the author</p>
                    <p className="mt-1 font-semibold text-navy dark:text-cream">
                      {post.author}
                      {post.author_title && <span className="font-normal text-navy/60 dark:text-cream/60"> · {post.author_title}</span>}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-navy/70 dark:text-cream/70">{post.author_bio}</p>
                  </div>
                </div>
              )}

              {related.length > 0 && (
                <div className="border-t border-navy/15 pt-8 dark:border-white/15">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-navy/50 dark:text-cream/50">Related articles</p>
                  <ul className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {related.map((item) => (
                      <li key={item.slug}>
                        <Link href={`/insights/post/${item.slug}`} className="group block">
                          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-mist dark:bg-navy-800">
                            {item.image_url ? (
                              <InsightImage
                                src={item.image_url}
                                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                                className="transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-steel to-navy-secondary">
                                <span className="font-heading text-sm font-semibold uppercase tracking-wide text-white/70">{categoryLabel}</span>
                              </div>
                            )}
                          </div>
                          <span className="mt-3 block font-heading text-lg font-bold leading-snug text-navy transition-colors group-hover:text-steel dark:text-cream dark:group-hover:text-steel-light">
                            {item.title}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </Section>

      {/* Closing call-to-action: a rounded brand-navy card (same gradient,
          grid texture and glows as Section's "navy" background) inset
          from the page edges, so it doesn't run into the navy footer. */}
      <Section background="white" className="!border-t-0 !pt-0">
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-navy via-navy-deep to-navy-secondary px-7 py-14 text-white shadow-[0_30px_60px_-30px_rgba(0,48,96,0.55)] sm:px-12 sm:py-16 lg:px-16 lg:py-20 dark:from-navy-800 dark:via-navy-900 dark:to-navy-800 dark:ring-1 dark:ring-white/10">
          <div aria-hidden="true" className="bg-grid-pattern pointer-events-none absolute inset-0 opacity-60" />
          <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 h-[380px] w-[380px] rounded-full bg-steel-lighter/20 blur-[110px]" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -right-16 h-[420px] w-[420px] rounded-full bg-steel/30 blur-[120px]" />

          <div className="relative lg:grid lg:grid-cols-12 lg:items-end lg:gap-10">
            <div className="lg:col-span-7">
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-steel-lighter">Hire with Mintex</p>
              <h2 className="mt-4 font-heading text-[40px] font-bold leading-[1.02] text-white sm:text-6xl">
                Ready to build your team?
              </h2>
              <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-white/75">
                Mintex connects you with vetted talent who can start fast — contract, temp-to-hire, or direct placement.
              </p>
            </div>

            <div className="mt-10 lg:col-span-5 lg:mt-0 lg:flex lg:flex-col lg:items-end">
              <div className="flex flex-wrap items-center gap-5">
                <Link
                  href="/seek-talent/get-started"
                  className="group inline-flex items-center gap-3 rounded-full bg-white py-2 pl-7 pr-2 text-[15px] font-semibold text-navy shadow-[0_10px_30px_-10px_rgba(0,0,0,0.4)] transition-all hover:-translate-y-0.5 hover:bg-cream"
                >
                  Get Started
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-white transition-transform duration-300 group-hover:translate-x-0.5">
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </Link>
                <Link
                  href="/insights"
                  className="inline-flex items-center rounded-full border border-white/30 px-6 py-3.5 text-[14px] font-semibold text-white transition-colors hover:border-white/60 hover:bg-white/10"
                >
                  All Insights
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-4 lg:justify-end [&_a]:!text-white/60 hover:[&_a]:!text-white">
                <span className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-white/50">Share</span>
                <ShareIcons postUrl={postUrl} title={post.title} />
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
