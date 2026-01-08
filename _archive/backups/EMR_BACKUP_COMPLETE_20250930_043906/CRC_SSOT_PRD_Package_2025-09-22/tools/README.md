# EMR Security & Compliance System

This directory contains comprehensive security tools and guidelines for the EMR CRC SSOT healthcare application to prevent hardcoded values and ensure HIPAA compliance.

## 🚨 Quick Start

### For New Developers

```bash
# 1. Run the security setup (one time)
./tools/setup-security.sh

# 2. Before each commit, run security check
npm run security:check

# 3. Follow the NO_HARDCODED_VALUES.md guidelines
```

### For Existing Projects

```bash
# Run security scan on existing code
./tools/security-scanner.sh --verbose

# Fix any critical issues before deployment
./tools/security-scanner.sh --fix
```

## 📁 Security System Components

### 🔒 Core Files

| File | Purpose | Usage |
|------|---------|-------|
| `NO_HARDCODED_VALUES.md` | Security policy and guidelines | **READ FIRST** - Comprehensive security rules |
| `.env.example` | Template for environment variables | Copy to `.env` and fill with real values |
| `tools/security-scanner.sh` | Automated security scanner | Run manually or in CI/CD |
| `tools/setup-security.sh` | One-time security setup | Run once per project setup |

### 🪝 Git Hooks

| Hook | Function | Triggers |
|------|----------|----------|
| `.githooks/pre-commit` | Blocks commits with hardcoded values | Every `git commit` |
| `.git/hooks/pre-push` | Validates before pushing to remote | Every `git push` |

### 🤖 CI/CD Integration

| File | Purpose | Runs On |
|------|---------|---------|
| `.github/workflows/security-scan.yml` | Automated GitHub Actions | Push, PR, Daily |
| `.eslintrc.security.json` | Code quality security rules | Local dev & CI |

## 🛡️ Security Features

### ✅ Automated Detection

- **Hardcoded Credentials**: API keys, passwords, secrets
- **IP Addresses**: Non-local IP addresses in code
- **Database Strings**: Connection strings with credentials
- **Healthcare Data**: SSN, medical record patterns
- **Email/Phone**: Personal information in code
- **Environment Files**: Prevents committing .env files

### 🏥 Healthcare Compliance (HIPAA)

- **Patient Data Protection**: Detects PHI patterns
- **Audit Logging**: Tracks security scan results
- **Data Encryption**: Enforces encryption requirements
- **Access Control**: Environment-based configurations

### 🔧 Developer Tools

```bash
# Security Commands
npm run security:scan       # Quick scan
npm run security:audit      # npm vulnerability check
npm run security:fix        # Auto-fix dependencies
npm run security:check      # Full security validation

# Manual Tools
./tools/security-scanner.sh --verbose    # Detailed scan
./tools/security-scanner.sh --ci         # CI-friendly output
./tools/security-scanner.sh --fix        # Attempt auto-fixes
```

## 🚫 What Gets Blocked

### 🔴 CRITICAL (Blocks Commit)

- Real API keys or secrets in code
- Database connection strings with passwords
- AWS access keys (AKIA...)
- Production IP addresses
- Real SSN or medical record numbers

### 🟡 HIGH PRIORITY (Blocks Push)

- Hardcoded localhost with ports
- Email addresses (non-placeholder)
- Phone numbers (non-test data)
- .env files in repository

### 🟠 MEDIUM (Warning)

- URLs without environment variables
- Console.log with sensitive data
- TODO comments mentioning credentials

## 📋 Security Checklist

### Before Every Commit

- [ ] No hardcoded credentials or API keys
- [ ] All configurations use environment variables  
- [ ] No real patient or healthcare data
- [ ] .env files are gitignored
- [ ] Security scan passes (`npm run security:check`)

### Before Deployment

- [ ] All .env.example placeholders updated
- [ ] Production environment variables set
- [ ] Database credentials in secure storage
- [ ] HIPAA compliance validated
- [ ] Security scan report reviewed

### Code Review

- [ ] No sensitive data in comments
- [ ] Proper error handling (no credential leaks)
- [ ] Environment variable usage consistent
- [ ] Test data is anonymized/synthetic
- [ ] Logging doesn't expose sensitive information

## 🔧 Configuration

### Environment Variables

```bash
# Copy template and customize
cp .env.example .env

# Required for all environments
DB_HOST=your-database-host
DB_PASSWORD=your-secure-password
JWT_SECRET=your-jwt-secret

# Healthcare specific
HIPAA_ENCRYPTION_KEY=your-encryption-key
AUDIT_LOG_ENABLED=true
```

### ESLint Security Rules

The system includes ESLint security plugin with healthcare-specific rules:

```json
{
  "rules": {
    "security/detect-hardcoded-credentials": "error",
    "security/detect-unsafe-regex": "error",
    "security/detect-buffer-noassert": "error"
  }
}
```

## 🚨 Incident Response

### If Hardcoded Values Are Committed

1. **Immediate Action**:
   ```bash
   # Remove from history (if not pushed)
   git reset HEAD~1
   git add .
   git commit -m "Remove hardcoded values"
   
   # If already pushed - rotate all credentials
   ```

2. **Security Assessment**:
   - Identify what was exposed
   - Rotate all potentially compromised credentials
   - Update environment configurations
   - Run full security audit

3. **Prevention**:
   - Ensure Git hooks are installed
   - Update security scanning rules
   - Team training on security guidelines

### For Healthcare Data Exposure

1. **HIPAA Breach Protocol**:
   - Document the incident
   - Assess scope of potential PHI exposure
   - Follow organizational breach notification procedures
   - Update data handling procedures

## 📊 Monitoring & Reporting

### Daily Security Scans

GitHub Actions runs automated scans:
- **Push/PR**: Immediate validation
- **Daily**: 2 AM UTC comprehensive scan
- **Reports**: Available in Actions artifacts

### Security Metrics

Track these metrics for compliance:
- Hardcoded value detection rate
- Security scan pass rate
- Time to fix security issues
- Environment variable coverage

## 🆘 Troubleshooting

### Common Issues

**"Pre-commit hook failed"**
```bash
# Check what was detected
./tools/security-scanner.sh --verbose

# Fix issues and retry commit
git add .
git commit -m "Your message"
```

**"Environment variable not found"**
```bash
# Verify .env file exists and has required variables
cp .env.example .env
# Edit .env with real values
```

**"Healthcare data pattern detected"**
```bash
# Replace with synthetic test data
# Use anonymized patient records only
# Remove any real PHI from code/comments
```

### Getting Help

1. Review `NO_HARDCODED_VALUES.md` for detailed guidelines
2. Run `./tools/security-scanner.sh --verbose` for specific issues
3. Check GitHub Actions logs for CI failures
4. Contact security team for HIPAA compliance questions

## 📚 Additional Resources

- [NO_HARDCODED_VALUES.md](./NO_HARDCODED_VALUES.md) - Complete security policy
- [OWASP Security Guidelines](https://owasp.org/www-project-top-ten/)
- [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/)
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)

---

**🔐 Remember: Security is everyone's responsibility in healthcare applications!**