import { defineHandler, defineHead } from "void";

import { listBlogPosts } from "#/features/blog.ts";
import { voidHead } from "#/libs/void-head.ts";

import type { Props } from "./index.island.tsx";

export const loader = defineHandler(async (): Promise<Props> => {
  const { items } = await listBlogPosts();
  return { posts: items, renderedAt: Date.now() };
});

export const head = defineHead(() => voidHead({ title: "TrashBox", description: "Blog list" }));
