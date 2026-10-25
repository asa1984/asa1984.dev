import type { Link, Paragraph, Text } from "mdast";
import type { Literal, Node, Parent } from "unist";

const is_object = (target: unknown): target is Record<string, unknown> =>
  typeof target === "object" && target !== null;

// https://github.com/syntax-tree/unist#node
export const is_node = (node: unknown): node is Node => is_object(node) && "type" in node;

// https://github.com/syntax-tree/unist#parent
export const is_parent = (node: unknown): node is Parent =>
  is_object(node) && Array.isArray(node["children"]);

// https://github.com/syntax-tree/unist#literal
export const is_literal = (node: unknown): node is Literal => is_object(node) && "value" in node;

// https://github.com/syntax-tree/mdast#paragraph
export const is_paragraph = (node: unknown): node is Paragraph =>
  is_node(node) && node.type === "paragraph";

// https://github.com/syntax-tree/mdast#text
export const is_text = (node: unknown): node is Text =>
  is_literal(node) && node.type === "text" && typeof node.value === "string";

export const is_link = (node: unknown): node is Link => is_node(node) && node.type === "link";

// Link that has same url or "@card" as its text
export const is_linkcard = (
  node: unknown,
): node is Paragraph & {
  children: [Link & { children: [Text] }];
} => {
  if (!is_paragraph(node)) {
    return false;
  }
  const { children } = node;
  const child = children[0];
  return (
    children.length === 1 &&
    child?.type === "link" &&
    child.children[0]?.type === "text" &&
    (child.url === child.children[0].value || child.children[0].value === "@card")
  );
};
