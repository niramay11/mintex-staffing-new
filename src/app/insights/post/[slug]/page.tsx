import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Section from "@/components/ui/Section";
import { supabase } from "@/lib/supabase";
import type { InsightPost } from "@/content/types";
import { pageMetadata } from "@/lib/pageMetadata";
import { SITE_URL } from "@/lib/site";

export const revalidate = 60;

async function getInsightBySlug(slug: string): Promise<InsightPost | null> {
  const { data } = await supabase.from("insights").select("*").eq("slug", slug).maybeSingle();
  return (data as InsightPost | null) ?? null;
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

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Insights", item: `${SITE_URL}/insights` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${SITE_URL}/insights/post/${post.slug}` },
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
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/insights/post/${post.slug}` },
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
      <Section background="navy" className="!py-12 sm:!py-14 lg:!py-16">
        <Link href="/insights" className="text-sm text-white/70 hover:text-white">
          &larr; Back to Insights
        </Link>
        <h1 className="mt-4 text-4xl font-bold sm:text-5xl">{post.title}</h1>
        <p className="mt-4 text-sm text-white/60">
          By {post.author} &middot;{" "}
          {new Date(post.published_at).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </Section>

      <Section background="cream">
        {post.image_url && (
          <div className="relative mb-10 aspect-[16/9] w-full max-w-2xl overflow-hidden rounded-2xl">
            <Image src={post.image_url} alt={post.title} fill className="object-cover" />
          </div>
        )}
        <div className="max-w-2xl space-y-5 text-navy/80">
          {post.body.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {post.author_bio && (
          <div className="mt-12 flex max-w-2xl items-start gap-4 rounded-2xl border border-navy/10 bg-white p-6">
            <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-navy/10">
              {post.author_photo_url ? (
                <Image src={post.author_photo_url} alt={post.author} fill className="object-cover object-top" />
              ) : (
                <span className="flex h-full w-full items-center justify-center font-heading text-lg font-semibold text-navy/40">
                  {post.author.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("")}
                </span>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-navy/50">About the author</p>
              <p className="mt-1 font-semibold text-navy">
                {post.author}
                {post.author_title && <span className="font-normal text-navy/60"> · {post.author_title}</span>}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-navy/70">{post.author_bio}</p>
            </div>
          </div>
        )}
      </Section>
    </>
  );
}
