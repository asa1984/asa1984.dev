import { describe, expect, test } from "vite-plus/test";

import { formatDateString, toSiteDate } from "./date.ts";

describe("toSiteDate", () => {
  test("日本時間の日付にする", () => {
    expect(toSiteDate(Temporal.Instant.from("2022-11-15T15:00:00Z")).toString()).toBe("2022-11-16");
  });

  test("日本時間で年をまたぐ", () => {
    expect(toSiteDate(Temporal.Instant.from("2023-12-31T15:00:00Z")).year).toBe(2024);
  });
});

describe("formatDateString", () => {
  test("Date#toDateString と同じ形にする", () => {
    expect(formatDateString(Temporal.PlainDate.from("2022-11-16"))).toBe("Wed Nov 16 2022");
  });

  test("日を 2 桁にそろえる", () => {
    expect(formatDateString(Temporal.PlainDate.from("2024-01-08"))).toBe("Mon Jan 08 2024");
  });
});
