import { defineHead } from "void";

import { pageHead } from "#/libs/head.ts";

export const head = defineHead(() =>
  pageHead({
    title: "asa1984.dev",
    description: "asa1984's personal website",
    image: { path: "/opengraph-image.jpg", type: "image/jpeg", width: 399, height: 399 },
  }),
);
