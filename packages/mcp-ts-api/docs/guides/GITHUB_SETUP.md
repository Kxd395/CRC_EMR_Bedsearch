# GitHub Setup Instructions

Complete guide for setting up the GitHub repository and collaboration workflow.

## Prerequisites

- Git installed
- GitHub CLI (`gh`) installed: `brew install gh`
- GitHub account with access to AxxessPhila organization

## Initial Setup

### 1. Authenticate with GitHub

```bash
gh auth login
```

Follow the prompts to authenticate.

### 2. Initialize Git Repository

```bash
cd /Users/VScode_Projects/EMR/mcp-ts-api

# Initialize git
git init

# Add all files
git add -A

# Initial commit
git commit -m "feat: bootstrap mcp-ts-api with codemode sandbox"
```

### 3. Create GitHub Repository

```bash
# Create private repo in AxxessPhila organization
gh repo create AxxessPhila/mcp-ts-api \
  --private \
  --source . \
  --remote origin \
  --push

# Or create in your personal account if AxxessPhila org isn't available:
# gh repo create mcp-ts-api --private --source . --remote origin --push
```

## Branch Protection Rules

Set up branch protection for `main`:

### Via GitHub Web UI

1. Go to repository Settings → Branches
2. Add rule for `main` branch:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (1 minimum)
   - ✅ Dismiss stale pull request approvals
   - ✅ Require status checks to pass before merging
     - Add: `build` (from CI workflow)
   - ✅ Require branches to be up to date before merging
   - ✅ Require conversation resolution before merging
   - ⚠️  Optional: Require signed commits (recommended for production)

### Via GitHub CLI

```bash
# Enable branch protection
gh api repos/AxxessPhila/mcp-ts-api/branches/main/protection \
  -X PUT \
  -H "Accept: application/vnd.github+json" \
  -f required_status_checks='{"strict":true,"contexts":["build"]}' \
  -f required_pull_request_reviews='{"required_approving_review_count":1}' \
  -f enforce_admins=true
```

## GitHub Secrets Setup

Add required secrets for CI/CD:

### Via GitHub Web UI

1. Go to Settings → Secrets and variables → Actions
2. Add new repository secret:
   - Name: `OPENAI_API_KEY`
   - Value: Your OpenAI API key

### Via GitHub CLI

```bash
# Add OPENAI_API_KEY secret
gh secret set OPENAI_API_KEY -b"your-api-key-here"

# Verify
gh secret list
```

## Development Workflow

### Creating a Feature Branch

```bash
# Ensure main is up to date
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/add-new-tool

# Make changes, test
npm run gen:bindings
npm run smoke

# Commit
git add -A
git commit -m "feat: add new search tool"

# Push and create PR
git push -u origin feature/add-new-tool
gh pr create --fill
```

### Reviewing Pull Requests

```bash
# List open PRs
gh pr list

# Checkout PR locally
gh pr checkout 123

# Review changes
npm install
npm run gen:bindings
npm run smoke

# Add review
gh pr review --approve
# or
gh pr review --request-changes -b "Please fix X"
```

### Merging Pull Requests

```bash
# Merge PR (requires approval and passing CI)
gh pr merge 123 --squash --delete-branch
```

## Repository Settings

### General

- Default branch: `main`
- Allow squash merging: ✅
- Allow merge commits: ❌
- Allow rebase merging: ❌
- Automatically delete head branches: ✅

### Collaborators

Add team members:

```bash
# Add collaborator
gh api repos/AxxessPhila/mcp-ts-api/collaborators/username -X PUT

# Or via web UI: Settings → Collaborators
```

### Topics

Add repository topics for discoverability:

```bash
gh repo edit --add-topic typescript,mcp,ai,sandbox,deno
```

## CI/CD Workflow

The `.github/workflows/ci.yml` runs on:
- Push to `main` or `develop`
- Pull requests to `main` or `develop`

**Steps:**
1. Checkout code
2. Setup Node.js 20
3. Setup Deno
4. Install dependencies
5. Generate bindings
6. Run smoke test
7. Type check

## Monitoring

### Check Workflow Status

```bash
# List recent workflow runs
gh run list

# View specific run
gh run view <run-id>

# Watch run in real-time
gh run watch
```

### View Logs

```bash
# Download logs for failed run
gh run view <run-id> --log-failed
```

## Troubleshooting

### Secret Not Working

```bash
# Re-set secret
gh secret set OPENAI_API_KEY -b"new-key"

# Verify in workflow
gh run view --log
```

### CI Failing on Smoke Test

Check that:
1. `OPENAI_API_KEY` secret is set
2. `.env.example` is committed
3. Bindings are generated before smoke test
4. Deno is properly installed in CI

### Branch Protection Blocking Merge

Ensure:
1. All required checks pass
2. PR has required approvals
3. Conversations are resolved
4. Branch is up to date with base

## Maintenance

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Test
npm run gen:bindings
npm run smoke

# Commit
git add package.json package-lock.json
git commit -m "chore: update dependencies"
```

### Security Audits

```bash
# Run audit
npm audit

# Fix vulnerabilities
npm audit fix

# Create PR
git checkout -b fix/security-updates
git add package*.json
git commit -m "fix: security updates"
git push -u origin fix/security-updates
gh pr create --fill
```

## Release Process

### Creating a Release

```bash
# Update version
npm version patch  # or minor, major

# Push tags
git push --follow-tags

# Create GitHub release
gh release create v1.0.0 --generate-notes
```

### Release Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] Tag created
- [ ] Release notes written

## Resources

- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)

## Next Steps

After setup:

1. ✅ Repository created
2. ✅ Branch protection enabled
3. ✅ Secrets configured
4. ✅ CI/CD running
5. → Add team members
6. → Create first feature PR
7. → Set up project board (optional)
8. → Configure notifications
