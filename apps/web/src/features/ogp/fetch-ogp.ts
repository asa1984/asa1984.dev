import { parse } from "node-html-parser";

/** Open Graph metadata of a linked page, as much as could be read. */
export type Ogp = {
  url: string;
  title: string | undefined;
  description: string | undefined;
  image: string | undefined;
};

const readHtml = async (url: string): Promise<string | undefined> => {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    return response.ok ? await response.text() : undefined;
  } catch {
    return undefined;
  }
};

/**
 * Fetches the Open Graph metadata of `url`. Pages are prerendered at build time, so a slow or dead
 * link target degrades to a bare card instead of failing the build.
 */
export const fetchOgp = async (url: string): Promise<Ogp> => {
  const html = await readHtml(url);
  if (html === undefined) {
    return { url, title: undefined, description: undefined, image: undefined };
  }

  const root = parse(html);
  // A later tag overrides an earlier one with the same property.
  const og = new Map<string, string>();
  for (const element of root.querySelectorAll("meta")) {
    const property = element.getAttribute("property");
    const content = element.getAttribute("content");
    if (property?.startsWith("og:") === true && content !== undefined && content !== "") {
      og.set(property, content);
    }
  }
  const image = og.get("og:image");
  return {
    url: og.get("og:url") ?? url,
    title: og.get("og:title") ?? root.querySelector("title")?.text,
    description:
      og.get("og:description") ??
      root.querySelector("meta[name='description']")?.getAttribute("content"),
    image: image === undefined ? undefined : new URL(image, url).toString(),
  };
};

/** Fetches the metadata of every URL concurrently, keyed by the requested URL. */
export const fetchOgps = async (urls: Iterable<string>): Promise<Record<string, Ogp>> => {
  const entries = await Promise.all(
    [...new Set(urls)].map(async (url) => [url, await fetchOgp(url)] as const),
  );
  return Object.fromEntries(entries);
};
