# ADR-002: Deno Sandbox Over Node.js VM

**Status:** Accepted  
**Date:** 2025-10-06  
**Deciders:** @AxxessPhila  
**Related:** [ADR-001](./ADR-001-typescript-over-mcp.md)

---

## Context and Problem Statement

Model-generated code is untrusted and must execute in isolation. We need a sandbox that provides:
- True process isolation (not just VM context)
- Granular permission controls
- Native TypeScript execution
- Reliable timeout enforcement

**Question:** Which execution environment provides the best security and developer experience?

---

## Decision

Execute model-generated TypeScript code in Deno with `--deny-all` permissions.

**Default Permissions:**
- ❌ Filesystem (read/write)
- ❌ Network access
- ❌ Environment variables
- ❌ System info
- ❌ Process spawning
- ✅ Compute only (pure JavaScript/TypeScript)

**Opt-in:**
- `ALLOW_NET=domain1.com,domain2.com` for specific network access

---

## Rationale

### Advantages

1. **True Isolation** - Separate process, not VM context
2. **Granular Permissions** - Deny-all by default, opt-in for specific capabilities
3. **TypeScript Native** - No transpilation, runs .ts directly
4. **Reliable Timeouts** - Process can be killed cleanly
5. **No Escape Hatches** - Cannot `require()` built-ins or access `process`

### Trade-offs

**Gains:**
- ✅ Real security boundary (process-level isolation)
- ✅ Configurable timeout (20s default via `SANDBOX_TIMEOUT_MS`)
- ✅ TypeScript support without build step

**Costs:**
- ⚠️ Process spawn overhead (~100-300ms)
- ⚠️ Requires Deno installation

**Not suitable for:**
- ❌ Sub-100ms latency requirements

---

## Considered Alternatives

### Alternative 1: Node.js VM Module

**Approach:** Use `vm.runInNewContext()` or `vm.Script`

**Cons:**
- Not true isolation (same process, can potentially escape)
- Difficult to enforce filesystem/network restrictions
- Timeouts unreliable (infinite loops can hang)

**Decision:** Rejected. Insufficient security guarantees.

### Alternative 2: Docker Containers

**Approach:** Execute code in ephemeral Docker containers

**Pros:**
- Strong isolation
- Well-understood security model

**Cons:**
- Much higher overhead (seconds, not milliseconds)
- Requires Docker daemon
- Complex setup for local development

**Decision:** Rejected. Overhead too high for synchronous API calls.

### Alternative 3: WebAssembly Sandbox

**Approach:** Compile TypeScript to WASM and run in isolated runtime

**Pros:**
- Fast execution
- Strong sandbox

**Cons:**
- Complex toolchain
- Limited ecosystem (can't easily use npm packages)
- TypeScript → WASM compilation adds significant complexity

**Decision:** Rejected. Complexity outweighs benefits for this use case.

---

## Implementation

**Execution Command:**
```bash
deno run --deny-all ${ALLOW_NET ? `--allow-net=${ALLOW_NET}` : ''} /tmp/code.ts
```

**Timeout Enforcement:**
```typescript
const { stdout, stderr } = await pExecFile("deno", args, { 
  timeout: SANDBOX_TIMEOUT_MS  // default: 20000
});
```

**File:** `src/runModel.ts`

---

## Consequences

### Positive
- ✅ Untrusted code cannot access filesystem or network by default
- ✅ Models can write TypeScript without transpilation step
- ✅ Timeouts prevent infinite loops or long-running tasks

### Negative
- ⚠️ Users must install Deno (`brew install deno`)
- ⚠️ Process spawn has ~100-300ms overhead

---

## Validation

**Success Criteria:**
- [x] Sandbox denies filesystem access by default
- [x] Sandbox denies network access by default (unless `ALLOW_NET` set)
- [x] Timeout kills runaway processes
- [x] TypeScript executes without compilation

---

## Related Decisions

- [ADR-001: TypeScript API](./ADR-001-typescript-over-mcp.md)
- [ADR-003: Single JSON Line](./ADR-003-single-json-line.md)

---

**Last Updated:** 2025-10-06  
**Supersedes:** N/A  
**Superseded By:** N/A (Active)
