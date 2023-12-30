import SchemaBuilder from "@pothos/core";
import SimpleObjectsPlugin from "@pothos/plugin-simple-objects";

export const builder = new SchemaBuilder<{
  Context: {
    DB: D1Database;
  };
}>({
  plugins: [SimpleObjectsPlugin],
});

builder.queryType({});
builder.mutationType({});
// builder.subscriptionType({});
