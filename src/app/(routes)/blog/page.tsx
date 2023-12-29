import { css } from "@/styled-system/css";

import { type Metadata } from "next";

import { get_posts } from "@/features/blog";
import { LinkCard } from "./_components/link_card";

export const metadata: Metadata = {
  title: "TrashBox",
  description: "Blog",
  openGraph: {
    title: "TrashBox",
    description: "Blog",
  },
};

export default async function Page() {
  const posts = await get_posts();
  const sorted_posts = posts.sort((a, b) => {
    return b.meta.date.getTime() - a.meta.date.getTime();
  });

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
      <div className={card_container_style}>
        {sorted_posts.map(({ slug, meta }) => (
          <LinkCard key={slug} slug={slug} meta={meta} />
        ))}
      </div>
    </div>
  );
}
