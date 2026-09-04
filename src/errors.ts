/**
 * Error thrown when a date value is invalid or out of range.
 *
 * @example
 * ```ts
 * throw new InvalidDateError("Invalid Ethiopian date: 2016-13-6");
 * ```
 */
export class InvalidDateError extends RangeError {
  /** Stable machine-readable code. */
  readonly code = "INVALID_DATE";

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "InvalidDateError";
  }
}

/**
 * Error thrown when a time value is invalid or out of range.
 *
 * @example
 * ```ts
 * throw new InvalidTimeError("Invalid Ethiopian time: 13:00");
 * ```
 */
export class InvalidTimeError extends RangeError {
  /** Stable machine-readable code. */
  readonly code = "INVALID_TIME";

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "InvalidTimeError";
  }
}
