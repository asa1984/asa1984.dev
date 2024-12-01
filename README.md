# [asa1984.dev](https://asa1984.dev)

My personal website.

## Setup

```bash
gh repo clone asa1984/asa1984.dev
cd asa1984.dev
nix develop # or `direnv allow`
corepack install
pnpm install
pnpm run dev
```

## Build

```bash
pnpm run build
```

## Migration

```bash
DOTENV_PRIVATE_KEY_PRODUCTION=<secret-key> pnpm run migrate:prod
```

## Deployment

```bash
DOTENV_PRIVATE_KEY_PRODUCTION=<secret-key> pnpm run deploy
```
