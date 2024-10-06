import type { Metadata } from "next";
import { css } from "@/styled-system/css";
import { get_posts_date_sorted } from "@/features/blog";
import { LinkCard } from "./_components/LinkCard";

export const metadata: Metadata = {
  title: "TrashBox",
  description: "Blog list",
  openGraph: {
    title: "TrashBox",
    description: "Blog list",
  },
};

const card_container_style = css({
  mt: 8,
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gridGap: 8,
  "@media (max-width: 768px)": {
    gridTemplateColumns: "1fr",
  },
});

export default async function Page() {
  const posts = await get_posts_date_sorted();

  return (
    <div className={css({ mt: 8 })}>
      <div className={card_container_style}>
        {posts.map(({ slug, meta }) => (
          <LinkCard key={slug} slug={slug} meta={meta} />
        ))}
      </div>
    </div>
  );
}
