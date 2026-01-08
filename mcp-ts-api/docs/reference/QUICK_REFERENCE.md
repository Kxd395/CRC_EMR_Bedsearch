# Quick Reference Card

Essential commands and locations for daily development with mcp-ts-api.

> **📋 Primary Docs:** [SSOT_DESIGN_AUTHORITY.md](./SSOT_DESIGN_AUTHORITY.md) | [DOCUMENT_INDEX.md](./DOCUMENT_INDEX.md) | [QUICK_REFERENCE_CARD.md](./QUICK_REFERENCE_CARD.md)

## 📍 Key File Locations

```
agent.constitution.md           # Agent behavior rules (edit to change agent behavior)
src/bindings.runtime.ts         # MCP transport (connect your real server here)
src/schema.samples/             # Tool schemas (define your tools here)
.env                           # Your secrets (OPENAI_API_KEY, etc.)
.github/workflows/ci.yml       # CI/CD pipeline
```

## 🚀 Essential Commands

### Development

```bash
npm run gen:bindings    # Generate TypeScript bindings from schema
npm run run:task        # Run a task with model-generated code
npm run smoke          # Quick validation test
npx tsc --noEmit       # Type check without compiling
```

### Git Workflow

```bash
# Start feature
git checkout -b feature/my-feature

# After changes
git add -A
git commit -m "feat: description"
git push -u origin feature/my-feature

# Create PR
gh pr create --fill

# Merge after approval
gh pr merge --squash --delete-branch
```

### GitHub CLI

```bash
gh pr list              # List open PRs
gh pr view 123          # View PR details
gh pr checkout 123      # Checkout PR locally
gh run list             # List workflow runs
gh run watch            # Watch current run
gh secret list          # List secrets
gh secret set NAME      # Set secret
```

## 🎯 VS Code Tasks

Press `Cmd+Shift+P` → "Tasks: Run Task":

- **Generate bindings** → `npm run gen:bindings`
- **Run task** → `npm run run:task`  
- **Smoke test** → `npm run smoke`

## 📝 Conventional Commits

```
feat: add new feature
fix: bug fix
docs: documentation
chore: maintenance
refactor: code restructure
test: add tests
```

## 🔧 Common Workflows

### Add a New Tool

1. Edit `src/schema.samples/tooling.schema.json`
2. Run `npm run gen:bindings`
3. Test with `npm run smoke`
4. Commit schema + generated files

### Update Agent Behavior

1. Edit `agent.constitution.md`
2. Test with `npm run run:task -- "test task"`
3. Commit constitution file

### Connect Real MCP Server

1. Edit `src/bindings.runtime.ts`
2. Replace `callTool()` implementation
3. Test with smoke test
4. Update `.env` if needed

## 🆘 Troubleshooting

### Deno Not Found

```bash
export PATH="$HOME/.deno/bin:$PATH"
# Or add to ~/.zshrc permanently
```

### CI Failing

```bash
gh run list              # Find run ID
gh run view <id> --log   # View logs
```

### Type Errors

```bash
npx tsc --noEmit        # Check all files
npm run gen:bindings    # Regenerate if schema changed
```

### Generated Files Out of Sync

```bash
npm run gen:bindings    # Regenerate
git add src/bindings.*
git commit -m "chore: regenerate bindings"
```

## 📚 Documentation Quick Links

| Doc | Purpose |
|-----|---------|
| `SSOT_DESIGN_AUTHORITY.md` | ⭐ PRIMARY authority - Architecture & contracts |
| `DOCUMENT_INDEX.md` | Navigation hub - Find everything |
| `QUICK_REFERENCE_CARD.md` | Printable quick reference |
| `README.md` | Quick start guide |
| `SETUP.md` | Setup instructions |
| `GITHUB_SETUP.md` | Git/GitHub workflow |
| `CONTRIBUTING.md` | How to contribute |
| `SECURITY.md` | Security policy |
| `PRODUCTION_READY.md` | Production checklist |
| `agent.constitution.md` | Agent runtime rules |

## 🔐 Security Reminders

- ✅ Use `.env` for secrets (git-ignored)
- ✅ Set `ALLOW_NET` only when needed (see SSOT Section 3.2)
- ✅ Configure `SANDBOX_TIMEOUT_MS` appropriately (default: 20s)
- ✅ Use GitHub secrets for CI
- ✅ Review tool schemas before loading (especially external ones)
- ❌ Never commit API keys
- ✅ Run `npm audit` regularly
- ✅ Monitor token usage logs (`[USAGE]` in stderr)

## 📊 Files That Change

### You Edit These

- `src/schema.samples/tooling.schema.json` - Define tools
- `agent.constitution.md` - Agent behavior
- `src/bindings.runtime.ts` - MCP transport
- `.env` - Your secrets

### Auto-Generated (Don't Edit)

- `src/bindings.ts` - Generated bindings
- `src/bindings.d.ts` - Generated types
- `package-lock.json` - Dependency lock

### Reviewed in PRs

- All of the above when changed
- Any documentation updates
- CI workflow changes

## 🎯 Common Issues

**Issue:** `Module not found: bindings.d.ts`
**Fix:** Run `npm run gen:bindings`

**Issue:** `Deno command not found`  
**Fix:** Add Deno to PATH (see above)

**Issue:** CI failing on smoke test
**Fix:** Check `OPENAI_API_KEY` secret is set

**Issue:** Type errors after schema change
**Fix:** Regenerate bindings

**Issue:** Constitution not loading
**Fix:** Check path is `../agent.constitution.md` from `src/`

## ⚡ Pro Tips

1. **Use VS Code tasks** instead of typing commands
2. **Watch CI runs** with `gh run watch`
3. **Test locally first** before pushing
4. **Keep PRs small** (one feature per PR)
5. **Use draft PRs** for work-in-progress
6. **Review diffs** before committing generated files

## 📞 Getting Help

1. Check this card first
2. Review relevant `.md` file
3. Search GitHub issues
4. Ask in GitHub Discussions
5. Review agent.constitution.md for behavior questions

---

**Pin this file!** Keep it open while developing for quick reference.
