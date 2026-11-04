import { defineHandler, defineHead } from "void";

import type { BlogArticle } from "#/features/articles.ts";
import { loadBlogArticle } from "#/features/articles.ts";
import { blogPosts } from "#/features/blog.ts";
import { voidHead } from "#/libs/void-head.ts";

export const getPrerenderPaths = () => blogPosts.map(({ slug }) => ({ slug }));

export const loader = defineHandler(
  async (c) => (await loadBlogArticle(c.req.param("slug") ?? "")) ?? c.notFound(),
);

export const head = defineHead<BlogArticle>((_c, { title, description, image }) =>
  voidHead({
    title,
    description,
    type: "article",
    image: { path: image },
    card: "summary_large_image",
  }),
);
