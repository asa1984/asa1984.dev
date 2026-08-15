import { createHash } from "node:crypto";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { compile_markdown } from "./compile_markdown";

// LinkCard fetches OGP metadata over the network at render time; replace it
// with an inert marker so the test stays hermetic.
vi.mock("@/features/ogp", () => ({
  default: ({ href }: { href: string }) =>
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
    process.env.BACKEND_URL = "https://api.example.com";
    html = await render();
  });

  it("renders headings", () => {
    expect(html).toContain("<h1>見出し</h1>");
  });

  it("renders internal links as Next links and external links in new tabs", () => {
    expect(html).toMatch(/<a[^>]*href="\/blog"/);
    expect(html).toMatch(
      /<a[^>]*target="_blank"[^>]*href="https:\/\/example\.com\/page"/,
    );
  });

  it("expands gemoji shortcodes", () => {
    expect(html).toContain("😄");
  });

  it("renders math with KaTeX", () => {
    expect(html).toContain('class="katex"');
  });

  it("renders inline footnotes with the GFM footnote section", () => {
    expect(html).toContain("これは脚注");
    expect(html).toContain("脚注</span>");
  });

  it("preserves raw HTML like <br/>", () => {
    expect(html).toContain("<br/>");
  });

  it("strips comments", () => {
    expect(html).not.toContain("コメント");
  });

  it("renders :::message blocks through the Message component", () => {
    expect(html).toMatch(/<aside[^>]*>[\s\S]*これは警告メッセージ/);
    expect(html).not.toContain(":::");
  });

  it("renders bare URLs as link cards", () => {
    expect(html).toMatch(
      /data-testid="linkcard" data-href="https:\/\/example\.com\/card"/,
    );
  });

  it("highlights code fences with shiki", () => {
    expect(html).toMatch(/<code[^>]*data-language="ts"/);
    expect(html).toContain('<span style="color:');
  });

  it("renders GFM tables", () => {
    expect(html).toContain("<table>");
  });

  it("routes local images through the backend delivery URL", () => {
    const key = createHash("sha256")
      .update("blog/test-post/photo.webp")
      .digest("hex");
    expect(html).toContain(key);
  });

  it("renders remote images as plain lazy img tags", () => {
    expect(html).toMatch(
      /<img[^>]*src="https:\/\/example\.com\/pic\.png"[^>]*loading="lazy"/,
    );
  });
});
