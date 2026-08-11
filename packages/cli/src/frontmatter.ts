import { parse } from "yaml";
import { z } from "zod";

export const blogFrontmatterSchema = z.object({
  title: z.string().min(1),
  image: z.string().min(1),
  description: z.string().min(1),
  published: z.boolean(),
});

export const contextFrontmatterSchema = z.object({
  title: z.string().min(1),
  emoji: z.string().min(1),
  published: z.boolean(),
});

export type BlogFrontmatter = z.infer<typeof blogFrontmatterSchema>;
export type ContextFrontmatter = z.infer<typeof contextFrontmatterSchema>;

export function splitFrontmatter(source: string): {
  header: string;
  body: string;
} {
  const lines = source.split(/\r?\n/);
  if (lines[0] !== "---") throw new Error('Missing beginning "---"');
  const end = lines.indexOf("---", 1);
  if (end === -1) throw new Error('Missing ending "---"');
  return {
    header: lines.slice(1, end).join("\n"),
    body: lines.slice(end + 1).join("\n"),
  };
}

export function parseBlogPost(source: string): {
  frontmatter: BlogFrontmatter;
  content: string;
} {
  const { header, body } = splitFrontmatter(source);
  return {
    frontmatter: blogFrontmatterSchema.parse(parse(header)),
    content: body,
  };
}

export function parseContextPost(source: string): {
  frontmatter: ContextFrontmatter;
  content: string;
} {
  const { header, body } = splitFrontmatter(source);
  return {
    frontmatter: contextFrontmatterSchema.parse(parse(header)),
    content: body,
  };
}
