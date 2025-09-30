# 🔍 HOW TO IDENTIFY DATA SOURCE - CONSOLE GUIDE

## 📊 Enhanced Console Logging Added!

You can now **clearly see** if the app is running in **Database Mode** or **Fallback Mode**.

---

## 🎯 WHAT YOU'LL SEE IN BROWSER CONSOLE

### ✅ Scenario 1: DATABASE MODE (Everything Working!)

**On Page Load**:
```
🔄 Attempting to load patients from database (attempt 1/3)...
✅ DATABASE CONNECTED: Loaded 1 patients from PostgreSQL
   → Database: emr_crc_ssot @ 100.112.67.23:5432
   → Method: database
🔄 Transforming patient pt_501: 3 searches found
```

**When Selecting Patient**:
```
💾 DATABASE MODE: Merging static + database data for pt_501
   → Structure from: newPatientScenarios.js (static)
   → Searches from: PostgreSQL database (3 searches)
   → Assessment from: Database
```

**What This Means**:
- ✅ Database is connected
- ✅ Bed searches are loaded from PostgreSQL
- ✅ Changes WILL persist on refresh
- ✅ You're seeing real data from database

---

### ⚠️ Scenario 2: STATIC MODE (No Database Record for Patient)

**On Page Load**:
```
✅ DATABASE CONNECTED: Loaded 1 patients from PostgreSQL
   → Database: emr_crc_ssot @ 100.112.67.23:5432
   → Method: database
```

**When Selecting Patient (not in database)**:
```
📋 STATIC MODE: Using static patient data for pt_503 (no database record)
   → All data from: newPatientScenarios.js
   → Changes will NOT persist on refresh
```

**What This Means**:
- ✅ Database is connected
- ⚠️ This specific patient has NO database record yet
- ⚠️ Using static data from JavaScript files
- ❌ Changes will NOT persist (first save will create record)

---

### ❌ Scenario 3: FALLBACK MODE (Database Down)

**On Page Load**:
```
🔄 Attempting to load patients from database (attempt 1/3)...
⚠️ DATABASE LOAD FAILED (attempt 1): Connection refused
⏳ Retrying in 1s...
⚠️ DATABASE LOAD FAILED (attempt 2): Connection refused
⏳ Retrying in 2s...
⚠️ DATABASE LOAD FAILED (attempt 3): Connection refused
📋 FALLBACK MODE: Using static patient data only
   → All data from: newPatientScenarios.js
   → Database unavailable - changes will NOT persist
```

**When Selecting Patient**:
```
📋 STATIC MODE: Using static patient data for pt_501 (no database record)
   → All data from: newPatientScenarios.js
   → Changes will NOT persist on refresh
```

**What This Means**:
- ❌ Database is DOWN or unreachable
- ❌ API server may be offline
- ❌ All data from static JavaScript files
- ❌ NO persistence - all changes lost on refresh

---

## 🎨 COLOR CODING

The console messages are now color-coded for easy identification:

| Color | Emoji | Meaning |
|-------|-------|---------|
| 🟢 **Green** | ✅ 💾 | Database connected, data loaded |
| 🟠 **Orange** | 📋 | Static/fallback mode, no persistence |
| 🔵 **Blue** | 🔄 | Loading/processing |
| 🔴 **Red** | ⚠️ ❌ | Error, database failed |

---

## 🧪 HOW TO TEST EACH SCENARIO

### Test Database Mode:
1. Make sure servers running: `lsof -ti:3001,5174`
2. Open http://localhost:5174
3. Open Console (F12)
4. Select pt_501
5. **Look for**: `💾 DATABASE MODE` in **green**

### Test Static Mode:
1. Select a patient NOT in database (pt_502, pt_503)
2. **Look for**: `📋 STATIC MODE` in **orange**

### Test Fallback Mode:
1. Stop API server: `kill $(lsof -ti:3001)`
2. Refresh browser
3. **Look for**: `📋 FALLBACK MODE` in **orange**
4. See retry attempts fail

---

## 📋 QUICK REFERENCE

### Database Mode = GOOD ✅
```
💾 DATABASE MODE: Merging static + database data
   → Searches from: PostgreSQL database (3 searches)
```
- **Persistence**: YES
- **Bed searches**: From database
- **Changes**: Will save and persist

### Static Mode = WARNING ⚠️
```
📋 STATIC MODE: Using static patient data
   → All data from: newPatientScenarios.js
```
- **Persistence**: NO (for this patient)
- **Bed searches**: From static file
- **Changes**: First save creates database record

### Fallback Mode = BAD ❌
```
📋 FALLBACK MODE: Using static patient data only
   → Database unavailable - changes will NOT persist
```
- **Persistence**: NO
- **Database**: Offline/unreachable
- **Changes**: Lost on refresh

---

## 🔍 WHAT TO CHECK

### If You See Database Mode ✅
- Everything working correctly!
- Bed searches are persisting
- You're good to go

### If You See Static Mode ⚠️
**For pt_501** (should have database record):
- Check: Did database get wiped?
- Fix: Add bed search and save to create record

**For pt_502, pt_503** (expected):
- Normal - these patients not in database yet
- Add bed search to create database record

### If You See Fallback Mode ❌
**Check**:
1. Is API server running? `lsof -ti:3001`
2. Is database accessible? `curl http://localhost:3001/api/patients`
3. Check API logs: `tail logs/api-server.log`

**Fix**:
- Restart servers: `./start-servers.sh`

---

## 🎯 SUMMARY

**Open browser console and look for**:

✅ **Want to see**: `💾 DATABASE MODE` (green)  
⚠️ **Okay to see**: `📋 STATIC MODE` (orange) for new patients  
❌ **Bad to see**: `📋 FALLBACK MODE` (orange) or multiple retry errors  

---

## 🚀 TRY IT NOW

1. **Open**: http://localhost:5174
2. **Open Console**: Press F12
3. **Select pt_501**
4. **Look for**:
   ```
   💾 DATABASE MODE: Merging static + database data for pt_501
   ```

**You should see 3 searches from PostgreSQL!** 🎉
