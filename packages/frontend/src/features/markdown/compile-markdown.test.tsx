import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeAll, describe, expect, test, vi } from "vite-plus/test";

import { compile_markdown } from "./compile-markdown.tsx";

// LinkCard fetches OGP metadata over the network at render time; replace it
// with an inert marker so the test stays hermetic.
vi.mock("@/features/ogp.tsx", () => ({
  OgpLinkCardWrapper: ({ href }: { href: string }) =>
    createElement("span", { "data-testid": "linkcard", "data-href": href }),
}));

const FIXTURE = `# 見出し

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

const render = async () => {
  const jsx = await compile_markdown({
    source: FIXTURE,
    type: "blog",
    slug: "test-post",
  });
  return renderToStaticMarkup(jsx);
};

describe("compile_markdown", () => {
  let html: string;

  beforeAll(async () => {
    html = await render();
  });

  test("renders headings", () => {
    expect(html).toContain("<h1>見出し</h1>");
  });

  test("renders internal links as Next links and external links in new tabs", () => {
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

  test("renders bare URLs as link cards", () => {
    expect(html).toMatch(/data-testid="linkcard" data-href="https:\/\/example\.com\/card"/u);
  });

  test("highlights code fences with shiki", () => {
    expect(html).toMatch(/<code[^>]*data-language="ts"/u);
    expect(html).toContain('<span style="color:');
  });

  test("renders GFM tables", () => {
    expect(html).toContain("<table>");
  });

  test("routes local images through the content-assets route", () => {
    // next/image may wrap the src in /_next/image?url=<encoded> depending on
    // loader config, so accept the path in either raw or encoded form.
    const path = "/content-assets/blog/test-post/photo.webp";
    expect([path, encodeURIComponent(path)].some((candidate) => html.includes(candidate))).toBe(
      true,
    );
  });

  test("renders remote images as plain lazy img tags", () => {
    expect(html).toMatch(/<img[^>]*src="https:\/\/example\.com\/pic\.png"[^>]*loading="lazy"/u);
  });
});
