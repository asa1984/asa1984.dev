import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vite-plus/test";

import { blogPosts, findBlogPost } from "./blog.ts";

/** The file in contents/ that a /content-assets/ URL serves. */
const contentFile = (url: string) =>
  fileURLToPath(
    new URL(`../../../../contents/${url.slice("/content-assets/".length)}`, import.meta.url),
  );

const localImage = /!\[[^\]]*\]\(\.\/([^)]+)\)/gu;

/** Every image the posts reference: the covers and the images in the bodies. */
const images = blogPosts.flatMap((post) => [
  post.image,
  ...[...post.body.matchAll(localImage)].map((match) => `${post.assetBase}/${match[1] ?? ""}`),
]);

describe("blogPosts", () => {
  test("記事がある", () => {
    expect(blogPosts.length).toBeGreaterThan(0);
  });

  test.each(images)("%s がある", (image) => {
    expect(existsSync(contentFile(image))).toBe(true);
  });
});

describe("findBlogPost", () => {
  test.each(blogPosts.map((post) => [post.slug, post] as const))("%s を引ける", (slug, post) => {
    expect(findBlogPost(slug)).toBe(post);
  });

  test("未知の slug は undefined", () => {
    expect(findBlogPost("unknown")).toBeUndefined();
  });
});
