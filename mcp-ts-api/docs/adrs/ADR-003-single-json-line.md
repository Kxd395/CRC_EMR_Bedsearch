# ADR-003: Single JSON Line Output Contract

**Status:** Accepted  
**Date:** 2025-10-06  
**Related:** [ADR-001](./ADR-001-typescript-over-mcp.md), [ADR-002](./ADR-002-deno-sandbox.md)

## Decision

Model-generated code MUST produce exactly one line of JSON output to stdout. This is strictly enforced by filtering stdout to JSON-like lines and throwing an error if count ≠ 1.

**Valid:**
```json
{"status": "success", "data": [...]}
```

**Invalid:**
```
{"result": "data"}
Task complete!
```

## Rationale

- **Deterministic parsing**: No ambiguity about the result
- **Prevents noise**: Model can't leak debug logs or commentary
- **Clear validation boundary**: Easy to detect malformed output
- **Composition friendly**: Clear contract for chaining tasks

## Implementation

```typescript
// Filter stdout to JSON-like lines
const jsonLines = stdout.split("\n")
  .filter(line => /^\s*[\[{].*[\]}]\s*$/.test(line));

if (jsonLines.length !== 1) {
  throw new Error(`Expected exactly 1 JSON line, found ${jsonLines.length}`);
}
```

**File:** `src/runModel.ts` function `extractSingleJsonLine()`

## Consequences

- ✅ Reliable output parsing
- ✅ Clear error messages when models violate contract
- ⚠️ Models must understand constraint (documented in constitution)

---

**Last Updated:** 2025-10-06
