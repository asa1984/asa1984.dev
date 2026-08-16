import { fetch_content_binary } from "@/features/content/github";

// Serves images straight out of the content repository (the role the
// backend's /image/delivery/:key endpoint used to play, minus the sha256
// indirection). The GitHub fetch inside is cached in the data cache under
// the "content" tag, so a content push refreshes images the same way it
// refreshes articles.

const CONTENT_TYPES: Record<string, string> = {
  avif: "image/avif",
  gif: "image/gif",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
  webp: "image/webp",
};

export async function GET(
  _req: Request,
  props: { params: Promise<{ type: string; slug: string; file: string }> },
) {
  const { type, slug, file } = await props.params;

  if (type !== "blog" && type !== "context") {
    return new Response("Not Found", { status: 404 });
  }
  const extension = file.split(".").at(-1)?.toLowerCase();
  const content_type = extension === undefined ? undefined : CONTENT_TYPES[extension];
  if (content_type === undefined) {
    return new Response("Not Found", { status: 404 });
  }

  // Route params arrive percent-decoded; a segment can therefore not smuggle
  // a "/" past the router, but reject dot segments defensively anyway.
  if (slug.includes("..") || file.includes("..")) {
    return new Response("Not Found", { status: 404 });
  }

  const body = await fetch_content_binary(`${type}/${slug}/${file}`);
  if (body === null) {
    return new Response("Not Found", { status: 404 });
  }

  return new Response(body, {
    headers: {
      "Content-Type": content_type,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
