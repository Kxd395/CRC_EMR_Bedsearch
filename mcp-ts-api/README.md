# MCP as TypeScript bindings in VS Code

Flow: generate types from your schema, show those types to the model, receive TS code that calls `bindings`, run once in a Deno sandbox, return one JSON line.

> **📋 Architecture & Design Authority:** See [SSOT_DESIGN_AUTHORITY.md](./SSOT_DESIGN_AUTHORITY.md) for complete architectural decisions, security model, and technical contracts.

## Quick start

### First check
```bash
npm install
npm run verify  # Runs: gen:bindings + smoke + typecheck
```

### Tool whitelist
This repo ships `src/bindings.manifest.json` with a minimal set of tools enabled (`search_docs`, `summarize`). Edit it as you add tools and re-run `npm run gen:bindings`.

### Manual steps
1) `cp .env.example .env` then set OPENAI_API_KEY and optional ALLOW_NET
2) `npm i`
3) `npm run gen:bindings`
4) `npm run run:task -- "Use search_docs with query 'codemode'. Summarize to 2 sentences."`
