import { z } from "zod";

import { parsePosts } from "#/features/content.ts";

const frontmatterSchema = z.object({
  title: z.string().min(1),
  /** File name of the cover image in the post's asset directory. */
  image: z.string().min(1),
  description: z.string().min(1),
  published: z.boolean(),
  date: z.coerce.date(),
});

/** A published post of the blog, TrashBox. */
export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  /** Site-relative URL of the cover image. */
  image: string;
  date: Date;
  body: string;
  /** Site-relative URL of the directory that holds the post's images. */
  assetBase: string;
};

const sources = import.meta.glob<string>("/src/content/blog/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

/** Published blog posts, newest first. */
export const blogPosts: BlogPost[] = parsePosts({ sources, schema: frontmatterSchema }).map(
  ({ slug, frontmatter, body }) => {
    const assetBase = `/content-assets/blog/${slug}`;
    return {
      slug,
      title: frontmatter.title,
      description: frontmatter.description,
      image: `${assetBase}/${frontmatter.image}`,
      date: frontmatter.date,
      body,
      assetBase,
    };
  },
);

/** The published blog post with the slug, if any. */
export const findBlogPost = (slug: string): BlogPost | undefined =>
  blogPosts.find((post) => post.slug === slug);
