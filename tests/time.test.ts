import { describe, expect, it } from "vitest";

import { InvalidTimeError } from "../src/errors.js";
import {
  convertFromEthiopianTime,
  convertToEthiopianTime,
  ethTo24h,
  h24ToEth,
} from "../src/time.js";

describe("convertToEthiopianTime with 12-hour input", () => {
  it("converts AM/PM inputs", () => {
    expect(convertToEthiopianTime({ hour: 7, minute: 0, period: "AM" })).toEqual({
      hour: 1,
      minute: 0,
      isPm: false,
    });
    expect(convertToEthiopianTime({ hour: 12, minute: 0, period: "PM" })).toEqual({
      hour: 6,
      minute: 0,
      isPm: false,
    });
    expect(convertToEthiopianTime({ hour: 7, minute: 0, period: "PM" })).toEqual({
      hour: 1,
      minute: 0,
      isPm: true,
    });
    expect(convertToEthiopianTime({ hour: 12, minute: 0, period: "AM" })).toEqual({
      hour: 6,
      minute: 0,
      isPm: true,
    });
  });

  it("accepts lowercase periods", () => {
    expect(convertToEthiopianTime({ hour: 7, minute: 0, period: "pm" })).toEqual({
      hour: 1,
      minute: 0,
      isPm: true,
    });
  });
});

describe("minutes preserved", () => {
  it("keeps minutes through both directions", () => {
    expect(convertToEthiopianTime({ hour: 6, minute: 30 })).toEqual({
      hour: 12,
      minute: 30,
      isPm: false,
    });
    expect(convertToEthiopianTime({ hour: 18, minute: 45 })).toEqual({
      hour: 12,
      minute: 45,
      isPm: true,
    });
    expect(convertFromEthiopianTime({ hour: 12, minute: 30, isPm: false })).toEqual({
      hour: 6,
      minute: 30,
    });
    expect(convertFromEthiopianTime({ hour: 12, minute: 45, isPm: true })).toEqual({
      hour: 18,
      minute: 45,
    });
  });
});

describe("invalid standard time", () => {
  it("throws on out-of-range hours and minutes", () => {
    expect(() => convertToEthiopianTime({ hour: 24, minute: 0 })).toThrow(InvalidTimeError);
    expect(() => convertToEthiopianTime({ hour: -1, minute: 0 })).toThrow(InvalidTimeError);
    expect(() => convertToEthiopianTime({ hour: 12, minute: 60 })).toThrow(InvalidTimeError);
    expect(() => convertToEthiopianTime({ hour: 12, minute: -1 })).toThrow(InvalidTimeError);
  });

  it("throws on bad periods", () => {
    expect(() => convertToEthiopianTime({ hour: 7, minute: 0, period: "invalid" })).toThrow(
      InvalidTimeError,
    );
    expect(() =>
      convertToEthiopianTime({ hour: 7, minute: 0, period: 5 as unknown as string }),
    ).toThrow(InvalidTimeError);
  });
});

describe("invalid Ethiopian time", () => {
  it("throws on out-of-range Ethiopian hours and minutes", () => {
    expect(() => convertFromEthiopianTime({ hour: 13, minute: 0, isPm: false })).toThrow(
      InvalidTimeError,
    );
    expect(() => convertFromEthiopianTime({ hour: 0, minute: 0, isPm: false })).toThrow(
      InvalidTimeError,
    );
    expect(() => convertFromEthiopianTime({ hour: 6, minute: 60, isPm: false })).toThrow(
      InvalidTimeError,
    );
    expect(() => convertFromEthiopianTime({ hour: 6, minute: -1, isPm: true })).toThrow(
      InvalidTimeError,
    );
  });

  it("throws from the helpers on bad hours", () => {
    expect(() => ethTo24h(13, false)).toThrow(InvalidTimeError);
    expect(() => ethTo24h(0, true)).toThrow(InvalidTimeError);
    expect(() => h24ToEth(24)).toThrow(InvalidTimeError);
    expect(() => h24ToEth(-1)).toThrow(InvalidTimeError);
  });
});

describe("round trips", () => {
  it("converts standard times back and forth", () => {
    const cases: Array<[number, number]> = [
      [6, 0],
      [7, 0],
      [12, 0],
      [18, 0],
      [0, 0],
      [3, 0],
    ];
    for (const [hour, minute] of cases) {
      const eth = convertToEthiopianTime({ hour, minute });
      expect(convertFromEthiopianTime(eth)).toEqual({ hour, minute });
    }
  });
});

describe("canonical helpers", () => {
  it("shares a single 6-hour shift", () => {
    expect(ethTo24h(12, false)).toBe(6);
    expect(ethTo24h(1, false)).toBe(7);
    expect(ethTo24h(6, false)).toBe(12);
    expect(ethTo24h(12, true)).toBe(18);
    expect(ethTo24h(1, true)).toBe(19);
    expect(ethTo24h(6, true)).toBe(0);
    expect(h24ToEth(6)).toEqual({ hour: 12, isPm: false });
    expect(h24ToEth(7)).toEqual({ hour: 1, isPm: false });
    expect(h24ToEth(12)).toEqual({ hour: 6, isPm: false });
    expect(h24ToEth(18)).toEqual({ hour: 12, isPm: true });
    expect(h24ToEth(19)).toEqual({ hour: 1, isPm: true });
    expect(h24ToEth(0)).toEqual({ hour: 6, isPm: true });
  });
});

describe("isPm convention", () => {
  it("marks day false and night true", () => {
    expect(convertToEthiopianTime({ hour: 6, minute: 0 })).toEqual({
      hour: 12,
      minute: 0,
      isPm: false,
    });
    expect(convertToEthiopianTime({ hour: 7, minute: 0 })).toEqual({
      hour: 1,
      minute: 0,
      isPm: false,
    });
    expect(convertToEthiopianTime({ hour: 12, minute: 0 })).toEqual({
      hour: 6,
      minute: 0,
      isPm: false,
    });
    expect(convertToEthiopianTime({ hour: 14, minute: 30 })).toEqual({
      hour: 8,
      minute: 30,
      isPm: false,
    });
    expect(convertToEthiopianTime({ hour: 18, minute: 0 })).toEqual({
      hour: 12,
      minute: 0,
      isPm: true,
    });
    expect(convertToEthiopianTime({ hour: 19, minute: 0 })).toEqual({
      hour: 1,
      minute: 0,
      isPm: true,
    });
    expect(convertToEthiopianTime({ hour: 0, minute: 0 })).toEqual({
      hour: 6,
      minute: 0,
      isPm: true,
    });
    expect(convertToEthiopianTime({ hour: 3, minute: 0 })).toEqual({
      hour: 9,
      minute: 0,
      isPm: true,
    });

    expect(convertFromEthiopianTime({ hour: 12, minute: 0, isPm: false })).toEqual({
      hour: 6,
      minute: 0,
    });
    expect(convertFromEthiopianTime({ hour: 1, minute: 0, isPm: false })).toEqual({
      hour: 7,
      minute: 0,
    });
    expect(convertFromEthiopianTime({ hour: 6, minute: 0, isPm: false })).toEqual({
      hour: 12,
      minute: 0,
    });
    expect(convertFromEthiopianTime({ hour: 12, minute: 0, isPm: true })).toEqual({
      hour: 18,
      minute: 0,
    });
    expect(convertFromEthiopianTime({ hour: 1, minute: 0, isPm: true })).toEqual({
      hour: 19,
      minute: 0,
    });
    expect(convertFromEthiopianTime({ hour: 6, minute: 0, isPm: true })).toEqual({
      hour: 0,
      minute: 0,
    });
    expect(convertFromEthiopianTime({ hour: 9, minute: 0, isPm: true })).toEqual({
      hour: 3,
      minute: 0,
    });
  });
});

describe("period misuse", () => {
  it("rejects a period combined with an hour outside 1-12", () => {
    expect(() => convertToEthiopianTime({ hour: 14, minute: 30, period: "PM" })).toThrow(
      InvalidTimeError,
    );
    expect(() => convertToEthiopianTime({ hour: 0, minute: 30, period: "AM" })).toThrow(
      InvalidTimeError,
    );
    expect(() => convertToEthiopianTime({ hour: 13, minute: 0, period: "PM" })).toThrow(
      InvalidTimeError,
    );
    expect(() => convertToEthiopianTime({ hour: 24, minute: 0, period: "AM" })).toThrow(
      InvalidTimeError,
    );
  });
});

describe("sweeps", () => {
  it("every hour survives standard -> Ethiopian -> standard", () => {
    for (let hour = 0; hour < 24; hour += 1) {
      const eth = convertToEthiopianTime({ hour, minute: 0 });
      expect(eth.minute).toBe(0);
      expect(convertFromEthiopianTime(eth)).toEqual({ hour, minute: 0 });
    }
  });

  it("round trips hold across representative minutes", () => {
    for (const hour of [0, 5, 6, 11, 12, 17, 18, 23]) {
      for (const minute of [0, 1, 15, 30, 45, 59]) {
        const eth = convertToEthiopianTime({ hour, minute });
        expect(eth.minute).toBe(minute);
        expect(convertFromEthiopianTime(eth)).toEqual({ hour, minute });
      }
    }
  });
});
