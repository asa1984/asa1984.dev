---
title: Next.js 13でブログを作った
description: Markdown絶許
date: 2023-10-23
image: first.webp
published: true
tags: [Tech, Web, Next.js]
---

技術者を自称するインターネット人格にとって個人ブログはマストである。ネットが社会化された現代、個人ブログは唯一の安息の地なのだ。
しかし、そうして過去に作った[旧ブログ](https://trashbox-asa.deno.dev)は記事を1本投稿したきり更新停止しており、早々にエンジニア七不思議の1つ **《恐怖！作ったきり使わないツール&サービス！》** と化してしまった。私用ツールごときに真に大変なのは運用なのだと思い知らされる。

旧ブログではDenoのWebフレームワーク[Fresh](https://fresh.deno.dev)によるEdge SSRを採用していたが、今回はNext.js 13の静的サイト生成を用いた。ソースコードは以下のリポジトリで公開している。

https://github.com/asa1984/asa1984.dev

ところで話が変わるが、私はNext.js 13がリリースされるまではWebpackアンチで、ずっとesbuildやViteを使っていた。RSCベースのApp Routerに未来を感じたので使い始めたのだが、「Next.jsがViteだったらなぁ」と思う場面は少なからずあり、やはりViteの開発体験の良さには及ばない。[Turbopack](https://turbo.build/pack)に期待したいところだが、根本的な解決にはならない気もする

ところが人間、より醜悪なものに直面するとその時抱えていた問題など些事に思えてしまうらしい。今回はそんなモノに出会った。**Markdownって言うんですけど。**

## 実装方針

| 種類     | ライブラリ                 |
| -------- | -------------------------- |
| Web      | Next.js 13 (Static Export) |
| CSS      | Panda CSS                  |
| Markdown | next-mdx-remote            |

悪の個人開発では悪の開発規則を適用することが許容されており、JSXコンポーネントを除く全ての変数・関数はスネークケースで命名されている。ドナルドはRustが大好きなんだ。

Markdownパーサーには[next-mdx-remote](https://github.com/hashicorp/next-mdx-remote)というhashicorp（Terraform作ってる会社）のライブラリを使っている。記事もサイトのソースコードと一緒のリポジトリで管理するならNext.js公式が提供する`@next/mdx`を使えばいいのだが、ソースコードから記事を分離しプライベート状態で管理したかったのでこちらを選んだ。~~尚、肝心のプライベート管理機能は未実装である。~~

CSSフレームワークとして[Panda CSS](https://panda-css.com)というCSS in JSを採用した。コイツはNext.js 13のApp Routerに対応したゼロランタイムCSS in JSという、まさしく次世代のCSSフレームワークである。詳細は後述。
デザインの方針だが、サイトの配色はモノトーンのライトテーマのみにした。これは決して、配色を考えるのが面倒だからとかダークモード対応が面倒だからとかそういう理由で決めたのではなく、洞窟に住むインターネット原人たちに陽光を思い出させるという立派な社会貢献のためである。おかげで私は実装中、常に[Dark Reader](https://chrome.google.com/webstore/detail/dark-reader/eimadpbcbfnmbkopoojfekhnkhdbieeh)を使う羽目になった。

## Panda CSS

ざっくり以下のような特徴を持つ。

- ゼロランタイム
- Next.jsのApp Routerのサポート
- その他多くのJSフレームワークのサポート（AstroからQwikまで）
- Cascade Layers, CSS Variable等のモダン機能の採用
- TypeScriptによる型支援
- デザインシステムの構築を容易にする機能

現代のCSSフレームワークへの要求を全てクリアしている。実行時コストを絶対に許さない風潮はどこも同じなようだ。

また、使い方としては直接ライブラリをインポートするのではなく、Panda CSSのCLIによって自動生成した`styled-system`というモジュールをインポートするという特殊な方法を取る。この仕組みにより、強力な型支援や高度なデザインシステムの構築を実現しているようだ。

### 使用感

結論から言うと、開発体験はとてもいいが今回の用途には向いていなかった。

Markdownブログを作る際問題になるのが、Markdownパーサーによって自動生成されたHTMLに対するスタイリングである（私だけかも）。
コンポーネント指向の現代において、多くのCSSフレームワークはこういった《コンポーネント外の要素にスタイルを後付けする》ということが苦手である。ユーティリティ指向のTailwindは言わずもがな、Panda CSSもそういうったことには向かない。一応、`&`セレクタを使ってネイティブCSSのようにスタイルをネストすることは可能なのだが、下流の全ての要素に対して最優先で再帰的にスタイルを適用するというとんでもない代物であり、[公式ドキュメントでも利用は控えるように言われている](https://panda-css.com/docs/concepts/writing-styles#native-css-nesting)。
私が旧ブログで利用していた[Twind CSS](https://twind.style)はネイティブCSS記法のスタイリングができるのだが、残念ながらApp Router非対応のため採用を見送った

ということで、Markdown部分だけCSS Modules(SCSS)を使うことにした。Panda CSSは色やフォントサイズなどのデザイントークンをCSS変数として提供する。CSS Modules側でそれらを読み取ることによって、スタイリングを統一することができた。

さて、ならばそれ以外ではPanda CSSを活かせたのかというとそうでもない。静的なただのWebサイトだと、再利用しないパーツが多すぎてPanda CSSの機能を活かしきれない。

CSSフレームワークについて、私は重大な思い違いをしていた。これまではCSSを簡単に使いたい一心でフレームワークを導入していたが、現代のCSSフレームワークは、Web UIの構築においてより高品質なデザインシステムを構築することを目的としているようだった。エンジニアがボヤきがちなCSSツライ問題のほとんどは、CSSのメンタルモデルが不完全なことが原因だ。初学者が言う《CSSの難しさ》のほとんどは、コンポーネント指向と進化したCSS自体が既に解決している。個人の感想なのかもしれないが、デザイン設計のないWeb UIに対してCSSフレームワークはオーバースペックだった。

色々書いたがそれはそれとしてPanda CSS自体はとてもよかったので、今後はTailwindの代わりにこちらを採用すると思う。

## Markdown

Markdownは、大手サービスから個人開発者に至るまでありとあらゆる者の手によって違法改造が施されており、Markdownブログを作ってみると標準仕様だと思っていたものの多くが実は拡張機能であったことが発覚する。《Markdownパーサー》と銘打つライブラリを1つ落としてきて、適当な`.md`ファイルを食わせてみるといい。なんとテーブルも脚注も段落内改行もできない。

しかし安心してほしい。JavaScriptエコシステムにはデファクトスタンダードの処理系[unified](https://unifiedjs.com)が存在する。unifiedは構造化データを扱うエコシステムの総称、及びそのコアパッケージである。unified自体は以下のインターフェースを提供する。

```plaintext title="proceccer"
Input -> Parser -> Syntax Tree -> Compiler -> Output
                        ↑
                   Transformers
```

unifiedでは一連の処理単位をProcessと呼んでおり、各データフォーマットごとにProcessorが実装されている。今回の用途では、[Remark](https://unifiedjs.com/explore/package/remark/)（Markdown）と[Rehype](https://unifiedjs.com/explore/package/rehype/)（Rehype）を利用することになる。また、TransformerによってProcessorの機能を拡張することが可能で、今回はMarkdownの拡張を利用するためにいくつかのRemark/Rehypeプラグインを導入した。

導入したプラグインは以下の通りである。

- Remark
  - remark-breaks
  - remark-gemoji
  - remark-gfm
  - remark-math
- Rehype
  - rehype-katex
  - rehype-pretty-code

......これらを入れてようやく段落内改行、テーブル、脚注、数式、シンタックスハイライト等を利用できるようになる。まあ、これで最低限度の生活は営めそうなのでよしとしよう。じゃ、あとはnext-mdx-remoteよろしく！

**ERROR!**

next-mdx-remoteとプラグインが依存しているunifiedのバージョン不整合である。仕方なくnext-mdx-remoteに合わせていくつかのプラグインのバージョンを下げることになった。人生で初めて依存関係の問題でダウングレードしたので割と動揺した。

### リンクカード

↓これ

http://example.com

Markdownブログの華とも言えるリンクカードだが、正攻法で実装したら非常に面倒だった。実装自体は小さいが、この場合の《面倒》とは「技術者たるものMarkdownブログはマストアイテム！」という軽いノリの風潮に対する相対的な感情である。

旧ブログでは[react-markdown](https://github.com/remarkjs/react-markdown)を利用しており、こちらはカスタムコンポーネントをPropsに渡すことで、生成された要素をJSXでオーバーライドすることができる。旧ブログ実装では`a`要素をオーバーライドし、URLでリンクカードの是非を判定してリンクカードコンポーネントを突っ込んでいた。next-mdx-remoteにも同じくカスタムコンポーネントによるオーバーライドが可能なのだが、今回は全ての`a`要素が`p`要素に内包されていたので上手くいかなかった。

他にいい方法が思いつかなかったので、大人しくunifiedのTransformerを実装することにした。まさかMarkdownブログでパーサーもどきを作ることになるとは思わなかった。Rustの強力な型推論を体験した後のTypeScriptによるパーサー実装はほぼ拷問に近く、一部型の健全性を諦めた。
実装の詳細な説明は割愛するが、URL直貼りのリンクとタイトルが`@card`のリンクを抽出し、`linkcard`という要素に置き換え、next-mdx-remote側で`linkcard`をリンクカードコンポーネントに置換している。

OGP情報は`fetch`してHTMLをパースして抽出している。本当はCloudflareの[html-rewriter-wasm](https://github.com/cloudflare/html-rewriter-wasm)を使うつもりだったが、`utilモジュールがねえ`と言われるので諦めて[node-html-parser](https://github.com/taoqf/node-html-parser)に変えた。最近のHTMLパーサーは通常のDOM APIとほぼ変わらない方法で操作できるので割と感動している。
画像は`og:url`のURLを直接使っているため、いつか何かしらの最適化処理を挟みたい。

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

なので、App Routerの構造をそのまま利用しよう。まずApp Routerの`page.tsx`にバーっと書き、読みづらくなってきたらファイルを分割して同階層に`_components`ディレクトリを作って放り込む[^1]。全体で再利用できそうなものが出てきたら`components`に《後から》移す。`features`にはMarkdownパーサーとかOGPの取得処理とか、ちょっと重要そうなロジックを突っ込む。

つい「App Routerの責務はルーティングだけにしたい！」と思ってしまうが、それは大規模になったら考える。App RouterはWebサイトの構造を反映しているのだから、そのまま使った方が認知的に自然になるだろう。

[^1]: App Routerにおいて、`_`から始まる名前のディレクトリ・ファイルはルーティングから無視される。

## デプロイ

安定のCloudflare Pagesにデプロイしている。毎回Next.jsを使っておきながら、未だVercelにデプロイしたことがないので刺されるかもしれない。

例のごとくGitHub Actionsを利用しているが、今回新しい試みとして**Nix**を使った。詳細は実際のコードを見てもらうとして、重要なところを以下に抜粋した。

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

checkout後、Nixをインストールしてキャッシュを設定している。通常、GitHub Actionsでツールや実行環境を導入するには専用のActionが必要になるが、ここではNixにその役割を任せている。

`nix develop --command`はdevShellを起動して、引数に渡したコマンドを実行して終了する。Nix版`bach -c`と捉えてもらって構わない。
devShellが分からない人向けに簡単に説明すると、devShellとは、インストールしたいパッケージ群を`flake.nix`というファイルに記述し`nix develop`を実行すると指定したパッケージがPATHに通された`bash`が起動するという、Nixの宣言的開発環境構築機能である。`flake.nix`を評価するとNixは`flake.lock`を生成しバージョンロックを行うのだが、これが非常に強力で、`flake.lock`がある限り完全に同一の開発環境が再現される。Nixの再現性周りの仕組みについては[私のZennの記事](https://zenn.dev/asa1984/articles/nixos-is-the-best)を参照してほしい。
一つ注意点として、Github Action上で--commandオプションをつけずに`nix devshell`単体を実行すると処理が一生終わらない（bashが起動して待機するのだから当たり前）ので気をつけよう。

話を戻そう。この手法のメリットはローカルとCIで環境が完全に同一になる点だ。ローカルのdevShell上で開発し、`flake.lock`と一緒にリポジトリにPushしてActionを実行すれば、Nixの魔の再現力によって全く同じパッケージがインストールされる。ツールの導入のためにたくさんのサードパーティー製Actionを引っ張ってくる必要もない。

この例ではNixをツールのインストールにしか利用していない。必要ならNix以外のインストーラーやパッケージマネージャーを併用してもOKだ。もし、あなたがNixに興味を持っているなら、NixパッケージのビルドやNixOSのようなDeepで難易度の高いものより、devShellのようなカジュアルなNixの利用から始めるといいだろう。

### 注意点

以下のコマンドは`pnpmがない`と言われて失敗する。

```yaml
run: |
  nix develop --command \
    echo "STORE_PATH=$(pnpm store path)" >> $GITHUB_OUTPUT
```

`$()`の中でコマンドを呼び出した場合、devShellではなく環境のPATHを参照するようだ。

パイプとxargsを用いて以下の書き方に直すと動く。

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
