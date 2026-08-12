import type { FootnoteDefinition, PhrasingContent, Root, Text } from "mdast";
import type { Transformer } from "unified";
import { visit } from "unist-util-visit";

// Zenn-compatible inline footnotes: ^[note] inside prose. The note body is
// plain text only (no "]" and no newline) — richer content should use the
// GFM reference form ([^id] + definition), which this plugin coexists with.
const INLINE_FOOTNOTE = /\^\[([^\]\n]+)\]/g;

// Namespaced so generated identifiers cannot collide with handwritten
// GFM footnote identifiers.
const ID_PREFIX = "inline-fn-";

export const remark_inline_footnote = (): Transformer<Root> => {
  return (tree) => {
    const definitions: FootnoteDefinition[] = [];

    visit(tree, "text", (node: Text, index, parent) => {
      if (!parent || index === undefined) return;

      const matches = [...node.value.matchAll(INLINE_FOOTNOTE)];
      if (matches.length === 0) return;

      const parts: PhrasingContent[] = [];
      let consumed = 0;
      for (const match of matches) {
        if (match.index > consumed) {
          parts.push({
            type: "text",
            value: node.value.slice(consumed, match.index),
          });
        }
        const identifier = `${ID_PREFIX}${definitions.length + 1}`;
        definitions.push({
          type: "footnoteDefinition",
          identifier,
          children: [
            {
              type: "paragraph",
              children: [{ type: "text", value: match[1]! }],
            },
          ],
        });
        parts.push({ type: "footnoteReference", identifier });
        consumed = match.index + match[0].length;
      }
      if (consumed < node.value.length) {
        parts.push({ type: "text", value: node.value.slice(consumed) });
      }

      parent.children.splice(index, 1, ...parts);
      // Resume after the nodes we just inserted.
      return index + parts.length;
    });

    tree.children.push(...definitions);
  };
};
