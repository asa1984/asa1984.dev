import { css } from "#/styled-system/css";

import NavMenu from "../_components/nav-menu.tsx" with { island: "load" };
import { RoutesLayout } from "../_components/routes-layout.tsx";
import { LinkCard } from "./_components/link-card.tsx";
import type { Props } from "./index.server.ts";

type PostSummary = Props["posts"][number];

/** Groups the posts by year, newest year first, keeping their order within each year. */
const groupByYear = (posts: PostSummary[]): [number, PostSummary[]][] => {
  const years = new Map<number, PostSummary[]>();
  for (const post of posts) {
    const year = new Date(post.date).getFullYear();
    years.set(year, [...(years.get(year) ?? []), post]);
  }
  return [...years.entries()].toSorted(([a], [b]) => b - a);
};

const containerStyle = css({
  mt: 8,
  mx: "auto",
});

const yearStyle = css({
  mt: 6,
  fontSize: "3xl",
  fontWeight: "extrabold",
});

const cardsStyle = css({
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 4,
  "@media (max-width: 768px)": {
    gridTemplateColumns: "1fr",
  },
});

const ContextPage = ({ posts }: Props) => (
  <RoutesLayout nav={<NavMenu segment="context" />}>
    <div className={containerStyle}>
      {groupByYear(posts).map(([year, postsOfYear]) => (
        <div key={year}>
          <h2 className={yearStyle}>{year}</h2>
          <div className={cardsStyle}>
            {postsOfYear.map((post) => (
              <LinkCard key={post.slug} {...post} />
            ))}
          </div>
        </div>
      ))}
    </div>
  </RoutesLayout>
);

export default ContextPage;
