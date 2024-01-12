import { builder } from "./gql-builer";
import _SimpleObjectsPlugin from "@pothos/plugin-simple-objects";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import * as schema from "@asa1984.dev/drizzle";
import { contexts as contextsSchema } from "@asa1984.dev/drizzle";
import { ulid } from "ulidx";
import { CURRENT_TIMESTAMP } from "../utils";
import { Revalidater } from "../api";

const ContextType = builder.simpleObject("Context", {
  fields: (t) => ({
    slug: t.string({ nullable: false }),
    title: t.string({ nullable: false }),
    emoji: t.string({ nullable: false }),
    content: t.string({ nullable: false }),
    published: t.boolean({ nullable: false }),
    updatedAt: t.string({ nullable: false }),
    createdAt: t.string({ nullable: false }),
  }),
});

builder.queryFields((t) => ({
  context: t.field({
    type: ContextType,
    description: "Get a context by slug",
    args: {
      slug: t.arg.string(),
    },
    nullable: true,
    resolve: async (_parent, { slug }, context) => {
      if (!slug) return null;
      const db = drizzle(context.DB, { schema });
      const result = await db.query.contexts.findFirst({
        where: (context) => eq(context.slug, slug),
      });
      if (!result) return null;
      return result;
    },
  }),
  contexts: t.field({
    type: [ContextType],
    description: "Get all contexts",
    resolve: async (_parent, _args, context) => {
      const db = drizzle(context.DB, { schema });
      const result = await db.query.contexts.findMany();
      return result;
    },
  }),
}));

const UpsertContextInput = builder.inputType("UpsertContextInput", {
  fields: (t) => ({
    slug: t.string({ required: true }),
    title: t.string({ required: true }),
    emoji: t.string({ required: true }),
    content: t.string({ required: true }),
    published: t.boolean({ required: true }),
  }),
});

builder.mutationField("upsertContext", (t) =>
  t.field({
    type: ContextType,
    description: "Upsert a context",
    args: {
      input: t.arg({
        type: UpsertContextInput,
        required: true,
      }),
    },
    resolve: async (_parent, { input }, context) => {
      const { slug } = input;
      const db = drizzle(context.DB, { schema });

      const revalidater = new Revalidater(context.FRONTEND_URL, context.FRONTEND_API_TOKEN);

      const oldOne = await db.query.contexts.findFirst({
        where: (context) => eq(context.slug, slug),
      });

      if (oldOne) {
        const result = await db
          .update(contextsSchema)
          .set({
            updatedAt: CURRENT_TIMESTAMP(),
            ...input,
          })
          .where(eq(contextsSchema.slug, slug))
          .returning();

        // Revalidate frontend cache
        revalidater.revalidateContext(slug);

        return result[0]!;
      }
      const id = ulid();
      const result = await db
        .insert(contextsSchema)
        .values({
          id,
          ...input,
        })
        .returning();

      // Revalidate frontend cache
      revalidater.revalidateAllContext();

      return result[0]!;
    },
  }),
);
