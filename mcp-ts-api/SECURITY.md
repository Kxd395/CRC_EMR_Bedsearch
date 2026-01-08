# Security Policy

## Reporting a Vulnerability

**DO NOT** open a public issue for security vulnerabilities.

Please report security vulnerabilities to: **security@axxessphila.org**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will respond within 48 hours.

## Security Best Practices

### Secrets Management

- **NEVER** commit API keys, tokens, or credentials
- Use `.env` for local development (git-ignored)
- Use GitHub Actions secrets for CI/CD
- Rotate keys if accidentally committed

### Sandbox Security

- Deno runs with `--deny-all` by default
- Network access only via `ALLOW_NET` whitelist
- No filesystem access in generated code
- No environment variable access in sandbox

### Dependencies

- Run `npm audit` before releases
- Keep dependencies up to date
- Review security advisories regularly
- Pin versions in production

### Code Review

- All changes require PR review
- Security-sensitive changes need two approvals
- Run smoke tests before merging
- Check for hardcoded secrets

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

## Known Security Considerations

1. **Model-generated code** - All code executes in Deno sandbox with minimal permissions
2. **MCP endpoints** - Validate and sanitize all external data sources
3. **API keys** - Store in environment variables, never in code
4. **Network access** - Explicitly whitelist allowed domains via `ALLOW_NET`
