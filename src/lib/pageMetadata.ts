import type { Metadata } from "next";

const META_DESCRIPTION_MAX_LENGTH = 155;

// Google truncates a meta description past ~155-160 chars in the search
// snippet — several pages (industry pages reusing their on-page
// seoSubheading copy as the description, e.g. /industries/healthcare-
// staffing at 293 chars) ran well past that. Cuts at the last full word
// inside the limit rather than mid-word, and only touches the <meta> tag
// value — the on-page seoSubheading text itself is untouched.
function truncateDescription(text: string, maxLength = META_DESCRIPTION_MAX_LENGTH): string {
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

const TITLE_MAX_LENGTH = 60;
const BRAND_SUFFIX = " | Mintex Staffing";
const SHORT_BRAND_SUFFIX = " | Mintex";

// Google cuts <title> off at ~60 chars and Ahrefs flags anything longer.
// Keep the layout's "%s | Mintex Staffing" template when it fits; otherwise
// fall back to the short " | Mintex" brand, then drop the brand, and if the
// bare title is still too long, cut it at the last full word inside the
// limit. Returns undefined when the normal template already fits.
function fitTitle(title: string): string | undefined {
  if (title.length + BRAND_SUFFIX.length <= TITLE_MAX_LENGTH) return undefined;
  if (title.length + SHORT_BRAND_SUFFIX.length <= TITLE_MAX_LENGTH) return `${title}${SHORT_BRAND_SUFFIX}`;
  if (title.length <= TITLE_MAX_LENGTH) return title;
  const cut = title.slice(0, TITLE_MAX_LENGTH);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[\s,:;–-]+$/, "");
}

export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const fullTitle = `${title} | Mintex Staffing`;
  const metaDescription = truncateDescription(description);
  const fittedTitle = fitTitle(title);

  return {
    title: fittedTitle ? { absolute: fittedTitle } : title,
    description: metaDescription,
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description: metaDescription,
      url: path,
      type: "website",
      images: [{ url: "/share-image?v=4", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: metaDescription,
      images: ["/share-image?v=4"],
    },
  };
}
