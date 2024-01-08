import { builder } from "./gql-builer";
import _SimpleObjectsPlugin from "@pothos/plugin-simple-objects";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import * as schema from "@asa1984.dev/drizzle";
import { blogs as blogsSchema } from "@asa1984.dev/drizzle";
import { ulid } from "ulidx";
import { CURRENT_TIMESTAMP } from "../utils";

const BlogType = builder.simpleObject("Blog", {
  fields: (t) => ({
    slug: t.string({ nullable: false }),
    title: t.string({ nullable: false }),
    image: t.string({ nullable: false }),
    description: t.string({ nullable: false }),
    content: t.string({ nullable: false }),
    published: t.boolean({ nullable: false }),
    updatedAt: t.string({ nullable: false }),
    createdAt: t.string({ nullable: false }),
  }),
});

builder.queryFields((t) => ({
  blog: t.field({
    type: BlogType,
    description: "Get a blog by slug",
    args: {
      slug: t.arg.string(),
    },
    nullable: true,
    resolve: async (_parent, { slug }, context) => {
      if (!slug) return null;
      const db = drizzle(context.DB, { schema });
      const result = await db.query.blogs.findFirst({
        where: (blog) => eq(blog.slug, slug),
      });
      if (!result) return null;
      return result;
    },
  }),
  blogs: t.field({
    type: [BlogType],
    description: "Get all blogs",
    resolve: async (_parent, _args, context) => {
      const db = drizzle(context.DB, { schema });
      const result = await db.query.blogs.findMany();
      return result;
    },
  }),
}));

const UpsertBlogInput = builder.inputType("UpsertBlogInput", {
  fields: (t) => ({
    slug: t.string({ required: true }),
    title: t.string({ required: true }),
    image: t.string({ required: true }),
    description: t.string({ required: true }),
    content: t.string({ required: true }),
    published: t.boolean({ required: true }),
  }),
});

builder.mutationField("upsertBlog", (t) =>
  t.field({
    type: BlogType,
    description: "Create or update a blog",
    args: {
      input: t.arg({
        type: UpsertBlogInput,
        required: true,
      }),
    },
    resolve: async (_root, { input }, context) => {
      const { slug } = input;
      const db = drizzle(context.DB, { schema });

      const oldOne = await db.query.blogs.findFirst({
        where: (blog) => eq(blog.slug, slug),
      });

      if (oldOne) {
        const result = await db
          .update(blogsSchema)
          .set({
            updatedAt: CURRENT_TIMESTAMP(),
            ...input,
          })
          .where(eq(blogsSchema.slug, slug))
          .returning();

        return result[0]!;
      }
      const id = ulid();
      const result = await db
        .insert(blogsSchema)
        .values({
          id,
          ...input,
        })
        .returning();
      return result[0]!;
    },
  }),
);
