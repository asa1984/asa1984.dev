// The unified pipeline imports each remark and rehype plugin it chains.
/* oxlint-disable import/max-dependencies */
import type { Root } from "hast";
import rehypeKatex from "rehype-katex";
import type { Options as PrettyCodeOptions } from "rehype-pretty-code";
import { rehypePrettyCode } from "rehype-pretty-code";
import rehypeRaw from "rehype-raw";
import remarkBreaks from "remark-breaks";
import remarkGemoji from "remark-gemoji";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";

import type { SitePath } from "#/libs/site-path.ts";

import { getHighlighter } from "./highlighter.ts";
import { remarkInlineFootnote } from "./remark-inline-footnote.ts";
import { remarkLinkCard } from "./remark-link-card.ts";
import { remarkZennMessage } from "./remark-zenn-message.ts";
import moonlightIiTheme from "./theme/moonlight-ii.json";

const processor = unified()
  .use(remarkParse)
  .use(remarkZennMessage)
  .use(remarkInlineFootnote)
  .use(remarkGfm)
  .use(remarkGemoji)
  .use(remarkMath)
  .use(remarkLinkCard)
  .use(remarkBreaks)
  .use(remarkRehype, {
    // Articles may contain raw HTML such as <br/>, which rehype-raw turns into elements. HTML
    // comments become hast comments, which the JSX renderer drops.
    allowDangerousHtml: true,
    footnoteLabel: "脚注",
    footnoteLabelTagName: "span",
    // The custom nodes become custom elements, which the article's components render.
    // mdast-util-to-hast calls each handler with positional (state, node) arguments.
    handlers: {
      // ast-grep-ignore: typescript/labeled-arguments
      linkCard: (h, node) => ({
        type: "element",
        tagName: "linkcard",
        properties: { href: node.data.hProperties.url },
        children: h.all(node),
      }),
      // ast-grep-ignore: typescript/labeled-arguments
      message: (h, node) => ({
        type: "element",
        tagName: "message",
        properties: {},
        children: h.all(node),
      }),
    },
  })
  .use(rehypeRaw)
  .use(rehypePrettyCode, {
    // The JSON import's inferred literal type is wider than shiki's ThemeRegistration, although
    // the value is a valid VS Code theme.
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    theme: moonlightIiTheme as unknown as NonNullable<PrettyCodeOptions["theme"]>,
    keepBackground: false,
    getHighlighter,
  } satisfies PrettyCodeOptions)
  .use(rehypeKatex);

/**
 * Compiles a Markdown article to hast.
 *
 * Images referenced relatively (`![alt](./photo.webp)`) resolve against `assetBase`, the URL of
 * the directory that holds the article's images.
 */
export const compileMarkdown = async ({
  source,
  assetBase,
}: {
  source: string;
  assetBase: SitePath;
}): Promise<Root> => {
  const root = await processor.run(processor.parse(source));
  visit(root, "element", (node) => {
    const { src } = node.properties;
    if (node.tagName === "img" && typeof src === "string" && src.startsWith("./")) {
      // A transformer rewrites the tree it receives in place.
      // oxlint-disable-next-line eslint/no-param-reassign
      node.properties.src = `${assetBase}/${src.slice("./".length)}`;
    }
  });
  return root;
};

/** The URLs of every link card in the article, which need OGP metadata to render. */
export const collectLinkCardUrls = (root: Root): string[] => {
  const urls: string[] = [];
  visit(root, "element", (node) => {
    const { href } = node.properties;
    if (node.tagName === "linkcard" && typeof href === "string") {
      urls.push(href);
    }
  });
  return urls;
};
