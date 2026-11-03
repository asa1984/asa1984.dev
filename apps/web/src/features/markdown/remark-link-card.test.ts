import type { LinkCard, Root } from "mdast";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { describe, expect, test } from "vite-plus/test";

import { remarkLinkCard } from "./remark-link-card.ts";

const parse = (markdown: string): Root => {
  const processor = unified().use(remarkParse).use(remarkGfm).use(remarkLinkCard);
  return processor.runSync(processor.parse(markdown));
};

const linkCards = (root: Root): LinkCard[] =>
  root.children.filter((node) => node.type === "linkCard");

describe("remarkLinkCard", () => {
  test("URL と同一テキストの単独リンク段落を linkCard ノードに変換する", () => {
    const tree = parse("<https://example.com/article>");

    const cards = linkCards(tree);
    expect(cards).toHaveLength(1);
    expect(cards[0]?.data?.hProperties.url).toBe("https://example.com/article");
  });

  test("@card テキストのリンクも linkCard ノードに変換する", () => {
    const tree = parse("[@card](https://example.com/article)");

    const cards = linkCards(tree);
    expect(cards).toHaveLength(1);
    expect(cards[0]?.data?.hProperties.url).toBe("https://example.com/article");
  });

  test("通常のインラインリンクは変換しない", () => {
    const tree = parse("これは[リンク](https://example.com)を含む文です。");

    expect(linkCards(tree)).toHaveLength(0);
    expect(tree.children[0]?.type).toBe("paragraph");
  });

  test("リンクの前後にテキストがある段落は変換しない", () => {
    const tree = parse("前置き <https://example.com> 後書き");

    expect(linkCards(tree)).toHaveLength(0);
  });

  test("複数のリンクだけの段落をそれぞれ変換する", () => {
    const tree = parse("<https://example.com/a>\n\n本文の段落。\n\n<https://example.com/b>");

    const cards = linkCards(tree);
    expect(cards.map((c) => c.data?.hProperties.url)).toStrictEqual([
      "https://example.com/a",
      "https://example.com/b",
    ]);
    expect(tree.children).toHaveLength(3);
  });
});
