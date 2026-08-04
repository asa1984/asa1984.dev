import { sha256 } from "hono/utils/crypto";

/**
 * Single source of truth for R2 image object keys.
 *
 * The key is sha256(`{content}/{slug}/{file}`), where `content` is the content
 * kind ("blog" etc.), `slug` is the content slug, and `file` is the image file
 * name. Producers and consumers of this contract:
 * - upload: POST /api/image/upload/:content/:slug/:file (image.route.ts) derives
 *   the key from its path params; the CLI (rest.rs) hits this endpoint with the
 *   same three segments and never hashes on its side
 * - delivery: the frontend derives the key with this function to build
 *   /image/delivery/:key URLs
 */
export const imageKey = (
  content: string,
  slug: string,
  file: string,
): Promise<string | null> => sha256(`${content}/${slug}/${file}`);
