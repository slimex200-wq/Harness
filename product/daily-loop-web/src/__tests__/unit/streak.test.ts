import { describe, it, expect } from "vitest";
import { calculateStreak, type HabitInfo, type CheckRecord } from "@/lib/streak";

const dailyHabit: HabitInfo = {
  id: "h1",
  frequency: "daily",
  customDays: [],
};

const weekdayHabit: HabitInfo = {
  id: "h2",
  frequency: "weekdays",
  customDays: [],
};

const customHabit: HabitInfo = {
  id: "h3",
  frequency: "custom",
  customDays: [1, 3, 5], // Mon, Wed, Fri
};

function check(date: string, habitId: string): CheckRecord {
  return { date, habitId };
}

describe("calculateStreak", () => {
  it("returns 0 for no checks", () => {
    const today = new Date("2026-04-05");
    expect(calculateStreak(dailyHabit, [], today)).toBe(0);
  });

  it("returns streak for consecutive daily checks", () => {
    const today = new Date("2026-04-05");
    const checks = [
      check("2026-04-05", "h1"),
      check("2026-04-04", "h1"),
      check("2026-04-03", "h1"),
    ];
    expect(calculateStreak(dailyHabit, checks, today)).toBe(3);
  });

  it("breaks streak on missed day", () => {
    const today = new Date("2026-04-05");
    const checks = [
      check("2026-04-05", "h1"),
      check("2026-04-04", "h1"),
      // 04-03 missed
      check("2026-04-02", "h1"),
    ];
    expect(calculateStreak(dailyHabit, checks, today)).toBe(2);
  });

  it("counts from yesterday if today not yet done", () => {
    const today = new Date("2026-04-05");
    const checks = [
      check("2026-04-04", "h1"),
      check("2026-04-03", "h1"),
    ];
    expect(calculateStreak(dailyHabit, checks, today)).toBe(2);
  });

  it("returns 0 if yesterday also missed", () => {
    const today = new Date("2026-04-05");
    const checks = [check("2026-04-02", "h1")];
    expect(calculateStreak(dailyHabit, checks, today)).toBe(0);
  });

  it("skips weekends for weekday habits", () => {
    // 2026-04-06 is Monday
    const today = new Date("2026-04-06");
    const checks = [
      check("2026-04-06", "h2"), // Mon
      check("2026-04-03", "h2"), // Fri
      check("2026-04-02", "h2"), // Thu
    ];
    // Sat(04) and Sun(05) are skipped
    expect(calculateStreak(weekdayHabit, checks, today)).toBe(3);
  });

  it("handles custom days correctly", () => {
    // customDays: [1, 3, 5] = Mon, Wed, Fri
    // 2026-04-03 is Friday
    const today = new Date("2026-04-03");
    const checks = [
      check("2026-04-03", "h3"), // Fri
      check("2026-04-01", "h3"), // Wed
      check("2026-03-30", "h3"), // Mon
    ];
    expect(calculateStreak(customHabit, checks, today)).toBe(3);
  });

  it("ignores checks for other habits", () => {
    const today = new Date("2026-04-05");
    const checks = [
      check("2026-04-05", "h1"),
      check("2026-04-04", "other"),
      check("2026-04-04", "h1"),
    ];
    expect(calculateStreak(dailyHabit, checks, today)).toBe(2);
  });
});
