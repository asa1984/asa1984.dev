import { z } from "zod";

import { parsePosts } from "#/features/content.ts";

const frontmatterSchema = z.object({
  title: z.string().min(1),
  emoji: z.string().min(1),
  date: z.coerce.date(),
});

/** A post of Context, the short essays. */
export type ContextPost = {
  slug: string;
  title: string;
  emoji: string;
  date: Date;
  body: string;
  /** Site-relative URL of the directory that holds the post's images. */
  assetBase: string;
};

const sources = import.meta.glob<string>("../../../../contents/context/*/index.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

/** Context posts, newest first. */
export const contextPosts: ContextPost[] = parsePosts({
  sources,
  schema: frontmatterSchema,
}).map(({ slug, frontmatter, body }) => ({
  slug,
  title: frontmatter.title,
  emoji: frontmatter.emoji,
  date: frontmatter.date,
  body,
  assetBase: `/content-assets/context/${slug}`,
}));

/** The Context post with the slug, if any. */
export const findContextPost = (slug: string): ContextPost | undefined =>
  contextPosts.find((post) => post.slug === slug);
