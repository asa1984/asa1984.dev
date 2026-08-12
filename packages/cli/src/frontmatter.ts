import { parse } from "yaml";
import { z } from "zod";

/**
 * Creation date of a post, stored verbatim as the backend's `createdAt`.
 *
 * The value is kept as the string the author wrote (`2024-01-15 10:30:00`,
 * `2024-01-15T10:30:00Z`, …) instead of being reformatted, so that the
 * frontmatter and the database hold the exact same text and the sync diff
 * stays stable. A YAML parser that resolves timestamps to `Date` — the
 * default schema of `yaml` does not — is normalized to an ISO string.
 */
const dateSchema = z
  .union([z.string().min(1), z.date()])
  .transform((value) => (value instanceof Date ? value.toISOString() : value))
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "date must be a parseable date",
  });

export const blogFrontmatterSchema = z.object({
  title: z.string().min(1),
  image: z.string().min(1),
  description: z.string().min(1),
  published: z.boolean(),
  date: dateSchema.optional(),
});

export const contextFrontmatterSchema = z.object({
  title: z.string().min(1),
  emoji: z.string().min(1),
  published: z.boolean(),
  date: dateSchema.optional(),
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
