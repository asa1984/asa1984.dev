import { type Metadata } from "next";

import { css } from "@/styled-system/css";

import { get_posts, type Post } from "@/features/context";
import { LinkCard } from "./_components/link_card";

export const metadata: Metadata = {
  title: "TrashBox",
  description: "Blog",
  openGraph: {
    title: "TrashBox",
    description: "Blog",
  },
};

type Years = Map<number, Post[]>;
async function get_posts_per_years() {
  const posts = await get_posts();
  const years: Years = new Map();
  for (const post of posts) {
    const year = post.meta.date.getFullYear();
    if (!years.has(year)) {
      years.set(year, []);
    }
    // biome-ignore lint: This is not null
    years.get(year)!.push(post);
  }
  return years;
}

export default async function Page() {
  const years_posts = await get_posts_per_years();
  const years = [...years_posts.entries()].sort(([a], [b]) => b - a);

  return (
    <div
      className={css({
        mt: 8,
        mx: "auto",
      })}
    >
      {years.map(([year, posts]) => {
        return (
          <div key={year}>
            <h2
              className={css({
                mt: 6,
                fontSize: "3xl",
                fontWeight: "extrabold",
              })}
            >
              {year}
            </h2>
            <div
              className={css({
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 4,
                "@media (max-width: 768px)": {
                  gridTemplateColumns: "1fr",
                },
              })}
            >
              {posts
                .sort((a, b) => b.meta.date.getTime() - a.meta.date.getTime())
                .map((post) => {
                  return <LinkCard key={post.slug} slug={post.slug} meta={post.meta} />;
                })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
