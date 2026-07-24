import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Section from "@/components/ui/Section";
import { supabase } from "@/lib/supabase";
import type { InsightPost } from "@/content/types";

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

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function InsightPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getInsightBySlug(slug);
  if (!post) notFound();

  return (
    <>
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
          // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-supplied URL
          <img
            src={post.image_url}
            alt=""
            className="mb-10 aspect-[16/9] w-full max-w-2xl rounded-2xl object-cover"
          />
        )}
        <div className="max-w-2xl space-y-5 text-navy/80">
          {post.body.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </Section>
    </>
  );
}
