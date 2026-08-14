import type { Root } from "mdast";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { describe, expect, it } from "vitest";
import { remark_linkcard } from "./remark_linkcard";

const parse = (markdown: string): Root => {
  const processor = unified().use(remarkParse).use(remarkGfm);
  const tree = processor.parse(markdown);
  remark_linkcard()(tree, undefined as never, undefined as never);
  return tree as Root;
};

type LinkcardNode = {
  type: "linkcard";
  data: { hProperties: { url: string } };
};

const linkcards = (root: Root): LinkcardNode[] =>
  root.children.filter(
    (node): node is never => node.type === ("linkcard" as never),
  ) as unknown as LinkcardNode[];

describe("remark_linkcard", () => {
  it("URL と同一テキストの単独リンク段落を linkcard に変換する", () => {
    const tree = parse("<https://example.com/article>");

    const cards = linkcards(tree);
    expect(cards).toHaveLength(1);
    expect(cards[0]?.data.hProperties.url).toBe("https://example.com/article");
  });

  it("@card テキストのリンクも linkcard に変換する", () => {
    const tree = parse("[@card](https://example.com/article)");

    const cards = linkcards(tree);
    expect(cards).toHaveLength(1);
    expect(cards[0]?.data.hProperties.url).toBe("https://example.com/article");
  });

  it("通常のインラインリンクは変換しない", () => {
    const tree = parse("これは[リンク](https://example.com)を含む文です。");

    expect(linkcards(tree)).toHaveLength(0);
    expect(tree.children[0]?.type).toBe("paragraph");
  });

  it("リンクの前後にテキストがある段落は変換しない", () => {
    const tree = parse("前置き <https://example.com> 後書き");

    expect(linkcards(tree)).toHaveLength(0);
  });

  it("複数の linkcard 段落をそれぞれ変換する", () => {
    const tree = parse(
      "<https://example.com/a>\n\n本文の段落。\n\n<https://example.com/b>",
    );

    const cards = linkcards(tree);
    expect(cards.map((c) => c.data.hProperties.url)).toEqual([
      "https://example.com/a",
      "https://example.com/b",
    ]);
    expect(tree.children).toHaveLength(3);
  });
});
