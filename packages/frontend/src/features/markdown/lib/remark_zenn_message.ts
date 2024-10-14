import type { Paragraph } from "mdast";
import type { Handler } from "mdast-util-to-hast";
import type { Transformer } from "unified";
import type { Parent } from "unist";
import { visit } from "unist-util-visit";

import { is_paragraph, is_parent, is_text } from "./utils";

const MESSAGE_BEGINING = ":::message\n";
const MESSAGE_ENDING = "\n:::";

export function is_message(node: unknown): node is Paragraph {
  if (!is_paragraph(node)) return false;

  const { children } = node;
  const firstChild = children[0];
  if (!(is_text(firstChild) && firstChild.value.startsWith(MESSAGE_BEGINING))) return false;
  const lastChild = children[children.length - 1];
  if (!(is_text(lastChild) && lastChild.value.endsWith(MESSAGE_ENDING))) return false;

  return true;
}

export const remark_zenn_message = (): Transformer => {
  return (tree) => {
    visit(tree, is_message, (node, index, parent: Parent | undefined) => {
      if (!is_parent(parent)) return;

      const children = [...node.children];

      const first_child = children[0];
      if (first_child.type !== "text") return;
      const first_value = first_child.value;
      if (first_value === MESSAGE_BEGINING) {
        children.shift();
      } else {
        children[0] = {
          ...first_child,
          value: first_value.slice(MESSAGE_BEGINING.length),
        };
      }

      const last_child = children[children.length - 1];
      if (last_child.type !== "text") return;
      const last_value = last_child.value;
      if (last_value === MESSAGE_ENDING) {
        children.pop();
      } else {
        children[children.length - 1] = {
          ...last_child,
          value: last_value.slice(0, last_value.length - MESSAGE_ENDING.length),
        };
      }

      parent.children[index as number] = {
        type: "message",
        children,
      } as any; // FIXME: Remove any
    });
  };
};

export const zenn_message_handler: Handler = (h, node) => {
  return {
    type: "element",
    tagName: "message",
    properties: {},
    children: h.all(node),
  };
};
