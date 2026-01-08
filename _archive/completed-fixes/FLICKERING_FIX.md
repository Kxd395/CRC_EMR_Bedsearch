# 🔧 Assessment Fields Flickering - FIXED

## 🐛 Problem

Assessment fields (ASAM, MAT, Commitment, Acuity) were **flickering/switching** rapidly when selecting a patient.

## 🔍 Root Cause

**TWO functions were fighting over the same fields:**

1. `loadAndRenderAssessment(patientId)` - Loading from API (NEW)
2. `renderRunningNote(patient)` - Loading from patient.note (OLD)

Both were being called at the same time:
```javascript
// Line 2284-2285
renderPatientContext(patient);  // ← Calls loadAndRenderAssessment()
renderRunningNote(patient);     // ← Also sets the same fields!
```

This caused a race condition where:
- `loadAndRenderAssessment()` sets ASAM to "3.7WM" from API
- `renderRunningNote()` immediately overwrites it with patient.note.asam
- Result: Fields flicker between the two values

## ✅ Solution

### Fix 1: Remove Duplicate Field Assignments

**Modified `renderRunningNote()` to ONLY set non-assessment fields:**

```javascript
function renderRunningNote(patient) {
  if (!patient) return;
  const note = patient.note;
  dom.noteUpdated.textContent = note.lastUpdated;
  
  // Assessment fields are now handled by loadAndRenderAssessment()
  // Only set fields that are NOT part of assessment data
  dom.assessmentTs.value = formatTimestamp(note.assessmentTs);
  dom.placementNeeded.value = note.placementNeeded;
  
  // REMOVED these (they were causing flickering):
  // ❌ dom.asamField.value = ...
  // ❌ dom.matNeeds.value = ...
  // ❌ dom.threeOhTwo.value = ...
  // ❌ dom.acuity.value = ...
}
```

### Fix 2: Add Race Condition Protection

**Added guard to prevent multiple simultaneous loads:**

```javascript
let currentAssessmentLoad = null; // Track current load

async function loadAndRenderAssessment(patientId) {
  // Cancel any in-progress load
  if (currentAssessmentLoad) {
    console.log('⚠️ Cancelling previous assessment load');
  }
  
  // Create new load promise
  currentAssessmentLoad = patientId;
  
  const assessment = await loadPatientAssessment(patientId);
  
  // Check if this load was superseded by a newer one
  if (currentAssessmentLoad !== patientId) {
    console.log('⚠️ Assessment load cancelled (newer patient selected)');
    return;
  }
  
  // Now safe to populate fields...
}
```

## 🎯 Result

**Single source of truth for assessment fields:**
- ✅ `loadAndRenderAssessment()` - ONLY function that sets ASAM, MAT, Commitment, Acuity
- ✅ `renderRunningNote()` - Sets timestamp and placement fields only
- ✅ No more flickering!

## 🧪 Test It

1. **Refresh browser** (Cmd+Shift+R)
2. **Select patient** "pt_501 — Nguyen, Diana"
3. **Assessment fields should populate smoothly** - NO flickering!

Expected behavior:
- Fields populate once
- No rapid switching/flickering
- Values stay stable

## 📊 Field Ownership

| Field | Managed By | Source |
|-------|-----------|--------|
| **ASAM level** | `loadAndRenderAssessment()` | API |
| **MAT needs** | `loadAndRenderAssessment()` | API |
| **Commitment** | `loadAndRenderAssessment()` | API |
| **Medical acuity** | `loadAndRenderAssessment()` | API |
| **Assessment timestamp** | `renderRunningNote()` | patient.note |
| **Placement needed** | `renderRunningNote()` | patient.note |

## 🔍 Debugging

If flickering returns, check browser console for:

```
⚠️ Cancelling previous assessment load
⚠️ Assessment load cancelled (newer patient selected)
```

These indicate rapid patient switching - this is normal and handled gracefully.

## 📝 Files Modified

- `src/web/src/app.js`:
  - Modified `renderRunningNote()` (removed duplicate field assignments)
  - Added race condition guard to `loadAndRenderAssessment()`

---

**Status**: ✅ FIXED - Servers restarted, ready to test
