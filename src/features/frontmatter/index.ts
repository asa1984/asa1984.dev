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
    ? Ok({ frontmatter: parsed.output, content })
    : Err(parsed.issues);
}
