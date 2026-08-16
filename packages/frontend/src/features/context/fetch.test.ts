import { afterEach, describe, expect, it, vi } from "vitest";

import { get_post, get_posts_date_sorted, get_published_posts } from "./fetch";

const list_content_paths = vi.fn<() => Promise<string[]>>();
const fetch_content_text = vi.fn<(path: string) => Promise<string>>();

vi.mock("@/features/content/github", () => ({
  list_content_paths: () => list_content_paths(),
  fetch_content_text: (path: string) => fetch_content_text(path),
}));

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

describe("get_published_posts", () => {
  it("context/*/post.md だけを拾い、下書きを除外する", async () => {
    list_content_paths.mockResolvedValue([
      "blog/first/post.md",
      "context/public/post.md",
      "context/draft/post.md",
    ]);
    fetch_content_text.mockImplementation((path) =>
      Promise.resolve(post_md({ published: !path.includes("draft") })),
    );

    const posts = await get_published_posts();

    expect(posts.map((p) => p.slug)).toEqual(["public"]);
    expect(posts[0]?.meta.emoji).toBe("📕");
  });
});

describe("get_posts_date_sorted", () => {
  it("新しい記事が先頭に来る", async () => {
    list_content_paths.mockResolvedValue(["context/old/post.md", "context/new/post.md"]);
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
  it("存在する slug の記事を返し、未知の slug は null", async () => {
    list_content_paths.mockResolvedValue(["context/first/post.md"]);
    fetch_content_text.mockResolvedValue(post_md());

    const first = await get_post("first");
    expect(first?.slug).toBe("first");
    expect(await get_post("unknown")).toBeNull();
  });
});
