"use client";

import { useEffect, useState } from "react";
import type { CaseStudy } from "@/content/types";
import { getVideoEmbed, getYoutubeId } from "@/lib/videoEmbed";

function PlayButton() {
  return (
    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/95 shadow-lg transition-transform group-hover:scale-105">
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="#003060" className="ml-0.5 h-5 w-5">
        <path d="M8 5v14l11-7z" />
      </svg>
    </span>
  );
}

function VideoThumbnail({ caseStudy, onPlay }: { caseStudy: CaseStudy; onPlay: () => void }) {
  const youtubeId = caseStudy.thumbnail_url ? null : getYoutubeId(caseStudy.video_url ?? "");
  const thumbSrc = caseStudy.thumbnail_url || (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : null);

  return (
    <button
      type="button"
      onClick={onPlay}
      aria-label={`Play video: ${caseStudy.author}`}
      className="group relative mb-4 flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg bg-navy"
    >
      {thumbSrc ? (
        // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-supplied URL
        <img src={thumbSrc} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
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
      <figure className="flex h-full flex-col justify-between rounded-lg bg-white p-6 shadow-sm">
        <div>
          {caseStudy.video_url && (
            <VideoThumbnail caseStudy={caseStudy} onPlay={() => setPlaying(true)} />
          )}
          <blockquote className="text-navy/90">
            <p>&ldquo;{caseStudy.quote}&rdquo;</p>
          </blockquote>
        </div>
        <figcaption className="mt-4 border-t border-navy/10 pt-4">
          <p className="text-sm font-semibold text-navy">{caseStudy.title}</p>
          <p className="text-sm text-navy/60">
            {caseStudy.author}
            {caseStudy.role ? ` · ${caseStudy.role}` : ""}
          </p>
        </figcaption>
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
