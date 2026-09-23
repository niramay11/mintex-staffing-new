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

  return {
    title,
    description: metaDescription,
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description: metaDescription,
      url: path,
      type: "website",
      images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: metaDescription,
      images: ["/og-image.jpg"],
    },
  };
}
