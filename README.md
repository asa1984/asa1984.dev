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

## Content

記事の正本は private リポジトリ [asa1984.dev-content](https://github.com/asa1984/asa1984.dev-content)。
サイトはランタイムに GitHub API から pull する。コンテンツ側の push が
`POST /api/revalidate` を叩き、キャッシュが破棄されて次のリクエストで
再取得される — コンテンツ更新にデプロイは不要。

## Deployment

```bash
DOTENV_PRIVATE_KEY_PRODUCTION=<secret-key> pnpm run deploy:frontend
```
