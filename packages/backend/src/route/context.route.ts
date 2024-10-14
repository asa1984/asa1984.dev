import * as schema from "@asa1984.dev/drizzle";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { ulid } from "ulidx";
import type { Bindings } from "../types";

export const postContextSchema = schema.insertContextSchema.omit({
  id: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
});

const route = new Hono<{ Bindings: Bindings }>();

export const contextRoute = route
  .get("/contexts", async (c) => {
    const db = drizzle(c.env.DB, {
      schema: schema,
    });
    const result = await db.query.contexts.findMany();
    return c.json(result);
  })
  .get("/contexts/:slug", async (c) => {
    const slug = c.req.param("slug");

    const db = drizzle(c.env.DB, {
      schema: schema,
    });
    const result = await db.query.contexts.findFirst({
      where: (context) => eq(context.slug, slug),
    });
    return c.json(result);
  })
  .post("/contexts/:slug", zValidator("json", postContextSchema), async (c) => {
    const slug = c.req.param("slug");
    const post = c.req.valid("json");

    const db = drizzle(c.env.DB, {
      schema: schema,
    });
    const oldOne = await db.query.contexts.findFirst({
      where: (context) => eq(context.slug, slug),
    });

    if (oldOne) {
      const result = await db
        .update(schema.contexts)
        .set({
          slug,
          ...post,
        })
        .where(eq(schema.contexts.slug, slug))
        .returning();
      return c.json(result[0]);
    }

    const id = ulid();
    const result = await db
      .insert(schema.contexts)
      .values({
        id,
        slug,
        ...post,
      })
      .returning();
    return c.json(result[0]);
  });
