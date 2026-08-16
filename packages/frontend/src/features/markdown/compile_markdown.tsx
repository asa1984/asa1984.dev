import type { Options as PrettyCodeOptions } from "rehype-pretty-code";

import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import rehype_katex from "rehype-katex";
import rehype_pretty_code from "rehype-pretty-code";
import rehype_raw from "rehype-raw";
import remark_breaks from "remark-breaks";
import remark_gemoji from "remark-gemoji";
import remark_gfm from "remark-gfm";
import remark_math from "remark-math";
import remark_parse from "remark-parse";
import remark_rehype from "remark-rehype";
import { unified } from "unified";

import { create_custom_components } from "./custom_components";
import { get_highlighter } from "./highlighter";
import {
  linkcard_handler,
  remark_inline_footnote,
  remark_linkcard,
  remark_zenn_message,
  zenn_message_handler,
} from "./lib";
import moonlight_ii_theme from "./theme/moonlight-ii.json";

// Markdown → React elements without an eval step: MDX compiles documents to
// JavaScript and runs them through `new Function()`, which workerd forbids,
// so rendering had to happen at build time. This pipeline goes
// mdast → hast → JSX purely with data transforms and therefore also runs at
// request/revalidate time inside the Cloudflare worker.
const processor = unified()
  .use(remark_parse)
  .use(remark_zenn_message)
  .use(remark_inline_footnote)
  // remark-comment (an MDX-era workaround: MDX has no HTML comments) is gone —
  // plain markdown already parses <!-- --> as HTML, rehype-raw turns it into a
  // hast comment node, and hast-util-to-jsx-runtime drops comments on render.
  .use(remark_gfm)
  .use(remark_gemoji)
  .use(remark_math)
  .use(remark_linkcard)
  .use(remark_breaks)
  .use(remark_rehype, {
    // Articles may contain raw HTML (e.g. <br/>), which MDX used to accept
    // as JSX; rehype-raw below turns it into real elements instead.
    allowDangerousHtml: true,
    footnoteLabel: "脚注",
    footnoteLabelTagName: "span",
    handlers: {
      linkcard: linkcard_handler,
      message: zenn_message_handler,
    },
  })
  .use(rehype_raw)
  .use(rehype_pretty_code, {
    // The JSON import's inferred literal type is wider than shiki's
    // ThemeRegistration, so the theme needs a cast; the value itself is a
    // valid VS Code theme and was accepted as-is by the MDX pipeline.
    theme: moonlight_ii_theme as unknown as PrettyCodeOptions["theme"],
    keepBackground: false,
    getHighlighter: get_highlighter,
  } satisfies PrettyCodeOptions)
  .use(rehype_katex);

export async function compile_markdown({
  source,
  type,
  slug,
}: {
  source: string;
  type: "blog" | "context";
  slug: string;
}) {
  const mdast = processor.parse(source);
  const hast = await processor.run(mdast);

  return toJsxRuntime(hast, {
    Fragment,
    jsx,
    jsxs,
    components: create_custom_components({ type, slug }),
  });
}
