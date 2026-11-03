import { defineHandler, defineHead } from "void";
import type { InferProps } from "void";

import { contextPosts } from "#/features/context.ts";
import { pageHead } from "#/libs/head.ts";

export const loader = defineHandler(() => ({
  posts: contextPosts.map(({ slug, title, emoji, date }) => ({
    slug,
    title,
    emoji,
    date: date.toISOString(),
  })),
}));

export type Props = InferProps<typeof loader>;

export const head = defineHead(() => pageHead({ title: "Context", description: "Context list" }));
