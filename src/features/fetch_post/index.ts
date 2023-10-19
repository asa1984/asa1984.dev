import fs from "fs/promises";

import { parse_frontmatter, type Frontmatter } from "@/features/frontmatter";

export type Post = {
  slug: string;
  meta: Frontmatter;
  content: string;
};

export async function fetch_post(slug: string): Promise<Post> {
  const source = await fs.readFile(`./posts/${slug}.md`, "utf-8");
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

export async function fetch_posts(): Promise<Post[]> {
  const files = await fs.readdir("./posts");
  const result = await Promise.allSettled(
    files.map(async (file) => {
      const slug = file.replace(/\.md$/, "");
      return await fetch_post(slug);
    }),
  );
  const posts = result
    .map((r) => {
      return r.status === "fulfilled" ? r.value : null;
    })
    .filter((p): p is Post => p !== null);

  return posts.filter((p) => p.meta.published);
}
