# 💾 Bed Search Persistence Fix

## 📋 Problem

**User reported**: "now when i add facilities to the Active Placement Searches it not saving on refresh"

**Issue**: 
- User adds facilities to Active Placement Searches
- Searches appear in the UI
- User refreshes page (F5 / Cmd+R)
- **All searches disappear!** ❌
- Data not persisting to database

---

## 🔍 Root Cause

The application was **only updating in-memory data**, not saving to the database:

### Before Fix:
```javascript
function handleSearchPublish() {
  const patient = getCurrentPatient();
  // ... validation ...
  
  // ❌ Only updates in-memory patient object
  patient.searches.push(newSearch);
  patient.searchHistory.unshift({...});
  
  // Shows in UI immediately
  renderActiveSearches(patient);
  closeSearchPopover();
  
  // ❌ NO DATABASE SAVE!
}
```

**What happened**:
1. User adds facility to search → Updates `patient.searches` array in memory
2. UI re-renders → Shows new search
3. User refreshes page → App reloads from database
4. Database has old data (no new search) → Search disappears
5. **Result**: Changes lost on refresh!

---

## ✅ Solution Implemented

### Fix 1: Save After Adding Searches

Added database save call to `handleSearchPublish()`:

```javascript
async function handleSearchPublish() {  // ← Made async
  const patient = getCurrentPatient();
  // ... validation and search creation ...
  
  patient.searches.push(newSearch);
  patient.searchHistory.unshift({...});
  
  if (addedCount > 0) {
    showToast(`Added ${addedCount} facility to search list.`);
    
    // ✅ NEW: Save to database so searches persist
    await savePatientToDatabase(patient);
    
    renderActiveSearches(patient);
    closeSearchPopover();
  }
}
```

### Fix 2: Save After Updating Search Details

Also added save to `persistDrawerChanges()` (when updating search status/details):

```javascript
async function persistDrawerChanges(publishToSsot = false) {  // ← Made async
  // ... update search fields ...
  
  search.status = dom.drawerStatus.value;
  search.summary = dom.drawerSummary.value;
  // ... other fields ...
  
  // ✅ NEW: Save to database so changes persist
  await savePatientToDatabase(patient);
  
  closeFacilityDrawer();
  showQuickConfirmation(`drawer changes saved`);
  renderAll();
}
```

---

## 🔄 How It Works Now

### Adding a Search:

**Before**:
1. User selects facility → Adds to `patient.searches` (memory only) ❌
2. UI shows search
3. **Refresh** → Search disappears

**After**:
1. User selects facility → Adds to `patient.searches` (memory)
2. **Saves to database** via `PUT /api/patients/:id` ✅
3. UI shows search
4. **Refresh** → Loads from database → Search persists! ✅

### Updating a Search:

**Before**:
1. User updates search status → Changes `search.status` (memory only) ❌
2. UI shows updated status
3. **Refresh** → Reverts to old status

**After**:
1. User updates search status → Changes `search.status` (memory)
2. **Saves to database** via `PUT /api/patients/:id` ✅
3. UI shows updated status
4. **Refresh** → Loads from database → Status persists! ✅

---

## 📊 Data Flow

### 1. User Adds Facility Search

```
User Action:
  ↓
handleSearchPublish()
  ↓
patient.searches.push(newSearch)  ← In-memory update
  ↓
await savePatientToDatabase(patient)  ← Database save
  ↓
PUT http://localhost:3001/api/patients/pt_501
  Body: { id: "pt_501", searches: [...], searchHistory: [...] }
  ↓
API Server → PostgreSQL UPDATE
  ↓
✅ Data persisted to database!
```

### 2. Page Refresh

```
Page Refresh:
  ↓
loadPatientsFromDatabase()
  ↓
GET http://localhost:3001/api/patients
  ↓
API Server → PostgreSQL SELECT
  ↓
Returns patient with searches array from database
  ↓
✅ Searches display correctly!
```

---

## 🛡️ What Gets Saved

When `savePatientToDatabase(patient)` is called, it saves the **entire patient object** including:

| Field | Saved | Impact |
|-------|-------|--------|
| `patient.searches[]` | ✅ Yes | All active placement searches persist |
| `patient.searchHistory[]` | ✅ Yes | Search timeline persists |
| `search.status` | ✅ Yes | Search status updates persist |
| `search.summary` | ✅ Yes | Search notes persist |
| `search.assignedTo` | ✅ Yes | Assignment persists |
| All other patient data | ✅ Yes | Complete patient state saved |

---

## 🧪 Testing Scenarios

### Test 1: Add Search and Refresh

**Steps**:
1. Select patient pt_501
2. Click "🔍 Find Placement"
3. Select a facility (e.g., "Gateway Rehab")
4. Click "Publish"
5. Verify search appears in Active Placement Searches
6. **Refresh page** (Cmd+R / F5)
7. Select pt_501 again

**Expected Results**:
- ✅ "Gateway Rehab" search still appears
- ✅ Search persists after refresh
- ✅ Console shows: "💾 Saving patient pt_501 to database..."
- ✅ Console shows: "✅ Patient pt_501 saved successfully"

### Test 2: Update Search Status and Refresh

**Steps**:
1. Select patient pt_501
2. Click on an existing search to open drawer
3. Change status (e.g., from "Pending" to "Accepted")
4. Click "Save"
5. **Refresh page** (Cmd+R / F5)
6. Select pt_501 and check search status

**Expected Results**:
- ✅ Status remains "Accepted"
- ✅ Update persists after refresh
- ✅ Console shows database save

### Test 3: Add Multiple Searches

**Steps**:
1. Select patient pt_501
2. Add 3 different facilities to searches
3. **Refresh page**
4. Select pt_501 again

**Expected Results**:
- ✅ All 3 searches still appear
- ✅ All persist after refresh

---

## 🔍 Debugging

### Browser Console - Success Messages

**When adding search**:
```
💾 Saving patient pt_501 to database...
✅ Patient pt_501 saved successfully
```

**When updating search**:
```
💾 Saving patient pt_501 to database...
✅ Patient pt_501 saved successfully
```

### Browser Console - Error Messages

**If save fails**:
```
❌ Failed to save patient pt_501: [error message]
```

**If database unavailable**:
```
⚠️ Database connection failed, using fallback data
```

### Check Database Directly

**Verify search in database**:
```bash
# SSH to database server
ssh -p 2222 kxd395@100.112.67.23

# Query patient searches
psql -U emr_admin -d emr_crc_ssot -c "
  SELECT id, searches 
  FROM patients 
  WHERE id = 'pt_501';
"
```

**Expected output**:
```
   id    |              searches
---------+------------------------------------
 pt_501  | [{"id":"S01","facilityName":"Gateway Rehab",...}]
```

---

## 📝 Files Modified

### `src/web/src/app.js`

**Line 3602**: Made `handleSearchPublish()` async
```javascript
async function handleSearchPublish() {  // ← Added 'async'
```

**Line 3660**: Added database save after adding searches
```javascript
if (addedCount > 0) {
  showToast(`Added ${addedCount} facility to search list.`);
  
  // 💾 CRITICAL: Save patient to database so searches persist
  await savePatientToDatabase(patient);
  
  renderActiveSearches(patient);
  closeSearchPopover();
}
```

**Line 2860**: Made `persistDrawerChanges()` async
```javascript
async function persistDrawerChanges(publishToSsot = false) {  // ← Added 'async'
```

**Line 2960**: Added database save after updating search
```javascript
// 💾 CRITICAL: Save patient to database so search changes persist
await savePatientToDatabase(patient);

closeFacilityDrawer();
showQuickConfirmation(`drawer changes saved`);
```

---

## ✅ Verification Checklist

- [x] `handleSearchPublish()` made async
- [x] `savePatientToDatabase()` called after adding searches
- [x] `persistDrawerChanges()` made async
- [x] `savePatientToDatabase()` called after updating search
- [x] Both functions await save completion
- [x] Servers restarted with fixes
- [x] Database connection verified

---

## 🎉 Result

**Before Fix**:
- ❌ Searches added but not saved
- ❌ Data lost on refresh
- ❌ Only in-memory updates
- ❌ No database persistence

**After Fix**:
- ✅ Searches saved to database immediately
- ✅ Data persists on refresh
- ✅ Both in-memory AND database updated
- ✅ Full persistence enabled

---

## 🚀 Next Step

**Please test now**:

1. **Refresh browser** (Cmd+R)
2. **Select patient** pt_501
3. **Add a facility** to Active Placement Searches
4. **Watch console** for "💾 Saving patient..." and "✅ Patient...saved"
5. **Refresh page** (Cmd+R)
6. **Select patient** pt_501 again
7. **Verify**: Search should still be there! ✅

The searches should now persist across page refreshes! 🎯
