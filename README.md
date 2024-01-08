# [asa1984.dev](https://asa1984.dev)

My personal website.

## Structure

## Setup

```bash
gh repo clone asa1984/asa1984.dev
cd asa1984.dev
nix develop # or `direnv allow`
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
```

## Deploy

### Requirements

- `.env` file
- Loged in wrangler

### Command

```bash
pnpm deploy
```
