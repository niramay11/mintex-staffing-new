"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { CaseStudy } from "@/content/types";
import { getVideoEmbed, getYoutubeId } from "@/lib/videoEmbed";

function PlayButton() {
  return (
    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 shadow-lg transition-transform group-hover:scale-105">
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="#003060" className="ml-1 h-6 w-6">
        <path d="M8 5v14l11-7z" />
      </svg>
    </span>
  );
}

// A proper landscape thumbnail spanning the card's full width — prominent
// enough to read as a real video preview, but height-capped so it can't
// balloon past a proportionate share of the card (the earlier full
// aspect-video version dwarfed the quote text and blew out card height).
function VideoThumbnail({ caseStudy, onPlay }: { caseStudy: CaseStudy; onPlay: () => void }) {
  const youtubeId = caseStudy.thumbnail_url ? null : getYoutubeId(caseStudy.video_url ?? "");

  return (
    <button
      type="button"
      onClick={onPlay}
      aria-label={`Play video: ${caseStudy.author}`}
      className="group relative flex aspect-[16/9] w-full flex-shrink-0 items-center justify-center overflow-hidden rounded-[18px] bg-navy"
    >
      {caseStudy.thumbnail_url ? (
        // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-supplied URL
        <img src={caseStudy.thumbnail_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
      ) : youtubeId ? (
        <Image
          src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
          alt=""
          fill
          sizes="(min-width: 640px) 440px, 100vw"
          className="object-cover opacity-80"
        />
      ) : null}
      <PlayButton />
    </button>
  );
}

export default function TestimonialCard({ caseStudy }: { caseStudy: CaseStudy }) {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setPlaying(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [playing]);

  return (
    <>
      {/* Same card language as the /industries grid: white 28px-radius
          card, small uppercase labels, big light quote, author at the
          bottom; a video (if any) sits in its own rounded frame on top. */}
      <figure className="flex h-full min-w-0 flex-col rounded-[24px] bg-white p-2.5 transition-shadow duration-300 hover:shadow-[0_24px_50px_-28px_rgba(0,48,96,0.35)] dark:bg-navy-800">
        {caseStudy.video_url && <VideoThumbnail caseStudy={caseStudy} onPlay={() => setPlaying(true)} />}
        <div className="flex flex-1 flex-col px-3.5 pb-3.5 pt-4">
          <div className="flex items-start justify-between gap-4 text-[11px] uppercase tracking-[0.12em]">
            <span className="font-medium text-navy/45 dark:text-cream/45">
              {caseStudy.type === "candidate" ? "Candidate story" : caseStudy.type === "client" ? "Client story" : "Success story"}
            </span>
            <span className="flex-shrink-0 text-right">
              <span className="block font-bold text-navy dark:text-cream">Mintex</span>
              <span className="mt-1 block font-semibold text-steel dark:text-steel-light">{caseStudy.video_url ? "Video" : "Testimonial"}</span>
            </span>
          </div>

          {caseStudy.title && (
            <p className="mt-4 text-[12.5px] font-semibold text-navy/70 dark:text-cream/70">{caseStudy.title}</p>
          )}
          <blockquote className={`mb-5 ${caseStudy.title ? "mt-1.5" : "mt-4"}`}>
            <p
              style={{ fontFamily: "var(--font-sans), Arial, Helvetica, sans-serif" }}
              className="text-[16px] font-light leading-[1.5] tracking-[-0.01em] text-navy sm:text-[17px] dark:text-cream"
            >
              &ldquo;{caseStudy.quote}&rdquo;
            </p>
          </blockquote>

          <figcaption className="mt-auto flex items-center gap-3 border-t border-navy/10 pt-4 dark:border-white/10">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-navy text-[11px] font-semibold text-white dark:bg-cream dark:text-navy-950">
              {caseStudy.author.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("")}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-semibold text-navy dark:text-cream">{caseStudy.author}</span>
              {caseStudy.role && <span className="block truncate text-[12px] text-navy/55 dark:text-cream/55">{caseStudy.role}</span>}
            </span>
          </figcaption>
        </div>
      </figure>

      {playing && caseStudy.video_url && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/70 p-4 backdrop-blur-sm"
          onClick={(event) => event.target === event.currentTarget && setPlaying(false)}
        >
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-black shadow-2xl">
            <div className="flex items-center justify-between bg-navy px-5 py-3 text-white">
              <p className="truncate text-sm font-medium">{caseStudy.title}</p>
              <button
                type="button"
                onClick={() => setPlaying(false)}
                aria-label="Close video"
                className="text-xl leading-none text-white/70 hover:text-white"
              >
                &times;
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              {(() => {
                const embed = getVideoEmbed(caseStudy.video_url!);
                return embed.kind === "file" ? (
                  <video src={embed.src} controls autoPlay className="h-full w-full" />
                ) : (
                  <iframe
                    src={embed.src}
                    title={`${caseStudy.author} testimonial`}
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
