import { describe, it, expect } from "vitest";
import { crawlUrl } from "./crawler";

describe("crawlUrl - URL validation", () => {
  it("blocks localhost URLs", async () => {
    await expect(crawlUrl("http://localhost:3000")).rejects.toThrow("Blocked URL");
  });

  it("blocks 127.0.0.1", async () => {
    await expect(crawlUrl("http://127.0.0.1")).rejects.toThrow("Blocked URL");
  });

  it("blocks 10.x.x.x internal IPs", async () => {
    await expect(crawlUrl("http://10.0.0.1")).rejects.toThrow("Blocked URL");
  });

  it("blocks 192.168.x.x internal IPs", async () => {
    await expect(crawlUrl("http://192.168.1.1")).rejects.toThrow("Blocked URL");
  });

  it("blocks 172.16-31.x.x internal IPs", async () => {
    await expect(crawlUrl("http://172.16.0.1")).rejects.toThrow("Blocked URL");
    await expect(crawlUrl("http://172.31.255.255")).rejects.toThrow("Blocked URL");
  });

  it("blocks 169.254.x.x link-local (metadata endpoint)", async () => {
    await expect(crawlUrl("http://169.254.169.254")).rejects.toThrow("Blocked URL");
  });

  it("blocks IPv6 loopback", async () => {
    await expect(crawlUrl("http://[::1]")).rejects.toThrow("Blocked URL");
  });

  it("blocks non-HTTP protocols", async () => {
    await expect(crawlUrl("ftp://example.com")).rejects.toThrow("Blocked URL");
    await expect(crawlUrl("file:///etc/passwd")).rejects.toThrow("Blocked URL");
  });

  it("blocks javascript: protocol", async () => {
    await expect(crawlUrl("javascript:alert(1)")).rejects.toThrow("Blocked URL");
  });

  it("blocks 0.0.0.0", async () => {
    await expect(crawlUrl("http://0.0.0.0")).rejects.toThrow("Blocked URL");
  });
});
