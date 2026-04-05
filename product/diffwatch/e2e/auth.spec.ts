import { test, expect } from "@playwright/test";

const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = "testpassword123";

test.describe("Authentication flow", () => {
  test("unauthenticated user is redirected to landing", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/landing/);
  });

  test("landing page has sign up and sign in links", async ({ page }) => {
    await page.goto("/landing");
    await expect(page.getByRole("link", { name: "Start tracking for free" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
  });

  test("can navigate to register page", async ({ page }) => {
    await page.goto("/landing");
    await page.click("text=Start tracking for free");
    await expect(page).toHaveURL(/\/auth\/register/);
  });

  test("register with new account", async ({ page }) => {
    await page.goto("/auth/register");

    await page.fill('input[placeholder="Your name"]', "Test User");
    await page.fill('input[placeholder="you@company.com"]', TEST_EMAIL);
    await page.fill('input[placeholder="Min 8 characters"]', TEST_PASSWORD);
    await page.click("text=Create free account");

    // Should redirect to dashboard
    await page.waitForURL("/", { timeout: 10000 });
    await expect(page.locator("text=DiffWatch")).toBeVisible();
  });

  test("register with duplicate email shows error", async ({ page }) => {
    await page.goto("/auth/register");

    await page.fill('input[placeholder="you@company.com"]', TEST_EMAIL);
    await page.fill('input[placeholder="Min 8 characters"]', TEST_PASSWORD);
    await page.click("text=Create free account");

    await expect(page.locator("text=Email already registered")).toBeVisible();
  });

  test("login with correct credentials", async ({ page }) => {
    await page.goto("/auth/login");

    await page.fill('input[placeholder="you@company.com"]', TEST_EMAIL);
    await page.fill('input[placeholder="Min 8 characters"]', TEST_PASSWORD);
    await page.click("text=Sign in");

    await page.waitForURL("/", { timeout: 10000 });
    await expect(page.locator("text=DiffWatch")).toBeVisible();
  });

  test("login with wrong password shows error", async ({ page }) => {
    await page.goto("/auth/login");

    await page.fill('input[placeholder="you@company.com"]', TEST_EMAIL);
    await page.fill('input[placeholder="Min 8 characters"]', "wrongpassword");
    await page.click("text=Sign in");

    await expect(page.locator("text=Invalid email or password")).toBeVisible();
  });

  test("logout returns to landing", async ({ page }) => {
    // Login first
    await page.goto("/auth/login");
    await page.fill('input[placeholder="you@company.com"]', TEST_EMAIL);
    await page.fill('input[placeholder="Min 8 characters"]', TEST_PASSWORD);
    await page.click("text=Sign in");
    await page.waitForURL("/", { timeout: 10000 });

    // Logout
    await page.click("text=Logout");
    await expect(page).toHaveURL(/\/landing/);
  });

  test("forgot password page exists", async ({ page }) => {
    await page.goto("/auth/forgot-password");
    await expect(page.locator("text=Forgot your password")).toBeVisible();
  });
});
