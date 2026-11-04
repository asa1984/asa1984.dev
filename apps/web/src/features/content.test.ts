import { describe, expect, test } from "vite-plus/test";
import { ZodError, z } from "zod";

import {
  assetFileNameSchema,
  instantSchema,
  slugSchema,
  paginate,
  parsePosts,
  postAssetPath,
  splitFrontmatter,
} from "./content.ts";

const schema = z.object({
  title: z.string().min(1),
  date: instantSchema,
});

const post = ({ title = "タイトル", date = "2023-10-23T00:00:00.000Z" } = {}) =>
  `---
title: ${title}
date: ${date}
---

本文`;

describe("slugSchema", () => {
  test.each(["first", "fp-matsuri-2026", "lookback2023"])("%s を受け付ける", (slug) => {
    expect(slugSchema.safeParse(slug).success).toBe(true);
  });

  test.each(["", "First", "a_b", "-a", "a-", "a--b", "../a", "a/b"])("%j を拒む", (slug) => {
    expect(slugSchema.safeParse(slug).success).toBe(false);
  });
});

describe("assetFileNameSchema", () => {
  test.each(["first.webp", "photo-1.png"])("%s を受け付ける", (name) => {
    expect(assetFileNameSchema.safeParse(name).success).toBe(true);
  });

  test.each(["", ".", "..", "a/b.png", "../a.png"])("%j を拒む", (name) => {
    expect(assetFileNameSchema.safeParse(name).success).toBe(false);
  });
});

describe("instantSchema", () => {
  test("オフセット付きの ISO 8601 を Temporal.Instant にする", () => {
    expect(instantSchema.parse("2022-11-16T00:00:00+09:00").toString()).toBe(
      "2022-11-15T15:00:00Z",
    );
  });

  test("オフセットのない日時を拒む", () => {
    expect(instantSchema.safeParse("2022-11-16T00:00:00").success).toBe(false);
  });
});

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

    expect(parsed?.meta.slug).toBe("first");
    expect(parsed?.meta.title).toBe("タイトル");
    expect(parsed?.meta.date.toString()).toBe("2023-10-23T00:00:00Z");
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

    expect(posts.map(({ meta }) => meta.slug)).toStrictEqual(["new", "old"]);
  });

  test("frontmatter が不正なら失敗する", () => {
    expect(() =>
      parsePosts({
        sources: { "../contents/blog/broken/index.md": "---\ntitle: a\n---\n本文" },
        schema,
      }),
    ).toThrow(ZodError);
  });

  test("slug にできないディレクトリ名なら失敗する", () => {
    expect(() =>
      parsePosts({ sources: { "../contents/blog/Not_A_Slug/index.md": post() }, schema }),
    ).toThrow("Not a post path");
  });
});

describe("paginate", () => {
  const items = [1, 2, 3, 4, 5];

  test("指定がなければ全件を返す", () => {
    expect(paginate({ items })).toStrictEqual({ items, total: 5 });
  });

  test("offset から limit 件を返し、総数は全体の件数", () => {
    expect(paginate({ items, offset: 2, limit: 2 })).toStrictEqual({ items: [3, 4], total: 5 });
  });

  test("末尾を越えた分は返さない", () => {
    expect(paginate({ items, offset: 4, limit: 10 })).toStrictEqual({ items: [5], total: 5 });
  });
});

describe("postAssetPath", () => {
  const slug = slugSchema.parse("first");

  test("記事のディレクトリを指す", () => {
    expect(postAssetPath({ collection: "blog", slug })).toBe("/content-assets/blog/first");
  });

  test("ディレクトリ内のファイルを指す", () => {
    expect(
      postAssetPath({ collection: "blog", slug, file: assetFileNameSchema.parse("first.webp") }),
    ).toBe("/content-assets/blog/first/first.webp");
  });
});
