# 🔄 Git Restore Guide

## Restore Point Created: September 30, 2025

### Commit Information
- **Commit Hash**: `c8e89e7`
- **Tag**: `v1.0-popover-fixed`
- **Branch**: `feature/transport-scheduled-auto-chip`
- **Message**: Critical Popover Bug Fixed + Complete Persistence System

---

## What This Restore Point Contains

### ✅ All Working Features
1. **Database Persistence** - PostgreSQL JSONB storage working
2. **Popover Save** - "Edit info" button saves to database
3. **Drawer Save** - "View details" button saves to database  
4. **Status Colors** - All bed search statuses with correct colors
5. **Merge Architecture** - Option A (static + database merge)
6. **Enhanced Logging** - Color-coded console output
7. **Timeline Fixed** - No more `timeline.map` errors
8. **Infinite Loop Fixed** - No more console spam

### 📁 Key Files in This Restore
```
src/web/src/app.js               - Fixed popover, enhanced logging
src/api/server.js                - API with field compatibility
src/api/persistence.js           - Database JSONB persistence
ssot_schema.sql                  - Database schema
config/                          - Database configuration
scripts/                         - Development scripts
POPOVER_BUG_FIXED.md            - Critical fix documentation
COMPREHENSIVE_FIX_PLAN.md       - Architecture overview
OPTION_A_IMPLEMENTATION_COMPLETE.md - Merge approach details
CONSOLE_LOGGING_GUIDE.md        - Logging reference
```

---

## How to Restore This Version

### Option 1: Restore Using Tag (Recommended)
```bash
# View all tags
git tag -l

# Restore to this specific tag
git checkout v1.0-popover-fixed

# Or create a new branch from this tag
git checkout -b restore-from-popover-fix v1.0-popover-fixed
```

### Option 2: Restore Using Commit Hash
```bash
# Restore to this commit
git checkout c8e89e7

# Or create a new branch from this commit
git checkout -b restore-from-c8e89e7 c8e89e7
```

### Option 3: View Files Without Checking Out
```bash
# Show files changed in this commit
git show c8e89e7 --name-only

# View specific file from this commit
git show c8e89e7:CRC_SSOT_PRD_Package_2025-09-22/src/web/src/app.js

# Compare current with this commit
git diff c8e89e7 HEAD
```

### Option 4: Cherry-Pick Specific Changes
```bash
# Apply only this commit to current branch
git cherry-pick c8e89e7
```

---

## Quick Reference

### View Commit Details
```bash
# Full commit message and changes
git show c8e89e7

# Statistics
git show c8e89e7 --stat

# Files only
git show c8e89e7 --name-status
```

### Compare Versions
```bash
# Compare with current state
git diff v1.0-popover-fixed..HEAD

# Compare specific file
git diff v1.0-popover-fixed..HEAD -- src/web/src/app.js
```

### Reset to This Point (CAREFUL!)
```bash
# Soft reset (keeps changes staged)
git reset --soft c8e89e7

# Mixed reset (keeps changes unstaged)
git reset --mixed c8e89e7

# Hard reset (DELETES all changes!)
git reset --hard c8e89e7
```

---

## After Restoring

### 1. Install Dependencies
```bash
cd /Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22
npm install
```

### 2. Start Servers
```bash
./start-servers.sh
```

### 3. Verify Database Connection
- Check logs: `logs/api-server.log`
- API should connect to: `100.112.67.23:5432/emr_crc_ssot`

### 4. Test in Browser
- Open: http://localhost:5174
- Select patient: pt_501 (💾 Dana Nguyen)
- Change bed search status
- Check console for: "💾 DATABASE MODE"
- Refresh page - status should persist!

---

## Troubleshooting

### If Servers Won't Start
```bash
# Kill any running servers
lsof -ti:3001 | xargs kill -9
lsof -ti:5174 | xargs kill -9

# Start fresh
./start-servers.sh
```

### If Database Won't Connect
```bash
# Test connection
cd scripts/database
./test-connection.sh

# Check SSH tunnel (if needed)
ssh -L 5432:localhost:5432 user@100.112.67.23
```

### If Persistence Doesn't Work
1. Check console for "💾 Saving patient..." messages
2. Verify API responds: `curl http://localhost:3001/api/patients/pt_501`
3. Check database: Should have `searches` JSONB column
4. Look for errors in: `logs/api-server.log`

---

## What Was Fixed in This Restore Point

### Critical Bug: Popover Save (Line 2967)
**Before**:
```javascript
const patient = patientScenarios.find(...);  // ❌ Static only!
// No database save!
```

**After**:
```javascript
const patient = getCurrentPatient();  // ✅ Merged data
await savePatientToDatabase(patient); // ✅ Saves!
```

### Other Fixes Included
- Timeline error (handles array/object)
- Infinite loop (removed renderAll from load)
- Field names (searches/bedSearches compatibility)
- Patient selector (uses static with 💾 indicator)
- Enhanced logging (color-coded data sources)

---

## Tags Available

View all restore points:
```bash
git tag -l -n1
```

Expected output:
```
v1.0-popover-fixed    Restore Point: All persistence working, popover bug fixed
```

---

## Support Documentation

After restoring, these files explain the system:

- **POPOVER_BUG_FIXED.md** - The critical fix explained
- **COMPREHENSIVE_FIX_PLAN.md** - Architecture options analyzed
- **OPTION_A_IMPLEMENTATION_COMPLETE.md** - Current architecture
- **CONSOLE_LOGGING_GUIDE.md** - How to read console output
- **BED_SEARCH_FIXES_COMPLETE.md** - All fixes applied

---

## Emergency Rollback

If something goes wrong after making changes:

```bash
# Go back to this safe state
git checkout v1.0-popover-fixed

# Or if you're on a branch and want to reset
git reset --hard v1.0-popover-fixed

# If you need to save current work first
git stash save "Work in progress before rollback"
git checkout v1.0-popover-fixed
```

---

## Creating Your Own Restore Points

When you make working changes:

```bash
# Stage your changes
git add .

# Commit with descriptive message
git commit -m "feat: description of changes"

# Tag it for easy restoration
git tag -a v1.1-your-feature -m "Restore Point: Your feature description"
```

---

**This restore point represents a fully working system. All persistence issues are resolved!** 🎉
