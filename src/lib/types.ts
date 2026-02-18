/** Year unit aliases. */
export type Years = "years" | "year" | "yrs" | "yr" | "y"

/** Month unit aliases. */
export type Months = "months" | "month" | "mo"

/** Week unit aliases. */
export type Weeks = "weeks" | "week" | "w"

/** Day unit aliases. */
export type Days = "days" | "day" | "d"

/** Hour unit aliases. */
export type Hours = "hours" | "hour" | "hrs" | "hr" | "h"

/** Minute unit aliases. */
export type Minutes = "minutes" | "minute" | "mins" | "min" | "m"

/** Second unit aliases. */
export type Seconds = "seconds" | "second" | "secs" | "sec" | "s"

/** Millisecond unit aliases. */
export type Milliseconds = "milliseconds" | "millisecond" | "msecs" | "msec" | "ms"

/** Union of all recognized time unit strings. */
export type Unit = Years | Months | Weeks | Days | Hours | Minutes | Seconds | Milliseconds

/** Canonical runtime definition for a unit and its aliases. */
export interface UnitDefinition {
  aliases: readonly Unit[]
  long: string
  longPlural: string
  ms: number
  short: string
}

/** Any casing variant of a time unit (lowercase, Capitalized, UPPERCASE). */
export type UnitAnyCase = Unit | Capitalize<Unit> | Uppercase<Unit>

/**
 * A single time expression: a bare number, or a number followed by a unit
 * (with or without a space).
 */
export type TimeExpression = `${number}` | `${number}${UnitAnyCase}` | `${number} ${UnitAnyCase}`

/** Options for {@link format}. */
export interface FormatOptions {
  /** Use verbose formatting (`"1 hour"` instead of `"1h"`). Defaults to `false`. */
  long?: boolean
  /** Maximum number of unit segments to include. Defaults to `1`. */
  precision?: number
}
