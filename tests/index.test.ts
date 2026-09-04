import { describe, expect, it } from "vitest";

import * as api from "../src/index.js";

describe("public surface", () => {
  it("exports exactly the documented API", () => {
    expect(Object.keys(api).sort()).toEqual(
      [
        "DAYS_IN_ETH_MONTH",
        "ETHIOPIAN_EPOCH",
        "ETH_HOURS_IN_DAY",
        "HOURS_IN_DAY",
        "InvalidDateError",
        "InvalidTimeError",
        "MINUTES_IN_HOUR",
        "MONTHS_IN_ETH_YEAR",
        "VERSION",
        "convertEthiopianToGregorian",
        "convertFromEthiopianTime",
        "convertGregorianToEthiopian",
        "convertToEthiopianTime",
        "ethTo24h",
        "ethiopianToUnix",
        "getEthiopianMonthLength",
        "h24ToEth",
        "isEthiopianLeapYear",
        "isGregorianLeapYear",
        "isValidEthiopianDate",
        "isValidEthiopianHour",
        "isValidGregorianDate",
        "isValidStandardTime",
        "isValidTime",
        "unixToEthiopian",
      ].sort(),
    );
  });

  it("keeps internal helpers out of the barrel", () => {
    expect("gregorianToJdn" in api).toBe(false);
  });

  it("smoke-converts through the barrel", () => {
    expect(api.convertEthiopianToGregorian({ year: 2016, month: 1, day: 1 })).toEqual({
      year: 2023,
      month: 9,
      day: 12,
    });
    expect(api.unixToEthiopian(api.ethiopianToUnix({ year: 2015, month: 1, day: 1 }))).toEqual({
      year: 2015,
      month: 1,
      day: 1,
      hour: 12,
      minute: 0,
      second: 0,
      isPm: false,
    });
  });
});
