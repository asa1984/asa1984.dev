## 環境

- Nix (flake) + direnv
- Node.js (v26)
- pnpm
- Vite+
- Next.js (App Router) + OpenNext、Cloudflare Workers にデプロイする
- Panda CSS

## コマンド

開発環境は `flake.nix` と direnv でセットアップする。コマンドは package.json の `scripts` ではなく、各パッケージの `vite.config.ts` に Vite Task のタスクとして定義している。

```sh
vp run codegen        # Panda CSS と型の生成物を作る（ほかの検査の前に実行する）
vp lint               # lint
vp fmt --check        # フォーマットの検査
vp run typecheck      # 型検査
vp run test           # テスト
vp run check:actions  # GitHub Actions のワークフローの検査
vp run dev            # 開発サーバー
```

## コメントの書き方

コード内のコメントは英語で書く。

1. 型、プロパティ、関数などの宣言へのコメントは doc comment（TypeScript の `/** ... */`）で書く。
2. Issue や Pull Request の番号を書かない。
3. コードがしていることを同じ抽象度で言い直すだけのコメントを書かない。
4. 同じ説明を複数の場所に書かない。
5. そのモジュールが知る必要のない知識を書かない。
