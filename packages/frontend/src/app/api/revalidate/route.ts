import { revalidateTag } from "next/cache";
import { CONTENT_CACHE_TAG } from "@/features/content/github";
import { env } from "@/libs/env";

// GitHub-native webhook receiver: the content repository's repo webhook
// POSTs push events here directly — no CI in between. Authenticity is
// GitHub's standard HMAC signature over the raw body. Missed deliveries
// (GitHub does not auto-retry) are covered by the 1-hour revalidate
// fallback on every content fetch.

const encoder = new TextEncoder();

function hex_to_bytes(hex: string): Uint8Array | null {
  if (hex.length % 2 !== 0 || /[^0-9a-f]/.test(hex)) return null;
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

async function verify_signature(
  body: string,
  header: string | null,
): Promise<boolean> {
  if (!header?.startsWith("sha256=")) return false;
  const signature = hex_to_bytes(header.slice("sha256=".length));
  if (!signature) return false;
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(env.CONTENT_WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  // crypto.subtle.verify is constant-time, unlike comparing hex strings.
  return crypto.subtle.verify(
    "HMAC",
    key,
    signature as unknown as ArrayBuffer,
    encoder.encode(body),
  );
}

export async function POST(req: Request) {
  const body = await req.text();
  const valid = await verify_signature(
    body,
    req.headers.get("x-hub-signature-256"),
  );
  if (!valid) {
    return new Response("Unauthorized", { status: 401 });
  }

  const event = req.headers.get("x-github-event");
  if (event === "ping") {
    return Response.json({ ok: true });
  }
  if (event !== "push") {
    return Response.json({ ok: true, ignored: event });
  }
  const payload = JSON.parse(body) as { ref?: string };
  if (payload.ref !== "refs/heads/main") {
    return Response.json({ ok: true, ignored: payload.ref });
  }

  revalidateTag(CONTENT_CACHE_TAG, "max");
  return Response.json({ ok: true });
}
