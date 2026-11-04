import { defineHandler, defineHead } from "void";
import type { InferProps } from "void";

import { contextPosts, findContextPost } from "#/features/context.ts";
import { loadArticle } from "#/features/markdown.ts";
import { pageHead } from "#/libs/head.ts";

export const getPrerenderPaths = () => contextPosts.map(({ slug }) => ({ slug }));

export const loader = defineHandler(async (c) => {
  const post = findContextPost(c.req.param("slug") ?? "");
  if (post === undefined) {
    return c.notFound();
  }
  return {
    title: post.title,
    date: post.date.toISOString(),
    document: await loadArticle({ source: post.body, assetBase: post.assetBase }),
  };
});

export type Props = Exclude<InferProps<typeof loader>, Response>;

export const head = defineHead<Props>((_c, { title }) =>
  pageHead({ title, description: title, type: "article" }),
);
