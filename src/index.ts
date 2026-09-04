/**
 * ethioqen-ts: Ethiopian calendar, time, and Unix timestamp conversions.
 */
export const VERSION = "0.1.0";

export {
  ETHIOPIAN_EPOCH,
  convertEthiopianToGregorian,
  convertGregorianToEthiopian,
  isGregorianLeapYear,
} from "./calendar.js";
export { InvalidDateError, InvalidTimeError } from "./errors.js";
export { convertFromEthiopianTime, convertToEthiopianTime, ethTo24h, h24ToEth } from "./time.js";
export type { EthiopianDate, EthiopianDateTime, EthiopianTime, GregorianDate } from "./types.js";
export { ethiopianToUnix, unixToEthiopian } from "./unixTime.js";
export {
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
} from "./utils.js";
