import type { Metadata } from "next";

import { notFound } from "next/navigation";

import { IconPen } from "@/components/icons";
import { get_post } from "@/features/context";
import Markdown from "@/features/markdown";
import { css } from "@/styled-system/css";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

// Rendered per request instead of ISR: page regeneration on Workers would
// need OpenNext's revalidation queue, so freshness lives in the data cache
// (stale-while-revalidate on the GitHub fetches) and publishing never
// requires a deploy.
export const dynamic = "force-dynamic";

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const { slug } = params;
  const post = await get_post(slug);
  if (!post) {
    return notFound();
  }
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

export default async function Page(props: PageProps) {
  const params = await props.params;
  const post = await get_post(params.slug);
  if (!post) {
    return notFound();
  }
  const { meta, content } = post;

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
      </header>

      <main>
        <Markdown source={content} type="context" slug={params.slug} />
      </main>
    </article>
  );
}
