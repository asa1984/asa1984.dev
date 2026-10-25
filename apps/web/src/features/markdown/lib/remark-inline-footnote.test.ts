import type { FootnoteDefinition, FootnoteReference, Paragraph, Root } from "mdast";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { describe, expect, test } from "vite-plus/test";

import { remark_inline_footnote } from "./remark-inline-footnote.ts";

const parse = (markdown: string): Root => {
  const processor = unified().use(remarkParse).use(remarkGfm).use(remark_inline_footnote);
  return processor.runSync(processor.parse(markdown));
};

const first_paragraph = (root: Root): Paragraph => {
  const [node] = root.children;
  if (node?.type !== "paragraph") {
    throw new Error("expected paragraph");
  }
  return node;
};

const references = (root: Root): FootnoteReference[] => {
  const found: FootnoteReference[] = [];
  visit(root, "footnoteReference", (node) => {
    found.push(node);
  });
  return found;
};

const definitions = (root: Root): FootnoteDefinition[] => {
  const found: FootnoteDefinition[] = [];
  visit(root, "footnoteDefinition", (node) => {
    found.push(node);
  });
  return found;
};

describe("remark_inline_footnote", () => {
  test("converts ^[...] into a footnote reference and definition", () => {
    const tree = parse("本文^[これが脚注]の続き。");

    const refs = references(tree);
    const defs = definitions(tree);
    expect(refs).toHaveLength(1);
    expect(defs).toHaveLength(1);
    expect(refs[0]?.identifier).toBe(defs[0]?.identifier);
    expect(defs[0]?.children).toStrictEqual([
      { type: "paragraph", children: [{ type: "text", value: "これが脚注" }] },
    ]);
  });

  test("keeps the surrounding text intact", () => {
    const tree = parse("本文^[脚注]の続き。");

    const paragraph = first_paragraph(tree);
    expect(paragraph.children).toStrictEqual([
      { type: "text", value: "本文" },
      expect.objectContaining({ type: "footnoteReference" }),
      { type: "text", value: "の続き。" },
    ]);
  });

  test("handles a footnote at the start and end of a text node", () => {
    const start = parse("^[先頭]です。");
    const startParagraph = first_paragraph(start);
    expect(startParagraph.children[0]?.type).toBe("footnoteReference");

    const end = parse("これは^[末尾]");
    const endParagraph = first_paragraph(end);
    expect(endParagraph.children.at(-1)?.type).toBe("footnoteReference");
  });

  test("numbers multiple footnotes uniquely in document order", () => {
    const tree = parse("一つ目^[注1]と二つ目^[注2]。\n\n三つ目^[注3]。");

    const refs = references(tree);
    const defs = definitions(tree);
    expect(refs).toHaveLength(3);
    expect(defs).toHaveLength(3);
    expect(refs.map((r) => r.identifier)).toStrictEqual(defs.map((d) => d.identifier));
    expect(new Set(refs.map((r) => r.identifier)).size).toBe(3);
  });

  test("converts multiple footnotes inside a single text node", () => {
    const tree = parse("A^[one]B^[two]C");

    const paragraph = first_paragraph(tree);
    expect(paragraph.children.map((c) => c.type)).toStrictEqual([
      "text",
      "footnoteReference",
      "text",
      "footnoteReference",
      "text",
    ]);
  });

  test("works inside emphasis", () => {
    const tree = parse("*強調^[注釈]文*");

    expect(references(tree)).toHaveLength(1);
    expect(definitions(tree)).toHaveLength(1);
  });

  test("leaves markdown without inline footnotes untouched", () => {
    const markdown = "ただの[リンク](https://example.com)と ^ と [括弧] です。";
    const tree = parse(markdown);
    const untouched = unified().use(remarkParse).use(remarkGfm).parse(markdown);

    expect(tree).toStrictEqual(untouched);
  });

  test("ignores empty footnotes", () => {
    const tree = parse("空^[]です。");

    expect(references(tree)).toHaveLength(0);
    expect(definitions(tree)).toHaveLength(0);
  });

  test("does not clash with handwritten GFM footnotes", () => {
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

  test("does not span across newlines", () => {
    const tree = parse("これは^[改行\nを含む]テキスト。");

    expect(references(tree)).toHaveLength(0);
  });

  test("renders through the existing GFM footnote pipeline (mdast → hast)", async () => {
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
