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

ローカルには実トークンを置かない。デフォルト(`.env`)はダミー値 +
`ALLOW_EMPTY_CONTENT=1` でコンテンツ空のまま起動する。実コンテンツ付きで
開発する場合は 1Password CLI で dev 用 PAT を注入する:

```bash
op run --env-file=.env.1password -- pnpm run dev
```

## Content

記事の正本は private リポジトリ [asa1984.dev-content](https://github.com/asa1984/asa1984.dev-content)。
サイトはランタイムに GitHub API から pull する。コンテンツ側の push が
`POST /api/revalidate` を叩き、キャッシュが破棄されて次のリクエストで
再取得される — コンテンツ更新にデプロイは不要。

## Environments

| env        | URL                     | デプロイ契機                                 |
| ---------- | ----------------------- | -------------------------------------------- |
| dev        | https://dev.asa1984.dev | main への push                               |
| production | https://asa1984.dev     | release 作成(`release-YYYYMMDD-hhmmss` タグ) |

- dev は Cloudflare Access で保護(初回のみ `scripts/setup-dev-access.sh`)
- 本番リリースは Actions の **Release** workflow を手動実行(main からタイムスタンプ付き release を作成しそのままデプロイ)。`gh release create release-...` で手動作成しても同じデプロイが走る

## Secrets

すべての実トークンは 1Password ボールト **asa1984.dev** で管理する。
GitHub Actions のシークレットは `OP_SERVICE_ACCOUNT_TOKEN`(1Password
service account、当該ボールトの read 権限のみ)ただ 1 つ。

| item         | fields                                          |
| ------------ | ----------------------------------------------- |
| `cloudflare` | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` |
| `production` | `CONTENT_GITHUB_TOKEN`, `FRONTEND_API_TOKEN`    |
| `dev`        | `CONTENT_GITHUB_TOKEN`, `FRONTEND_API_TOKEN`    |

- `CONTENT_GITHUB_TOKEN`: fine-grained PAT、asa1984.dev-content の Contents: Read-only
- `FRONTEND_API_TOKEN`: revalidate エンドポイントの bearer トークン(env ごとに別値)
- worker secret は各デプロイの最後に `wrangler secret bulk` で 1Password の値へ同期される
