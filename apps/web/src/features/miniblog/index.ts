import { boolean, date, object, string, emoji, type Output } from "valibot";
import { client } from "@/libs/api";

export const frontmatter_schema = object({
  title: string(),
  emoji: string([emoji()]),
  date: date(),
  published: boolean(),
});

export type Frontmatter = Output<typeof frontmatter_schema>;

export type Post = {
  slug: string;
  meta: Frontmatter;
  content: string;
};

export async function get_post(slug: string): Promise<Post> {
  const $get = client.api.contexts[":slug"].$get;
  const resp = await $get({ param: { slug } });
  if (!resp) throw new Error("Not found");
  const context = await resp.json();
  const meta: Frontmatter = {
    title: context.title,
    emoji: context.emoji,
    date: new Date(context.createdAt),
    published: context.published,
  };
  return {
    slug,
    meta,
    content: context.content,
  };
}

export async function get_posts(): Promise<Post[]> {
  const resp = await client.api.contexts.$get();
  const contexts = await resp.json();
  const posts = contexts
    .map((context) => {
      const meta: Frontmatter = {
        title: context.title,
        emoji: context.emoji,
        date: new Date(context.createdAt),
        published: context.published,
      };
      return {
        slug: context.slug,
        meta,
        content: context.content,
      };
    })
    .filter((post) => post.meta.published);
  return posts;
}
