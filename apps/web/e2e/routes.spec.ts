import { expect, test } from "@playwright/test";

import { slugsOf } from "./contents.ts";

const pages = [
  "/",
  "/blog",
  "/context",
  "/profile",
  ...slugsOf("blog").map((slug) => `/blog/${slug}`),
  ...slugsOf("context").map((slug) => `/context/${slug}`),
];

test.describe("ページ", () => {
  for (const path of pages) {
    test(`${path} を HTML で返す`, async ({ request }) => {
      const response = await request.get(path);

      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toContain("text/html");
    });
  }

  for (const path of ["/unknown", "/blog/unknown", "/context/unknown"]) {
    test(`${path} は 404 ページを返す`, async ({ request }) => {
      const response = await request.get(path);

      expect(response.status()).toBe(404);
      expect(await response.text()).toContain("Not Found");
    });
  }
});

test.describe("静的ファイル", () => {
  test("記事の画像を 1 日キャッシュさせる", async ({ request }) => {
    const response = await request.get("/content-assets/blog/first/first.webp");

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("image/webp");
    expect(response.headers()["cache-control"]).toBe("public, max-age=86400");
  });

  test("ハッシュ付きのアセットを immutable にする", async ({ request }) => {
    const home = await request.get("/");
    const html = await home.text();
    const stylesheet = /href="(\/assets\/[^"]+\.css)"/u.exec(html)?.[1];
    expect(stylesheet).toBeDefined();

    const response = await request.get(stylesheet ?? "");

    expect(response.headers()["cache-control"]).toBe("public, max-age=31536000, immutable");
  });

  test("RSS にブログの全記事を載せる", async ({ request }) => {
    const response = await request.get("/rss.xml");
    const feed = await response.text();

    expect(response.headers()["content-type"]).toContain("xml");
    expect(feed.match(/<item>/gu)).toHaveLength(slugsOf("blog").length);
    expect(feed).toMatch(/<enclosure url="https?:\/\/[^"]+\/content-assets\/blog\//u);
  });
});
