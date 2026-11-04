import type { Root } from "hast";

import { fetchOgps } from "#/features/ogp.ts";
import type { Ogp } from "#/features/ogp.ts";

import { collectLinkCardUrls, compileMarkdown } from "./compile.ts";

/** Everything needed to render an article, prepared by a page loader. */
export type ArticleDocument = {
  root: Root;
  ogps: Record<string, Ogp>;
};

/**
 * Compiles an article and fetches what its link cards show. Page components render
 * synchronously, so this async half runs in the page's loader.
 */
export const loadArticle = async ({
  source,
  assetBase,
}: {
  source: string;
  assetBase: string;
}): Promise<ArticleDocument> => {
  const root = await compileMarkdown({ source, assetBase });
  return { root, ogps: await fetchOgps(collectLinkCardUrls(root)) };
};
