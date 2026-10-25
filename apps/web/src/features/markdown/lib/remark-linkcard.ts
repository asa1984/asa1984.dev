import type { Parent, Root } from "mdast";
import type { Handler } from "mdast-util-to-hast";
import type { Transformer } from "unified";
import { visit } from "unist-util-visit";

import { is_linkcard, is_parent } from "./utils.ts";

export const remark_linkcard = (): Transformer<Root> => (tree) => {
  visit(tree, is_linkcard, (node, index, parent: Parent | undefined) => {
    if (!is_parent(parent) || index === undefined) {
      return;
    }

    const child = node.children[0];

    // A transformer rewrites the tree it receives in place.
    // oxlint-disable-next-line eslint/no-param-reassign
    parent.children[index] = {
      type: "linkcard",
      data: {
        hProperties: {
          url: child.url,
        },
      },
    };
  });
};

export const linkcard_handler: Handler = (h, node) => ({
  type: "element",
  tagName: "linkcard",
  properties: {
    href: node.data.hProperties.url,
  },
  children: h.all(node),
});
