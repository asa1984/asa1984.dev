import { type Metadata } from "next";
import { css } from "@/styled-system/css";

import { IconPen } from "@/components/icons";
import Markdown from "@/features/markdown";
import { get_post } from "@/features/miniblog";

type PageProps = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = params;
  const post = await get_post(slug);
  const { title } = post.meta;
  return {
    title,
    description: title,
    openGraph: {
      title,
      description: title,
      type: "article",
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { meta, content } = await get_post(params.slug);

  return (
    <article
      className={css({
        mx: "auto",
        maxW: "75ch",
      })}
    >
      <header
        className={css({
          my: 12,
          pb: 8,
          borderBottom: "1px solid var(--colors-gray-300)",
          "@media (max-width: 768px)": {
            my: 8,
          },
        })}
      >
        <h1
          className={css({
            mt: 12,
            mx: "auto",
            maxW: "max",
            fontSize: "4xl",
            fontWeight: "extrabold",
          })}
        >
          {meta.title}
        </h1>
        <time
          dateTime={meta.date.toISOString()}
          className={css({
            mt: 4,
            display: "flex",
            color: "gray.500",
            fontWeight: "semibold",
            justifyContent: "center",
            alignItems: "center",
          })}
        >
          <IconPen
            className={css({
              display: "inline-block",
              mr: 1,
              fontSize: "lg",
            })}
          />
          {meta.date.toDateString()}
        </time>
        {/* 
        <div className={css({ mt: 4, display: "flex", justifyContent: "center" })}/>
        */}
      </header>

      <main>
        <Markdown source={content} type="context" slug={params.slug} />
      </main>
    </article>
  );
}
