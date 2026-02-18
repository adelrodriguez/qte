import type { TimeExpression } from "./types"
import {
  MS_PER_DAY,
  MS_PER_HOUR,
  MS_PER_MINUTE,
  MS_PER_MONTH,
  MS_PER_SECOND,
  MS_PER_WEEK,
  MS_PER_YEAR,
} from "./constants"
import { getUnitMs, UNIT_ALIAS_PATTERN } from "./units"

const MAX_LENGTH = 200

// Longer alternatives must come before shorter ones to prevent partial matches
// (e.g. "months" before "mo", "minutes" before "m").
const PART_RE = new RegExp(`([+-]?\\d*\\.?\\d+(?:e[+-]?\\d+)?)\\s*(${UNIT_ALIAS_PATTERN})?`, "gi")

const WHITESPACE_RE = /^\s*$/
const COMMA_SEPARATOR_RE = /^\s*,\s*$/

function isValidGap(gap: string, isFirstPart: boolean): boolean {
  if (WHITESPACE_RE.test(gap)) {
    return true
  }

  if (isFirstPart) {
    return false
  }

  return COMMA_SEPARATOR_RE.test(gap)
}

/**
 * Parse a time expression string into milliseconds.
 *
 * Accepts both simple (`"1h"`) and compound (`"1h 30m"`) expressions.
 * Parts are summed together. Duplicate units are additive.
 * Supports space separators, a single comma separator, or no separator.
 * Numeric tokens support optional exponent notation (e.g. `"1e3ms"`).
 * A leading sign on a compound expression applies to the whole expression
 * unless later parts declare their own explicit signs.
 *
 * @param value - A time expression string to parse
 * @returns The total value in milliseconds, or `NaN` if the string cannot be parsed
 * @throws {TypeError} If the input is not a string, is empty, or exceeds 200 characters
 *
 * @example
 * ```ts
 * parse("1h")           // 3_600_000
 * parse("30s")          // 30_000
 * parse("1h 30m")       // 5_400_000
 * parse("1 day, 6 hours, 30 minutes") // 109_800_000
 * ```
 */
export function parse(value: string): number {
  if (typeof value !== "string" || value.length === 0 || value.length > MAX_LENGTH) {
    throw new TypeError(
      `Value provided to parse() must be a string with length between 1 and ${MAX_LENGTH}. Received: ${String(value)}`
    )
  }

  PART_RE.lastIndex = 0

  let total = 0
  let absoluteTotal = 0
  let prevEnd = 0
  let matchCount = 0
  let hasBarePart = false
  let firstPartHasExplicitSign = false
  let hasExplicitSignAfterFirst = false
  let match: RegExpExecArray | null

  while ((match = PART_RE.exec(value)) !== null) {
    const gap = value.slice(prevEnd, match.index)
    if (!isValidGap(gap, matchCount === 0)) {
      return Number.NaN
    }

    const numStr = match[1] ?? ""
    const unitStr = match[2]

    if (!unitStr) {
      hasBarePart = true
    }

    const hasExplicitSign = numStr.startsWith("-") || numStr.startsWith("+")
    if (matchCount === 0) {
      firstPartHasExplicitSign = hasExplicitSign
    } else if (hasExplicitSign) {
      hasExplicitSignAfterFirst = true
    }

    const n = Number.parseFloat(numStr)
    const multiplier = unitStr ? getUnitMs(unitStr.toLowerCase()) : 1

    if (!Number.isFinite(n) || Number.isNaN(multiplier)) {
      return Number.NaN
    }

    const partValue = n * multiplier
    if (!Number.isFinite(partValue)) {
      return Number.NaN
    }

    total += partValue
    if (!Number.isFinite(total)) {
      return Number.NaN
    }

    absoluteTotal += Math.abs(partValue)
    if (!Number.isFinite(absoluteTotal)) {
      return Number.NaN
    }

    prevEnd = match.index + match[0].length
    matchCount += 1
  }

  if (matchCount === 0) {
    return Number.NaN
  }

  // Bare numbers (no unit) are only valid as single expressions — in compound
  // expressions every part must include a unit.
  if (matchCount > 1 && hasBarePart) {
    return Number.NaN
  }

  const trailing = value.slice(prevEnd)
  if (!WHITESPACE_RE.test(trailing)) {
    return Number.NaN
  }

  const trimmed = value.trimStart()
  const hasLeadingSign = trimmed.startsWith("-") || trimmed.startsWith("+")

  if (matchCount > 1 && hasLeadingSign && firstPartHasExplicitSign && !hasExplicitSignAfterFirst) {
    return trimmed.startsWith("-") ? -absoluteTotal : absoluteTotal
  }

  return total
}

/**
 * Parse a time expression and return the value in milliseconds.
 *
 * @param value - A time expression string
 * @returns The value in milliseconds
 *
 * @example
 * ```ts
 * ms("1s")  // 1000
 * ms("5m")  // 300_000
 * ms("1h")  // 3_600_000
 * ```
 */
export function ms(value: TimeExpression): number {
  return parse(value)
}

/**
 * Parse a time expression and return the value in seconds.
 *
 * @param value - A time expression string
 * @returns The value in seconds
 *
 * @example
 * ```ts
 * seconds("1h")    // 3600
 * seconds("500ms") // 0.5
 * ```
 */
export function seconds(value: TimeExpression): number {
  return parse(value) / MS_PER_SECOND
}

/**
 * Parse a time expression and return the value in minutes.
 *
 * @param value - A time expression string
 * @returns The value in minutes
 *
 * @example
 * ```ts
 * minutes("2h")  // 120
 * minutes("30s") // 0.5
 * ```
 */
export function minutes(value: TimeExpression): number {
  return parse(value) / MS_PER_MINUTE
}

/**
 * Parse a time expression and return the value in hours.
 *
 * @param value - A time expression string
 * @returns The value in hours
 *
 * @example
 * ```ts
 * hours("1d")   // 24
 * hours("30m")  // 0.5
 * ```
 */
export function hours(value: TimeExpression): number {
  return parse(value) / MS_PER_HOUR
}

/**
 * Parse a time expression and return the value in days.
 *
 * @param value - A time expression string
 * @returns The value in days
 *
 * @example
 * ```ts
 * days("1w")  // 7
 * days("12h") // 0.5
 * ```
 */
export function days(value: TimeExpression): number {
  return parse(value) / MS_PER_DAY
}

/**
 * Parse a time expression and return the value in weeks.
 *
 * @param value - A time expression string
 * @returns The value in weeks
 *
 * @example
 * ```ts
 * weeks("14d") // 2
 * weeks("1y")  // 52.1775
 * ```
 */
export function weeks(value: TimeExpression): number {
  return parse(value) / MS_PER_WEEK
}

/**
 * Parse a time expression and return the value in months.
 *
 * @param value - A time expression string
 * @returns The value in months
 *
 * @example
 * ```ts
 * months("1y")  // 12
 * months("60d") // ~1.97
 * ```
 */
export function months(value: TimeExpression): number {
  return parse(value) / MS_PER_MONTH
}

/**
 * Parse a time expression and return the value in years.
 *
 * @param value - A time expression string
 * @returns The value in years
 *
 * @example
 * ```ts
 * years("365.25d") // 1
 * years("6mo")     // 0.5
 * ```
 */
export function years(value: TimeExpression): number {
  return parse(value) / MS_PER_YEAR
}
