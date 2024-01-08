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

export const get_posts = async (): Promise<Post[]> => {
  const result = await client.query(GetBlogs, {});
  const blogs = result.data?.blogs!;

  return Promise.all(
    blogs.map(async (blog) => {
      const image_key = await sha256(`blog/${blog.slug}/${blog.image}`);
      const image_url = `${env.API_URL}/image/delivery/${image_key}`;
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

export const get_post = async (slug: string): Promise<Post> => {
  const result = await client.query(GetBlogBySlug, { slug });
  const blog = result.data?.blog;
  if (!blog) throw new Error("Not found");

  const image_key = await sha256(`blog/${blog.slug}/${blog.image}`);
  const image_url = `${env.API_URL}/image/delivery/${image_key}`;
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
