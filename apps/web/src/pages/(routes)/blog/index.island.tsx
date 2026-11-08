import type { BlogPostMeta } from "#/features/blog.ts";
import { postAssetPath } from "#/features/content.ts";
import { css } from "#/styled-system/css";

import NavMenu from "../_components/nav-menu.tsx" with { island: "load" };
import { RoutesLayout } from "../_components/routes-layout.tsx";
import { LinkCard } from "./_components/link-card.tsx";
import RelativeDate from "./_components/relative-date.tsx" with { island: "load" };

export type Props = {
  posts: BlogPostMeta[];
  /** When the page was prerendered, which the RelativeDate islands hydrate with. */
  renderedAt: number;
};

const containerStyle = css({ mt: 8 });

const cardsStyle = css({
  mt: 8,
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gridGap: 8,
  "@media (max-width: 768px)": {
    gridTemplateColumns: "1fr",
  },
});

const BlogPage = ({ posts, renderedAt }: Props) => (
  <RoutesLayout nav={<NavMenu segment="blog" />}>
    <div className={containerStyle}>
      <div className={cardsStyle}>
        {posts.map((post) => (
          <LinkCard
            key={post.slug}
            slug={post.slug}
            title={post.title}
            description={post.description}
            image={postAssetPath({ collection: "blog", slug: post.slug, file: post.image })}
            // Island props are JSON, so the date crosses as an ISO 8601 string.
            date={<RelativeDate date={post.date.toString()} renderedAt={renderedAt} />}
          />
        ))}
      </div>
    </div>
  </RoutesLayout>
);

export default BlogPage;
