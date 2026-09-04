import { describe, expect, it } from "vitest";

import {
  ETHIOPIAN_EPOCH,
  convertEthiopianToGregorian,
  convertGregorianToEthiopian,
  isGregorianLeapYear,
} from "../src/calendar.js";
import { InvalidDateError } from "../src/errors.js";
import type { EthiopianDate, GregorianDate } from "../src/types.js";
import { isEthiopianLeapYear } from "../src/utils.js";

describe("isEthiopianLeapYear", () => {
  it("follows the 4-year cycle", () => {
    expect(isEthiopianLeapYear(2015)).toBe(true);
    expect(isEthiopianLeapYear(2016)).toBe(false);
    expect(isEthiopianLeapYear(2019)).toBe(true);
  });
});

describe("isGregorianLeapYear", () => {
  it("applies the century exception", () => {
    expect(isGregorianLeapYear(2020)).toBe(true);
    expect(isGregorianLeapYear(2021)).toBe(false);
    expect(isGregorianLeapYear(2000)).toBe(true);
    expect(isGregorianLeapYear(1900)).toBe(false);
  });

  it("rejects non-integers instead of throwing", () => {
    expect(isGregorianLeapYear("2020")).toBe(false);
    expect(isGregorianLeapYear(2020.5)).toBe(false);
    expect(isGregorianLeapYear(true)).toBe(false);
    expect(isGregorianLeapYear(NaN)).toBe(false);
  });
});

describe("convertEthiopianToGregorian", () => {
  it("converts known dates", () => {
    expect(convertEthiopianToGregorian({ year: 2015, month: 1, day: 1 })).toEqual({
      year: 2022,
      month: 9,
      day: 11,
    });
    expect(convertEthiopianToGregorian({ year: 2015, month: 13, day: 6 })).toEqual({
      year: 2023,
      month: 9,
      day: 11,
    });
    expect(convertEthiopianToGregorian({ year: 2015, month: 5, day: 1 })).toEqual({
      year: 2023,
      month: 1,
      day: 9,
    });
  });

  it("handles Pagume and Meskerem boundaries", () => {
    expect(convertEthiopianToGregorian({ year: 2015, month: 13, day: 1 })).toEqual({
      year: 2023,
      month: 9,
      day: 6,
    });
    expect(convertEthiopianToGregorian({ year: 2015, month: 13, day: 5 })).toEqual({
      year: 2023,
      month: 9,
      day: 10,
    });
    expect(convertEthiopianToGregorian({ year: 2016, month: 1, day: 1 })).toEqual({
      year: 2023,
      month: 9,
      day: 12,
    });
    expect(convertEthiopianToGregorian({ year: 2016, month: 1, day: 5 })).toEqual({
      year: 2023,
      month: 9,
      day: 16,
    });
    expect(convertEthiopianToGregorian({ year: 2014, month: 13, day: 1 })).toEqual({
      year: 2022,
      month: 9,
      day: 6,
    });
    expect(convertEthiopianToGregorian({ year: 2014, month: 13, day: 5 })).toEqual({
      year: 2022,
      month: 9,
      day: 10,
    });
    expect(convertEthiopianToGregorian({ year: 2015, month: 1, day: 1 })).toEqual({
      year: 2022,
      month: 9,
      day: 11,
    });
  });

  it("rejects invalid Ethiopian dates", () => {
    expect(() => convertEthiopianToGregorian({ year: 2015, month: 14, day: 1 })).toThrow(
      InvalidDateError,
    );
    expect(() => convertEthiopianToGregorian({ year: 2015, month: 1, day: 31 })).toThrow(
      InvalidDateError,
    );
    expect(() => convertEthiopianToGregorian({ year: 2016, month: 13, day: 6 })).toThrow(
      InvalidDateError,
    );
  });
});

describe("convertGregorianToEthiopian", () => {
  it("converts known dates", () => {
    expect(convertGregorianToEthiopian({ year: 2023, month: 9, day: 6 })).toEqual({
      year: 2015,
      month: 13,
      day: 1,
    });
    expect(convertGregorianToEthiopian({ year: 2023, month: 9, day: 11 })).toEqual({
      year: 2015,
      month: 13,
      day: 6,
    });
    expect(convertGregorianToEthiopian({ year: 2023, month: 9, day: 12 })).toEqual({
      year: 2016,
      month: 1,
      day: 1,
    });
    expect(convertGregorianToEthiopian({ year: 2023, month: 9, day: 16 })).toEqual({
      year: 2016,
      month: 1,
      day: 5,
    });
    expect(convertGregorianToEthiopian({ year: 2022, month: 9, day: 6 })).toEqual({
      year: 2014,
      month: 13,
      day: 1,
    });
    expect(convertGregorianToEthiopian({ year: 2022, month: 9, day: 10 })).toEqual({
      year: 2014,
      month: 13,
      day: 5,
    });
    expect(convertGregorianToEthiopian({ year: 2022, month: 9, day: 11 })).toEqual({
      year: 2015,
      month: 1,
      day: 1,
    });
  });

  it("rejects impossible Gregorian dates", () => {
    const bad: Array<[number, number, number]> = [
      [2023, 2, 29],
      [1900, 2, 29],
      [2023, 4, 31],
      [2023, 6, 31],
      [2023, 9, 31],
      [2023, 11, 31],
      [2023, 0, 10],
      [2023, 13, 10],
      [2023, 1, 0],
      [2023, 1, 32],
      [0, 1, 1],
      [-44, 3, 15],
    ];
    for (const [year, month, day] of bad) {
      expect(() => convertGregorianToEthiopian({ year, month, day })).toThrow(InvalidDateError);
    }
  });

  it("rejects non-integer components", () => {
    expect(() =>
      convertGregorianToEthiopian({ year: "2023", month: 1, day: 1 } as unknown as GregorianDate),
    ).toThrow(InvalidDateError);
    expect(() =>
      convertGregorianToEthiopian({ year: 2023, month: 1, day: 1.5 } as unknown as GregorianDate),
    ).toThrow(InvalidDateError);
    expect(() =>
      convertGregorianToEthiopian({ year: 2023, month: 1, day: null } as unknown as GregorianDate),
    ).toThrow(InvalidDateError);
  });
});

describe("round trips", () => {
  it("converts Ethiopian dates back and forth", () => {
    const dates: EthiopianDate[] = [
      { year: 2015, month: 1, day: 1 },
      { year: 2015, month: 7, day: 15 },
      { year: 2015, month: 13, day: 5 },
      { year: 2015, month: 13, day: 6 },
      { year: 2016, month: 1, day: 1 },
    ];
    for (const date of dates) {
      expect(convertGregorianToEthiopian(convertEthiopianToGregorian(date))).toEqual(date);
    }
  });
});

describe("anchors", () => {
  it("pins the epoch constant", () => {
    expect(ETHIOPIAN_EPOCH).toBe(1723856);
  });

  it("maps the Unix epoch to Tahsas 23, 1962 (JDN 2440588)", () => {
    expect(convertGregorianToEthiopian({ year: 1970, month: 1, day: 1 })).toEqual({
      year: 1962,
      month: 4,
      day: 23,
    });
    expect(convertEthiopianToGregorian({ year: 1962, month: 4, day: 23 })).toEqual({
      year: 1970,
      month: 1,
      day: 1,
    });
  });

  it("maps Meskerem 1, 2000 to 12 Sep 2007 Gregorian", () => {
    expect(convertEthiopianToGregorian({ year: 2000, month: 1, day: 1 })).toEqual({
      year: 2007,
      month: 9,
      day: 12,
    });
    expect(convertGregorianToEthiopian({ year: 2007, month: 9, day: 12 })).toEqual({
      year: 2000,
      month: 1,
      day: 1,
    });
  });

  it("maps recent Enkutatash dates", () => {
    expect(convertEthiopianToGregorian({ year: 2018, month: 1, day: 1 })).toEqual({
      year: 2025,
      month: 9,
      day: 11,
    });
    expect(convertGregorianToEthiopian({ year: 2025, month: 9, day: 11 })).toEqual({
      year: 2018,
      month: 1,
      day: 1,
    });
    expect(convertEthiopianToGregorian({ year: 2019, month: 1, day: 1 })).toEqual({
      year: 2026,
      month: 9,
      day: 11,
    });
    expect(convertGregorianToEthiopian({ year: 2026, month: 9, day: 11 })).toEqual({
      year: 2019,
      month: 1,
      day: 1,
    });
  });

  it("maps Meskerem 1, year 1 to 27 Aug AD 8 proleptic Gregorian", () => {
    expect(convertEthiopianToGregorian({ year: 1, month: 1, day: 1 })).toEqual({
      year: 8,
      month: 8,
      day: 27,
    });
    expect(convertGregorianToEthiopian({ year: 8, month: 8, day: 27 })).toEqual({
      year: 1,
      month: 1,
      day: 1,
    });
  });

  it("maps Gregorian leap day 2024-02-29 to Yekatit 21, 2016", () => {
    expect(convertGregorianToEthiopian({ year: 2024, month: 2, day: 29 })).toEqual({
      year: 2016,
      month: 6,
      day: 21,
    });
    expect(convertEthiopianToGregorian({ year: 2016, month: 6, day: 21 })).toEqual({
      year: 2024,
      month: 2,
      day: 29,
    });
  });
});

describe("sweeps", () => {
  it("every ~30 days from 1900 to 2100 survives Gregorian -> Ethiopian -> Gregorian", () => {
    // All years are >= 100, so Date.UTC is exact here (the 0-99 pitfall
    // only affects two-digit years, which this range never touches).
    let time = Date.UTC(1900, 0, 1);
    const end = Date.UTC(2100, 11, 31);
    let count = 0;
    while (time <= end) {
      const date = new Date(time);
      const gregorian: GregorianDate = {
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        day: date.getUTCDate(),
      };
      expect(convertEthiopianToGregorian(convertGregorianToEthiopian(gregorian))).toEqual(
        gregorian,
      );
      time += 30 * 86_400_000;
      count += 1;
    }
    expect(count).toBeGreaterThan(2400);
  });

  it("sampled Ethiopian dates from 1892 to 2092 survive Ethiopian -> Gregorian -> Ethiopian", () => {
    let count = 0;
    for (let year = 1892; year < 2093; year += 4) {
      const samples: Array<[number, number]> = [
        [1, 1],
        [6, 15],
        [12, 30],
        [13, 1],
        [13, 5],
      ];
      for (const [month, day] of samples) {
        const date: EthiopianDate = { year, month, day };
        expect(convertGregorianToEthiopian(convertEthiopianToGregorian(date))).toEqual(date);
        count += 1;
      }
    }
    for (let year = 1891; year < 2092; year += 4) {
      const date: EthiopianDate = { year, month: 13, day: 6 };
      expect(convertGregorianToEthiopian(convertEthiopianToGregorian(date))).toEqual(date);
      count += 1;
    }
    expect(count).toBeGreaterThan(300);
  });
});
