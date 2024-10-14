import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { builder } from "@asa1984.dev/graphql";
import { printSchema } from "graphql";

const SCHEMA_OUTPUT_PATH = "schema";
const SCHEMA_FILE_NAME = "schema.graphql";

function main() {
  if (!existsSync(SCHEMA_OUTPUT_PATH)) {
    mkdirSync(SCHEMA_OUTPUT_PATH);
  }

  const schema = builder.toSchema();
  const schemaText = printSchema(schema);
  writeFileSync(join(SCHEMA_OUTPUT_PATH, SCHEMA_FILE_NAME), schemaText);
}

try {
  main();
  console.log(`Schema generated at ${SCHEMA_OUTPUT_PATH}/${SCHEMA_FILE_NAME}`);
  process.exit(0);
} catch (err) {
  console.error(err);
  process.exit(1);
}
