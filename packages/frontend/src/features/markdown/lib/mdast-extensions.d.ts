/**
 * Custom mdast nodes produced by our remark transformers. Registering them in
 * RootContentMap makes them part of mdast's Nodes union, which is what
 * mdast-util-to-hast keys its `handlers` record by.
 */
import type { Parent, PhrasingContent } from "mdast";
import type { Node } from "unist";

declare module "mdast" {
  // remark_zenn_message: ":::message ... :::" paragraph → message node
  interface ZennMessage extends Parent {
    type: "message";
    children: PhrasingContent[];
  }

  // remark_linkcard: bare-link paragraph → linkcard node
  interface Linkcard extends Node {
    type: "linkcard";
    data?: {
      hProperties: {
        url: string;
      };
    };
  }

  interface RootContentMap {
    message: ZennMessage;
    linkcard: Linkcard;
  }
}
