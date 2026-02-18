import { describe, expect, it } from "bun:test"
import { isCompoundTimeExpression, isTimeExpression } from "../lib/utils"

describe("isTimeExpression", () => {
  it("should return true for valid simple expressions", () => {
    expect(isTimeExpression("1h")).toBe(true)
    expect(isTimeExpression("500ms")).toBe(true)
    expect(isTimeExpression("2.5d")).toBe(true)
    expect(isTimeExpression("100")).toBe(true)
    expect(isTimeExpression("1 second")).toBe(true)
    expect(isTimeExpression(".5ms")).toBe(true)
  })

  it("should return false for compound expressions", () => {
    expect(isTimeExpression("1h 30m")).toBe(false)
    expect(isTimeExpression("1 day, 6 hours")).toBe(false)
    expect(isTimeExpression("1h, 30m, 15s")).toBe(false)
    expect(isTimeExpression("1h30m")).toBe(false)
  })

  it("should return false for invalid strings", () => {
    expect(isTimeExpression("hello")).toBe(false)
    expect(isTimeExpression("abc123")).toBe(false)
    expect(isTimeExpression("☃")).toBe(false)
    expect(isTimeExpression("ms")).toBe(false)
    expect(isTimeExpression("foo")).toBe(false)
  })

  it("should return false for whitespace forms outside TimeExpression syntax", () => {
    expect(isTimeExpression(" 1h")).toBe(false)
    expect(isTimeExpression("1h ")).toBe(false)
    expect(isTimeExpression("1  hour")).toBe(false)
    expect(isTimeExpression("1\thour")).toBe(false)
  })

  it("should return false for expressions that overflow to non-finite values", () => {
    expect(isTimeExpression("1e309ms")).toBe(false)
    expect(isTimeExpression("-1e309ms")).toBe(false)
    expect(isTimeExpression("1e309s")).toBe(false)
    expect(isTimeExpression("1e400y")).toBe(false)
    expect(isTimeExpression("1e308y")).toBe(false)
  })

  it("should return false for empty string", () => {
    expect(isTimeExpression("")).toBe(false)
  })

  it("should return false for very long strings", () => {
    expect(isTimeExpression("a".repeat(201))).toBe(false)
  })

  it("should return false for non-string inputs at runtime", () => {
    expect(isTimeExpression(undefined as never)).toBe(false)
    expect(isTimeExpression(null as never)).toBe(false)
    expect(isTimeExpression(123 as never)).toBe(false)
    expect(isTimeExpression([] as never)).toBe(false)
    expect(isTimeExpression({} as never)).toBe(false)
  })
})

describe("isCompoundTimeExpression", () => {
  it("should return true for valid simple expressions", () => {
    expect(isCompoundTimeExpression("1h")).toBe(true)
    expect(isCompoundTimeExpression("500ms")).toBe(true)
    expect(isCompoundTimeExpression("2.5d")).toBe(true)
    expect(isCompoundTimeExpression("100")).toBe(true)
    expect(isCompoundTimeExpression("1 second")).toBe(true)
    expect(isCompoundTimeExpression(".5ms")).toBe(true)
  })

  it("should return true for valid compound expressions", () => {
    expect(isCompoundTimeExpression("1h 30m")).toBe(true)
    expect(isCompoundTimeExpression("1 day, 6 hours")).toBe(true)
    expect(isCompoundTimeExpression("1h, 30m, 15s")).toBe(true)
    expect(isCompoundTimeExpression("1h30m")).toBe(true)
  })

  it("should return false for invalid strings", () => {
    expect(isCompoundTimeExpression("hello")).toBe(false)
    expect(isCompoundTimeExpression("abc123")).toBe(false)
    expect(isCompoundTimeExpression("☃")).toBe(false)
    expect(isCompoundTimeExpression("ms")).toBe(false)
    expect(isCompoundTimeExpression("foo")).toBe(false)
    expect(isCompoundTimeExpression(",1h")).toBe(false)
    expect(isCompoundTimeExpression("1h,")).toBe(false)
    expect(isCompoundTimeExpression("1h,,30m")).toBe(false)
    expect(isCompoundTimeExpression("1h, ,30m")).toBe(false)
  })

  it("should return false for expressions that overflow to non-finite values", () => {
    expect(isCompoundTimeExpression("1e309ms")).toBe(false)
    expect(isCompoundTimeExpression("-1e309ms")).toBe(false)
    expect(isCompoundTimeExpression("1e309s")).toBe(false)
    expect(isCompoundTimeExpression("1e400y")).toBe(false)
    expect(isCompoundTimeExpression("1e308y")).toBe(false)
  })

  it("should return false for empty string", () => {
    expect(isCompoundTimeExpression("")).toBe(false)
  })

  it("should return false for very long strings", () => {
    expect(isCompoundTimeExpression("a".repeat(201))).toBe(false)
  })

  it("should return false for non-string inputs at runtime", () => {
    expect(isCompoundTimeExpression(undefined as never)).toBe(false)
    expect(isCompoundTimeExpression(null as never)).toBe(false)
    expect(isCompoundTimeExpression(123 as never)).toBe(false)
    expect(isCompoundTimeExpression([] as never)).toBe(false)
    expect(isCompoundTimeExpression({} as never)).toBe(false)
  })
})
