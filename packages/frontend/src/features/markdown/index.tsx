import { compile_mdx } from "./compile_mdx";
import style from "./article.module.scss";
import "katex/dist/katex.min.css";
import { Suspense } from "react";

export type MarkdownProps = {
  source: string;
  type: "context" | "blog";
  slug: string;
};

const Markdown = async ({ source, type, slug }: MarkdownProps) => {
  const compiled = await compile_mdx({
    source,
    type,
    slug,
  });
  return <div className={style.article}>{compiled} </div>;
};

const MarkdownWrapper = (props: MarkdownProps) => (
  <Suspense>
    <Markdown {...props} />
  </Suspense>
);

export default MarkdownWrapper;
