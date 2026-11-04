import type { SitePath } from "#/libs/site-path.ts";

type OgImage = {
  /** Crawlers need an absolute URL, so the path is resolved against the site URL. */
  path: SitePath;
  type?: string;
  width?: number;
  height?: number;
};

/** What a page tells search engines and social previews, whichever framework renders it. */
export type PageHead = {
  title: string;
  description: string;
  type?: "article" | "profile";
  image?: OgImage;
  card?: "summary" | "summary_large_image";
};

type MetaTag = { name: string; content: string } | { property: string; content: string };

/** The `<title>` and `<meta>` tags of a page. */
export type HeadTags = {
  title: string;
  meta: MetaTag[];
};

const imageMeta = ({
  image,
  key,
  siteUrl,
}: {
  image: OgImage;
  key: "og:image" | "twitter:image";
  siteUrl: string;
}): MetaTag[] => {
  // Open Graph tags take `property`, Twitter tags take `name`.
  const tag = ({ suffix, content }: { suffix: string; content: string }): MetaTag =>
    key === "og:image"
      ? { property: `${key}${suffix}`, content }
      : { name: `${key}${suffix}`, content };
  return [
    tag({ suffix: "", content: new URL(image.path, siteUrl).toString() }),
    ...(image.type === undefined ? [] : [tag({ suffix: ":type", content: image.type })]),
    ...(image.width === undefined ? [] : [tag({ suffix: ":width", content: String(image.width) })]),
    ...(image.height === undefined
      ? []
      : [tag({ suffix: ":height", content: String(image.height) })]),
  ];
};

/**
 * The title, description, Open Graph, and Twitter tags of a page. `siteUrl` is the URL the site is
 * deployed to, against which the image URLs are resolved.
 */
export const headTags = ({
  head: { title, description, type, image, card = "summary" },
  siteUrl,
}: {
  head: PageHead;
  siteUrl: string;
}): HeadTags => ({
  title,
  meta: [
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    ...(image === undefined ? [] : imageMeta({ image, key: "og:image", siteUrl })),
    ...(type === undefined ? [] : [{ property: "og:type", content: type }]),
    { name: "twitter:card", content: card },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    ...(image === undefined ? [] : imageMeta({ image, key: "twitter:image", siteUrl })),
  ],
});
