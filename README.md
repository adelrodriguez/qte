<div align="center">
  <h1 align="center">⏱️ <code>qte</code></h1>

  <p align="center">
    <strong>Parsing and formatting for human-readable time expressions.</strong>
  </p>

  <p align="center">
    <a href="https://www.npmjs.com/package/qte"><img src="https://img.shields.io/npm/v/qte" alt="npm version"></a>
    <a href="https://pkg-size.dev/qte"><img src="https://pkg-size.dev/badge/bundle/qte" alt="bundle size"></a>
    <a href="https://github.com/adelrodriguez/qte/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/qte" alt="license"></a>
  </p>
</div>

## Features

- Parse time strings into any unit (milliseconds, seconds, minutes, hours, days, weeks, months, years)
- Compound expressions (`"1h 30m"`, `"1 day, 6 hours"`)
- Format milliseconds back to human-readable strings with configurable precision
- Tree-shakeable named exports
- TypeScript `TimeExpression` type with compile-time checking and `isTimeExpression` / `isCompoundTimeExpression` guards
- Zero dependencies

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
import { parse, format, ms, seconds, MS_PER_WEEK } from "qte"

parse("2 days, 6 hours") // 194_400_000
format(3_600_000) // "1h"
format(5_432_100, { precision: 3 }) // "1h 30m 32s"
format(5 * MS_PER_WEEK, { precision: 2 }) // "1mo 1w" (approximate)
ms("1h") // 3_600_000
seconds("30m") // 1800
```

## API

### `parse`

Parses a time expression and returns the value in milliseconds.

```ts
import { parse } from "qte"

parse("1h") // 3_600_000
parse("30s") // 30_000
parse("1h 30m") // 5_400_000
parse("1 day, 6 hours, 30 minutes") // 109_800_000
```

### `format`

Converts milliseconds to a human-readable time expression.

```ts
import { format } from "qte"

format(3_600_000) // "1h"
format(500) // "500ms"
format(0) // "0ms"
format(-3_600_000) // "-1h"
```

#### Options

| Option      | Type      | Default | Description                               |
| ----------- | --------- | ------- | ----------------------------------------- |
| `long`      | `boolean` | `false` | Use verbose format (`"1 hour"` vs `"1h"`) |
| `precision` | `number`  | `1`     | Maximum number of unit segments to output |

```ts
format(3_600_000, { long: true }) // "1 hour"
format(5_432_100, { precision: 3 }) // "1h 30m 32s"
format(5_400_000, { long: true, precision: 2 }) // "1 hour 30 minutes"
```

#### Precision

When `precision` is `1` (the default), the value is rounded to the single largest applicable unit. Higher values decompose the duration into multiple segments, with the last segment rounded to absorb the remainder.

If the value has fewer meaningful segments than the requested precision, only the meaningful segments are returned:

```ts
format(3_600_000, { precision: 5 }) // "1h"
format(500, { precision: 10 }) // "500ms"
```

Month/year units use fixed average durations, so low precision can produce noticeable approximation around week/month boundaries:

```ts
format(5 * MS_PER_WEEK, { precision: 2 }) // "1mo 1w" (approximate)
```

The output of `format` is always a valid input for `parse`:

```ts
const expr = format(5_400_000, { precision: 2 }) // "1h 30m"
parse(expr) // 5_400_000

const negativeExpr = format(-5_400_000, { precision: 2 }) // "-1h 30m"
parse(negativeExpr) // -5_400_000
```

### Unit Functions

Each function parses a single time expression and returns the value in the named unit. For compound expressions, use `parse` instead.

```ts
import { ms, seconds, minutes, hours, days, weeks, months, years } from "qte"

ms("1s") // 1000
seconds("1h") // 3600
seconds("500ms") // 0.5
minutes("2h") // 120
hours("1d") // 24
days("1w") // 7
weeks("1y") // 52.1775
```

### `isTimeExpression`

Type guard that checks if a string is a valid single time expression. Returns `false` for compound expressions like `"1h 30m"`. Never throws.

```ts
import { isTimeExpression } from "qte"

isTimeExpression("1h") // true
isTimeExpression("500ms") // true
isTimeExpression("1h 30m") // false (use isCompoundTimeExpression)
isTimeExpression("hello") // false

const input: string = getUserInput()
if (isTimeExpression(input)) {
  ms(input) // TypeScript knows `input` is TimeExpression
}
```

### `isCompoundTimeExpression`

Checks if a string is a valid time expression (simple or compound). Never throws.

```ts
import { isCompoundTimeExpression } from "qte"

isCompoundTimeExpression("1h") // true
isCompoundTimeExpression("1h 30m") // true
isCompoundTimeExpression("hello") // false

const input: string = getUserInput()
if (isCompoundTimeExpression(input)) {
  parse(input) // input is a valid time expression
}
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
