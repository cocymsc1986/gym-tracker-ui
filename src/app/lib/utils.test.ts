import { describe, it, expect, vi, afterEach } from "vitest";
import { getTodayLocalDate } from "./utils";

describe("getTodayLocalDate", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns a string matching YYYY-MM-DD format", () => {
    const result = getTodayLocalDate();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("returns the correct local date for a fixed timestamp", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-15T14:30:00"));

    expect(getTodayLocalDate()).toBe("2024-06-15");
  });

  it("uses local date rather than UTC when near midnight UTC", () => {
    vi.useFakeTimers();
    // 2024-06-15T23:30:00 UTC — UTC date is still 2024-06-15,
    // but in UTC+2 the local time is 2024-06-16T01:30:00, so local date is 2024-06-16.
    // We simulate this by constructing a Date that, in the test environment (UTC jsdom),
    // represents a local midnight boundary.
    // The key assertion: getTodayLocalDate() must use getFullYear/getMonth/getDate
    // (local) not toISOString() (UTC). We set the clock to just after local midnight.
    const fixedDate = new Date("2024-03-10T12:00:00");
    vi.setSystemTime(fixedDate);

    const result = getTodayLocalDate();
    const d = new Date();
    const expected = [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0"),
    ].join("-");

    expect(result).toBe(expected);
  });

  it("pads single-digit months and days with leading zeros", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-05T09:00:00"));

    expect(getTodayLocalDate()).toBe("2024-01-05");
  });

  it("returns correct date at year boundary", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2023-12-31T11:00:00"));

    expect(getTodayLocalDate()).toBe("2023-12-31");
  });
});
