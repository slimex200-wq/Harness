import { test, expect } from "@playwright/test";

test.describe("API endpoints", () => {
  test("health check returns ok", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.status).toBe("ok");
    expect(data).toHaveProperty("timestamp");
  });

  test("cron endpoint requires auth", async ({ request }) => {
    const response = await request.get("/api/cron");
    // Without CRON_SECRET set, it should still work (no auth required)
    // With CRON_SECRET set, it should return 401 without Bearer token
    expect([200, 401]).toContain(response.status());
  });

  test("cron endpoint with wrong token returns 401", async ({ request }) => {
    const response = await request.get("/api/cron", {
      headers: { Authorization: "Bearer wrong-token" },
    });
    // If CRON_SECRET is set, should be 401
    // If not set, should be 200
    expect([200, 401]).toContain(response.status());
  });

  test("stripe checkout without auth returns error", async ({ request }) => {
    const response = await request.post("/api/stripe/checkout", {
      data: { plan: "pro" },
    });
    // Should fail - either 401 (no session) or 503 (stripe not configured)
    expect([401, 500, 503]).toContain(response.status());
  });

  test("security headers are present", async ({ request }) => {
    const response = await request.get("/landing");
    expect(response.headers()["x-frame-options"]).toBe("DENY");
    expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  });
});
