"use server";

import { prisma } from "./prisma";
import { revalidatePath } from "next/cache";

export async function getHabits() {
  return prisma.habit.findMany({
    where: { archived: false },
    orderBy: { order: "asc" },
  });
}

export async function getHabit(id: string) {
  return prisma.habit.findUnique({ where: { id } });
}

export async function createHabit(data: {
  name: string;
  icon?: string;
  color?: string;
  frequency?: string;
  customDays?: string;
}) {
  const count = await prisma.habit.count({ where: { archived: false } });
  if (count >= 20) {
    throw new Error("습관은 최대 20개까지 추가할 수 있습니다");
  }

  const habit = await prisma.habit.create({
    data: {
      name: data.name,
      icon: data.icon ?? "check",
      color: data.color ?? "#6366f1",
      frequency: data.frequency ?? "daily",
      customDays: data.customDays ?? "[]",
      order: count,
    },
  });

  revalidatePath("/");
  return habit;
}

export async function updateHabit(
  id: string,
  data: {
    name?: string;
    icon?: string;
    color?: string;
    frequency?: string;
    customDays?: string;
  },
) {
  const habit = await prisma.habit.update({
    where: { id },
    data,
  });

  revalidatePath("/");
  return habit;
}

export async function archiveHabit(id: string) {
  await prisma.habit.update({
    where: { id },
    data: { archived: true },
  });

  revalidatePath("/");
}

export async function toggleCheck(habitId: string, date: string) {
  const existing = await prisma.check.findUnique({
    where: { date_habitId: { date, habitId } },
  });

  if (existing) {
    await prisma.check.delete({ where: { id: existing.id } });
  } else {
    await prisma.check.create({ data: { date, habitId } });
  }

  revalidatePath("/");
}

export async function getChecksForDateRange(
  startDate: string,
  endDate: string,
) {
  return prisma.check.findMany({
    where: {
      date: { gte: startDate, lte: endDate },
    },
  });
}

export async function getTodayChecks(date: string) {
  return prisma.check.findMany({
    where: { date },
  });
}
