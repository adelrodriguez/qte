---
"qte": patch
---

Audit-driven cleanup:

- Fixed compound negative round-tripping by applying leading sign semantics to compound expressions (for example, `parse("-1h 30m")` now returns `-5_400_000`).
- Hardened `format` option validation so `precision` must be a finite positive integer; invalid values now throw `RangeError`.
- Updated package entry metadata to point at built `dist` outputs for improved publish-time compatibility.
- Added regression tests and README updates for the new semantics.
- Tightened comma separator parsing to reject malformed punctuation such as leading/trailing/repeated commas.
- Normalized precision-rounded signed-zero output to `0ms` / `0 milliseconds`.
- Added exponent notation support in `parse` numeric tokens so very large `format()` outputs remain parseable (`parse(format(1e40))` no longer returns `NaN`).

Behavior note: leading-sign compound parsing changed from additive-by-segment to global-sign semantics when only the first segment is signed.
