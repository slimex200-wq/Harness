import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const timestamp = new Date().toISOString();

  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      { status: "ok", db: "connected", timestamp },
      { status: 200 }
    );
  } catch (error) {
    console.error("[health] DB connection failed:", error);

    return NextResponse.json(
      { status: "degraded", db: "disconnected", timestamp },
      { status: 503 }
    );
  }
}
