# Documentation Index

**Last Updated:** 2025-10-06

This is your complete guide to all documentation in the mcp-ts-api project. Documents are organized by audience and purpose.

---

## ⚡ Start Here (3 Commands)

```bash
npm install           # Install dependencies
npm run verify        # Generate bindings + smoke test + typecheck
npm run run:task -- "your task"  # Run a task with the model
```

> First time? Set `OPENAI_API_KEY` in `.env` before running verify. See [README.md](./README.md) for details.

---

## 📋 Primary Authority (Read First)

| Document | Purpose | Audience | Authority Level |
|----------|---------|----------|-----------------|
| **[SSOT_DESIGN_AUTHORITY.md](./SSOT_DESIGN_AUTHORITY.md)** | Architectural decisions, security model, technical contracts | All | **PRIMARY** ⭐ |

> **⚠️ Important:** If any documentation conflicts with the SSOT, the SSOT is correct by default.

---

## 🚀 Getting Started (New Users)

**Recommended Reading Order:**

1. **[README.md](./README.md)** - Quick start and overview
2. **[SETUP.md](./SETUP.md)** - Detailed installation and configuration
3. **[BOOTSTRAP_RESULTS.md](./BOOTSTRAP_RESULTS.md)** - What was created and why
4. **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Common commands and patterns

**First Time Setup:**
```bash
# 1. Set environment variables
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# 2. Install dependencies
npm install

# 3. Install Deno (if not already installed)
brew install deno  # macOS
# or: curl -fsSL https://deno.land/install.sh | sh

# 4. Generate TypeScript bindings
npm run gen:bindings

# 5. Run smoke test
npm run smoke
```

---

## 🛠️ Development (Contributors)

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **[CONTRIBUTING.md](./CONTRIBUTING.md)** | Contribution guidelines | Before submitting PRs |
| **[agent.constitution.md](./agent.constitution.md)** | Agent behavior rules | Modifying agent constraints |
| **[PRODUCTION_READY.md](./PRODUCTION_READY.md)** | Production hardening checklist | Deploying to production |
| **[COMPLETE_SETUP_SUMMARY.md](./COMPLETE_SETUP_SUMMARY.md)** | Full setup documentation | Reference for all setup steps |

**Development Workflow:**
```bash
# Make changes to schema
vim src/schema.samples/tooling.schema.json

# Regenerate bindings
npm run gen:bindings

# Test your changes
npm run run:task -- "your test task"

# Check for errors
npm run typecheck  # (if configured)
```

---

## 🔒 Security & Governance

| Document | Purpose | Audience |
|----------|---------|----------|
| **[SECURITY.md](./SECURITY.md)** | Security policies, reporting vulnerabilities | Security auditors, DevOps |
| **[SSOT_DESIGN_AUTHORITY.md](./SSOT_DESIGN_AUTHORITY.md)** (Section 3) | Complete security model | Security auditors |
| **[SSOT_DESIGN_AUTHORITY.md](./SSOT_DESIGN_AUTHORITY.md)** (Section 8) | Governance and change management | Maintainers |

**Security Checklist:**
- ✅ Never commit `.env` file
- ✅ Review `ALLOW_NET` permissions before enabling
- ✅ Audit schemas before loading (especially external ones)
- ✅ Monitor token usage logs for cost control
- ✅ Keep dependencies updated (`npm audit`)

---

## 🐙 GitHub & Collaboration

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **[GITHUB_SETUP.md](./GITHUB_SETUP.md)** | GitHub repository setup guide | First-time repo initialization |
| **[.github/PULL_REQUEST_TEMPLATE.md](./.github/PULL_REQUEST_TEMPLATE.md)** | PR template | Submitting pull requests |
| **[.github/CODEOWNERS](./.github/CODEOWNERS)** | Code ownership | Understanding approval flow |

**Git Workflow:**
```bash
# Initialize repository (first time only)
git init
git add -A
git commit -m "feat: initial mcp-ts-api setup"

# Create GitHub repo and push
gh repo create your-org/mcp-ts-api --private --source . --push

# Or follow detailed instructions in GITHUB_SETUP.md
```

---

## 🤖 Agent Integration

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **[agent.constitution.md](./agent.constitution.md)** | Runtime rules loaded into system prompt | Modifying agent behavior |
| **[SSOT_DESIGN_AUTHORITY.md](./SSOT_DESIGN_AUTHORITY.md)** (ADR-004) | Why constitution exists, how it works | Understanding agent integration |

**How Agents Use This:**
1. `src/runModel.ts` loads `agent.constitution.md` at runtime
2. Constitution + bindings types = system prompt
3. Agent writes TypeScript code following constitution rules
4. Code executes in Deno sandbox
5. Output: exactly one JSON line (enforced)

---

## 📊 Architecture Reference

| Topic | Document Section | Description |
|-------|------------------|-------------|
| **Why TypeScript API?** | SSOT → ADR-001 | Rationale for this approach vs classic MCP |
| **Security Model** | SSOT → Section 3 | Sandbox, permissions, timeout, threats |
| **System Contracts** | SSOT → Section 2 | Input/runtime/output contracts |
| **Extension Points** | SSOT → Section 5 | How to customize and extend |
| **Version Matrix** | SSOT → Section 6 | Compatible versions, breaking changes |

---

## 🎯 Quick Tasks

| What I Want to Do | Document to Read | Command to Run |
|-------------------|------------------|----------------|
| **Run my first task** | README.md | `npm run run:task -- "your task"` |
| **Add a new tool** | SSOT → Section 5.1 | Edit schema, `npm run gen:bindings` |
| **Filter exposed tools** | SSOT → Section 4.2 | Create `bindings.manifest.json` |
| **Change agent rules** | agent.constitution.md | Edit constitution, test task |
| **Enable network access** | SETUP.md, SSOT → Section 3.2 | Set `ALLOW_NET=domain.com` in .env |
| **Deploy to production** | PRODUCTION_READY.md | Follow checklist |
| **Report security issue** | SECURITY.md | Email security contact |
| **Contribute code** | CONTRIBUTING.md | Fork, branch, PR |

---

## 🔧 VS Code Integration

| File | Purpose | How to Use |
|------|---------|------------|
| **[.vscode/tasks.json](./.vscode/tasks.json)** | Quick tasks | Cmd+Shift+P → "Tasks: Run Task" |
| **[.vscode/settings.json](./.vscode/settings.json)** | Workspace settings | Auto-applied when opening project |
| **[.vscode/extensions.json](./.vscode/extensions.json)** | Recommended extensions | Auto-prompted on first open |
| **[.vscode/launch.json](./.vscode/launch.json)** | Debug configurations | F5 to debug |

**Available Tasks (Cmd+Shift+P → Tasks: Run Task):**
- Generate Bindings
- Run Task
- Smoke Test
- Schema Diff
- Env Check

---

## 📦 File Structure

```
mcp-ts-api/
├── SSOT_DESIGN_AUTHORITY.md    ⭐ PRIMARY AUTHORITY
├── README.md                    User-facing overview
├── SETUP.md                     Installation guide
├── CONTRIBUTING.md              Contribution guidelines
├── SECURITY.md                  Security policies
├── agent.constitution.md        Agent runtime rules
├── src/
│   ├── runModel.ts             Model orchestrator
│   ├── generateBindings.ts     Schema → TypeScript
│   ├── bindings.runtime.ts     Tool call router (demo)
│   ├── bindings.ts             Generated implementations
│   ├── bindings.d.ts           Generated type definitions
│   ├── bindings.manifest.json  Optional tool whitelist
│   └── schema.samples/         Example schemas
├── .vscode/                    VS Code configuration
├── .github/                    GitHub templates & workflows
├── .env.example                Environment template
├── package.json                Dependencies & scripts
└── tsconfig.json               TypeScript configuration
```

---

## 🆘 Troubleshooting

| Problem | Solution Document | Quick Fix |
|---------|-------------------|-----------|
| **Bindings generation fails** | SETUP.md | Check schema syntax, run `npm run gen:bindings` |
| **Deno not found** | SETUP.md | `brew install deno` or install manually |
| **OpenAI API error** | README.md | Check `.env` has valid `OPENAI_API_KEY` |
| **Timeout errors** | SSOT → Section 3.2 | Increase `SANDBOX_TIMEOUT_MS` in .env |
| **Tool not found** | SSOT → Section 4.2 | Check `bindings.manifest.json` whitelist |
| **Type errors** | SSOT → Section 2 | Regenerate bindings after schema change |

---

## 📝 Changelog

| Date | Change | Document Updated |
|------|--------|------------------|
| 2025-10-06 | Initial SSOT creation | SSOT_DESIGN_AUTHORITY.md v1.0.0 |
| 2025-10-06 | Added SSOT reference to README | README.md |
| 2025-10-06 | Created document index | DOCUMENT_INDEX.md |

---

## 🔗 External References

- **MCP Specification:** https://spec.modelcontextprotocol.io/
- **Deno Documentation:** https://docs.deno.com/
- **TypeScript Handbook:** https://www.typescriptlang.org/docs/
- **OpenAI API Docs:** https://platform.openai.com/docs/

---

**Questions or Updates?**
- Open an issue for documentation improvements
- Follow governance process (SSOT Section 8) for SSOT changes
- See CONTRIBUTING.md for general contributions

**Last Review:** 2025-10-06  
**Next Review Due:** When major version changes or significant architectural updates occur
