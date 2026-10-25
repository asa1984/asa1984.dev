import { Feed } from "feed";

import { get_posts_date_sorted } from "@/features/blog.ts";

export async function GET() {
  const posts = await get_posts_date_sorted();
  const latest = posts[0];

  const feed = new Feed({
    title: "TrashBox - asa1984's tech blog",
    id: "https://asa1984.dev/blog",
    link: "https://asa1984.dev/blog",
    language: "ja",
    favicon: "https://asa1984.dev/favicon.ico",
    copyright: "All rights reserved 2023, asa1984",
    ...(latest === undefined ? {} : { updated: latest.meta.date }),
    author: {
      name: "asa1984",
      link: "https://asa1984.dev/profile",
    },
  });

  for (const { slug, meta, content } of posts) {
    const { title, date, description, image } = meta;
    feed.addItem({
      title,
      id: `https://asa1984.dev/blog/${slug}`,
      link: `https://asa1984.dev/blog/${slug}`,
      description,
      content,
      date,
      image,
    });
  }

  return new Response(feed.rss2(), {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
