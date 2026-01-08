# 🎯 Assessment Persistence Fix Plan

## Problem Analysis

**Current State**: Bed search persistence works perfectly ✅  
**Issue**: Assessment Overview fields (ASAM, Acuity, MAT Needs, Commitment Status) are NOT saving to database ❌

## Root Cause Identified

### What's Working (Bed Search)
1. ✅ User changes bed search status via popover/drawer
2. ✅ `saveEditPopover()` or `persistDrawerChanges()` calls `savePatientToDatabase()`
3. ✅ Patient data (including searches JSONB) saves to PostgreSQL
4. ✅ On refresh, data persists

### What's Broken (Assessment)
1. ❌ User changes ASAM/Acuity/MAT/Commitment fields
2. ❌ **NO SAVE FUNCTION CALLED**
3. ❌ Fields have tracking (`setupAssessmentEditTracking()`) but tracking only sets flags
4. ❌ On refresh, changes are lost

## Architecture Review

### Assessment Data Flow

**Frontend Fields:**
- `dom.asamField` - ASAM Level dropdown
- `dom.acuity` - Medical Acuity dropdown
- `dom.matNeeds` - MAT Needs dropdown
- `dom.threeOhTwo` - Commitment Status dropdown

**Current Loading** (WORKS):
```javascript
loadAndRenderAssessment(patientId)
  → loadPatientAssessment(patientId) 
    → GET /api/patients/:id/assessments
      → Returns data from patients table (asam_level, medical_acuity, etc.)
  → Populates form fields ✅
```

**Current Saving** (BROKEN):
```javascript
User changes field
  → setupAssessmentEditTracking() sets userIsEditingAssessment = true
  → **NOTHING ELSE HAPPENS!**
  → No save call ❌
```

## The Missing Piece

Assessment fields need a save handler similar to bed search!

## Solution Options

### Option A: Save on Field Change (Immediate Save)
**Pros**: Auto-saves like modern UIs, no "Save" button needed  
**Cons**: Multiple API calls, could be chatty  
**Risk**: LOW - Bed search already working, just add similar handlers

### Option B: Save on Blur (When User Leaves Field)
**Pros**: Fewer API calls than onChange, still automatic  
**Cons**: Delay in saving  
**Risk**: LOW

### Option C: Explicit Save Button
**Pros**: User controls when to save, batches changes  
**Cons**: User might forget to save, needs UI changes  
**Risk**: MEDIUM - UI changes could affect bed search area

### **RECOMMENDED: Option A + B Hybrid**
- Save on `change` event (dropdown selection)
- Debounce to prevent multiple rapid saves
- Also save on `blur` as fallback
- NO UI changes needed
- Matches bed search pattern

## Implementation Plan

### Step 1: Create Assessment Save Function
```javascript
async function saveAssessmentFields() {
  console.log('%c💾 SAVING ASSESSMENT FIELDS', 'color: blue; font-weight: bold');
  
  const patient = getCurrentPatient();
  if (!patient) {
    console.error('No patient selected');
    return;
  }
  
  // Gather current field values
  const assessmentData = {
    asamLevel: dom.asamField?.value || null,
    medicalAcuity: dom.acuity?.value || null,
    matNeeds: dom.matNeeds?.value || null,
    commitmentStatus: dom.threeOhTwo?.value || null
  };
  
  console.log('📊 Assessment data to save:', assessmentData);
  
  // Update patient object
  if (!patient.note) patient.note = {};
  patient.note.asam = assessmentData.asamLevel;
  // Store in appropriate fields based on transformPatientForDatabase expectations
  
  // Save to database using existing persistence layer
  await savePatientToDatabase(patient);
  
  console.log('✅ Assessment saved successfully');
}
```

### Step 2: Add Change Listeners
```javascript
function setupAssessmentSaveHandlers() {
  const assessmentFields = [
    dom.asamField,
    dom.matNeeds,
    dom.threeOhTwo,
    dom.acuity
  ];
  
  assessmentFields.forEach((field) => {
    if (!field) return;
    
    // Save on change (dropdown selection)
    field.addEventListener('change', async () => {
      console.log(`🎨 Assessment field changed: ${field.id}`);
      await saveAssessmentFields();
    });
    
    // Also save on blur (when user leaves field)
    field.addEventListener('blur', async () => {
      if (userIsEditingAssessment) {
        console.log(`📝 Assessment field blurred: ${field.id}`);
        await saveAssessmentFields();
        userIsEditingAssessment = false;
      }
    });
  });
}
```

### Step 3: Update transformPatientForDatabase
Ensure assessment fields are included in database transformation:

```javascript
function transformPatientForDatabase(patient) {
  return {
    id: patient.id,
    firstName: ...,
    lastName: ...,
    mrn: ...,
    // ASSESSMENT FIELDS - ADD THESE:
    asamLevel: patient.note?.asam || patient.asamLevel || null,
    medicalAcuity: patient.medicalAcuity || patient.note?.medicalAcuity || null,
    matNeeds: patient.matNeeds || null,
    commitmentStatus: patient.commitmentStatus || null,
    // Existing fields:
    searches: patient.searches || [],
    searchHistory: patient.searchHistory || []
  };
}
```

### Step 4: Update transformPatientFromDatabase
Ensure assessment fields are extracted from database:

```javascript
function transformPatientFromDatabase(dbPatient) {
  return {
    id: dbPatient.id,
    // Existing fields...
    // ASSESSMENT FIELDS - ADD THESE:
    asamLevel: dbPatient.asam_level || dbPatient.asamLevel,
    medicalAcuity: dbPatient.medical_acuity || dbPatient.medicalAcuity,
    matNeeds: dbPatient.mat_needs || dbPatient.matNeeds,
    commitmentStatus: dbPatient.commitment_status || dbPatient.commitmentStatus,
    // ...
  };
}
```

### Step 5: Update mergePatientData
Ensure assessment fields override static data:

```javascript
function mergePatientData(staticPatient, dbPatient) {
  return {
    ...staticPatient,
    // Existing merges...
    note: {
      ...staticPatient.note,
      asam: dbPatient.asamLevel || staticPatient.note.asam,
      medicalAcuity: dbPatient.medicalAcuity || staticPatient.note.medicalAcuity,
      // ...
    },
    // Add top-level fields if needed
    medicalAcuity: dbPatient.medicalAcuity || staticPatient.medicalAcuity,
    matNeeds: dbPatient.matNeeds || staticPatient.matNeeds,
    commitmentStatus: dbPatient.commitmentStatus || staticPatient.commitmentStatus
  };
}
```

### Step 6: Call Setup in init()
```javascript
async function init() {
  cacheDom();
  populateStaticSelects();
  setupAssessmentEditTracking(); // Existing
  setupAssessmentSaveHandlers(); // NEW - Add this
  // ...rest of init
}
```

## Database Schema Check

Need to verify patients table has columns:
- `asam_level` (VARCHAR or TEXT) ✅ Already exists
- `medical_acuity` (VARCHAR or TEXT) - May need to add
- `mat_needs` (VARCHAR or TEXT) - May need to add
- `commitment_status` (VARCHAR or TEXT) - May need to add

## Risk Mitigation

### How This Won't Break Bed Search
1. **No changes to bed search code** - Only adding NEW functions
2. **Using same savePatientToDatabase()** - Proven working function
3. **Similar pattern** - Mimics popover/drawer save approach
4. **Independent event listeners** - Won't interfere with existing ones

### Testing Strategy
1. **Test bed search FIRST** - Verify still working
2. **Test assessment SECOND** - Change ASAM, refresh, verify persists
3. **Test together** - Change both, verify both persist
4. **Test console** - Should see new logging

## Expected Console Output (After Fix)

```
💾 DATABASE MODE: Merging static + database data for pt_501
🎨 Assessment field changed: asamField
📊 Assessment data to save: {asamLevel: "3.7WM", ...}
💾 SAVING ASSESSMENT FIELDS
🔄 Transforming patient pt_501...
💾 Saving patient pt_501 to database...
✅ Patient pt_501 saved successfully
✅ Assessment saved successfully
```

## Implementation Order (Safe)

1. ✅ Create assessment save function
2. ✅ Add change listeners
3. ✅ Test without database changes (may fail gracefully)
4. ✅ Update transformations
5. ✅ Verify database schema
6. ✅ Test complete flow
7. ✅ Create git restore point

## Success Criteria

- [ ] User changes ASAM → Saves to database
- [ ] User changes Acuity → Saves to database  
- [ ] User changes MAT Needs → Saves to database
- [ ] User changes Commitment → Saves to database
- [ ] Page refresh → All fields persist
- [ ] Bed search still working perfectly ✅
- [ ] Console shows save logging
- [ ] Database contains updated values

---

**Ready to implement? This is a LOW-RISK fix following the exact same pattern as the bed search fix.**
