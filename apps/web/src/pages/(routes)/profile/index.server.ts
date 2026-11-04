import { defineHandler, defineHead } from "void";

import { fetchOgp } from "#/features/ogp.ts";
import { voidHead } from "#/libs/void-head.ts";

import type { Props } from "./index.island.tsx";

export const loader = defineHandler(async (): Promise<Props> => ({
  playlist: await fetchOgp("https://open.spotify.com/playlist/4DgSGXp7rK9Tq07PZIc19J"),
  renderedAt: Date.now(),
}));

export const head = defineHead(() =>
  voidHead({ title: "Who are you?", description: "About asa1984", type: "profile" }),
);
