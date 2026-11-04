import { defineHandler, defineHead } from "void";

import { listContextPosts } from "#/features/context.ts";
import { voidHead } from "#/libs/void-head.ts";

import type { Props } from "./index.island.tsx";

export const loader = defineHandler(async (): Promise<Props> => {
  const { items } = await listContextPosts();
  return { posts: items };
});

export const head = defineHead(() => voidHead({ title: "Context", description: "Context list" }));
