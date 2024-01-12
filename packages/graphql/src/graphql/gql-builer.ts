import SchemaBuilder from "@pothos/core";
import SimpleObjectsPlugin from "@pothos/plugin-simple-objects";
import type { Bindings } from "../types";

export const builder = new SchemaBuilder<{
  Context: Bindings;
}>({
  plugins: [SimpleObjectsPlugin],
});

// REQUIRED: define root types
builder.queryType({});
builder.mutationType({});
