---
title: Next.js 13でブログを作った
description: Markdown絶許
image: first.webp
published: true
---

技術者を自称するインターネット人格にとって個人ブログはマストである。ネットが社会化された現代、個人ブログは唯一の安息の地なのだ。
しかし、そうして過去に作った[旧ブログ](https://trashbox-asa.deno.dev)は記事を 1 本投稿したきり更新停止しており、早々にエンジニア七不思議の 1 つ **《恐怖！作ったきり使わないツール&サービス！》** と化してしまった。私用ツールごときに真に大変なのは運用なのだと思い知らされる。

旧ブログでは Deno の Web フレームワーク[Fresh](https://fresh.deno.dev)による Edge SSR を採用していたが、今回は Next.js 13 の静的サイト生成を用いた。ソースコードは以下のリポジトリで公開している。

https://github.com/asa1984/asa1984.dev

ところで話が変わるが、私は Next.js 13 がリリースされるまでは Webpack アンチで、ずっと esbuild や Vite を使っていた。RSC ベースの App Router に未来を感じたので使い始めたのだが、「Next.js が Vite だったらなぁ」と思う場面は少なからずあり、やはり Vite の開発体験の良さには及ばない。[Turbopack](https://turbo.build/pack)に期待したいところだが、根本的な解決にはならない気もする

ところが人間、より醜悪なものに直面するとその時抱えていた問題など些事に思えてしまうらしい。今回はそんなモノに出会った。**Markdown って言うんですけど。**

## 実装方針

| 種類     | ライブラリ                 |
| -------- | -------------------------- |
| Web      | Next.js 13 (Static Export) |
| CSS      | Panda CSS                  |
| Markdown | next-mdx-remote            |

悪の個人開発では悪の開発規則を適用することが許容されており、JSX コンポーネントを除く全ての変数・関数はスネークケースで命名されている。ドナルドは Rust が大好きなんだ。

Markdown パーサーには[next-mdx-remote](https://github.com/hashicorp/next-mdx-remote)という hashicorp（Terraform 作ってる会社）のライブラリを使っている。記事もサイトのソースコードと一緒のリポジトリで管理するなら Next.js 公式が提供する`@next/mdx`を使えばいいのだが、ソースコードから記事を分離しプライベート状態で管理したかったのでこちらを選んだ。~~尚、肝心のプライベート管理機能は未実装である。~~

CSS フレームワークとして[Panda CSS](https://panda-css.com)という CSS in JS を採用した。コイツは Next.js 13 の App Router に対応したゼロランタイム CSS in JS という、まさしく次世代の CSS フレームワークである。詳細は後述。
デザインの方針だが、サイトの配色はモノトーンのライトテーマのみにした。これは決して、配色を考えるのが面倒だからとかダークモード対応が面倒だからとかそういう理由で決めたのではなく、洞窟に住むインターネット原人たちに陽光を思い出させるという立派な社会貢献のためである。おかげで私は実装中、常に[Dark Reader](https://chrome.google.com/webstore/detail/dark-reader/eimadpbcbfnmbkopoojfekhnkhdbieeh)を使う羽目になった。

## Panda CSS

ざっくり以下のような特徴を持つ。

- ゼロランタイム
- Next.js の App Router のサポート
- その他多くの JS フレームワークのサポート（Astro から Qwik まで）
- Cascade Layers, CSS Variable 等のモダン機能の採用
- TypeScript による型支援
- デザインシステムの構築を容易にする機能

現代の CSS フレームワークへの要求を全てクリアしている。実行時コストを絶対に許さない風潮はどこも同じなようだ。

また、使い方としては直接ライブラリをインポートするのではなく、Panda CSS の CLI によって自動生成した`styled-system`というモジュールをインポートするという特殊な方法を取る。この仕組みにより、強力な型支援や高度なデザインシステムの構築を実現しているようだ。

### 使用感

結論から言うと、開発体験はとてもいいが今回の用途には向いていなかった。

Markdown ブログを作る際問題になるのが、Markdown パーサーによって自動生成された HTML に対するスタイリングである（私だけかも）。
コンポーネント指向の現代において、多くの CSS フレームワークはこういった《コンポーネント外の要素にスタイルを後付けする》ということが苦手である。ユーティリティ指向の Tailwind は言わずもがな、Panda CSS もそういうったことには向かない。一応、`&`セレクタを使ってネイティブ CSS のようにスタイルをネストすることは可能なのだが、下流の全ての要素に対して最優先で再帰的にスタイルを適用するというとんでもない代物であり、[公式ドキュメントでも利用は控えるように言われている](https://panda-css.com/docs/concepts/writing-styles#native-css-nesting)。
私が旧ブログで利用していた[Twind CSS](https://twind.style)はネイティブ CSS 記法のスタイリングができるのだが、残念ながら App Router 非対応のため採用を見送った

ということで、Markdown 部分だけ CSS Modules(SCSS)を使うことにした。Panda CSS は色やフォントサイズなどのデザイントークンを CSS 変数として提供する。CSS Modules 側でそれらを読み取ることによって、スタイリングを統一することができた。

さて、ならばそれ以外では Panda CSS を活かせたのかというとそうでもない。静的なただの Web サイトだと、再利用しないパーツが多すぎて Panda CSS の機能を活かしきれない。

CSS フレームワークについて、私は重大な思い違いをしていた。これまでは CSS を簡単に使いたい一心でフレームワークを導入していたが、現代の CSS フレームワークは、Web UI の構築においてより高品質なデザインシステムを構築することを目的としているようだった。エンジニアがボヤきがちな CSS ツライ問題のほとんどは、CSS のメンタルモデルが不完全なことが原因だ。初学者が言う《CSS の難しさ》のほとんどは、コンポーネント指向と進化した CSS 自体が既に解決している。個人の感想なのかもしれないが、デザイン設計のない Web UI に対して CSS フレームワークはオーバースペックだった。

色々書いたがそれはそれとして Panda CSS 自体はとてもよかったので、今後は Tailwind の代わりにこちらを採用すると思う。

## Markdown

Markdown は、大手サービスから個人開発者に至るまでありとあらゆる者の手によって違法改造が施されており、Markdown ブログを作ってみると標準仕様だと思っていたものの多くが実は拡張機能であったことが発覚する。《Markdown パーサー》と銘打つライブラリを 1 つ落としてきて、適当な`.md`ファイルを食わせてみるといい。なんとテーブルも脚注も段落内改行もできない。

しかし安心してほしい。JavaScript エコシステムにはデファクトスタンダードの処理系[unified](https://unifiedjs.com)が存在する。unified は構造化データを扱うエコシステムの総称、及びそのコアパッケージである。unified 自体は以下のインターフェースを提供する。

```plaintext title="proceccer"
Input -> Parser -> Syntax Tree -> Compiler -> Output
                        ↑
                   Transformers
```

unified では一連の処理単位を Process と呼んでおり、各データフォーマットごとに Processor が実装されている。今回の用途では、[Remark](https://unifiedjs.com/explore/package/remark/)（Markdown）と[Rehype](https://unifiedjs.com/explore/package/rehype/)（Rehype）を利用することになる。また、Transformer によって Processor の機能を拡張することが可能で、今回は Markdown の拡張を利用するためにいくつかの Remark/Rehype プラグインを導入した。

導入したプラグインは以下の通りである。

- Remark
  - remark-breaks
  - remark-gemoji
  - remark-gfm
  - remark-math
- Rehype
  - rehype-katex
  - rehype-pretty-code

......これらを入れてようやく段落内改行、テーブル、脚注、数式、シンタックスハイライト等を利用できるようになる。まあ、これで最低限度の生活は営めそうなのでよしとしよう。じゃ、あとは next-mdx-remote よろしく！

**ERROR!**

next-mdx-remote とプラグインが依存している unified のバージョン不整合である。仕方なく next-mdx-remote に合わせていくつかのプラグインのバージョンを下げることになった。人生で初めて依存関係の問題でダウングレードしたので割と動揺した。

### リンクカード

↓ これ

http://example.com

Markdown ブログの華とも言えるリンクカードだが、正攻法で実装したら非常に面倒だった。実装自体は小さいが、この場合の《面倒》とは「技術者たるもの Markdown ブログはマストアイテム！」という軽いノリの風潮に対する相対的な感情である。

旧ブログでは[react-markdown](https://github.com/remarkjs/react-markdown)を利用しており、こちらはカスタムコンポーネントを Props に渡すことで、生成された要素を JSX でオーバーライドすることができる。旧ブログ実装では`a`要素をオーバーライドし、URL でリンクカードの是非を判定してリンクカードコンポーネントを突っ込んでいた。next-mdx-remote にも同じくカスタムコンポーネントによるオーバーライドが可能なのだが、今回は全ての`a`要素が`p`要素に内包されていたので上手くいかなかった。

他にいい方法が思いつかなかったので、大人しく unified の Transformer を実装することにした。まさか Markdown ブログでパーサーもどきを作ることになるとは思わなかった。Rust の強力な型推論を体験した後の TypeScript によるパーサー実装はほぼ拷問に近く、一部型の健全性を諦めた。
実装の詳細な説明は割愛するが、URL 直貼りのリンクとタイトルが`@card`のリンクを抽出し、`linkcard`という要素に置き換え、next-mdx-remote 側で`linkcard`をリンクカードコンポーネントに置換している。

OGP 情報は`fetch`して HTML をパースして抽出している。本当は Cloudflare の[html-rewriter-wasm](https://github.com/cloudflare/html-rewriter-wasm)を使うつもりだったが、`utilモジュールがねえ`と言われるので諦めて[node-html-parser](https://github.com/taoqf/node-html-parser)に変えた。最近の HTML パーサーは通常の DOM API とほぼ変わらない方法で操作できるので割と感動している。
画像は`og:url`の URL を直接使っているため、いつか何かしらの最適化処理を挟みたい。

## ディレクトリ構成

```
src/
├─app/
├─components/
└─features/
```

正直こんな小規模なサイトだと言うほど構造化するものはないのだが、割としっくりきたので言語化する。

おおよその開発者は、

> 困難は分割せよ

という言葉を信奉しているが、より正しくはこうである。

> 困難は困難になったら分割せよ

私のような人間は困難を幻視して「まず`components`ディレクトリでコンポーネントを定義して…」とかやり始めて一生完成しなくなる。特に《完成させるのが正義》な個人レベルの制作物だと、ボトムアップ手法は悪手である。

なので、App Router の構造をそのまま利用しよう。まず App Router の`page.tsx`にバーっと書き、読みづらくなってきたらファイルを分割して同階層に`_components`ディレクトリを作って放り込む[^1]。全体で再利用できそうなものが出てきたら`components`に《後から》移す。`features`には Markdown パーサーとか OGP の取得処理とか、ちょっと重要そうなロジックを突っ込む。

つい「App Router の責務はルーティングだけにしたい！」と思ってしまうが、それは大規模になったら考える。App Router は Web サイトの構造を反映しているのだから、そのまま使った方が認知的に自然になるだろう。

[^1]: App Router において、`_`から始まる名前のディレクトリ・ファイルはルーティングから無視される。

## デプロイ

安定の Cloudflare Pages にデプロイしている。毎回 Next.js を使っておきながら、未だ Vercel にデプロイしたことがないので刺されるかもしれない。

例のごとく GitHub Actions を利用しているが、今回新しい試みとして**Nix**を使った。詳細は実際のコードを見てもらうとして、重要なところを以下に抜粋した。

```yaml
steps:
  - uses: actions/checkout@v4

  # Nixのセットアップ
  - uses: DeterminateSystems/nix-installer-action@main
  - uses: DeterminateSystems/magic-nix-cache-action@main

  # (中略)

  # インストール・ビルド・デプロイ
  - name: Install dependencies
    run: |
      nix develop --command \
        pnpm install --frozen-lockfile --no-optional
  - name: Build
    run: |
      nix develop --command \
        pnpm build
  - name: Deploy to Cloudflare Pages
    run: |
      nix develop --command \
        wrangler pages deploy ./out --project-name=trashbox --branch dev
```

checkout 後、Nix をインストールしてキャッシュを設定している。通常、GitHub Actions でツールや実行環境を導入するには専用の Action が必要になるが、ここでは Nix にその役割を任せている。

`nix develop --command`は devShell を起動して、引数に渡したコマンドを実行して終了する。Nix 版`bach -c`と捉えてもらって構わない。
devShell が分からない人向けに簡単に説明すると、devShell とは、インストールしたいパッケージ群を`flake.nix`というファイルに記述し`nix develop`を実行すると指定したパッケージが PATH に通された`bash`が起動するという、Nix の宣言的開発環境構築機能である。`flake.nix`を評価すると Nix は`flake.lock`を生成しバージョンロックを行うのだが、これが非常に強力で、`flake.lock`がある限り完全に同一の開発環境が再現される。Nix の再現性周りの仕組みについては[私の Zenn の記事](https://zenn.dev/asa1984/articles/nixos-is-the-best)を参照してほしい。
一つ注意点として、Github Action 上で--command オプションをつけずに`nix devshell`単体を実行すると処理が一生終わらない（bash が起動して待機するのだから当たり前）ので気をつけよう。

話を戻そう。この手法のメリットはローカルと CI で環境が完全に同一になる点だ。ローカルの devShell 上で開発し、`flake.lock`と一緒にリポジトリに Push して Action を実行すれば、Nix の魔の再現力によって全く同じパッケージがインストールされる。ツールの導入のためにたくさんのサードパーティー製 Action を引っ張ってくる必要もない。

この例では Nix をツールのインストールにしか利用していない。必要なら Nix 以外のインストーラーやパッケージマネージャーを併用しても OK だ。もし、あなたが Nix に興味を持っているなら、Nix パッケージのビルドや NixOS のような Deep で難易度の高いものより、devShell のようなカジュアルな Nix の利用から始めるといいだろう。

### 注意点

以下のコマンドは`pnpmがない`と言われて失敗する。

```yaml
run: |
  nix develop --command \
    echo "STORE_PATH=$(pnpm store path)" >> $GITHUB_OUTPUT
```

`$()`の中でコマンドを呼び出した場合、devShell ではなく環境の PATH を参照するようだ。

パイプと xargs を用いて以下の書き方に直すと動く。

```yaml
run: |
  nix develop --command \
    pnpm store path | xargs -I {} echo "STORE_PATH={}" >> $GITHUB_OUTPUT
```

## 総評

大体いい感じになった。楽しい。

まだ多くの未実装機能と修正箇所を残しているし、コードは目も当てられない汚さだが、現状最も大きな課題はこのブログサイトをネットの藻屑にしないよう記事を書き続けることである。

> 戦争は平和なり
> 自由は隷従なり
> ~~無知は力なり~~
> 継続は力なり
