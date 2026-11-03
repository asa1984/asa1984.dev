import type { Link, Paragraph, Text } from "mdast";
import type { Literal, Node, Parent } from "unist";

const isObject = (target: unknown): target is Record<string, unknown> =>
  typeof target === "object" && target !== null;

/** https://github.com/syntax-tree/unist#node */
export const isNode = (node: unknown): node is Node => isObject(node) && "type" in node;

/** https://github.com/syntax-tree/unist#parent */
export const isParent = (node: unknown): node is Parent =>
  isObject(node) && Array.isArray(node["children"]);

/** https://github.com/syntax-tree/unist#literal */
export const isLiteral = (node: unknown): node is Literal => isObject(node) && "value" in node;

/** https://github.com/syntax-tree/mdast#paragraph */
export const isParagraph = (node: unknown): node is Paragraph =>
  isNode(node) && node.type === "paragraph";

/** https://github.com/syntax-tree/mdast#text */
export const isText = (node: unknown): node is Text =>
  isLiteral(node) && node.type === "text" && typeof node.value === "string";

/** A paragraph holding only a link whose text is its URL or "@card". */
export const isLinkCardParagraph = (
  node: unknown,
): node is Paragraph & { children: [Link & { children: [Text] }] } => {
  if (!isParagraph(node)) {
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
