import { defineHandler, defineHead } from "void";
import type { InferProps } from "void";

import { blogPosts } from "#/features/blog.ts";
import { pageHead } from "#/libs/head.ts";

export const loader = defineHandler(() => ({
  posts: blogPosts.map(({ slug, title, description, image, date }) => ({
    slug,
    title,
    description,
    image,
    date: date.toISOString(),
  })),
  renderedAt: Date.now(),
}));

export type Props = InferProps<typeof loader>;

export const head = defineHead(() => pageHead({ title: "TrashBox", description: "Blog list" }));
