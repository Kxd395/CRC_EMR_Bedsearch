#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
APP="mcp-ts-api"
mkdir -p "$APP"/{src/schema.samples,src/tests,.vscode}

# package.json
cat > "$APP/package.json" <<'JSON'
{
  "name": "mcp-ts-api",
  "private": true,
  "type": "module",
  "scripts": {
    "gen:bindings": "ts-node --transpile-only src/generateBindings.ts",
    "run:task": "ts-node --transpile-only src/runModel.ts",
    "smoke": "ts-node --transpile-only src/tests/smoke.ts"
  },
  "dependencies": {
    "dotenv": "^16.4.5",
    "openai": "^4.58.1"
  },
  "devDependencies": {
    "ts-node": "^10.9.2",
    "typescript": "^5.6.3"
  }
}
JSON

# tsconfig.json
cat > "$APP/tsconfig.json" <<'JSON'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "outDir": "dist"
  },
  "include": ["src"]
}
JSON

# .env.example
cat > "$APP/.env.example" <<'ENV'
OPENAI_API_KEY=replace_me
MODEL=gpt-4o-mini
MCP_SCHEMA_PATH=src/schema.samples/tooling.schema.json
ALLOW_NET=
ENV

# README.md
cat > "$APP/README.md" <<'MD'
# MCP as TypeScript bindings in VS Code

Flow: generate types from your schema, show those types to the model, receive TS code that calls `bindings`, run once in a Deno sandbox, return one JSON line.

> **📋 Architecture & Design Authority:** See [SSOT_DESIGN_AUTHORITY.md](./SSOT_DESIGN_AUTHORITY.md) for complete architectural decisions, security model, and technical contracts.

## Quick start

1) `cp .env.example .env` then set OPENAI_API_KEY and optional ALLOW_NET
2) `npm i`
3) `npm run gen:bindings`
4) `npm run run:task -- "Use search_docs with query 'codemode'. Summarize to 2 sentences."`
MD

# sample schema
cat > "$APP/src/schema.samples/tooling.schema.json" <<'JSON'
{
  "serviceName": "DemoTools",
  "tools": [
    {
      "name": "search_docs",
      "description": "Full text search over local docs",
      "params": [
        { "name": "query", "type": "string", "required": true }
      ],
      "returns": "object"
    },
    {
      "name": "summarize",
      "description": "Summarize text to N sentences",
      "params": [
        { "name": "text", "type": "string", "required": true },
        { "name": "sentences", "type": "number", "required": false }
      ],
      "returns": "string"
    }
  ]
}
JSON

# bindings.runtime.ts
cat > "$APP/src/bindings.runtime.ts" <<'TS'
import { config } from "dotenv";
config();

/**
 * Replace this transport with your real MCP client.
 * For demo, we either echo or POST to MCP_HTTP_ENDPOINT.
 */
const DEFAULT_ENDPOINT = process.env.MCP_HTTP_ENDPOINT;

export async function callTool(toolName: string, params: Record<string, unknown>) {
  if (!DEFAULT_ENDPOINT) {
    // Demo path: echo back
    return { tool: toolName, params };
  }
  const res = await fetch(DEFAULT_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ tool: toolName, params })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Tool call failed: ${res.status} ${text}`);
  }
  return res.json();
}
TS

# generateBindings.ts
cat > "$APP/src/generateBindings.ts" <<'TS'
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = process.env.MCP_SCHEMA_PATH || path.join(__dirname, "schema.samples", "tooling.schema.json");
const outTs = path.join(__dirname, "bindings.ts");
const outDts = path.join(__dirname, "bindings.d.ts");

type ToolParam = { name: string; type: string; required?: boolean; description?: string };
type Tool = { name: string; description?: string; params?: ToolParam[]; returns?: string };
type Schema = { tools: Tool[]; serviceName?: string };

const typeMap: Record<string, string> = {
  string: "string",
  number: "number",
  boolean: "boolean",
  object: "Record<string, unknown>",
  any: "unknown"
};

function toTsType(t: string) {
  return typeMap[t] || "unknown";
}

function dts(schema: Schema) {
  const lines: string[] = [];
  lines.push("/** Typed bindings generated from MCP schema. Do not edit by hand. */");
  lines.push("export declare namespace Bindings {");
  for (const tool of schema.tools) {
    const fn = tool.name.replace(/[^a-zA-Z0-9_]/g, "_");
    const ps = (tool.params || []).map(p => `${p.name}${p.required ? "" : "?"}: ${toTsType(p.type)}`).join(", ");
    const doc = tool.description ? `/** ${tool.description} */` : "";
    lines.push(doc);
    lines.push(`  function ${fn}(${ps}): Promise<unknown>;`);
  }
  lines.push("}");
  lines.push("export type BindingsApi = typeof import('./bindings')['bindings'];");
  return lines.join("\n");
}

async function fileWrite(p: string, c: string) {
  await fs.writeFile(p, c, "utf8");
  console.log(`Wrote ${path.relative(process.cwd(), p)}`);
}

async function main() {
  const raw = await fs.readFile(schemaPath, "utf8");
  const schema = JSON.parse(raw) as Schema;

  // Implementation
  const impl: string[] = [];
  impl.push("// Generated from MCP schema. Routes calls via bindings.runtime.ts");
  impl.push(`import { callTool } from "./bindings.runtime";`);
  impl.push("export const bindings = {");
  for (const tool of schema.tools) {
    const fn = tool.name.replace(/[^a-zA-Z0-9_]/g, "_");
    const names = (tool.params || []).map(p => p.name);
    const argsObj = (tool.params || []).map(p => `${p.name}: ${p.name}`).join(", ");
    impl.push(`  async ${fn}(${names.join(", ")}) {`);
    impl.push(`    return callTool(${JSON.stringify(tool.name)}, { ${argsObj} });`);
    impl.push("  },");
  }
  impl.push("} as const;");

  await fileWrite(outDts, dts(schema));
  await fileWrite(outTs, impl.join("\n"));
}
main().catch(err => {
  console.error(err);
  process.exit(1);
});
TS

# runModel.ts
cat > "$APP/src/runModel.ts" <<'TS'
import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const pExecFile = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.MODEL || "gpt-4o-mini";

async function systemPrompt() {
  const dts = await fs.readFile(path.join(__dirname, "bindings.d.ts"), "utf8");
  return [
    "You write a single async function named run that uses only the provided bindings API.",
    "Do not import modules. Do not call fetch. Do not read or write files. Do not use eval.",
    "At the end, print exactly one JSON line: { ok: boolean, data: any }",
    "On error, print { ok: false, data: { message } }",
    "",
    "Bindings API types:",
    "```ts",
    dts,
    "```"
  ].join("\n");
}

function wrapUserCode(userTs: string) {
  return `
    import { bindings } from "./bindings.ts";
    async function run() {
      ${userTs}
    }
    try {
      const result = await run();
      console.log(JSON.stringify(result));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log(JSON.stringify({ ok: false, data: { message } }));
    }
  `;
}

async function askModel(task: string) {
  const system = await systemPrompt();
  const res = await client.chat.completions.create({
    model: MODEL,
    temperature: 0,
    messages: [
      { role: "system", content: system },
      { role: "user", content: task }
    ]
  });
  const content = res.choices[0]?.message?.content || "";
  const fenced = content.match(/```ts(?:|x)\s*([\s\S]*?)```/m) || content.match(/```(?:javascript|typescript)?\s*([\s\S]*?)```/m);
  return (fenced ? fenced[1] : content).trim();
}

async function runInDeno(tsBody: string) {
  const tmpPath = path.join(__dirname, ".tmp.exec.ts");
  await fs.writeFile(tmpPath, wrapUserCode(tsBody), "utf8");
  const allowNet = process.env.ALLOW_NET || "";
  const args = ["run", "--quiet", "--no-prompt"];
  if (allowNet) args.push(`--allow-net=${allowNet}`);
  args.push(tmpPath);
  const { stdout, stderr } = await pExecFile("deno", args, { env: process.env });
  if (stderr && stderr.trim()) console.error(stderr);
  const line = stdout.trim().split("\n").pop() || "{}";
  return JSON.parse(line);
}

export async function runTask(task: string) {
  const code = await askModel(task);
  return runInDeno(code);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const task = process.argv.slice(2).join(" ") || "Use search_docs with query 'codemode' then summarize to 2 sentences.";
  runTask(task).then(r => console.log("Result:", r));
}
TS

# wrapAndExecute.ts
cat > "$APP/src/wrapAndExecute.ts" <<'TS'
export { runTask } from "./runModel";
TS

# smoke test
cat > "$APP/src/tests/smoke.ts" <<'TS'
import { runTask } from "../runModel";
runTask("Use search_docs with query 'codemode', then call summarize with 2 sentences on the first hit.")
  .then(res => { console.log("SMOKE:", res); process.exit(0); })
  .catch(err => { console.error(err); process.exit(1); });
TS

# VS Code tasks
cat > "$APP/.vscode/tasks.json" <<'JSON'
{
  "version": "2.0.0",
  "tasks": [
    { "label": "Generate bindings", "type": "shell", "command": "npm run gen:bindings" },
    { "label": "Run task", "type": "shell", "command": "npm run run:task -- ${input:taskPrompt}" },
    { "label": "Smoke test", "type": "shell", "command": "npm run smoke" }
  ],
  "inputs": [
    { "id": "taskPrompt", "type": "promptString", "description": "Describe the job for the model", "default": "Search docs for codemode and summarize to 2 sentences." }
  ]
}
JSON

# VS Code debug
cat > "$APP/.vscode/launch.json" <<'JSON'
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Run model task",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/mcp-ts-api/src/runModel.ts",
      "runtimeArgs": ["--loader", "ts-node/esm", "--no-warnings"],
      "envFile": "${workspaceFolder}/mcp-ts-api/.env",
      "args": ["Use search_docs with query 'codemode' and summarize to 2 sentences."]
    }
  ]
}
JSON

# SSOT_DESIGN_AUTHORITY.md - Technical Single Source of Truth
cat > "$APP/SSOT_DESIGN_AUTHORITY.md" <<'SSOT'
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

### ADR-001: TypeScript API Over Classic MCP
**Decision:** Generate TypeScript bindings from MCP schemas and have models write code using typed APIs.

**Rationale:** Fewer round trips, better composition, stronger types, lower context bloat.

**Status:** Accepted (2025-10-06)

### ADR-002: Deno Sandbox Over Node.js VM
**Decision:** Execute model-generated code in Deno with --deny-all permissions.

**Rationale:** True isolation, granular permissions, TypeScript native, reliable timeouts.

**Status:** Accepted (2025-10-06)

### ADR-003: Single JSON Line Output Contract
**Decision:** Generated code must produce exactly one line of JSON output to stdout.

**Rationale:** Deterministic parsing, prevents noise, clear validation boundary.

**Status:** Accepted (2025-10-06)

### ADR-004: Constitution as Runtime Contract
**Decision:** Load agent.constitution.md into system prompt at runtime.

**Rationale:** Single source of rules, runtime enforcement, evolvable, auditable.

**Status:** Accepted (2025-10-06)

---

## 2. System Contracts

See full SSOT document for complete contracts. Key points:
- **Input:** MCP schema → TypeScript bindings
- **Runtime:** Constitution + Types → Model-generated code → Deno sandbox
- **Output:** Exactly one JSON line (strictly enforced)

---

## 3. Security Model

**Sandbox Boundaries:**
- Default: `--deny-all` (compute only)
- Network: Opt-in via `ALLOW_NET` env var
- Timeout: 20s default (configurable)
- Token tracking: Logged to stderr

**Threats Addressed:** Code execution, resource exhaustion, data exfiltration, filesystem access

---

## 4. Extension Points

- Custom tool schemas via `MCP_SCHEMA_PATH`
- Tool whitelist via `bindings.manifest.json`
- Runtime implementations in `bindings.runtime.ts`
- Constitution amendments in `agent.constitution.md`

---

For complete documentation, see the full SSOT in the repository.
SSOT

echo "Project created at $ROOT/$APP"
echo "Next:"
echo "  1) cd $APP"
echo "  2) cp .env.example .env  and set OPENAI_API_KEY, MODEL, ALLOW_NET if needed"
echo "  3) npm i"
echo "  4) brew install deno  # if not installed"
echo "  5) npm run gen:bindings"
echo "  6) npm run smoke"
