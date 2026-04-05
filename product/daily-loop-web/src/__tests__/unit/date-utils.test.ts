import { describe, it, expect } from "vitest";
import {
  formatDate,
  getWeekDays,
  formatKoreanDate,
  isScheduledDay,
} from "@/lib/date-utils";

describe("formatDate", () => {
  it("formats date as YYYY-MM-DD", () => {
    expect(formatDate(new Date("2026-04-05"))).toBe("2026-04-05");
  });

  it("pads single digit month and day", () => {
    expect(formatDate(new Date("2026-01-03"))).toBe("2026-01-03");
  });
});

describe("getWeekDays", () => {
  it("returns 7 days starting from Monday", () => {
    const days = getWeekDays(new Date("2026-04-05")); // Saturday
    expect(days).toHaveLength(7);
    expect(days[0].getDay()).toBe(1); // Monday
    expect(days[6].getDay()).toBe(0); // Sunday
  });

  it("includes today in the week", () => {
    const today = new Date("2026-04-05");
    const days = getWeekDays(today);
    const formatted = days.map((d) => formatDate(d));
    expect(formatted).toContain("2026-04-05");
  });
});

describe("formatKoreanDate", () => {
  it("formats date in Korean", () => {
    const result = formatKoreanDate(new Date("2026-04-05"));
    expect(result).toBe("4월 5일 일요일");
  });
});

describe("isScheduledDay", () => {
  it("daily is always true", () => {
    expect(isScheduledDay("daily", [], new Date("2026-04-05"))).toBe(true);
  });

  it("weekdays excludes weekends", () => {
    expect(isScheduledDay("weekdays", [], new Date("2026-04-05"))).toBe(false); // Sunday
    expect(isScheduledDay("weekdays", [], new Date("2026-04-06"))).toBe(true); // Monday
  });

  it("custom checks specific days", () => {
    expect(isScheduledDay("custom", [1, 3], new Date("2026-04-06"))).toBe(
      true,
    ); // Monday=1
    expect(isScheduledDay("custom", [1, 3], new Date("2026-04-07"))).toBe(
      false,
    ); // Tuesday=2
  });
});
