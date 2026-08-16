import { parse_context_post } from "@/features/content/frontmatter";
import { fetch_content_text, list_content_paths } from "@/features/content/github";

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

const POST_PATH = /^context\/([^/]+)\/post\.md$/;

const list_slugs = async (): Promise<string[]> => {
  const paths = await list_content_paths();
  return paths
    .map((path) => POST_PATH.exec(path)?.[1])
    .filter((slug): slug is string => slug !== undefined);
};

const load_post = async (slug: string): Promise<Post> => {
  const source = await fetch_content_text(`context/${slug}/post.md`);
  const { frontmatter, content } = parse_context_post(source);
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

export const get_published_posts = async (): Promise<Post[]> => {
  const slugs = await list_slugs();
  const posts = await Promise.all(slugs.map((slug) => load_post(slug)));
  return posts.filter((post) => post.meta.published);
};

// Newer posts first
export const get_posts_date_sorted = async (): Promise<Post[]> => {
  const posts = await get_published_posts();
  return posts.toSorted((prev, next) => {
    return next.meta.date.getTime() - prev.meta.date.getTime();
  });
};

export const get_post = async (slug: string): Promise<Post | null> => {
  const slugs = await list_slugs();
  if (!slugs.includes(slug)) {
    return null;
  }
  const post = await load_post(slug);
  // Drafts are invisible, not just unlisted.
  return post.meta.published ? post : null;
};
