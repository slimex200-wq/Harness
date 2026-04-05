import { describe, it, expect } from "vitest";
import { computeDiff } from "./differ";

describe("computeDiff", () => {
  it("returns null when content is identical", () => {
    const result = computeDiff("hello world", "hello world");
    expect(result).toBeNull();
  });

  it("detects added lines", () => {
    const result = computeDiff("line1\nline2\n", "line1\nline2\nline3\n");
    expect(result).not.toBeNull();
    expect(result!.addedLines).toBeGreaterThan(0);
    expect(result!.summary).toContain("added");
  });

  it("detects removed lines", () => {
    const result = computeDiff("line1\nline2\nline3", "line1");
    expect(result).not.toBeNull();
    expect(result!.removedLines).toBeGreaterThan(0);
    expect(result!.summary).toContain("removed");
  });

  it("categorizes pricing changes as high importance", () => {
    const old = "Basic plan\nPrice: $10/mo";
    const updated = "Basic plan\nPrice: $15/mo";
    const result = computeDiff(old, updated);
    expect(result).not.toBeNull();
    expect(result!.category).toBe("pricing");
    expect(result!.importance).toBe("high");
  });

  it("categorizes feature announcements as medium importance", () => {
    const old = "Our product";
    const updated = "Our product\nIntroducing new feature: AI assistant";
    const result = computeDiff(old, updated);
    expect(result).not.toBeNull();
    expect(result!.category).toBe("feature");
    expect(result!.importance).toBe("medium");
  });

  it("categorizes generic text changes as copy/low", () => {
    const old = "Welcome to our site";
    const updated = "Welcome to our platform";
    const result = computeDiff(old, updated);
    expect(result).not.toBeNull();
    expect(result!.category).toBe("copy");
    expect(result!.importance).toBe("low");
  });

  it("upgrades copy importance to medium when >20 lines change", () => {
    const lines = Array.from({ length: 25 }, (_, i) => `old line ${i}`).join("\n");
    const newLines = Array.from({ length: 25 }, (_, i) => `new line ${i}`).join("\n");
    const result = computeDiff(lines, newLines);
    expect(result).not.toBeNull();
    expect(result!.category).toBe("copy");
    expect(result!.importance).toBe("medium");
  });

  it("truncates diff output to 5000 characters", () => {
    const old = Array.from({ length: 500 }, (_, i) => `old line with some content number ${i}`).join("\n");
    const updated = Array.from({ length: 500 }, (_, i) => `new line with some content number ${i}`).join("\n");
    const result = computeDiff(old, updated);
    expect(result).not.toBeNull();
    expect(result!.diff.length).toBeLessThanOrEqual(5000);
  });

  it("detects $XX/mo pricing pattern", () => {
    const result = computeDiff("cost info", "cost info\nNow only $29/mo");
    expect(result!.category).toBe("pricing");
  });

  it("detects 'per seat' pricing pattern", () => {
    const result = computeDiff("billing", "billing\n$5 per seat");
    expect(result!.category).toBe("pricing");
  });

  it("detects 'now available' feature pattern", () => {
    const result = computeDiff("updates", "updates\nDark mode now available");
    expect(result!.category).toBe("feature");
  });

  it("detects 'beta' feature pattern", () => {
    const result = computeDiff("product", "product\nTry our beta release");
    expect(result!.category).toBe("feature");
  });
});
