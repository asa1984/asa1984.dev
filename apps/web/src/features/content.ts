import { parse } from "yaml";
import type { z } from "zod";

/** A post parsed from `contents/<collection>/<slug>/index.md`. */
export type Post<Frontmatter> = {
  slug: string;
  frontmatter: Frontmatter;
  body: string;
};

/** The frontmatter fields every collection has. */
type BaseFrontmatter = {
  date: Date;
};

/** Splits a Markdown source into its YAML frontmatter and the body that follows. */
export const splitFrontmatter = (source: string): { header: string; body: string } => {
  const lines = source.split(/\r?\n/u);
  if (lines[0] !== "---") {
    throw new Error('Missing beginning "---"');
  }
  const end = lines.indexOf("---", 1);
  if (end === -1) {
    throw new Error('Missing ending "---"');
  }
  return {
    header: lines.slice(1, end).join("\n"),
    body: lines.slice(end + 1).join("\n"),
  };
};

const slugPattern = /([^/]+)\/index\.md$/u;

/**
 * Parses the posts of a collection, keyed by their path as `import.meta.glob` returns them, newest
 * first. Every post in contents/ is published; drafts are never committed.
 */
export const parsePosts = <Frontmatter extends BaseFrontmatter>({
  sources,
  schema,
}: {
  sources: Record<string, string>;
  schema: z.ZodType<Frontmatter>;
}): Post<Frontmatter>[] =>
  Object.entries(sources)
    .map(([path, source]) => {
      const slug = slugPattern.exec(path)?.[1];
      if (slug === undefined) {
        throw new Error(`Not a post path: ${path}`);
      }
      const { header, body } = splitFrontmatter(source);
      return { slug, frontmatter: schema.parse(parse(header)), body };
    })
    .toSorted((a, b) => b.frontmatter.date.getTime() - a.frontmatter.date.getTime());
