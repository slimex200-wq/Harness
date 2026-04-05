import { test, expect } from "@playwright/test";

const TEST_EMAIL = `monitor-${Date.now()}@example.com`;
const TEST_PASSWORD = "testpassword123";

test.describe("Monitor CRUD flow", () => {
  test.beforeAll(async ({ browser }) => {
    // Register a test user
    const page = await browser.newPage();
    await page.goto("/auth/register");
    await page.fill('input[placeholder="you@company.com"]', TEST_EMAIL);
    await page.fill('input[placeholder="Min 8 characters"]', TEST_PASSWORD);
    await page.click("text=Create free account");
    await page.waitForURL("/", { timeout: 10000 });
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto("/auth/login");
    await page.fill('input[placeholder="you@company.com"]', TEST_EMAIL);
    await page.fill('input[placeholder="Min 8 characters"]', TEST_PASSWORD);
    await page.click("text=Sign in");
    await page.waitForURL("/", { timeout: 10000 });
  });

  test("shows onboarding when no monitors", async ({ page }) => {
    await expect(page.locator("text=Welcome to DiffWatch")).toBeVisible();
  });

  test("can add a monitor", async ({ page }) => {
    await page.fill('input[placeholder*="Monitor name"]', "Example Monitor");
    await page.fill('input[placeholder*="competitor.com"]', "https://example.com");
    await page.click("text=Track");

    // Wait for monitor to appear in list
    await expect(page.locator("text=Example Monitor")).toBeVisible({ timeout: 15000 });
  });

  test("shows plan limit in stats", async ({ page }) => {
    // Free plan shows x/3 monitors
    await expect(page.locator("text=/\\d+\\/3/")).toBeVisible();
  });

  test("can navigate to monitor detail", async ({ page }) => {
    // Add a monitor first if none exist
    const hasMonitor = await page.locator("text=Example Monitor").isVisible().catch(() => false);
    if (!hasMonitor) {
      await page.fill('input[placeholder*="Monitor name"]', "Detail Test");
      await page.fill('input[placeholder*="competitor.com"]', "https://example.com");
      await page.click("text=Track");
      await expect(page.locator("text=Detail Test")).toBeVisible({ timeout: 15000 });
    }

    // Click monitor name to go to detail
    await page.click("text=Example Monitor, text=Detail Test >> nth=0");
    await expect(page).toHaveURL(/\/monitor\//);
    await expect(page.locator("text=Change History")).toBeVisible();
  });

  test("can delete a monitor with confirmation", async ({ page }) => {
    // Add a monitor to delete
    await page.fill('input[placeholder*="Monitor name"]', "To Delete");
    await page.fill('input[placeholder*="competitor.com"]', "https://example.com");
    await page.click("text=Track");
    await expect(page.locator("text=To Delete")).toBeVisible({ timeout: 15000 });

    // Click X button on the "To Delete" monitor
    const monitorCard = page.locator("text=To Delete").locator("..");
    await monitorCard.locator("svg").last().click();

    // Confirm dialog should appear
    await expect(page.locator("button", { hasText: "Delete" })).toBeVisible();
    await expect(page.locator("button", { hasText: "Cancel" })).toBeVisible();

    // Click Delete to confirm
    await page.click("button:has-text('Delete')");

    // Monitor should be removed
    await expect(page.locator("text=To Delete")).not.toBeVisible({ timeout: 5000 });
  });
});
