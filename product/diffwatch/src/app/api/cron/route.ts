import { NextRequest, NextResponse } from "next/server";
import { checkAllMonitors } from "@/lib/actions";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await checkAllMonitors();
  return NextResponse.json({ checked: results.length, results });
}
