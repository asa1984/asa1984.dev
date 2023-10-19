import { type Metadata } from "next";
import { css } from "@/styled-system/css";

import { IconPen } from "@/components/icons";
import Markdown from "@/features/markdown";
import { fetch_posts, fetch_post } from "@/features/fetch_post";

type PageProps = {
  params: {
    slug: string;
  };
};

export async function generateStaticParams(): Promise<PageProps["params"][]> {
  const posts = await fetch_posts();
  return posts.map(({ slug }) => ({
    slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = params;
  const post = await fetch_post(slug);
  const { title, description } = post.meta;
  return {
    title,
    description,
  };
}

export default async function Page({ params }: PageProps) {
  const { meta, content } = await fetch_post(params.slug);

  return (
    <>
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
        <img
          src={meta.image}
          alt={meta.title}
          className={css({
            mx: "auto",
            width: "lg",
            aspectRatio: "16 / 9",
            objectFit: "cover",
            borderRadius: "xl",
            border: "2px solid",
          })}
        />
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
        <p className={css({ mt: 4, textAlign: "center" })}>
          {meta.description}
        </p>
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
        <div
          className={css({ mt: 4, display: "flex", justifyContent: "center" })}
        ></div>
      </header>
      <Markdown source={content} />
    </>
  );
}
