import fs from "fs/promises";
import matter from "gray-matter";
import {
  boolean,
  date,
  object,
  safeParse,
  string,
  emoji,
  type Output,
  type Issues,
} from "valibot";
import { Result, Ok, Err } from "@sniptt/monads";

export const frontmatter_schema = object({
  title: string(),
  emoji: string([emoji()]),
  date: date(),
  published: boolean(),
});

export type Frontmatter = Output<typeof frontmatter_schema>;

export function parse_frontmatter(source: string): Result<
  {
    meta: Frontmatter;
    content: string;
  },
  Issues
> {
  const { data, content } = matter(source);
  const parsed = safeParse(frontmatter_schema, data);

  return parsed.success
    ? Ok({ meta: parsed.output, content })
    : Err(parsed.issues);
}

export type Post = {
  slug: string;
  meta: Frontmatter;
  content: string;
};

export async function get_post(slug: string): Promise<Post> {
  const source = await fs.readFile(`./public/context/${slug}/post.md`, "utf-8");

  const { meta, content } = parse_frontmatter(source).unwrapOrElse(() => {
    throw new Error("Failed to parse frontmatter");
  });
  return {
    slug,
    meta,
    content,
  };
}

export async function get_posts(): Promise<Post[]> {
  const files = await fs.readdir("./public/context");
  const result = await Promise.allSettled(
    files.map(async (file) => {
      const slug = file.replace(/\.md$/, "");
      return await get_post(slug);
    }),
  );
  const posts = result
    .map((r) => {
      return r.status === "fulfilled" ? r.value : null;
    })
    .filter((p): p is Post => p !== null);

  return posts.filter((p) => p.meta.published);
}
