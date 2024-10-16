import { IconPen } from "@/components/icons";
import { get_post, get_published_posts } from "@/features/blog";
import Markdown from "@/features/markdown";
import { css } from "@/styled-system/css";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

type PageProps = {
  params: {
    slug: string;
  };
};

export async function generateStaticParams() {
  const posts = await get_published_posts();
  return posts.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params: { slug } }: PageProps): Promise<Metadata> {
  const post = await get_post(slug);
  if (!post) return notFound();
  const { title, description, image } = post.meta;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [image],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export default async function Page({ params: { slug } }: PageProps) {
  const post = await get_post(slug);
  if (!post) return notFound();
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
        <Image
          src={meta.image}
          alt={meta.title}
          width={512}
          height={288}
          priority
          decoding="async"
          className={css({
            mx: "auto",
            width: "lg",
            aspectRatio: "16 / 9",
            objectFit: "cover",
            borderRadius: "xl",
            borderStyle: "solid",
            borderWidth: "2px",
            borderColor: "black",
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
        <p className={css({ mt: 4, textAlign: "center" })}>{meta.description}</p>
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
        <Markdown source={content} type="blog" slug={slug} />
      </main>
    </article>
  );
}
