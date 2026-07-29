import type { Root as HastRoot } from "hast";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import type { Handler } from "mdast-util-to-hast";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import rehype_katex from "rehype-katex";
import rehype_pretty_code from "rehype-pretty-code";
import rehype_raw from "rehype-raw";
import remark_breaks from "remark-breaks";
import remark_comment from "remark-comment";
import remark_gemoji from "remark-gemoji";
import remark_gfm from "remark-gfm";
import remark_math from "remark-math";
import remark_parse from "remark-parse";
import remark_rehype from "remark-rehype";
import type { BundledHighlighterOptions, ThemeRegistrationRaw } from "shiki";
import { getSingletonHighlighter } from "shiki/bundle/full";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import { unified } from "unified";
import { create_custom_components } from "./custom_components";
import {
  linkcard_handler,
  remark_linkcard,
  remark_zenn_message,
  // zenn_message_handler,
} from "./lib";
import moonlight_ii_theme from "./theme/moonlight-ii.json";

// Shiki's default Oniguruma engine instantiates a WASM module at runtime, which
// Cloudflare Workers rejects with "Wasm code generation disallowed by embedder".
// The JavaScript RegExp engine needs no WASM, so use it instead. `forgiving`
// skips the few Oniguruma patterns it cannot emulate rather than throwing.
const regex_engine = createJavaScriptRegexEngine({ forgiving: true });

const get_highlighter = (options: BundledHighlighterOptions<never, never>) =>
  getSingletonHighlighter({ ...options, engine: regex_engine });

// Markdown -> hast. Note that this deliberately avoids `next-mdx-remote` /
// `@mdx-js/mdx`: they compile the document to JavaScript and evaluate it with
// `new Function`, which Cloudflare Workers rejects with "Code generation from
// strings disallowed for this context". Building the hast tree and handing it
// to the JSX runtime produces the same React tree without generating code.
const processor = unified()
  .use(remark_parse)
  .use(remark_zenn_message)
  .use(remark_comment)
  .use(remark_gfm)
  .use(remark_gemoji)
  .use(remark_math)
  .use(remark_linkcard)
  .use(remark_breaks)
  .use(remark_rehype, {
    // Posts are authored by us, so raw HTML in the source is trusted. MDX used
    // to render it as JSX; `rehype_raw` below keeps it rendering.
    allowDangerousHtml: true,
    footnoteLabel: "脚注",
    footnoteLabelTagName: "span",
    // `linkcard` is a node type of our own, so it is not part of the `Handlers`
    // union that `handlers` is typed against.
    handlers: { linkcard: linkcard_handler } as Record<string, Handler>,
  })
  .use(rehype_raw)
  .use(rehype_pretty_code, {
    theme: moonlight_ii_theme as unknown as ThemeRegistrationRaw,
    keepBackground: false,
    getHighlighter: get_highlighter,
  })
  .use(rehype_katex);

export async function compile_mdx({
  source,
  type,
  slug,
}: {
  source: string;
  type: "blog" | "context";
  slug: string;
}) {
  const tree = (await processor.run(processor.parse(source))) as HastRoot;

  return toJsxRuntime(tree, {
    Fragment,
    jsx,
    jsxs,
    components: create_custom_components({ type, slug }),
  });
}
