import { InvalidDateError } from "./errors.js";
import type { EthiopianDate, GregorianDate } from "./types.js";
import { isValidEthiopianDate, isValidGregorianDate } from "./utils.js";

// JDN of the day before Meskerem 1, year 1 (29 Aug AD 8 Julian).
// Verified against Unix-epoch, millennium, and Enkutatash anchors
// in tests/calendar.test.ts; do not change without re-verifying.
export const ETHIOPIAN_EPOCH = 1723856;

/**
 * Determine if the given Gregorian year is a leap year.
 *
 * @param year Gregorian year. Non-integers return false.
 * @returns True for leap years.
 *
 * @example
 * ```ts
 * isGregorianLeapYear(2024); // true
 * isGregorianLeapYear(1900); // false
 * ```
 */
export function isGregorianLeapYear(year: unknown): boolean {
  if (typeof year !== "number" || !Number.isInteger(year)) {
    return false;
  }
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

/** Convert an Ethiopian date to a Julian Day Number. */
function ethiopianToJdn(year: number, month: number, day: number): number {
  const yearDays = year * 365 + Math.floor(year / 4);
  const monthDays = (month - 1) * 30;
  return ETHIOPIAN_EPOCH + yearDays + monthDays + day - 1;
}

/** Days from the epoch to Meskerem 1 of the given Ethiopian year. */
function yearStartDays(year: number): number {
  return year * 365 + Math.floor(year / 4);
}

/**
 * Convert a Julian Day Number to an Ethiopian date (integer math only).
 *
 * Inverts ethiopianToJdn exactly: finds the year whose
 * [start, next start) interval contains the day, then splits the
 * remainder into uniform 30-day months. Pagume needs no special
 * casing: the remainder is always < 366, so month 13 holds at most
 * 6 days (leap years) or 5 (common years) by construction.
 */
function jdnToEthiopian(jdn: number): EthiopianDate {
  const daysSinceEpoch = jdn - ETHIOPIAN_EPOCH;

  // Estimate from the mean year length, then correct by at most one step.
  // Math.floor matches Python // for negative estimates as well.
  let year = Math.floor((4 * daysSinceEpoch) / 1461);
  while (yearStartDays(year + 1) <= daysSinceEpoch) {
    year += 1;
  }
  while (yearStartDays(year) > daysSinceEpoch) {
    year -= 1;
  }

  const remainingDays = daysSinceEpoch - yearStartDays(year);
  const month = Math.floor(remainingDays / 30) + 1;
  const day = (remainingDays % 30) + 1;

  return { year, month, day };
}

/**
 * Convert a Gregorian date to a Julian Day Number.
 *
 * @internal Shared with unixTime.ts; not part of the public barrel.
 */
export function gregorianToJdn(year: number, month: number, day: number): number {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }

  const a = Math.floor(year / 100);
  const b = 2 - a + Math.floor(a / 4);

  // Math.trunc mirrors Python int() on these positive products.
  return Math.trunc(365.25 * (year + 4716)) + Math.trunc(30.6001 * (month + 1)) + day + b - 1524;
}

/**
 * Convert a Julian Day Number to a Gregorian date
 * (Fliegel-Van Flandern algorithm; single-letter names follow it).
 */
function jdnToGregorian(jdn: number): GregorianDate {
  const y = 4716;
  const j = 1401;
  const m = 2;
  const n = 12;
  const r = 4;
  const p = 1461;
  const v = 3;
  const u = 5;
  const s = 153;
  const w = 2;
  const bigB = 274277;
  const c = -38;

  const f = jdn + j + Math.floor((Math.floor((4 * jdn + bigB) / 146097) * 3) / 4) + c;
  const e = r * f + v;
  const g = Math.floor((e % p) / r);
  const h = u * g + w;

  const day = Math.floor((h % s) / u) + 1;
  const month = (Math.floor(h / s + m) % n) + 1;
  const year = Math.floor(e / p) - y + Math.floor((n + m - month) / n);

  return { year, month, day };
}

/**
 * Convert an Ethiopian date to Gregorian.
 *
 * @param date Ethiopian date (year >= 1, month 1-13, day 1-30 or 1-5/6).
 * @returns Equivalent Gregorian date.
 * @throws {InvalidDateError} If the Ethiopian date is invalid.
 *
 * @example
 * ```ts
 * convertEthiopianToGregorian({ year: 2016, month: 1, day: 1 });
 * // { year: 2023, month: 9, day: 12 }
 * ```
 */
export function convertEthiopianToGregorian(date: EthiopianDate): GregorianDate {
  const { year, month, day } = date;
  if (!isValidEthiopianDate(year, month, day)) {
    throw new InvalidDateError(
      `Invalid Ethiopian date: ${String(year)}-${String(month)}-${String(day)}`,
    );
  }
  return jdnToGregorian(ethiopianToJdn(year, month, day));
}

/**
 * Convert a Gregorian date to Ethiopian.
 *
 * @param date Gregorian date (year >= 1, month 1-12, valid day of month).
 * @returns Equivalent Ethiopian date.
 * @throws {InvalidDateError} If the Gregorian date is invalid
 * (e.g. 2023-02-29 or 2023-04-31).
 *
 * @example
 * ```ts
 * convertGregorianToEthiopian({ year: 2023, month: 9, day: 12 });
 * // { year: 2016, month: 1, day: 1 }
 * ```
 */
export function convertGregorianToEthiopian(date: GregorianDate): EthiopianDate {
  const { year, month, day } = date;
  if (!isValidGregorianDate(year, month, day)) {
    throw new InvalidDateError(
      `Invalid Gregorian date: ${String(year)}-${String(month)}-${String(day)}`,
    );
  }
  return jdnToEthiopian(gregorianToJdn(year, month, day));
}
