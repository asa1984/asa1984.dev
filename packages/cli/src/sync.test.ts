import { describe, expect, it } from "vitest";
import type { RemoteBlog, RemoteContext, RemoteImage } from "./api";
import type { LocalBlog, LocalContext } from "./content";
import { imageKey } from "./image-key";
import {
  collectLocalImages,
  isEmptyPlan,
  type LocalImage,
  planSync,
  type SyncPlan,
  toUpsertBlogInput,
  toUpsertContextInput,
} from "./sync";

const REMOTE_CREATED_AT = "2024-01-01 00:00:00";

const localBlog = (overrides: Partial<LocalBlog> = {}): LocalBlog => ({
  slug: "hello",
  title: "Hello",
  image: "cover.png",
  description: "A post",
  published: true,
  content: "# Body",
  images: ["cover.png"],
  dir: "content/blog/hello",
  ...overrides,
});

const remoteBlogOf = (local: LocalBlog): RemoteBlog => ({
  slug: local.slug,
  title: local.title,
  image: local.image,
  description: local.description,
  published: local.published,
  content: local.content,
  createdAt: local.date ?? REMOTE_CREATED_AT,
});

const localContext = (overrides: Partial<LocalContext> = {}): LocalContext => ({
  slug: "nix",
  title: "Nix",
  emoji: "❄️",
  published: true,
  content: "# Body",
  images: [],
  dir: "content/context/nix",
  ...overrides,
});

const remoteContextOf = (local: LocalContext): RemoteContext => ({
  slug: local.slug,
  title: local.title,
  emoji: local.emoji,
  published: local.published,
  content: local.content,
  createdAt: local.date ?? REMOTE_CREATED_AT,
});

const localImage = (overrides: Partial<LocalImage> = {}): LocalImage => ({
  content: "blog",
  slug: "hello",
  file: "cover.png",
  path: "content/blog/hello/cover.png",
  key: imageKey("blog", "hello", "cover.png"),
  md5: "d41d8cd98f00b204e9800998ecf8427e",
  ...overrides,
});

const plan = (input: {
  localBlogs?: LocalBlog[];
  localContexts?: LocalContext[];
  localImages?: LocalImage[];
  remoteBlogs?: RemoteBlog[];
  remoteContexts?: RemoteContext[];
  remoteImages?: RemoteImage[];
}): SyncPlan =>
  planSync({
    localBlogs: input.localBlogs ?? [],
    localContexts: input.localContexts ?? [],
    localImages: input.localImages ?? [],
    remoteBlogs: input.remoteBlogs ?? [],
    remoteContexts: input.remoteContexts ?? [],
    remoteImages: input.remoteImages ?? [],
  });

describe("planSync: blogs", () => {
  it("upserts a blog that does not exist remotely", () => {
    const local = localBlog();
    expect(plan({ localBlogs: [local] }).blogUpserts).toEqual([local]);
  });

  it("skips a blog whose remote copy is identical", () => {
    const local = localBlog();
    const result = plan({
      localBlogs: [local],
      remoteBlogs: [remoteBlogOf(local)],
    });
    expect(result.blogUpserts).toEqual([]);
    expect(result.blogDeletes).toEqual([]);
  });

  it.each([
    ["title", { title: "Changed" }],
    ["image", { image: "other.png" }],
    ["description", { description: "Changed" }],
    ["published", { published: false }],
    ["content", { content: "# Changed" }],
  ] satisfies [string, Partial<LocalBlog>][])(
    "upserts a blog when %s differs",
    (_field, change) => {
      const remote = remoteBlogOf(localBlog());
      const local = localBlog(change);
      expect(
        plan({ localBlogs: [local], remoteBlogs: [remote] }).blogUpserts,
      ).toEqual([local]);
    },
  );

  it("ignores local-only fields that the backend does not store", () => {
    const remote = remoteBlogOf(localBlog());
    const local = localBlog({
      dir: "somewhere/else",
      images: ["cover.png", "extra.png"],
    });
    expect(
      plan({ localBlogs: [local], remoteBlogs: [remote] }).blogUpserts,
    ).toEqual([]);
  });

  it("upserts a blog whose date differs from the remote createdAt", () => {
    const local = localBlog({ date: "2023-05-05 12:00:00" });
    const remote = remoteBlogOf(localBlog({ date: REMOTE_CREATED_AT }));
    expect(
      plan({ localBlogs: [local], remoteBlogs: [remote] }).blogUpserts,
    ).toEqual([local]);
  });

  it("skips a blog whose date already equals the remote createdAt", () => {
    const local = localBlog({ date: "2023-05-05 12:00:00" });
    expect(
      plan({ localBlogs: [local], remoteBlogs: [remoteBlogOf(local)] })
        .blogUpserts,
    ).toEqual([]);
  });

  it("ignores the remote createdAt when the frontmatter has no date", () => {
    const local = localBlog();
    const remote = remoteBlogOf(localBlog({ date: "1999-12-31 23:59:59" }));
    expect(
      plan({ localBlogs: [local], remoteBlogs: [remote] }).blogUpserts,
    ).toEqual([]);
  });

  it("deletes a blog that only exists remotely", () => {
    const local = localBlog();
    const orphan = remoteBlogOf(localBlog({ slug: "gone" }));
    const result = plan({
      localBlogs: [local],
      remoteBlogs: [remoteBlogOf(local), orphan],
    });
    expect(result.blogDeletes).toEqual(["gone"]);
    expect(result.blogUpserts).toEqual([]);
  });
});

describe("planSync: contexts", () => {
  it("upserts a context that does not exist remotely", () => {
    const local = localContext();
    expect(plan({ localContexts: [local] }).contextUpserts).toEqual([local]);
  });

  it("skips a context whose remote copy is identical", () => {
    const local = localContext();
    expect(
      plan({ localContexts: [local], remoteContexts: [remoteContextOf(local)] })
        .contextUpserts,
    ).toEqual([]);
  });

  it.each([
    ["title", { title: "Changed" }],
    ["emoji", { emoji: "🐧" }],
    ["published", { published: false }],
    ["content", { content: "# Changed" }],
  ] satisfies [string, Partial<LocalContext>][])(
    "upserts a context when %s differs",
    (_field, change) => {
      const remote = remoteContextOf(localContext());
      const local = localContext(change);
      expect(
        plan({ localContexts: [local], remoteContexts: [remote] })
          .contextUpserts,
      ).toEqual([local]);
    },
  );

  it("upserts a context whose date differs from the remote createdAt", () => {
    const local = localContext({ date: "2023-05-05 12:00:00" });
    const remote = remoteContextOf(localContext({ date: REMOTE_CREATED_AT }));
    expect(
      plan({ localContexts: [local], remoteContexts: [remote] }).contextUpserts,
    ).toEqual([local]);
  });

  it("skips a context whose date already equals the remote createdAt", () => {
    const local = localContext({ date: "2023-05-05 12:00:00" });
    expect(
      plan({ localContexts: [local], remoteContexts: [remoteContextOf(local)] })
        .contextUpserts,
    ).toEqual([]);
  });

  it("ignores the remote createdAt when the frontmatter has no date", () => {
    const local = localContext();
    const remote = remoteContextOf(
      localContext({ date: "1999-12-31 23:59:59" }),
    );
    expect(
      plan({ localContexts: [local], remoteContexts: [remote] }).contextUpserts,
    ).toEqual([]);
  });

  it("deletes a context that only exists remotely", () => {
    const orphan = remoteContextOf(localContext({ slug: "gone" }));
    expect(plan({ remoteContexts: [orphan] }).contextDeletes).toEqual(["gone"]);
  });
});

describe("planSync: images", () => {
  it("skips an image whose remote etag equals the local md5", () => {
    const image = localImage({ md5: "abc" });
    const result = plan({
      localImages: [image],
      remoteImages: [{ key: image.key, etag: "abc" }],
    });
    expect(result.imageUploads).toEqual([]);
    expect(result.imageDeletes).toEqual([]);
  });

  it("strips the double quotes R2 wraps the etag in", () => {
    const image = localImage({ md5: "abc" });
    expect(
      plan({
        localImages: [image],
        remoteImages: [{ key: image.key, etag: '"abc"' }],
      }).imageUploads,
    ).toEqual([]);
  });

  it("uploads an image whose remote etag differs from the local md5", () => {
    const image = localImage({ md5: "abc" });
    expect(
      plan({
        localImages: [image],
        remoteImages: [{ key: image.key, etag: '"def"' }],
      }).imageUploads,
    ).toEqual([image]);
  });

  it("uploads an image that does not exist remotely", () => {
    const image = localImage();
    expect(plan({ localImages: [image] }).imageUploads).toEqual([image]);
  });

  it("deletes an image that only exists remotely", () => {
    const image = localImage({ md5: "abc" });
    const orphanKey = imageKey("blog", "hello", "orphan.png");
    const result = plan({
      localImages: [image],
      remoteImages: [
        { key: image.key, etag: '"abc"' },
        { key: orphanKey, etag: '"whatever"' },
      ],
    });
    expect(result.imageDeletes).toEqual([orphanKey]);
    expect(result.imageUploads).toEqual([]);
  });
});

describe("collectLocalImages", () => {
  it("keys every image by content kind, slug and file name", () => {
    const blogs = [
      localBlog({ slug: "hello", images: ["cover.png", "a.png"] }),
    ];
    const contexts = [
      localContext({
        slug: "nix",
        images: ["setup.webp"],
        dir: "content/context/nix",
      }),
    ];
    expect(
      collectLocalImages(blogs, contexts, (path) => `md5:${path}`),
    ).toEqual([
      {
        content: "blog",
        slug: "hello",
        file: "cover.png",
        path: "content/blog/hello/cover.png",
        key: imageKey("blog", "hello", "cover.png"),
        md5: "md5:content/blog/hello/cover.png",
      },
      {
        content: "blog",
        slug: "hello",
        file: "a.png",
        path: "content/blog/hello/a.png",
        key: imageKey("blog", "hello", "a.png"),
        md5: "md5:content/blog/hello/a.png",
      },
      {
        content: "context",
        slug: "nix",
        file: "setup.webp",
        path: "content/context/nix/setup.webp",
        key: imageKey("context", "nix", "setup.webp"),
        md5: "md5:content/context/nix/setup.webp",
      },
    ]);
  });

  it("hashes each image exactly once", () => {
    const seen: string[] = [];
    collectLocalImages(
      [localBlog({ images: ["cover.png", "a.png"] })],
      [],
      (path) => {
        seen.push(path);
        return "md5";
      },
    );
    expect(seen).toEqual([
      "content/blog/hello/cover.png",
      "content/blog/hello/a.png",
    ]);
  });

  it("returns nothing when no post has an image", () => {
    expect(collectLocalImages([], [], () => "md5")).toEqual([]);
  });
});

describe("toUpsertBlogInput", () => {
  it("sends the frontmatter date as createdAt", () => {
    expect(
      toUpsertBlogInput(localBlog({ date: "2023-05-05 12:00:00" })),
    ).toEqual({
      slug: "hello",
      title: "Hello",
      image: "cover.png",
      description: "A post",
      content: "# Body",
      published: true,
      createdAt: "2023-05-05 12:00:00",
    });
  });

  it("omits createdAt entirely when the frontmatter has no date", () => {
    const input = toUpsertBlogInput(localBlog());
    expect(Object.hasOwn(input, "createdAt")).toBe(false);
  });

  it("drops the local-only fields the backend does not accept", () => {
    const input = toUpsertBlogInput(localBlog());
    expect(Object.hasOwn(input, "dir")).toBe(false);
    expect(Object.hasOwn(input, "images")).toBe(false);
  });
});

describe("toUpsertContextInput", () => {
  it("sends the frontmatter date as createdAt", () => {
    expect(
      toUpsertContextInput(localContext({ date: "2023-05-05 12:00:00" })),
    ).toEqual({
      slug: "nix",
      title: "Nix",
      emoji: "❄️",
      content: "# Body",
      published: true,
      createdAt: "2023-05-05 12:00:00",
    });
  });

  it("omits createdAt entirely when the frontmatter has no date", () => {
    const input = toUpsertContextInput(localContext());
    expect(Object.hasOwn(input, "createdAt")).toBe(false);
  });

  it("drops the local-only fields the backend does not accept", () => {
    const input = toUpsertContextInput(localContext());
    expect(Object.hasOwn(input, "dir")).toBe(false);
    expect(Object.hasOwn(input, "images")).toBe(false);
  });
});

describe("isEmptyPlan", () => {
  it("is true when nothing has to be done", () => {
    expect(isEmptyPlan(plan({}))).toBe(true);
  });

  it.each([
    ["blogUpserts", { localBlogs: [localBlog()] }],
    ["blogDeletes", { remoteBlogs: [remoteBlogOf(localBlog())] }],
    ["contextUpserts", { localContexts: [localContext()] }],
    ["contextDeletes", { remoteContexts: [remoteContextOf(localContext())] }],
    ["imageUploads", { localImages: [localImage()] }],
    ["imageDeletes", { remoteImages: [{ key: "orphan", etag: '"abc"' }] }],
  ])("is false when %s is not empty", (_field, input) => {
    expect(isEmptyPlan(plan(input))).toBe(false);
  });
});
