/**
 * The content mapper protocol of TypeScript 7.1, written out here so the mapper does not depend on
 * the compiler that spawns it.
 *
 * See https://github.com/microsoft/typescript-go/pull/4712 and
 * https://github.com/microsoft/TypeScript/pull/63936.
 */

// oxlint-disable-next-line unicorn/text-encoding-identifier-case -- The protocol spells it this way.
type PositionEncoding = "utf-8" | "utf-16";

export type InitializeParams = {
  positionEncodings: PositionEncoding[];
  locale?: string;
};

export type InitializeResult = {
  positionEncoding: PositionEncoding;
  /** Must not be "ts", "tsc", "typescript", or a file extension TypeScript understands. */
  diagnosticSource: string;
};

export type OpenProjectParams = {
  /** Absolute tsconfig path, or an empty string for a project without a config file. */
  configFileName: string;
  projectHandle: string;
  /** The `options` object of this mapper's `contentMappers` entry. */
  options?: Record<string, unknown>;
  compilerOptions: Record<string, unknown>;
};

type OptionDiagnostic = {
  /** Property names and array indexes relative to the `options` object. */
  path: (string | number)[];
  messageText: string;
  code: number;
};

export type OpenProjectResult = {
  optionDiagnostics?: OptionDiagnostic[];
};

export type TransformParams = {
  fileName: string;
  content: string;
  projectHandle: string;
};

export type CloseProjectParams = {
  projectHandle: string;
};

export const SpanMapKind = {
  /** The virtual span has the same length and content as the original one. */
  Verbatim: 0,
  /** The virtual span may differ from the original one; diagnostics show the virtual text. */
  Atom: 1,
  /** The virtual span may differ from the original one; diagnostics show the original text. */
  Alias: 2,
} as const;

/** Which language service features may use a span. */
export const SpanMapFeature = {
  None: 0,
  Hover: 1,
  Definition: 1 << 3,
  References: 1 << 6,
  DocumentHighlights: 1 << 7,
  Rename: 1 << 8,
} as const;

/** Positions and lengths are in the encoding chosen at `initialize`. */
export type SpanMapping = [
  virtualStart: number,
  virtualLength: number,
  originalStart: number,
  originalLength: number,
  kind: (typeof SpanMapKind)[keyof typeof SpanMapKind],
  features?: number,
];

export type MapperDiagnostic = {
  messageText: string;
  start: number;
  length: number;
  code: number;
};

export type TransformResult = {
  /** TypeScript text that the compiler checks in place of the original file. */
  text: string;
  extension: ".ts";
  mappings?: SpanMapping[];
  /** Errors in the original content. */
  diagnostics?: MapperDiagnostic[];
};
