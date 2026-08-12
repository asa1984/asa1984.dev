import SchemaBuilder from "@pothos/core";
import SimpleObjectsPlugin from "@pothos/plugin-simple-objects";
import type { GraphQLContext } from "../types";

export const builder = new SchemaBuilder<{
  Context: GraphQLContext;
  DefaultFieldNullability: false;
}>({
  plugins: [SimpleObjectsPlugin],
  // Pothos v4 flipped the default to nullable; keep the v3 behavior the
  // schema was designed around (fields are non-nullable unless opted out).
  defaultFieldNullability: false,
});

// REQUIRED: define root types
builder.queryType({});
builder.mutationType({});
