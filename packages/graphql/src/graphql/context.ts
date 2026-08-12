import * as schema from "@asa1984.dev/drizzle";
import {
  contexts as contextsSchema,
  CURRENT_TIMESTAMP,
} from "@asa1984.dev/drizzle";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { ulid } from "ulidx";
import { builder } from "./gql-builder";

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
    // The content repository is the source of truth for the creation date, so
    // when it is given it wins over whatever the database holds.
    createdAt: t.string({ required: false }),
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
      const { slug, createdAt, ...fields } = input;
      // Spreading an absent createdAt would overwrite the column with NULL.
      const createdAtField = createdAt == null ? {} : { createdAt };
      const db = drizzle(context.DB, { schema });

      const { revalidater } = context;

      const oldOne = await db.query.contexts.findFirst({
        where: (context) => eq(context.slug, slug),
      });

      if (oldOne) {
        const result = await db
          .update(contextsSchema)
          .set({
            updatedAt: CURRENT_TIMESTAMP(),
            slug,
            ...fields,
            ...createdAtField,
          })
          .where(eq(contextsSchema.slug, slug))
          .returning();

        // Revalidate frontend cache
        await revalidater.revalidateContext(slug);
        await revalidater.revalidateAllContext();

        return result[0]!;
      }
      const id = ulid();
      const result = await db
        .insert(contextsSchema)
        .values({
          id,
          slug,
          ...fields,
          ...createdAtField,
        })
        .returning();

      // Revalidate frontend cache
      await revalidater.revalidateAllContext();

      return result[0]!;
    },
  }),
);

builder.mutationField("deleteContext", (t) =>
  t.boolean({
    nullable: false,
    description:
      "Delete a context by slug. Returns false if it does not exist.",
    args: {
      slug: t.arg.string({ required: true }),
    },
    resolve: async (_parent, { slug }, context) => {
      const db = drizzle(context.DB, { schema });
      const result = await db
        .delete(contextsSchema)
        .where(eq(contextsSchema.slug, slug))
        .returning();
      if (result.length === 0) return false;

      // Revalidate frontend cache
      const { revalidater } = context;
      await revalidater.revalidateContext(slug);
      await revalidater.revalidateAllContext();

      return true;
    },
  }),
);
