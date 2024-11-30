import { parse } from "node-html-parser";

export type OGP = {
  href: string;
  title: string | undefined;
  description: string | undefined;
  image: string | undefined;
};

export async function fetch_ogp(href: string): Promise<OGP> {
  const response = await fetch(href);
  const html = await response.text();

  const root = parse(html);
  const ogp: OGP = {
    href,
    title: root.querySelector("title")?.text,
    description: root.querySelector("meta[name='description']")?.getAttribute("content"),
    image: undefined,
  };
  root
    .getElementsByTagName("meta")
    .filter((elem) => elem.getAttribute("property"))
    .forEach((elem) => {
      const property = elem.getAttribute("property");
      switch (property) {
        case "og:title": {
          const content = elem.getAttribute("content");

          if (content) ogp.title = content;
          break;
        }
        case "og:description": {
          const content = elem.getAttribute("content");
          if (content) ogp.description = content;
          break;
        }
        case "og:image": {
          const content = elem.getAttribute("content");
          if (content) {
            const url = new URL(content, href);
            ogp.image = url.toString();
          }

          break;
        }
        case "og:url": {
          const content = elem.getAttribute("content");
          if (content) ogp.href = content;
          break;
        }
      }
    });
  return {
    ...ogp,
  };
}
