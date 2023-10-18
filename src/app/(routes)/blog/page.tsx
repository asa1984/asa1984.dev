import fs from "fs/promises";
import { parse_frontmatter } from "@/features/frontmatter";
import { css } from "@/styled-system/css";

import { type Metadata } from "next";

import { LinkCard } from "./_components/link_card";

type PageProps = {
  searchParams: {
    tag?: string;
  };
};

export const metadata: Metadata = {
  title: "TrashBox",
  description: "Blog",
};

export default async function Page({ searchParams }: PageProps) {
  const tag = searchParams.tag;

  const files = await fs.readdir("post");

  const result = await Promise.all(
    files.map(async (file) => {
      const source = await fs.readFile(`post/${file}`, "utf-8");
      const parsed = parse_frontmatter(source);
      return { file, parsed };
    }),
  );
  const posts = result
    .filter(({ parsed }) => parsed.isOk())
    .map(({ file, parsed }) => ({
      slug: file.split(".")[0],
      meta: parsed.unwrap().frontmatter,
    }))
    .filter(({ meta }) => meta.published)
    .filter(({ meta }) => (tag ? meta.tags.includes(tag) : true));

  const card_container_style = css({
    mt: 8,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gridGap: 8,
    "@media (max-width: 768px)": {
      gridTemplateColumns: "1fr",
    },
  });

  return (
    <div className={css({ mt: 8 })}>
      <h1
        className={css({
          display: "inline-block",
          px: 4,
          rounded: "full",
          fontSize: "xl",
          fontFamily: "monospace",
          color: "white",
          bg: "black",
        })}
      >
        {tag && `#${tag}`}
      </h1>
      <div className={card_container_style}>
        {posts.map(({ slug, meta }) => (
          <LinkCard key={slug} slug={slug} meta={meta} />
        ))}
      </div>
    </div>
  );
}
