import { defineConfig } from "vite-plus";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    isolate: false,
    restoreMocks: true,
    unstubGlobals: true,
    unstubEnvs: true,
  },
  run: {
    tasks: {
      typecheck: {
        command: "tsc",
        cache: {
          output: [{ auto: true }, "!**/*.tsbuildinfo"],
        },
      },
      // The tsc tests spawn the compiler, which spawns the mapper from src/.
      test: { command: "vp test run" },
    },
  },
});
