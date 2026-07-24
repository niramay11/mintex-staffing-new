export type VideoEmbed = { kind: "file"; src: string } | { kind: "iframe"; src: string };

export function getYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]+)/);
  return match ? match[1] : null;
}

export function getVideoEmbed(url: string): VideoEmbed {
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) return { kind: "file", src: url };

  const youtube = getYoutubeId(url);
  if (youtube) {
    return {
      kind: "iframe",
      src: `https://www.youtube.com/embed/${youtube}?autoplay=1&controls=1&modestbranding=1&playsinline=1`,
    };
  }

  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) {
    return { kind: "iframe", src: `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1` };
  }

  return { kind: "iframe", src: url };
}
