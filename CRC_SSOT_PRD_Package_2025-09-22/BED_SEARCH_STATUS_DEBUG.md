# Bed Search Status Color Change - Debugging Guide

## Problem
User reports: "still not changing the status on the bed search or anything. Not allowing to save."

## Current Status
- ✅ Persistence is working (bed searches save to database)
- ✅ Bed searches show up after refresh
- ❌ Status colors not updating when changed in drawer
- ❌ Save button not working properly

## Debugging Steps

### Step 1: Verify Servers Are Running
```bash
lsof -ti:3001,5174
```
Expected: Should return 2 PIDs (API on 3001, UI on 5174)
Current: ✅ Servers are running (PIDs: 78295, 82565, 82667)

### Step 2: Check Browser Console

Open browser DevTools (F12) and look for these messages:

#### When changing status in drawer:
- Should see: `🎨 STATUS CHANGE: Searching → Accepted for [Facility Name]` (purple)
- Should see: `💾 Saving patient pt_501 to database...` (green)
- Should see: `✅ Patient pt_501 saved successfully`

#### When rendering:
- Should see: `🎨 Rendering [Facility]: status="Accepted" → badge-accepted`

### Step 3: Check What's Happening

**Test Scenario:**
1. Open http://localhost:5174
2. Select pt_501 (💾 Dana Nguyen)
3. Find a bed search with yellow/orange "Searching" badge
4. Click "View details" to open drawer
5. Change Status dropdown from "Searching" to "Accepted"
6. Click "Save changes"

**What to observe:**
- Does the dropdown stay on "Accepted" or revert?
- Does the drawer close?
- Does a confirmation message appear?
- Does the badge color change from yellow to green?

### Step 4: Possible Issues

#### Issue A: Dropdown Reverts Immediately
**Symptom:** You select "Accepted" but it jumps back to "Searching"
**Cause:** Event listener resetting value
**Fix:** Check for change event listeners on drawerStatus

#### Issue B: Save Button Doesn't Work
**Symptom:** Nothing happens when clicking "Save changes"
**Cause:** Event listener not attached or error in persistDrawerChanges()
**Fix:** Check browser console for errors

#### Issue C: Saves But Color Doesn't Change
**Symptom:** Drawer closes, confirmation shows, but badge stays yellow
**Cause:** renderAll() not using updated patient data
**Fix:** Check if getCurrentPatient() is returning correct merged data

#### Issue D: CSS Override
**Symptom:** Status changes in data but CSS class doesn't apply color
**Cause:** CSS specificity issue or missing class
**Fix:** Inspect element to see actual classes applied

## Quick Fix to Try

If the issue is that the status changes in memory but doesn't persist to database, the problem might be the order of operations in `persistDrawerChanges()`.

### Current Flow:
1. Get patient: `const patient = getCurrentPatient()`
2. Find search in patient.searches
3. Update search.status = dom.drawerStatus.value
4. Save to database: `await savePatientToDatabase(patient)`
5. Close drawer and renderAll()

### Potential Problem:
The `patient` object from `getCurrentPatient()` is a MERGED object. When we update `search.status` on it and save, we're saving the merged object, but the transformation might not be preserving the search array correctly.

### Test This:
Add console.log right before save:
```javascript
console.log('About to save search status:', search.status);
console.log('Search object:', search);
console.log('Patient searches:', patient.searches);
```

Then check if the saved data actually has the new status.

## Current Code Locations

### Status Configuration (Lines 30-70)
- `canonicalStatusPalette` - Color definitions
- `statusConfig` - Status to color mappings
  - Searching → badge-waiting (yellow/orange)
  - Accepted → badge-accepted (green)
  - Denied → badge-denied (red)
  - NoBeds → badge-nobeds (gray)

### Drawer Functions
- `openFacilityDrawer()` - Line 2798
- `populateDrawer()` - Line 2817
- `persistDrawerChanges()` - Line 3002 (with new logging at line 3019)
- `closeFacilityDrawer()` - Line 2813

### Rendering
- `renderActiveSearches()` - Line 1173
  - Line 1184: Gets status config
  - Line 1187: Logs rendering with status and class
  - Line 1194: Applies chipClass to badge

### Merge & Transform
- `getCurrentPatient()` - Line 872 (merges static + database)
- `mergePatientData()` - Line 901 (combines searches)
- `transformPatientForDatabase()` - Line 522 (includes searches array)
- `savePatientToDatabase()` - Line 471 (saves and updates loadedPatients)

## Next Steps

1. **User Action Required:**
   - Open browser console
   - Try changing a bed search status
   - Report EXACTLY what you see in console
   - Report what happens to the dropdown and badge

2. **If no console messages appear:**
   - The save button event listener might not be attached
   - Check if drawerSave element exists

3. **If messages appear but wrong:**
   - Share the console output
   - We'll trace the exact point of failure

4. **If it works but color doesn't change:**
   - Inspect the HTML element
   - Check what CSS class is applied
   - Verify statusConfig has that status
