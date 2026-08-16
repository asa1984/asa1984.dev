import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";

import { get_post, get_posts_date_sorted, get_published_posts } from "./fetch";

const list_content_paths = vi.fn<() => Promise<string[]>>();
const fetch_content_text = vi.fn<(path: string) => Promise<string>>();

vi.mock("@/features/content/github", () => ({
  list_content_paths: () => list_content_paths(),
  fetch_content_text: (path: string) => fetch_content_text(path),
}));

const post_md = ({
  title = "タイトル",
  image = "cover.webp",
  published = true,
  date = "2023-10-23T00:00:00.000Z",
} = {}) => `---
title: ${title}
image: ${image}
description: 説明
published: ${String(published)}
date: ${date}
---

本文`;

beforeEach(() => {
  vi.stubEnv("FRONTEND_URL", "https://site.test");
});

afterEach(() => {
  vi.unstubAllEnvs();
  list_content_paths.mockReset();
  fetch_content_text.mockReset();
});

describe("get_published_posts", () => {
  it("blog/*/post.md だけを記事として拾う", async () => {
    list_content_paths.mockResolvedValue([
      "README.md",
      "blog/first/post.md",
      "blog/first/cover.webp",
      "context/other/post.md",
    ]);
    fetch_content_text.mockResolvedValue(post_md());

    const posts = await get_published_posts();

    expect(posts.map((p) => p.slug)).toEqual(["first"]);
    expect(fetch_content_text).toHaveBeenCalledExactlyOnceWith("blog/first/post.md");
  });

  it("published: false の記事を除外する", async () => {
    list_content_paths.mockResolvedValue(["blog/public/post.md", "blog/draft/post.md"]);
    fetch_content_text.mockImplementation((path) =>
      Promise.resolve(post_md({ published: !path.includes("draft") })),
    );

    const posts = await get_published_posts();

    expect(posts.map((p) => p.slug)).toEqual(["public"]);
  });

  it("画像 URL を FRONTEND_URL と slug から組み立てる", async () => {
    list_content_paths.mockResolvedValue(["blog/first/post.md"]);
    fetch_content_text.mockResolvedValue(post_md({ image: "cover.webp" }));

    const [post] = await get_published_posts();

    expect(post?.meta.image).toBe("https://site.test/content-assets/blog/first/cover.webp");
  });

  it("frontmatter が不正なら失敗する", async () => {
    list_content_paths.mockResolvedValue(["blog/broken/post.md"]);
    fetch_content_text.mockResolvedValue("---\ntitle: only-title\n---\n本文");

    await expect(get_published_posts()).rejects.toThrow(ZodError);
  });
});

describe("get_posts_date_sorted", () => {
  it("新しい記事が先頭に来る", async () => {
    list_content_paths.mockResolvedValue(["blog/old/post.md", "blog/new/post.md"]);
    fetch_content_text.mockImplementation((path) =>
      Promise.resolve(
        post_md({
          date: path.includes("new") ? "2024-06-01T00:00:00.000Z" : "2022-01-01T00:00:00.000Z",
        }),
      ),
    );

    const posts = await get_posts_date_sorted();

    expect(posts.map((p) => p.slug)).toEqual(["new", "old"]);
  });
});

describe("get_post", () => {
  it("存在する slug の記事を返す", async () => {
    list_content_paths.mockResolvedValue(["blog/first/post.md"]);
    fetch_content_text.mockResolvedValue(post_md());

    const post = await get_post("first");

    expect(post?.slug).toBe("first");
    expect(post?.meta.title).toBe("タイトル");
    expect(post?.meta.date.toISOString()).toBe("2023-10-23T00:00:00.000Z");
    expect(post?.content.trim()).toBe("本文");
  });

  it("未知の slug は GitHub を叩かずに null を返す", async () => {
    list_content_paths.mockResolvedValue(["blog/first/post.md"]);

    const post = await get_post("unknown");

    expect(post).toBeNull();
    expect(fetch_content_text).not.toHaveBeenCalled();
  });

  it("下書き記事は null を返す", async () => {
    list_content_paths.mockResolvedValue(["blog/draft/post.md"]);
    fetch_content_text.mockResolvedValue(post_md({ published: false }));

    const post = await get_post("draft");

    expect(post).toBeNull();
  });
});
