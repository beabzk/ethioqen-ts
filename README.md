# ethioqen-ts: Ethiopian Calendar, Time, and Unix Timestamp Conversion

> **Beta**: the API is usable but still evolving. Expect
> breaking changes in minor releases. See [CHANGELOG](CHANGELOG.md) when
> upgrading.

`ethioqen-ts` is a TypeScript library for accurate conversions between the
Ethiopian calendar, the Gregorian calendar, Ethiopian local time (12-hour
format), standard 24-hour local time, and Unix timestamps. It is a port of
the Python [`ethioqen`](https://github.com/beabzk/ethioqen) library with an
idiomatic TypeScript API.

Requires Node `>=22`. Universal runtime: works in Node, modern browsers, and edge workers.

## Introduction

The Ethiopian calendar is a solar calendar used in Ethiopia and Eritrea. It
differs significantly from the Gregorian calendar, which is the most widely
used calendar system today.

**Key Differences:**

- **Year Offset:** The Ethiopian calendar is typically 7-8 years behind the
  Gregorian calendar.
- **Months:** It has 13 months: 12 months of 30 days each and a 13th month
  called _Pagume_, which has 5 days (6 days in a leap year).
- **New Year:** The Ethiopian New Year (_Enkutatash_) falls on September 11th
  (or 12th in a Gregorian leap year).
- **Leap Years:** Ethiopia follows a simple 4-year leap year cycle without
  the century exception found in the Gregorian calendar.

**Ethiopian Local Time:**

Ethiopian time uses a 12-hour clock that starts counting from dawn (around
6:00 AM standard time). This creates a 6-hour offset between Ethiopian and
standard time:

- 12:00 day Ethiopian = 6:00 AM standard time
- 1:00 day Ethiopian = 7:00 AM standard time
- 12:00 night Ethiopian = 6:00 PM standard time
- 6:00 night Ethiopian = 12:00 AM standard time (next day)

## Installation

```sh
pnpm add ethioqen
```

```sh
npm install ethioqen
```

## Development Setup

Requires Node `>=22` and [pnpm](https://pnpm.io/).

```sh
pnpm install
```

```sh
pnpm lint          # oxlint
pnpm format:check  # oxfmt --check .
pnpm typecheck     # tsc --noEmit
pnpm check         # all three above
pnpm test          # vitest run --coverage
pnpm build         # tsdown (Rolldown) dual ESM+CJS + .d.ts
```

## Usage Examples

### Calendar Conversions

```ts
import { convertEthiopianToGregorian, convertGregorianToEthiopian } from "ethioqen";

// Convert from Ethiopian to Gregorian
const greg = convertEthiopianToGregorian({ year: 2016, month: 7, day: 6 });
console.log(`${greg.year}-${greg.month}-${greg.day}`); // Output: 2024-3-15

// Convert from Gregorian to Ethiopian
const eth = convertGregorianToEthiopian({ year: 2024, month: 3, day: 15 });
console.log(`${eth.year}-${eth.month}-${eth.day}`); // Output: 2016-7-6
```

### Time Conversions

```ts
import { convertFromEthiopianTime, convertToEthiopianTime } from "ethioqen";

// Convert standard time (14:30 / 2:30 PM) to Ethiopian time
const ethTime = convertToEthiopianTime({ hour: 14, minute: 30 });
console.log(`${ethTime.hour}:${ethTime.minute} ${ethTime.isPm ? "PM" : "AM"}`);
// Output: 8:30 AM

// Convert Ethiopian time (8:30 day) to standard time
const std = convertFromEthiopianTime({ hour: 8, minute: 30, isPm: false });
console.log(`${String(std.hour).padStart(2, "0")}:${String(std.minute).padStart(2, "0")}`);
// Output: 14:30
```

### Unix Timestamp Conversions

```ts
import { ethiopianToUnix, unixToEthiopian } from "ethioqen";

// Convert Ethiopian date/time to Unix timestamp (UTC)
// 1:30 night Ethiopian time
const timestamp = ethiopianToUnix({
  year: 2016,
  month: 7,
  day: 6,
  hour: 1,
  minute: 30,
  isPm: true,
});
console.log(timestamp); // Output: 1710531000

// Convert Unix timestamp to Ethiopian date/time (UTC)
const ethDate = unixToEthiopian(timestamp);
console.log(
  `${ethDate.year}-${ethDate.month}-${ethDate.day} ${ethDate.hour}:${String(ethDate.minute).padStart(2, "0")} ${ethDate.isPm ? "PM" : "AM"}`,
);
// Output: 2016-7-6 1:30 PM
```

### Timezone Support

```ts
import { ethiopianToUnix, unixToEthiopian } from "ethioqen";

// Convert with timezone offset (UTC+3 for Ethiopia)
// 8:30 day Ethiopian time
const timestamp = ethiopianToUnix({
  year: 2016,
  month: 7,
  day: 6,
  hour: 8,
  minute: 30,
  isPm: false,
  timeZoneOffset: 3,
});
console.log(timestamp); // Output: Unix timestamp adjusted for UTC+3

// Convert back with timezone offset
const ethDate = unixToEthiopian(timestamp, 3);
console.log(
  `${ethDate.year}-${ethDate.month}-${ethDate.day} ${ethDate.hour}:${String(ethDate.minute).padStart(2, "0")} ${ethDate.isPm ? "PM" : "AM"}`,
);
// Output: Ethiopian date/time in UTC+3
```

### Error Handling

Invalid inputs throw `InvalidDateError` or `InvalidTimeError` (both extend
`RangeError`). Use the `isValid*` helpers to check first when needed:

```ts
import { InvalidDateError, convertGregorianToEthiopian, isValidGregorianDate } from "ethioqen";

if (isValidGregorianDate(2023, 2, 29)) {
  convertGregorianToEthiopian({ year: 2023, month: 2, day: 29 });
} else {
  console.log("Not a real date"); // Output: Not a real date
}

try {
  convertGregorianToEthiopian({ year: 2023, month: 2, day: 29 });
} catch (error) {
  console.log(error instanceof InvalidDateError); // Output: true
}
```

## Contributing

We welcome contributions! Here's how you can help:

1. **Report Bugs**
   - Open an issue in the GitHub issue tracker
   - Include a clear description and steps to reproduce

2. **Submit Pull Requests**
   - Fork the repository
   - Create a new branch for your feature
   - Make your changes
   - Write or update tests as needed
   - Update documentation if necessary
   - Submit a pull request

3. **Coding Style**
   - `pnpm check` must pass
   - Include TSDoc for new public functions
   - Add runtime validation for new user inputs

4. **Testing**
   - Run the test suite: `pnpm test`
   - Add tests for new features
   - Keep coverage at or above 90 percent

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE)
file for details.
