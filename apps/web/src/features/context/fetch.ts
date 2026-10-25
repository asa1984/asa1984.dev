import { parse_context_post } from "#/features/content/frontmatter.ts";
import type { ContentSource } from "#/features/content/github.ts";
import { github_content } from "#/features/content/github.ts";

export type Frontmatter = {
  title: string;
  emoji: string;
  date: Date;
  published: boolean;
};

export type Post = {
  slug: string;
  meta: Frontmatter;
  content: string;
};

const POST_PATH = /^context\/([^/]+)\/post\.md$/u;

const list_slugs = async (source: ContentSource): Promise<string[]> => {
  const paths = await source.list_content_paths();
  return paths
    .map((path) => POST_PATH.exec(path)?.[1])
    .filter((slug): slug is string => slug !== undefined);
};

const load_post = async ({
  source,
  slug,
}: {
  source: ContentSource;
  slug: string;
}): Promise<Post> => {
  const text = await source.fetch_content_text(`context/${slug}/post.md`);
  const { frontmatter, content } = parse_context_post(text);
  return {
    slug,
    meta: {
      title: frontmatter.title,
      emoji: frontmatter.emoji,
      date: new Date(frontmatter.date),
      published: frontmatter.published,
    },
    content,
  };
};

/** Options shared by the post loaders. */
type LoaderOptions = { source?: ContentSource };

export const get_published_posts = async ({ source = github_content }: LoaderOptions = {}): Promise<
  Post[]
> => {
  const slugs = await list_slugs(source);
  const posts = await Promise.all(slugs.map((slug) => load_post({ source, slug })));
  return posts.filter((post) => post.meta.published);
};

// Newer posts first
export const get_posts_date_sorted = async ({
  source = github_content,
}: LoaderOptions = {}): Promise<Post[]> => {
  const posts = await get_published_posts({ source });
  return posts.toSorted((prev, next) => next.meta.date.getTime() - prev.meta.date.getTime());
};

export const get_post = async ({
  slug,
  source = github_content,
}: { slug: string } & LoaderOptions): Promise<Post | null> => {
  const slugs = await list_slugs(source);
  if (!slugs.includes(slug)) {
    return null;
  }
  const post = await load_post({ source, slug });
  // Drafts are invisible, not just unlisted.
  return post.meta.published ? post : null;
};
