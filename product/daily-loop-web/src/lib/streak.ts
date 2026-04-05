export type Frequency = "daily" | "weekdays" | "custom";

export interface HabitInfo {
  readonly id: string;
  readonly frequency: Frequency;
  readonly customDays: readonly number[];
}

export interface CheckRecord {
  readonly date: string;
  readonly habitId: string;
}

function isScheduledDay(habit: HabitInfo, date: Date): boolean {
  const day = date.getDay();
  switch (habit.frequency) {
    case "daily":
      return true;
    case "weekdays":
      return day >= 1 && day <= 5;
    case "custom":
      return habit.customDays.includes(day);
  }
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function calculateStreak(
  habit: HabitInfo,
  checks: readonly CheckRecord[],
  today: Date,
): number {
  const checkDates = new Set(
    checks.filter((c) => c.habitId === habit.id).map((c) => c.date),
  );

  let streak = 0;
  const current = new Date(today);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (!isScheduledDay(habit, current)) {
      current.setDate(current.getDate() - 1);
      continue;
    }

    const dateStr = formatDate(current);

    if (!checkDates.has(dateStr)) {
      if (formatDate(today) === dateStr) {
        current.setDate(current.getDate() - 1);
        continue;
      }
      break;
    }

    streak++;
    current.setDate(current.getDate() - 1);
  }

  return streak;
}
