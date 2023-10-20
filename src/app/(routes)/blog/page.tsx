import { css } from "@/styled-system/css";

import { type Metadata } from "next";

import { fetch_posts } from "@/features/fetch_post";
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

export default async function Page() {
  // { searchParams }: PageProps
  // const tag = searchParams.tag;

  const posts = await fetch_posts();
  // const posts = all_posts.filter(({ meta }) =>
  //   tag ? meta.tags.includes(tag) : true,
  // );

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
      {/*
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
      */}
      <div className={card_container_style}>
        {posts.map(({ slug, meta }) => (
          <LinkCard key={slug} slug={slug} meta={meta} />
        ))}
      </div>
    </div>
  );
}
