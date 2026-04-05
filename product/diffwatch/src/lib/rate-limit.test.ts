import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./prisma", () => ({
  prisma: {
    rateLimit: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { checkRateLimit } from "./rate-limit";
import { prisma } from "./prisma";

const mockRateLimit = prisma.rateLimit as unknown as {
  findUnique: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
};

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00.000Z"));
  });

  it("새 키에 대해 카운트 1로 생성하고 allowed: true 반환", async () => {
    mockRateLimit.findUnique.mockResolvedValue(null);
    mockRateLimit.create.mockResolvedValue({ count: 1, windowEnd: new Date() });

    const result = await checkRateLimit("test:key", 5, 60_000);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
    expect(mockRateLimit.create).toHaveBeenCalledOnce();
  });

  it("한도 미만이면 allowed: true 반환하고 remaining 감소", async () => {
    const windowEnd = new Date(Date.now() + 60_000);
    mockRateLimit.findUnique.mockResolvedValue({
      id: "test:key",
      count: 3,
      windowEnd,
    });
    mockRateLimit.update.mockResolvedValue({ count: 4, windowEnd });

    const result = await checkRateLimit("test:key", 5, 60_000);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(1);
  });

  it("한도 도달 시 allowed: false 반환하고 remaining: 0", async () => {
    const windowEnd = new Date(Date.now() + 60_000);
    mockRateLimit.findUnique.mockResolvedValue({
      id: "test:key",
      count: 5,
      windowEnd,
    });

    const result = await checkRateLimit("test:key", 5, 60_000);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(mockRateLimit.update).not.toHaveBeenCalled();
  });

  it("윈도우 만료 시 카운트 리셋", async () => {
    const expiredWindowEnd = new Date(Date.now() - 1000);
    mockRateLimit.findUnique.mockResolvedValue({
      id: "test:key",
      count: 5,
      windowEnd: expiredWindowEnd,
    });
    mockRateLimit.update.mockResolvedValue({ count: 1, windowEnd: new Date() });

    const result = await checkRateLimit("test:key", 5, 60_000);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
    expect(mockRateLimit.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ count: 1 }),
      }),
    );
  });

  it("한도 초과 후에도 allowed: false 유지 (count > limit)", async () => {
    const windowEnd = new Date(Date.now() + 60_000);
    mockRateLimit.findUnique.mockResolvedValue({
      id: "test:key",
      count: 10,
      windowEnd,
    });

    const result = await checkRateLimit("test:key", 5, 60_000);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });
});
