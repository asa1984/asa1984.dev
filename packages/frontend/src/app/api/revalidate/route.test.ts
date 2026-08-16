import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

const revalidateTag = vi.fn<(tag: string, profile?: string) => void>();
vi.mock("next/cache", () => ({
  revalidateTag: (tag: string, profile?: string) => {
    revalidateTag(tag, profile);
  },
}));

const SECRET = "test-webhook-secret";

const sign = (body: string, secret = SECRET) =>
  `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;

const request = (body: string, { event = "push", signature = sign(body) } = {}) =>
  new Request("http://site.test/api/revalidate", {
    method: "POST",
    headers: {
      "x-github-event": event,
      "x-hub-signature-256": signature,
    },
    body,
  });

const push_body = JSON.stringify({ ref: "refs/heads/main" });

beforeEach(() => {
  vi.stubEnv("CONTENT_WEBHOOK_SECRET", SECRET);
});

afterEach(() => {
  vi.unstubAllEnvs();
  revalidateTag.mockReset();
});

describe("POST /api/revalidate", () => {
  it("main への push で content タグを revalidate する", async () => {
    const res = await POST(request(push_body));

    expect(res.status).toBe(200);
    expect(revalidateTag).toHaveBeenCalledWith("content", "max");
  });

  it("署名が不正なら 401 を返し revalidate しない", async () => {
    const res = await POST(request(push_body, { signature: sign(push_body, "wrong-secret") }));

    expect(res.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("署名ヘッダがなければ 401 を返す", async () => {
    const res = await POST(
      new Request("http://site.test/api/revalidate", {
        method: "POST",
        body: push_body,
      }),
    );

    expect(res.status).toBe(401);
  });

  it("ping イベントは 200 を返すが revalidate しない", async () => {
    const res = await POST(request("{}", { event: "ping" }));

    expect(res.status).toBe(200);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("main 以外の ref への push は無視する", async () => {
    const body = JSON.stringify({ ref: "refs/heads/feature" });
    const res = await POST(request(body));

    expect(res.status).toBe(200);
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
