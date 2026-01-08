# Production Readiness Checklist

Complete checklist for making mcp-ts-api production-ready and repo-friendly.

> **📋 Primary Authority:** See [SSOT_DESIGN_AUTHORITY.md](./SSOT_DESIGN_AUTHORITY.md) for complete security model, version requirements, and production standards.

## ✅ Completed Setup

### GitHub Essentials

- [x] `.gitignore` - Comprehensive ignore rules
- [x] `LICENSE` - MIT License for open collaboration
- [x] `.github/workflows/ci.yml` - CI/CD pipeline
- [x] `.github/CODEOWNERS` - Code ownership rules
- [x] `.github/PULL_REQUEST_TEMPLATE.md` - PR template
- [x] `SECURITY.md` - Security policy and reporting
- [x] `CONTRIBUTING.md` - Contribution guidelines
- [x] `GITHUB_SETUP.md` - Repository setup instructions

### VS Code Integration

- [x] `.vscode/extensions.json` - Recommended extensions
- [x] `.vscode/settings.json` - Deno and editor settings
- [x] `.vscode/tasks.json` - Quick action tasks
- [x] `.vscode/launch.json` - Debug configuration

### Development Container

- [x] `.devcontainer/devcontainer.json` - Portable dev environment

### Agent Constitution

- [x] `agent.constitution.md` - Agent behavior rules
- [x] Constitution wired into `runModel.ts` system prompt

## 📋 Next Actions Required

### 1. Configure Environment

```bash
cd /Users/VScode_Projects/EMR/mcp-ts-api

# Copy environment template
cp .env.example .env

# Edit .env and set:
# - OPENAI_API_KEY (required)
# - MODEL (optional, default: gpt-4o-mini)
# - ALLOW_NET (optional, for network access)
# - SANDBOX_TIMEOUT_MS (optional, default: 20000)
```

> **Security:** See [SSOT Section 3.2](./SSOT_DESIGN_AUTHORITY.md#32-sandbox-boundaries) for security configuration details.

### 2. Initialize Git Repository

```bash
# Initialize git
git init

# Add all files
git add -A

# Initial commit
git commit -m "feat: bootstrap mcp-ts-api with codemode sandbox

- Add TypeScript bindings generator
- Add Deno sandbox execution
- Add agent constitution
- Add GitHub workflows and templates
- Add VS Code integration
- Add dev container support"
```

### 3. Create GitHub Repository

**Option A: Using GitHub CLI (Recommended)**

```bash
gh auth login
gh repo create AxxessPhila/mcp-ts-api \
  --private \
  --source . \
  --remote origin \
  --push \
  --description "TypeScript API wrapper for MCP servers with sandboxed execution"
```

**Option B: Using Git + Manual GitHub**

```bash
# Create repo on GitHub web UI first, then:
git remote add origin https://github.com/AxxessPhila/mcp-ts-api.git
git branch -M main
git push -u origin main
```

### 4. Configure GitHub Secrets

```bash
# Add OpenAI API key for CI
gh secret set OPENAI_API_KEY -b"your-api-key-here"

# Verify
gh secret list
```

### 5. Enable Branch Protection

**Via Web UI:** Settings → Branches → Add rule for `main`

**Via CLI:**

```bash
gh api repos/AxxessPhila/mcp-ts-api/branches/main/protection \
  -X PUT \
  -H "Accept: application/vnd.github+json" \
  -f required_status_checks='{"strict":true,"contexts":["build"]}' \
  -f required_pull_request_reviews='{"required_approving_review_count":1}'
```

### 6. Test the Complete Workflow

```bash
# Generate bindings
npm run gen:bindings

# Run smoke test locally
npm run smoke

# Create a test branch
git checkout -b test/initial-setup

# Make a small change
echo "# Test" >> TEST.md

# Commit and push
git add TEST.md
git commit -m "test: verify CI workflow"
git push -u origin test/initial-setup

# Create PR
gh pr create --title "Test CI workflow" --body "Testing initial setup"

# Watch CI run
gh run watch

# Clean up
gh pr close --delete-branch
git checkout main
```

## 🎯 Production Hardening

### Security

- [ ] Rotate API keys quarterly
- [ ] Enable Dependabot alerts
- [ ] Configure CODEOWNERS for sensitive files
- [ ] Enable signed commits (optional but recommended)
- [ ] Set up secret scanning

```bash
# Enable Dependabot
gh api repos/AxxessPhila/mcp-ts-api/vulnerability-alerts -X PUT
```

### Monitoring

- [ ] Set up GitHub notifications
- [ ] Configure Slack/Discord webhook for CI failures
- [ ] Monitor token usage and costs
- [ ] Track smoke test success rates

### Documentation

- [ ] Add examples to README
- [ ] Document all environment variables
- [ ] Create troubleshooting guide
- [ ] Add architecture diagrams

### Testing

- [ ] Expand smoke tests
- [ ] Add integration tests
- [ ] Create test task suite (10+ tasks)
- [ ] Measure baseline metrics

## 📊 Verification Checklist

Run these commands to verify everything works:

```bash
# 1. Dependencies
npm install
echo "✅ Dependencies installed"

# 2. Environment
test -f .env && echo "✅ .env exists" || echo "❌ Create .env"

# 3. Bindings generation
npm run gen:bindings
echo "✅ Bindings generated"

# 4. Type checking
npx tsc --noEmit
echo "✅ Type check passed"

# 5. Deno available
deno --version
echo "✅ Deno installed"

# 6. Smoke test
npm run smoke
echo "✅ Smoke test passed"

# 7. Git setup
git status
echo "✅ Git initialized"

# 8. VS Code tasks available
test -f .vscode/tasks.json && echo "✅ VS Code tasks configured"

# 9. Constitution available
test -f agent.constitution.md && echo "✅ Constitution exists"

# 10. CI workflow
test -f .github/workflows/ci.yml && echo "✅ CI workflow configured"
```

## 🚀 Development Workflow

### Daily Development

```bash
# Start working on a feature
git checkout main
git pull origin main
git checkout -b feature/my-feature

# Make changes
npm run gen:bindings  # if schema changed
npm run smoke         # validate

# Commit with conventional commits
git add -A
git commit -m "feat: add new capability"

# Push and create PR
git push -u origin feature/my-feature
gh pr create --fill

# After approval and CI pass
gh pr merge --squash --delete-branch
```

### Updating Schemas

```bash
# Edit schema
vim src/schema.samples/tooling.schema.json

# Regenerate bindings
npm run gen:bindings

# Test
npm run smoke

# Commit both schema and generated files
git add src/schema.samples/tooling.schema.json
git add src/bindings.ts src/bindings.d.ts
git commit -m "feat: add new tool to schema"
```

### Updating Constitution

```bash
# Edit constitution
vim agent.constitution.md

# Test with a task
npm run run:task -- "Test task"

# Commit
git add agent.constitution.md
git commit -m "docs: update agent constitution rules"
```

## 📈 Metrics to Track

### Performance Metrics

- Token consumption per task
- Execution time (generation + sandbox)
- Success rate (first-pass completion)
- Number of tool calls per task

### Quality Metrics

- Code coverage (if tests added)
- Type safety violations
- Sandbox escape attempts
- Error rates

### Operational Metrics

- CI success rate
- PR merge time
- Dependency vulnerabilities
- API quota usage

## 🔄 Maintenance Schedule

### Weekly

- Review open PRs
- Check CI failures
- Monitor API usage

### Monthly

- Update dependencies
- Review security advisories
- Rotate credentials
- Analyze metrics

### Quarterly

- Major dependency updates
- Architecture review
- Performance optimization
- Documentation refresh

## 📚 Reference

### Key Files

| File | Purpose | Owner |
|------|---------|-------|
| `agent.constitution.md` | Agent behavior rules | Team |
| `src/bindings.runtime.ts` | MCP transport layer | Backend |
| `src/runModel.ts` | Model orchestrator | AI Team |
| `src/schema.samples/` | Tool definitions | Product |
| `.github/workflows/ci.yml` | CI/CD pipeline | DevOps |

### Commands Quick Reference

```bash
npm run gen:bindings    # Generate bindings
npm run run:task        # Run a task
npm run smoke          # Smoke test
npx tsc --noEmit       # Type check
gh pr create           # Create PR
gh run watch           # Watch CI
```

## ✨ What Makes This Production-Ready

### 1. Security First

- Deno sandbox with `--deny-all` default
- Secrets in environment variables
- Branch protection and code review
- Security policy and reporting process

### 2. Developer Experience

- VS Code integration with tasks
- Dev container for consistency
- Clear contribution guidelines
- Comprehensive documentation

### 3. Quality Assurance

- CI/CD on every PR
- Type checking enforced
- Smoke tests required
- Code ownership defined

### 4. Maintainability

- Agent constitution keeps behavior consistent
- Generated bindings reduce manual errors
- Clear file structure
- Conventional commits

### 5. Collaboration

- PR templates guide contributions
- CODEOWNERS auto-assign reviewers
- Branch protection prevents accidents
- GitHub integration streamlines workflow

## 🎉 Success Criteria

You're production-ready when:

- [ ] Git repository created and pushed
- [ ] CI passing on main branch
- [ ] Team members added as collaborators
- [ ] Secrets configured in GitHub
- [ ] Branch protection enabled
- [ ] First PR merged successfully
- [ ] Smoke tests passing in CI
- [ ] Documentation complete
- [ ] Constitution tested with real tasks
- [ ] Metrics collection started

## 🆘 Getting Help

- Review `CONTRIBUTING.md` for guidelines
- Check `GITHUB_SETUP.md` for Git/GitHub help
- See `README.md` for architecture overview
- Read `SECURITY.md` for security concerns
- Open a GitHub Discussion for questions

---

**Ready to ship!** Follow the "Next Actions Required" section to complete the setup.
