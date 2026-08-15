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

ローカルはダミー値(`.env`)で起動し、コンテンツは空になる。
実コンテンツが必要な場合は `op run --env-file=.env.1password -- pnpm run dev` を使う。

## Content

コンテンツの正本は private リポジトリ [asa1984.dev-content](https://github.com/asa1984/asa1984.dev-content)。
サイトはランタイムに GitHub API から pull する。
push 時はリポジトリ webhook が `POST /api/revalidate` を叩いてキャッシュを破棄する(全 fetch に 1 時間の revalidate フォールバックあり)。

## Environments

| env        | URL                     | デプロイ契機                                 |
| ---------- | ----------------------- | -------------------------------------------- |
| dev        | https://dev.asa1984.dev | main への push                               |
| production | https://asa1984.dev     | release 作成(`release-YYYYMMDD-hhmmss` タグ) |

本番リリースは Actions の **Release** workflow を実行する。
dev は Cloudflare Access で保護されている。

## Secrets

実トークンは 1Password ボールト `asa1984.dev` のみで管理する(GitHub secret は `OP_SERVICE_ACCOUNT_TOKEN` だけ)。
アイテム構成は `.github/workflows/` の `op://` 参照が正。
webhook・Access などのインフラ定義は [asa1984/infrastructure](https://github.com/asa1984/infrastructure) を参照。
