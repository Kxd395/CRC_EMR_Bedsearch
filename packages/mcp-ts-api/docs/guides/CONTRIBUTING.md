# Contributing to mcp-ts-api

Thank you for contributing! This guide will help you get started.

> **📋 Architecture Reference:** See [SSOT_DESIGN_AUTHORITY.md](./SSOT_DESIGN_AUTHORITY.md) for architectural decisions and design principles.
> **📚 Documentation Index:** See [DOCUMENT_INDEX.md](./DOCUMENT_INDEX.md) for complete documentation navigation.

## Getting Started

### Prerequisites

- Node.js 20+
- Deno 1.x+
- Git
- GitHub CLI (optional)

### Setup

```bash
# Clone the repo
git clone https://github.com/AxxessPhila/mcp-ts-api.git
cd mcp-ts-api

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and set OPENAI_API_KEY

# Generate bindings
npm run gen:bindings

# Run smoke test
npm run smoke
```

## Good First Tasks

New contributors? Start here! These tasks teach you the workflow:

### Task 1: Add a Tool to the Schema

1. Edit `src/schema.samples/tooling.schema.json`
2. Add a new tool (e.g., `translate` with text + language params)
3. Run `npm run gen:bindings` to regenerate TypeScript
4. Run `npm run smoke` to verify it works
5. Commit schema + generated files

**Commands:**
```bash
# Edit schema
vim src/schema.samples/tooling.schema.json

# Regenerate and test
npm run verify

# Commit
git add src/
git commit -m "feat: add translate tool to schema"
```

### Task 2: Improve Agent Constitution

1. Read `agent.constitution.md`
2. Add a clarifying example to an existing rule
3. Test with `npm run run:task -- "test edge case"`
4. Commit constitution file

**Commands:**
```bash
# Edit constitution
vim agent.constitution.md

# Test your changes
npm run run:task -- "search for test and summarize to 1 sentence"

# Commit
git commit -m "docs: clarify constitution rule with example"
```

> 💡 **Tip:** Both tasks use `npm run verify` which is the standard validation command.

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Changes

- Keep commits atomic and focused
- Write clear commit messages
- Update documentation as needed
- Add tests for new features

### 3. Commit Conventions

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add new search tool to schema
fix: correct type signature for summarize
docs: update README with examples
chore: update dependencies
refactor: simplify bindings generator
test: add smoke test for new tools
```

### 4. Test Your Changes

```bash
# Generate bindings if you changed schema
npm run gen:bindings

# Run smoke test (requires OPENAI_API_KEY in .env)
npm run smoke

# Type check
npx tsc --noEmit
```

### 5. Follow SSOT Guidelines

**Important:** All changes must align with [SSOT_DESIGN_AUTHORITY.md](./SSOT_DESIGN_AUTHORITY.md).

- **Architectural changes** require an ADR (Architecture Decision Record)
- **Security changes** must update Section 3 of SSOT
- **Breaking changes** require major version bump (see SSOT Section 6.3)
- **Documentation changes** must not contradict SSOT

See [SSOT Section 8: Governance](./SSOT_DESIGN_AUTHORITY.md#8-governance) for change management process.

### 6. Open a Pull Request

```bash
git push -u origin feature/your-feature-name
# Then open PR on GitHub
```

## Code Style

- TypeScript strict mode enabled
- Use ESM imports
- Async/await over promises
- Descriptive variable names
- JSDoc comments for public APIs

## Project Structure

```
src/
├── bindings.runtime.ts    # MCP transport layer (edit to connect real server)
├── generateBindings.ts    # Schema → TypeScript generator
├── runModel.ts           # Model orchestrator with Deno sandbox
├── wrapAndExecute.ts     # Public API exports
├── agent.constitution.md # Agent behavior rules
├── schema.samples/       # Example schemas
└── tests/               # Test files
```

## Adding New Tools

1. Update schema in `src/schema.samples/tooling.schema.json`
2. Run `npm run gen:bindings` to regenerate types
3. Update `bindings.runtime.ts` if needed for transport
4. Add test case to `src/tests/smoke.ts`
5. Document in README

## Modifying the Sandbox

Security changes to the Deno sandbox require:
- Two approvals
- Security review
- Documentation update
- Justification in PR

## Testing

### Smoke Tests

```bash
npm run smoke
```

### Manual Testing

```bash
npm run run:task -- "Your test task description"
```

### CI/CD

All PRs must pass:
- Dependency installation
- Bindings generation
- Smoke test
- TypeScript compilation

## Pull Request Guidelines

- Fill out the PR template completely
- Link related issues
- Update CHANGELOG.md if applicable
- Ensure CI passes
- Request review from code owners
- Respond to feedback promptly

## Code Review Process

1. Automated checks run (CI)
2. Code owner reviews changes
3. Address feedback
4. Approval required to merge
5. Squash and merge to main

## Release Process

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create release PR
4. Merge after approval
5. Tag release on main branch

## Questions?

- Open a discussion on GitHub
- Check existing issues
- Review documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
