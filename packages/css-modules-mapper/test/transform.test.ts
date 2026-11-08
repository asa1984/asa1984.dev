import { describe, expect, test } from "vite-plus/test";

import { PARSE_ERROR_CODE, transform } from "../src/transform.ts";

/** Each mapping as the virtual text and the original text it covers, plus the original offset. */
const mappings = (content: string) => {
  const { text, mappings: spans = [] } = transform("a.module.css", content);
  return spans.map(([virtualStart, virtualLength, originalStart, originalLength]) => ({
    virtual: text.slice(virtualStart, virtualStart + virtualLength),
    original: content.slice(originalStart, originalStart + originalLength),
    originalStart,
  }));
};

describe("transform", () => {
  test("types every class and id the build exports, as a default export", () => {
    const { text } = transform(
      "a.module.css",
      ".button {}\n#main { color: red }\n.button:hover { color: blue }",
    );

    expect(text).toContain('readonly "main": string;');
    expect(text).toContain('readonly "button": string;');
    expect(text).toContain("export default styles;");
  });

  test("leaves out names the build drops, such as a class whose only rule is empty", () => {
    const { text } = transform("a.module.css", ".empty {}\n.kept { color: red }");

    expect(text).not.toContain("empty");
    expect(text).toContain('"kept"');
  });

  test("exports valid, unreserved identifiers by name as Vite does", () => {
    const { text } = transform("a.module.css", ".card, .title-text, .default { color: red }");

    expect(text).toContain("export declare const card: string;");
    expect(text).not.toContain("export declare const default");
    expect(text).not.toMatch(/export declare const title-text/u);
  });

  test("keeps grid line names and container names global", () => {
    const { text } = transform(
      "a.module.css",
      '.card { container: card / inline-size; grid-column: prose; grid-template-areas: "head"; }',
    );

    expect(text).not.toContain("prose");
    expect(text).not.toContain('"head"');
    expect(text).toMatch(/readonly "card"/u);
  });

  test("maps each name to its first selector, skipping comments, strings, and url()", () => {
    const content = [
      "/* .card is mentioned here first */",
      '.base { content: ".card"; background: url(a.card.png); }',
      ".card { color: red; }",
    ].join("\n");

    expect(mappings(content)).toContainEqual({
      virtual: "card",
      original: "card",
      originalStart: content.indexOf(".card {") + 1,
    });
  });

  test("maps the default export to the top of the stylesheet for go-to-definition", () => {
    expect(mappings(".a { color: red }")[0]).toStrictEqual({
      virtual: "styles",
      original: "",
      originalStart: 0,
    });
  });

  test("reports a parse error at its position in the stylesheet", () => {
    const content = ".a { color: red }\n.b $$ { }\n";

    const result = transform("a.module.css", content);

    expect(result.diagnostics).toStrictEqual([
      {
        messageText: "Invalid dangling combinator in selector",
        start: content.indexOf("$$"),
        length: 1,
        code: PARSE_ERROR_CODE,
      },
    ]);
    expect(result.text).toContain("export default styles;");
  });
});
