# CORS & Database Persistence - Troubleshooting Guide

## Current Issues

### 1. ❌ CORS Error
```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading 
the remote resource at http://localhost:3001/api/patients. 
(Reason: CORS request did not succeed). Status code: (null).
```

**Root Cause:** Database API server (port 3001) is NOT running or CORS is not configured properly.

### 2. ❌ TypeError: defaultMat.toLowerCase is not a function
```
TypeError: defaultMat.toLowerCase is not a function at line 1152
```

**Status:** ✅ **FIXED** - Added type check `typeof defaultMat === 'string'`

### 3. ❓ Patient Progress Dashboard Not Visible

**Status:** ✅ **LINK EXISTS** - Dashboard tab is already in HTML at line 56:
```html
<li data-tab="dashboardTab">Patient Progress</li>
```

**Dashboard Panel:** ✅ **EXISTS** at line 917 in index.html

## Solution Steps

### STEP 1: Start Both Servers (CRITICAL!)

The database persistence requires **TWO servers running simultaneously**:

1. **Database API Server** (port 3001) - Backend that stores patient data
2. **UI Development Server** (port 5174) - Frontend that displays the UI

#### Option A: Use the Automated Start Script (RECOMMENDED)

```bash
cd /Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22
./start-dev-environment.sh
```

This script will:
- ✅ Start API server on port 3001
- ✅ Start UI server on port 5174
- ✅ Show status and logs
- ✅ Handle cleanup on Ctrl+C

#### Option B: Manual Start (Two Terminal Windows)

**Terminal 1 - API Server:**
```bash
cd /Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/production/api
npm install  # First time only
node server.js
```

Wait for:
```
✅ API Server running on port 3001
✅ Health check: http://localhost:3001/health
```

**Terminal 2 - UI Server:**
```bash
cd /Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/development/prototypes/ui_prototype
npm install  # First time only
npm run dev
```

Wait for:
```
VITE v7.1.7 ready in XXX ms
➜  Local:   http://localhost:5174/
```

### STEP 2: Verify Servers Are Running

#### Check API Server:
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "..."
}
```

#### Check Patients Endpoint:
```bash
curl http://localhost:3001/api/patients
```

Expected response: Array of patient objects `[{id: "pt_501", ...}, ...]`

#### Check UI Server:
Open browser to: **http://localhost:5174/**

### STEP 3: Test Database Persistence

1. **Open Browser Console** (F12 or Cmd+Option+I)
2. **Watch for initialization logs:**
   ```
   🚀 Initializing application with database-first architecture...
   🔄 Attempting to load patients from database (attempt 1/3)...
   ✅ Loaded X patients from database
   ```

3. **Check Patient Selector:**
   - Patients from database have **●** prefix
   - Static patients have **○** prefix

4. **Add a Facility Search:**
   - Select a patient (preferably one with ● prefix)
   - Go to "Running Note" tab
   - Fill in Quick Update:
     - Select "Update Facility" radio button
     - Select a facility from dropdown
     - Add a reason code
     - Add a note
   - Click "Save Quick Update"

5. **Watch Console for Save Confirmation:**
   ```
   💾 Saving patient pt_XXX to database...
   ✅ Patient pt_XXX saved successfully
   ✅ Facility search saved to database for patient pt_XXX
   ```

6. **CRITICAL TEST - Refresh Page:**
   - Press **Cmd+R** (Mac) or **Ctrl+R** (Windows)
   - Watch console:
     ```
     🚀 Initializing application with database-first architecture...
     🔄 Attempting to load patients from database (attempt 1/3)...
     ✅ Loaded X patients from database
     ```
   - Select same patient
   - **Verify search still exists** ✅

### STEP 4: Access Patient Progress Dashboard

1. **Click "Patient Progress" tab** in top navigation (5th tab)
2. Should see Patient Progress Dashboard panel with:
   - Patient information header
   - Progress metrics (searches, commitments, activities)
   - Timeline visualization
   - Action buttons

**If dashboard doesn't show:**
- Check browser console for errors
- Verify `dashboardTab` is not hidden in Settings
- Click Settings gear icon (⚙) → Check "Patient Progress" is enabled

## Common Issues & Fixes

### Issue: "CORS request did not succeed"

**Diagnosis:**
```bash
# Check if API server is running
lsof -i :3001

# Should show:
# node    XXXXX user   XX   IPv6 ... TCP *:3001 (LISTEN)
```

**Fix 1:** API server not running
```bash
cd /Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/production/api
node server.js
```

**Fix 2:** CORS configuration missing UI port
Edit `production/api/server.js` line 50:
```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',  // <-- Make sure this exists
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174'   // <-- And this
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Healthcare-Context'],
  credentials: true
}));
```

### Issue: "Max retries reached. Database connection failed."

**Console shows:**
```
🔄 Attempting to load patients from database (attempt 1/3)...
⚠️ Database load failed (attempt 1): NetworkError
⏳ Retrying in 1s...
🔄 Attempting to load patients from database (attempt 2/3)...
⚠️ Database load failed (attempt 2): NetworkError
⏳ Retrying in 2s...
🔄 Attempting to load patients from database (attempt 3/3)...
⚠️ Database load failed (attempt 3): NetworkError
❌ Max retries reached. Database connection failed.
⚠️ Database load failed, starting background reconnection checks...
```

**Fix:** Start the API server (see STEP 1)

**Good News:** Background reconnection runs every 10 seconds, so once you start the API server, the app will auto-reconnect within 10 seconds and show:
```
🔄 Background: Attempting database reconnection...
✅ Background: Database reconnected successfully
```

### Issue: Facility searches still disappear after refresh

**Checklist:**
1. ✅ API server running on port 3001?
   ```bash
   curl http://localhost:3001/health
   ```

2. ✅ Console shows successful save?
   ```
   ✅ Facility search saved to database for patient pt_XXX
   ```

3. ✅ Using a patient with ● prefix? (database patient)
   - If using ○ prefix (static patient), they won't persist
   - Add patient to database first

4. ✅ Browser console shows database load on refresh?
   ```
   🔄 Attempting to load patients from database (attempt 1/3)...
   ✅ Loaded X patients from database
   ```

### Issue: TypeError defaultMat.toLowerCase

**Status:** ✅ **FIXED** in app.js line 1152

The fix added type checking:
```javascript
if (defaultMat && typeof defaultMat === 'string' && defaultMat !== 'None') {
  const matKey = defaultMat.toLowerCase();
  // ...
}
```

### Issue: Dashboard tab not visible

**Fix 1:** Check if hidden in Settings
1. Click Settings gear icon (⚙)
2. Look for "Patient Progress" checkbox
3. Make sure it's checked
4. Click "Apply Settings"

**Fix 2:** Browser cache
- Hard refresh: **Cmd+Shift+R** (Mac) or **Ctrl+Shift+R** (Windows)

**Fix 3:** Verify HTML
The tab should exist in `index.html` line 56:
```html
<li data-tab="dashboardTab">Patient Progress</li>
```

And panel should exist at line 917:
```html
<section class="dashboard-panel" id="dashboardTab" hidden>
```

## Database Architecture

### How It Works

**Before (BROKEN):**
```
Static Data → In-Memory Changes → Page Refresh → Data Lost ❌
```

**After (FIXED):**
```
Database Load → UI Display → User Changes → Save to DB → 
Page Refresh → Database Load → Data Persists ✅
```

### Data Flow for Adding Facility Search

1. **User adds search** via Quick Update
2. **`ensureFacilitySearch()`** creates search object
3. **`savePatientToDatabase()`** - Immediate save to API
4. **`reloadCurrentPatientFromDatabase()`** - Verify save
5. **UI updates** with saved data
6. **User refreshes page**
7. **`init()`** calls `loadPatientsFromDatabase()`
8. **Search loads from database** ✅

### Retry & Reconnection

**Initial Load Retry (Exponential Backoff):**
- Attempt 1: Immediate
- Attempt 2: 1 second delay
- Attempt 3: 2 second delay
- Attempt 4: 4 second delay
- After 3 retries: Start background polling

**Background Reconnection:**
- Runs every 10 seconds if database failed
- Keeps trying indefinitely
- Shows toast notification on success

**Periodic Sync:**
- Runs every 30 seconds if database connected
- Reloads current patient from database
- Keeps UI fresh with external changes

**Save Retry:**
- If save fails but database available, retry after 5 seconds
- Prevents data loss from temporary network issues

## Verification Checklist

Before testing, verify:

- [ ] ✅ API server running on port 3001
- [ ] ✅ UI server running on port 5174
- [ ] ✅ Health check responds: `curl http://localhost:3001/health`
- [ ] ✅ Patients endpoint works: `curl http://localhost:3001/api/patients`
- [ ] ✅ Browser shows: `http://localhost:5174/`
- [ ] ✅ Console shows: "✅ Loaded X patients from database"
- [ ] ✅ Patient selector shows ● prefixes
- [ ] ✅ Dashboard tab visible in navigation
- [ ] ✅ No TypeError in console

## Success Criteria

✅ **Database Persistence Working When:**
1. Add facility search
2. Console shows: "✅ Facility search saved to database"
3. Refresh page (Cmd+R)
4. Search still exists
5. No errors in console

✅ **Dashboard Visible When:**
1. Can click "Patient Progress" tab
2. Dashboard panel displays
3. Shows patient metrics and timeline

## File Locations

- **API Server:** `/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/production/api/server.js`
- **UI App:** `/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/development/prototypes/ui_prototype/src/app.js`
- **HTML:** `/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/development/prototypes/ui_prototype/index.html`
- **Start Script:** `/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/start-dev-environment.sh`

## Next Steps

1. **Run start script:**
   ```bash
   cd /Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22
   ./start-dev-environment.sh
   ```

2. **Open browser to http://localhost:5174/**

3. **Test database persistence** (see STEP 3 above)

4. **Access Patient Progress Dashboard** (5th tab)

5. **Monitor console logs** for any errors

## Need Help?

**Check logs:**
```bash
# API Server logs
tail -f /Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/api-server.log

# UI Server logs
tail -f /Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/vite-server.log
```

**Check server status:**
```bash
# API Server (should show node process on port 3001)
lsof -i :3001

# UI Server (should show node process on port 5174)
lsof -i :5174
```

**Common commands:**
```bash
# Kill servers if stuck
pkill -f "node server.js"
pkill -f "vite"

# Restart from scratch
./start-dev-environment.sh
```
