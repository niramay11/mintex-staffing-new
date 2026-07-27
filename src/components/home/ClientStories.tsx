"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getVideoEmbed, getYoutubeId } from "@/lib/videoEmbed";

type ClientStory = {
  id: string;
  quote: string;
  author: string;
  role: string | null;
  video_url: string;
  thumbnail_url: string | null;
};

function CardVisual({ story, opacityClassName }: { story: ClientStory; opacityClassName: string }) {
  if (story.thumbnail_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-supplied URL, can't be pre-configured for next/image
      <img src={story.thumbnail_url} alt="" className={`absolute inset-0 h-full w-full object-cover ${opacityClassName}`} />
    );
  }

  const youtubeId = getYoutubeId(story.video_url);
  if (youtubeId) {
    return (
      <Image
        src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
        alt=""
        fill
        className={`object-cover ${opacityClassName}`}
      />
    );
  }

  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(story.video_url)) {
    return (
      <video
        src={story.video_url}
        muted
        preload="metadata"
        playsInline
        className={`absolute inset-0 h-full w-full object-cover ${opacityClassName}`}
      />
    );
  }

  return null;
}

function PlayButton({ size }: { size: "lg" | "sm" }) {
  const dims = size === "lg" ? "h-[76px] w-[76px]" : "h-[52px] w-[52px]";
  const iconDims = size === "lg" ? "h-7 w-7" : "h-5 w-5";
  return (
    <span
      className={`flex ${dims} items-center justify-center rounded-full bg-white/95 shadow-lg transition-transform group-hover:scale-105`}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="#003060" className={`ml-1 ${iconDims}`}>
        <path d="M8 5v14l11-7z" />
      </svg>
    </span>
  );
}

export default function ClientStories() {
  const [stories, setStories] = useState<ClientStory[]>([]);
  const [active, setActive] = useState<ClientStory | null>(null);
  // null = not yet checked; default to visible until told otherwise so the
  // common case (section enabled) never flashes. Checked fresh on every
  // page load — this section's admin on/off toggle needs to be reliable
  // every time, not dependent on this static homepage's own server-render
  // catching up (see page.tsx for why that path was dropped).
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/client-stories")
      .then((r) => r.json())
      .then((data) => setStories(Array.isArray(data) ? data : []))
      .catch(() => setStories([]));

    fetch("/api/client-stories/section")
      .then((r) => r.json())
      .then((d) => setEnabled(d.enabled !== false))
      .catch(() => setEnabled(true));
  }, []);

  useEffect(() => {
    if (!active) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setActive(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  const [featured, secondary] = stories;

  if (enabled === false) return null;

  return (
    <>
    <div className="px-4 sm:px-6 lg:px-8">
      <section className="relative mx-auto mt-6 max-w-[1920px] overflow-hidden rounded-[32px] bg-white px-6 py-16 shadow-[0_1px_3px_rgba(0,48,96,0.05)] sm:px-10 sm:py-20 lg:px-16 lg:py-24">
      <div className="relative mx-auto max-w-2xl text-center">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-steel">
          Client stories
        </p>
        <h2 className="mt-3.5 font-heading text-[36px] font-semibold leading-tight text-navy sm:text-[40px]">
          You need to see it to believe it
        </h2>
        <p className="mt-4 text-lg text-steel">
          Let our work do the talking while we help businesses <b>lower the time to</b> fill a specific role, help beat the AI resumes and connect them with pre-qualified talents to solve their
hiring challenges with intentional staffing solutions created for solving the hiring issues.
        </p>
      </div>

      <div className="relative mt-11 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        {featured ? (
          <button
            type="button"
            onClick={() => setActive(featured)}
            aria-label={`Play video${featured.author ? `: ${featured.author}` : ""}`}
            className="group relative flex aspect-[16/11] flex-col justify-end overflow-hidden rounded-3xl bg-gradient-to-br from-navy-secondary to-navy p-7 text-left shadow-[0_20px_50px_-24px_rgba(0,48,96,0.5)]"
          >
            <CardVisual story={featured} opacityClassName="opacity-70" />
            <span className="absolute inset-0 flex items-center justify-center">
              <PlayButton size="lg" />
            </span>
            {(featured.quote || featured.author) && (
              <div className="relative text-white">
                {featured.quote && (
                  <p className="font-heading text-lg font-semibold">&ldquo;{featured.quote}&rdquo;</p>
                )}
                {featured.author && (
                  <p className="mt-1.5 text-[13.5px] text-tan-light">
                    {featured.author}
                    {featured.role ? ` · ${featured.role}` : ""}
                  </p>
                )}
              </div>
            )}
          </button>
        ) : (
          <div className="flex aspect-[16/11] flex-col items-center justify-center rounded-3xl border border-dashed border-navy/15 text-sm text-navy/40">
            No client story videos yet.
          </div>
        )}

        <div className="grid gap-5">
          {secondary ? (
            <button
              type="button"
              onClick={() => setActive(secondary)}
              aria-label={`Play video${secondary.author ? `: ${secondary.author}` : ""}`}
              className="group relative flex min-h-[130px] flex-1 items-center justify-center overflow-hidden rounded-3xl bg-steel p-6"
            >
              <CardVisual story={secondary} opacityClassName="opacity-60" />
              <PlayButton size="sm" />
              {secondary.quote && (
                <p className="absolute bottom-4 left-4 right-4 text-left text-[13.5px] font-medium leading-snug text-white">
                  &ldquo;{secondary.quote}&rdquo;
                </p>
              )}
            </button>
          ) : (
            <div className="flex min-h-[130px] flex-1 items-center justify-center rounded-3xl border border-dashed border-navy/15 text-sm text-navy/40">
              &mdash;
            </div>
          )}
          <div className="flex flex-1 flex-col justify-center rounded-3xl bg-navy p-6 text-white">
            <div className="font-heading text-3xl font-bold">
              4.9<span className="text-lg font-normal text-tan-light">/5</span>
            </div>
            <p className="mt-1 text-[13px] text-steel-lighter">
              Average client satisfaction across every industry we serve
            </p>
          </div>
        </div>
      </div>
      </section>
      </div>

      {active && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/70 p-4 backdrop-blur-sm"
          onClick={(event) => event.target === event.currentTarget && setActive(null)}
        >
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-black shadow-2xl">
            <div className="flex items-center justify-between bg-navy px-5 py-3 text-white">
              <p className="truncate text-sm font-medium">
                {active.author || "Client story"}
                {active.role ? ` · ${active.role}` : ""}
              </p>
              <button
                type="button"
                onClick={() => setActive(null)}
                aria-label="Close video"
                className="text-xl leading-none text-white/70 hover:text-white"
              >
                &times;
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              {(() => {
                const embed = getVideoEmbed(active.video_url);
                return embed.kind === "file" ? (
                  <video src={embed.src} controls autoPlay className="h-full w-full" />
                ) : (
                  <iframe
                    src={embed.src}
                    title={`${active.author || "Client"} testimonial`}
                    className="h-full w-full"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
