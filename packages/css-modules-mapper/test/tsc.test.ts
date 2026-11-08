import { spawnSync } from "node:child_process";
import { mkdir, rm, symlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { beforeAll, describe, expect, test } from "vite-plus/test";

const FIXTURES = ["basic", "broken"];

/** Type checks a fixture project with the real compiler, which spawns this package's mapper. */
const tsc = (fixture: string) => {
  const project = fileURLToPath(new URL(`fixtures/${fixture}`, import.meta.url));
  const compiler = fileURLToPath(new URL("../node_modules/typescript/bin/tsc", import.meta.url));
  const { stdout } = spawnSync(
    compiler,
    ["-p", project, "--runExternalCode", "--pretty", "false"],
    {
      encoding: "utf8",
    },
  );
  return stdout.trim().split("\n").filter(Boolean);
};

/** Links the package into a fixture's node_modules, where the compiler resolves it by name. */
const linkPackage = async (fixture: string) => {
  const scope = fileURLToPath(
    new URL(`fixtures/${fixture}/node_modules/@asa1984.dev`, import.meta.url),
  );
  await mkdir(scope, { recursive: true });
  await rm(`${scope}/css-modules-mapper`, { force: true });
  await symlink("../../../../..", `${scope}/css-modules-mapper`);
};

describe("tsc with the content mapper", () => {
  beforeAll(async () => {
    await Promise.all(FIXTURES.map((fixture) => linkPackage(fixture)));
  });

  test("types class names and reports the ones a stylesheet does not define", () => {
    expect(tsc("basic")).toStrictEqual([
      expect.stringMatching(/usage\.ts\(4,\d+\): error TS2339: Property 'ghost' does not exist/u),
      expect.stringMatching(
        /usage\.ts\(5,\d+\): error TS2322: Type 'string' is not assignable to type 'number'/u,
      ),
    ]);
  }, 30_000);

  test("reports a stylesheet's parse error at its line and column", () => {
    expect(tsc("broken")).toStrictEqual([
      expect.stringMatching(
        /broken\.module\.css\(2,4\): error css-modules1001: Invalid dangling combinator/u,
      ),
    ]);
  }, 30_000);
});
