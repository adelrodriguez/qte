import type { TimeExpression } from "./types"
import { parse } from "./parsers"
import { UNIT_ALIAS_PATTERN } from "./units"

const SIMPLE_RE = new RegExp(
  `^[+-]?\\d*\\.?\\d+(?:e[+-]?\\d+)?(?: ?(?:${UNIT_ALIAS_PATTERN}))?$`,
  "i"
)

/**
 * Check whether a string is a valid single time expression without throwing.
 *
 * Acts as a TypeScript type guard — when it returns `true`, the input is
 * narrowed to {@link TimeExpression}. Unlike {@link isCompoundTimeExpression},
 * this rejects compound expressions such as `"1h 30m"`.
 *
 * @param value - The string to validate
 * @returns `true` if the string is a valid single time expression
 *
 * @example
 * ```ts
 * isTimeExpression("1h")      // true
 * isTimeExpression("500ms")   // true
 * isTimeExpression("1h 30m")  // false (compound)
 * isTimeExpression("hello")   // false
 *
 * const input: string = getUserInput()
 * if (isTimeExpression(input)) {
 *   ms(input) // TypeScript knows `input` is TimeExpression
 * }
 * ```
 */
export function isTimeExpression(value: string): value is TimeExpression {
  try {
    if (!SIMPLE_RE.test(value)) return false
    return !Number.isNaN(parse(value))
  } catch {
    return false
  }
}

/**
 * Check whether a string is a valid time expression (simple or compound)
 * without throwing.
 *
 * This accepts both simple expressions (`"1h"`) and compound expressions
 * (`"1h 30m"`).
 *
 * @param value - The string to validate
 * @returns `true` if the string is a valid time expression
 *
 * @example
 * ```ts
 * isCompoundTimeExpression("1h")      // true
 * isCompoundTimeExpression("1h 30m")  // true
 * isCompoundTimeExpression("hello")   // false
 * isCompoundTimeExpression("")        // false
 *
 * const input: string = getUserInput()
 * if (isCompoundTimeExpression(input)) {
 *   parse(input) // input is a valid time expression
 * }
 * ```
 */
export function isCompoundTimeExpression(value: string): boolean {
  try {
    return !Number.isNaN(parse(value))
  } catch {
    return false
  }
}
