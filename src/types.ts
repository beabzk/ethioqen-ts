/**
 * Ethiopian calendar date.
 */
export interface EthiopianDate {
  /** Ethiopian year (>= 1). */
  year: number;
  /** Ethiopian month (1-13). */
  month: number;
  /** Day of month (1-30; 1-5/6 for Pagume). */
  day: number;
}

/** Proleptic Gregorian calendar date. */
export interface GregorianDate {
  /** Gregorian year (>= 1). */
  year: number;
  /** Gregorian month (1-12). */
  month: number;
  /** Day of month (1-28/29/30/31 depending on month). */
  day: number;
}

/**
 * Ethiopian 12-hour clock time. Day is `isPm: false`, night is `isPm: true`.
 */
export interface EthiopianTime {
  /** Ethiopian hour (1-12). */
  hour: number;
  /** Minutes (0-59). */
  minute: number;
  /** Whether the time is night (PM) as opposed to day (AM). */
  isPm: boolean;
}

/** Ethiopian date with 12-hour clock time and seconds. */
export interface EthiopianDateTime extends EthiopianDate, EthiopianTime {
  /** Seconds (0-59). */
  second: number;
}
