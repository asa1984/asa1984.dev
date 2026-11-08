import type { Readable, Writable } from "node:stream";

/**
 * A JSON-RPC server with the LSP base protocol's framing (`Content-Length` headers), which is how
 * TypeScript talks to content mappers over stdio. TypeScript sends every request; the mapper only
 * answers, so there are no notifications or outgoing requests to support.
 */

type Request = {
  jsonrpc: "2.0";
  id: number | string;
  method: string;
  params?: unknown;
};

export class RpcError extends Error {
  readonly code: number;

  constructor(code: number, message: string) {
    super(message);
    this.name = "RpcError";
    this.code = code;
  }
}

export const ErrorCodes = {
  MethodNotFound: -32_601,
  InvalidParams: -32_602,
  InternalError: -32_603,
} as const;

export type Handlers = Record<string, (params: never) => unknown>;

const SEPARATOR = Buffer.from("\r\n\r\n");

/** Splits a byte stream into the JSON bodies of `Content-Length`-framed messages. */
export const createFrameReader = (onMessage: (body: string) => void) => {
  let buffer = Buffer.alloc(0);
  return (chunk: Buffer) => {
    buffer = Buffer.concat([buffer, chunk]);
    for (;;) {
      const end = buffer.indexOf(SEPARATOR);
      if (end === -1) {
        return;
      }
      const header = buffer.subarray(0, end).toString("ascii");
      const length = /content-length:\s*(\d+)/iu.exec(header)?.[1];
      if (length === undefined) {
        throw new Error(`Missing Content-Length header: ${header}`);
      }
      const start = end + SEPARATOR.length;
      if (buffer.length < start + Number(length)) {
        return;
      }
      onMessage(buffer.subarray(start, start + Number(length)).toString("utf8"));
      buffer = buffer.subarray(start + Number(length));
    }
  };
};

export const frame = (message: unknown) => {
  const body = Buffer.from(JSON.stringify(message), "utf8");
  return Buffer.concat([Buffer.from(`Content-Length: ${body.length}\r\n\r\n`, "ascii"), body]);
};

/** Reads a request out of a message body. Without an id it is a notification, which needs no answer. */
const parseRequest = (body: string): Request | undefined => {
  const message: unknown = JSON.parse(body);
  if (
    typeof message === "object" &&
    message !== null &&
    "id" in message &&
    "method" in message &&
    (typeof message.id === "number" || typeof message.id === "string") &&
    typeof message.method === "string"
  ) {
    const params = "params" in message ? message.params : undefined;
    return { jsonrpc: "2.0", id: message.id, method: message.method, params };
  }
  return undefined;
};

/** Answers each request with its handler's result, or with the error the handler throws. */
export const serve = (handlers: Handlers, input: Readable, output: Writable) => {
  const respond = async (request: Request) => {
    const handler = handlers[request.method];
    try {
      if (handler === undefined) {
        throw new RpcError(ErrorCodes.MethodNotFound, `Unknown method: ${request.method}`);
      }
      // Each handler declares the params the protocol defines for its method, and TypeScript is
      // the only client, so the params are taken as they come.
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion
      const result = await handler(request.params as never);
      output.write(frame({ jsonrpc: "2.0", id: request.id, result: result ?? null }));
    } catch (error) {
      const code = error instanceof RpcError ? error.code : ErrorCodes.InternalError;
      const message = error instanceof Error ? error.message : String(error);
      output.write(frame({ jsonrpc: "2.0", id: request.id, error: { code, message } }));
    }
  };
  input.on(
    "data",
    createFrameReader((body) => {
      const request = parseRequest(body);
      if (request !== undefined) {
        void respond(request);
      }
    }),
  );
};
