import { Feed } from "feed";

import { getBlogPost, listBlogPosts } from "#/features/blog.ts";
import { postAssetPath } from "#/features/content.ts";

/**
 * The blog's RSS 2.0 feed. Links point at the production site; `siteUrl` is the URL the build is
 * deployed to, which serves the cover images.
 */
export const buildFeed = async (siteUrl: string): Promise<string> => {
  const { items } = await listBlogPosts();
  const posts = await Promise.all(items.map(({ slug }) => getBlogPost(slug)));
  const feed = new Feed({
    title: "TrashBox - asa1984's tech blog",
    id: "https://asa1984.dev/blog",
    link: "https://asa1984.dev/blog",
    language: "ja",
    favicon: "https://asa1984.dev/favicon.ico",
    copyright: "All rights reserved 2023, asa1984",
    ...(items[0] === undefined ? {} : { updated: new Date(items[0].date.epochMilliseconds) }),
    author: {
      name: "asa1984",
      link: "https://asa1984.dev/profile",
    },
  });

  for (const post of posts) {
    if (post === undefined) {
      continue;
    }
    feed.addItem({
      title: post.title,
      id: `https://asa1984.dev/blog/${post.slug}`,
      link: `https://asa1984.dev/blog/${post.slug}`,
      description: post.description,
      content: post.body,
      date: new Date(post.date.epochMilliseconds),
      image: new URL(
        postAssetPath({ collection: "blog", slug: post.slug, file: post.image }),
        siteUrl,
      ).toString(),
    });
  }

  return feed.rss2();
};
