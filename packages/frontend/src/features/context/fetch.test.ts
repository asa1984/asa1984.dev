import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { get_post, get_posts_date_sorted, get_published_posts } from "./fetch";

const query = vi.fn();

vi.mock("@/libs/graphql", () => ({
  client: { query: (...args: unknown[]) => query(...args) },
}));
vi.mock("./getContexts.graphql", () => ({ default: "GetContexts" }));
vi.mock("./getContextBySlug.graphql", () => ({ default: "GetContextBySlug" }));

const context = (overrides: Record<string, unknown> = {}) => ({
  slug: "voice",
  title: "声帯",
  emoji: "🗣️",
  content: "本文",
  published: true,
  createdAt: "2024-01-12T09:02:49.671Z",
  updatedAt: "2024-01-12T09:02:49.671Z",
  ...overrides,
});

beforeEach(() => {
  vi.stubEnv("ALLOW_EMPTY_CONTENT", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
  query.mockReset();
});

describe("get_published_posts", () => {
  // commit 8ef7e8e まで published フィルタの欠落で未公開記事が公開されていた。
  // その回帰を検知するためのテスト。
  it("published: false の記事を除外する", async () => {
    query.mockResolvedValue({
      data: {
        contexts: [
          context({ slug: "public" }),
          context({ slug: "draft", published: false }),
        ],
      },
    });

    const posts = await get_published_posts();

    expect(posts.map((p) => p.slug)).toEqual(["public"]);
  });

  it("フェッチ失敗時はビルドを落とす (throw)", async () => {
    query.mockResolvedValue({ data: undefined, error: { message: "boom" } });

    await expect(get_published_posts()).rejects.toThrow(
      "Failed to fetch contexts: boom",
    );
  });

  it("ALLOW_EMPTY_CONTENT=1 のときは空配列で継続する", async () => {
    vi.stubEnv("ALLOW_EMPTY_CONTENT", "1");
    query.mockResolvedValue({ data: undefined, error: { message: "boom" } });

    await expect(get_published_posts()).resolves.toEqual([]);
  });
});

describe("get_posts_date_sorted", () => {
  it("新しい記事から順に並べる", async () => {
    query.mockResolvedValue({
      data: {
        contexts: [
          context({ slug: "old", createdAt: "2024-01-08T11:25:53.246Z" }),
          context({ slug: "new", createdAt: "2024-01-12T09:02:49.671Z" }),
        ],
      },
    });

    const posts = await get_posts_date_sorted();

    expect(posts.map((p) => p.slug)).toEqual(["new", "old"]);
  });
});

describe("get_post", () => {
  it("存在しない slug は null を返す", async () => {
    query.mockResolvedValue({ data: { context: null } });

    await expect(get_post("missing")).resolves.toBeNull();
  });

  it("記事をメタデータ付きで返す", async () => {
    query.mockResolvedValue({ data: { context: context() } });

    const post = await get_post("voice");

    expect(post).toMatchObject({
      slug: "voice",
      content: "本文",
      meta: {
        title: "声帯",
        emoji: "🗣️",
        date: new Date("2024-01-12T09:02:49.671Z"),
        published: true,
      },
    });
  });
});
