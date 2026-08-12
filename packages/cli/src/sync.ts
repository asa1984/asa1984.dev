import type {
  RemoteBlog,
  RemoteContext,
  RemoteImage,
  UpsertBlogInput,
  UpsertContextInput,
} from "./api";
import type { LocalBlog, LocalContext } from "./content";
import { imageKey } from "./image-key";

export type LocalImage = {
  content: "blog" | "context";
  slug: string;
  file: string;
  path: string;
  key: string;
  md5: string;
};

export type SyncPlan = {
  blogUpserts: LocalBlog[];
  blogDeletes: string[];
  contextUpserts: LocalContext[];
  contextDeletes: string[];
  imageUploads: LocalImage[];
  imageDeletes: string[];
};

export const isEmptyPlan = (plan: SyncPlan): boolean =>
  plan.blogUpserts.length === 0 &&
  plan.blogDeletes.length === 0 &&
  plan.contextUpserts.length === 0 &&
  plan.contextDeletes.length === 0 &&
  plan.imageUploads.length === 0 &&
  plan.imageDeletes.length === 0;

// A post without a `date` in its frontmatter leaves createdAt to the backend,
// so the remote value must not be treated as a difference.
const createdAtChanged = (
  local: { date?: string },
  remote: { createdAt: string },
): boolean => local.date !== undefined && local.date !== remote.createdAt;

const blogChanged = (local: LocalBlog, remote: RemoteBlog): boolean =>
  local.title !== remote.title ||
  local.image !== remote.image ||
  local.description !== remote.description ||
  local.published !== remote.published ||
  local.content !== remote.content ||
  createdAtChanged(local, remote);

const contextChanged = (local: LocalContext, remote: RemoteContext): boolean =>
  local.title !== remote.title ||
  local.emoji !== remote.emoji ||
  local.published !== remote.published ||
  local.content !== remote.content ||
  createdAtChanged(local, remote);

export const toUpsertBlogInput = (local: LocalBlog): UpsertBlogInput => ({
  slug: local.slug,
  title: local.title,
  image: local.image,
  description: local.description,
  content: local.content,
  published: local.published,
  ...(local.date === undefined ? {} : { createdAt: local.date }),
});

export const toUpsertContextInput = (
  local: LocalContext,
): UpsertContextInput => ({
  slug: local.slug,
  title: local.title,
  emoji: local.emoji,
  content: local.content,
  published: local.published,
  ...(local.date === undefined ? {} : { createdAt: local.date }),
});

export function collectLocalImages(
  blogs: LocalBlog[],
  contexts: LocalContext[],
  md5Of: (path: string) => string,
): LocalImage[] {
  const entries: {
    content: "blog" | "context";
    slug: string;
    file: string;
    dir: string;
  }[] = [
    ...blogs.flatMap((b) =>
      b.images.map((file) => ({
        content: "blog" as const,
        slug: b.slug,
        file,
        dir: b.dir,
      })),
    ),
    ...contexts.flatMap((c) =>
      c.images.map((file) => ({
        content: "context" as const,
        slug: c.slug,
        file,
        dir: c.dir,
      })),
    ),
  ];
  return entries.map(({ content, slug, file, dir }) => {
    const path = `${dir}/${file}`;
    return {
      content,
      slug,
      file,
      path,
      key: imageKey(content, slug, file),
      md5: md5Of(path),
    };
  });
}

export function planSync(input: {
  localBlogs: LocalBlog[];
  localContexts: LocalContext[];
  localImages: LocalImage[];
  remoteBlogs: RemoteBlog[];
  remoteContexts: RemoteContext[];
  remoteImages: RemoteImage[];
}): SyncPlan {
  const remoteBlogBySlug = new Map(input.remoteBlogs.map((b) => [b.slug, b]));
  const remoteContextBySlug = new Map(
    input.remoteContexts.map((c) => [c.slug, c]),
  );
  const localBlogSlugs = new Set(input.localBlogs.map((b) => b.slug));
  const localContextSlugs = new Set(input.localContexts.map((c) => c.slug));

  // R2 etag is the MD5 of the object body (single-part uploads), so an
  // etag mismatch means the file changed and must be re-uploaded.
  const remoteEtagByKey = new Map(
    input.remoteImages.map((o) => [o.key, o.etag.replaceAll('"', "")]),
  );
  const localKeys = new Set(input.localImages.map((i) => i.key));

  return {
    blogUpserts: input.localBlogs.filter((local) => {
      const remote = remoteBlogBySlug.get(local.slug);
      return !remote || blogChanged(local, remote);
    }),
    blogDeletes: input.remoteBlogs
      .filter((remote) => !localBlogSlugs.has(remote.slug))
      .map((remote) => remote.slug),
    contextUpserts: input.localContexts.filter((local) => {
      const remote = remoteContextBySlug.get(local.slug);
      return !remote || contextChanged(local, remote);
    }),
    contextDeletes: input.remoteContexts
      .filter((remote) => !localContextSlugs.has(remote.slug))
      .map((remote) => remote.slug),
    imageUploads: input.localImages.filter(
      (image) => remoteEtagByKey.get(image.key) !== image.md5,
    ),
    imageDeletes: [...remoteEtagByKey.keys()].filter(
      (key) => !localKeys.has(key),
    ),
  };
}
