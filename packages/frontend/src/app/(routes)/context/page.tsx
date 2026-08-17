import type { Metadata } from "next";

import type { Post } from "@/features/context";

import { get_published_posts } from "@/features/context";
import { css } from "@/styled-system/css";

import { LinkCard } from "./_components/LinkCard";

// Per-request render; see context/[slug]/page.tsx for why ISR is avoided.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Context",
  description: "Context list",
  openGraph: {
    title: "Context",
    description: "Context list",
  },
};

type Years = Map<number, Post[]>;
async function get_posts_per_years() {
  const posts = await get_published_posts();
  const years: Years = new Map();
  for (const post of posts) {
    const year = post.meta.date.getFullYear();
    const posts_of_year = years.get(year) ?? [];
    posts_of_year.push(post);
    years.set(year, posts_of_year);
  }
  return years;
}

export default async function Page() {
  const years_posts = await get_posts_per_years();
  const years = [...years_posts.entries()].toSorted(([a], [b]) => b - a);

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
                .toSorted((a, b) => b.meta.date.getTime() - a.meta.date.getTime())
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
