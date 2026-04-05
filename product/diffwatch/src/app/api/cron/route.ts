import { NextRequest, NextResponse } from "next/server";
import { checkAllMonitors } from "@/lib/actions";
import { checkRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // CRON_SECRET으로 인증된 요청은 rate limit 제외
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      "unknown";
    const rl = await checkRateLimit(`api:cron:${ip}`, 60, 60_000);
    if (!rl.allowed) {
      logger.warn("Rate limit exceeded for cron endpoint", { ip });
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
  }

  const results = await checkAllMonitors();
  return NextResponse.json({ checked: results.length, results });
}
