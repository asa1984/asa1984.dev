import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vite-plus/test";

import { contextPosts, findContextPost } from "./context.ts";

const publicFile = (url: string) => fileURLToPath(new URL(`../../public${url}`, import.meta.url));

const localImage = /!\[[^\]]*\]\(\.\/([^)]+)\)/gu;

/** Every image the posts' bodies reference. */
const images = contextPosts.flatMap((post) =>
  [...post.body.matchAll(localImage)].map((match) => `${post.assetBase}/${match[1] ?? ""}`),
);

describe("contextPosts", () => {
  test("記事がある", () => {
    expect(contextPosts.length).toBeGreaterThan(0);
  });

  test.each(images)("%s がある", (image) => {
    expect(existsSync(publicFile(image))).toBe(true);
  });
});

describe("findContextPost", () => {
  test.each(contextPosts.map((post) => [post.slug, post] as const))("%s を引ける", (slug, post) => {
    expect(findContextPost(slug)).toBe(post);
  });

  test("未知の slug は undefined", () => {
    expect(findContextPost("unknown")).toBeUndefined();
  });
});
