import { Hono } from "hono";
import { Bindings } from "../types";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@asa1984.dev/drizzle";
import { eq } from "drizzle-orm";

const route = new Hono<{ Bindings: Bindings }>();

export const taskRoute = route
  .get("/tasks", async (c) => {
    const db = drizzle(c.env.DB, {
      schema: schema,
    });
    const result = await db.query.tasks.findMany();
    return c.json(result);
  })
  .get("/tasks/:slug", async (c) => {
    const slug = c.req.param("slug");

    const db = drizzle(c.env.DB, {
      schema: schema,
    });
    const result = await db.query.tasks.findFirst({
      where: (task) => eq(task.slug, slug),
      with: {
        items: true,
      },
    });

    return c.json(result);
  });
