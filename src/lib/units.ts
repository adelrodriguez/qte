import type { UnitDefinition } from "./types"
import {
  MS_PER_DAY,
  MS_PER_HOUR,
  MS_PER_MINUTE,
  MS_PER_MONTH,
  MS_PER_SECOND,
  MS_PER_WEEK,
  MS_PER_YEAR,
} from "./constants"

export const UNITS = [
  {
    aliases: ["years", "year", "yrs", "yr", "y"],
    long: "year",
    longPlural: "years",
    ms: MS_PER_YEAR,
    short: "y",
  },
  {
    aliases: ["months", "month", "mo"],
    long: "month",
    longPlural: "months",
    ms: MS_PER_MONTH,
    short: "mo",
  },
  {
    aliases: ["weeks", "week", "w"],
    long: "week",
    longPlural: "weeks",
    ms: MS_PER_WEEK,
    short: "w",
  },
  {
    aliases: ["days", "day", "d"],
    long: "day",
    longPlural: "days",
    ms: MS_PER_DAY,
    short: "d",
  },
  {
    aliases: ["hours", "hour", "hrs", "hr", "h"],
    long: "hour",
    longPlural: "hours",
    ms: MS_PER_HOUR,
    short: "h",
  },
  {
    aliases: ["minutes", "minute", "mins", "min", "m"],
    long: "minute",
    longPlural: "minutes",
    ms: MS_PER_MINUTE,
    short: "m",
  },
  {
    aliases: ["seconds", "second", "secs", "sec", "s"],
    long: "second",
    longPlural: "seconds",
    ms: MS_PER_SECOND,
    short: "s",
  },
  {
    aliases: ["milliseconds", "millisecond", "msecs", "msec", "ms"],
    long: "millisecond",
    longPlural: "milliseconds",
    ms: 1,
    short: "ms",
  },
] as const satisfies readonly UnitDefinition[]

function escapeRegExp(value: string): string {
  return value.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

const UNIT_ALIASES = [...new Set(UNITS.flatMap((unit) => unit.aliases))]
const UNIT_MS_MAP: ReadonlyMap<string, number> = new Map(
  UNITS.flatMap((unit) => unit.aliases.map((alias) => [alias, unit.ms] as const))
)

export const UNIT_ALIAS_PATTERN = UNIT_ALIASES.toSorted((a, b) => b.length - a.length)
  .map((alias) => escapeRegExp(alias))
  .join("|")

export function getUnitMs(alias: string): number {
  return UNIT_MS_MAP.get(alias) ?? Number.NaN
}
