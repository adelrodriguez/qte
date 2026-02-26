import type { FormatOptions, UnitDefinition } from "./types"
import { UNITS } from "./units"

function getUnit(index: number): UnitDefinition {
  const unit = UNITS.at(index)
  if (!unit) throw new Error(`Invalid unit index: ${index}`)
  return unit
}

function formatSegment(value: number, unit: UnitDefinition, long: boolean): string {
  if (long) {
    const name = Math.abs(value) === 1 ? unit.long : unit.longPlural
    return `${value} ${name}`
  }
  return `${value}${unit.short}`
}

/**
 * Format a millisecond value into a human-readable time expression.
 *
 * The returned string can be passed back into {@link parse} for
 * round-trip conversion.
 *
 * @param milliseconds - The value in milliseconds to format
 * @param options - Formatting options
 * @returns A formatted time expression string
 * @throws {TypeError} If the input is not a finite number
 * @throws {RangeError} If `options.precision` is not a finite positive integer
 *
 * @example
 * ```ts
 * format(3_600_000)                        // "1h"
 * format(3_600_000, { long: true })        // "1 hour"
 * format(500)                              // "500ms"
 * format(5_432_100, { precision: 3 })      // "1h 30m 32s"
 * ```
 */
export function format(milliseconds: number, options?: FormatOptions): string {
  if (typeof milliseconds !== "number" || !Number.isFinite(milliseconds)) {
    throw new TypeError(
      `Value provided to format() must be a finite number. Received: ${String(milliseconds)}`
    )
  }

  const long = options?.long ?? false
  const precision = options?.precision ?? 1

  if (!Number.isFinite(precision) || !Number.isInteger(precision) || precision < 1) {
    throw new RangeError(
      `Option "precision" must be a finite positive integer. Received: ${String(precision)}`
    )
  }

  if (milliseconds === 0) {
    return formatSegment(0, getUnit(UNITS.length - 1), long)
  }

  const isNegative = milliseconds < 0
  const abs = Math.abs(milliseconds)

  if (precision === 1) {
    return formatPrecisionOne(milliseconds, abs, long)
  }

  return formatMultiPrecision(abs, isNegative, long, precision)
}

function formatPrecisionOne(ms: number, abs: number, long: boolean): string {
  const sign = ms < 0 ? -1 : 1

  for (const unit of UNITS) {
    if (abs >= unit.ms) {
      const roundedCount = Math.round(abs / unit.ms)
      const signedCount = roundedCount === 0 ? 0 : sign * roundedCount
      return formatSegment(signedCount, unit, long)
    }
  }

  const unit = getUnit(UNITS.length - 1)
  const roundedCount = Math.round(abs / unit.ms)
  const signedCount = roundedCount === 0 ? 0 : sign * roundedCount

  return formatSegment(signedCount, unit, long)
}

function formatMultiPrecision(
  abs: number,
  isNegative: boolean,
  long: boolean,
  precision: number
): string {
  let remaining = abs
  const segments: Array<{ value: number; unitIdx: number }> = []

  for (let i = 0; i < UNITS.length && segments.length < precision; i += 1) {
    const unit = getUnit(i)

    if (segments.length === precision - 1) {
      const rounded = Math.round(remaining / unit.ms)
      if (rounded > 0) {
        segments.push({ unitIdx: i, value: rounded })
        break
      }
      continue
    }

    const whole = Math.floor(remaining / unit.ms)
    if (whole > 0) {
      segments.push({ unitIdx: i, value: whole })
      remaining -= whole * unit.ms
    }
  }

  if (segments.length === 0) {
    const msUnit = getUnit(UNITS.length - 1)
    const rounded = Math.round(abs / msUnit.ms)
    segments.push({ unitIdx: UNITS.length - 1, value: rounded })
  }

  // Carry-over: if rounding caused overflow, propagate upward
  for (let i = segments.length - 1; i >= 0; i -= 1) {
    const seg = segments[i] as { value: number; unitIdx: number }
    const unit = getUnit(seg.unitIdx)

    const largerUnitIdx = seg.unitIdx - 1
    if (largerUnitIdx < 0) continue

    const largerUnit = getUnit(largerUnitIdx)
    const ratio = largerUnit.ms / unit.ms

    if (seg.value >= ratio) {
      const carry = Math.floor(seg.value / ratio)
      seg.value -= carry * ratio

      const prev = i > 0 ? (segments[i - 1] as { value: number; unitIdx: number }) : undefined
      if (prev && prev.unitIdx === largerUnitIdx) {
        prev.value += carry
      } else {
        segments.splice(i, 0, { unitIdx: largerUnitIdx, value: carry })
        i += 1
      }
    }
  }

  // Drop trailing zero segments
  while (segments.length > 1) {
    const last = segments.at(-1)
    if (last?.value !== 0) break
    segments.pop()
  }

  if (segments.length === 0) {
    return formatSegment(0, getUnit(UNITS.length - 1), long)
  }

  if (segments.every((segment) => segment.value === 0)) {
    return formatSegment(0, getUnit(UNITS.length - 1), long)
  }

  const parts = segments.map((seg) => formatSegment(seg.value, getUnit(seg.unitIdx), long))

  const result = parts.join(" ")
  return isNegative ? `-${result}` : result
}
