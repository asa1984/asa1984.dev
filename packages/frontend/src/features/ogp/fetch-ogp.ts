import { parse } from "node-html-parser";

export type OGP = {
  href: string;
  title: string | undefined;
  description: string | undefined;
  image: string | undefined;
};

export async function fetch_ogp(href: string): Promise<OGP> {
  const fallback: OGP = {
    href,
    title: undefined,
    description: undefined,
    image: undefined,
  };

  // Runs at request time now that article pages render per request: a slow
  // or dead link target must degrade to a bare card, never fail the page.
  // The data cache keeps each target from being fetched on every article
  // view; link targets change rarely, so a day of staleness is fine.
  let html: string;
  try {
    const response = await fetch(href, {
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 86_400 },
    });
    if (!response.ok) {
      return fallback;
    }
    html = await response.text();
  } catch {
    return fallback;
  }

  const root = parse(html);
  // A later tag overrides an earlier one with the same property.
  const og = new Map<string, string>();
  for (const elem of root.querySelectorAll("meta")) {
    const property = elem.getAttribute("property");
    const content = elem.getAttribute("content");
    if (property?.startsWith("og:") === true && content !== undefined && content !== "") {
      og.set(property, content);
    }
  }
  const image = og.get("og:image");
  return {
    href: og.get("og:url") ?? href,
    title: og.get("og:title") ?? root.querySelector("title")?.text,
    description:
      og.get("og:description") ??
      root.querySelector("meta[name='description']")?.getAttribute("content"),
    image: image === undefined ? undefined : new URL(image, href).toString(),
  };
}
