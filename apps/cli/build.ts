import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["src/main.ts"],
  bundle: true,
  minify: true,
  outfile: "dist/main.js",
  external: ["fs", "crypto"],
  format: "esm",
  sourcemap: true,
});
