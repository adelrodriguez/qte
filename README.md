<div align="center">
  <h1 align="center">⏱️ <code>qte</code></h1>

  <p align="center">
    <strong>Type-safe time unit conversions from human-readable expressions</strong>
  </p>

  <p align="center">
    <a href="https://www.npmjs.com/package/qte"><img src="https://img.shields.io/npm/v/qte" alt="npm version"></a>
    <a href="https://pkg-size.dev/qte"><img src="https://pkg-size.dev/badge/install/23648640" title="Install size for qte"></a>
    <a href="https://github.com/adelrodriguez/qte/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/qte" alt="license"></a>
  </p>
</div>

## Features

- Convert time expressions directly into any unit — `seconds("1h")`, `days("1w")`, `ms("30s")`
- Full suite of unit functions: `ms`, `seconds`, `minutes`, `hours`, `days`, `weeks`, `months`, `years`
- TypeScript `TimeExpression` type with compile-time checking and runtime guards
- Parse compound expressions (`"1h 30m"`, `"1 day, 6 hours"`) into milliseconds
- Format milliseconds back to human-readable strings
- Tree-shakeable named exports, zero dependencies

## Install

```bash
npm install qte
# or
bun add qte
# or
pnpm add qte
```

## Quick Start

```ts
import { seconds, minutes, hours, days, ms } from "qte"

seconds("1h") // 3600
seconds("500ms") // 0.5
minutes("2h") // 120
hours("1d") // 24
days("1w") // 7
ms("30s") // 30_000
```

## API

### Unit Functions

Convert a time expression to any unit. Each function accepts a `TimeExpression` string and returns the value in the named unit.

```ts
import { ms, seconds, minutes, hours, days, weeks, months, years } from "qte"

ms("1s") // 1000
ms("1h") // 3_600_000
seconds("1h") // 3600
seconds("500ms") // 0.5
minutes("2h") // 120
hours("1d") // 24
days("1w") // 7
weeks("1y") // 52.1775
months("1y") // 12
years("365d") // 1
```

TypeScript validates expressions at compile time:

```ts
ms("1h") // ✅ compiles
ms("hello") // ❌ type error — "hello" is not a TimeExpression
```

Use `isTimeExpression` to validate untrusted input at runtime:

```ts
import { ms, isTimeExpression } from "qte"

const input: string = getUserInput()
if (isTimeExpression(input)) {
  ms(input) // TypeScript knows `input` is TimeExpression
}
```

### `parse`

Parses simple or compound time expressions into milliseconds. Use this when you need to handle multi-part expressions like `"1h 30m"`.

```ts
import { parse } from "qte"

parse("1h") // 3_600_000
parse("1h 30m") // 5_400_000
parse("1 day, 6 hours, 30 minutes") // 109_800_000
```

### `format`

Converts milliseconds to a human-readable time expression.

```ts
import { format } from "qte"

format(3_600_000) // "1h"
format(500) // "500ms"
format(-3_600_000) // "-1h"
format(3_600_000, { long: true }) // "1 hour"
format(5_432_100, { precision: 3 }) // "1h 30m 32s"
```

| Option      | Type      | Default | Description                               |
| ----------- | --------- | ------- | ----------------------------------------- |
| `long`      | `boolean` | `false` | Use verbose format (`"1 hour"` vs `"1h"`) |
| `precision` | `number`  | `1`     | Maximum number of unit segments to output |

When `precision` is `1` (the default), the value is rounded to the single largest applicable unit. Higher values decompose the duration into multiple segments, with the last segment rounded to absorb the remainder. If the value has fewer meaningful segments than the requested precision, only the meaningful segments are returned.

The output of `format` is always a valid input for `parse`:

```ts
const expr = format(5_400_000, { precision: 2 }) // "1h 30m"
parse(expr) // 5_400_000
```

### `isTimeExpression`

Type guard that checks if a string is a valid single time expression. Returns `false` for compound expressions like `"1h 30m"`. Never throws.

```ts
import { isTimeExpression } from "qte"

isTimeExpression("1h") // true
isTimeExpression("500ms") // true
isTimeExpression("1h 30m") // false (use isCompoundTimeExpression)
isTimeExpression("hello") // false
```

### `isCompoundTimeExpression`

Checks if a string is a valid time expression (simple or compound). Never throws.

```ts
import { isCompoundTimeExpression } from "qte"

isCompoundTimeExpression("1h") // true
isCompoundTimeExpression("1h 30m") // true
isCompoundTimeExpression("hello") // false
```

### Constants

Millisecond-based conversion factors for custom arithmetic (e.g. computing a cache TTL or rate limit window):

```ts
import {
  MS_PER_SECOND, // 1_000
  MS_PER_MINUTE, // 60_000
  MS_PER_HOUR, // 3_600_000
  MS_PER_DAY, // 86_400_000
  MS_PER_WEEK, // 604_800_000
  MS_PER_MONTH, // 2_629_800_000
  MS_PER_YEAR, // 31_557_600_000
} from "qte"
```

## Compound Expressions

The parser supports multi-part expressions. Parts are summed together.

```ts
// Space-separated
parse("1h 30m") // 5_400_000

// Comma-separated (single commas only)
parse("1h, 30m") // 5_400_000

// Concatenated (no separator)
parse("1h30m") // 5_400_000

// Long form
parse("1 hour 30 minutes") // 5_400_000
parse("1 year 2 weeks 5 days") // 32_594_400_000

// Duplicate units are additive
parse("1h 2h") // 10_800_000

// Order doesn't matter
parse("30m 1h") // 5_400_000
```

Malformed delimiter punctuation is rejected (`",1h"`, `"1h,"`, `"1h,,30m"`, and `"1h, ,30m"` are invalid).
Numeric token pattern is `[+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?`, so exponent notation is supported.

### Supported Units

All units are case-insensitive. Spaces between number and unit are optional.

| Unit         | Short | Aliases                                        |
| ------------ | ----- | ---------------------------------------------- |
| Milliseconds | `ms`  | `milliseconds`, `millisecond`, `msecs`, `msec` |
| Seconds      | `s`   | `seconds`, `second`, `secs`, `sec`             |
| Minutes      | `m`   | `minutes`, `minute`, `mins`, `min`             |
| Hours        | `h`   | `hours`, `hour`, `hrs`, `hr`                   |
| Days         | `d`   | `days`, `day`                                  |
| Weeks        | `w`   | `weeks`, `week`                                |
| Months       | `mo`  | `months`, `month`                              |
| Years        | `y`   | `years`, `year`, `yrs`, `yr`                   |

### Signed Expressions

A leading sign applies to the entire compound expression when later parts are unsigned. Explicit signs on later segments override this and are evaluated per segment.

```ts
parse("-1h 30m") // -5_400_000
parse("+1h 30m") // 5_400_000
parse("-1h +30m") // -1_800_000
parse("-1h -30m") // -5_400_000
parse("-1h 30m -10m") // -2_400_000
parse("-1h 30m +10m") // -1_200_000
parse("1h-30m") // 1_800_000
parse("1h+30m") // 5_400_000
```

## Types

```ts
import type { TimeExpression, FormatOptions, Unit } from "qte"
```

- **`TimeExpression`** — A template literal type for single time expressions (`"1h"`, `"30s"`, `"500ms"`). Rejects invalid string literals at compile time. Used by unit functions (`ms`, `seconds`, etc.).
- **`FormatOptions`** — Options for `format()` (`long`, `precision`).
- **`Unit`** — Union of all recognized unit strings (e.g. `"hours"`, `"h"`, `"hr"`).

Use the type guards to validate strings at runtime:

```ts
const input: string = getUserInput()
if (isTimeExpression(input)) {
  ms(input) // `input` is narrowed to TimeExpression
}
if (isCompoundTimeExpression(input)) {
  parse(input) // input is a valid expression (simple or compound)
}
```

## Error Handling

**`parse` and unit functions:**

- Throw a `TypeError` if the input is not a string, is empty, or exceeds 200 characters.
- Return `NaN` if the string cannot be parsed.

**`format`:**

- Throws a `TypeError` if the input is not a finite number (`Infinity`, `-Infinity`, `NaN`).
- Throws a `RangeError` if `precision` is not a finite positive integer (e.g. `0`, negative numbers, `NaN`, `Infinity`, or decimals).

**`isTimeExpression` and `isCompoundTimeExpression`:**

- Never throw. Return `false` for any invalid input.

## License

MIT
