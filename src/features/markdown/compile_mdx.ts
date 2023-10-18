import { compileMDX } from "next-mdx-remote/rsc";
import { type CompileOptions } from "@mdx-js/mdx";

import remark_breaks from "remark-breaks";
import remark_gfm from "remark-gfm";
import remark_gemoji from "remark-gemoji";
import remark_math from "remark-math";
import rehype_pretty_code from "rehype-pretty-code";
import rehype_katex from "rehype-katex";

import {
  remark_linkcard,
  remark_zenn_message,
  linkcard_handler,
  zenn_message_handler,
} from "./lib";

import moonlight_ii_theme from "./theme/moonlight-ii.json";
import { custom_components } from "./custom_components";

type RemarkPlugins = CompileOptions["remarkPlugins"];
type RehypePlugins = CompileOptions["rehypePlugins"];

export async function compile_mdx(source: string) {
  const { content } = await compileMDX({
    source,
    components: custom_components,
    options: {
      mdxOptions: {
        remarkPlugins: [
          remark_zenn_message,
          remark_gfm,
          remark_gemoji,
          remark_math,
          remark_linkcard,
          remark_breaks,
        ] as RemarkPlugins, // FIX: Remove type assertion when next-mdx-remote is updated
        rehypePlugins: [
          [
            rehype_pretty_code,
            {
              theme: moonlight_ii_theme,
              keepBackground: false,
            },
          ],
          rehype_katex,
        ] as RehypePlugins, // FIX: Remove type assertion when next-mdx-remote is updated
        remarkRehypeOptions: {
          footnoteLabel: "脚注",
          footnoteLabelTagName: "span",
          handlers: {
            message: zenn_message_handler,
            linkcard: linkcard_handler,
          },
        },
      },
    },
  });

  return content;
}
