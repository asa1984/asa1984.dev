import type { Linkcard, Root } from "mdast";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { describe, expect, test } from "vite-plus/test";

import { remark_linkcard } from "./remark-linkcard.ts";

const parse = (markdown: string): Root => {
  const processor = unified().use(remarkParse).use(remarkGfm).use(remark_linkcard);
  return processor.runSync(processor.parse(markdown));
};

const linkcards = (root: Root): Linkcard[] =>
  root.children.filter((node) => node.type === "linkcard");

describe("remark_linkcard", () => {
  test("URL と同一テキストの単独リンク段落を linkcard に変換する", () => {
    const tree = parse("<https://example.com/article>");

    const cards = linkcards(tree);
    expect(cards).toHaveLength(1);
    expect(cards[0]?.data?.hProperties.url).toBe("https://example.com/article");
  });

  test("@card テキストのリンクも linkcard に変換する", () => {
    const tree = parse("[@card](https://example.com/article)");

    const cards = linkcards(tree);
    expect(cards).toHaveLength(1);
    expect(cards[0]?.data?.hProperties.url).toBe("https://example.com/article");
  });

  test("通常のインラインリンクは変換しない", () => {
    const tree = parse("これは[リンク](https://example.com)を含む文です。");

    expect(linkcards(tree)).toHaveLength(0);
    expect(tree.children[0]?.type).toBe("paragraph");
  });

  test("リンクの前後にテキストがある段落は変換しない", () => {
    const tree = parse("前置き <https://example.com> 後書き");

    expect(linkcards(tree)).toHaveLength(0);
  });

  test("複数の linkcard 段落をそれぞれ変換する", () => {
    const tree = parse("<https://example.com/a>\n\n本文の段落。\n\n<https://example.com/b>");

    const cards = linkcards(tree);
    expect(cards.map((c) => c.data?.hProperties.url)).toStrictEqual([
      "https://example.com/a",
      "https://example.com/b",
    ]);
    expect(tree.children).toHaveLength(3);
  });
});
