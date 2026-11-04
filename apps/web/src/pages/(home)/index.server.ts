import { defineHead } from "void";

import { voidHead } from "#/libs/void-head.ts";

export const head = defineHead(() =>
  voidHead({
    title: "asa1984.dev",
    description: "asa1984's personal website",
    image: { path: "/opengraph-image.jpg", type: "image/jpeg", width: 399, height: 399 },
  }),
);
