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
  const ogp: OGP = {
    href,
    title: root.querySelector("title")?.text,
    description: root.querySelector("meta[name='description']")?.getAttribute("content"),
    image: undefined,
  };
  const property_metas = root
    .querySelectorAll("meta")
    .filter((elem) => elem.getAttribute("property") !== undefined);
  for (const elem of property_metas) {
    const property = elem.getAttribute("property");
    switch (property) {
      case "og:title": {
        const content = elem.getAttribute("content");

        if (content !== undefined && content !== "") {
          ogp.title = content;
        }
        break;
      }
      case "og:description": {
        const content = elem.getAttribute("content");
        if (content !== undefined && content !== "") {
          ogp.description = content;
        }
        break;
      }
      case "og:image": {
        const content = elem.getAttribute("content");
        if (content !== undefined && content !== "") {
          const url = new URL(content, href);
          ogp.image = url.toString();
        }

        break;
      }
      case "og:url": {
        const content = elem.getAttribute("content");
        if (content !== undefined && content !== "") {
          ogp.href = content;
        }
        break;
      }
    }
  }
  return {
    ...ogp,
  };
}
