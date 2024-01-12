import { client } from "@/libs/graphql";
import GetContexts from "./getContexts.graphql";
import GetContextBySlug from "./getContextBySlug.graphql";

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

export const get_posts = async (): Promise<Post[]> => {
  const result = await client.query(GetContexts, {});
  const contexts = result.data?.contexts!;

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

export const get_post = async (slug: string): Promise<Post> => {
  const result = await client.query(GetContextBySlug, { slug });
  const context = result.data?.context;
  if (!context) throw new Error("Not found");
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
