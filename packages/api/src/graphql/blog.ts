import { builder } from "./gql-builer";
import _SimpleObjectsPlugin from "@pothos/plugin-simple-objects";
import _ValidationPlugin from "@pothos/plugin-validation";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import * as schema from "@asa1984.dev/drizzle";
import { blogs } from "@asa1984.dev/drizzle";
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

builder.mutationField("postBlog", (t) =>
  t.field({
    type: BlogType,
    description: "Create or update a blog",
    nullable: true,
    args: {
      slug: t.arg.string({ required: true }),
      title: t.arg.string({ required: true }),
      image: t.arg.string({ required: true }),
      description: t.arg.string({ required: true }),
      content: t.arg.string({ required: true }),
      published: t.arg.boolean({ required: true }),
    },
    resolve: async (_root, args, context) => {
      const db = drizzle(context.DB, { schema });
      const oldOne = await db.query.blogs.findFirst({
        where: (blog) => eq(blog.slug, args.slug),
      });
      if (oldOne) {
        const blog = await db
          .update(blogs)
          .set({
            updatedAt: CURRENT_TIMESTAMP(),
            ...args,
          })
          .where(eq(blogs.slug, args.slug))
          .returning();
        const updated = blog[0];
        if (!updated) return null;
        return updated;
      } else {
        const id = ulid();
        const result = await db
          .insert(blogs)
          .values({
            id,
            ...args,
          })
          .returning();
        const inserted = result[0];
        if (!inserted) return null;
        return inserted;
      }
    },
  })
);
