# EMR System - GitHub Copilot Instructions

## Project Overview
This is a healthcare Electronic Medical Records (EMR) system with Node.js/Express backend and Vite-based frontend. The system handles patient management, facility operations, and clinical workflows while maintaining HIPAA compliance.

**Repository Version**: v2.0 (Reorganized September 30, 2025)

---

## Repository Structure (v2.0 - CURRENT)

### Where to Work
```
CRC_SSOT_PRD_Package_2025-09-22/
├── src/                         # SOURCE CODE ONLY
│   ├── api/                     # Backend (Node.js/Express) - formerly production/api
│   └── web/                     # Frontend (Vite/Vanilla JS) - formerly ui_prototype
├── scripts/                     # ALL EXECUTABLE SCRIPTS
│   ├── dev/                     # Development scripts
│   ├── database/                # Database management
│   ├── deploy/                  # Deployment automation
│   ├── utilities/               # Utility scripts
│   └── backup/                  # Backup/archive scripts
├── docs/                        # ALL DOCUMENTATION
│   ├── getting-started/         # Quick start guides
│   ├── architecture/            # Technical documentation
│   ├── deployment/              # Deployment guides
│   ├── troubleshooting/         # Problem-solving guides
│   ├── reports/                 # Status reports
│   ├── healthcare-compliance/   # HIPAA/compliance docs
│   ├── specifications/          # Requirements/PRD
│   └── archive/                 # Historical documentation
├── config/                      # Configuration files
│   └── database/                # Schemas, migrations
├── logs/                        # ALL log files
├── tests/                       # Test suites
└── .archive/                    # Deprecated files (hidden)
```

### ⚠️ IMPORTANT PATH CHANGES
**OLD PATHS (DEPRECATED):**
- ❌ `ui_prototype/` → ✅ `src/web/`
- ❌ `production/api/` → ✅ `src/api/`
- ❌ `doc/` → ✅ `docs/`
- ❌ `documentation/` → ✅ `docs/`

**ALWAYS use NEW paths in all code, scripts, and documentation.**

---

## 🚨 CRITICAL: ROOT DIRECTORY RESTRICTION

**⚠️ ZERO TOLERANCE POLICY: NEVER CREATE FILES IN ROOT! ⚠️**

### ONLY 6 FILES ALLOWED IN ROOT (NO EXCEPTIONS)

1. `README.md` - Main project documentation
2. `package.json` - Root package configuration
3. `package-lock.json` - Dependency lock file
4. `start` - Quick start command (executable)
5. `stop` - Quick stop command (executable)
6. `health` - Quick health check command (executable)

**That's it. Nothing more. Ever.**

### ❌ FORBIDDEN IN ROOT - INSTANT MOVE REQUIRED

**Scripts (.sh, .js executables)**:
- ❌ NEVER create `*.sh` in root
- ❌ NEVER create executable scripts in root
- ✅ ALL scripts → `scripts/{dev|database|deploy|utilities}/`

**Documentation (except README.md)**:
- ❌ NEVER create `*.md` in root (except README.md)
- ❌ No REPOSITORY_STATUS.md in root
- ❌ No SESSION_SUMMARY.md in root
- ✅ ALL docs → `docs/{category}/`

**Backup/Old Files**:
- ❌ No `*.old` files
- ❌ No `*.backup` files
- ❌ No `*.bak` files
- ✅ ALL old files → `.archive/deprecated/`

**Logs**:
- ❌ No `*.log` files
- ✅ ALL logs → `logs/`

**Source Code**:
- ❌ No application code in root
- ✅ ALL code → `src/{api|web}/`

**Data/Config**:
- ❌ No `*.sql` files
- ❌ No `*.json` data files
- ✅ Configs → `config/{category}/`

### ✅ BEFORE CREATING ANY FILE - CHECK THIS

```
Q: What is this file?
Q: Where does it belong?
Q: Is root the right place? 
A: 99.9% of time: NO!

THEN: Create it in the RIGHT place FIRST TIME
```

**If you accidentally create in root**:
```bash
# STOP immediately
# Move it NOW
mv wrong-file.sh scripts/utilities/
# Update any references
# NEVER commit it in root
```

---

## File Organization Rules

### When Creating New Files

1. **Source Code**
   - Backend code → `src/api/`
   - Frontend code → `src/web/`
   - Shared utilities → `src/shared/`
   - **NEVER put source code in root directory**

2. **Scripts**
   - Development scripts (start, build, watch) → `scripts/dev/`
   - Database scripts (migrations, seeds) → `scripts/database/`
   - Deployment scripts → `scripts/deploy/`
   - Utility scripts (health, fixes) → `scripts/utilities/`
   - Old scripts → `scripts/backup/` then `.archive/deprecated/`
   - **NEVER create .sh files in root**

3. **Documentation**
   - Getting started → `docs/getting-started/`
   - Technical docs → `docs/architecture/`
   - Deployment → `docs/deployment/`
   - Troubleshooting → `docs/troubleshooting/`
   - Reports → `docs/reports/`
   - Standards → `docs/standards/`
   - Old docs → `docs/archive/`
   - **NEVER create .md files in root (except README.md)**

4. **Configuration**
   - Database → `config/database/`
   - Environments → `config/environments/`
   - **NEVER create config files in root**

5. **Logs**
   - ALL logs → `logs/`
   - Never commit logs
   - **NEVER create .log files in root**

6. **Backup/Old Files**
   - ALL old files → `.archive/deprecated/`
   - **NEVER create .old, .backup, .bak files in root**

---

## Moving/Reorganizing Files

### Before Moving Files
1. Check if file is referenced elsewhere
2. Search for imports/requires: `grep -r "old/path/file.js" .`
3. Update ALL references to new path
4. Test after moving

### Moving Files - Process
```bash
# 1. Find references
grep -r "old/path/to/file.js" .

# 2. Move file
mv old/path/to/file.js new/path/to/file.js

# 3. Update references
find . -type f -name "*.js" -exec sed -i '' 's|old/path/to/file.js|new/path/to/file.js|g' {} +

# 4. Make executable if script
chmod +x new/path/to/file.sh

# 5. Test
./start
```

### Batch Moving Template
```bash
#!/bin/bash
set -e

# Create directories
mkdir -p target/directory

# Move with checks
[ -f "source/file.js" ] && mv source/file.js target/directory/

# Update paths
find . -type f \( -name "*.js" -o -name "*.md" \) \
  -exec sed -i '' 's|source/file.js|target/directory/file.js|g' {} +

# Make executable
chmod +x target/directory/*.sh

echo "✅ Move complete"
```

---

## Updating Documentation

### When Code Changes - Update These
1. **README.md** - Structure/usage changes
2. **docs/architecture/API_REFERENCE.md** - API changes
3. **docs/architecture/DATABASE_SCHEMA.md** - DB changes
4. **Relevant troubleshooting docs** - Bug fixes

### Documentation Checklist
- [ ] Fix broken file path references
- [ ] Update code examples
- [ ] Update version numbers
- [ ] Verify all links work
- [ ] Update "Last Updated" date
- [ ] Move outdated docs to `docs/archive/`

### Path References in Docs
**✅ CORRECT:**
```markdown
`src/api/server.js`
`scripts/dev/start.sh`
`docs/architecture/API_REFERENCE.md`
```

**❌ WRONG:**
```markdown
`production/api/server.js` (old structure)
`ui_prototype/` (old structure)
`/Users/username/...` (absolute paths)
```

---

## Frontend Architecture (src/web/)

### Build & Validation
```bash
cd src/web
npm install              # Install once
npm run dev              # Start dev server with HMR
npm run build            # Build for production
npm run lint             # ESLint check
npm run preview          # Preview production build
```

### UI Structure
- `index.html` - DOM scaffolding
- `src/app.js` - Main application (IIFE wiring all panels)
- `src/styles/main.css` - Centralized CSS with design tokens
- `src/data/` - Fixtures and mock data
  - `facilityDirectory.js` - Facility data
  - `newPatientScenarios.js` - Patient seeds
  - `commitmentFixtures.js` - Commitment data

### Data & Persistence
- Facility data: `src/web/src/data/facilityDirectory.js`
- Patient scenarios: `src/web/src/data/newPatientScenarios.js`
- LocalStorage keys:
  - `crc-ssot-panel-visibility` - Layout preferences
  - `crc-ssot-commitment-settings` - Commitment preferences
- Always guard localStorage reads/writes

### Status & Workflows
- Status styling: `STATUS_STYLES`, `STATUS_KEY_ALIASES` in `src/app.js`
- Bed search: `BedSearchEventTypes`, `addSearchEvent()`, `deriveSearchStatus()`
- Commitment: `src/commitmentPanel.js` renders legal summary
- Never mutate status directly - use helper functions

---

## Backend Architecture (src/api/)

### Server Structure
- `server.js` - Express API server (port 3001)
- `persistence.js` - Database persistence layer
- `data/` - Local data files and fixtures

### API Patterns
```javascript
// Standard endpoint pattern
app.get('/api/endpoint', async (req, res) => {
  try {
    const data = await someOperation();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error message' 
    });
  }
});
```

### Environment Variables
```bash
# src/api/.env
DB_HOST=your-database-host
DB_PORT=5432
DB_NAME=emr_database
DB_USER=username
DB_PASSWORD=password
PORT=3001
```

**Never commit .env files!**

---

## Script Management

### Quick Commands (Root)
```bash
./start     # Start all servers
./stop      # Stop all servers
./health    # Check system health
```

### Development Scripts
```bash
bash scripts/dev/start.sh           # Start servers
bash scripts/dev/start-all.sh       # Start with output
bash scripts/dev/start-both.sh      # Start API + UI separately
```

### Database Scripts
```bash
bash scripts/database/test-connection.sh    # Test connection
bash scripts/database/migrate.sh            # Run migrations
bash scripts/database/fix-connection.sh     # Fix issues
```

### Script Naming Conventions
- `start*.sh` - Start operations
- `stop*.sh` - Stop operations
- `test-*.sh` - Testing scripts
- `fix-*.sh` - Repair scripts
- `setup-*.sh` - Installation scripts
- `deploy*.sh` - Deployment scripts
- `migrate*.sh` - Database migrations

### Making Scripts Executable
```bash
chmod +x scripts/**/*.sh
chmod +x scripts/**/*.js
```

### Archiving Outdated Scripts
```bash
# Test if works
bash scripts/old-script.sh

# Move to backup if outdated
mv scripts/category/old-script.sh scripts/backup/

# Archive if not needed
mv scripts/backup/old-script.sh .archive/deprecated/scripts/

# Document why
echo "old-script.sh - Deprecated $(date) - Reason: [why]" >> .archive/deprecated/README.md
```

---

## Healthcare/HIPAA Compliance

### PHI Handling
```javascript
// ✅ CORRECT: Never log PHI
console.log('Fetching patient ID:', patientId);  // OK

// ❌ WRONG: Never log sensitive data
console.log('Patient data:', patientData);  // NEVER

// ✅ CORRECT: Sanitize logs
const sanitized = { id: patient.id, timestamp: new Date() };
console.log('Operation:', sanitized);
```

### Security Best Practices
**Never commit:**
- API keys
- Database passwords
- Private keys
- Patient data
- .env files

**Always:**
- Use environment variables for secrets
- Validate all inputs
- Sanitize all outputs
- Use HTTPS in production
- Implement proper authentication

---

## Code Style

### JavaScript/Node.js
```javascript
// Use ES6 modules
import express from 'express';

// Use async/await
async function fetchData() {
  try {
    const data = await someAsyncOperation();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Use environment variables
const DB_HOST = process.env.DB_HOST || 'localhost';

// Use path.join for file paths
const path = require('path');
const configPath = path.join(__dirname, '../../config/database/schema.sql');
```

---

## Git Workflow

### Commit Message Format
```
type(scope): Brief description

- Detailed change 1
- Detailed change 2

Fixes: #issue-number
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

### Before Committing
```bash
git status          # Check changes
git diff            # Review changes
./start             # Test application
./stop              # Stop servers
git add .           # Stage files
git commit -m "..."  # Commit
git push origin main # Push
```

---

## Testing

### Running Tests
```bash
cd tests
npm install
npm test
```

### Test Structure
- Test files → `tests/tests/`
- Test data → `tests/test_data/`
- Test reports → `tests/reports/`

---

## Common Tasks

### Adding New API Endpoint
1. Add to `src/api/server.js`
2. Update `docs/architecture/API_REFERENCE.md`
3. Test endpoint
4. Commit changes

### Adding New Script
1. Create in appropriate `scripts/` subdirectory
2. Add header with purpose, usage
3. Make executable: `chmod +x script.sh`
4. Update script index documentation
5. Test script
6. Commit

### Updating Documentation
1. Edit documentation file
2. Update "Last Updated" date
3. Verify all links work
4. Check for outdated paths
5. Commit: `git commit -m "docs(scope): description"`

---

## Troubleshooting

### Common Issues

**Script not found:**
```bash
ls -l scripts/category/script.sh
find . -name "script.sh"
```

**Permission denied:**
```bash
chmod +x scripts/category/script.sh
```

**Module not found:**
```bash
cd src/api && npm install
cd src/web && npm install
```

**Port in use:**
```bash
./stop
# Or manually:
lsof -ti:3001 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

---

## Best Practices

### DO ✅
- Keep root clean (6 essential files only)
- Organize by purpose (src/, scripts/, docs/)
- Use relative paths in documentation
- Update docs when code changes
- Make scripts executable
- Use environment variables
- Handle errors properly
- Test before committing
- Follow HIPAA compliance
- Archive outdated files

### DON'T ❌
- Put source code in root
- Commit log files
- Commit .env files
- Use absolute paths
- Log PHI/sensitive data
- Leave broken scripts active
- Use outdated path references
- Hardcode credentials

---

## Quick Reference

**Project Root:** `/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22`

**Start:** `./start`

**Documentation:** `docs/`

**Scripts:** `scripts/`

**Source:** `src/api/` and `src/web/`

**Help:** `docs/getting-started/QUICK_START.md`

---

*Last Updated: September 30, 2025*  
*Repository Version: v2.0*  
*Structure: Industry Standard*
