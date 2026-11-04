import { describe, expect, test } from "vite-plus/test";
import { ZodError, z } from "zod";

import { parsePosts, splitFrontmatter } from "./content.ts";

const schema = z.object({
  title: z.string().min(1),
  date: z.coerce.date(),
});

const post = ({ title = "タイトル", date = "2023-10-23T00:00:00.000Z" } = {}) =>
  `---
title: ${title}
date: ${date}
---

本文`;

describe("splitFrontmatter", () => {
  test("frontmatter と本文を分ける", () => {
    expect(splitFrontmatter("---\ntitle: a\n---\nbody")).toStrictEqual({
      header: "title: a",
      body: "body",
    });
  });

  test("frontmatter がなければ失敗する", () => {
    expect(() => splitFrontmatter("body")).toThrow('Missing beginning "---"');
  });

  test("frontmatter が閉じていなければ失敗する", () => {
    expect(() => splitFrontmatter("---\ntitle: a\nbody")).toThrow('Missing ending "---"');
  });
});

describe("parsePosts", () => {
  test("ディレクトリ名を slug にして frontmatter と本文を読む", () => {
    const [parsed] = parsePosts({ sources: { "../contents/blog/first/index.md": post() }, schema });

    expect(parsed?.slug).toBe("first");
    expect(parsed?.frontmatter.title).toBe("タイトル");
    expect(parsed?.frontmatter.date.toISOString()).toBe("2023-10-23T00:00:00.000Z");
    expect(parsed?.body.trim()).toBe("本文");
  });

  test("新しい記事が先頭に来る", () => {
    const posts = parsePosts({
      sources: {
        "../contents/blog/old/index.md": post({ date: "2022-01-01T00:00:00.000Z" }),
        "../contents/blog/new/index.md": post({ date: "2024-06-01T00:00:00.000Z" }),
      },
      schema,
    });

    expect(posts.map((p) => p.slug)).toStrictEqual(["new", "old"]);
  });

  test("frontmatter が不正なら失敗する", () => {
    expect(() =>
      parsePosts({
        sources: { "../contents/blog/broken/index.md": "---\ntitle: a\n---\n本文" },
        schema,
      }),
    ).toThrow(ZodError);
  });
});
