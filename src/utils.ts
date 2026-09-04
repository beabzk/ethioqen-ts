import { InvalidDateError } from "./errors.js";

/** Days in each of the first 12 Ethiopian months. */
export const DAYS_IN_ETH_MONTH = 30;

/** Months in an Ethiopian year (12 of 30 days plus Pagume). */
export const MONTHS_IN_ETH_YEAR = 13;

/** Hours in a standard day (0-23 clock). */
export const HOURS_IN_DAY = 24;

/** Minutes in an hour. */
export const MINUTES_IN_HOUR = 60;

/** Hours on the Ethiopian clock face (1-12, twice per day). */
export const ETH_HOURS_IN_DAY = 12;

/**
 * Strict integer check: booleans, NaN, Infinity, and non-numbers fail.
 *
 * @param value Value to check.
 * @returns True only for genuine integers.
 */
function isInt(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value);
}

/**
 * Determine if the given Ethiopian year is a leap year.
 *
 * Ethiopia follows a simple 4-year cycle: a year is a leap year when
 * `year % 4 == 3`, giving Pagume 6 days instead of 5.
 *
 * @param year Ethiopian year. Non-integers return false.
 * @returns True for leap years.
 *
 * @example
 * ```ts
 * isEthiopianLeapYear(2015); // true
 * isEthiopianLeapYear(2016); // false
 * ```
 */
export function isEthiopianLeapYear(year: unknown): boolean {
  if (!isInt(year)) {
    return false;
  }
  return year % 4 === 3;
}

/**
 * Get the length of a given Ethiopian month in a specific year.
 *
 * Months 1-12 always have 30 days. Month 13 (Pagume) has 6 days in a
 * leap year and 5 otherwise.
 *
 * @param year Ethiopian year.
 * @param month Ethiopian month (1-13).
 * @returns Month length in days.
 * @throws {InvalidDateError} If month is not an integer in 1-13.
 *
 * @example
 * ```ts
 * getEthiopianMonthLength(2015, 13); // 6
 * getEthiopianMonthLength(2016, 13); // 5
 * ```
 */
export function getEthiopianMonthLength(year: unknown, month: unknown): number {
  if (!isInt(month) || month < 1 || month > MONTHS_IN_ETH_YEAR) {
    throw new InvalidDateError(`Invalid Ethiopian month: ${String(month)}`);
  }
  if (month === MONTHS_IN_ETH_YEAR) {
    return isEthiopianLeapYear(year) ? 6 : 5;
  }
  return DAYS_IN_ETH_MONTH;
}

/**
 * Check if the given Ethiopian date is valid.
 *
 * @param year Ethiopian year (>= 1).
 * @param month Ethiopian month (1-13).
 * @param day Ethiopian day (1-30; 1-5/6 for Pagume).
 * @returns True for valid dates. Non-integer components return false.
 *
 * @example
 * ```ts
 * isValidEthiopianDate(2015, 13, 6); // true (leap Pagume 6)
 * isValidEthiopianDate(2016, 13, 6); // false (common year)
 * ```
 */
export function isValidEthiopianDate(year: unknown, month: unknown, day: unknown): boolean {
  if (!isInt(year) || year < 1) {
    return false;
  }
  if (!isInt(month) || month < 1 || month > MONTHS_IN_ETH_YEAR) {
    return false;
  }
  if (!isInt(day)) {
    return false;
  }
  return day >= 1 && day <= getEthiopianMonthLength(year, month);
}

/**
 * Days in a Gregorian month. Mirrors the leap rule owned by
 * `isGregorianLeapYear` in calendar.ts (kept local to avoid a cycle:
 * calendar.ts imports this module).
 */
function daysInGregorianMonth(year: number, month: number): number {
  switch (month) {
    case 2:
      return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28;
    case 4:
    case 6:
    case 9:
    case 11:
      return 30;
    default:
      return 31;
  }
}

/**
 * Check if the given Gregorian (proleptic) date is valid.
 *
 * @param year Gregorian year (>= 1).
 * @param month Gregorian month (1-12).
 * @param day Gregorian day (1-28/29/30/31 depending on month).
 * @returns True for valid dates. Non-integer components return false.
 *
 * @example
 * ```ts
 * isValidGregorianDate(2024, 2, 29); // true (leap day)
 * isValidGregorianDate(2023, 2, 29); // false
 * ```
 */
export function isValidGregorianDate(year: unknown, month: unknown, day: unknown): boolean {
  if (!isInt(year) || year < 1) {
    return false;
  }
  if (!isInt(month) || month < 1 || month > 12) {
    return false;
  }
  if (!isInt(day)) {
    return false;
  }
  return day >= 1 && day <= daysInGregorianMonth(year, month);
}

/**
 * Validate Ethiopian clock time (hour 1-12, minute 0-59).
 *
 * @param hour Ethiopian hour (1-12).
 * @param minute Minutes (0-59).
 * @returns True for valid times. Non-integer components return false.
 */
export function isValidEthiopianHour(hour: unknown, minute: unknown): boolean {
  return (
    isInt(hour) &&
    hour >= 1 &&
    hour <= ETH_HOURS_IN_DAY &&
    isInt(minute) &&
    minute >= 0 &&
    minute < MINUTES_IN_HOUR
  );
}

/**
 * Validate standard 24-hour time.
 *
 * @param hour Standard hour (0-23).
 * @param minute Minutes (0-59).
 * @returns True for valid times. Non-integer components return false.
 */
export function isValidStandardTime(hour: unknown, minute: unknown): boolean {
  return (
    isInt(hour) &&
    hour >= 0 &&
    hour < HOURS_IN_DAY &&
    isInt(minute) &&
    minute >= 0 &&
    minute < MINUTES_IN_HOUR
  );
}

/**
 * Validate standard 24-hour time (alias of `isValidStandardTime`).
 *
 * @param hour Standard hour (0-23).
 * @param minute Minutes (0-59).
 * @returns True for valid times. Non-integer components return false.
 */
export const isValidTime = isValidStandardTime;
