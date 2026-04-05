import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("logger", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  describe("개발 환경 (development)", () => {
    beforeEach(async () => {
      vi.stubEnv("NODE_ENV", "development");
      vi.resetModules();
    });

    it("info - 읽기 쉬운 포맷으로 출력", async () => {
      const { logger } = await import("./logger");
      logger.info("test message", { key: "value" });
      expect(consoleLogSpy).toHaveBeenCalledOnce();
      const [msg] = consoleLogSpy.mock.calls[0];
      expect(msg).toContain("[INFO]");
      expect(msg).toContain("test message");
    });

    it("warn - 읽기 쉬운 포맷으로 출력", async () => {
      const { logger } = await import("./logger");
      logger.warn("warn message");
      expect(consoleWarnSpy).toHaveBeenCalledOnce();
      const [msg] = consoleWarnSpy.mock.calls[0];
      expect(msg).toContain("[WARN]");
      expect(msg).toContain("warn message");
    });

    it("error - 읽기 쉬운 포맷으로 출력, error 객체 포함", async () => {
      const { logger } = await import("./logger");
      const err = new Error("test error");
      logger.error("error occurred", err, { userId: "123" });
      expect(consoleErrorSpy).toHaveBeenCalledOnce();
      const [msg] = consoleErrorSpy.mock.calls[0];
      expect(msg).toContain("[ERROR]");
      expect(msg).toContain("error occurred");
    });
  });

  describe("프로덕션 환경 (production)", () => {
    beforeEach(async () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.resetModules();
    });

    it("info - JSON 형식으로 출력", async () => {
      const { logger } = await import("./logger");
      logger.info("prod message", { userId: "abc" });
      expect(consoleLogSpy).toHaveBeenCalledOnce();
      const [msg] = consoleLogSpy.mock.calls[0];
      const parsed = JSON.parse(msg);
      expect(parsed.level).toBe("info");
      expect(parsed.message).toBe("prod message");
      expect(parsed.timestamp).toBeDefined();
      expect(parsed.meta).toMatchObject({ userId: "abc" });
    });

    it("warn - JSON 형식으로 출력", async () => {
      const { logger } = await import("./logger");
      logger.warn("prod warn");
      expect(consoleWarnSpy).toHaveBeenCalledOnce();
      const [msg] = consoleWarnSpy.mock.calls[0];
      const parsed = JSON.parse(msg);
      expect(parsed.level).toBe("warn");
    });

    it("error - JSON 형식, error 직렬화 포함", async () => {
      const { logger } = await import("./logger");
      const err = new Error("boom");
      logger.error("something failed", err);
      expect(consoleErrorSpy).toHaveBeenCalledOnce();
      const [msg] = consoleErrorSpy.mock.calls[0];
      const parsed = JSON.parse(msg);
      expect(parsed.level).toBe("error");
      expect(parsed.error).toBeDefined();
      expect(parsed.error.message).toBe("boom");
    });

    it("error - error 없이 호출 가능", async () => {
      const { logger } = await import("./logger");
      logger.error("no error object");
      expect(consoleErrorSpy).toHaveBeenCalledOnce();
    });
  });
});
