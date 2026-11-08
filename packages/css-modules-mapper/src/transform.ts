import { transform as transformCss } from "lightningcss";

import { cssModules } from "./options.ts";
import { SpanMapFeature, SpanMapKind } from "./protocol.ts";
import type { MapperDiagnostic, SpanMapping, TransformResult } from "./protocol.ts";

/** Code reported when Lightning CSS cannot parse a module. */
export const PARSE_ERROR_CODE = 1001;

/**
 * Features that may follow a class name back to its selector. Rename is left out: a class can
 * appear in many selectors, but a name maps to only its first one, so a rename would edit one
 * selector and leave the rest stale.
 */
const NAME_FEATURES =
  SpanMapFeature.Hover |
  SpanMapFeature.Definition |
  SpanMapFeature.References |
  SpanMapFeature.DocumentHighlights;

/**
 * Words that cannot be the name of an `export const`. Vite exports every class name that is a
 * valid identifier as a named export as well, and skips these.
 */
const RESERVED = new Set([
  "arguments",
  "await",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "enum",
  "eval",
  "export",
  "extends",
  "false",
  "finally",
  "for",
  "function",
  "if",
  "implements",
  "import",
  "in",
  "instanceof",
  "interface",
  "let",
  "new",
  "null",
  "package",
  "private",
  "protected",
  "public",
  "return",
  "static",
  "super",
  "switch",
  "this",
  "throw",
  "true",
  "try",
  "typeof",
  "var",
  "void",
  "while",
  "with",
  "yield",
]);

const IDENTIFIER = /^[A-Za-z_$][\w$]*$/u;

/**
 * Turns a CSS module into the TypeScript that describes its import:
 *
 * ```ts
 * declare const styles: {
 *   readonly "button": string;
 * };
 * export default styles;
 * export declare const button: string;
 * ```
 *
 * The class names come from Lightning CSS itself, so a name the build drops (an empty rule, say)
 * is missing from the types too.
 */
export const transform = (fileName: string, content: string): TransformResult => {
  let names: string[];
  try {
    const result = transformCss({
      filename: fileName,
      code: new TextEncoder().encode(content),
      cssModules,
    });
    names = Object.keys(result.exports ?? {}).toSorted();
  } catch (error) {
    return {
      ...emit([], new Map()),
      diagnostics: [toDiagnostic(error, content)],
    };
  }
  return emit(names, locateNames(content, new Set(names)));
};

/** Writes the virtual module and maps every class name in it back to its first selector. */
const emit = (names: readonly string[], locations: ReadonlyMap<string, number>) => {
  const prefix = "declare const ";
  const mappings: SpanMapping[] = [
    // The default export is synthesized; mapping it to the top of the stylesheet is what lets
    // go-to-definition on the import land in the file.
    [prefix.length, "styles".length, 0, 0, SpanMapKind.Atom, SpanMapFeature.Definition],
  ];
  let text = `${prefix}styles: {\n`;
  const map = (name: string, at: number) => {
    const original = locations.get(name);
    if (original !== undefined) {
      mappings.push([at, name.length, original, name.length, SpanMapKind.Verbatim, NAME_FEATURES]);
    }
  };
  for (const name of names) {
    const key = JSON.stringify(name);
    text += "  readonly ";
    // A name that needs escaping no longer matches the selector character for character.
    if (key === `"${name}"`) {
      map(name, text.length + 1);
    }
    text += `${key}: string;\n`;
  }
  text += "};\nexport default styles;\n";
  for (const name of names) {
    if (IDENTIFIER.test(name) && !RESERVED.has(name)) {
      text += "export declare const ";
      map(name, text.length);
      text += `${name}: string;\n`;
    }
  }
  return { text, extension: ".ts" as const, mappings };
};

/**
 * Finds where each name is first written as `.name` or `#name` in a selector. Comments, strings,
 * and `url()` are blanked out first so text inside them never counts.
 */
const locateNames = (content: string, names: ReadonlySet<string>) => {
  const code = content.replaceAll(
    /\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|url\([^)]*\)/gu,
    (match) => " ".repeat(match.length),
  );
  const locations = new Map<string, number>();
  for (const match of code.matchAll(/[.#](-?[_a-zA-Z\u00A0-\uFFFF][\w\u00A0-\uFFFF-]*)/gu)) {
    const [, name] = match;
    if (name !== undefined && names.has(name) && !locations.has(name)) {
      locations.set(name, match.index + 1);
    }
  }
  return locations;
};

/** Converts a Lightning CSS error, whose location is a 1-based line and column, to an offset. */
const toDiagnostic = (error: unknown, content: string): MapperDiagnostic => {
  const message = error instanceof Error ? error.message : String(error);
  let start = 0;
  if (
    typeof error === "object" &&
    error !== null &&
    "loc" in error &&
    typeof error.loc === "object" &&
    error.loc !== null &&
    "line" in error.loc &&
    "column" in error.loc &&
    typeof error.loc.line === "number" &&
    typeof error.loc.column === "number"
  ) {
    const { line, column } = error.loc;
    const lines = content.split("\n");
    const before = lines.slice(0, line - 1).reduce((sum, text) => sum + text.length + 1, 0);
    start = Math.min(before + column - 1, content.length);
  }
  return {
    messageText: message,
    start,
    length: start < content.length ? 1 : 0,
    code: PARSE_ERROR_CODE,
  };
};
