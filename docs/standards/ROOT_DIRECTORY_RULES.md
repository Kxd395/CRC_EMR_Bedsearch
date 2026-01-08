# ROOT DIRECTORY RULES - STRICT ENFORCEMENT

**Last Updated**: September 30, 2025  
**Status**: MANDATORY - NO EXCEPTIONS  
**Enforcement**: AUTO-CHECK ON COMMIT

---

## ⚠️ CRITICAL RULE: ONLY 6 FILES ALLOWED IN ROOT

The root directory of this repository **MUST** contain **ONLY** these 6 files:

### ✅ ALLOWED FILES (6 ONLY)
1. `README.md` - Main project documentation
2. `package.json` - Root package configuration
3. `package-lock.json` - Dependency lock file
4. `start` - Quick start command (executable)
5. `stop` - Quick stop command (executable)
6. `health` - Quick health check command (executable)

### ✅ ALLOWED HIDDEN FILES
- `.gitignore` - Git ignore rules
- `.env.example` - Environment template (NO real .env!)
- `.eslintrc.*` - ESLint configuration
- `.DS_Store` - macOS system file (auto-generated, in .gitignore)
- `.github/` - GitHub configuration directory

### ✅ ALLOWED DIRECTORIES
- `src/` - Source code
- `scripts/` - All scripts
- `docs/` - All documentation
- `config/` - Configuration files
- `logs/` - Log files
- `tests/` - Test suites
- `node_modules/` - Dependencies
- `.git/` - Git repository
- `.vscode/` - VS Code settings
- `.archive/` - Archived files (hidden)

---

## ❌ FORBIDDEN IN ROOT

### NEVER CREATE THESE IN ROOT:

#### 1. Scripts/Shell Files
❌ `*.sh` files (ALL scripts go in `scripts/` subdirectories)  
❌ `BATCH_MOVE.sh` → Move to `scripts/utilities/` after use, then `.archive/`  
❌ `REORGANIZE_COMPLETE.sh` → Move to `scripts/backup/` then `.archive/`  
❌ `FIX_NOW.sh` → Should be in `scripts/utilities/`  
❌ `deploy.sh` → Should be in `scripts/deploy/`  
❌ Any executable scripts

**RULE**: ALL `.sh` files belong in `scripts/{category}/`

#### 2. Documentation Files
❌ `*.md` files (except README.md)  
❌ `REPOSITORY_STATUS.md` → Should be in `docs/reports/`  
❌ `IMPLEMENTATION_STATUS.md` → Should be in `docs/reports/`  
❌ `SESSION_SUMMARY.md` → Should be in `docs/reports/`  
❌ `QUICK_START.md` → Should be in `docs/getting-started/`  
❌ `*.md.old` or `*.md.backup` → Should be in `.archive/deprecated/`

**RULE**: ALL documentation except README.md goes in `docs/{category}/`

#### 3. Backup/Old Files
❌ `*.old` files  
❌ `*.backup` files  
❌ `*.bak` files  
❌ `README.md.old` → Move to `.archive/deprecated/`  
❌ Any versioned files (v1, v2, etc.)

**RULE**: ALL old/backup files go to `.archive/deprecated/`

#### 4. Log Files
❌ `*.log` files  
❌ `api-server.log` → Should be in `logs/`  
❌ `vite-server.log` → Should be in `logs/`  
❌ `ngrok.log` → Should be in `logs/`  
❌ Any log output

**RULE**: ALL logs go in `logs/`

#### 5. Source Code
❌ `*.js` files (except build configs if truly needed)  
❌ `*.ts` files  
❌ `*.jsx` files  
❌ `*.tsx` files  
❌ Any application code

**RULE**: ALL source code goes in `src/`

#### 6. Configuration Files (most)
❌ `.env` (use .env.example only, real .env goes in src/api/ and src/web/)  
❌ `*.sql` → Should be in `config/database/`  
❌ `vite.config.js` → Should be in `src/web/`  
❌ Most config files

**RULE**: Config files go in `config/{category}/` or their respective src directories

#### 7. Data Files
❌ `*.json` data files  
❌ `*.csv` files  
❌ `*.xml` files  
❌ Database dumps

**RULE**: Data files go in appropriate directories (src/api/data/, tests/test_data/, etc.)

---

## 🚨 ENFORCEMENT RULES

### Rule 1: Pre-Commit Check
**Action**: Check root directory before every commit

```bash
#!/bin/bash
# Pre-commit hook to check root directory

ALLOWED_FILES=(
  "README.md"
  "package.json"
  "package-lock.json"
  "start"
  "stop"
  "health"
  ".gitignore"
  ".env.example"
  ".eslintrc.security.json"
  ".DS_Store"
)

ALLOWED_DIRS=(
  ".git"
  ".github"
  ".vscode"
  ".archive"
  "src"
  "scripts"
  "docs"
  "config"
  "logs"
  "tests"
  "node_modules"
)

# Check for unauthorized files
for file in *; do
  if [[ -f "$file" ]]; then
    if [[ ! " ${ALLOWED_FILES[@]} " =~ " ${file} " ]]; then
      echo "❌ ERROR: Unauthorized file in root: $file"
      echo "   Move to appropriate directory:"
      
      case "$file" in
        *.sh)
          echo "   → scripts/{dev|database|deploy|utilities}/"
          ;;
        *.md)
          echo "   → docs/{category}/"
          ;;
        *.log)
          echo "   → logs/"
          ;;
        *.old|*.backup|*.bak)
          echo "   → .archive/deprecated/"
          ;;
        *.sql)
          echo "   → config/database/"
          ;;
        *)
          echo "   → Check ROOT_DIRECTORY_RULES.md"
          ;;
      esac
      
      exit 1
    fi
  fi
done

echo "✅ Root directory check passed"
```

### Rule 2: Automated Cleanup Script
**Location**: `scripts/utilities/cleanup-root.sh`

```bash
#!/bin/bash
# Cleanup root directory - move misplaced files

echo "🧹 Cleaning root directory..."

# Move .sh files (except if in scripts already)
for file in *.sh; do
  if [[ -f "$file" ]]; then
    echo "Moving $file to scripts/utilities/"
    mv "$file" scripts/utilities/
  fi
done

# Move .md files (except README.md)
for file in *.md; do
  if [[ -f "$file" && "$file" != "README.md" ]]; then
    echo "Moving $file to docs/reports/"
    mv "$file" docs/reports/
  fi
done

# Move .old/.backup files
for file in *.old *.backup *.bak; do
  if [[ -f "$file" ]]; then
    echo "Moving $file to .archive/deprecated/"
    mv "$file" .archive/deprecated/
  fi
done

# Move .log files
for file in *.log; do
  if [[ -f "$file" ]]; then
    echo "Moving $file to logs/"
    mv "$file" logs/
  fi
done

# Move .sql files
for file in *.sql; do
  if [[ -f "$file" ]]; then
    echo "Moving $file to config/database/"
    mv "$file" config/database/
  fi
done

echo "✅ Root cleanup complete"
```

### Rule 3: GitHub Copilot Instructions
**Update**: `.github/copilot-instructions.md`

```markdown
## ⚠️ CRITICAL: ROOT DIRECTORY RESTRICTION

**NEVER create files in the root directory!**

ONLY these files are allowed in root:
1. README.md
2. package.json
3. package-lock.json
4. start (executable)
5. stop (executable)
6. health (executable)

ALL other files MUST go in appropriate directories:
- Scripts → scripts/{category}/
- Documentation → docs/{category}/
- Logs → logs/
- Configs → config/{category}/
- Source → src/{api|web}/
- Old files → .archive/deprecated/

When creating ANY new file, ALWAYS ask:
"Where does this belong according to the structure?"
Then put it there FIRST TIME, not in root!
```

---

## 📋 CLEANUP CHECKLIST

### Current Root Violations to Fix:

1. ❌ `BATCH_MOVE.sh` → `scripts/utilities/` then `.archive/deprecated/`
2. ❌ `REORGANIZE_COMPLETE.sh` → `scripts/backup/` then `.archive/deprecated/`
3. ❌ `REPOSITORY_STATUS.md` → `docs/reports/`
4. ❌ `README.md.old` → `.archive/deprecated/`

### How to Clean Up Now:

```bash
# Move reorganization scripts to archive (already used)
mv BATCH_MOVE.sh .archive/deprecated/
mv REORGANIZE_COMPLETE.sh .archive/deprecated/

# Move status document to reports
mv REPOSITORY_STATUS.md docs/reports/

# Move old README to archive
mv README.md.old .archive/deprecated/

# Verify root is clean
ls -la | grep -v "^d" | grep -v "^total"
```

---

## 🎯 WHERE THINGS GO - QUICK REFERENCE

| File Type | Belongs In |
|-----------|------------|
| `*.sh` scripts | `scripts/{dev\|database\|deploy\|utilities}/` |
| `*.md` docs (not README) | `docs/{getting-started\|architecture\|deployment\|troubleshooting\|reports}/` |
| `*.log` logs | `logs/` |
| `*.sql` database | `config/database/` |
| `*.js` source | `src/{api\|web}/` |
| `*.old` `*.backup` | `.archive/deprecated/` |
| Report files | `docs/reports/` |
| Status files | `docs/reports/` |
| Fix scripts (used once) | `scripts/utilities/` then `.archive/deprecated/` |
| Reorganization scripts | `scripts/backup/` then `.archive/deprecated/` |
| Old documentation | `docs/archive/` |
| Deprecated code | `.archive/deprecated/` |

---

## 🔒 PREVENTION STRATEGIES

### 1. Template for New Files
**Before creating ANY file, check:**

```
Q: What is this file?
Q: Where does it belong?
Q: Is root the right place? (99.9% of time: NO!)
Q: What's the correct directory?

Then: Create it in the RIGHT place FIRST TIME
```

### 2. Daily Check
**Add to daily workflow:**

```bash
# Check root directory daily
cd /Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22
ls -la | grep -v "^d" | wc -l
# Should be exactly 9 files (6 allowed + 3 hidden configs)
```

### 3. Git Hook
**Install pre-commit hook:**

```bash
# Create hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Check root directory
ROOT_FILES=$(ls -a | grep -v "^\.git$" | grep -v "^\.$" | grep -v "^\.\.$" | grep -v "^src$" | grep -v "^scripts$" | grep -v "^docs$" | grep -v "^config$" | grep -v "^logs$" | grep -v "^tests$" | grep -v "^node_modules$" | grep -v "^\..*$" | wc -l)

if [ $ROOT_FILES -gt 6 ]; then
  echo "❌ ERROR: Too many files in root directory!"
  echo "Allowed: 6 files (README.md, package.json, package-lock.json, start, stop, health)"
  echo "Current: $ROOT_FILES files"
  echo "Run: ls -la to see what's wrong"
  exit 1
fi

echo "✅ Root directory check passed"
EOF

chmod +x .git/hooks/pre-commit
```

---

## 📝 DEVELOPER INSTRUCTIONS

### When You Want to Create a File:

#### Step 1: Identify File Type
- Script? → `scripts/{category}/`
- Documentation? → `docs/{category}/`
- Source code? → `src/{api|web}/`
- Config? → `config/{category}/`
- Log? → `logs/`
- Test? → `tests/`
- Data? → `src/api/data/` or `tests/test_data/`
- Old/backup? → `.archive/deprecated/`

#### Step 2: Choose Category
- Development script → `scripts/dev/`
- Database script → `scripts/database/`
- Deployment script → `scripts/deploy/`
- Utility script → `scripts/utilities/`
- Getting started doc → `docs/getting-started/`
- Technical doc → `docs/architecture/`
- Status report → `docs/reports/`
- Troubleshooting → `docs/troubleshooting/`

#### Step 3: Create in Right Place
```bash
# ✅ CORRECT
touch scripts/utilities/my-script.sh

# ❌ WRONG - NEVER DO THIS
touch my-script.sh  # Don't create in root!
```

#### Step 4: If You Accidentally Created in Root
```bash
# Move it immediately!
mv wrong-file.sh scripts/utilities/
# Update any references
# Never commit files in root (except the 6 allowed)
```

---

## 🚨 ZERO TOLERANCE POLICY

**NO files in root except the 6 allowed.**

**NO exceptions.**

**NO "just this one time."**

**NO "I'll move it later."**

If you create a file in root:
1. Stop immediately
2. Move it to correct location
3. Update any references
4. Never commit it in root

**Keep root clean = Professional repository**

---

## ✅ SUCCESS CRITERIA

Root directory is clean when:

```bash
ls -la | grep -v "^d" | grep -v "^total" | wc -l
# Returns: 9
# (6 visible files + 3 hidden config files)
```

Files in root:
```
-rw-r--r--  .gitignore
-rw-r--r--  .env.example
-rw-r--r--  .eslintrc.security.json
-rwxr-xr-x  health
-rw-r--r--  package-lock.json
-rw-r--r--  package.json
-rw-r--r--  README.md
-rwxr-xr-x  start
-rwxr-xr-x  stop
```

**That's it. Nothing more. Ever.**

---

*Last Updated: September 30, 2025*  
*Status: MANDATORY - STRICT ENFORCEMENT*  
*Violations: Move files immediately*
