import { getHabits, getTodayChecks, getChecksForDateRange } from "@/lib/actions";
import { formatDate, formatKoreanDate, getWeekDays } from "@/lib/date-utils";
import { calculateStreak, type HabitInfo, type CheckRecord } from "@/lib/streak";
import { HomeClient } from "@/components/home-client";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const today = new Date();
  const todayStr = formatDate(today);
  const dateLabel = formatKoreanDate(today);

  const weekDays = getWeekDays(today);
  const weekStart = formatDate(weekDays[0]);
  const weekEnd = formatDate(weekDays[6]);

  const [habits, todayChecks, weekChecks] = await Promise.all([
    getHabits(),
    getTodayChecks(todayStr),
    getChecksForDateRange(weekStart, weekEnd),
  ]);

  // 스트릭 계산용 최근 90일 체크
  const ninetyDaysAgo = new Date(today);
  ninetyDaysAgo.setDate(today.getDate() - 90);
  const allChecks = await getChecksForDateRange(
    formatDate(ninetyDaysAgo),
    todayStr,
  );

  const streaks: Record<string, number> = {};
  for (const habit of habits) {
    const habitInfo: HabitInfo = {
      id: habit.id,
      frequency: habit.frequency as HabitInfo["frequency"],
      customDays: JSON.parse(habit.customDays) as number[],
    };
    const checks: CheckRecord[] = allChecks.map((c) => ({
      date: c.date,
      habitId: c.habitId,
    }));
    streaks[habit.id] = calculateStreak(habitInfo, checks, today);
  }

  return (
    <main className="min-h-screen">
      <HomeClient
        habits={habits}
        todayChecks={todayChecks}
        weekChecks={weekChecks}
        streaks={streaks}
        today={todayStr}
        dateLabel={dateLabel}
      />
    </main>
  );
}
