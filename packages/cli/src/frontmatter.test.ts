import { describe, expect, it } from "vitest";
import {
  parseBlogPost,
  parseContextPost,
  splitFrontmatter,
} from "./frontmatter";

describe("splitFrontmatter", () => {
  it("splits the header and the body", () => {
    const source = [
      "---",
      "title: Hello",
      "published: true",
      "---",
      "# Body",
      "",
      "text",
    ].join("\n");
    expect(splitFrontmatter(source)).toEqual({
      header: "title: Hello\npublished: true",
      body: "# Body\n\ntext",
    });
  });

  it("returns an empty body when nothing follows the header", () => {
    expect(splitFrontmatter("---\ntitle: Hello\n---")).toEqual({
      header: "title: Hello",
      body: "",
    });
  });

  it("keeps a body line that itself is a horizontal rule", () => {
    const source = ["---", "title: Hello", "---", "intro", "---", "outro"].join(
      "\n",
    );
    expect(splitFrontmatter(source)).toEqual({
      header: "title: Hello",
      body: "intro\n---\noutro",
    });
  });

  it('throws when the beginning "---" is missing', () => {
    expect(() => splitFrontmatter("title: Hello\n---\nbody")).toThrow(
      'Missing beginning "---"',
    );
  });

  it('throws when the ending "---" is missing', () => {
    expect(() => splitFrontmatter("---\ntitle: Hello\nbody")).toThrow(
      'Missing ending "---"',
    );
  });

  it("normalizes CRLF line endings", () => {
    const source = "---\r\ntitle: Hello\r\n---\r\n# Body\r\ntext";
    expect(splitFrontmatter(source)).toEqual({
      header: "title: Hello",
      body: "# Body\ntext",
    });
  });
});

const blogSource = (header: string) => `---\n${header}\n---\n# Body`;

describe("parseBlogPost", () => {
  it("parses the frontmatter and the content", () => {
    const source = blogSource(
      [
        "title: Hello",
        "image: cover.png",
        "description: A post",
        "published: true",
      ].join("\n"),
    );
    expect(parseBlogPost(source)).toEqual({
      frontmatter: {
        title: "Hello",
        image: "cover.png",
        description: "A post",
        published: true,
      },
      content: "# Body",
    });
  });

  it("omits date when the frontmatter does not declare one", () => {
    const source = blogSource(
      [
        "title: Hello",
        "image: cover.png",
        "description: A post",
        "published: true",
      ].join("\n"),
    );
    expect(Object.hasOwn(parseBlogPost(source).frontmatter, "date")).toBe(
      false,
    );
  });

  it.each([
    ["a space separated timestamp", "2024-01-15 10:30:00"],
    ["an ISO timestamp", "2024-01-15T10:30:00Z"],
    ["an offset timestamp", "2024-01-15T10:30:00+09:00"],
    ["a bare day", "2024-01-15"],
  ])("keeps %s verbatim", (_name, date) => {
    const source = blogSource(
      [
        "title: Hello",
        "image: cover.png",
        "description: A post",
        "published: true",
        `date: ${date}`,
      ].join("\n"),
    );
    expect(parseBlogPost(source).frontmatter.date).toBe(date);
  });

  it("strips the quotes of a quoted date", () => {
    const source = blogSource(
      [
        "title: Hello",
        "image: cover.png",
        "description: A post",
        "published: true",
        'date: "2024-01-15T10:30:00Z"',
      ].join("\n"),
    );
    expect(parseBlogPost(source).frontmatter.date).toBe("2024-01-15T10:30:00Z");
  });

  it.each([
    [
      "title is an empty string",
      [
        'title: ""',
        "image: cover.png",
        "description: A post",
        "published: true",
      ],
    ],
    [
      "date is not a parseable date",
      [
        "title: Hello",
        "image: cover.png",
        "description: A post",
        "published: true",
        "date: yesterday",
      ],
    ],
    [
      "date is an empty string",
      [
        "title: Hello",
        "image: cover.png",
        "description: A post",
        "published: true",
        'date: ""',
      ],
    ],
    [
      "date is not a string",
      [
        "title: Hello",
        "image: cover.png",
        "description: A post",
        "published: true",
        "date: true",
      ],
    ],
    [
      "image is an empty string",
      ["title: Hello", 'image: ""', "description: A post", "published: true"],
    ],
    [
      "description is an empty string",
      [
        "title: Hello",
        "image: cover.png",
        'description: ""',
        "published: true",
      ],
    ],
    [
      "image is missing",
      ["title: Hello", "description: A post", "published: true"],
    ],
    [
      "published is missing",
      ["title: Hello", "image: cover.png", "description: A post"],
    ],
    [
      "published is not a boolean",
      [
        "title: Hello",
        "image: cover.png",
        "description: A post",
        'published: "yes"',
      ],
    ],
  ])("rejects the frontmatter when %s", (_name, header) => {
    expect(() => parseBlogPost(blogSource(header.join("\n")))).toThrow();
  });
});

describe("parseContextPost", () => {
  it("parses the frontmatter and the content", () => {
    const source = blogSource(
      ["title: Hello", "emoji: 🐧", "published: false"].join("\n"),
    );
    expect(parseContextPost(source)).toEqual({
      frontmatter: { title: "Hello", emoji: "🐧", published: false },
      content: "# Body",
    });
  });

  it("parses an optional date", () => {
    const source = blogSource(
      [
        "title: Hello",
        "emoji: 🐧",
        "published: false",
        "date: 2024-01-15 10:30:00",
      ].join("\n"),
    );
    expect(parseContextPost(source).frontmatter.date).toBe(
      "2024-01-15 10:30:00",
    );
  });

  it.each([
    ["title is an empty string", ['title: ""', "emoji: 🐧", "published: true"]],
    [
      "date is not a parseable date",
      ["title: Hello", "emoji: 🐧", "published: true", "date: nope"],
    ],
    [
      "emoji is an empty string",
      ["title: Hello", 'emoji: ""', "published: true"],
    ],
    ["emoji is missing", ["title: Hello", "published: true"]],
    ["published is missing", ["title: Hello", "emoji: 🐧"]],
  ])("rejects the frontmatter when %s", (_name, header) => {
    expect(() => parseContextPost(blogSource(header.join("\n")))).toThrow();
  });
});
