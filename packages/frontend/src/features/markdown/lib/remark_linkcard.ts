import type { Transformer } from "unified";
import type { Parent } from "unist";
import type { Handler } from "mdast-util-to-hast";
import { visit } from "unist-util-visit";
import { is_parent, is_linkcard } from "./utils";

export const remark_linkcard = (): Transformer => {
  return (tree) => {
    visit(tree, is_linkcard, (node, index, parent: Parent | undefined) => {
      if (!is_parent(parent)) return;

      const child = node.children[0];

      parent.children[index as number] = {
        type: "linkcard",
        data: {
          hProperties: {
            url: child.url,
          },
        },
      };
    });
  };
};

export const linkcard_handler: Handler = (h, node) => {
  return {
    type: "element",
    tagName: "linkcard",
    properties: {
      href: node.data.hProperties.url,
    },
    children: h.all(node),
  };
};
