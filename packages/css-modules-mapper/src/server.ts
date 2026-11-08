/**
 * The process TypeScript spawns for `*.module.css` files, as declared in package.json.
 *
 * TypeScript identifies a mapper by its package name and version, plus its `options`. When the
 * transform changes, bump the version in package.json, or run `tsc --force`, so incremental builds
 * transform the stylesheets again.
 */

import type {
  CloseProjectParams,
  InitializeParams,
  InitializeResult,
  OpenProjectParams,
  OpenProjectResult,
  TransformParams,
  TransformResult,
} from "./protocol.ts";
import { ErrorCodes, RpcError, serve } from "./rpc.ts";
import { transform } from "./transform.ts";

const projects = new Set<string>();

serve(
  {
    initialize: (params: InitializeParams): InitializeResult => {
      // JavaScript strings index by UTF-16 code units, so offsets need no conversion.
      if (!params.positionEncodings.includes("utf-16")) {
        throw new RpcError(ErrorCodes.InvalidParams, "The host does not support UTF-16 positions");
      }
      return { positionEncoding: "utf-16", diagnosticSource: "css-modules" };
    },
    // The mapper takes no options: its CSS Modules settings are the ones the build uses.
    openProject: (params: OpenProjectParams): OpenProjectResult => {
      projects.add(params.projectHandle);
      const optionDiagnostics = Object.keys(params.options ?? {}).map((key) => ({
        path: [key],
        messageText: `Unknown option '${key}': the CSS Modules settings come from the build`,
        code: 1000,
      }));
      return optionDiagnostics.length > 0 ? { optionDiagnostics } : {};
    },
    closeProject: (params: CloseProjectParams) => {
      projects.delete(params.projectHandle);
      return null;
    },
    transform: (params: TransformParams): TransformResult => {
      if (!projects.has(params.projectHandle)) {
        throw new RpcError(ErrorCodes.InvalidParams, `Unknown project: ${params.projectHandle}`);
      }
      return transform(params.fileName, params.content);
    },
  },
  process.stdin,
  process.stdout,
);
