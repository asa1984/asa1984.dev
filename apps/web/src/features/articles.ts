import { findBlogPost } from "#/features/blog.ts";
import { findContextPost } from "#/features/context.ts";
import type { ArticleDocument } from "#/features/markdown.ts";
import { loadArticle } from "#/features/markdown.ts";

// The post lists (blog.ts, context.ts) stay free of the Markdown pipeline because the RSS build
// loads blog.ts on its own, so compiling a post for its page lives here.

/** A blog post ready to render. */
export type BlogArticle = {
  title: string;
  description: string;
  /** Site-relative URL of the cover image. */
  image: string;
  /** ISO 8601 date of the post. */
  date: string;
  document: ArticleDocument;
};

/** Compiles the blog post with the slug for rendering, if there is one. */
export const loadBlogArticle = async (slug: string): Promise<BlogArticle | undefined> => {
  const post = findBlogPost(slug);
  if (post === undefined) {
    return undefined;
  }
  return {
    title: post.title,
    description: post.description,
    image: post.image,
    date: post.date.toISOString(),
    document: await loadArticle({ source: post.body, assetBase: post.assetBase }),
  };
};

/** A Context post ready to render. */
export type ContextArticle = {
  title: string;
  /** ISO 8601 date of the post. */
  date: string;
  document: ArticleDocument;
};

/** Compiles the Context post with the slug for rendering, if there is one. */
export const loadContextArticle = async (slug: string): Promise<ContextArticle | undefined> => {
  const post = findContextPost(slug);
  if (post === undefined) {
    return undefined;
  }
  return {
    title: post.title,
    date: post.date.toISOString(),
    document: await loadArticle({ source: post.body, assetBase: post.assetBase }),
  };
};
