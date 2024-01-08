import SchemaBuilder from "@pothos/core";
import SimpleObjectsPlugin from "@pothos/plugin-simple-objects";

export const builder = new SchemaBuilder<{
  Context: {
    DB: D1Database;
  };
}>({
  plugins: [SimpleObjectsPlugin],
});

// REQUIRED: define root types
builder.queryType({});
builder.mutationType({});
