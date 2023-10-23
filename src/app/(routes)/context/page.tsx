import { css } from "@/styled-system/css";

import { type Metadata } from "next";

import { get_posts, type Post } from "@/features/miniblog";

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
async function get_sorted_posts() {
  const posts = await get_posts();
  const years: Years = new Map();
  for (const post of posts) {
    const year = post.meta.date.getFullYear();
    if (!years.has(year)) {
      years.set(year, []);
    }
    years.get(year)!.push(post);
  }
  return years;
}

export default async function Page() {
  const posts = await get_sorted_posts();
  const years = [...posts.entries()].sort().reverse();

  return (
    <div
      className={css({
        mt: 8,
        mx: "auto",
      })}
    >
      {years.map(([year, post]) => {
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
              {post.map((post) => {
                return (
                  <LinkCard key={post.slug} slug={post.slug} meta={post.meta} />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
