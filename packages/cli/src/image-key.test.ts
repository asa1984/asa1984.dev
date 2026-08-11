import { describe, expect, it } from "vitest";
import { imageKey } from "./image-key";

/**
 * `imageKey` is deliberately duplicated in packages/backend/src/image-key.ts
 * (Web Crypto there, node:crypto here). A drift between the two silently
 * orphans every R2 object, so the hash is pinned to a literal value.
 */
describe("imageKey (contract shared with packages/backend/src/image-key.ts)", () => {
  it("hashes content/slug/file with sha256, matching the backend implementation", () => {
    // printf "blog/hello/a.png" | shasum -a 256
    expect(imageKey("blog", "hello", "a.png")).toBe(
      "834f3281cf719402abf26441d1c46b6eb35de610de51e575c8df8180947ec2d3",
    );
  });

  it("agrees with Web Crypto sha256, the primitive the backend uses", async () => {
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode("context/nix/setup.webp"),
    );
    const hex = [...new Uint8Array(digest)]
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
    expect(imageKey("context", "nix", "setup.webp")).toBe(hex);
  });

  it("distinguishes the content kind, the slug and the file name", () => {
    const keys = new Set([
      imageKey("blog", "hello", "a.png"),
      imageKey("context", "hello", "a.png"),
      imageKey("blog", "hello2", "a.png"),
      imageKey("blog", "hello", "b.png"),
    ]);
    expect(keys.size).toBe(4);
  });
});
