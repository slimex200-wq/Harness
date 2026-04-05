const isDev = process.env.NODE_ENV !== "production";

function serializeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
    };
  }
  return { raw: String(error) };
}

export const logger = {
  info(message: string, meta?: Record<string, unknown>): void {
    if (isDev) {
      const suffix = meta ? ` ${JSON.stringify(meta)}` : "";
      console.log(`[INFO] ${message}${suffix}`);
    } else {
      console.log(
        JSON.stringify({
          level: "info",
          message,
          timestamp: new Date().toISOString(),
          meta: meta ?? {},
        }),
      );
    }
  },

  warn(message: string, meta?: Record<string, unknown>): void {
    if (isDev) {
      const suffix = meta ? ` ${JSON.stringify(meta)}` : "";
      console.warn(`[WARN] ${message}${suffix}`);
    } else {
      console.warn(
        JSON.stringify({
          level: "warn",
          message,
          timestamp: new Date().toISOString(),
          meta: meta ?? {},
        }),
      );
    }
  },

  error(
    message: string,
    error?: unknown,
    meta?: Record<string, unknown>,
  ): void {
    if (isDev) {
      const suffix = meta ? ` ${JSON.stringify(meta)}` : "";
      console.error(`[ERROR] ${message}${suffix}`, error ?? "");
    } else {
      console.error(
        JSON.stringify({
          level: "error",
          message,
          timestamp: new Date().toISOString(),
          error: error !== undefined ? serializeError(error) : undefined,
          meta: meta ?? {},
        }),
      );
    }
  },
};
