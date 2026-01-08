# 📋 MCP TypeScript API - Quick Reference Card

**Project:** mcp-ts-api  
**Version:** 1.0.0  
**Updated:** 2025-10-06

---

## 🎯 Most Important Files

| Priority | File | What It Is |
|----------|------|------------|
| ⭐⭐⭐ | **SSOT_DESIGN_AUTHORITY.md** | PRIMARY AUTHORITY - Read first |
| ⭐⭐ | **DOCUMENT_INDEX.md** | Navigation hub - Find everything |
| ⭐ | **README.md** | Quick start guide |

> **Rule of Thumb:** When in doubt, check SSOT first. It's the single source of truth.

---

## ⚡ Essential Commands

```bash
# Setup (first time)
cp .env.example .env        # Add OPENAI_API_KEY
npm install                 # Install dependencies
brew install deno           # Install Deno (if needed)

# Generate bindings from schema
npm run gen:bindings

# Run a task
npm run run:task -- "search for X and summarize"

# Run smoke test (end-to-end validation)
npm run smoke

# Type checking
npx tsc --noEmit
```

---

## 🔧 VS Code Tasks (Cmd+Shift+P → Tasks: Run Task)

- **Generate Bindings** - Regenerate TypeScript from schema
- **Run Task** - Execute a model task
- **Smoke Test** - End-to-end validation
- **Schema Diff** - Compare schema changes
- **Env Check** - Validate environment setup

---

## 📚 Documentation Hierarchy

```
SSOT_DESIGN_AUTHORITY.md  ⭐ PRIMARY (architectural authority)
    ↓
agent.constitution.md      (runtime rules for agents)
    ↓
Code (src/*.ts)            (implementation)
    ↓
README.md, SETUP.md        (user guides)
```

**Conflict Resolution:** If docs conflict, SSOT wins. See SSOT Section 8.2.

---

## 🗂️ Project Structure

```
mcp-ts-api/
├── SSOT_DESIGN_AUTHORITY.md    ⭐ Read this first
├── DOCUMENT_INDEX.md            Find what you need
├── README.md                    Quick start
├── agent.constitution.md        Agent behavior rules
├── src/
│   ├── runModel.ts             Orchestrates model calls
│   ├── generateBindings.ts     Schema → TypeScript
│   ├── bindings.runtime.ts     Tool call router
│   ├── bindings.ts             Generated code
│   ├── bindings.d.ts           Generated types
│   ├── bindings.manifest.json  Optional tool whitelist
│   └── schema.samples/         Example schemas
├── .env.example                Environment template
└── package.json                Dependencies & scripts
```

---

## 🔐 Security Quick Reference

**Sandbox (Default: --deny-all):**
- ✅ Compute only
- ❌ No filesystem access
- ❌ No network (unless ALLOW_NET set)
- ❌ No environment variables
- ⏱️ 20s timeout (configurable)

**Enable Network Access:**
```bash
# In .env file:
ALLOW_NET=api.example.com,other.domain.com
```

**Token Usage Tracking:**
```bash
# Logged to stderr automatically:
[USAGE] prompt=500 completion=200 total=700
```

---

## 🎨 Extension Patterns

### Add Custom Tools
1. Edit schema: `src/schema.samples/your-schema.json`
2. Set path: `MCP_SCHEMA_PATH=src/schema.samples/your-schema.json` in `.env`
3. Regenerate: `npm run gen:bindings`
4. Implement: Edit `src/bindings.runtime.ts`

### Filter Tools (Whitelist)
1. Create manifest:
   ```json
   {
     "tools": ["search_docs", "summarize"]
   }
   ```
2. Save as: `src/bindings.manifest.json`
3. Regenerate: `npm run gen:bindings`

### Change Agent Rules
1. Edit: `agent.constitution.md`
2. Test: `npm run run:task -- "test new rule"`
3. Commit: Changes take effect immediately

---

## 🐛 Troubleshooting

| Problem | Quick Fix |
|---------|-----------|
| **"OPENAI_API_KEY not set"** | Add to `.env` file |
| **"deno: command not found"** | `brew install deno` |
| **"Timeout exceeded"** | Increase `SANDBOX_TIMEOUT_MS` in `.env` |
| **"Tool not found"** | Check `bindings.manifest.json` whitelist |
| **"Expected 1 JSON line, found N"** | Model violated output contract - check constitution |
| **Type errors after schema change** | Run `npm run gen:bindings` again |

---

## 📖 Where to Find Things

| What I Need | Document | Section |
|-------------|----------|---------|
| **Why we made this choice** | SSOT | ADRs (Section 1) |
| **Security model** | SSOT | Section 3 |
| **How to extend** | SSOT | Section 5 |
| **Compatible versions** | SSOT | Section 6 |
| **How agents work** | agent.constitution.md | Entire file |
| **Installation steps** | SETUP.md | Full guide |
| **Common tasks** | DOCUMENT_INDEX.md | Task index |
| **Contribution guide** | CONTRIBUTING.md | Full guide |
| **Security reporting** | SECURITY.md | Contact info |

---

## 🚀 Next Steps Checklist

**First Time Setup:**
- [ ] Set `OPENAI_API_KEY` in `.env`
- [ ] Run `npm install`
- [ ] Install Deno (`brew install deno`)
- [ ] Run `npm run gen:bindings`
- [ ] Run `npm run smoke` (validates everything works)

**Production Deployment:**
- [ ] Review SSOT security model (Section 3)
- [ ] Create tool whitelist (`bindings.manifest.json`)
- [ ] Set appropriate `SANDBOX_TIMEOUT_MS`
- [ ] Configure `ALLOW_NET` (if needed)
- [ ] Run `npm audit` (check dependencies)
- [ ] Follow PRODUCTION_READY.md checklist

**Git Setup:**
- [ ] `git init`
- [ ] `git add -A`
- [ ] `git commit -m "feat: initial setup"`
- [ ] Create GitHub repo (see GITHUB_SETUP.md)
- [ ] Push to remote

---

## 💡 Pro Tips

1. **Always check SSOT first** - It's the authoritative source
2. **Use VS Code tasks** - Faster than typing commands (Cmd+Shift+P)
3. **Whitelist tools** - Reduces model confusion, improves reliability
4. **Monitor token usage** - Check stderr logs for `[USAGE]` metrics
5. **Test in demo mode** - Works without real MCP server (`bindings.runtime.ts` echoes)
6. **Pin versions** - `.nvmrc` and `.tool-versions` ensure reproducibility

---

## 🆘 Get Help

| Type | Where |
|------|-------|
| **Documentation questions** | DOCUMENT_INDEX.md |
| **Technical issues** | SSOT_DESIGN_AUTHORITY.md |
| **Security concerns** | SECURITY.md |
| **Contributing** | CONTRIBUTING.md |
| **GitHub setup** | GITHUB_SETUP.md |

---

## 🔗 Key Links

- **SSOT (Primary Authority):** [SSOT_DESIGN_AUTHORITY.md](./SSOT_DESIGN_AUTHORITY.md)
- **Document Index:** [DOCUMENT_INDEX.md](./DOCUMENT_INDEX.md)
- **Quick Start:** [README.md](./README.md)
- **Agent Rules:** [agent.constitution.md](./agent.constitution.md)

---

**Print this card** or keep it open for quick reference!

*Last Updated: 2025-10-06*
