/**
 * Custom mdast nodes produced by our remark transformers. Registering them in
 * RootContentMap makes them part of mdast's Nodes union, which is what
 * mdast-util-to-hast keys its `handlers` record by.
 */
import type { Parent, PhrasingContent } from "mdast";
import type { Node } from "unist";

// Augmenting mdast relies on declaration merging, which only interfaces support.
/* oxlint-disable typescript/consistent-type-definitions */
declare module "mdast" {
  /** remarkZennMessage: ":::message ... :::" paragraph → message node */
  interface ZennMessage extends Parent {
    type: "message";
    children: PhrasingContent[];
  }

  /** remarkLinkCard: bare-link paragraph → linkCard node */
  interface LinkCard extends Node {
    type: "linkCard";
    data?: {
      hProperties: {
        url: string;
      };
    };
  }

  interface RootContentMap {
    message: ZennMessage;
    linkCard: LinkCard;
  }
}
