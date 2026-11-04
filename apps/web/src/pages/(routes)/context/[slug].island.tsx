import type { Root } from "hast";

import type { ContextPostMeta } from "#/features/context.ts";
import { Article } from "#/features/markdown.ts";
import type { Ogp } from "#/features/ogp.ts";

import { ArticleLayout } from "../_components/article-layout.tsx";
import NavMenu from "../_components/nav-menu.tsx" with { island: "load" };
import { RoutesLayout } from "../_components/routes-layout.tsx";

export type Props = {
  post: ContextPostMeta;
  /** The post's body compiled by compileMarkdown. */
  root: Root;
  /** What the body's link cards show. */
  ogps: Record<string, Ogp>;
};

const ContextPostPage = ({ post, root, ogps }: Props) => (
  <RoutesLayout nav={<NavMenu segment="context" />}>
    <ArticleLayout title={post.title} date={post.date}>
      <Article root={root} ogps={ogps} />
    </ArticleLayout>
  </RoutesLayout>
);

export default ContextPostPage;
