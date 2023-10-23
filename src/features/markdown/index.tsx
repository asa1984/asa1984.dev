import { compile_mdx } from "./compile_mdx";
import style from "./article.module.scss";
import "katex/dist/katex.min.css";

export type MarkdownProps = {
  source: string;
};

export default async function Markdown({ source }: MarkdownProps) {
  const compiled = await compile_mdx(source);
  return <div className={style.article}>{compiled} </div>;
}
