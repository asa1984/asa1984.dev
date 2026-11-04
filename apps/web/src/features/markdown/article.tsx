import type { Root } from "hast";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";

import type { Ogp } from "#/features/ogp.ts";

import { createComponents } from "./components.tsx";

import style from "./article.module.scss";
import "katex/dist/katex.min.css";

/**
 * Renders an article compiled by compileMarkdown. `ogps` holds what each link card shows, keyed by
 * the URLs collectLinkCardUrls returns.
 */
export const Article = ({ root, ogps }: { root: Root; ogps: Record<string, Ogp> }) => (
  <div className={style["article"]}>
    {toJsxRuntime(root, {
      Fragment,
      jsx,
      jsxs,
      components: createComponents(ogps),
    })}{" "}
  </div>
);
