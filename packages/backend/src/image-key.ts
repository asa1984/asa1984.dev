import { sha256 } from "hono/utils/crypto";

/**
 * Single source of truth for R2 image object keys.
 *
 * The key is sha256(`{content}/{slug}/{file}`), where `content` is the content
 * kind ("blog" etc.), `slug` is the content slug, and `file` is the image file
 * name. Producers and consumers of this contract:
 * - upload: POST /api/image/upload/:content/:slug/:file (image.route.ts) derives
 *   the key from its path params
 * - delivery: the frontend derives the key with this function to build
 *   /image/delivery/:key URLs
 * - sync: packages/cli/src/image-key.ts reimplements the same hash with
 *   node:crypto (this package is not importable from plain Node) to reconcile
 *   R2 against the content repository — keep the two in sync
 */
export const imageKey = (
  content: string,
  slug: string,
  file: string,
): Promise<string | null> => sha256(`${content}/${slug}/${file}`);
