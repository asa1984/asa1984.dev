import { boolean, date, object, string, type Output } from "valibot";
import { client } from "@/libs/api";

export const frontmatter_schema = object({
  title: string(),
  description: string(),
  image: string(),
  date: date(),
  published: boolean(),
});

export type Frontmatter = Output<typeof frontmatter_schema>;

// export function parse_frontmatter(source: string): Result<
//   {
//     frontmatter: Frontmatter;
//     content: string;
//   },
//   Issues
// > {
//   const { data, content } = matter(source);
//   const parsed = safeParse(frontmatter_schema, data);
//
//   return parsed.success
//     ? Ok({
//         frontmatter: parsed.output,
//         content,
//       })
//     : Err(parsed.issues);
// }

export type Post = {
  slug: string;
  meta: Frontmatter;
  content: string;
};

export async function get_post(slug: string): Promise<Post> {
  const $get = client.api.blogs[":slug"].$get;
  const resp = await $get({ param: { slug } });
  if (!resp) throw new Error("Not found");
  const blog = await resp.json();
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
}

export async function get_posts(): Promise<Post[]> {
  const resp = await client.api.blogs.$get();
  const blogs = await resp.json();
  const posts = blogs
    .map((blog) => {
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
    })
    .filter((p) => p.meta.published);
  return posts;
}
