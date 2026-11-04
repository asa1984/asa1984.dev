import { Feed } from "feed";

import { blogPosts } from "#/features/blog.ts";

/**
 * The blog's RSS 2.0 feed. Links point at the production site; `siteUrl` is the URL the build is
 * deployed to, which serves the cover images.
 */
export const buildFeed = (siteUrl: string): string => {
  const feed = new Feed({
    title: "TrashBox - asa1984's tech blog",
    id: "https://asa1984.dev/blog",
    link: "https://asa1984.dev/blog",
    language: "ja",
    favicon: "https://asa1984.dev/favicon.ico",
    copyright: "All rights reserved 2023, asa1984",
    ...(blogPosts[0] === undefined ? {} : { updated: blogPosts[0].date }),
    author: {
      name: "asa1984",
      link: "https://asa1984.dev/profile",
    },
  });

  for (const post of blogPosts) {
    feed.addItem({
      title: post.title,
      id: `https://asa1984.dev/blog/${post.slug}`,
      link: `https://asa1984.dev/blog/${post.slug}`,
      description: post.description,
      content: post.body,
      date: post.date,
      image: new URL(post.image, siteUrl).toString(),
    });
  }

  return feed.rss2();
};
