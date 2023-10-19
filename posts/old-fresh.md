---
title: FreshでMarkdownブログを作った
description: 臆病な自尊心と尊大な羞恥心と偉大なFresh
date: 2022-11-16
image: /fresh.png
published: true
tags: [Tech, Web, Deno]
---

**2023追記**

これは[旧ブログ](https://trashbox-asa.deno.dev)からそのまま引っ張ってきた過去の記事です。

https://trashbox-asa.deno.dev/articles/stack

---

> スタージョンの法則
>
> 「どんなものでも9割はガラクタだ」

プログラマーは積極的に技術記事を書くべきである、という言説は多くの技術者が支持している考え方だと思います。しかし、強々エンジニアが集う場所に拙い記事を投げ込むのはかなり勇気がいるし、技術記事投稿サービスの検索空間を汚すようなこともできれば避けたいです。
かといって一切アウトプットしないままでは遠からず狂疾に飲まれて虎になってしまう、と山月記で李徴も言っていました。
ならばどうするか。

<br/>

**個人ブログを作ればいいじゃない！**

<br/>

ということでこのブログサイトの使用技術を紹介します。

## Deno

https://deno.land/

新進気鋭のRust製JavaScriptランタイム。Node.jsの開発者Ryan
Dahl氏が2018年に行った講演「Node.jsに関する10の反省点」で発表した。

特徴はなんといってもそのシンプルさ。

- TypeScriptを標準サポート
- リンタ、フォーマッタ、テストランナなどの開発ツール標準搭載
- ES Module仕様
- Web標準準拠
- node_module, package.jsonが無い
- URLインポート(`import { join } from "https://deno.land/std/path/mod.ts"`)

標準的なJavascript開発ツールがビルトインされているため、`tsconfig.json`や`.eslintrc`のような煩雑な設定ファイル無しにデフォルトで快適な開発環境を得ることができます。CommonJSとESModuleの差異に苦しむこともない、激重node_moduleが生成されることもない…

Deno1.28でnpm対応がついに安定版に到達しました。覇権を取る日は近い。

## Fresh

https://fresh.deno.dev/

Denoのシンプルさを活かした最高にフレッシュなWebフレームワーク。内部ではPreactが使用されていて常にSSRを行います。

```shell
deno run -A -r https://fresh.deno.dev my-project
```

これで初期化完了。Denoはリモートでホストされているスクリプトを直接実行できます。
下記の特徴によって簡単に高パフォーマンスなWebアプリケーションを構築できます。

### No build step & No configuration

ビルド不要で設定ファイル無しに実行可能。Theシンプル。
_重要_

![No configuration](/fresh_no_configuration.png)

### Island archetecture

クライアントサイドにJSファイルを極力送らないアーキテクチャ。仕組みを理解するにはまず通常のSSRの挙動について知る必要があります。

#### 一般的なSSRの実行順序

1. クライアントからのリクエストに応じて、サーバーサイドでJSXから静的なHTMLを生成
2. クライアントに生成されたHTMLと**Hydration**用JSを返す
3. 静的なHTMLにイベントハンドラを注入(**Hydration**)
4. 動的なアプリケーションとして機能するようになる

このHydrationという処理が重要で、生成されたHTMLファイルがクライアントに届いてWebページが動くアプリケーションとして機能するようになるまでの間、どうしてもオーバーヘッドが生じてしまいます。
対して、FreshはデフォルトではクライアントサイドにJSファイルを送らず、事前に指定された特定のコンポーネント(**Island**)にのみHydrationを行います(_Selective
Hydration_)。通常のHydrationはDOM全体に対してHydrateを実行しますが、Selective Hydrationは最低限の要素にのみ行うため、Webページが操作可能になるまでのオーバヘッドが少なく済みます。

#### その他のIsland archetectureフレームワーク

- [Astro](https://astro.build/)

### Edge SSR

Edge ServerでSSRを行う手法。Edgeからの高速なレスポンスとコンテンツのリアルタイム性を両立できます。

|                | CRA | SSR | SSG | Edge SSR |
| :------------: | :-: | :-: | :-: | :------: |
|      SEO       |  △  |  ○  |  ○  |    ○     |
| リアルタイム性 |  ○  |  ○  |  ☓  |    ○     |
| パフォーマンス |  △  |  ○  |  ◎  |    ◎     |

Edgeではマシンリソースや実行環境の厳しい制限を受けるためエコシステムの多くはまだ発展途上ですが、特に小・中規模のサービスではいずれ主流になるでしょう。Freshは後述のDeno
Deploy上で実行されることを想定して作られているようです。

#### その他のEdge SSRフレームワーク

- [Remix](https://remix.run/)

## Twind

https://twind.dev/

端的に言うとCSS in JS版Tailwind CSSです。Utility
Firstな記法以外にも、styled-componentsやEmotionのようにオブジェクト形式・テンプレートリテラル形式でもCSSを記述できます(神)。また、オブジェクト形式で書く際には`h1: apply("text-blule-500")`というようにTailwindの記法と混ぜて記述することもできます(神)。柔軟性が高いので思いつく限りの~悪どい~記法を試すことができます。

Freshのインストールスクリプト実行時にオプションでTwindのインストールが選択可能で、その場合Fresh用のtwind
pluginが自動で適用されます。通常、Twindを利用するには要素のclassNameに`tw`関数の返り値を渡す必要がありますが、プラグインによって直接classNameに書き込めるようになっています。VSCodeの拡張機能も用意されていて補完もバッチリです。

```js
import {ts, css, theme} from "twind/css"

// Twindのデフォルト記法
<div className={tw("text-bold text-blue-500")}>Styled element</div>;

// Freshのtwind plugin有効時
<div className="text-bold text-white">Styled element</div>;

// CSS object記法
const style = {
  fontStyle: "bold",
  color: theme("colors.blue.500"),
}
<div className={tw(css(style))}>Styled element<div/>
```

個人的には、CSS
moduleのようなWeb標準準拠でない方式でCSSファイルをインポートしたり、設定ファイルをゴニョゴニョしてビルドしたりするよりは、純粋なJSのオブジェクトとしてCSSを扱うアプローチが好き。

## Deno Deploy

https://deno.com/deploy

Deno公式提供のEdgeホスティングサービス。ランタイムの開発元が提供しているサービスなだけあって、他のEdgeサービスのように考えることが少なく、ローカル環境で実装したコードはほとんどそのまま動きます。日本には東京と大阪にCDNサーバーがあります。

デプロイ方法は非常に簡単でGitHubのリポジトリを指定するだけで完了します。Freshに関してはビルド不要なので、本当にリポジトリにプッシュするだけでデプロイが終わります(圧倒的速度！)。
ダッシュボードで環境変数を設定したり、GitHub Actionsを使ってビルドしたりもできます。

Freeプランは10万リクエスト/日・1GB/月と個人開発規模なら十分な量が使えます。メモリ・CPUなどマシンリソースに関しては他のEdgeサービス同様厳しめの制限がかけられています。

## まとめ

完全な好奇心で技術選定をしたので新しめの技術スタックになりましたが予想以上に快適でした。なんといってもFreshのシンプルさが素晴らしい。
コメント機能などちょっとしたバックエンドを実装してみるのもFreshのSSR機能を活かせて面白いかもしれません(記事読む人誰もいない問題には目を瞑る)。

最後に一つ。記事部分のスタイリングにあたってはバリバリにZennを参考にしました。既にあるサービスと似たものを自分で構築すると、世に出るプロダクトというものがいかに優れているのかを噛み締めることができます。汝、Zennを使いなさい。
