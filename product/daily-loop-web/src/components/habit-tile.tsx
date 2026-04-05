"use client";

import { toggleCheck } from "@/lib/actions";
import { useTransition } from "react";

interface HabitTileProps {
  readonly id: string;
  readonly name: string;
  readonly color: string;
  readonly streak: number;
  readonly checked: boolean;
  readonly date: string;
}

export function HabitTile({ id, name, color, streak, checked, date }: HabitTileProps) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      await toggleCheck(id, date);
    });
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
        isPending ? "opacity-50" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
      } ${checked ? "bg-zinc-50 dark:bg-zinc-800/50" : ""}`}
    >
      <div
        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
          checked
            ? "border-transparent text-white"
            : "border-zinc-300 dark:border-zinc-600"
        }`}
        style={checked ? { backgroundColor: color } : undefined}
      >
        {checked && (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      <span className={`flex-1 text-left ${checked ? "line-through text-zinc-400 dark:text-zinc-500" : ""}`}>
        {name}
      </span>

      {streak > 0 && (
        <span className="text-sm text-orange-500 font-medium">
          {streak}일
        </span>
      )}
    </button>
  );
}
