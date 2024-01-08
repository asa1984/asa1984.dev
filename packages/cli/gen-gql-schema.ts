import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";

import { builder } from "@asa1984.dev/graphql";
import { printSchema } from "graphql";

const schema = builder.toSchema();

const SCHEMA_OUTPUT_PATH = "schema";
const SCHEMA_FILE_NAME = "schema.graphql";

function main() {
  if (!existsSync(SCHEMA_OUTPUT_PATH)) {
    mkdirSync(SCHEMA_OUTPUT_PATH);
  }

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
