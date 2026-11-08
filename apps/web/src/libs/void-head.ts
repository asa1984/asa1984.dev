import type { HeadDescriptor } from "void";
import { env } from "void/env";

import type { PageHead } from "./head.ts";
import { headTags } from "./head.ts";

/** A page's head for Void's `defineHead`, with URLs resolved against the deployed site URL. */
export const voidHead = (head: PageHead): HeadDescriptor =>
  headTags({ head, siteUrl: env.VITE_SITE_URL });
