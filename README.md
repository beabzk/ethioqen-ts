# ethioqen-ts: Ethiopian Calendar, Time, and Unix Timestamp Conversion

TypeScript port of the Python [`ethioqen`](https://github.com/beabzk/ethioqen)
library - accurate conversions between the Ethiopian calendar, the Gregorian
calendar, Ethiopian local time (12-hour clock), standard 24-hour time, and
Unix timestamps.

Requires Node `>=22` and [pnpm](https://pnpm.io/). Universal runtime: works in Node, modern browsers,
and edge workers.

## Installation

```sh
pnpm install ethioqen
```

## Development Setup

```sh
pnpm install
```

## Scripts

```sh
pnpm check   # oxlint + oxfmt --check + tsc --noEmit
pnpm test    # vitest run --coverage
pnpm build   # tsdown (Rolldown) dual ESM+CJS + .d.ts
```

## Usage

```ts
import { VERSION } from "ethioqen";

console.log(VERSION); // "0.1.0"
```

## License

MIT - see [LICENSE](LICENSE).
