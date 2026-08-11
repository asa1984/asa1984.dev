import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { BackendClient } from "./api";
import { loadBlogs, loadContexts } from "./content";
import { collectLocalImages, isEmptyPlan, planSync } from "./sync";

const USAGE = `Usage: cli sync [options]

Reconciles the backend (D1 + R2) with a content directory:
upserts new/changed posts, uploads new/changed images, and deletes
posts and images that no longer exist in the directory.

Options:
  --dir <path>      Content directory containing blog/ and context/ (default: .)
  --server <url>    Backend URL (default: https://api.asa1984.dev)
  --token <token>   Bearer token (default: $BACKEND_API_TOKEN)
  --dry-run         Print the plan without executing it
  --allow-empty     Allow syncing an empty content directory (deletes everything)`;

async function main() {
  // pnpm forwards script arguments behind a literal "--", which parseArgs
  // would treat as an option terminator — silently turning every option
  // (including --dry-run) into an ignored positional. Strip the first one.
  const args = process.argv.slice(2);
  const separator = args.indexOf("--");
  if (separator !== -1) args.splice(separator, 1);

  const { values, positionals } = parseArgs({
    args,
    allowPositionals: true,
    options: {
      dir: { type: "string", default: "." },
      server: { type: "string", default: "https://api.asa1984.dev" },
      token: { type: "string" },
      "dry-run": { type: "boolean", default: false },
      "allow-empty": { type: "boolean", default: false },
    },
  });

  if (positionals.length !== 1 || positionals[0] !== "sync") {
    console.error(USAGE);
    process.exit(1);
  }
  const token = values.token ?? process.env.BACKEND_API_TOKEN;
  if (!token) {
    console.error("Missing token: pass --token or set BACKEND_API_TOKEN");
    process.exit(1);
  }

  const client = new BackendClient(values.server, token);

  const localBlogs = loadBlogs(values.dir);
  const localContexts = loadContexts(values.dir);
  const localImages = collectLocalImages(localBlogs, localContexts, (path) =>
    createHash("md5").update(readFileSync(path)).digest("hex"),
  );
  const [remoteBlogs, remoteContexts, remoteImages] = await Promise.all([
    client.blogs(),
    client.contexts(),
    client.listImages(),
  ]);

  // A missing or wrong --dir must not be able to wipe the backend.
  const localEmpty = localBlogs.length === 0 && localContexts.length === 0;
  const remoteEmpty = remoteBlogs.length === 0 && remoteContexts.length === 0;
  if (localEmpty && !remoteEmpty && !values["allow-empty"]) {
    console.error(
      `No content found in ${values.dir} but the backend is not empty. ` +
        "Refusing to delete everything; pass --allow-empty if this is intended.",
    );
    process.exit(1);
  }

  const plan = planSync({
    localBlogs,
    localContexts,
    localImages,
    remoteBlogs,
    remoteContexts,
    remoteImages,
  });

  if (isEmptyPlan(plan)) {
    console.log("Already in sync");
    return;
  }

  for (const image of plan.imageUploads) {
    console.log(`upload image: ${image.content}/${image.slug}/${image.file}`);
  }
  for (const blog of plan.blogUpserts) console.log(`upsert blog: ${blog.slug}`);
  for (const context of plan.contextUpserts) {
    console.log(`upsert context: ${context.slug}`);
  }
  for (const slug of plan.blogDeletes) console.log(`delete blog: ${slug}`);
  for (const slug of plan.contextDeletes) {
    console.log(`delete context: ${slug}`);
  }
  for (const key of plan.imageDeletes) console.log(`delete image: ${key}`);

  if (values["dry-run"]) {
    console.log("Dry run: no changes applied");
    return;
  }

  // Upload images before upserting posts so that a revalidated page never
  // references an image that is not in R2 yet. Deletions come last.
  for (const image of plan.imageUploads) {
    await client.uploadImage(
      image.content,
      image.slug,
      image.file,
      readFileSync(image.path),
    );
  }
  for (const blog of plan.blogUpserts) {
    await client.upsertBlog({
      slug: blog.slug,
      title: blog.title,
      image: blog.image,
      description: blog.description,
      content: blog.content,
      published: blog.published,
    });
  }
  for (const context of plan.contextUpserts) {
    await client.upsertContext({
      slug: context.slug,
      title: context.title,
      emoji: context.emoji,
      content: context.content,
      published: context.published,
    });
  }
  for (const slug of plan.blogDeletes) await client.deleteBlog(slug);
  for (const slug of plan.contextDeletes) await client.deleteContext(slug);
  for (const key of plan.imageDeletes) await client.deleteImage(key);

  console.log("Synced");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
