# qte

## 0.1.1

### Patch Changes

- a1fab60: Fix broken bundle size badge in README and move typescript to devDependencies

## 0.1.0

### Minor Changes

- de51ec7: Initial implementation of the qte library: parse human-readable time expressions into any unit, and format durations into human-readable strings. Includes `parse`, `format`, `isTimeExpression`, eight unit functions (`ms`, `seconds`, `minutes`, `hours`, `days`, `weeks`, `months`, `years`), and public conversion constants.

### Patch Changes

- de51ec7: Audit-driven cleanup:

  - Fixed compound negative round-tripping by applying leading sign semantics to compound expressions (for example, `parse("-1h 30m")` now returns `-5_400_000`).
  - Hardened `format` option validation so `precision` must be a finite positive integer; invalid values now throw `RangeError`.
  - Updated package entry metadata to point at built `dist` outputs for improved publish-time compatibility.
  - Added regression tests and README updates for the new semantics.
  - Tightened comma separator parsing to reject malformed punctuation such as leading/trailing/repeated commas.
  - Normalized precision-rounded signed-zero output to `0ms` / `0 milliseconds`.
  - Added exponent notation support in `parse` numeric tokens so very large `format()` outputs remain parseable (`parse(format(1e40))` no longer returns `NaN`).

  Behavior note: leading-sign compound parsing changed from additive-by-segment to global-sign semantics when only the first segment is signed.
