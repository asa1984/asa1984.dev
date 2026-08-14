import { env } from "cloudflare:test";
import { graphql } from "graphql";
import { beforeEach, describe, expect, it } from "vitest";
import type { GraphQLContext, Revalidater } from "../types";
import { builder } from "./index";

const schema = builder.toSchema();

// Storage is shared across tests in this file, so start each test from an
// empty database instead of relying on isolation.
beforeEach(async () => {
  await env.DB.batch([
    env.DB.prepare("DELETE FROM blogs"),
    env.DB.prepare("DELETE FROM contexts"),
  ]);
});

// Records revalidation calls so tests can assert the cache invalidation
// contract without any HTTP transport.
const make_context = (): { context: GraphQLContext; revalidated: string[] } => {
  const revalidated: string[] = [];
  const revalidater: Revalidater = {
    revalidateAllBlog: async () => {
      revalidated.push("allBlog");
    },
    revalidateBlog: async (slug) => {
      revalidated.push(`blog:${slug}`);
    },
    revalidateAllContext: async () => {
      revalidated.push("allContext");
    },
    revalidateContext: async (slug) => {
      revalidated.push(`context:${slug}`);
    },
  };
  return { context: { DB: env.DB, revalidater }, revalidated };
};

const exec = async (
  source: string,
  contextValue: GraphQLContext,
  variableValues?: Record<string, unknown>,
) => {
  const result = await graphql({
    schema,
    source,
    contextValue,
    variableValues,
  });
  if (result.errors) throw result.errors[0];
  // Loosely typed on purpose: assertions navigate the response shape.
  return result.data as Record<string, any>;
};

const UPSERT_BLOG = `
  mutation ($input: UpsertBlogInput!) {
    upsertBlog(input: $input) {
      slug title image description content published createdAt updatedAt
    }
  }
`;

const blog_input = (overrides: Record<string, unknown> = {}) => ({
  slug: "first",
  title: "タイトル",
  image: "cover.webp",
  description: "説明",
  content: "本文",
  published: true,
  ...overrides,
});

describe("blog resolvers", () => {
  it("upsertBlog は新規記事を作成し createdAt を自動採番する", async () => {
    const { context } = make_context();

    const data = await exec(UPSERT_BLOG, context, { input: blog_input() });

    expect(data.upsertBlog).toMatchObject(blog_input());
    expect(Date.parse(data.upsertBlog["createdAt"])).not.toBeNaN();
  });

  it("upsertBlog は createdAt 指定時にその値を保存する (insert / update 両方)", async () => {
    const { context } = make_context();
    const date = "2023-10-23T00:00:00.000Z";

    const inserted = await exec(UPSERT_BLOG, context, {
      input: blog_input({ createdAt: date }),
    });
    expect(inserted.upsertBlog["createdAt"]).toBe(date);

    const rewritten = "2022-11-15T15:00:00.000Z";
    const updated = await exec(UPSERT_BLOG, context, {
      input: blog_input({ createdAt: rewritten }),
    });
    expect(updated.upsertBlog["createdAt"]).toBe(rewritten);
  });

  it("upsertBlog は既存記事を更新し createdAt を保持する", async () => {
    const { context } = make_context();

    const inserted = await exec(UPSERT_BLOG, context, {
      input: blog_input({ createdAt: "2023-10-23T00:00:00.000Z" }),
    });

    const updated = await exec(UPSERT_BLOG, context, {
      input: blog_input({ title: "改題", published: false }),
    });

    expect(updated.upsertBlog).toMatchObject({
      title: "改題",
      published: false,
      createdAt: inserted.upsertBlog["createdAt"],
    });

    const listed = await exec("{ blogs { slug } }", context);
    expect(listed.blogs).toHaveLength(1);
  });

  it("blog は slug で取得でき、未知の slug は null を返す", async () => {
    const { context } = make_context();
    await exec(UPSERT_BLOG, context, { input: blog_input() });

    const found = await exec(
      "query ($slug: String) { blog(slug: $slug) { slug title } }",
      context,
      { slug: "first" },
    );
    expect(found.blog).toMatchObject({ slug: "first", title: "タイトル" });

    const missing = await exec(
      "query ($slug: String) { blog(slug: $slug) { slug } }",
      context,
      { slug: "nope" },
    );
    expect(missing.blog).toBeNull();
  });

  it("blogs は未公開記事も含めて返す (published フィルタは frontend 責務)", async () => {
    const { context } = make_context();
    await exec(UPSERT_BLOG, context, { input: blog_input() });
    await exec(UPSERT_BLOG, context, {
      input: blog_input({ slug: "draft", published: false }),
    });

    const data = await exec("{ blogs { slug published } }", context);
    expect(data.blogs).toHaveLength(2);
  });

  it("deleteBlog は削除で true、対象なしで false を返す", async () => {
    const { context } = make_context();
    await exec(UPSERT_BLOG, context, { input: blog_input() });

    const deleted = await exec(
      'mutation { deleteBlog(slug: "first") }',
      context,
    );
    expect(deleted.deleteBlog).toBe(true);

    const listed = await exec("{ blogs { slug } }", context);
    expect(listed.blogs).toHaveLength(0);

    const again = await exec('mutation { deleteBlog(slug: "first") }', context);
    expect(again.deleteBlog).toBe(false);
  });

  it("ミューテーションは frontend キャッシュを revalidate する", async () => {
    const { context, revalidated } = make_context();

    await exec(UPSERT_BLOG, context, { input: blog_input() });
    expect(revalidated).toEqual(["allBlog"]);

    revalidated.length = 0;
    await exec(UPSERT_BLOG, context, { input: blog_input({ title: "改" }) });
    expect(revalidated).toEqual(["blog:first", "allBlog"]);

    revalidated.length = 0;
    await exec('mutation { deleteBlog(slug: "first") }', context);
    expect(revalidated).toEqual(["blog:first", "allBlog"]);
  });
});

const UPSERT_CONTEXT = `
  mutation ($input: UpsertContextInput!) {
    upsertContext(input: $input) {
      slug title emoji content published createdAt updatedAt
    }
  }
`;

const context_input = (overrides: Record<string, unknown> = {}) => ({
  slug: "voice",
  title: "声帯",
  emoji: "🗣️",
  content: "本文",
  published: true,
  ...overrides,
});

describe("context resolvers", () => {
  it("upsertContext は insert / update とも createdAt 指定を反映する", async () => {
    const { context } = make_context();
    const date = "2024-01-12T09:02:49.671Z";

    const inserted = await exec(UPSERT_CONTEXT, context, {
      input: context_input({ createdAt: date }),
    });
    expect(inserted.upsertContext).toMatchObject({
      ...context_input(),
      createdAt: date,
    });

    const updated = await exec(UPSERT_CONTEXT, context, {
      input: context_input({ title: "改題" }),
    });
    expect(updated.upsertContext).toMatchObject({
      title: "改題",
      createdAt: date,
    });
  });

  it("context / contexts クエリと deleteContext が動作する", async () => {
    const { context, revalidated } = make_context();
    await exec(UPSERT_CONTEXT, context, { input: context_input() });
    await exec(UPSERT_CONTEXT, context, {
      input: context_input({ slug: "draft", published: false }),
    });

    const listed = await exec("{ contexts { slug published } }", context);
    expect(listed.contexts).toHaveLength(2);

    const found = await exec(
      'query { context(slug: "voice") { slug emoji } }',
      context,
    );
    expect(found.context).toMatchObject({ slug: "voice", emoji: "🗣️" });

    revalidated.length = 0;
    const deleted = await exec(
      'mutation { deleteContext(slug: "voice") }',
      context,
    );
    expect(deleted.deleteContext).toBe(true);
    expect(revalidated).toEqual(["context:voice", "allContext"]);

    const missing = await exec(
      'query { context(slug: "voice") { slug } }',
      context,
    );
    expect(missing.context).toBeNull();
  });
});
