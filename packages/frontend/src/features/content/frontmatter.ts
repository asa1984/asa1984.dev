import { parse } from "yaml";
import { z } from "zod";

// Ported from the sync CLI's frontmatter schema. With the database gone
// there is no created_at to fall back on, so `date` is required here —
// the frontmatter is the only place a post's date can come from.
const date_schema = z
  .union([z.string().min(1), z.date()])
  .transform((value) => (value instanceof Date ? value.toISOString() : value))
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "date must be a parseable date",
  });

export const blog_frontmatter_schema = z.object({
  title: z.string().min(1),
  image: z.string().min(1),
  description: z.string().min(1),
  published: z.boolean(),
  date: date_schema,
});

export const context_frontmatter_schema = z.object({
  title: z.string().min(1),
  emoji: z.string().min(1),
  published: z.boolean(),
  date: date_schema,
});

export type BlogFrontmatter = z.infer<typeof blog_frontmatter_schema>;
export type ContextFrontmatter = z.infer<typeof context_frontmatter_schema>;

export function split_frontmatter(source: string): {
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

export function parse_blog_post(source: string): {
  frontmatter: BlogFrontmatter;
  content: string;
} {
  const { header, body } = split_frontmatter(source);
  return {
    frontmatter: blog_frontmatter_schema.parse(parse(header)),
    content: body,
  };
}

export function parse_context_post(source: string): {
  frontmatter: ContextFrontmatter;
  content: string;
} {
  const { header, body } = split_frontmatter(source);
  return {
    frontmatter: context_frontmatter_schema.parse(parse(header)),
    content: body,
  };
}
