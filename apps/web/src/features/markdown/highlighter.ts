// Each shiki language is imported on its own so that only the languages in use are bundled.
/* oxlint-disable import/max-dependencies */
import type {
  BundledHighlighterOptions,
  BundledLanguage,
  BundledTheme,
  Highlighter,
  LanguageInput,
  ThemeInput,
} from "shiki";
import { getSingletonHighlighterCore } from "shiki/core";
import langCss from "shiki/dist/langs/css.mjs";
import langDiff from "shiki/dist/langs/diff.mjs";
import langDockerfile from "shiki/dist/langs/dockerfile.mjs";
import langGo from "shiki/dist/langs/go.mjs";
import langGraphql from "shiki/dist/langs/graphql.mjs";
import langHaskell from "shiki/dist/langs/haskell.mjs";
import langHtml from "shiki/dist/langs/html.mjs";
import langJavascript from "shiki/dist/langs/javascript.mjs";
import langJson from "shiki/dist/langs/json.mjs";
import langJsonc from "shiki/dist/langs/jsonc.mjs";
import langJsx from "shiki/dist/langs/jsx.mjs";
import langMarkdown from "shiki/dist/langs/markdown.mjs";
import langNix from "shiki/dist/langs/nix.mjs";
import langPython from "shiki/dist/langs/python.mjs";
import langRust from "shiki/dist/langs/rust.mjs";
import langScss from "shiki/dist/langs/scss.mjs";
import langShellscript from "shiki/dist/langs/shellscript.mjs";
import langSql from "shiki/dist/langs/sql.mjs";
import langToml from "shiki/dist/langs/toml.mjs";
import langTsx from "shiki/dist/langs/tsx.mjs";
import langTypescript from "shiki/dist/langs/typescript.mjs";
import langYaml from "shiki/dist/langs/yaml.mjs";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

// Pages are prerendered inside workerd, which cannot compile wasm at runtime or fetch grammars by
// URL, so every grammar is bundled statically and matched with the JS regex engine. Unknown
// languages fall back to plaintext in rehype-pretty-code.
const langs = [
  langCss,
  langDiff,
  langDockerfile,
  langGo,
  langGraphql,
  langHaskell,
  langHtml,
  langJavascript,
  langJson,
  langJsonc,
  langJsx,
  langMarkdown,
  langNix,
  langPython,
  langRust,
  langScss,
  langShellscript,
  langSql,
  langToml,
  langTsx,
  langTypescript,
  langYaml,
];

/** rehype-pretty-code's `getHighlighter`, backed by the statically bundled languages. */
export const getHighlighter = async (
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
    // oxlint-disable-next-line typescript/consistent-type-assertions, typescript/no-unsafe-type-assertion
    getBundledLanguages: () => ({}) as Record<BundledLanguage, LanguageInput>,
    // oxlint-disable-next-line typescript/consistent-type-assertions, typescript/no-unsafe-type-assertion
    getBundledThemes: () => ({}) as Record<BundledTheme, ThemeInput>,
  };
};
