import { compileMDX } from "next-mdx-remote/rsc";
import { type CompileOptions } from "@mdx-js/mdx";

import remark_breaks from "remark-breaks";
import remark_comment from "remark-comment";
import remark_gfm from "remark-gfm";
import remark_gemoji from "remark-gemoji";
import remark_math from "remark-math";
import rehype_pretty_code from "rehype-pretty-code";
import rehype_katex from "rehype-katex";

import {
  remark_linkcard,
  remark_zenn_message,
  linkcard_handler,
  // zenn_message_handler,
} from "./lib";

import moonlight_ii_theme from "./theme/moonlight-ii.json";
import { create_custom_components } from "./custom_components";

type RemarkPlugins = CompileOptions["remarkPlugins"];
type RehypePlugins = CompileOptions["rehypePlugins"];

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
        // @ts-ignore FIXME: Remove type assertion when next-mdx-remote is updated
        remarkPlugins: [
          remark_zenn_message,
          remark_comment,
          remark_gfm,
          remark_gemoji,
          remark_math,
          remark_linkcard,
          remark_breaks,
        ] as RemarkPlugins, // FIXME: Remove type assertion when next-mdx-remote is updated
        // @ts-ignore FIXME: Remove type assertion when next-mdx-remote is updated
        rehypePlugins: [
          [
            rehype_pretty_code,
            {
              theme: moonlight_ii_theme,
              keepBackground: false,
            },
          ],
          rehype_katex,
        ] as RehypePlugins, // FIXME: Remove type assertion when next-mdx-remote is updated
        remarkRehypeOptions: {
          footnoteLabel: "脚注",
          footnoteLabelTagName: "span",
          handlers: {
            // @ts-ignore FIXME: Why?
            // message: zenn_message_handler,
            // @ts-ignore FIXME: Why?
            linkcard: linkcard_handler,
          },
        },
      },
    },
  });

  return content;
}
