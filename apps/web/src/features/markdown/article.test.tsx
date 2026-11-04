import { renderToStaticMarkup } from "react-dom/server";
import { beforeAll, describe, expect, test } from "vite-plus/test";

import { sitePathSchema } from "#/libs/site-path.ts";

import { Article } from "./article.tsx";
import { collectLinkCardUrls, compileMarkdown } from "./compile.ts";

const fixture = `# 見出し

[内部リンク](/blog)と[外部リンク](https://example.com/page)。

絵文字 :smile: と数式 $x^2$ とインライン脚注^[これは脚注]。

改行タグ<br/>のある段落。

<!-- この行はコメントなので出力されない -->

:::message
これは警告メッセージ
:::

https://example.com/card

\`\`\`ts
const answer: number = 42;
\`\`\`

| 列A | 列B |
| --- | --- |
| 1   | 2   |

![ローカル画像](./photo.webp)

![外部画像](https://example.com/pic.png)
`;

const cardOgp = {
  url: "https://example.com/card",
  title: "カードのタイトル",
  description: undefined,
  image: undefined,
};

describe("Article", () => {
  let html: string;
  let linkCardUrls: string[];

  beforeAll(async () => {
    const root = await compileMarkdown({
      source: fixture,
      assetBase: sitePathSchema.parse("/content-assets/blog/test-post"),
    });
    linkCardUrls = collectLinkCardUrls(root);
    html = renderToStaticMarkup(<Article root={root} ogps={{ [cardOgp.url]: cardOgp }} />);
  });

  test("renders headings", () => {
    expect(html).toContain("<h1>見出し</h1>");
  });

  test("renders internal links in place and external links in new tabs", () => {
    expect(html).toMatch(/<a[^>]*href="\/blog"/u);
    expect(html).toMatch(/<a[^>]*target="_blank"[^>]*href="https:\/\/example\.com\/page"/u);
  });

  test("expands gemoji shortcodes", () => {
    expect(html).toContain("😄");
  });

  test("renders math with KaTeX", () => {
    expect(html).toContain('class="katex"');
  });

  test("renders inline footnotes with the GFM footnote section", () => {
    expect(html).toContain("これは脚注");
    expect(html).toContain("脚注</span>");
  });

  test("preserves raw HTML like <br/>", () => {
    expect(html).toContain("<br/>");
  });

  test("strips comments", () => {
    expect(html).not.toContain("コメント");
  });

  test("renders :::message blocks through the Message component", () => {
    expect(html).toMatch(/<aside[^>]*>[\s\S]*これは警告メッセージ/u);
    expect(html).not.toContain(":::");
  });

  test("collects bare URLs as link cards", () => {
    expect(linkCardUrls).toStrictEqual(["https://example.com/card"]);
  });

  test("renders link cards from the loaded OGP metadata", () => {
    expect(html).toMatch(/<a href="https:\/\/example\.com\/card"[^>]*>[\s\S]*カードのタイトル/u);
  });

  test("highlights code fences with shiki", () => {
    expect(html).toMatch(/<code[^>]*data-language="ts"/u);
    expect(html).toContain('<span style="color:');
  });

  test("renders GFM tables", () => {
    expect(html).toContain("<table>");
  });

  test("resolves local images under the content-assets path", () => {
    expect(html).toContain('src="/content-assets/blog/test-post/photo.webp"');
  });

  test("renders remote images as plain lazy img tags", () => {
    expect(html).toMatch(/<img[^>]*src="https:\/\/example\.com\/pic\.png"[^>]*loading="lazy"/u);
  });
});
