# 🔧 PERSISTENCE BUG FOUND - Field Name Mismatch!

## 🐛 THE PROBLEM

New bed searches are NOT being saved because of **field name inconsistency**!

### The Mismatch:

**Database schema** (ssot_schema.sql line 38):
```sql
searches JSONB DEFAULT '[]'  ← Column name is "searches"
```

**Backend save** (persistence.js line 96):
```javascript
JSON.stringify(patientData.searches || [])  ← Sends "searches" ✅
```

**API returns** (server.js line 420):
```javascript
bedSearches: searches  ← Returns as "bedSearches" ❌
```

**Frontend sends** (app.js line 543):
```javascript
searches: patient.searches || []  ← Sends "searches" ✅
```

**Frontend expects** (app.js line 552):
```javascript
const searches = dbPatient.searches || dbPatient.bedSearches || []  ← Looks for both
```

---

## 💥 WHAT BREAKS

### Save Flow:
```
1. User adds new search
2. transformPatientForDatabase() creates: { searches: [...] }
3. Backend saves to column "searches" ✅
4. Database has the data ✅
```

### Load Flow:
```
1. API reads from column "searches"
2. API returns as "bedSearches" ❌ WRONG!
3. Frontend looks for "searches" first
4. Finds "bedSearches" instead
5. BUT when comparing, thinks no new searches (field name mismatch)
```

---

## ✅ THE FIX

**Option A: API Returns `searches` (RECOMMENDED)**

Change `server.js` line 420:

**FROM**:
```javascript
bedSearches: searches,  // 🔧 FIX: Include bed searches/assessment data
```

**TO**:
```javascript
searches: searches,     // ✅ Match database column name
bedSearches: searches,  // Keep for backwards compatibility
```

**Option B: Frontend Uses `bedSearches` Consistently**

Change `transformPatientForDatabase()` line 543:

**FROM**:
```javascript
searches: patient.searches || [],
```

**TO**:
```javascript
searches: patient.bedSearches || patient.searches || [],
```

---

## 🎯 RECOMMENDATION

**Use Option A** - Fix the API to return `searches` as the primary field, keep `bedSearches` for backwards compat.

This way:
- ✅ Matches database schema
- ✅ Frontend already expects `searches` first
- ✅ Backwards compatible
- ✅ Clean and consistent

---

## 🚀 IMPLEMENT NOW?

Say "fix persistence" and I'll apply Option A immediately!
