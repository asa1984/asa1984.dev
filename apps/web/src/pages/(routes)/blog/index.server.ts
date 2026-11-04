import { defineHandler, defineHead } from "void";

import { listBlogPostSummaries } from "#/features/blog.ts";
import { voidHead } from "#/libs/void-head.ts";

import type { Props } from "./index.island.tsx";

export const loader = defineHandler((): Props => ({
  posts: listBlogPostSummaries(),
  renderedAt: Date.now(),
}));

export const head = defineHead(() => voidHead({ title: "TrashBox", description: "Blog list" }));
