import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadBlogs, loadContexts } from "./content";

let contentDir: string;

beforeEach(() => {
  contentDir = mkdtempSync(join(tmpdir(), "cli-content-"));
});

afterEach(() => {
  rmSync(contentDir, { recursive: true, force: true });
});

/** Writes `files` (relative paths) under `content/<kind>/<slug>/`. */
function writePost(
  kind: "blog" | "context",
  slug: string,
  source: string,
  files: string[] = [],
): string {
  const dir = join(contentDir, kind, slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "post.md"), source);
  for (const file of files) writeFileSync(join(dir, file), file);
  return dir;
}

const blogSource = (overrides: Partial<Record<string, string>> = {}) =>
  [
    "---",
    `title: ${overrides.title ?? "Hello"}`,
    `image: ${overrides.image ?? "cover.png"}`,
    `description: ${overrides.description ?? "A post"}`,
    `published: ${overrides.published ?? "true"}`,
    "---",
    "# Body",
  ].join("\n");

const contextSource = (overrides: Partial<Record<string, string>> = {}) =>
  [
    "---",
    `title: ${overrides.title ?? "Nix"}`,
    `emoji: ${overrides.emoji ?? "❄️"}`,
    `published: ${overrides.published ?? "true"}`,
    "---",
    "# Body",
  ].join("\n");

describe("loadBlogs", () => {
  it("loads a blog directory into a LocalBlog", () => {
    const dir = writePost("blog", "hello", blogSource(), ["cover.png"]);
    expect(loadBlogs(contentDir)).toEqual([
      {
        slug: "hello",
        title: "Hello",
        image: "cover.png",
        description: "A post",
        published: true,
        content: "# Body",
        images: ["cover.png"],
        dir,
      },
    ]);
  });

  it("carries the optional frontmatter date", () => {
    const source = [
      "---",
      "title: Hello",
      "image: cover.png",
      "description: A post",
      "published: true",
      "date: 2024-01-15 10:30:00",
      "---",
      "# Body",
    ].join("\n");
    writePost("blog", "hello", source, ["cover.png"]);
    expect(loadBlogs(contentDir)[0]?.date).toBe("2024-01-15 10:30:00");
  });

  it("does not treat post.md as an image", () => {
    writePost("blog", "hello", blogSource(), ["cover.png"]);
    const [blog] = loadBlogs(contentDir);
    expect(blog?.images).toEqual(["cover.png"]);
    expect(blog?.images).not.toContain("post.md");
  });

  it("sorts slugs and image file names", () => {
    writePost("blog", "b-post", blogSource(), ["cover.png", "a.png", "z.png"]);
    writePost("blog", "a-post", blogSource(), ["cover.png"]);
    expect(loadBlogs(contentDir).map((blog) => blog.slug)).toEqual([
      "a-post",
      "b-post",
    ]);
    expect(loadBlogs(contentDir)[1]?.images).toEqual([
      "a.png",
      "cover.png",
      "z.png",
    ]);
  });

  it("keeps unpublished posts (the backend filters on read)", () => {
    writePost("blog", "draft", blogSource({ published: "false" }), [
      "cover.png",
    ]);
    expect(loadBlogs(contentDir)[0]?.published).toBe(false);
  });

  it("throws when the frontmatter image is not in the directory", () => {
    writePost("blog", "hello", blogSource({ image: "missing.png" }), [
      "cover.png",
    ]);
    expect(() => loadBlogs(contentDir)).toThrow(
      'blog/hello: image "missing.png" does not exist',
    );
  });

  it("reports the offending file when the frontmatter is invalid", () => {
    writePost("blog", "hello", "no frontmatter here", ["cover.png"]);
    expect(() => loadBlogs(contentDir)).toThrow("blog/hello/post.md");
  });

  it("returns an empty array when there is no blog directory", () => {
    expect(loadBlogs(contentDir)).toEqual([]);
  });
});

describe("loadContexts", () => {
  it("loads a context directory into a LocalContext", () => {
    const dir = writePost("context", "nix", contextSource(), ["setup.webp"]);
    expect(loadContexts(contentDir)).toEqual([
      {
        slug: "nix",
        title: "Nix",
        emoji: "❄️",
        published: true,
        content: "# Body",
        images: ["setup.webp"],
        dir,
      },
    ]);
  });

  it("does not require the images to be referenced by the frontmatter", () => {
    writePost("context", "nix", contextSource(), []);
    expect(loadContexts(contentDir)[0]?.images).toEqual([]);
  });

  it("does not treat post.md as an image", () => {
    writePost("context", "nix", contextSource(), ["setup.webp"]);
    expect(loadContexts(contentDir)[0]?.images).toEqual(["setup.webp"]);
  });

  it("reports the offending file when the frontmatter is invalid", () => {
    writePost("context", "nix", contextSource({ emoji: '""' }));
    expect(() => loadContexts(contentDir)).toThrow("context/nix/post.md");
  });

  it("returns an empty array when there is no context directory", () => {
    expect(loadContexts(contentDir)).toEqual([]);
  });

  it("ignores the blog directory", () => {
    writePost("blog", "hello", blogSource(), ["cover.png"]);
    expect(loadContexts(contentDir)).toEqual([]);
  });
});
