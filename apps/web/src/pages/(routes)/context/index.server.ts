import { defineHandler, defineHead } from "void";

import { listContextPostSummaries } from "#/features/context.ts";
import { voidHead } from "#/libs/void-head.ts";

import type { Props } from "./index.island.tsx";

export const loader = defineHandler((): Props => ({ posts: listContextPostSummaries() }));

export const head = defineHead(() => voidHead({ title: "Context", description: "Context list" }));
