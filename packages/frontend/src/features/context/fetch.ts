import { client } from "@/libs/graphql";
import GetContextBySlug from "./getContextBySlug.graphql";
import GetContexts from "./getContexts.graphql";

export type Frontmatter = {
  title: string;
  emoji: string;
  date: Date;
  published: boolean;
};

export type Post = {
  slug: string;
  meta: Frontmatter;
  content: string;
};

export const get_published_posts = async (): Promise<Post[]> => {
  const result = await client.query(GetContexts, {});
  const contexts = result.data?.contexts;
  if (!contexts) return [];
  const published_contexts = contexts.filter((context) => context.published);

  return contexts.map((context) => {
    const frontmatter: Frontmatter = {
      title: context.title,
      emoji: context.emoji,
      date: new Date(context.createdAt),
      published: context.published,
    };
    return {
      slug: context.slug,
      meta: frontmatter,
      content: context.content,
    };
  });
};

// Newer posts first
export const get_posts_date_sorted = async (): Promise<Post[]> => {
  const posts = await get_published_posts();
  return posts.sort((prev, next) => {
    return next.meta.date.getTime() - prev.meta.date.getTime();
  });
};

export const get_post = async (slug: string): Promise<Post | null> => {
  const result = await client.query(GetContextBySlug, { slug });
  const context = result.data?.context;
  if (!context) return null;

  const frontmatter: Frontmatter = {
    title: context.title,
    emoji: context.emoji,
    date: new Date(context.createdAt),
    published: context.published,
  };
  return {
    slug: context.slug,
    meta: frontmatter,
    content: context.content,
  };
};
