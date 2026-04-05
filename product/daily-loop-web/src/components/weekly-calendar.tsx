"use client";

import { getWeekDays, formatDate } from "@/lib/date-utils";

interface WeeklyCalendarProps {
  readonly today: string;
  readonly checkedDates: ReadonlySet<string>;
}

const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

export function WeeklyCalendar({ today, checkedDates }: WeeklyCalendarProps) {
  const todayDate = new Date(today + "T00:00:00");
  const weekDays = getWeekDays(todayDate);

  return (
    <div className="flex gap-2 justify-center">
      {weekDays.map((date, i) => {
        const dateStr = formatDate(date);
        const isToday = dateStr === today;
        const isChecked = checkedDates.has(dateStr);
        const isFuture = dateStr > today;

        return (
          <div key={dateStr} className="flex flex-col items-center gap-1">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {DAY_LABELS[i]}
            </span>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors ${
                isToday
                  ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-zinc-50 dark:ring-offset-zinc-950"
                  : ""
              } ${
                isChecked
                  ? "bg-indigo-500 text-white"
                  : isFuture
                    ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-300 dark:text-zinc-600"
                    : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
              }`}
            >
              {date.getDate()}
            </div>
          </div>
        );
      })}
    </div>
  );
}
