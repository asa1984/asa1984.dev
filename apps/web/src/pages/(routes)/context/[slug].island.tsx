import type { ContextArticle } from "#/features/articles.ts";

import { ArticleLayout } from "../_components/article-layout.tsx";
import NavMenu from "../_components/nav-menu.tsx" with { island: "load" };
import { RoutesLayout } from "../_components/routes-layout.tsx";

const ContextPostPage = ({ title, date, document }: ContextArticle) => (
  <RoutesLayout nav={<NavMenu segment="context" />}>
    <ArticleLayout title={title} date={date} document={document} />
  </RoutesLayout>
);

export default ContextPostPage;
