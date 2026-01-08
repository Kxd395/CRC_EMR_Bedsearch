# CRITICAL PATH ISSUES - IMMEDIATE FIX NEEDED

**Status**: ⚠️ BROKEN - Scripts have hardcoded paths  
**Impact**: Scripts fail when run from different directories  
**Root Cause**: Absolute paths instead of dynamic resolution

---

## 🚨 THE PROBLEM

Scripts contain hardcoded absolute paths like:
```bash
PROJECT_ROOT="/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22"
```

This violates SSOT (Single Source of Truth) and breaks when:
- Running from different directory
- Project moves to different location
- Different user runs the script
- CI/CD environment

---

## ✅ THE FIX

Replace hardcoded paths with dynamic resolution:

```bash
# ❌ WRONG - Hardcoded
PROJECT_ROOT="/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22"

# ✅ CORRECT - Dynamic
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
```

---

## 📋 SCRIPTS THAT NEED FIXING

### Already Fixed ✅
- `scripts/dev/start.sh` ✅
- `scripts/dev/start-all.sh` ✅
- `scripts/dev/start-both.sh` ✅

### Need Fixing ⚠️
1. `scripts/backup/reorganize-v1.sh`
2. `scripts/database/fix-connection.sh`
3. `scripts/database/test-connection.sh`
4. `scripts/dev/test-ngrok.sh`
5. `scripts/utilities/cleanup-root.sh`
6. `scripts/utilities/fix-cache-restart.sh`

---

## 🔧 HOW TO FIX EACH SCRIPT

For each script, replace the hardcoded PROJECT_ROOT line with:

```bash
# Find this line:
PROJECT_ROOT="/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22"

# Replace with these 2 lines:
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
```

**The formula:**
- Script in `scripts/dev/` → `PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"`
- Script in `scripts/database/` → `PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"`
- Script in `scripts/utilities/` → `PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"`

All go up 2 levels (..) to reach project root.

---

## 🚀 QUICK FIX COMMAND

Run this to fix all at once:

```bash
cd /Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22

# Fix each script manually or use find/replace
for script in \
  scripts/backup/reorganize-v1.sh \
  scripts/database/fix-connection.sh \
  scripts/database/test-connection.sh \
  scripts/dev/test-ngrok.sh \
  scripts/utilities/cleanup-root.sh \
  scripts/utilities/fix-cache-restart.sh; do
  
  echo "Fixing: $script"
  
  # Backup
  cp "$script" "$script.bak"
  
  # Replace hardcoded path
  sed -i '' 's|PROJECT_ROOT="/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22"|SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" \&\& pwd)"\nPROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." \&\& pwd)"|' "$script"
  
done

echo "✅ All scripts fixed"
```

---

## ✅ VERIFICATION

After fixing, verify with:

```bash
# Should return nothing (no hardcoded paths)
grep -r "VScode_Projects" scripts/ --include="*.sh"
```

---

## 📝 PREVENTION

**Rule for all future scripts:**

```bash
#!/bin/bash

# ✅ ALWAYS start scripts with dynamic path resolution
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"  # Adjust .. based on depth

# Then use $PROJECT_ROOT for all paths
API_DIR="$PROJECT_ROOT/src/api"
UI_DIR="$PROJECT_ROOT/src/web"
```

**NEVER:**
- Hardcode `/Users/...` paths
- Hardcode project names
- Use absolute paths

**ALWAYS:**
- Use `$PROJECT_ROOT` variable
- Calculate paths dynamically
- Test from different directories

---

## 🎯 WHY THIS MATTERS (SSOT)

**SSOT = Single Source of Truth**

The truth is: "The project root is 2 directories up from any script in scripts/*/"

NOT: "The project root is /Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22"

Because:
- Path can change
- User can be different
- Location can move
- CI/CD has different paths

Dynamic resolution = TRUE SSOT ✅

---

## 🚨 IMMEDIATE ACTION REQUIRED

1. **Stop using scripts** until paths are fixed
2. **Run the fix command** above
3. **Verify** no hardcoded paths remain
4. **Test** scripts work from any directory

---

*Created: September 30, 2025*  
*Priority: CRITICAL*  
*Status: NEEDS IMMEDIATE FIX*
