# 📋 Repository Reorganization - Pre-Flight Checklist

**Created**: January 2025  
**Purpose**: Ensure safe reorganization to industry standards

---

## ⚠️ CRITICAL: Do This First!

### 1. **Hard Refresh Browser** (STILL PENDING!)

Before reorganizing, **FIRST verify the application works**:

```bash
# Servers are running:
✅ API Server: PID 44065, Port 3001
✅ UI Server: PID 44113, Port 5173

# YOU MUST DO NOW:
🔴 Open browser to http://localhost:5173
🔴 Press Cmd+Shift+R (Mac) or Ctrl+Shift+F5 (Windows/Linux)
🔴 Verify patient info loads correctly
```

**Expected after hard refresh:**
- ✅ Console: "✅ Loaded 27 patients from database"
- ✅ Patient dropdown: 27 patients with ● symbols
- ✅ Assessment tab: Auto-populates with patient data
- ✅ Patient Progress tab: Visible
- ✅ Searches persist after refresh

**DO NOT reorganize until you confirm the app works!**

---

## 🛡️ Safety Checks Before Reorganization

### Git Status
```bash
cd /Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22

# Check current status
git status

# Create safety branch
git checkout -b before-reorganization
git add .
git commit -m "Checkpoint before reorganization"

# Tag this point
git tag -a v1.0-before-reorg -m "Before industry standard reorganization"

# Return to main
git checkout main
```

### Backup Verification
```bash
# The reorganization script automatically creates backup
# It will be at: ../EMR_BACKUP_YYYYMMDD_HHMMSS/

# Manual backup (optional extra safety):
cd /Users/VScode_Projects/EMR/
cp -R CRC_SSOT_PRD_Package_2025-09-22 CRC_SSOT_PRD_BACKUP_MANUAL
```

### Stop All Servers
```bash
# Stop servers before reorganization
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null
lsof -ti:5174 | xargs kill -9 2>/dev/null

echo "✅ All servers stopped"
```

---

## 🚀 Execute Reorganization

### Run the Script
```bash
cd /Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22

# Execute reorganization
bash REORGANIZE.sh
```

### What the Script Does

**Phase 1**: Creates new directory structure
- `src/api`, `src/web`, `src/shared`
- `scripts/dev`, `scripts/deploy`, `scripts/database`, `scripts/utilities`
- `docs/` with subdirectories
- `tests/`, `config/`, `.archive/`

**Phase 2**: Moves all scripts to organized locations
- Development scripts → `scripts/dev/`
- Database scripts → `scripts/database/`
- Deployment scripts → `scripts/deploy/`
- Utilities → `scripts/utilities/`

**Phase 3**: Consolidates documentation
- `doc/` → `docs/specifications/prd/`
- `documentation/` → `docs/`
- `SSOT_DOCUMENTATION/` → `docs/architecture/`
- All `.md` files → `docs/archive/`

**Phase 4**: Organizes source code
- `production/api/` → `src/api/`
- `development/prototypes/ui_prototype/` → `src/web/`
- `development/testing/` → `tests/`

**Phase 5**: Archives old files
- `archive/` → `.archive/`
- Deprecated code → `.archive/deprecated/`

**Phase 6**: Updates all paths in scripts
- Automatically updates references
- Makes scripts executable

**Phase 7-10**: Creates README, quick scripts, .gitignore, cleanup

---

## ✅ Post-Reorganization Verification

### 1. Verify New Structure
```bash
# Check new directory tree
ls -la

# Should see:
# ├── src/
# ├── scripts/
# ├── docs/
# ├── tests/
# ├── config/
# ├── .archive/
# ├── README.md
# ├── start (new quick start script)
# ├── stop (new quick stop script)
```

### 2. Test Application Startup
```bash
# Use new quick start
./start

# OR use organized script
bash scripts/dev/start.sh
```

### 3. Verify Servers Running
```bash
# Check API
curl http://localhost:3001/health

# Check UI
curl -I http://localhost:5173

# Expected: Both respond successfully
```

### 4. Test in Browser
```bash
# Open browser
open http://localhost:5173

# Hard refresh (Cmd+Shift+R)

# Verify:
# ✅ Patient dropdown works
# ✅ Assessment populates
# ✅ Dashboard visible
# ✅ Searches persist
```

### 5. Check Console for Errors
```bash
# API logs
tail -f logs/api-server.log

# UI logs  
tail -f logs/ui-server.log

# Should see no new errors
```

---

## 🔄 Rollback Plan (If Needed)

### Option 1: Use Backup
```bash
cd /Users/VScode_Projects/EMR/

# Remove reorganized version
rm -rf CRC_SSOT_PRD_Package_2025-09-22

# Restore from backup
cp -R EMR_BACKUP_YYYYMMDD_HHMMSS CRC_SSOT_PRD_Package_2025-09-22

# Restart servers
cd CRC_SSOT_PRD_Package_2025-09-22
bash start-simple.sh  # Old script names
```

### Option 2: Use Git
```bash
# Reset to tagged version
git reset --hard v1.0-before-reorg

# OR switch to branch
git checkout before-reorganization
```

### Option 3: Manual Restore
```bash
# If git/backup unavailable, manually move files back
# (Not recommended - use backup instead)
```

---

## 📊 Benefits After Reorganization

### Developer Experience
- ✅ Clear project structure
- ✅ Easy to find files
- ✅ Industry-standard layout
- ✅ New developers onboard faster

### Maintenance
- ✅ Organized scripts by purpose
- ✅ Consolidated documentation
- ✅ Clear separation of concerns
- ✅ Hidden archive folder (less clutter)

### Professional Standards
- ✅ Follows industry conventions
- ✅ Scalable structure
- ✅ Better for CI/CD
- ✅ Easier to document

---

## 🎯 Quick Reference: New Paths

### Common Files - Old → New

**Scripts:**
```
start-simple.sh → scripts/dev/start.sh (or just: ./start)
start-all.sh → scripts/dev/start-all.sh
database_fix_script.sh → scripts/database/fix.sh
deploy.sh → scripts/deploy/deploy.sh
FIX_NOW.sh → scripts/utilities/fix-cache-restart.sh
```

**Source Code:**
```
production/api/ → src/api/
development/prototypes/ui_prototype/ → src/web/
development/testing/ → tests/
```

**Documentation:**
```
doc/ → docs/specifications/prd/
documentation/ → docs/
SSOT_DOCUMENTATION/ → docs/architecture/
*.md files → docs/archive/
```

**Quick Commands (NEW):**
```
./start           - Start all servers
./stop            - Stop all servers
```

---

## ❓ FAQ

### Q: Will this break my application?
**A**: No. The script:
- Creates automatic backup
- Updates all path references
- Preserves all functionality
- Only reorganizes files

### Q: What if something goes wrong?
**A**: You have 3 rollback options:
1. Automatic backup created by script
2. Git tag/branch created before reorganization
3. Manual backup (if you created one)

### Q: Do I need to reconfigure anything?
**A**: No. The script automatically:
- Updates all script paths
- Preserves .env files
- Maintains configuration
- Updates references

### Q: Will the database connection change?
**A**: No. Database configuration stays the same:
- Connection string unchanged
- Fallback mode still works
- No data loss

### Q: How long does reorganization take?
**A**: Less than 30 seconds for the script to run.

### Q: Can I reorganize while servers are running?
**A**: **No**. Stop all servers first:
```bash
lsof -ti:3001 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

---

## 📝 Final Checklist

Before running `REORGANIZE.sh`, confirm:

- [ ] **CRITICAL**: Application works (hard refresh browser done)
- [ ] Git repository has committed changes
- [ ] Created safety branch: `before-reorganization`
- [ ] Created git tag: `v1.0-before-reorg`
- [ ] All servers stopped
- [ ] Read through `REORGANIZE.sh` script
- [ ] Understand rollback plan
- [ ] Ready to test after reorganization

**When all checked, run:**
```bash
bash REORGANIZE.sh
```

---

## 🆘 Support

If issues occur:
1. Check backup: `../EMR_BACKUP_YYYYMMDD_HHMMSS/`
2. Check git: `git tag` and `git log`
3. Review logs: `logs/` directory
4. Compare with backup to identify differences

---

**Last Updated**: January 2025  
**Status**: Ready to execute after app verification ✅
