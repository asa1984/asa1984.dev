# [asa1984.dev](https://asa1984.dev)

My personal website.

## Setup

```bash
gh repo clone asa1984/asa1984.dev
cd asa1984.dev
direnv allow # nix devshell + node_modules/.bin on PATH
corepack install
pnpm install
vp run dev
```

Scripts are managed by [Vite+](https://viteplus.dev/) tasks (`vite.config.ts`), not package.json scripts:

```bash
vp run dev        # codegen + next dev
vp run codegen    # panda codegen + wrangler types
vp run test       # vitest (run codegen first)
vp run typecheck  # tsc (run codegen first)
vp lint           # oxlint (config: @asa1984/configs via vite.config.ts)
vp fmt            # oxfmt
```

Without direnv, prefix commands with `pnpm exec` (e.g. `pnpm exec vp run dev`).
