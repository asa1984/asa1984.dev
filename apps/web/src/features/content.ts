// workerd, which prerenders the pages, has no Temporal; the shim installs it only where it is
// missing, so Node keeps its own.
// oxlint-disable-next-line import/no-unassigned-import
import "temporal-polyfill/global";
import { parse } from "yaml";
import { z } from "zod";

import type { SitePath } from "#/libs/site-path.ts";
import { sitePathSchema } from "#/libs/site-path.ts";

/** The collections under `contents/`. */
export type Collection = "blog" | "context";

/** The name of a post's directory, which is also the last segment of its URL. */
export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u)
  .brand<"Slug">();
export type Slug = z.infer<typeof slugSchema>;

/** The name of a file in a post's directory, such as its cover image. */
export const assetFileNameSchema = z
  .string()
  .regex(/^[\w.-]+$/u)
  .refine((name) => name !== "." && name !== "..")
  .brand<"AssetFileName">();
export type AssetFileName = z.infer<typeof assetFileNameSchema>;

/** An exact time written as an ISO 8601 string with an offset, such as `2023-10-23T00:00:00Z`. */
export const instantSchema = z.iso
  .datetime({ offset: true })
  .transform((value) => Temporal.Instant.from(value));

/** The frontmatter fields every collection has. */
type BaseFrontmatter = {
  date: Temporal.Instant;
};

/** What a post's frontmatter says about it, without its body. */
export type PostMeta<Frontmatter> = Frontmatter & { slug: Slug };

/** A post with its Markdown body. */
export type Post<Frontmatter> = PostMeta<Frontmatter> & { body: string };

/** A slice of a list, with the size of the whole list. */
export type Page<Item> = {
  items: Item[];
  total: number;
};

/** Which slice of a list to take. Without a limit, it runs to the end. */
export type PageRequest = {
  offset?: number;
  limit?: number;
};

/** Takes the requested slice of `items`. */
export const paginate = <Item>({
  items,
  offset = 0,
  limit = items.length,
}: PageRequest & { items: Item[] }): Page<Item> => ({
  items: items.slice(offset, offset + limit),
  total: items.length,
});

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
}): { meta: PostMeta<Frontmatter>; body: string }[] =>
  Object.entries(sources)
    .map(([path, source]) => {
      const slug = slugSchema.safeParse(slugPattern.exec(path)?.[1]);
      if (!slug.success) {
        throw new Error(`Not a post path: ${path}`);
      }
      const { header, body } = splitFrontmatter(source);
      return { meta: { ...schema.parse(parse(header)), slug: slug.data }, body };
    })
    .toSorted((a, b) => Temporal.Instant.compare(b.meta.date, a.meta.date));

/** The URL path of a post's directory, or of a file in it. */
export const postAssetPath = ({
  collection,
  slug,
  file,
}: {
  collection: Collection;
  slug: Slug;
  file?: AssetFileName;
}): SitePath =>
  sitePathSchema.parse(
    `/content-assets/${collection}/${slug}${file === undefined ? "" : `/${file}`}`,
  );
