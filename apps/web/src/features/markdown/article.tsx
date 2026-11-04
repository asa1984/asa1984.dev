import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";

import { createComponents } from "./components.tsx";
import type { ArticleDocument } from "./load-article.ts";

import style from "./article.module.scss";
import "katex/dist/katex.min.css";

/** Renders an article prepared by loadArticle. */
export const Article = ({ document }: { document: ArticleDocument }) => (
  <div className={style["article"]}>
    {toJsxRuntime(document.root, {
      Fragment,
      jsx,
      jsxs,
      components: createComponents(document.ogps),
    })}{" "}
  </div>
);
