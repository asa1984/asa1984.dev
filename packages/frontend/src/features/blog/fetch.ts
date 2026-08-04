import { imageKey } from "@asa1984.dev/backend/image-key";
import { env } from "@/libs/env";
import { client } from "@/libs/graphql";
import GetBlogBySlug from "./getBlogBySlug.graphql";
import GetBlogs from "./getBlogs.graphql";

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
  // Fail the build instead of silently prerendering a site without posts.
  // ALLOW_EMPTY_CONTENT opts out for builds without a backend (CI smoke build).
  if (!blogs) {
    if (process.env.ALLOW_EMPTY_CONTENT === "1") return [];
    throw new Error(`Failed to fetch blogs: ${result.error?.message}`);
  }
  const published_blogs = blogs.filter((blog) => blog.published);

  return Promise.all(
    published_blogs.map(async (blog) => {
      const image_key = await imageKey("blog", blog.slug, blog.image);
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

  const image_key = await imageKey("blog", blog.slug, blog.image);
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
