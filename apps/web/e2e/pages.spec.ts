import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

/** Collects the page's console errors and uncaught exceptions, such as hydration failures. */
const collectErrors = (page: Page): string[] => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    errors.push(error.message);
  });
  return errors;
};

test.describe("head", () => {
  test("トップページは絶対 URL の og:image を持つ", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle("asa1984.dev");
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      /^https?:\/\/[^/]+\/opengraph-image\.jpg$/u,
    );
  });

  test("ブログの記事は article としてカバー画像を共有させる", async ({ page }) => {
    await page.goto("/blog/first");

    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image",
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      /^https?:\/\/[^/]+\/content-assets\/blog\/first\/first\.webp$/u,
    );
  });

  test("404 ページは検索エンジンに載せない", async ({ page }) => {
    await page.goto("/unknown");

    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");
  });
});

test.describe("island", () => {
  test("ナビメニューを開き、外を押すと閉じる", async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto("/blog");
    const profileLink = page.locator('header a[href="/profile"]');

    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(profileLink).toBeVisible();

    await page.locator("main").click({ position: { x: 1, y: 1 } });
    await expect(profileLink).toBeHidden();
    expect(errors).toStrictEqual([]);
  });

  test("ブログ一覧は投稿からの経過を表示する", async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto("/blog");

    await expect(page.locator("main a").first()).toContainText(
      /Today|Yesterday|Last month|Last year|\d+ (?:days|months|years) ago/u,
    );
    expect(errors).toStrictEqual([]);
  });

  test("プロフィールは現在の年齢を表示する", async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto("/profile");

    await expect(page.getByText(/^\d+ \| 2004-present$/u)).toBeVisible();
    expect(errors).toStrictEqual([]);
  });
});
