import { client } from "@/libs/graphql";
import GetBlogs from "./getBlogs.graphql";
import GetBlogBySlug from "./getBlogBySlug.graphql";
import { sha256 } from "hono/utils/crypto";
import { env } from "@/libs/env";

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

export const get_published_posts = async (): Promise<Post[]> => {
  const result = await client.query(GetBlogs, {});
  const blogs = result.data?.blogs;
  if (!blogs) return [];
  const published_blogs = blogs.filter((blog) => blog.published);

  return Promise.all(
    published_blogs.map(async (blog) => {
      const image_key = await sha256(`blog/${blog.slug}/${blog.image}`);
      const image_url = `${env.BACKEND_URL}/image/delivery/${image_key}`;
      const frontmatter: Frontmatter = {
        title: blog.title,
        description: blog.description,
        image: image_url,
        date: new Date(blog.createdAt),
        published: blog.published,
      };
      return {
        slug: blog.slug,
        meta: frontmatter,
        content: blog.content,
      };
    }),
  );
};

// Newer posts first
export const get_posts_date_sorted = async (): Promise<Post[]> => {
  const posts = await get_published_posts();
  return posts.sort((prev, next) => {
    return next.meta.date.getTime() - prev.meta.date.getTime();
  });
};

export const get_post = async (slug: string): Promise<Post | null> => {
  const result = await client.query(GetBlogBySlug, { slug });
  const blog = result.data?.blog;
  if (!blog) return null;

  const image_key = await sha256(`blog/${blog.slug}/${blog.image}`);
  const image_url = `${env.BACKEND_URL}/image/delivery/${image_key}`;
  const frontmatter: Frontmatter = {
    title: blog.title,
    description: blog.description,
    image: image_url,
    date: new Date(blog.createdAt),
    published: blog.published,
  };
  return {
    slug,
    meta: frontmatter,
    content: blog.content,
  };
};
