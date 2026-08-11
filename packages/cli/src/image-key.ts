import { createHash } from "node:crypto";

/**
 * R2 object key for an image. Must stay in sync with
 * packages/backend/src/image-key.ts — the backend computes the same
 * sha256("content/slug/file") on upload and delivery.
 */
export const imageKey = (content: string, slug: string, file: string): string =>
  createHash("sha256").update(`${content}/${slug}/${file}`).digest("hex");
