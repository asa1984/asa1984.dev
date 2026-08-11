/**
 * One-off: export production D1 content + R2 images into a content
 * repository layout (blog/<slug>/post.md + images, context/<slug>/...).
 *
 * Usage:
 *   BACKEND_URL=... BACKEND_API_TOKEN=... EXPORT_DIR=... \
 *     pnpm --filter @asa1984.dev/cli exec tsx export-content.ts
 *
 * Not part of the package; delete after the migration.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { stringify } from "yaml";
import { BackendClient } from "./src/api";
import { imageKey } from "./src/image-key";

const url = process.env.BACKEND_URL;
const token = process.env.BACKEND_API_TOKEN;
const exportDir = process.env.EXPORT_DIR;
if (!url || !token || !exportDir) {
  console.error("Missing BACKEND_URL / BACKEND_API_TOKEN / EXPORT_DIR");
  process.exit(1);
}

// Markdown embeds reference images as "./<file>" (markdown syntax or raw
// <img src="./...">); the frontend rewrites them to delivery URLs.
const extractImageRefs = (content: string): string[] => {
  const refs = new Set<string>();
  for (const m of content.matchAll(/!\[[^\]]*\]\(\.\/([^)\s]+)\)/g)) {
    refs.add(m[1]!);
  }
  for (const m of content.matchAll(/src="\.\/([^"]+)"/g)) {
    refs.add(m[1]!);
  }
  return [...refs];
};

const client = new BackendClient(url, token);
const warnings: string[] = [];

async function downloadImage(
  kind: "blog" | "context",
  slug: string,
  file: string,
  dir: string,
): Promise<void> {
  const key = imageKey(kind, slug, file);
  const res = await fetch(`${url}/image/delivery/${key}`);
  if (!res.ok) {
    warnings.push(`${kind}/${slug}/${file}: delivery returned ${res.status}`);
    return;
  }
  writeFileSync(join(dir, file), Buffer.from(await res.arrayBuffer()));
}

async function main() {
  const [blogs, contexts] = await Promise.all([
    client.blogs(),
    client.contexts(),
  ]);

  for (const blog of blogs) {
    const dir = join(exportDir!, "blog", blog.slug);
    mkdirSync(dir, { recursive: true });
    const frontmatter = stringify({
      title: blog.title,
      image: blog.image,
      description: blog.description,
      published: blog.published,
    });
    writeFileSync(join(dir, "post.md"), `---\n${frontmatter}---\n${blog.content}`);
    const files = new Set([blog.image, ...extractImageRefs(blog.content)]);
    for (const file of files) await downloadImage("blog", blog.slug, file, dir);
    console.log(`blog/${blog.slug}: ${files.size} image(s)`);
  }

  for (const context of contexts) {
    const dir = join(exportDir!, "context", context.slug);
    mkdirSync(dir, { recursive: true });
    const frontmatter = stringify({
      title: context.title,
      emoji: context.emoji,
      published: context.published,
    });
    writeFileSync(
      join(dir, "post.md"),
      `---\n${frontmatter}---\n${context.content}`,
    );
    const files = extractImageRefs(context.content);
    for (const file of files) {
      await downloadImage("context", context.slug, file, dir);
    }
    console.log(`context/${context.slug}: ${files.length} image(s)`);
  }

  console.log(`\nExported ${blogs.length} blogs, ${contexts.length} contexts`);
  if (warnings.length > 0) {
    console.log("\nWarnings:");
    for (const w of warnings) console.log(`  - ${w}`);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
