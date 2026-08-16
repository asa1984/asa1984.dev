import type { Root, Text } from "mdast";

import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { describe, expect, it } from "vitest";

import { remark_zenn_message } from "./remark_zenn_message";

const parse = (markdown: string): Root => {
  const processor = unified().use(remarkParse).use(remarkGfm);
  const tree = processor.parse(markdown);
  void remark_zenn_message()(tree, undefined as never, undefined as never);
  return tree;
};

type MessageNode = {
  type: "message";
  children: { type: string; value?: string }[];
};

const messages = (root: Root): MessageNode[] =>
  root.children.filter((node): node is never => node.type === ("message" as never));

describe("remark_zenn_message", () => {
  it(":::message ブロックを message ノードに変換する", () => {
    const tree = parse(":::message\n注意書きです\n:::");

    const found = messages(tree);
    expect(found).toHaveLength(1);
    expect(found[0]?.children).toMatchObject([{ type: "text", value: "注意書きです" }]);
  });

  it("強調などのインライン要素を保持する", () => {
    const tree = parse(":::message\n注意: **重要** です\n:::");

    const found = messages(tree);
    expect(found).toHaveLength(1);
    const types = found[0]?.children.map((c) => c.type);
    expect(types).toEqual(["text", "strong", "text"]);
    expect(found[0]?.children[0]).toMatchObject({
      type: "text",
      value: "注意: ",
    });
  });

  it("マーカーだけの行は捨てて中身だけ残す (複数行)", () => {
    const tree = parse(":::message\n1行目\n2行目\n:::");

    const found = messages(tree);
    expect(found).toHaveLength(1);
    const texts = found[0]?.children
      .filter((c): c is Text & { type: "text" } => c.type === "text")
      .map((c) => c.value);
    expect(texts?.join("")).toBe("1行目\n2行目");
  });

  it("通常の段落は変換しない", () => {
    const tree = parse("ただの段落です。");

    expect(messages(tree)).toHaveLength(0);
    expect(tree.children[0]?.type).toBe("paragraph");
  });

  it("閉じマーカーのない段落は変換しない", () => {
    const tree = parse(":::message\n閉じ忘れ");

    expect(messages(tree)).toHaveLength(0);
  });
});
