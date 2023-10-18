import { compile_mdx } from "./compile_mdx";
import style from "./article.module.scss";
import "katex/dist/katex.min.css";

export type ArticleProps = {
  source: string;
};

export default async ({ source }: ArticleProps) => {
  const compiled = await compile_mdx(source);
  return <main className={style.article}>{compiled} </main>;
};
