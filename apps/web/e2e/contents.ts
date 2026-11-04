import { readdirSync } from "node:fs";

const contentsDir = new URL("../../../contents/", import.meta.url);

/** The slugs of a collection's articles, one directory each under contents/. */
export const slugsOf = (collection: "blog" | "context"): string[] =>
  readdirSync(new URL(`${collection}/`, contentsDir), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
