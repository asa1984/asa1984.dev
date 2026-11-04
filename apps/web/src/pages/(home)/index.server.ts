import { defineHead } from "void";

import { sitePathSchema } from "#/libs/site-path.ts";
import { voidHead } from "#/libs/void-head.ts";

const ogImage = {
  path: sitePathSchema.parse("/opengraph-image.jpg"),
  type: "image/jpeg",
  width: 399,
  height: 399,
};

export const head = defineHead(() =>
  voidHead({ title: "asa1984.dev", description: "asa1984's personal website", image: ogImage }),
);
