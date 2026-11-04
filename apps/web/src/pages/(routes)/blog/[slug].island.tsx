import type { BlogArticle } from "#/features/articles.ts";

import { ArticleLayout } from "../_components/article-layout.tsx";
import NavMenu from "../_components/nav-menu.tsx" with { island: "load" };
import { RoutesLayout } from "../_components/routes-layout.tsx";

const BlogPostPage = ({ title, description, image, date, document }: BlogArticle) => (
  <RoutesLayout nav={<NavMenu segment="blog" />}>
    <ArticleLayout
      title={title}
      description={description}
      image={image}
      date={date}
      document={document}
    />
  </RoutesLayout>
);

export default BlogPostPage;
