import style from "./article.module.scss";
import { compile_markdown } from "./compile_markdown";
import "katex/dist/katex.min.css";

export type MarkdownProps = {
  source: string;
  type: "context" | "blog";
  slug: string;
};

export const Markdown = async ({ source, type, slug }: MarkdownProps) => {
  const compiled = await compile_markdown({
    source,
    type,
    slug,
  });
  return <div className={style.article}>{compiled} </div>;
};
