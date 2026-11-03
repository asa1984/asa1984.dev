import { ArticleLayout } from "../_components/article-layout.tsx";
import NavMenu from "../_components/nav-menu.tsx" with { island: "load" };
import { RoutesLayout } from "../_components/routes-layout.tsx";
import type { Props } from "./[slug].server.ts";

const BlogPostPage = ({ title, description, image, date, document }: Props) => (
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
