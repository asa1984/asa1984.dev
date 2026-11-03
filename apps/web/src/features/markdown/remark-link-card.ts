import type { Parent, Root } from "mdast";
import type { Transformer } from "unified";
import { visit } from "unist-util-visit";

import { isLinkCardParagraph, isParent } from "./mdast-guards.ts";

/** Turns a paragraph that holds only a bare link into a `linkCard` node. */
export const remarkLinkCard = (): Transformer<Root> => (tree) => {
  visit(tree, isLinkCardParagraph, (node, index, parent: Parent | undefined) => {
    if (!isParent(parent) || index === undefined) {
      return;
    }

    const child = node.children[0];

    // A transformer rewrites the tree it receives in place.
    // oxlint-disable-next-line eslint/no-param-reassign
    parent.children[index] = {
      type: "linkCard",
      data: {
        hProperties: {
          url: child.url,
        },
      },
    };
  });
};
