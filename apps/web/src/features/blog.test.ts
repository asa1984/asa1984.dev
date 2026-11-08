import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vite-plus/test";

import { getBlogPost, listBlogPosts } from "./blog.ts";
import { slugSchema, postAssetPath } from "./content.ts";

/** The file in contents/ that a /content-assets/ URL serves. */
const contentFile = (url: string) =>
  fileURLToPath(
    new URL(`../../../../contents/${url.slice("/content-assets/".length)}`, import.meta.url),
  );

const localImage = /!\[[^\]]*\]\(\.\/([^)]+)\)/gu;

const { items, total } = await listBlogPosts();
const found = await Promise.all(items.map(({ slug }) => getBlogPost(slug)));
const posts = found.filter((post) => post !== undefined);

/** Every image the posts reference: the covers and the images in the bodies. */
const images = [
  ...posts.map(({ slug, image }) => postAssetPath({ collection: "blog", slug, file: image })),
  ...posts.flatMap(({ slug, body }) =>
    [...body.matchAll(localImage)].map(
      (match) => `${postAssetPath({ collection: "blog", slug })}/${match[1] ?? ""}`,
    ),
  ),
];

describe("listBlogPosts", () => {
  test("記事がある", () => {
    expect(total).toBeGreaterThan(0);
    expect(items).toHaveLength(total);
  });

  test("新しい記事が先頭に来る", () => {
    const times = items.map(({ date }) => date.epochMilliseconds);
    expect(times).toStrictEqual(times.toSorted((a, b) => b - a));
  });

  test("指定した範囲だけを返す", async () => {
    const page = await listBlogPosts({ offset: 1, limit: 1 });
    expect(page.items.map(({ slug }) => slug)).toStrictEqual(
      items.slice(1, 2).map(({ slug }) => slug),
    );
    expect(page.total).toBe(total);
  });

  test.each(images)("%s がある", (image) => {
    expect(existsSync(contentFile(image))).toBe(true);
  });
});

describe("getBlogPost", () => {
  test.each(items.map(({ slug, title }) => [slug, title] as const))(
    "%s を本文付きで引ける",
    async (slug, title) => {
      const post = await getBlogPost(slug);
      expect(post?.title).toBe(title);
      expect(post?.body).not.toBe("");
    },
  );

  test("未知の slug は undefined", async () => {
    expect(await getBlogPost(slugSchema.parse("unknown"))).toBeUndefined();
  });
});
