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
      className="group relative mb-6 flex h-[13rem] w-full flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-navy sm:h-[14rem]"
    >
      {caseStudy.thumbnail_url ? (
        // eslint-disable-next-line @next/next/no-img-element -- arbitrary admin-supplied URL
        <img src={caseStudy.thumbnail_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
      ) : youtubeId ? (
        <Image
          src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
          alt=""
          fill
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
      <figure className="flex flex-col rounded-[32px] bg-white p-8 shadow-[0_4px_20px_-6px_rgba(0,48,96,0.12)] transition-shadow hover:shadow-[0_24px_50px_-20px_rgba(0,48,96,0.35)] sm:p-9">
        <div>
          {caseStudy.video_url && (
            <VideoThumbnail caseStudy={caseStudy} onPlay={() => setPlaying(true)} />
          )}
          <svg aria-hidden="true" viewBox="0 0 32 24" fill="currentColor" className="h-7 w-9 text-steel">
            <path d="M0 24V14.4C0 9.87 1.253 6.507 3.76 4.304 6.267 2.101 9.387 0.64 13.12 0L14.72 3.68C12.373 4.373 10.507 5.44 9.12 6.88 7.787 8.267 7.12 9.973 7.12 12H13.6V24H0ZM18.4 24V14.4C18.4 9.87 19.653 6.507 22.16 4.304 24.667 2.101 27.787 0.64 31.52 0L33.12 3.68C30.773 4.373 28.907 5.44 27.52 6.88 26.187 8.267 25.52 9.973 25.52 12H32V24H18.4Z" />
          </svg>
          <blockquote>
            <p className="mt-3 font-heading text-[17px] italic leading-relaxed text-navy">
              {caseStudy.quote}
            </p>
          </blockquote>
        </div>
        <figcaption className="mt-7">
          <p className="text-sm font-semibold text-navy">{caseStudy.title}</p>
          <p className="mt-0.5 text-sm text-steel">
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
