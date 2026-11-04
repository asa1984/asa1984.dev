import { defineHandler, defineHead } from "void";

import { getBlogPost, listBlogPosts } from "#/features/blog.ts";
import { postAssetPath, slugSchema } from "#/features/content.ts";
import { collectLinkCardUrls, compileMarkdown } from "#/features/markdown.ts";
import { fetchOgps } from "#/features/ogp.ts";
import { voidHead } from "#/libs/void-head.ts";

import type { Props } from "./[slug].island.tsx";

export const getPrerenderPaths = async () => {
  const { items } = await listBlogPosts();
  return items.map(({ slug }) => ({ slug }));
};

export const loader = defineHandler(async (c): Promise<Props | Response> => {
  const slug = slugSchema.safeParse(c.req.param("slug"));
  const post = slug.success ? await getBlogPost(slug.data) : undefined;
  if (post === undefined) {
    return c.notFound();
  }
  const root = await compileMarkdown({
    source: post.body,
    assetBase: postAssetPath({ collection: "blog", slug: post.slug }),
  });
  return { post, root, ogps: await fetchOgps(collectLinkCardUrls(root)) };
});

export const head = defineHead<Props>((_c, { post }) =>
  voidHead({
    title: post.title,
    description: post.description,
    type: "article",
    image: { path: postAssetPath({ collection: "blog", slug: post.slug, file: post.image }) },
    card: "summary_large_image",
  }),
);
