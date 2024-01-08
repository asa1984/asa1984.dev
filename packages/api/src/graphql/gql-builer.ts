import SchemaBuilder from "@pothos/core";
import SimpleObjectsPlugin from "@pothos/plugin-simple-objects";
// import ErrorsPlugin from "@pothos/plugin-errors";

export const builder = new SchemaBuilder<{
  Context: {
    DB: D1Database;
  };
}>({
  plugins: [SimpleObjectsPlugin],
  // errorOptions: {
  //   defaultTypes: [Error],
  // },
});

// const ErrorInterface = builder.interfaceRef<Error>("Error").implement({
//   fields: (t) => ({
//     message: t.exposeString("message"),
//   }),
// });
//
// builder.objectType(Error, {
//   name: "BaseError",
//   interfaces: [ErrorInterface],
// });

// REQUIRED: define root types
builder.queryType({});
builder.mutationType({});
