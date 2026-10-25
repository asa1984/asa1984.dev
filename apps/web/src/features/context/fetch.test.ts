import { afterEach, describe, expect, test, vi } from "vite-plus/test";

import { get_post, get_posts_date_sorted, get_published_posts } from "./fetch.ts";

const list_content_paths = vi.fn<() => Promise<string[]>>();
const fetch_content_text = vi.fn<(path: string) => Promise<string>>();

/** A content source whose responses each test sets. */
const source = { list_content_paths, fetch_content_text };

const post_md = ({ published = true, date = "2024-01-08T11:25:53.246Z" } = {}) => `---
title: タイトル
emoji: 📕
published: ${String(published)}
date: ${date}
---

本文`;

afterEach(() => {
  list_content_paths.mockReset();
  fetch_content_text.mockReset();
});

/** A post that is newer when its path contains "new". */
const post_md_by_age = (path: string) =>
  post_md({
    date: path.includes("new") ? "2024-06-01T00:00:00.000Z" : "2022-01-01T00:00:00.000Z",
  });

describe("get_published_posts", () => {
  test("context/*/post.md だけを拾い、下書きを除外する", async () => {
    list_content_paths.mockResolvedValue([
      "blog/first/post.md",
      "context/public/post.md",
      "context/draft/post.md",
    ]);
    fetch_content_text.mockImplementation((path) =>
      Promise.resolve(post_md({ published: !path.includes("draft") })),
    );

    const posts = await get_published_posts({ source });

    expect(posts.map((p) => p.slug)).toStrictEqual(["public"]);
    expect(posts[0]?.meta.emoji).toBe("📕");
  });
});

describe("get_posts_date_sorted", () => {
  test("新しい記事が先頭に来る", async () => {
    list_content_paths.mockResolvedValue(["context/old/post.md", "context/new/post.md"]);
    fetch_content_text.mockImplementation((path) => Promise.resolve(post_md_by_age(path)));

    const posts = await get_posts_date_sorted({ source });

    expect(posts.map((p) => p.slug)).toStrictEqual(["new", "old"]);
  });
});

describe("get_post", () => {
  test("存在する slug の記事を返し、未知の slug は null", async () => {
    list_content_paths.mockResolvedValue(["context/first/post.md"]);
    fetch_content_text.mockResolvedValue(post_md());

    const first = await get_post({ slug: "first", source });
    expect(first?.slug).toBe("first");
    expect(await get_post({ slug: "unknown", source })).toBeNull();
  });
});
