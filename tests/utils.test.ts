import { describe, expect, it } from "vitest";

import { InvalidDateError } from "../src/errors.js";
import {
  DAYS_IN_ETH_MONTH,
  ETH_HOURS_IN_DAY,
  HOURS_IN_DAY,
  MINUTES_IN_HOUR,
  MONTHS_IN_ETH_YEAR,
  getEthiopianMonthLength,
  isEthiopianLeapYear,
  isValidEthiopianDate,
  isValidEthiopianHour,
  isValidGregorianDate,
  isValidStandardTime,
  isValidTime,
} from "../src/utils.js";

describe("constants", () => {
  it("matches the Ethiopian calendar structure", () => {
    expect(DAYS_IN_ETH_MONTH).toBe(30);
    expect(MONTHS_IN_ETH_YEAR).toBe(13);
    expect(HOURS_IN_DAY).toBe(24);
    expect(MINUTES_IN_HOUR).toBe(60);
    expect(ETH_HOURS_IN_DAY).toBe(12);
  });
});

describe("isEthiopianLeapYear", () => {
  it("follows the 4-year cycle (year % 4 == 3)", () => {
    expect(isEthiopianLeapYear(2015)).toBe(true);
    expect(isEthiopianLeapYear(2016)).toBe(false);
    expect(isEthiopianLeapYear(2019)).toBe(true);
  });

  it("rejects non-integers instead of throwing", () => {
    expect(isEthiopianLeapYear("2015")).toBe(false);
    expect(isEthiopianLeapYear(2015.5)).toBe(false);
    expect(isEthiopianLeapYear(true)).toBe(false);
    expect(isEthiopianLeapYear(NaN)).toBe(false);
    expect(isEthiopianLeapYear(null)).toBe(false);
    expect(isEthiopianLeapYear(undefined)).toBe(false);
  });
});

describe("getEthiopianMonthLength", () => {
  it("returns 30 for months 1-12", () => {
    expect(getEthiopianMonthLength(2016, 1)).toBe(30);
    expect(getEthiopianMonthLength(2016, 12)).toBe(30);
  });

  it("returns 6 for Pagume in a leap year, 5 otherwise", () => {
    expect(getEthiopianMonthLength(2015, 13)).toBe(6);
    expect(getEthiopianMonthLength(2016, 13)).toBe(5);
  });

  it("throws InvalidDateError for a month outside 1-13", () => {
    expect(() => getEthiopianMonthLength(2016, 0)).toThrow(InvalidDateError);
    expect(() => getEthiopianMonthLength(2016, 14)).toThrow(InvalidDateError);
    expect(() => getEthiopianMonthLength(2016, "1")).toThrow(InvalidDateError);
  });
});

describe("isValidEthiopianDate", () => {
  it("accepts New Year, leap Pagume 6, and common Pagume 5", () => {
    expect(isValidEthiopianDate(2015, 1, 1)).toBe(true);
    expect(isValidEthiopianDate(2015, 13, 6)).toBe(true);
    expect(isValidEthiopianDate(2016, 13, 5)).toBe(true);
  });

  it("rejects out-of-range months and days", () => {
    expect(isValidEthiopianDate(2015, 0, 1)).toBe(false);
    expect(isValidEthiopianDate(2015, 14, 1)).toBe(false);
    expect(isValidEthiopianDate(2015, 1, 0)).toBe(false);
    expect(isValidEthiopianDate(2015, 1, 31)).toBe(false);
    expect(isValidEthiopianDate(2016, 13, 6)).toBe(false);
  });

  it("rejects year 0 and negative years", () => {
    expect(isValidEthiopianDate(0, 1, 1)).toBe(false);
    expect(isValidEthiopianDate(-1, 1, 1)).toBe(false);
  });

  it("rejects non-integer components instead of throwing", () => {
    expect(isValidEthiopianDate("2015", 1, 1)).toBe(false);
    expect(isValidEthiopianDate(2015, "1", 1)).toBe(false);
    expect(isValidEthiopianDate(2015, 1, "1")).toBe(false);
    expect(isValidEthiopianDate(2015.5, 1, 1)).toBe(false);
    expect(isValidEthiopianDate(true, 1, 1)).toBe(false);
    expect(isValidEthiopianDate(2015, 1, null)).toBe(false);
    expect(isValidEthiopianDate(2015, 1, undefined)).toBe(false);
    expect(isValidEthiopianDate(NaN, 1, 1)).toBe(false);
  });
});

describe("isValidGregorianDate", () => {
  it("accepts leap days and ordinary dates", () => {
    expect(isValidGregorianDate(2024, 2, 29)).toBe(true);
    expect(isValidGregorianDate(2023, 9, 11)).toBe(true);
    expect(isValidGregorianDate(2000, 2, 29)).toBe(true);
    expect(isValidGregorianDate(2022, 12, 31)).toBe(true);
    expect(isValidGregorianDate(1, 1, 1)).toBe(true);
  });

  it("rejects impossible dates", () => {
    expect(isValidGregorianDate(2023, 2, 29)).toBe(false);
    expect(isValidGregorianDate(1900, 2, 29)).toBe(false);
    expect(isValidGregorianDate(2024, 2, 30)).toBe(false);
    expect(isValidGregorianDate(2023, 4, 31)).toBe(false);
    expect(isValidGregorianDate(2023, 0, 10)).toBe(false);
    expect(isValidGregorianDate(2023, 13, 10)).toBe(false);
    expect(isValidGregorianDate(2023, 1, 0)).toBe(false);
    expect(isValidGregorianDate(2023, 1, 32)).toBe(false);
    expect(isValidGregorianDate(0, 1, 1)).toBe(false);
    expect(isValidGregorianDate(-44, 3, 15)).toBe(false);
  });

  it("rejects non-integer components instead of throwing", () => {
    expect(isValidGregorianDate("2023", 1, 1)).toBe(false);
    expect(isValidGregorianDate(2023, 1, null)).toBe(false);
    expect(isValidGregorianDate(2023, 1, 1.5)).toBe(false);
    expect(isValidGregorianDate(2023, 1, undefined)).toBe(false);
  });
});

describe("isValidEthiopianHour", () => {
  it("accepts the 1-12 clock face", () => {
    expect(isValidEthiopianHour(1, 0)).toBe(true);
    expect(isValidEthiopianHour(12, 59)).toBe(true);
  });

  it("rejects 0, 13, and out-of-range minutes", () => {
    expect(isValidEthiopianHour(0, 0)).toBe(false);
    expect(isValidEthiopianHour(13, 0)).toBe(false);
    expect(isValidEthiopianHour(6, 60)).toBe(false);
    expect(isValidEthiopianHour(6, -1)).toBe(false);
  });

  it("rejects non-integer components instead of throwing", () => {
    expect(isValidEthiopianHour("6", 0)).toBe(false);
    expect(isValidEthiopianHour(6, "0")).toBe(false);
    expect(isValidEthiopianHour(true, 0)).toBe(false);
  });
});

describe("isValidStandardTime", () => {
  it("accepts the 0-23 range", () => {
    expect(isValidStandardTime(0, 0)).toBe(true);
    expect(isValidStandardTime(23, 59)).toBe(true);
  });

  it("rejects hours and minutes outside range", () => {
    expect(isValidStandardTime(24, 0)).toBe(false);
    expect(isValidStandardTime(-1, 0)).toBe(false);
    expect(isValidStandardTime(12, 60)).toBe(false);
    expect(isValidStandardTime(12, -1)).toBe(false);
  });

  it("rejects non-integer components instead of throwing", () => {
    expect(isValidStandardTime("12", 0)).toBe(false);
    expect(isValidStandardTime(12, null)).toBe(false);
  });
});

describe("isValidTime", () => {
  it("is the standard 24-hour validator", () => {
    expect(isValidTime).toBe(isValidStandardTime);
    expect(isValidTime(23, 59)).toBe(true);
    expect(isValidTime(24, 0)).toBe(false);
  });
});
