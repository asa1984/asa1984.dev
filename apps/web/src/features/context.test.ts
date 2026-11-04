import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vite-plus/test";

import { slugSchema, postAssetPath } from "./content.ts";
import { getContextPost, listContextPosts } from "./context.ts";

/** The file in contents/ that a /content-assets/ URL serves. */
const contentFile = (url: string) =>
  fileURLToPath(
    new URL(`../../../../contents/${url.slice("/content-assets/".length)}`, import.meta.url),
  );

const localImage = /!\[[^\]]*\]\(\.\/([^)]+)\)/gu;

const { items, total } = await listContextPosts();
const found = await Promise.all(items.map(({ slug }) => getContextPost(slug)));
const posts = found.filter((post) => post !== undefined);

/** Every image the posts' bodies reference. */
const images = posts.flatMap(({ slug, body }) =>
  [...body.matchAll(localImage)].map(
    (match) => `${postAssetPath({ collection: "context", slug })}/${match[1] ?? ""}`,
  ),
);

describe("listContextPosts", () => {
  test("記事がある", () => {
    expect(total).toBeGreaterThan(0);
    expect(items).toHaveLength(total);
  });

  test("新しい記事が先頭に来る", () => {
    const times = items.map(({ date }) => date.epochMilliseconds);
    expect(times).toStrictEqual(times.toSorted((a, b) => b - a));
  });

  test.each(images)("%s がある", (image) => {
    expect(existsSync(contentFile(image))).toBe(true);
  });
});

describe("getContextPost", () => {
  test.each(items.map(({ slug, title }) => [slug, title] as const))(
    "%s を本文付きで引ける",
    async (slug, title) => {
      const post = await getContextPost(slug);
      expect(post?.title).toBe(title);
      expect(post?.body).not.toBe("");
    },
  );

  test("未知の slug は undefined", async () => {
    expect(await getContextPost(slugSchema.parse("unknown"))).toBeUndefined();
  });
});
