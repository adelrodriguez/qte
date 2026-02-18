import { describe, expect, it } from "bun:test"
import { format, parse, MS_PER_MONTH, MS_PER_WEEK, MS_PER_YEAR } from "../index"
import { getUnitMs } from "../lib/units"

const CLEAN_VALUES = [
  0, 500, 1000, 5000, 30_000, 60_000, 300_000, 600_000, 3_600_000, 86_400_000, 604_800_000,
  2_629_800_000, 31_557_600_000,
]

function getLastUnitMs(expr: string): number {
  const token = expr.split(" ").at(-1)
  if (!token) throw new Error(`Cannot determine unit for expression: ${expr}`)

  const unit = token.match(/[a-zA-Z]+$/)?.[0]
  if (!unit) throw new Error(`Cannot determine unit suffix for expression: ${expr}`)

  const unitMs = getUnitMs(unit.toLowerCase())
  if (Number.isNaN(unitMs)) throw new Error(`Unsupported unit suffix in expression: ${expr}`)

  return unitMs
}

describe("format → parse", () => {
  it("should round-trip clean values at default precision", () => {
    for (const val of CLEAN_VALUES) {
      expect(parse(format(val))).toBe(val)
    }
  })

  it("should round-trip clean values at precision 2", () => {
    for (const val of CLEAN_VALUES) {
      expect(parse(format(val, { precision: 2 }))).toBe(val)
    }
  })

  it("should round-trip clean values at precision 3", () => {
    for (const val of CLEAN_VALUES) {
      expect(parse(format(val, { precision: 3 }))).toBe(val)
    }
  })

  it("should exactly round-trip multi-unit values at high precision", () => {
    for (const val of [5_432_100, 90_061_100, 109_800_000]) {
      expect(parse(format(val, { precision: 10 }))).toBe(val)
    }
  })

  it("should round-trip long format at precision 1", () => {
    expect(parse(format(3_600_000, { long: true }))).toBe(3_600_000)
    expect(parse(format(86_400_000, { long: true }))).toBe(86_400_000)
    expect(parse(format(1000, { long: true }))).toBe(1000)
  })

  it("should round-trip long format at higher precision", () => {
    const formatted = format(5_400_000, { long: true, precision: 2 })
    expect(parse(formatted)).toBe(5_400_000)
  })

  it("should round-trip negative values", () => {
    expect(parse(format(-3_600_000))).toBe(-3_600_000)
    expect(parse(format(-86_400_000, { long: true }))).toBe(-86_400_000)
    expect(parse(format(-5_400_000, { precision: 2 }))).toBe(-5_400_000)
    expect(parse(format(-5_400_000, { long: true, precision: 2 }))).toBe(-5_400_000)
  })

  it("should feed format output into parse", () => {
    expect(parse(format(3_600_000))).toBe(3_600_000)
    expect(parse(format(86_400_000))).toBe(86_400_000)

    const expr = format(5_400_000, { precision: 2 })
    expect(parse(expr)).toBe(5_400_000)
  })

  it("should stay within precision-based rounding bounds for sampled values", () => {
    let seed = 123_456_789

    const next = () => {
      seed = (seed * 1_664_525 + 1_013_904_223) % 2 ** 32
      return seed / 2 ** 32
    }

    for (const precision of [1, 2, 3]) {
      for (let i = 0; i < 250; i += 1) {
        const value = (next() * 2 - 1) * 10 * MS_PER_YEAR
        const expr = format(value, { precision })
        const parsed = parse(expr)
        const bound = getLastUnitMs(expr) / 2 + Number.EPSILON * 32

        expect(Math.abs(parsed - value)).toBeLessThanOrEqual(bound)
      }
    }
  })

  it("should document expected month/week approximation at low precision", () => {
    const value = 5 * MS_PER_WEEK
    const expr = format(value, { precision: 2 })
    const parsed = parse(expr)

    expect(expr).toBe("1mo 1w")
    expect(parsed).toBe(1 * MS_PER_MONTH + 1 * MS_PER_WEEK)
    expect(Math.abs(parsed - value)).toBe(210_600_000)
  })

  it("should keep very large finite format output parseable", () => {
    const values = [1e40, 1e100, -1e40, -1e100]

    for (const value of values) {
      for (const options of [undefined, { precision: 2 }, { long: true, precision: 2 }] as const) {
        const expr = options ? format(value, options) : format(value)
        const parsed = parse(expr)
        const bound =
          getLastUnitMs(expr) / 2 + Math.abs(value) * Number.EPSILON * 8 + Number.EPSILON * 32

        expect(Number.isNaN(parsed)).toBe(false)
        expect(Number.isFinite(parsed)).toBe(true)
        expect(Math.sign(parsed)).toBe(Math.sign(value))
        expect(Math.abs(parsed - value)).toBeLessThanOrEqual(bound)
      }
    }
  })
})
