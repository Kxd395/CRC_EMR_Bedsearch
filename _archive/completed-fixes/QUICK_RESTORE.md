# 🚀 Quick Restore Reference

## Current Restore Point
**Tag**: `v1.0-popover-fixed`  
**Commit**: `c8e89e7`  
**Date**: September 30, 2025

---

## One-Command Restore

```bash
git checkout v1.0-popover-fixed
```

---

## What's Working
✅ Database persistence (JSONB)  
✅ Popover save ("Edit info")  
✅ Drawer save ("View details")  
✅ Status colors  
✅ Merge architecture  
✅ Enhanced logging  

---

## Quick Commands

### Restore
```bash
# Safe - create new branch from tag
git checkout -b my-restore v1.0-popover-fixed

# View without changing
git show v1.0-popover-fixed

# Compare with current
git diff v1.0-popover-fixed..HEAD
```

### Start System
```bash
cd /Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22
./start-servers.sh
```

### Test
- URL: http://localhost:5174
- Patient: pt_501 (💾 Dana Nguyen)
- Console: Should show "💾 DATABASE MODE"

---

## Emergency Rollback
```bash
# Save current work
git stash save "backup before rollback"

# Go back to working version
git reset --hard v1.0-popover-fixed
```

---

See **GIT_RESTORE_GUIDE.md** for complete documentation.
