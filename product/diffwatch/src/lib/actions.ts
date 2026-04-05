"use server";

import { z } from "zod";
import { prisma } from "./prisma";
import { crawlUrl } from "./crawler";
import { computeDiff } from "./differ";
import { revalidatePath } from "next/cache";

const createMonitorSchema = z.object({
  url: z.string().url().startsWith("http"),
  name: z.string().min(1).max(100),
  selector: z.string().max(200).optional(),
});

export async function createMonitor(data: {
  url: string;
  name: string;
  selector?: string;
}) {
  const validated = createMonitorSchema.parse(data);

  const monitor = await prisma.monitor.create({
    data: {
      url: validated.url,
      name: validated.name,
      selector: validated.selector || null,
    },
  });

  try {
    const result = await crawlUrl(monitor.url, monitor.selector);
    await prisma.snapshot.create({
      data: {
        monitorId: monitor.id,
        content: result.textContent,
        hash: result.hash,
      },
    });
  } catch (err) {
    // 초기 스냅샷 실패해도 모니터 생성은 유지, 다음 체크에서 재시도
    const message = err instanceof Error ? err.message : "Unknown";
    await prisma.monitor.update({
      where: { id: monitor.id },
      data: { active: true },
    });
    return { ...monitor, snapshotError: message };
  }

  revalidatePath("/");
  return monitor;
}

export async function getMonitors() {
  return prisma.monitor.findMany({
    include: {
      _count: { select: { changes: true, snapshots: true } },
      changes: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getMonitor(id: string) {
  return prisma.monitor.findUnique({
    where: { id },
    include: {
      changes: { orderBy: { createdAt: "desc" }, take: 50 },
      snapshots: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { changes: true } },
    },
  });
}

export async function deleteMonitor(id: string) {
  await prisma.monitor.delete({ where: { id } });
  revalidatePath("/");
}

export async function checkMonitor(id: string) {
  const monitor = await prisma.monitor.findUnique({
    where: { id },
    include: { snapshots: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  if (!monitor) throw new Error("Monitor not found");

  const result = await crawlUrl(monitor.url, monitor.selector);
  const lastSnapshot = monitor.snapshots[0];

  if (lastSnapshot && lastSnapshot.hash !== result.hash) {
    const diff = computeDiff(lastSnapshot.content, result.textContent);

    if (diff) {
      await prisma.change.create({
        data: {
          monitorId: monitor.id,
          category: diff.category,
          summary: diff.summary,
          diff: diff.diff,
          importance: diff.importance,
        },
      });
    }
  }

  await prisma.snapshot.create({
    data: {
      monitorId: monitor.id,
      content: result.textContent,
      hash: result.hash,
    },
  });

  revalidatePath("/");
  return { changed: lastSnapshot ? lastSnapshot.hash !== result.hash : false };
}

export async function checkAllMonitors() {
  const pLimit = (await import("p-limit")).default;
  const limit = pLimit(5);

  const monitors = await prisma.monitor.findMany({
    where: { active: true },
  });

  const results = await Promise.allSettled(
    monitors.map((monitor) =>
      limit(async () => {
        const result = await checkMonitor(monitor.id);
        return { id: monitor.id, name: monitor.name, ...result };
      }),
    ),
  );

  return results.map((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : {
          id: monitors[i].id,
          name: monitors[i].name,
          changed: false,
          error: r.reason instanceof Error ? r.reason.message : "Unknown",
        },
  );
}

export async function getDashboardStats() {
  const totalMonitors = await prisma.monitor.count({ where: { active: true } });
  const totalChanges = await prisma.change.count();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentChanges = await prisma.change.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    include: { monitor: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const byCategory = recentChanges.reduce<Record<string, number>>(
    (acc, change) => ({
      ...acc,
      [change.category]: (acc[change.category] ?? 0) + 1,
    }),
    {},
  );

  return { totalMonitors, totalChanges, recentChanges: recentChanges.slice(0, 50), byCategory };
}
