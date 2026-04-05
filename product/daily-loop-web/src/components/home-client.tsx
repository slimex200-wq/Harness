"use client";

import { useState } from "react";
import { WeeklyCalendar } from "./weekly-calendar";
import { HabitTile } from "./habit-tile";
import { AddHabitDialog } from "./add-habit-dialog";
import { useTheme } from "./theme-provider";

interface Habit {
  readonly id: string;
  readonly name: string;
  readonly color: string;
  readonly frequency: string;
  readonly customDays: string;
}

interface Check {
  readonly habitId: string;
  readonly date: string;
}

interface HomeClientProps {
  readonly habits: readonly Habit[];
  readonly todayChecks: readonly Check[];
  readonly weekChecks: readonly Check[];
  readonly streaks: Readonly<Record<string, number>>;
  readonly today: string;
  readonly dateLabel: string;
}

export function HomeClient({
  habits,
  todayChecks,
  weekChecks,
  streaks,
  today,
  dateLabel,
}: HomeClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const checkedHabitIds = new Set(todayChecks.map((c) => c.habitId));
  const checkedDates = new Set(weekChecks.map((c) => c.date));

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">DailyLoop</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setDialogOpen(true)}
            className="w-9 h-9 rounded-lg bg-indigo-500 text-white flex items-center justify-center hover:bg-indigo-600 transition-colors"
            aria-label="습관 추가"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-9 h-9 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
            aria-label="테마 전환"
          >
            <svg className="w-5 h-5 dark:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
            <svg className="w-5 h-5 hidden dark:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
            </svg>
          </button>
        </div>
      </header>

      <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4">{dateLabel}</p>

      <div className="mb-6">
        <WeeklyCalendar today={today} checkedDates={checkedDates} />
      </div>

      <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
        {habits.length === 0 ? (
          <div className="py-12 text-center text-zinc-400 dark:text-zinc-500">
            <p className="text-lg mb-2">아직 습관이 없습니다</p>
            <p className="text-sm">+ 버튼을 눌러 첫 습관을 추가하세요</p>
          </div>
        ) : (
          habits.map((habit) => (
            <HabitTile
              key={habit.id}
              id={habit.id}
              name={habit.name}
              color={habit.color}
              streak={streaks[habit.id] ?? 0}
              checked={checkedHabitIds.has(habit.id)}
              date={today}
            />
          ))
        )}
      </div>

      <AddHabitDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
