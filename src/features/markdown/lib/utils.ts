import { Node, Parent, Literal } from "unist";
import { Paragraph, Text, Link } from "mdast";

function is_object(target: unknown): target is { [key: string]: unknown } {
  return typeof target === "object" && target !== null;
}

// https://github.com/syntax-tree/unist#node
export function is_node(node: unknown): node is Node {
  return is_object(node) && "type" in node;
}

// https://github.com/syntax-tree/unist#parent
export function is_parent(node: unknown): node is Parent {
  return is_object(node) && Array.isArray(node.children);
}

// https://github.com/syntax-tree/unist#literal
export function is_literal(node: unknown): node is Literal {
  return is_object(node) && "value" in node;
}

// https://github.com/syntax-tree/mdast#paragraph
export function is_paragraph(node: unknown): node is Paragraph {
  return is_node(node) && node.type === "paragraph";
}

// https://github.com/syntax-tree/mdast#text
export function is_text(node: unknown): node is Text {
  return (
    is_literal(node) && node.type === "text" && typeof node.value === "string"
  );
}

export function is_link(node: unknown): node is Link {
  return is_node(node) && node.type === "link";
}

// Link that has same url or "@card" as its text
export function is_linkcard(node: unknown): node is Paragraph & {
  children: [Link & { children: [Text] }];
} {
  if (!is_paragraph(node)) return false;
  const { children } = node;
  const child = children[0];
  return (
    children.length === 1 &&
    child.type === "link" &&
    child.children[0].type === "text" &&
    (child.url === child.children[0].value ||
      child.children[0].value === "@card")
  );
}
