import { client } from "@/libs/graphql";
import GetBlogs from "./getBlogs.graphql";
import GetBlogBySlug from "./getBlogBySlug.graphql";

export type Frontmatter = {
  title: string;
  description: string;
  image: string;
  date: Date;
  published: boolean;
};

export type Post = {
  slug: string;
  meta: Frontmatter;
  content: string;
};

export const get_posts = async (): Promise<Post[]> => {
  const result = await client.query(GetBlogs, {});
  const blogs = result.data?.blogs!;
  return blogs.map((blog) => {
    const frontmatter: Frontmatter = {
      title: blog.title,
      description: blog.description,
      image: blog.image,
      date: new Date(blog.createdAt),
      published: blog.published,
    };
    return {
      slug: blog.slug,
      meta: frontmatter,
      content: blog.content,
    };
  });
};

export const get_post = async (slug: string): Promise<Post> => {
  const result = await client.query(GetBlogBySlug, { slug });
  const blog = result.data?.blog;
  if (!blog) throw new Error("Not found");
  const frontmatter: Frontmatter = {
    title: blog.title,
    description: blog.description,
    image: blog.image,
    date: new Date(blog.createdAt),
    published: blog.published,
  };
  return {
    slug,
    meta: frontmatter,
    content: blog.content,
  };
};
