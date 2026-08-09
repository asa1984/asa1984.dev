import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  type BlogFrontmatter,
  type ContextFrontmatter,
  parseBlogPost,
  parseContextPost,
} from "./frontmatter";

const POST_FILE = "post.md";

export type LocalBlog = BlogFrontmatter & {
  slug: string;
  content: string;
  images: string[];
  dir: string;
};

export type LocalContext = ContextFrontmatter & {
  slug: string;
  content: string;
  images: string[];
  dir: string;
};

function listSlugDirs(root: string): string[] {
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .toSorted();
}

function listImages(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name !== POST_FILE)
    .map((entry) => entry.name)
    .toSorted();
}

export function loadBlogs(contentDir: string): LocalBlog[] {
  const root = join(contentDir, "blog");
  return listSlugDirs(root).map((slug) => {
    const dir = join(root, slug);
    const source = readFileSync(join(dir, POST_FILE), "utf8");
    let parsed: ReturnType<typeof parseBlogPost>;
    try {
      parsed = parseBlogPost(source);
    } catch (err) {
      throw new Error(`blog/${slug}/${POST_FILE}: ${String(err)}`, {
        cause: err,
      });
    }
    const images = listImages(dir);
    if (!images.includes(parsed.frontmatter.image)) {
      throw new Error(
        `blog/${slug}: image "${parsed.frontmatter.image}" does not exist`,
      );
    }
    return {
      slug,
      ...parsed.frontmatter,
      content: parsed.content,
      images,
      dir,
    };
  });
}

export function loadContexts(contentDir: string): LocalContext[] {
  const root = join(contentDir, "context");
  return listSlugDirs(root).map((slug) => {
    const dir = join(root, slug);
    const source = readFileSync(join(dir, POST_FILE), "utf8");
    let parsed: ReturnType<typeof parseContextPost>;
    try {
      parsed = parseContextPost(source);
    } catch (err) {
      throw new Error(`context/${slug}/${POST_FILE}: ${String(err)}`, {
        cause: err,
      });
    }
    return {
      slug,
      ...parsed.frontmatter,
      content: parsed.content,
      images: listImages(dir),
      dir,
    };
  });
}
