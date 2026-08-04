import SchemaBuilder from "@pothos/core";
import SimpleObjectsPlugin from "@pothos/plugin-simple-objects";
import type { GraphQLContext } from "../types";

export const builder = new SchemaBuilder<{
  Context: GraphQLContext;
}>({
  plugins: [SimpleObjectsPlugin],
});

// REQUIRED: define root types
builder.queryType({});
builder.mutationType({});
