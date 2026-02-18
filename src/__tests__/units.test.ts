import { describe, expect, it } from "bun:test"
import { MS_PER_HOUR, MS_PER_MINUTE, MS_PER_SECOND } from "../lib/constants"
import { days, hours, minutes, months, ms, parse, seconds, weeks, years } from "../lib/parsers"

describe("ms", () => {
  it("should return milliseconds for simple expressions", () => {
    expect(ms("1s")).toBe(1000)
    expect(ms("5m")).toBe(300_000)
    expect(ms("1h")).toBe(3_600_000)
    expect(ms("100")).toBe(100)
  })

  it("should return milliseconds for compound expressions via parse", () => {
    expect(parse("1h 30m")).toBe(5_400_000)
    expect(parse("1h, 30m, 15s")).toBe(5_415_000)
  })

  it("should throw for invalid input", () => {
    expect(() => ms("" as never)).toThrow()
  })

  it("should return NaN for unparseable strings", () => {
    expect(Number.isNaN(ms("foo" as never))).toBe(true)
  })
})

describe("seconds", () => {
  it("should convert to seconds", () => {
    expect(seconds("1h")).toBe(3600)
    expect(seconds("500ms")).toBe(0.5)
    expect(seconds("1m")).toBe(60)
  })

  it("should convert compound expressions to seconds via parse", () => {
    expect(parse("1d 6h 30m") / MS_PER_SECOND).toBe(109_800)
  })

  it("should throw for invalid input", () => {
    expect(() => seconds("" as never)).toThrow()
  })

  it("should return NaN for unparseable strings", () => {
    expect(Number.isNaN(seconds("☃" as never))).toBe(true)
  })
})

describe("minutes", () => {
  it("should convert to minutes", () => {
    expect(minutes("2h")).toBe(120)
    expect(minutes("30s")).toBe(0.5)
    expect(minutes("1d")).toBe(1440)
  })

  it("should convert compound expressions to minutes via parse", () => {
    expect(parse("1 year 2 weeks 5 days") / MS_PER_MINUTE).toBeCloseTo(
      (31_557_600_000 + 2 * 604_800_000 + 5 * 86_400_000) / 60_000
    )
  })

  it("should throw for invalid input", () => {
    expect(() => minutes(null as never)).toThrow()
  })
})

describe("hours", () => {
  it("should convert to hours", () => {
    expect(hours("1d")).toBe(24)
    expect(hours("30m")).toBe(0.5)
    expect(hours("1w")).toBe(168)
  })

  it("should convert compound expressions to hours via parse", () => {
    expect(parse("1w 2d") / MS_PER_HOUR).toBe(216)
  })

  it("should return NaN for unparseable strings", () => {
    expect(Number.isNaN(hours("bar" as never))).toBe(true)
  })
})

describe("days", () => {
  it("should convert to days", () => {
    expect(days("1w")).toBe(7)
    expect(days("12h")).toBe(0.5)
    expect(days("48h")).toBe(2)
  })
})

describe("weeks", () => {
  it("should convert to weeks", () => {
    expect(weeks("14d")).toBe(2)
    expect(weeks("1y")).toBeCloseTo(52.1775)
  })
})

describe("months", () => {
  it("should convert to months", () => {
    expect(months("1y")).toBe(12)
  })
})

describe("years", () => {
  it("should convert to years", () => {
    expect(years("365.25d")).toBeCloseTo(1)
    expect(years("6mo")).toBeCloseTo(0.5)
  })
})
