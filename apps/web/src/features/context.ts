import { z } from "zod";

import type { Page, PageRequest, Post, PostMeta, Slug } from "#/features/content.ts";
import { instantSchema, paginate, parsePosts } from "#/features/content.ts";

const frontmatterSchema = z.object({
  title: z.string().min(1),
  emoji: z.string().min(1),
  date: instantSchema,
});
type Frontmatter = z.infer<typeof frontmatterSchema>;

/** What Context shows of a post outside its own page. */
export type ContextPostMeta = PostMeta<Frontmatter>;

/** A post of Context, the short essays. */
export type ContextPost = Post<Frontmatter>;

const sources = import.meta.glob<string>("../../../../contents/context/*/index.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

const readPosts = () => parsePosts({ sources, schema: frontmatterSchema });

/** The Context posts in the requested slice, newest first. */
export const listContextPosts = (request: PageRequest = {}): Promise<Page<ContextPostMeta>> =>
  Promise.resolve(paginate({ items: readPosts().map(({ meta }) => meta), ...request }));

/** The Context post with the slug, if any. */
export const getContextPost = (slug: Slug): Promise<ContextPost | undefined> => {
  const post = readPosts().find(({ meta }) => meta.slug === slug);
  return Promise.resolve(post === undefined ? undefined : { ...post.meta, body: post.body });
};
