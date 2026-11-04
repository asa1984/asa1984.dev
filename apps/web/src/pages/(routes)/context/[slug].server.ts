import { defineHandler, defineHead } from "void";

import type { ContextArticle } from "#/features/articles.ts";
import { loadContextArticle } from "#/features/articles.ts";
import { contextPosts } from "#/features/context.ts";
import { voidHead } from "#/libs/void-head.ts";

export const getPrerenderPaths = () => contextPosts.map(({ slug }) => ({ slug }));

export const loader = defineHandler(
  async (c) => (await loadContextArticle(c.req.param("slug") ?? "")) ?? c.notFound(),
);

export const head = defineHead<ContextArticle>((_c, { title }) =>
  voidHead({ title, description: title, type: "article" }),
);
