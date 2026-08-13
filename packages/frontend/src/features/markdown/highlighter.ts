import type {
  BundledHighlighterOptions,
  BundledLanguage,
  BundledTheme,
  Highlighter,
  LanguageInput,
  ThemeInput,
} from "shiki";
import { getSingletonHighlighterCore } from "shiki/core";
import lang_css from "shiki/dist/langs/css.mjs";
import lang_diff from "shiki/dist/langs/diff.mjs";
import lang_dockerfile from "shiki/dist/langs/dockerfile.mjs";
import lang_go from "shiki/dist/langs/go.mjs";
import lang_graphql from "shiki/dist/langs/graphql.mjs";
import lang_haskell from "shiki/dist/langs/haskell.mjs";
import lang_html from "shiki/dist/langs/html.mjs";
import lang_javascript from "shiki/dist/langs/javascript.mjs";
import lang_json from "shiki/dist/langs/json.mjs";
import lang_jsonc from "shiki/dist/langs/jsonc.mjs";
import lang_jsx from "shiki/dist/langs/jsx.mjs";
import lang_markdown from "shiki/dist/langs/markdown.mjs";
import lang_nix from "shiki/dist/langs/nix.mjs";
import lang_python from "shiki/dist/langs/python.mjs";
import lang_rust from "shiki/dist/langs/rust.mjs";
import lang_scss from "shiki/dist/langs/scss.mjs";
import lang_shellscript from "shiki/dist/langs/shellscript.mjs";
import lang_sql from "shiki/dist/langs/sql.mjs";
import lang_toml from "shiki/dist/langs/toml.mjs";
import lang_tsx from "shiki/dist/langs/tsx.mjs";
import lang_typescript from "shiki/dist/langs/typescript.mjs";
import lang_yaml from "shiki/dist/langs/yaml.mjs";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

// Cloudflare Workers cannot compile wasm at runtime and cannot fetch grammars
// by URL, so every grammar must be statically bundled and matched with the
// JS regex engine. Keep this list small: the worker has a hard size limit
// (shiki/bundle/full exceeded it). Unknown languages fall back to plaintext
// in rehype-pretty-code.
const langs = [
  lang_css,
  lang_diff,
  lang_dockerfile,
  lang_go,
  lang_graphql,
  lang_haskell,
  lang_html,
  lang_javascript,
  lang_json,
  lang_jsonc,
  lang_jsx,
  lang_markdown,
  lang_nix,
  lang_python,
  lang_rust,
  lang_scss,
  lang_shellscript,
  lang_sql,
  lang_toml,
  lang_tsx,
  lang_typescript,
  lang_yaml,
];

export const get_highlighter = async (
  options: BundledHighlighterOptions<never, never>,
): Promise<Highlighter> => {
  const highlighter = await getSingletonHighlighterCore({
    themes: options.themes.filter((theme) => typeof theme !== "string"),
    langs,
    engine: createJavaScriptRegexEngine({ forgiving: true }),
  });
  return {
    ...highlighter,
    // rehype-pretty-code may call the loaders with bundled names, which a core
    // highlighter cannot resolve. Every language and theme it can ask for is
    // already preloaded above, so both are no-ops. The getBundled* pair only
    // exists to satisfy the bundled Highlighter type; nothing calls it.
    loadLanguage: async () => {},
    loadTheme: async () => {},
    getBundledLanguages: () => ({}) as Record<BundledLanguage, LanguageInput>,
    getBundledThemes: () => ({}) as Record<BundledTheme, ThemeInput>,
  };
};
