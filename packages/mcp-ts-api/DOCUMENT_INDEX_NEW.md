# Documentation Index

**mcp-ts-api** — Model Context Protocol TypeScript API Generator  
**Last Updated:** 2025-01-06  
**Version:** 0.2.0

This index helps you find the right documentation for your needs.

---

## 📁 Documentation Structure

```
mcp-ts-api/
├── README.md                      # Quick start (entry point)
├── DOCUMENT_INDEX.md              # This file
├── SSOT_DESIGN_AUTHORITY.md       # PRIMARY AUTHORITY
├── agent.constitution.md          # Agent runtime rules
├── SECURITY.md                    # Security policy
│
└── docs/
    ├── ORGANIZATION.md            # Organization guide
    │
    ├── adrs/                      # Architecture Decision Records
    │   ├── ADR-001-typescript-over-mcp.md
    │   ├── ADR-002-deno-sandbox.md
    │   ├── ADR-003-single-json-line.md
    │   └── ADR-004-constitution-runtime-contract.md
    │
    ├── guides/                    # User guides
    │   ├── SETUP.md
    │   ├── CONTRIBUTING.md
    │   ├── GITHUB_SETUP.md
    │   └── PRODUCTION_READY.md
    │
    ├── reference/                 # Quick reference
    │   ├── QUICK_REFERENCE.md
    │   └── QUICK_REFERENCE_CARD.md
    │
    └── archive/                   # Historical documentation
        ├── BOOTSTRAP_RESULTS.md
        ├── COMPLETE_SETUP_SUMMARY.md
        ├── SSOT_CREATION_SUMMARY.md
        ├── DOCUMENTATION_AUDIT_REPORT.md
        ├── IMPROVEMENTS_IMPLEMENTED.md
        └── REVIEW_COMPLETE.md
```

See [**docs/ORGANIZATION.md**](docs/ORGANIZATION.md) for details on the documentation structure.

---

## ⚡ Start Here (3 Commands)

**Fastest path to success:**

```bash
npm install        # Install dependencies
npm run verify     # Validate environment (gen:bindings + smoke + typecheck)
npm run run:task   # Try a simple task
```

**What `verify` does:**
- ✅ Generates TypeScript bindings from your MCP schema
- ✅ Runs smoke test to validate setup
- ✅ Checks TypeScript compilation

**After `verify` passes, you're ready to use the tool!**

---

## 📋 Primary Authority

Start with the **Single Source of Truth (SSOT)** for all architectural decisions and authoritative information:

| Document | Purpose | When to Use |
|----------|---------|-------------|
| [**SSOT_DESIGN_AUTHORITY.md**](SSOT_DESIGN_AUTHORITY.md) | Primary source of truth for all architectural decisions, contracts, and governance | When you need the authoritative answer to "why" or "how" |
| [**agent.constitution.md**](agent.constitution.md) | Runtime rules for the AI agent | When developing or debugging the agent's behavior |

**Authority Hierarchy:** SSOT → Constitution → Code → Other Documentation

---

## 🚀 Getting Started

| Document | Purpose | Time to Complete |
|----------|---------|------------------|
| [**README.md**](README.md) | Quick start, installation, basic usage | 5 minutes |
| [**docs/guides/SETUP.md**](docs/guides/SETUP.md) | Detailed setup instructions | 15 minutes |

---

## 📚 Core Documentation

### For Users

| Document | Purpose |
|----------|---------|
| [**docs/reference/QUICK_REFERENCE.md**](docs/reference/QUICK_REFERENCE.md) | Command reference, common workflows |
| [**docs/reference/QUICK_REFERENCE_CARD.md**](docs/reference/QUICK_REFERENCE_CARD.md) | One-page cheat sheet (printable) |

### For Contributors

| Document | Purpose |
|----------|---------|
| [**docs/guides/CONTRIBUTING.md**](docs/guides/CONTRIBUTING.md) | How to contribute to this project |
| [**docs/guides/GITHUB_SETUP.md**](docs/guides/GITHUB_SETUP.md) | Setting up GitHub repo and workflows |

### For Deployers

| Document | Purpose |
|----------|---------|
| [**docs/guides/PRODUCTION_READY.md**](docs/guides/PRODUCTION_READY.md) | Production deployment guide |
| [**SECURITY.md**](SECURITY.md) | Security policy and vulnerability reporting |

---

## 🔍 Understanding the System

### Architecture Decision Records (ADRs)

These documents explain **why** the system works the way it does. Referenced by SSOT Section 1.

| Document | Decision |
|----------|----------|
| [**ADR-001: TypeScript over MCP**](docs/adrs/ADR-001-typescript-over-mcp.md) | Why we use TypeScript bindings instead of JSON-RPC |
| [**ADR-002: Deno Sandbox**](docs/adrs/ADR-002-deno-sandbox.md) | Why we use Deno for sandboxing instead of Node.js VM |
| [**ADR-003: Single JSON Line**](docs/adrs/ADR-003-single-json-line.md) | Why we output one JSON line per execution |
| [**ADR-004: Constitution Runtime Contract**](docs/adrs/ADR-004-constitution-runtime-contract.md) | How the constitution enforces behavior at runtime |

### System Contracts

See **SSOT Section 2** for:
- Input/Output contracts
- Error handling
- Execution lifecycle
- Resource limits

---

## 📖 Historical Documentation

### Session Logs & Meta-Documentation

These documents preserve the history and evolution of the project:

| Document | Purpose |
|----------|---------|
| [**docs/archive/BOOTSTRAP_RESULTS.md**](docs/archive/BOOTSTRAP_RESULTS.md) | Initial bootstrap session results |
| [**docs/archive/COMPLETE_SETUP_SUMMARY.md**](docs/archive/COMPLETE_SETUP_SUMMARY.md) | Complete setup walkthrough |
| [**docs/archive/SSOT_CREATION_SUMMARY.md**](docs/archive/SSOT_CREATION_SUMMARY.md) | How the SSOT was created |
| [**docs/archive/DOCUMENTATION_AUDIT_REPORT.md**](docs/archive/DOCUMENTATION_AUDIT_REPORT.md) | Comprehensive documentation audit |
| [**docs/archive/IMPROVEMENTS_IMPLEMENTED.md**](docs/archive/IMPROVEMENTS_IMPLEMENTED.md) | Expert review feedback implementation |
| [**docs/archive/REVIEW_COMPLETE.md**](docs/archive/REVIEW_COMPLETE.md) | Documentation review summary |

---

## 🎯 By Use Case

### "I want to..."

**...start using this tool**  
→ [README.md](README.md) → Quick Start

**...understand why it works this way**  
→ [SSOT_DESIGN_AUTHORITY.md](SSOT_DESIGN_AUTHORITY.md) → [ADRs](docs/adrs/)

**...set up my development environment**  
→ [docs/guides/SETUP.md](docs/guides/SETUP.md)

**...contribute code or documentation**  
→ [docs/guides/CONTRIBUTING.md](docs/guides/CONTRIBUTING.md)

**...deploy to production**  
→ [docs/guides/PRODUCTION_READY.md](docs/guides/PRODUCTION_READY.md)

**...find a quick command reference**  
→ [docs/reference/QUICK_REFERENCE_CARD.md](docs/reference/QUICK_REFERENCE_CARD.md)

**...report a security issue**  
→ [SECURITY.md](SECURITY.md)

**...understand the agent's behavior**  
→ [agent.constitution.md](agent.constitution.md)

---

## 🔐 Governance

See **SSOT Section 8** for:
- Change control process
- Version management
- Documentation updates
- Breaking change policy

**Key Rule:** Any architectural change requires an update to the SSOT and triggers the version guard in CI.

---

## 📊 Document Status

| Status | Meaning |
|--------|---------|
| ✅ **Authoritative** | SSOT, Constitution, ADRs |
| 📖 **Maintained** | Core docs (README, guides, etc.) |
| 📚 **Reference** | Session logs, audit reports (archive/) |

**Last Audit:** 2025-01-06  
**Next Review:** When major features are added

---

## 💡 Tips

1. **Always start with README** for quick start
2. **Check SSOT first** for authoritative answers
3. **Run `npm run verify`** before asking "why isn't it working?"
4. **Read ADRs** to understand architectural decisions
5. **Use QUICK_REFERENCE_CARD** for daily development
6. **Check docs/ORGANIZATION.md** to understand documentation structure

---

**Questions?** Check the SSOT first, then ask in issues or discussions.
