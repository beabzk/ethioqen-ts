import { describe, expect, it } from "vitest";

import { InvalidDateError, InvalidTimeError } from "../src/errors.js";
import { ethiopianToUnix, unixToEthiopian } from "../src/unixTime.js";

const ENKUTATASH_2015_UTC = Date.UTC(2022, 8, 11);

describe("ethiopianToUnix", () => {
  it("converts 12-hour Ethiopian times", () => {
    expect(
      ethiopianToUnix({ year: 2015, month: 1, day: 1, hour: 12, minute: 0, isPm: false }),
    ).toBe((ENKUTATASH_2015_UTC + 6 * 3_600_000) / 1000);
    expect(ethiopianToUnix({ year: 2015, month: 1, day: 1, hour: 1, minute: 0, isPm: true })).toBe(
      (ENKUTATASH_2015_UTC + 19 * 3_600_000) / 1000,
    );
  });

  it("defaults to 12 day, :00, UTC", () => {
    expect(ethiopianToUnix({ year: 2015, month: 1, day: 1 })).toBe(
      (ENKUTATASH_2015_UTC + 6 * 3_600_000) / 1000,
    );
  });

  it("applies timezone offsets", () => {
    expect(
      ethiopianToUnix({ year: 2015, month: 1, day: 1, hour: 12, minute: 0, timeZoneOffset: 3 }),
    ).toBe((ENKUTATASH_2015_UTC + 6 * 3_600_000) / 1000 - 3 * 3600);
  });

  it("rejects invalid Ethiopian dates", () => {
    expect(() => ethiopianToUnix({ year: 2015, month: 13, day: 7 })).toThrow(InvalidDateError);
    expect(() => ethiopianToUnix({ year: 2015, month: 14, day: 1 })).toThrow(InvalidDateError);
    expect(() => ethiopianToUnix({ year: 2015, month: 1, day: 31 })).toThrow(InvalidDateError);
  });

  it("rejects invalid times", () => {
    expect(() => ethiopianToUnix({ year: 2015, month: 1, day: 1, hour: 13 })).toThrow(
      InvalidTimeError,
    );
    expect(() => ethiopianToUnix({ year: 2015, month: 1, day: 1, hour: 0 })).toThrow(
      InvalidTimeError,
    );
    expect(() => ethiopianToUnix({ year: 2015, month: 1, day: 1, minute: 60 })).toThrow(
      InvalidTimeError,
    );
    expect(() => ethiopianToUnix({ year: 2015, month: 1, day: 1, second: 60 })).toThrow(
      InvalidTimeError,
    );
  });

  it("rejects non-finite timezone offsets", () => {
    expect(() =>
      ethiopianToUnix({ year: 2015, month: 1, day: 1, timeZoneOffset: Number.NaN }),
    ).toThrow(InvalidTimeError);
    expect(() =>
      ethiopianToUnix({ year: 2015, month: 1, day: 1, timeZoneOffset: Number.POSITIVE_INFINITY }),
    ).toThrow(InvalidTimeError);
    expect(() =>
      ethiopianToUnix({ year: 2015, month: 1, day: 1, timeZoneOffset: "3" as unknown as number }),
    ).toThrow(InvalidTimeError);
  });

  it("rejects years outside the Gregorian 1-9999 range", () => {
    expect(() => ethiopianToUnix({ year: 10000, month: 1, day: 1 })).toThrow(InvalidDateError);
  });

  it("rejects offsets at or beyond 24 hours like Python", () => {
    expect(() => ethiopianToUnix({ year: 2015, month: 1, day: 1, timeZoneOffset: 24 })).toThrow(
      InvalidTimeError,
    );
    expect(() => ethiopianToUnix({ year: 2015, month: 1, day: 1, timeZoneOffset: -24 })).toThrow(
      InvalidTimeError,
    );
    expect(() => unixToEthiopian(1662876000, 24)).toThrow(InvalidTimeError);
  });
});

describe("unixToEthiopian", () => {
  it("converts 12-hour Ethiopian times", () => {
    expect(unixToEthiopian((ENKUTATASH_2015_UTC + 6 * 3_600_000) / 1000)).toEqual({
      year: 2015,
      month: 1,
      day: 1,
      hour: 12,
      minute: 0,
      second: 0,
      isPm: false,
    });
    expect(unixToEthiopian((ENKUTATASH_2015_UTC + 19 * 3_600_000) / 1000)).toEqual({
      year: 2015,
      month: 1,
      day: 1,
      hour: 1,
      minute: 0,
      second: 0,
      isPm: true,
    });
  });

  it("rejects unrepresentable timestamps on every platform", () => {
    expect(() => unixToEthiopian(-62_167_219_200)).toThrow(InvalidDateError);
    expect(() => unixToEthiopian(253_402_300_800)).toThrow(InvalidDateError);
    expect(() => unixToEthiopian(2 ** 63 - 1)).toThrow(InvalidDateError);
    expect(() => unixToEthiopian(-(2 ** 63))).toThrow(InvalidDateError);
    expect(() => unixToEthiopian(Number.POSITIVE_INFINITY)).toThrow(InvalidDateError);
    expect(() => unixToEthiopian(Number.NaN)).toThrow(InvalidDateError);
  });
});

describe("round trips", () => {
  it("preserves seconds through Ethiopian -> Unix -> Ethiopian", () => {
    const input = { year: 2015, month: 1, day: 1, hour: 1, minute: 30, isPm: true, second: 45 };
    expect(unixToEthiopian(ethiopianToUnix(input))).toEqual({ ...input });
    expect(ethiopianToUnix(input)).toBe(Date.UTC(2022, 8, 11, 19, 30, 45) / 1000);
  });

  it("defaults omitted seconds to zero", () => {
    const timestamp = ethiopianToUnix({ year: 2015, month: 1, day: 1, hour: 1, minute: 30 });
    expect(timestamp).toBe(Date.UTC(2022, 8, 11, 7, 30, 0) / 1000);
    expect(unixToEthiopian(timestamp)).toEqual({
      year: 2015,
      month: 1,
      day: 1,
      hour: 1,
      minute: 30,
      second: 0,
      isPm: false,
    });
  });

  it("converts fractional timezone offsets exactly", () => {
    for (const timeZoneOffset of [0, 3, 5.5, 5.75, -5]) {
      const expected =
        Date.UTC(2022, 8, 11, 19, 30, 45) / 1000 - Math.round(timeZoneOffset * 60) * 60;
      const timestamp = ethiopianToUnix({
        year: 2015,
        month: 1,
        day: 1,
        hour: 1,
        minute: 30,
        isPm: true,
        second: 45,
        timeZoneOffset,
      });
      expect(timestamp).toBe(expected);
      expect(unixToEthiopian(timestamp, timeZoneOffset)).toEqual({
        year: 2015,
        month: 1,
        day: 1,
        hour: 1,
        minute: 30,
        second: 45,
        isPm: true,
      });
    }
  });
});
