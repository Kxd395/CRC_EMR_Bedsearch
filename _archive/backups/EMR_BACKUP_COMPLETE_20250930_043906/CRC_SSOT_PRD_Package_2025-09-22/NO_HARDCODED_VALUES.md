# 🚫 CRITICAL: NO HARDCODED VALUES POLICY

## Overview
This repository maintains healthcare EMR data and MUST NOT contain hardcoded sensitive information, database credentials, IP addresses, or patient data.

## 🔒 Prohibited Hardcoded Items
- Database credentials (usernames, passwords, connection strings)
- IP addresses and server hostnames
- API keys and tokens
- Patient data (real or identifiable test data)
- Production URLs and endpoints
- Encryption keys and secrets
- Personal information (names, emails, phone numbers)

## ✅ Required Practices

### Environment Variables
All configuration MUST use environment variables:
```javascript
// ❌ WRONG - Hardcoded
const dbHost = '100.112.67.23';
const dbPassword = 'emr_secure_2024';

// ✅ CORRECT - Environment variables
const dbHost = process.env.DB_HOST;
const dbPassword = process.env.DB_PASSWORD;
```

### Configuration Files
Use `.env` files for local development:
```bash
# .env (never commit to repo)
DB_HOST=your_server_ip
DB_PASSWORD=your_password
API_PORT=3001
```

### Default Fallbacks
Provide safe defaults only:
```javascript
// ✅ CORRECT - Safe defaults
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const dbPort = process.env.DB_PORT || 5432;
```

## 🛡️ Security Measures

### Git Hooks
Pre-commit hooks scan for:
- IP addresses (regex: `\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}`)
- Database passwords
- API keys and tokens
- Email addresses
- Phone numbers

### File Patterns to Exclude
- `*.env` files (local environment)
- `*.key` files (private keys)
- `*.pem` files (certificates)
- `*secret*` files
- `*credential*` files

## 📋 Code Review Checklist
Before any commit:
- [ ] No hardcoded IP addresses
- [ ] No passwords or secrets in code
- [ ] Environment variables used for configuration
- [ ] `.env.example` provided with safe examples
- [ ] Sensitive files in `.gitignore`
- [ ] No real patient data in fixtures
- [ ] No production URLs hardcoded

## 🎯 Copilot Instructions
When generating code:
1. Always use environment variables for configuration
2. Provide `.env.example` templates
3. Use placeholder values like `your_server_ip`
4. Generate test data that is clearly fictional
5. Include security warnings in comments
6. Never suggest real credentials or endpoints

## 🚨 Violation Response
If hardcoded values are found:
1. **STOP** - Do not merge the PR
2. Remove all hardcoded values immediately
3. Replace with environment variables
4. Update documentation
5. Review entire codebase for similar issues

## 📁 Required Files
Every project must include:
- `.env.example` - Template with safe placeholder values
- `.gitignore` - Excludes sensitive files
- `SECURITY.md` - Security reporting guidelines
- This `NO_HARDCODED_VALUES.md` policy

## 🔍 Automated Scanning
Repository includes automated scanning for:
- GitGuardian secret detection
- Custom regex patterns for EMR-specific data
- Pre-commit hooks for immediate detection
- CI/CD pipeline security checks

---

**Remember: Healthcare data security is not optional. One hardcoded credential could expose patient information and violate HIPAA compliance.**