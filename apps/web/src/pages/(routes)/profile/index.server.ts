import { defineHandler, defineHead } from "void";
import type { InferProps } from "void";

import { fetchOgp } from "#/features/ogp.ts";
import { pageHead } from "#/libs/head.ts";

export const loader = defineHandler(async () => ({
  playlist: await fetchOgp("https://open.spotify.com/playlist/4DgSGXp7rK9Tq07PZIc19J"),
  renderedAt: Date.now(),
}));

export type Props = InferProps<typeof loader>;

export const head = defineHead(() =>
  pageHead({ title: "Who are you?", description: "About asa1984", type: "profile" }),
);
