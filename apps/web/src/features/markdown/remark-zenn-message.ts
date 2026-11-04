import type { Paragraph, Parent, Root } from "mdast";
import type { Transformer } from "unified";
import { visit } from "unist-util-visit";

import { isParagraph, isParent, isText } from "./mdast-guards.ts";

const messageBeginning = ":::message\n";
const messageEnding = "\n:::";

/** Whether the paragraph is a Zenn `:::message ... :::` block. */
const isMessage = (node: unknown): node is Paragraph => {
  if (!isParagraph(node)) {
    return false;
  }
  const firstChild = node.children[0];
  const lastChild = node.children.at(-1);
  return (
    isText(firstChild) &&
    firstChild.value.startsWith(messageBeginning) &&
    isText(lastChild) &&
    lastChild.value.endsWith(messageEnding)
  );
};

/** Turns Zenn `:::message ... :::` paragraphs into `message` nodes. */
export const remarkZennMessage = (): Transformer<Root> => (tree) => {
  visit(tree, isMessage, (node, index, parent: Parent | undefined) => {
    if (!isParent(parent) || index === undefined) {
      return;
    }

    const children = [...node.children];

    const firstChild = children.at(0);
    if (firstChild?.type !== "text") {
      return;
    }
    if (firstChild.value === messageBeginning) {
      children.shift();
    } else {
      children[0] = { ...firstChild, value: firstChild.value.slice(messageBeginning.length) };
    }

    const lastChild = children.at(-1);
    if (lastChild?.type !== "text") {
      return;
    }
    if (lastChild.value === messageEnding) {
      children.pop();
    } else {
      children[children.length - 1] = {
        ...lastChild,
        value: lastChild.value.slice(0, lastChild.value.length - messageEnding.length),
      };
    }

    // A transformer rewrites the tree it receives in place.
    // oxlint-disable-next-line eslint/no-param-reassign
    parent.children[index] = { type: "message", children };
  });
};
