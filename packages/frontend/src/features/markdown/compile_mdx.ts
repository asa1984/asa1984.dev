import { compileMDX } from "next-mdx-remote/rsc";

import rehype_katex from "rehype-katex";
import rehype_pretty_code from "rehype-pretty-code";
import remark_breaks from "remark-breaks";
import remark_comment from "remark-comment";
import remark_gemoji from "remark-gemoji";
import remark_gfm from "remark-gfm";
import remark_math from "remark-math";
import { getSingletonHighlighter } from "shiki/bundle/full";
import { create_custom_components } from "./custom_components";
import {
  linkcard_handler,
  remark_linkcard,
  remark_zenn_message,
  // zenn_message_handler,
} from "./lib";
import moonlight_ii_theme from "./theme/moonlight-ii.json";

export async function compile_mdx({
  source,
  type,
  slug,
}: {
  source: string;
  type: "blog" | "context";
  slug: string;
}) {
  const { content } = await compileMDX({
    source,
    components: create_custom_components({
      type,
      slug,
    }),
    options: {
      mdxOptions: {
        remarkPlugins: [
          remark_zenn_message,
          remark_comment,
          remark_gfm,
          remark_gemoji,
          remark_math,
          remark_linkcard,
          remark_breaks,
        ],
        rehypePlugins: [
          [
            rehype_pretty_code,
            {
              theme: moonlight_ii_theme,
              keepBackground: false,
              getHighlighter: getSingletonHighlighter,
            },
          ],
          rehype_katex,
        ],
        remarkRehypeOptions: {
          footnoteLabel: "脚注",
          footnoteLabelTagName: "span",
          handlers: {
            // @ts-expect-error FIXME: Why?
            linkcard: linkcard_handler,
          },
        },
      },
    },
  });

  return content;
}
