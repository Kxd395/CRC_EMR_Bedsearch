# ADR-004: Constitution as Runtime Contract

**Status:** Accepted  
**Date:** 2025-10-06  
**Related:** [ADR-001](./ADR-001-typescript-over-mcp.md)

## Decision

Load `agent.constitution.md` into the system prompt at runtime, making it the authoritative specification for model behavior.

## Rationale

- **Single source of rules**: No duplicate documentation of constraints
- **Runtime enforcement**: Rules literally given to model every execution
- **Evolvable**: Update constitution without code changes
- **Auditable**: Constitution file IS the contract

## Implementation

```typescript
// Flexible path loading (root or src/)
const paths = [
  path.join(__dirname, "..", "agent.constitution.md"),
  path.join(__dirname, "agent.constitution.md")
];

async function systemPrompt() {
  const constitution = await loadFromFirstExisting(paths);
  const bindings = await fs.readFile("bindings.d.ts", "utf8");
  return [constitution, "Bindings API:", bindings].join("\n");
}
```

**File:** `src/runModel.ts`

## Consequences

- ✅ DRY (don't repeat rules in code + docs)
- ✅ Living documentation
- ⚠️ Token overhead (~500-1000 tokens per call)
- ✅ Clear authority (constitution = contract)

---

**Last Updated:** 2025-10-06
