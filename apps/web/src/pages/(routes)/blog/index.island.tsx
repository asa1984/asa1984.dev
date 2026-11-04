import { css } from "#/styled-system/css";

import NavMenu from "../_components/nav-menu.tsx" with { island: "load" };
import { RoutesLayout } from "../_components/routes-layout.tsx";
import { LinkCard } from "./_components/link-card.tsx";
import RelativeDate from "./_components/relative-date.tsx" with { island: "load" };
import type { Props } from "./index.server.ts";

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
            image={post.image}
            date={<RelativeDate date={post.date} renderedAt={renderedAt} />}
          />
        ))}
      </div>
    </div>
  </RoutesLayout>
);

export default BlogPage;
