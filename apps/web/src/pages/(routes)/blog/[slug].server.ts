import { defineHandler, defineHead } from "void";
import type { InferProps } from "void";

import { blogPosts, findBlogPost } from "#/features/blog.ts";
import { loadArticle } from "#/features/markdown.ts";
import { pageHead } from "#/libs/head.ts";

export const getPrerenderPaths = () => blogPosts.map(({ slug }) => ({ slug }));

export const loader = defineHandler(async (c) => {
  const post = findBlogPost(c.req.param("slug") ?? "");
  if (post === undefined) {
    return c.notFound();
  }
  return {
    title: post.title,
    description: post.description,
    image: post.image,
    date: post.date.toISOString(),
    document: await loadArticle({ source: post.body, assetBase: post.assetBase }),
  };
});

export type Props = Exclude<InferProps<typeof loader>, Response>;

export const head = defineHead<Props>((_c, { title, description, image }) =>
  pageHead({
    title,
    description,
    type: "article",
    image: { path: image },
    card: "summary_large_image",
  }),
);
