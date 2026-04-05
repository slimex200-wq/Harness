"use client";

import { useState, useTransition } from "react";
import { createHabit } from "@/lib/actions";

const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#06b6d4", "#3b82f6", "#64748b", "#78716c",
];

interface AddHabitDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
}

export function AddHabitDialog({ open, onClose }: AddHabitDialogProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [frequency, setFrequency] = useState("daily");
  const [isPending, startTransition] = useTransition();

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    startTransition(async () => {
      await createHabit({ name: name.trim(), color, frequency });
      setName("");
      setColor(COLORS[0]);
      setFrequency("daily");
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">습관 추가</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="습관 이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            autoFocus
            className="w-full px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <div>
            <label className="text-sm text-zinc-500 dark:text-zinc-400 mb-2 block">색상</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    color === c ? "scale-125 ring-2 ring-offset-2 ring-zinc-400 dark:ring-offset-zinc-900" : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-zinc-500 dark:text-zinc-400 mb-2 block">반복</label>
            <div className="flex gap-2">
              {[
                { value: "daily", label: "매일" },
                { value: "weekdays", label: "평일" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFrequency(opt.value)}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    frequency === opt.value
                      ? "bg-indigo-500 text-white"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isPending || !name.trim()}
              className="px-4 py-2 rounded-lg text-sm bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-50"
            >
              {isPending ? "추가 중..." : "추가"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
