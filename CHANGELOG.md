# Changelog

All notable changes to this project are documented here. Versioning follows
Semantic Versioning: breaking changes ship as minor releases while `0.x`,
fixes as patches.

## [Unreleased]

Initial TypeScript port of Python `ethioqen` 0.3.1 with an idiomatic API:

- Calendar: `convertEthiopianToGregorian`,
  `convertGregorianToEthiopian`, `isGregorianLeapYear` (JDN engine with
  Unix-epoch, millennium, and Enkutatash anchors).
- Time: `convertToEthiopianTime`, `convertFromEthiopianTime`, `ethTo24h`,
  `h24ToEth` (shared 6-hour shift, `isPm` day/night convention).
- Timestamps: `ethiopianToUnix`, `unixToEthiopian` (integer math, seconds
  support, fractional timezone offsets, portable range errors).
- Validators and constants in `utils`; `InvalidDateError`/`InvalidTimeError`
  (extend `RangeError`); typed date/time interfaces.
- Toolchain: pnpm, tsdown dual ESM+CJS, Oxlint + Oxfmt, Vitest with a 90
  percent coverage gate, `tsc --noEmit` on TypeScript 7.
