import { z } from "zod";

import type { Page, PageRequest, Post, PostMeta, Slug } from "#/features/content.ts";
import { assetFileNameSchema, instantSchema, paginate, parsePosts } from "#/features/content.ts";

const frontmatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  /** The cover image in the post's directory. */
  image: assetFileNameSchema,
  date: instantSchema,
});
type Frontmatter = z.infer<typeof frontmatterSchema>;

/** What the blog shows of a post outside its own page. */
export type BlogPostMeta = PostMeta<Frontmatter>;

/** A post of the blog, TrashBox. */
export type BlogPost = Post<Frontmatter>;

const sources = import.meta.glob<string>("../../../../contents/blog/*/index.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

const readPosts = () => parsePosts({ sources, schema: frontmatterSchema });

/** The blog posts in the requested slice, newest first. */
export const listBlogPosts = (request: PageRequest = {}): Promise<Page<BlogPostMeta>> =>
  Promise.resolve(paginate({ items: readPosts().map(({ meta }) => meta), ...request }));

/** The blog post with the slug, if any. */
export const getBlogPost = (slug: Slug): Promise<BlogPost | undefined> => {
  const post = readPosts().find(({ meta }) => meta.slug === slug);
  return Promise.resolve(post === undefined ? undefined : { ...post.meta, body: post.body });
};
