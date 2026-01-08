# MCP TypeScript API - Single Source of Truth (SSOT)
## Technical Design Authority

**Document Version:** 1.0.0  
**Last Updated:** 2025-10-06  
**Status:** Active  
**Owner:** @AxxessPhila  

---

## Document Purpose

This is the **authoritative technical reference** for the MCP TypeScript API framework. It defines architectural decisions, system contracts, security boundaries, and extension patterns. All implementation, documentation, and agent behavior must align with this SSOT.

**Audience:**
- **Developers** - Understanding architecture and extending the system
- **Security Auditors** - Validating safety guarantees and boundaries
- **AI Agents** - Reading at runtime via constitution integration
- **DevOps** - Deployment, monitoring, and version management
- **Contributors** - Maintaining consistency across changes

---

## Table of Contents

1. [Architecture Decision Records (ADRs)](#1-architecture-decision-records-adrs)
2. [System Contracts](#2-system-contracts)
3. [Security Model](#3-security-model)
4. [Runtime Behavior](#4-runtime-behavior)
5. [Extension Points](#5-extension-points)
6. [Version Compatibility Matrix](#6-version-compatibility-matrix)
7. [Quality Standards](#7-quality-standards)
8. [Governance](#8-governance)

---

## 1. Architecture Decision Records (ADRs)

**See standalone ADR files in [`docs/adrs/`](docs/adrs/) for complete details.**

### ADR-001: TypeScript API Over Classic MCP

**Full Document:** [docs/adrs/ADR-001-typescript-over-mcp.md](docs/adrs/ADR-001-typescript-over-mcp.md)

**Decision:** Generate TypeScript bindings from MCP schemas and have models write code using typed APIs, rather than using the classic MCP request/response loop.

**Key Benefits:**
- Fewer round trips - Model writes complete solution once vs. iterative tool calls
- Better composition - Code can chain operations, use variables, implement logic
- Stronger types - TypeScript inference catches errors before execution
- Lower context bloat - No tool call history accumulating in context

**Status:** Accepted (2025-10-06)

---

### ADR-002: Deno Sandbox Over Node.js VM

**Full Document:** [docs/adrs/ADR-002-deno-sandbox.md](docs/adrs/ADR-002-deno-sandbox.md)

**Full Document:** [docs/adrs/ADR-002-deno-sandbox.md](docs/adrs/ADR-002-deno-sandbox.md)

**Decision:** Execute model-generated code in Deno with `--deny-all` permissions, rather than Node.js `vm` module.

**Key Benefits:**
- True isolation - Separate process, not just VM context
- Granular permissions - Filesystem, network, env access all opt-in
- No escape hatches - Cannot require() built-in modules or access process
- TypeScript native - No transpilation needed, runs .ts directly

**Status:** Accepted (2025-10-06)

---

### ADR-003: Single JSON Line Output Contract

**Full Document:** [docs/adrs/ADR-003-single-json-line.md](docs/adrs/ADR-003-single-json-line.md)

**Decision:** Generated code must produce exactly one line of JSON output to stdout, strictly enforced by filtering and counting.

**Key Benefits:**
- Deterministic parsing - No ambiguity about what the result is
- Prevents noise - Model can't leak debug logs, partial results, or commentary
- Validation boundary - Easy to detect malformed output or multiple results
- Composition friendly - Clear contract for chaining tasks

**Enforcement:** `runModel.ts` filters stdout to JSON-like lines `^\s*[\[{].*[\]}]\s*$`, throws error if count ≠ 1.

**Status:** Accepted (2025-10-06)

---

### ADR-004: Constitution as Runtime Contract

**Full Document:** [docs/adrs/ADR-004-constitution-runtime-contract.md](docs/adrs/ADR-004-constitution-runtime-contract.md)

**Decision:** Load `agent.constitution.md` into system prompt at runtime, making it the authoritative behavior specification for agents.

**Key Benefits:**
- Single source of rules - No duplicate documentation of constraints
- Runtime enforcement - Rules are literally given to the model every execution
- Evolvable - Update constitution without code changes
- Auditable - Constitution file is the contract, can be version controlled

- ✅ Gains: DRY (don't repeat rules), living documentation, clear authority
- ⚠️ Costs: Token overhead (~500-1000 tokens per call), must maintain quality
- ❌ Not suitable for: Extremely token-constrained scenarios

**Status:** Accepted (2025-10-06)

---

## 2. System Contracts

### 2.1 Input Contract: Schema → Bindings

**Schema Format:** MCP-compatible JSON with tools array
```json
{
  "tools": [
    {
      "name": "tool_name",
      "description": "What it does",
      "inputSchema": { "type": "object", "properties": {...} }
    }
  ]
}
```

**Generated Bindings:**
- `bindings.d.ts` - TypeScript type definitions (inputs, outputs, errors)
- `bindings.ts` - Runtime implementation (calls `bindings.runtime.ts`)

**Quality Requirements:**
- All tool names must be valid TypeScript identifiers
- Input schemas must be JSON Schema Draft 7 compatible
- Descriptions must be clear, complete sentences
- No duplicate tool names allowed

**Failure Modes:**
- Invalid schema → Generation fails with descriptive error
- Missing required fields → TypeScript compilation error
- Schema changes → `npm run gen:bindings` must be re-run

---

### 2.2 Runtime Contract: Constitution + Types → Code

**Inputs:**
1. **System Prompt** = Constitution + Bindings TypeScript definitions
2. **User Prompt** = Task description (e.g., "Search for X and summarize")
3. **Model** = GPT-4o-mini (temperature=0 for determinism)

**Expected Output:**
```typescript
async function executeTask() {
  // Model-generated code using bindings API
  const result = await toolName({ param: "value" });
  console.log(JSON.stringify(result));
}
executeTask();
```

**Validation Steps:**
1. Extract code block from model response
2. Write to temporary file
3. Execute in Deno sandbox with timeout
4. Filter stdout to JSON-like lines
5. Enforce exactly 1 JSON line
6. Parse and return

**Failure Modes:**
- No code block → Error: "No code block found"
- Multiple JSON lines → Error: "Expected exactly 1 JSON line, found N"
- Timeout exceeded → Error: "Execution timeout after Nms"
- Invalid JSON → Error: "Failed to parse result"

---

### 2.3 Output Contract: Single JSON Line

**Format:** Exactly one line matching regex `^\s*[\[{].*[\]}]\s*$`

**Valid Examples:**
```json
{"status": "success", "data": [...]}
[{"id": 1, "name": "test"}]
```

**Invalid Examples:**
```
// This is a comment
{"result": "data"}          ❌ Comment before JSON

{"result": "data"}
Task complete!              ❌ Text after JSON

{"part1": "a"}
{"part2": "b"}              ❌ Multiple JSON objects
```

**Enforcement:** `runModel.ts` function `extractSingleJsonLine(stdout: string)`

---

## 3. Security Model

### 3.1 Threat Model

**Assumptions:**
- Model output is **untrusted** - may contain malicious or malformed code
- External schemas are **untrusted** - may define dangerous operations
- User prompts are **untrusted** - may attempt prompt injection

**Threats Addressed:**
- ✅ **Code execution attacks** - Sandbox denies all I/O by default
- ✅ **Resource exhaustion** - Hard timeout (20s default), no infinite loops
- ✅ **Data exfiltration** - Network access requires explicit opt-in
- ✅ **Filesystem access** - Denied by default, no file read/write
- ✅ **Environment leakage** - Deno process has no access to host env vars

**Threats NOT Addressed:**
- ⚠️ **Prompt injection** - Model may be tricked by malicious user input (mitigation: review prompts)
- ⚠️ **Denial of service** - User can still consume OpenAI API quota (mitigation: rate limiting)
- ⚠️ **Schema poisoning** - Malicious schemas can define misleading tools (mitigation: schema review)

---

### 3.2 Sandbox Boundaries

**Deno Execution Flags:**
```bash
deno run --deny-all ${ALLOW_NET ? `--allow-net=${ALLOW_NET}` : ''} /tmp/code.ts
```

**Default Permissions (deny-all):**
- ❌ Filesystem read/write
- ❌ Network access
- ❌ Environment variables
- ❌ System info
- ❌ Process spawning
- ❌ FFI (foreign function interface)
- ✅ Compute only (pure JavaScript/TypeScript execution)

**Opt-In Permissions:**
- **Network** - Set `ALLOW_NET=api.example.com,other.domain.com` to allow specific domains
- **No other permissions** - Filesystem, env, etc. are never exposed

**Timeout:**
- Default: 20,000ms (20 seconds)
- Configurable: `SANDBOX_TIMEOUT_MS` environment variable
- Enforcement: Node.js `execa` timeout, kills Deno process

---

### 3.3 Token Usage and Cost Control

**Tracking:**
- Every model call logs: `[USAGE] prompt=X completion=Y total=Z` to stderr
- Enables cost analysis: `grep USAGE logs/*.log | awk '{sum+=$NF} END {print sum}'`

**Limits:**
- No hard limit enforced by framework
- User responsible for OpenAI API key quota management
- Recommendation: Set OpenAI organization/user limits

**Optimization:**
- Temperature=0 for deterministic output (no wasted retries)
- Constitution cached in system prompt (no repeated instructions)
- Bindings typed (reduces model errors, fewer retries)

---

## 4. Runtime Behavior

### 4.1 Constitution Loading (Flexible Path)

**Strategy:** Try multiple paths in order, fail if none exist

```typescript
const paths = [
  path.join(__dirname, "..", "agent.constitution.md"),  // Root
  path.join(__dirname, "agent.constitution.md")          // src/
];
```

**Rationale:** Supports both layouts (constitution at root or in src/)

**Failure:** Throws error if not found in either location

---

### 4.2 Tool Filtering (Manifest Whitelist)

**Optional Manifest:** `src/bindings.manifest.json`

```json
{
  "tools": ["search_docs", "summarize"]
}
```

**Behavior:**
- If manifest exists and has tools array: Filter schema to only whitelisted tools
- If manifest missing or empty: Use all tools from schema
- Logs: "Filtered to X of Y tools" when active

**Use Case:** Reduce tool confusion by limiting exposed API surface

---

### 4.3 Error Handling Levels

**Level 1: Schema Validation (compile time)**
- TypeScript compiler catches type errors in bindings
- Fail fast: `npm run gen:bindings` errors if schema invalid

**Level 2: Model Output Validation (runtime)**
- No code block → Descriptive error
- Multiple JSON lines → Exact count reported
- Invalid JSON → Parse error with details

**Level 3: Sandbox Execution (runtime)**
- Timeout → Process killed, error message includes duration
- Runtime errors → Captured stderr, included in error message
- Permission denied → Deno error explains what was attempted

**Principle:** Fail fast with actionable error messages

---

## 5. Extension Points

### 5.1 Custom Tool Schemas

**How to Add:**
1. Create or obtain MCP-compatible schema JSON
2. Set `MCP_SCHEMA_PATH=/path/to/schema.json`
3. Run `npm run gen:bindings`
4. Implement tool handlers in `src/bindings.runtime.ts`

**Requirements:**
- Schema must be valid JSON
- Tools must have unique names
- Input schemas must be JSON Schema Draft 7
- Output types should be documented

---

### 5.2 Custom Runtime Implementations

**File:** `src/bindings.runtime.ts`

**Current:** Demo mode (echoes tool calls)

**How to Replace:**
1. Implement `callTool(tool: string, params: unknown): Promise<unknown>`
2. Connect to real MCP server via HTTP/WebSocket/stdio
3. Handle errors, retries, timeouts

**Contract:**
- Must be async function
- Must return JSON-serializable data
- Should throw descriptive errors on failure

---

### 5.3 Constitution Amendments

**File:** `agent.constitution.md`

**How to Modify:**
1. Edit constitution file (root or src/)
2. Test: `npm run run:task -- "test new rule"`
3. Validate: Model follows new rules
4. Commit: Version control the change

**Guidelines:**
- Keep rules clear and specific
- Add examples for complex rules
- Test impact on existing tasks
- Document why rule was added

---

### 5.4 VS Code Task Integration

**File:** `.vscode/tasks.json`

**Current Tasks:**
- Generate Bindings
- Run Task
- Smoke Test
- Schema Diff
- Env Check

**How to Add:**
```json
{
  "label": "My Custom Task",
  "type": "shell",
  "command": "npm run custom:script",
  "problemMatcher": []
}
```

---

## 6. Version Compatibility Matrix

### 6.1 Runtime Dependencies

| Component | Pinned Version | Minimum | Maximum | Rationale |
|-----------|----------------|---------|---------|-----------|
| **Node.js** | 20.17.0 | 20.0.0 | 20.x | ESM loader stability |
| **Deno** | 2.5.3 | 1.45.0 | 2.x | Sandbox flags compatible |
| **TypeScript** | 5.6.3 | 5.0.0 | 5.x | Strict mode features |
| **OpenAI API** | gpt-4o-mini | gpt-4o-mini | Any GPT-4+ | Function calling support |

### 6.2 Version Pinning Files

- `.nvmrc` - Node.js major version (20)
- `.tool-versions` - Exact Node/Deno versions (asdf/mise)
- `package.json` - NPM dependency versions (locked)
- `package-lock.json` - Transitive dependency lock

### 6.3 Breaking Change Policy

**Major Version (1.x → 2.x):**
- Constitution format changes
- Schema contract changes
- Output format changes
- Sandbox permission model changes

**Minor Version (1.1 → 1.2):**
- New optional features
- Additional tools in schema
- New environment variables
- Backward-compatible constitution amendments

**Patch Version (1.1.1 → 1.1.2):**
- Bug fixes
- Documentation updates
- Performance improvements
- Dependency security patches

---

## 7. Quality Standards

### 7.1 Code Quality

**TypeScript:**
- Strict mode enabled (`strict: true`)
- No `any` types without justification
- Explicit return types on public functions
- ESLint/Prettier configured (if added)

**Testing:**
- Smoke test must pass: `npm run smoke`
- Type checking: `tsc --noEmit`
- New features require test cases

**Documentation:**
- Public functions must have JSDoc comments
- Complex logic requires inline comments
- README updated for user-facing changes

---

### 7.2 Security Standards

**Secrets:**
- Never commit `.env` file
- Use `.env.example` for templates
- Document required vs optional secrets

**Dependencies:**
- Run `npm audit` before releases
- No high/critical vulnerabilities in production
- Pin major versions in `package.json`

**Sandbox:**
- Never add `--allow-all` flag
- Document any network permissions
- Test timeout enforcement

---

### 7.3 Documentation Standards

**SSOT Authority:**
- This document is the single source of truth
- Other docs must not contradict SSOT
- Link to SSOT for architectural rationale

**README (User-Facing):**
- Installation steps
- Quick start example
- Common use cases

**Constitution (Agent-Facing):**
- Hard rules (must follow)
- Quality guidelines (should follow)
- Examples (good vs bad)

---

## 8. Governance

### 8.1 Change Management

**Who Can Update This SSOT:**
- **Primary Owner:** @AxxessPhila
- **Contributors:** Via pull request with approval

**Update Process:**
1. Propose change in GitHub issue
2. Document rationale (ADR if architectural)
3. Update SSOT document
4. Update related docs (README, constitution, code)
5. Test changes
6. Review and merge

---

### 8.2 Conflict Resolution

**Priority Order (highest to lowest):**
1. **This SSOT** - Architectural authority
2. **agent.constitution.md** - Runtime agent rules
3. **Code implementation** - Working reference
4. **Other documentation** - User guides, tutorials

**If Contradiction Found:**
1. SSOT is correct by default
2. Update conflicting docs to match SSOT
3. If SSOT is wrong, follow change management process

---

### 8.3 Versioning This Document

**Version Format:** Semantic versioning (MAJOR.MINOR.PATCH)

**Document Changelog:**

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2025-10-06 | Initial SSOT creation | @AxxessPhila |

**Update Triggers:**
- New ADR → Minor version bump
- Breaking change → Major version bump
- Clarification/fix → Patch version bump

---

## Appendix A: Quick Reference

### Key Files and Their Authority

| File | Purpose | Authority Level |
|------|---------|-----------------|
| `SSOT_DESIGN_AUTHORITY.md` | Architectural truth | **PRIMARY** |
| `agent.constitution.md` | Runtime agent rules | High |
| `README.md` | User documentation | Medium |
| `package.json` | Dependency contract | High |
| `src/runModel.ts` | Execution logic | Implementation |

### Command Reference

```bash
# Generate bindings from schema
npm run gen:bindings

# Run a task with the model
npm run run:task -- "your task description"

# Run smoke test
npm run smoke

# Check environment
code --task "Env Check"  # VS Code command palette

# Diff schema changes
code --task "Schema Diff"  # VS Code command palette
```

### Environment Variables

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `OPENAI_API_KEY` | ✅ | - | OpenAI authentication |
| `MODEL` | ❌ | gpt-4o-mini | Model to use |
| `MCP_SCHEMA_PATH` | ❌ | src/schema.samples/tooling.schema.json | Tool schema |
| `ALLOW_NET` | ❌ | (none) | Comma-separated domains |
| `SANDBOX_TIMEOUT_MS` | ❌ | 20000 | Execution timeout |

---

## Appendix B: Decision Log

### Why This Document Exists

**Created:** 2025-10-06  
**Trigger:** User requested SSOT after bootstrap completion  
**Rationale:**  
- Framework has opinionated architecture requiring documentation
- Multiple personas (dev, agent, auditor) need different views
- Design rationale was scattered across README and code
- Version evolution requires central authority

**Success Criteria:**
- ✅ All architectural decisions documented with rationale
- ✅ Clear contracts for inputs, runtime, outputs
- ✅ Security model explicitly defined
- ✅ Extension patterns documented
- ✅ Governance process established

---

**End of SSOT Document**  
*For questions or proposed changes, open an issue in the repository.*
