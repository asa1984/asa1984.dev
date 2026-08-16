import type { FootnoteDefinition, FootnoteReference, Root } from "mdast";

import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { describe, expect, it } from "vitest";

import { remark_inline_footnote } from "./remark_inline_footnote";

const parse = (markdown: string): Root => {
  const processor = unified().use(remarkParse).use(remarkGfm);
  const tree = processor.parse(markdown);
  void remark_inline_footnote()(tree, undefined as never, undefined as never);
  return tree;
};

const collect = <T extends { type: string }>(root: Root, type: T["type"]): T[] => {
  const found: T[] = [];
  const walk = (node: { type: string; children?: { type: string }[] }) => {
    if (node.type === type) {
      found.push(node as unknown as T);
    }
    for (const child of node.children ?? []) {
      walk(child);
    }
  };
  walk(root);
  return found;
};

const references = (root: Root) => collect<FootnoteReference>(root, "footnoteReference");
const definitions = (root: Root) => collect<FootnoteDefinition>(root, "footnoteDefinition");

describe("remark_inline_footnote", () => {
  it("converts ^[...] into a footnote reference and definition", () => {
    const tree = parse("本文^[これが脚注]の続き。");

    const refs = references(tree);
    const defs = definitions(tree);
    expect(refs).toHaveLength(1);
    expect(defs).toHaveLength(1);
    expect(refs[0]?.identifier).toBe(defs[0]?.identifier);
    expect(defs[0]?.children).toEqual([
      { type: "paragraph", children: [{ type: "text", value: "これが脚注" }] },
    ]);
  });

  it("keeps the surrounding text intact", () => {
    const tree = parse("本文^[脚注]の続き。");

    const paragraph = tree.children[0];
    if (paragraph?.type !== "paragraph") {
      throw new Error("expected paragraph");
    }
    expect(paragraph.children).toEqual([
      { type: "text", value: "本文" },
      expect.objectContaining({ type: "footnoteReference" }),
      { type: "text", value: "の続き。" },
    ]);
  });

  it("handles a footnote at the start and end of a text node", () => {
    const start = parse("^[先頭]です。");
    const startParagraph = start.children[0];
    if (startParagraph?.type !== "paragraph") {
      throw new Error("expected paragraph");
    }
    expect(startParagraph.children[0]?.type).toBe("footnoteReference");

    const end = parse("これは^[末尾]");
    const endParagraph = end.children[0];
    if (endParagraph?.type !== "paragraph") {
      throw new Error("expected paragraph");
    }
    expect(endParagraph.children.at(-1)?.type).toBe("footnoteReference");
  });

  it("numbers multiple footnotes uniquely in document order", () => {
    const tree = parse("一つ目^[注1]と二つ目^[注2]。\n\n三つ目^[注3]。");

    const refs = references(tree);
    const defs = definitions(tree);
    expect(refs).toHaveLength(3);
    expect(defs).toHaveLength(3);
    expect(refs.map((r) => r.identifier)).toEqual(defs.map((d) => d.identifier));
    expect(new Set(refs.map((r) => r.identifier)).size).toBe(3);
  });

  it("converts multiple footnotes inside a single text node", () => {
    const tree = parse("A^[one]B^[two]C");

    const paragraph = tree.children[0];
    if (paragraph?.type !== "paragraph") {
      throw new Error("expected paragraph");
    }
    expect(paragraph.children.map((c) => c.type)).toEqual([
      "text",
      "footnoteReference",
      "text",
      "footnoteReference",
      "text",
    ]);
  });

  it("works inside emphasis", () => {
    const tree = parse("*強調^[注釈]文*");

    expect(references(tree)).toHaveLength(1);
    expect(definitions(tree)).toHaveLength(1);
  });

  it("leaves markdown without inline footnotes untouched", () => {
    const markdown = "ただの[リンク](https://example.com)と ^ と [括弧] です。";
    const tree = parse(markdown);
    const untouched = unified().use(remarkParse).use(remarkGfm).parse(markdown);

    expect(tree).toEqual(untouched);
  });

  it("ignores empty footnotes", () => {
    const tree = parse("空^[]です。");

    expect(references(tree)).toHaveLength(0);
    expect(definitions(tree)).toHaveLength(0);
  });

  it("does not clash with handwritten GFM footnotes", () => {
    const tree = parse("参照形式[^a]とインライン^[インライン注]。\n\n[^a]: 手書きの定義");

    const refs = references(tree);
    const defs = definitions(tree);
    expect(refs).toHaveLength(2);
    expect(defs).toHaveLength(2);
    const identifiers = [...refs, ...defs].map((n) => n.identifier);
    expect(new Set(identifiers).size).toBe(2);
    // The handwritten identifier survives as-is.
    expect(identifiers).toContain("a");
  });

  it("does not span across newlines", () => {
    const tree = parse("これは^[改行\nを含む]テキスト。");

    expect(references(tree)).toHaveLength(0);
  });

  it("renders through the existing GFM footnote pipeline (mdast → hast)", async () => {
    const { toHast } = await import("mdast-util-to-hast");
    const tree = parse("本文^[インライン注釈]です。");

    const hast = JSON.stringify(
      toHast(tree, { footnoteLabel: "脚注", footnoteLabelTagName: "span" }),
    );
    // A superscript reference link and the footnote section content.
    expect(hast).toContain('"tagName":"sup"');
    expect(hast).toContain("インライン注釈");
    expect(hast).toContain("脚注");
  });
});
