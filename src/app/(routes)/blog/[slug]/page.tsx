import fs from "fs/promises";

import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { css } from "@/styled-system/css";
import { parse_frontmatter } from "@/features/frontmatter";

import { IconPen } from "@/components/icons";
import Markdown from "@/features/markdown";

type PageProps = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = params;
  const source = await fs.readFile(`post/${slug}.md`, "utf-8");
  const result = parse_frontmatter(source);
  const { frontmatter } = result.unwrapOrElse(() => notFound());
  const { title, description } = frontmatter;
  return { title, description };
}

export default async function Page({ params }: PageProps) {
  const source = await fs.readFile(`post/${params.slug}.md`, "utf-8");
  const result = parse_frontmatter(source);
  const { frontmatter, content } = result.unwrapOrElse(() => notFound());

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
          src={frontmatter.image}
          alt={frontmatter.title}
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
          {frontmatter.title}
        </h1>
        <p className={css({ mt: 4, textAlign: "center" })}>
          {frontmatter.description}
        </p>
        <time
          dateTime={frontmatter.date.toISOString()}
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
          {frontmatter.date.toDateString()}
        </time>
        <div
          className={css({ mt: 4, display: "flex", justifyContent: "center" })}
        ></div>
      </header>
      <Markdown source={content} />
    </>
  );
}
