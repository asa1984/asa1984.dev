import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

import * as schema from "@asa1984.dev/drizzle";
import { blogs, insertBlogSchema } from "@asa1984.dev/drizzle";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { ulid } from "ulidx";

import type { Bindings } from "../types";
import { CURRENT_TIMESTAMP } from "../utils";

export const postBlogSchema = insertBlogSchema.omit({
  slug: true,
  id: true,
});

const route = new Hono<{ Bindings: Bindings }>();

export const blogRoute = route
  .get("/blogs", async (c) => {
    const db = drizzle(c.env.DB, { schema });
    const result = await db.query.blogs.findMany();

    return c.json(result);
  })
  .get("/blogs/:slug", async (c) => {
    const slug = c.req.param("slug");

    const db = drizzle(c.env.DB, { schema });
    const result = await db.query.blogs.findFirst({
      where: (blog) => eq(blog.slug, slug),
    });

    return c.json(result);
  })
  .post("/blogs/:slug", zValidator("json", postBlogSchema), async (c) => {
    const slug = c.req.param("slug");

    const db = drizzle(c.env.DB, { schema });
    const post = c.req.valid("json");

    const oldOne = await db.query.blogs.findFirst({
      where: (blog) => eq(blog.slug, slug),
    });

    if (oldOne) {
      const result = await db
        .update(blogs)
        .set({
          updatedAt: CURRENT_TIMESTAMP(),
          ...post,
        })
        .where(eq(blogs.slug, slug))
        .returning();
      return c.json(result[0]);
    }

    const id = ulid();
    const result = await db
      .insert(blogs)
      .values({
        id,
        slug,
        ...post,
      })
      .returning();
    return c.json(result[0]);
  })
  .delete("/blogs/:slug", async (c) => {
    const slug = c.req.param("slug");

    const db = drizzle(c.env.DB);
    const result = await db.delete(blogs).where(eq(blogs.slug, slug));
    return result.success
      ? c.text(`${slug} was deleted`)
      : c.json(
          {
            message: `Could not delete ${slug}`,
            error: result.error,
          },
          500,
        );
  });
