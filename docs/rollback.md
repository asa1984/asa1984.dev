# デプロイのロールバック手順

本番で問題が起きたときに、何をどこまで戻すかを判断するための手順書。
各節は「状況」「判断」「コマンド」の順で書いてある。

## 前提

### パイプライン

`main` への push で `.github/workflows/deploy.yaml` が単一のパイプラインとして走る。

1. `lint` / `typecheck` / `build` / `test`（並列）
2. `migrate`（`pnpm run migrate:prod`、D1 マイグレーションの適用）
3. `deploy`（backend → frontend の順）

`concurrency: deploy` に `cancel-in-progress: false` が付いているので、パイプラインは打ち切られずにキューされる。
マイグレーションが別コミットのデプロイと競合することはない。

### 二つの Worker

| 対象     | Worker 名     | 実行ディレクトリ    | デプロイ方式                    |
| -------- | ------------- | ------------------- | ------------------------------- |
| backend  | `asa1984-api` | `packages/backend`  | `wrangler deploy`               |
| frontend | `asa1984-web` | `packages/frontend` | `opennextjs-cloudflare deploy`  |

`opennextjs-cloudflare deploy` は、KV (`NEXT_INC_CACHE_KV`) への ISR キャッシュ投入（`populateCache remote`）を済ませてから `wrangler deploy` を呼ぶ。
どちらも最終的には Workers のバージョン機構に乗るので、`wrangler rollback` と `wrangler versions deploy` がそのまま使える。

### コンテンツの正本

ブログ記事と画像の正本は private リポジトリ [asa1984.dev-content](https://github.com/asa1984/asa1984.dev-content) にある。
D1 と R2 は sync CLI で再構築できる派生物であって、正本ではない（#27）。
コンテンツ起因の問題は、コンテンツリポジトリの `git revert` だけで直る。

### 認証

`wrangler` を本番に向けて手で叩くには、`.env.production`（dotenvx で暗号化済み）に入っている `CLOUDFLARE_API_TOKEN` と `CLOUDFLARE_ACCOUNT_ID` が要る。
`DOTENV_PRIVATE_KEY_PRODUCTION` が設定されていると、`dotenvx run` は `.env.production` を自動で選ぶ。

```bash
export DOTENV_PRIVATE_KEY_PRODUCTION=<secret-key>
```

以降の `wrangler` コマンドは、この変数が設定済みのシェルで、リポジトリルートから実行する。
長いので、次の関数を定義しておくと読み替えやすい。

```bash
wr-api() { pnpm exec dotenvx run -- pnpm --filter @asa1984.dev/backend exec wrangler "$@"; }
wr-web() { pnpm exec dotenvx run -- pnpm --filter @asa1984.dev/frontend exec wrangler "$@"; }
```

## どの手順を選ぶか

- 記事の本文や画像がおかしい: [コンテンツを戻す](#コンテンツを戻す)
- コードが原因で、パイプラインの 10 分が待てる: [git revert で戻す](#git-revert-で戻す)
- コードが原因で、いますぐ止めたい: [wrangler でバージョンを戻す](#wrangler-でバージョンを戻す)
- デプロイが途中で失敗した: [片側だけデプロイされた状態](#片側だけデプロイされた状態)
- 直前のリリースが D1 マイグレーションを含む: 先に [D1 マイグレーションを伴うリリース](#d1-マイグレーションを伴うリリース) を読む

## コンテンツを戻す

**状況**: 記事の本文、frontmatter、画像に問題がある。
コードは正しい。

**判断**: コンテンツリポジトリで revert する。
本体リポジトリは触らない。

**コマンド**:

```bash
# asa1984.dev-content の作業コピーで
git revert <commit>
git push origin main
```

push で Sync ワークフローが走り、sync CLI が D1 と R2 を revert 後の状態に reconcile する。
upsert だけでなく削除も行うので、追加した記事を revert すれば D1 からも消える。
sync が書き込むと backend の `FrontendRevalidater` が frontend の `/api/revalidate/*` を叩くため、ISR キャッシュも追随する。

ワークフローが失敗したときは、内容を変えずに再実行できる。

```bash
gh workflow run sync.yaml --repo asa1984/asa1984.dev-content
```

適用前に差分を見たいときは、本体リポジトリから dry-run する。

```bash
BACKEND_API_TOKEN=<token> pnpm --filter @asa1984.dev/cli run sync -- --dir <content-dir> --dry-run
```

## git revert で戻す

**状況**: コードの不具合。
サイトは動いており、パイプライン一周（10 分程度）を待てる。

**判断**: これを基本手段とする。
`git revert` で正方向に戻せば、lint / typecheck / build / test を通した上でデプロイされるので、ロールバック自体が新たな障害になりにくい。

**コマンド**:

```bash
git switch -c revert-<topic> origin/main
git revert <commit>
git push -u origin HEAD
gh pr create --fill
```

merge すると `deploy.yaml` が走り、`migrate` を経て backend、frontend の順に revert 後のコードが出る。
revert でマイグレーションファイルが消えても `migrate` は何もしない。
適用済みのスキーマはそのまま残る（[D1 マイグレーションを伴うリリース](#d1-マイグレーションを伴うリリース) を参照）。

パイプラインが一時的なエラーで落ちただけなら、再実行で済む。

```bash
gh run list --workflow=deploy.yaml --limit 5
gh run rerun <run-id>
```

## wrangler でバージョンを戻す

**状況**: サイトが落ちている、または明確に壊れている。
パイプラインを待てない。

**判断**: Workers のバージョンを直接切り替える。
両方を戻すときは、デプロイ順の逆、つまり frontend → backend の順にする。

通常のデプロイでは backend を先に出すので、「新しい backend と古い frontend」という組み合わせは毎回発生している。
逆の「古い backend と新しい frontend」は一度も通っていないため、切り替えの途中でその状態に入らないようにする。

**コマンド**:

まず現在の状態と戻し先を確認する。

```bash
wr-web deployments status
wr-web versions list
```

`versions list` の出力から戻し先のバージョン ID を選び、明示して渡す。
`--message` を付けると対話プロンプトを飛ばせる。

```bash
wr-web rollback <version-id> --message "revert <理由>"
wr-api rollback <version-id> --message "revert <理由>"
```

バージョン ID を省略すると「最新の一つ前にアップロードされたバージョン」が選ばれる。
ただし `pnpm run staging`（`wrangler versions upload`）はデプロイせずにバージョンだけを作るので、一つ前のバージョンが一つ前の本番とは限らない。
ID を明示するほうが安全である。

段階的に戻したい、または戻したバージョンをそのまま固定したい場合は `versions deploy` を使う。
トラフィック比率を指定できる。

```bash
wr-web versions deploy <version-id>@100 --yes --message "revert <理由>"
```

frontend の Worker バージョンには `.open-next/assets` も含まれるので、静的アセットも一緒に戻る。
ISR キャッシュは KV のキーが Next.js の build ID で分かれており、戻したバージョンは自分の build ID のキャッシュを読む。
ロールバック後にコンテンツを最新にしたいときは、コンテンツリポジトリの Sync を手動実行して revalidate を走らせる。

### 制約

- 戻せるのは直近 100 バージョンまで。`versions list` が表示するのは直近 10 件なので、それより古いバージョンを探すときは Cloudflare ダッシュボードの Deployments を見る。
- 戻し先のバージョンが参照している R2 バケットや KV 名前空間が現在存在しない場合、ロールバックは拒否される。
- D1、R2、KV の中身はロールバックされない。Worker のバージョンを戻しても、スキーマとデータは現在のままである。

### ロールバック後に必ずやること

`wrangler rollback` は `main` の内容を変えないので、この時点で本番と `main` HEAD が乖離している。
次に誰かが `main` に merge すると、壊れたコードが再びデプロイされる。
応急処置が済んだら、[git revert で戻す](#git-revert-で戻す) の手順で `main` を本番と一致させる。

## 片側だけデプロイされた状態

`deploy` ジョブは backend と frontend を別ステップで順に出すため、途中で失敗すると片側だけ新しい状態になる。
どこで落ちたかで対処が変わる。

### migrate で失敗した

**状況**: コードは両方とも旧バージョンのまま。
D1 には、失敗したファイルより前のマイグレーションだけが適用されている。

**判断**: コードは動いているので急がない。
[D1 マイグレーションを伴うリリース](#d1-マイグレーションを伴うリリース) に従って、前進マイグレーションで整合を取る。

### backend のデプロイで失敗した

**状況**: マイグレーションは適用済み、backend と frontend は旧バージョン。

**判断**: 旧コードが新スキーマの上で動く（expand-contract を守っていれば動く）なら、サイトは正常である。
落ちた原因を直して再デプロイするか、`git revert` する。

### frontend のデプロイで失敗した

**状況**: backend だけ新しい。
frontend は旧バージョンのまま backend の GraphQL を叩いている。

**判断**: 新 backend が旧 frontend に対して後方互換なら、そのまま放置してよい。
互換でない変更を入れてしまった場合は backend を戻す。

```bash
wr-api versions list
wr-api rollback <version-id> --message "frontend deploy failed"
```

### 両方デプロイされたが壊れている

[wrangler でバージョンを戻す](#wrangler-でバージョンを戻す) に従い、frontend → backend の順に戻す。

## D1 マイグレーションを伴うリリース

### 方針: expand-contract

`wrangler d1 migrations apply` は前進のみで、down マイグレーションは存在しない。
コードのバージョンは戻せてもスキーマは戻らないので、**スキーマ変更は expand-contract の二段階に分ける**。

1. **expand**: 後方互換な変更だけを入れる。列の追加は nullable かデフォルト値付き、テーブルは追加のみ。旧コードがそのまま動く状態を保つ。
2. 新しい列を使うコードをデプロイし、しばらく本番で様子を見る。
3. **contract**: 旧コードがもう動いていないことを確認してから、別のリリースで旧列を削除する。

一つのリリースの中で「列を追加して旧列を削除する」のように非互換な変更をまとめると、そのリリースはロールバック不能になる。
名前の変更は、追加、二重書き込み、削除の三段階に分解する。

この方針を守っていれば、リリースに問題があってもコードを戻すだけで済む。
残ったスキーマは旧コードから見えないだけで、害はない。

### バックアップ

削除を含むマイグレーションを出す前と、スキーマ不整合の復旧に着手する前には、D1 の中身を吐き出しておく。

```bash
wr-api d1 export asa1984-blog --remote --output ~/d1-backup.sql
```

スキーマだけ、あるいはデータだけを取ることもできる。

```bash
wr-api d1 export asa1984-blog --remote --no-data --output ~/d1-schema.sql
```

### 非互換な変更を適用してしまった場合

**状況**: 列やテーブルを削除するマイグレーションが本番に当たり、コードを戻しても動かない。

**判断**: down はないので、前進マイグレーションで元の形に戻す。
失われたデータは、コンテンツリポジトリからの re-sync で埋める。

**コマンド**:

まず [バックアップ](#バックアップ) を取る。
そのうえで `packages/drizzle/src/schema.ts` を戻したい形に編集し、新しいマイグレーションを生成する。

```bash
pnpm --filter @asa1984.dev/drizzle run gen
```

生成された SQL を読み、意図した内容であることを確認してからコミットし、PR 経由で merge する。
merge 後の `deploy.yaml` の `migrate` ジョブが適用する。

削除された列のデータが必要なら、スキーマを戻したあとにコンテンツリポジトリの Sync を手動実行する。

```bash
gh workflow run sync.yaml --repo asa1984/asa1984.dev-content
```

sync は git の内容で D1 と R2 を reconcile するので、記事本文、メタデータ、画像はこれで復旧する。
ただし `created_at` は frontmatter に持たせておらず、行を作り直すと挿入時刻で埋まる（#27）。
記事の行ごと消えうる操作の前に、バックアップを取る理由がここにある。
