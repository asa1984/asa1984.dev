import { env } from "@/libs/env";

// The content repository is the single source of truth for articles and
// their images. The site pulls from it at request/revalidate time through
// the GitHub API; nothing is pushed into a database anymore.
const CONTENT_REPO = "asa1984/asa1984.dev-content";
const CONTENT_REF = "main";
const API_ROOT = `https://api.github.com/repos/${CONTENT_REPO}`;

// Every fetch below is cached in Next's data cache under this tag.
// Nothing invalidates the tag right now: the webhook receiver was removed
// (instant reflection is temporarily out of scope) and the interval below
// is the only freshness mechanism. The content repo's GitHub webhook is
// still configured and its deliveries just 404; the tag stays so a future
// receiver can revalidate it again.
export const CONTENT_CACHE_TAG = "content";

// Sole freshness mechanism: the data cache serves stale entries and
// refreshes them in the background after this interval, so a content push
// is visible within this window at the latest.
const CONTENT_REVALIDATE_SECONDS = 300;

const github_headers = (accept: string) => ({
  Accept: accept,
  Authorization: `Bearer ${env.CONTENT_GITHUB_TOKEN}`,
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "asa1984.dev",
});

const cache_options: { next: { revalidate: number; tags: string[] } } = {
  next: { revalidate: CONTENT_REVALIDATE_SECONDS, tags: [CONTENT_CACHE_TAG] },
};

const encode_path = (path: string) =>
  path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

/**
 * All blob paths in the content repository (e.g. "blog/first/post.md").
 *
 * One cached call serves every slug lookup, so requests for unknown slugs
 * are answered from cache without touching the GitHub API.
 */
export async function list_content_paths(): Promise<string[]> {
  // CI smoke builds run without a GitHub token and expect an empty site.
  if (process.env["ALLOW_EMPTY_CONTENT"] === "1") {
    return [];
  }

  const res = await fetch(`${API_ROOT}/git/trees/${CONTENT_REF}?recursive=1`, {
    headers: github_headers("application/vnd.github+json"),
    ...cache_options,
  });
  if (!res.ok) {
    throw new Error(`Failed to list content tree: ${String(res.status)}`);
  }
  const data = (await res.json()) as {
    tree: { path: string; type: string }[];
    truncated: boolean;
  };
  // Truncation starts at ~100k entries; treat it as corruption, not a page.
  if (data.truncated) {
    throw new Error("Content tree listing was truncated");
  }
  return data.tree.filter((entry) => entry.type === "blob").map((entry) => entry.path);
}

async function fetch_content_file(path: string): Promise<Response> {
  return fetch(`${API_ROOT}/contents/${encode_path(path)}?ref=${CONTENT_REF}`, {
    headers: github_headers("application/vnd.github.raw+json"),
    ...cache_options,
  });
}

export async function fetch_content_text(path: string): Promise<string> {
  const res = await fetch_content_file(path);
  if (!res.ok) {
    throw new Error(`Failed to fetch content file ${path}: ${String(res.status)}`);
  }
  return res.text();
}

export async function fetch_content_binary(path: string): Promise<ArrayBuffer | null> {
  if (process.env["ALLOW_EMPTY_CONTENT"] === "1") {
    return null;
  }
  const res = await fetch_content_file(path);
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch content file ${path}: ${String(res.status)}`);
  }
  return res.arrayBuffer();
}
