import { describe, expect, it } from "vitest";

import { InvalidDateError, InvalidTimeError } from "../src/errors.js";

describe("InvalidDateError", () => {
  it("is a RangeError with a stable name and code", () => {
    const err = new InvalidDateError("Invalid Ethiopian date: 2016-13-6");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(RangeError);
    expect(err.name).toBe("InvalidDateError");
    expect(err.code).toBe("INVALID_DATE");
    expect(err.message).toBe("Invalid Ethiopian date: 2016-13-6");
  });

  it("supports a cause", () => {
    const cause = new Error("root");
    const err = new InvalidDateError("wrapper", { cause });
    expect(err.cause).toBe(cause);
  });
});

describe("InvalidTimeError", () => {
  it("is a RangeError with a stable name and code", () => {
    const err = new InvalidTimeError("Invalid Ethiopian time: 13:00");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(RangeError);
    expect(err.name).toBe("InvalidTimeError");
    expect(err.code).toBe("INVALID_TIME");
    expect(err.message).toBe("Invalid Ethiopian time: 13:00");
  });

  it("is distinct from InvalidDateError", () => {
    expect(new InvalidTimeError("x")).not.toBeInstanceOf(InvalidDateError);
    expect(new InvalidDateError("x")).not.toBeInstanceOf(InvalidTimeError);
  });
});
