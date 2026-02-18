import { describe, expect, it } from "bun:test"
import { parse } from "../lib/parsers"

describe("parse", () => {
  it("should preserve bare numbers as milliseconds", () => {
    expect(parse("100")).toBe(100)
    expect(parse("0")).toBe(0)
  })

  it("should convert millisecond aliases", () => {
    expect(parse("100ms")).toBe(100)
    expect(parse("53 milliseconds")).toBe(53)
    expect(parse("17 msecs")).toBe(17)
    expect(parse("1 msec")).toBe(1)
    expect(parse("1 millisecond")).toBe(1)
  })

  it("should convert second aliases", () => {
    expect(parse("1s")).toBe(1000)
    expect(parse("1 sec")).toBe(1000)
    expect(parse("1 secs")).toBe(1000)
    expect(parse("1 second")).toBe(1000)
    expect(parse("1 seconds")).toBe(1000)
  })

  it("should convert minute aliases", () => {
    expect(parse("1m")).toBe(60_000)
    expect(parse("1 min")).toBe(60_000)
    expect(parse("1 mins")).toBe(60_000)
    expect(parse("1 minute")).toBe(60_000)
    expect(parse("1 minutes")).toBe(60_000)
  })

  it("should convert hour aliases", () => {
    expect(parse("1h")).toBe(3_600_000)
    expect(parse("1 hr")).toBe(3_600_000)
    expect(parse("1 hrs")).toBe(3_600_000)
    expect(parse("1 hour")).toBe(3_600_000)
    expect(parse("1 hours")).toBe(3_600_000)
  })

  it("should convert day aliases", () => {
    expect(parse("1d")).toBe(86_400_000)
    expect(parse("2d")).toBe(172_800_000)
    expect(parse("1 day")).toBe(86_400_000)
    expect(parse("2 days")).toBe(172_800_000)
  })

  it("should convert week aliases", () => {
    expect(parse("1w")).toBe(604_800_000)
    expect(parse("3w")).toBe(1_814_400_000)
    expect(parse("1 week")).toBe(604_800_000)
    expect(parse("2 weeks")).toBe(1_209_600_000)
  })

  it("should convert month aliases", () => {
    expect(parse("1 month")).toBe(2_629_800_000)
    expect(parse("1mo")).toBe(2_629_800_000)
    expect(parse("2 months")).toBe(5_259_600_000)
  })

  it("should convert year aliases", () => {
    expect(parse("1y")).toBe(31_557_600_000)
    expect(parse("1 yr")).toBe(31_557_600_000)
    expect(parse("1 yrs")).toBe(31_557_600_000)
    expect(parse("1 year")).toBe(31_557_600_000)
    expect(parse("1 years")).toBe(31_557_600_000)
  })

  it("should be case-insensitive", () => {
    expect(parse("1H")).toBe(3_600_000)
    expect(parse("1 Hour")).toBe(3_600_000)
    expect(parse("1 HOUR")).toBe(3_600_000)
    expect(parse("53 YeArS")).toBe(1_672_552_800_000)
    expect(parse("53 WeEkS")).toBe(32_054_400_000)
    expect(parse("53 DaYS")).toBe(4_579_200_000)
    expect(parse("53 HoUrs")).toBe(190_800_000)
    expect(parse("53 MiLliSeCondS")).toBe(53)
  })

  it("should allow multiple spaces between number and unit", () => {
    expect(parse("1   h")).toBe(3_600_000)
    expect(parse("1   s")).toBe(1000)
    expect(parse("1 h")).toBe(3_600_000)
  })

  it("should handle decimal values", () => {
    expect(parse("1.5h")).toBe(5_400_000)
    expect(parse("1.5 hours")).toBe(5_400_000)
    expect(parse("-10.5h")).toBe(-37_800_000)
  })

  it("should handle leading-dot decimals", () => {
    expect(parse(".5ms")).toBe(0.5)
    expect(parse("-.5h")).toBe(-1_800_000)
  })

  it("should handle exponent notation", () => {
    expect(parse("1e3ms")).toBe(1000)
    expect(parse("1e2s")).toBe(100_000)
    expect(parse("-2.5e2s")).toBe(-250_000)
    expect(parse("+1E2m")).toBe(6_000_000)
    expect(parse("1e2m30s")).toBe(6_030_000)
  })

  it("should reject exponent overflow and non-finite totals", () => {
    expect(Number.isNaN(parse("1e309ms"))).toBe(true)
    expect(Number.isNaN(parse("-1e309ms"))).toBe(true)
    expect(Number.isNaN(parse("1e309s"))).toBe(true)
    expect(Number.isNaN(parse("1e400y"))).toBe(true)
    expect(Number.isNaN(parse("1e308y"))).toBe(true)
    expect(Number.isNaN(parse("1e308ms 1e308ms"))).toBe(true)
    expect(Number.isNaN(parse("1e308ms -1e308ms 1e308ms"))).toBe(true)
  })

  it("should handle negative values", () => {
    expect(parse("-100ms")).toBe(-100)
    expect(parse("-1.5h")).toBe(-5_400_000)
    expect(parse("-500ms")).toBe(-500)
  })

  it("should parse space-separated compound expressions", () => {
    expect(parse("1h 30m")).toBe(5_400_000)
  })

  it("should parse comma-separated compound expressions", () => {
    expect(parse("1h, 30m, 15s")).toBe(5_415_000)
  })

  it("should parse compound expressions with no separator", () => {
    expect(parse("1h30m")).toBe(5_400_000)
  })

  it("should parse long-form compound expressions", () => {
    expect(parse("1 hour 30 minutes")).toBe(5_400_000)
    expect(parse("1 year 2 weeks 5 days")).toBe(31_557_600_000 + 2 * 604_800_000 + 5 * 86_400_000)
  })

  it("should parse mixed short and long forms", () => {
    expect(parse("1 hour, 30m")).toBe(5_400_000)
  })

  it("should sum duplicate units", () => {
    expect(parse("1h 2h")).toBe(10_800_000)
  })

  it("should be order-independent", () => {
    expect(parse("30m 1h")).toBe(parse("1h 30m"))
  })

  it("should parse complex compound expressions", () => {
    expect(parse("1 day, 6 hours, 30 minutes")).toBe(109_800_000)
    expect(parse("1d 6h 30m")).toBe(109_800_000)
  })

  it("should apply a leading sign to compound expressions", () => {
    expect(parse("-1h 30m")).toBe(-5_400_000)
    expect(parse("-1h30m")).toBe(-5_400_000)
    expect(parse("-1 hour 30 minutes")).toBe(-5_400_000)
    expect(parse("+1h 30m")).toBe(5_400_000)
  })

  it("should preserve explicit per-segment sign semantics", () => {
    expect(parse("-1h -30m")).toBe(-5_400_000)
    expect(parse("-1h +30m")).toBe(-1_800_000)
    expect(parse("+1h30m")).toBe(5_400_000)
  })

  it("should parse no-space signed compound expressions", () => {
    expect(parse("1h-30m")).toBe(1_800_000)
    expect(parse("1h+30m")).toBe(5_400_000)
    expect(parse("-1h+30m")).toBe(-1_800_000)
    expect(parse("-1h-30m")).toBe(-5_400_000)
  })

  it("should apply mixed signed-compound precedence consistently", () => {
    expect(parse("-1h 30m -10m")).toBe(-2_400_000)
    expect(parse("-1h 30m +10m")).toBe(-1_200_000)

    expect(parse("-1h,30m,-10m")).toBe(-2_400_000)
    expect(parse("-1h,30m,+10m")).toBe(-1_200_000)

    expect(parse("-1h30m-10m")).toBe(-2_400_000)
    expect(parse("-1h30m+10m")).toBe(-1_200_000)
  })

  it("should throw for empty string", () => {
    expect(() => parse("" as never)).toThrow(TypeError)
  })

  it("should throw for string exceeding 200 characters", () => {
    expect(() => parse("a".repeat(201))).toThrow(TypeError)
  })

  it("should throw for non-string inputs", () => {
    expect(() => parse(undefined as never)).toThrow(TypeError)
    expect(() => parse(null as never)).toThrow(TypeError)
    expect(() => parse([] as never)).toThrow(TypeError)
    expect(() => parse({} as never)).toThrow(TypeError)
    expect(() => parse(Number.NaN as never)).toThrow(TypeError)
    expect(() => parse(Number.POSITIVE_INFINITY as never)).toThrow(TypeError)
    expect(() => parse(Number.NEGATIVE_INFINITY as never)).toThrow(TypeError)
  })

  it("should include invalid runtime inputs in thrown messages", () => {
    expect(() => parse(Number.POSITIVE_INFINITY as never)).toThrow(/Received: Infinity/)
    expect(() => parse(Number.NaN as never)).toThrow(/Received: NaN/)
  })

  it("should return NaN for unparseable strings", () => {
    expect(Number.isNaN(parse("☃"))).toBe(true)
    expect(Number.isNaN(parse("10-.5"))).toBe(true)
    expect(Number.isNaN(parse("ms"))).toBe(true)
    expect(Number.isNaN(parse("foo"))).toBe(true)
  })

  it("should return NaN when garbage is mixed with valid parts", () => {
    expect(Number.isNaN(parse("1h foo 30m"))).toBe(true)
  })

  it("should reject malformed comma separators", () => {
    expect(Number.isNaN(parse(",1h"))).toBe(true)
    expect(Number.isNaN(parse("1h,"))).toBe(true)
    expect(Number.isNaN(parse("1h,,30m"))).toBe(true)
    expect(Number.isNaN(parse("1h, ,30m"))).toBe(true)
  })
})
