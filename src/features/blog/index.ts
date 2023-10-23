import fs from "fs/promises";
import matter from "gray-matter";
import {
  array,
  boolean,
  date,
  object,
  safeParse,
  string,
  type Output,
  type Issues,
} from "valibot";
import { Result, Ok, Err } from "@sniptt/monads";

export const frontmatter_schema = object({
  title: string(),
  description: string(),
  image: string(),
  date: date(),
  tags: array(string()),
  published: boolean(),
});

export type Frontmatter = Output<typeof frontmatter_schema>;

export function parse_frontmatter(source: string): Result<
  {
    frontmatter: Frontmatter;
    content: string;
  },
  Issues
> {
  const { data, content } = matter(source);
  const parsed = safeParse(frontmatter_schema, data);

  return parsed.success
    ? Ok({
        frontmatter: parsed.output,
        content,
      })
    : Err(parsed.issues);
}

export type Post = {
  slug: string;
  meta: Frontmatter;
  content: string;
};

export async function get_post(slug: string): Promise<Post> {
  const source = await fs.readFile(`./public/posts/${slug}/post.md`, "utf-8");

  const { frontmatter, content } = parse_frontmatter(source).unwrapOrElse(
    () => {
      throw new Error("Failed to parse frontmatter");
    },
  );
  return {
    slug,
    meta: frontmatter,
    content,
  };
}

export async function get_posts(): Promise<Post[]> {
  const dirs = await fs.readdir("./public/posts");
  const result = await Promise.allSettled(dirs.map((slug) => get_post(slug)));
  const posts = result
    .map((r) => {
      return r.status === "fulfilled" ? r.value : null;
    })
    .filter((p): p is Post => p !== null);

  return posts.filter((p) => p.meta.published);
}
