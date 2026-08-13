import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { get_post, get_posts_date_sorted, get_published_posts } from "./fetch";

const query = vi.fn();

vi.mock("@/libs/graphql", () => ({
  client: { query: (...args: unknown[]) => query(...args) },
}));
vi.mock("./getBlogs.graphql", () => ({ default: "GetBlogs" }));
vi.mock("./getBlogBySlug.graphql", () => ({ default: "GetBlogBySlug" }));

const blog = (overrides: Record<string, unknown> = {}) => ({
  slug: "first",
  title: "タイトル",
  description: "説明",
  image: "cover.webp",
  content: "本文",
  published: true,
  createdAt: "2023-10-23T00:00:00.000Z",
  updatedAt: "2023-10-23T00:00:00.000Z",
  ...overrides,
});

beforeEach(() => {
  vi.stubEnv("BACKEND_URL", "http://backend.test");
  vi.stubEnv("ALLOW_EMPTY_CONTENT", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
  query.mockReset();
});

describe("get_published_posts", () => {
  it("published: false の記事を除外する", async () => {
    query.mockResolvedValue({
      data: {
        blogs: [
          blog({ slug: "public" }),
          blog({ slug: "draft", published: false }),
        ],
      },
    });

    const posts = await get_published_posts();

    expect(posts.map((p) => p.slug)).toEqual(["public"]);
  });

  it("画像 URL を BACKEND_URL と sha256 キーから組み立てる", async () => {
    query.mockResolvedValue({ data: { blogs: [blog()] } });

    const [post] = await get_published_posts();

    // sha256("blog/first/cover.webp")
    const hash = Buffer.from(
      await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode("blog/first/cover.webp"),
      ),
    ).toString("hex");
    expect(post?.meta.image).toBe(`http://backend.test/image/delivery/${hash}`);
  });

  it("フェッチ失敗時はビルドを落とす (throw)", async () => {
    query.mockResolvedValue({
      data: undefined,
      error: { message: "boom" },
    });

    await expect(get_published_posts()).rejects.toThrow(
      "Failed to fetch blogs: boom",
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
        blogs: [
          blog({ slug: "old", createdAt: "2022-11-15T15:00:00.000Z" }),
          blog({ slug: "new", createdAt: "2024-03-08T11:39:03.680Z" }),
          blog({ slug: "mid", createdAt: "2023-10-23T00:00:00.000Z" }),
        ],
      },
    });

    const posts = await get_posts_date_sorted();

    expect(posts.map((p) => p.slug)).toEqual(["new", "mid", "old"]);
  });
});

describe("get_post", () => {
  it("存在しない slug は null を返す", async () => {
    query.mockResolvedValue({ data: { blog: null } });

    await expect(get_post("missing")).resolves.toBeNull();
  });

  it("記事をメタデータ付きで返す", async () => {
    query.mockResolvedValue({ data: { blog: blog() } });

    const post = await get_post("first");

    expect(post).toMatchObject({
      slug: "first",
      content: "本文",
      meta: {
        title: "タイトル",
        description: "説明",
        date: new Date("2023-10-23T00:00:00.000Z"),
        published: true,
      },
    });
  });
});
