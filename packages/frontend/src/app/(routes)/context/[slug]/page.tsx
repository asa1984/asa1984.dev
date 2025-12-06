import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { IconPen } from "@/components/icons";
import { get_post } from "@/features/context";
import Markdown from "@/features/markdown";
import { css } from "@/styled-system/css";

const generateMetadata = async ({
  params,
}: PageProps<"/context/[slug]">): Promise<Metadata> => {
  const { slug } = await params;
  const post = await get_post(slug);
  if (!post) return notFound();
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
};

const PageInner = async ({ params }: PageProps<"/context/[slug]">) => {
  const { slug } = await params;
  const post = await get_post(slug);
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
        <Markdown source={content} type="context" slug={slug} />
      </main>
    </article>
  );
};

const Page = (props: PageProps<"/context/[slug]">) => {
  return (
    <Suspense>
      <PageInner {...props} />
    </Suspense>
  );
};

export default Page;
export { generateMetadata };
