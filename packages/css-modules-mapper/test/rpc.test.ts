import { PassThrough } from "node:stream";

import { describe, expect, test } from "vite-plus/test";

import { createFrameReader, ErrorCodes, frame, RpcError, serve } from "../src/rpc.ts";

/** Sends one framed request to a server and resolves with the parsed response. */
const call = (handlers: Parameters<typeof serve>[0], request: object) => {
  const input = new PassThrough();
  const output = new PassThrough();
  serve(handlers, input, output);
  const response = new Promise<unknown>((resolve) => {
    output.on(
      "data",
      createFrameReader((body) => {
        resolve(JSON.parse(body));
      }),
    );
  });
  input.write(frame({ jsonrpc: "2.0", ...request }));
  return response;
};

describe("createFrameReader", () => {
  test("reassembles messages split across chunks and separates ones sent together", () => {
    const bodies: unknown[] = [];
    const read = createFrameReader((body) => {
      bodies.push(JSON.parse(body));
    });
    const both = Buffer.concat([frame({ a: "日本語" }), frame({ b: 2 })]);

    read(both.subarray(0, 10));
    read(both.subarray(10, 30));
    read(both.subarray(30));

    expect(bodies).toStrictEqual([{ a: "日本語" }, { b: 2 }]);
  });
});

describe("serve", () => {
  test("answers a request with its handler's result", async () => {
    const handlers = { echo: (params: { value: number }) => params.value * 2 };

    const response = await call(handlers, { id: 1, method: "echo", params: { value: 21 } });

    expect(response).toStrictEqual({ jsonrpc: "2.0", id: 1, result: 42 });
  });

  test("answers with the error a handler throws", async () => {
    const handlers = {
      fail: () => {
        throw new RpcError(ErrorCodes.InvalidParams, "bad");
      },
    };

    const response = await call(handlers, { id: "a", method: "fail" });

    expect(response).toStrictEqual({
      jsonrpc: "2.0",
      id: "a",
      error: { code: ErrorCodes.InvalidParams, message: "bad" },
    });
  });

  test("answers an unknown method with MethodNotFound", async () => {
    const response = await call({}, { id: "b", method: "nope" });

    expect(response).toMatchObject({ error: { code: ErrorCodes.MethodNotFound } });
  });
});
