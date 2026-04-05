import { prisma } from "./prisma";

export interface RateLimitResult {
  readonly allowed: boolean;
  readonly remaining: number;
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const now = new Date();

  const existing = await prisma.rateLimit.findUnique({ where: { id: key } });

  // 레코드 없음 → 새로 생성
  if (!existing) {
    const windowEnd = new Date(now.getTime() + windowMs);
    await prisma.rateLimit.create({
      data: { id: key, count: 1, windowEnd },
    });
    return { allowed: true, remaining: limit - 1 };
  }

  // 윈도우 만료 → 리셋
  if (existing.windowEnd <= now) {
    const windowEnd = new Date(now.getTime() + windowMs);
    await prisma.rateLimit.update({
      where: { id: key },
      data: { count: 1, windowEnd },
    });
    return { allowed: true, remaining: limit - 1 };
  }

  // 한도 초과
  if (existing.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  // 정상 증가
  await prisma.rateLimit.update({
    where: { id: key },
    data: { count: existing.count + 1 },
  });
  return { allowed: true, remaining: limit - existing.count - 1 };
}
