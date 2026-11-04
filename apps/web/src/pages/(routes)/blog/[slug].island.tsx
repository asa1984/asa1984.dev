import type { Root } from "hast";

import type { BlogPostMeta } from "#/features/blog.ts";
import { postAssetPath } from "#/features/content.ts";
import { Article } from "#/features/markdown.ts";
import type { Ogp } from "#/features/ogp.ts";

import { ArticleLayout } from "../_components/article-layout.tsx";
import NavMenu from "../_components/nav-menu.tsx" with { island: "load" };
import { RoutesLayout } from "../_components/routes-layout.tsx";

export type Props = {
  post: BlogPostMeta;
  /** The post's body compiled by compileMarkdown. */
  root: Root;
  /** What the body's link cards show. */
  ogps: Record<string, Ogp>;
};

const BlogPostPage = ({ post, root, ogps }: Props) => (
  <RoutesLayout nav={<NavMenu segment="blog" />}>
    <ArticleLayout
      title={post.title}
      description={post.description}
      image={postAssetPath({ collection: "blog", slug: post.slug, file: post.image })}
      date={post.date}
    >
      <Article root={root} ogps={ogps} />
    </ArticleLayout>
  </RoutesLayout>
);

export default BlogPostPage;
