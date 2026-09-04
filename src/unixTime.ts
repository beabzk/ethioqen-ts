import {
  convertEthiopianToGregorian,
  convertGregorianToEthiopian,
  gregorianToJdn,
} from "./calendar.js";
import { InvalidDateError, InvalidTimeError } from "./errors.js";
import { ethTo24h, h24ToEth } from "./time.js";
import type { EthiopianDateTime } from "./types.js";
import { isValidEthiopianDate } from "./utils.js";

/** Julian Day Number of 1970-01-01 Gregorian (the Unix epoch). */
const UNIX_EPOCH_JDN = 2440588;

/** Seconds in a mean solar day. */
const SECONDS_IN_DAY = 86_400;

/**
 * Validate a timezone offset in hours (may be fractional, e.g. 5.5).
 *
 * @param timeZoneOffset Offset in hours.
 * @returns Offset in whole minutes.
 * @throws {InvalidTimeError} If the offset is not a finite number.
 */
function toOffsetMinutes(timeZoneOffset: unknown): number {
  if (typeof timeZoneOffset !== "number" || !Number.isFinite(timeZoneOffset)) {
    throw new InvalidTimeError(`Invalid timezone offset: ${String(timeZoneOffset)}`);
  }
  // Python rejects |offset| >= 24 via datetime.timezone; mirror that bound.
  if (Math.abs(timeZoneOffset) >= 24) {
    throw new InvalidTimeError(`Invalid timezone offset: ${String(timeZoneOffset)}`);
  }
  return Math.round(timeZoneOffset * 60);
}

/**
 * Convert an Ethiopian date/time to a Unix timestamp.
 *
 * Pure integer math: the Gregorian equivalent gives whole days since the
 * Unix epoch via Julian Day Numbers, so `Date.UTC` (and its 0-99 year
 * pitfall) is never involved.
 *
 * @param input Ethiopian date with optional 12-hour clock time
 * (defaults: 12 day, `:00:00`) and timezone offset in hours
 * (may be fractional, defaults to 0 for UTC). Named zones
 * (e.g. Africa/Addis_Ababa) are future work.
 * @returns Unix timestamp (seconds since the Unix epoch).
 * @throws {InvalidDateError} If the Ethiopian date is invalid or falls
 * outside Gregorian years 1-9999.
 * @throws {InvalidTimeError} If any time component or the offset is invalid.
 *
 * @example
 * ```ts
 * ethiopianToUnix({ year: 2015, month: 1, day: 1 });
 * // 1662876000 (2022-09-11 06:00 UTC)
 * ```
 */
export function ethiopianToUnix(input: {
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  isPm?: boolean;
  second?: number;
  timeZoneOffset?: number;
}): number {
  const {
    year,
    month,
    day,
    hour = 12,
    minute = 0,
    isPm = false,
    second = 0,
    timeZoneOffset = 0,
  } = input;

  if (!isValidEthiopianDate(year, month, day)) {
    throw new InvalidDateError(
      `Invalid Ethiopian date: ${String(year)}-${String(month)}-${String(day)}`,
    );
  }
  if (typeof minute !== "number" || !Number.isInteger(minute) || minute < 0 || minute > 59) {
    throw new InvalidTimeError(`Invalid minute: ${String(minute)}`);
  }
  if (typeof second !== "number" || !Number.isInteger(second) || second < 0 || second > 59) {
    throw new InvalidTimeError(`Invalid second: ${String(second)}`);
  }
  const offsetMinutes = toOffsetMinutes(timeZoneOffset);

  // ethTo24h validates the 1-12 hour.
  const hour24 = ethTo24h(hour, isPm);

  const gregorian = convertEthiopianToGregorian({ year, month, day });
  if (gregorian.year < 1 || gregorian.year > 9999) {
    throw new InvalidDateError(
      `Ethiopian date out of range: ${String(year)}-${String(month)}-${String(day)}`,
    );
  }
  const days = gregorianToJdn(gregorian.year, gregorian.month, gregorian.day) - UNIX_EPOCH_JDN;
  return days * SECONDS_IN_DAY + hour24 * 3600 + minute * 60 + second - offsetMinutes * 60;
}

/**
 * Convert a Unix timestamp to an Ethiopian date/time.
 *
 * The instant is shifted by the timezone offset with integer math, then
 * decomposed with UTC getters (safe: only construction from year/month/day
 * suffers the `Date.UTC` 0-99 pitfall, never decomposition of an instant).
 *
 * @param timestamp Unix timestamp (seconds since the Unix epoch).
 * @param timeZoneOffset Timezone offset in hours, may be fractional.
 * Defaults to 0 (UTC).
 * @returns Ethiopian date with 12-hour clock time and seconds.
 * @throws {InvalidDateError} If the timestamp is not a finite number or
 * falls outside Gregorian years 1-9999 on every platform.
 *
 * @example
 * ```ts
 * unixToEthiopian(1662876000);
 * // { year: 2015, month: 1, day: 1, hour: 12, minute: 0, second: 0, isPm: false }
 * ```
 */
export function unixToEthiopian(timestamp: number, timeZoneOffset = 0): EthiopianDateTime {
  if (typeof timestamp !== "number" || !Number.isFinite(timestamp)) {
    throw new InvalidDateError(`Invalid timestamp: ${String(timestamp)}`);
  }
  const offsetMinutes = toOffsetMinutes(timeZoneOffset);

  const shifted = new Date(timestamp * 1000 + offsetMinutes * 60_000);
  const year = shifted.getUTCFullYear();
  if (!Number.isInteger(year) || year < 1 || year > 9999) {
    throw new InvalidDateError(`Invalid timestamp: ${String(timestamp)}`);
  }
  const ethiopian = convertGregorianToEthiopian({
    year,
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  });
  const { hour, isPm } = h24ToEth(shifted.getUTCHours());

  return {
    ...ethiopian,
    hour,
    minute: shifted.getUTCMinutes(),
    second: shifted.getUTCSeconds(),
    isPm,
  };
}
