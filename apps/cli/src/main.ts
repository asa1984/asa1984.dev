import * as fs from "fs/promises";
import { kvsEnvStorage } from "@kvs/env";
import { createHash } from "crypto";
import { createClient } from "@asa1984.dev/api";
import matter from "gray-matter";
import { string, object, parse, boolean, emoji } from "valibot";

async function main() {
  await postBlogs();
  await postContexts();
  console.log("Done!");
}
main();

const client = createClient({
  baseUrl: process.env.API_URL ?? "http://localhost:8080",
  token: process.env.API_TOKEN ?? "token",
});

const kv = await kvsEnvStorage({
  name: "post-history",
  version: 1,
});

const sha256 = (input: string) => {
  const hash = createHash("sha256");
  hash.update(input);
  return hash.digest("hex");
};

const blogFrontmatterSchema = object({
  title: string(),
  image: string(),
  description: string(),
  published: boolean(),
});

async function postBlogs() {
  const { posts, images } = await detectModifiedFiles("blog");
  for (const { path, slug } of posts) {
    const text = await fs.readFile(path, "utf-8");
    const { data, content } = matter(text);
    const meta = parse(blogFrontmatterSchema, data);
    const resp = await client.api.blogs[":slug"].$post({
      param: {
        slug,
      },
      json: {
        ...meta,
        content,
      },
    });
    if (resp.status !== 200) throw new Error(resp.statusText);
    await kv.set(path, sha256(text));
    const { slug: postedSlug } = await resp.json();
    console.log(`Posted: ${postedSlug}`);
  }
  for (const image of images) {
    const key = image;
    const img = await fs.readFile(image);
    const body = img.toString("base64");
    const resp = await client.api.image.upload.$post({
      json: {
        key,
        body,
      },
    });
    if (resp.status !== 200) throw new Error(resp.statusText);
    await kv.set(image, sha256(body));
    const uploadedKey = await resp.text();
    console.log(`Uploaded: ${uploadedKey}`);
  }
}

const contextFrontmatterSchema = object({
  title: string(),
  emoji: string([emoji()]),
  published: boolean(),
});

async function postContexts() {
  const { posts, images } = await detectModifiedFiles("context");
  for (const { path, slug } of posts) {
    const text = await fs.readFile(path, "utf-8");
    const { data, content } = matter(text);
    const meta = parse(contextFrontmatterSchema, data);
    const resp = await client.api.contexts[":slug"].$post({
      param: {
        slug,
      },
      json: {
        ...meta,
        content,
      },
    });
    if (resp.status !== 200) throw new Error(resp.statusText);
    await kv.set(path, sha256(text));
    const { slug: postedSlug } = await resp.json();
    console.log(`Posted: ${postedSlug}`);
  }
  for (const image of images) {
    const key = image;
    const img = await fs.readFile(image);
    const body = img.toString("base64");
    const resp = await client.api.image.upload.$post({
      json: {
        key,
        body,
      },
    });
    if (resp.status !== 200) throw new Error(resp.statusText);
    await kv.set(image, sha256(body));
    const uploadedKey = await resp.text();
    console.log(`Uploaded: ${uploadedKey}`);
  }
}

async function detectModifiedFiles(rootDir: string) {
  const entries = await fs.readdir(rootDir, { withFileTypes: true });
  const postDirs = entries.filter((entry) => entry.isDirectory());

  const posts: {
    path: string;
    slug: string;
  }[] = [];
  const images: string[] = [];

  for (const postDir of postDirs) {
    const entries = await fs.readdir(`${rootDir}/${postDir.name}`, {
      withFileTypes: true,
    });
    const files = entries.filter((entry) => entry.isFile());

    let postMd: string | undefined = undefined;
    for (const file of files) {
      if (file.name === "post.md")
        postMd
          ? () => {
              throw new Error("post.md is duplicated");
            }
          : (postMd = `${rootDir}/${postDir.name}/${file.name}`);
      else images.push(`${rootDir}/${postDir.name}/${file.name}`);
    }
    if (!postMd) throw new Error("post.md is not found");
    posts.push({
      path: postMd,
      slug: postDir.name,
    });
  }

  const modifiedPosts: {
    path: string;
    slug: string;
  }[] = [];
  for (const post of posts) {
    const text = await fs.readFile(post.path, "utf-8");
    const hash = sha256(text);
    const prevHash = await kv.get(post.path);
    if (prevHash !== hash) modifiedPosts.push(post);
  }

  const newImages: string[] = [];
  for (const image of images) {
    const buffer = await fs.readFile(image);
    const hash = sha256(buffer.toString("base64"));
    const prevHash = await kv.get(image);
    if (prevHash !== hash) newImages.push(image);
  }

  return {
    posts: modifiedPosts,
    images: newImages,
  };
}
