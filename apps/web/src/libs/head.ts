import type { HeadDescriptor } from "void";
import { env } from "void/env";

type OgImage = {
  /** Site-relative URL; crawlers need an absolute one, so it is resolved against the site URL. */
  path: string;
  type?: string;
  width?: number;
  height?: number;
};

type PageHead = {
  title: string;
  description: string;
  type?: "article" | "profile";
  image?: OgImage;
  card?: "summary" | "summary_large_image";
};

/** Resolves a site-relative URL against the URL the site is deployed to. */
export const absoluteUrl = (path: string): string => new URL(path, env.VITE_SITE_URL).toString();

const imageMeta = ({ image, key }: { image: OgImage; key: "og:image" | "twitter:image" }) => {
  const attribute = key === "og:image" ? "property" : "name";
  return [
    { [attribute]: key, content: absoluteUrl(image.path) },
    ...(image.type === undefined ? [] : [{ [attribute]: `${key}:type`, content: image.type }]),
    ...(image.width === undefined
      ? []
      : [{ [attribute]: `${key}:width`, content: String(image.width) }]),
    ...(image.height === undefined
      ? []
      : [{ [attribute]: `${key}:height`, content: String(image.height) }]),
  ];
};

/** The title, description, Open Graph, and Twitter tags of a page. */
export const pageHead = ({
  title,
  description,
  type,
  image,
  card = "summary",
}: PageHead): HeadDescriptor => ({
  title,
  meta: [
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    ...(image === undefined ? [] : imageMeta({ image, key: "og:image" })),
    ...(type === undefined ? [] : [{ property: "og:type", content: type }]),
    { name: "twitter:card", content: card },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    ...(image === undefined ? [] : imageMeta({ image, key: "twitter:image" })),
  ],
});
