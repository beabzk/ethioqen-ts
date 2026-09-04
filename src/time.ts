import { InvalidTimeError } from "./errors.js";
import type { EthiopianTime } from "./types.js";
import { isValidEthiopianHour, isValidStandardTime } from "./utils.js";

/** Positive modulo: mirrors Python % for the negative shifts below. */
function posMod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

/**
 * Convert Ethiopian 12-hour time to 24-hour standard time.
 *
 * The Ethiopian clock runs 6 hours behind the standard clock:
 * 12:00 day Ethiopian is 6:00 standard, 12:00 night Ethiopian is 18:00.
 *
 * @param ethHour Ethiopian hour (1-12).
 * @param isPm Whether the time is night (PM) as opposed to day (AM).
 * @returns Hour in 24-hour format (0-23).
 * @throws {InvalidTimeError} If ethHour is outside 1-12.
 *
 * @example
 * ```ts
 * ethTo24h(12, false); // 6
 * ethTo24h(1, true); // 19
 * ```
 */
export function ethTo24h(ethHour: number, isPm: boolean): number {
  if (!isValidEthiopianHour(ethHour, 0)) {
    throw new InvalidTimeError(`Invalid Ethiopian hour: ${String(ethHour)}`);
  }
  const base = (ethHour % 12) + (isPm ? 12 : 0);
  return (base + 6) % 24;
}

/**
 * Convert 24-hour standard time to Ethiopian 12-hour time.
 *
 * @param hour24 Standard hour (0-23).
 * @returns Ethiopian hour (1-12) with the night flag.
 * @throws {InvalidTimeError} If hour24 is outside 0-23.
 *
 * @example
 * ```ts
 * h24ToEth(18); // { hour: 12, isPm: true }
 * ```
 */
export function h24ToEth(hour24: number): { hour: number; isPm: boolean } {
  if (!isValidStandardTime(hour24, 0)) {
    throw new InvalidTimeError(`Invalid standard hour: ${String(hour24)}`);
  }
  const shifted = posMod(hour24 - 6, 24);
  const isPm = shifted >= 12;
  const unshifted = isPm ? shifted - 12 : shifted;
  return { hour: unshifted === 0 ? 12 : unshifted, isPm };
}

/**
 * Convert standard time to Ethiopian time.
 *
 * @param time Standard hour (0-23, or 1-12 when period is given) and
 * minutes (0-59), with an optional 12-hour period.
 * @returns Ethiopian time (hour 1-12, minute, night flag). 06:00-17:59
 * standard is day (`isPm: false`), otherwise night (`isPm: true`).
 * @throws {InvalidTimeError} On invalid time, bad period, or a 12-hour
 * period combined with an hour outside 1-12.
 *
 * @example
 * ```ts
 * convertToEthiopianTime({ hour: 14, minute: 30 });
 * // { hour: 8, minute: 30, isPm: false }
 * ```
 */
export function convertToEthiopianTime(time: {
  hour: number;
  minute: number;
  period?: string;
}): EthiopianTime {
  const { hour, minute, period } = time;
  let hour24 = hour;
  if (period !== undefined) {
    if (typeof period !== "string" || !["AM", "PM"].includes(period.toUpperCase())) {
      throw new InvalidTimeError("Period must be 'AM' or 'PM'");
    }
    if (!isValidEthiopianHour(hour, minute)) {
      throw new InvalidTimeError(
        `Hour must be 1-12 with a period: ${String(hour)}:${String(minute)}`,
      );
    }
    if (period.toUpperCase() === "PM" && hour !== 12) {
      hour24 = hour + 12;
    } else if (period.toUpperCase() === "AM" && hour === 12) {
      hour24 = 0;
    }
  } else if (!isValidStandardTime(hour, minute)) {
    throw new InvalidTimeError(`Invalid time: ${String(hour)}:${String(minute)}`);
  }

  const raw = posMod(hour24 - 6, 12);
  return { hour: raw === 0 ? 12 : raw, minute, isPm: !(hour24 >= 6 && hour24 < 18) };
}

/**
 * Convert Ethiopian time to 24-hour standard time.
 *
 * @param time Ethiopian time (hour 1-12, minute 0-59, night flag).
 * @returns Standard hour (0-23) and minute.
 * @throws {InvalidTimeError} If the Ethiopian time is invalid.
 *
 * @example
 * ```ts
 * convertFromEthiopianTime({ hour: 8, minute: 30, isPm: false });
 * // { hour: 14, minute: 30 }
 * ```
 */
export function convertFromEthiopianTime(time: EthiopianTime): { hour: number; minute: number } {
  const { hour, minute, isPm } = time;
  if (!isValidEthiopianHour(hour, minute)) {
    throw new InvalidTimeError(`Invalid Ethiopian time: ${String(hour)}:${String(minute)}`);
  }
  return { hour: ethTo24h(hour, isPm), minute };
}
