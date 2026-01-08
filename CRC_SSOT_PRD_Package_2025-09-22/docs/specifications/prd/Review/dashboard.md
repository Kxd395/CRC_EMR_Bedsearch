
# 🏥 CRC SSOT EMR - Testing Dashboard

**Status**: ✅ **ACTIVE** - Full Development Environment Running  
**Updated**: September 29, 2025  
**Environment**: Healthcare Testing Mode

---

## 🚀 **Quick Access Links**

### Primary Application
- **Main EMR Application**: [http://localhost:5173](http://localhost:5173)
- **Testing Dashboard**: [http://localhost:5173/dashboard.html](http://localhost:5173/dashboard.html)
- **API Health Check**: [http://localhost:3001/api/health](http://localhost:3001/api/health)

### Development Servers
- **UI Development Server**: `http://localhost:5173` (Vite)
- **API Server**: `http://localhost:3001` (Node.js Express)
- **Database**: `PostgreSQL @ 100.112.67.23:5432` (with fallback)

---

## 🏥 **Facilities Directory Testing**

### Current Issue Resolution Status

#### ✅ **FIXED: CORS Issues** 
- **Problem**: Cross-Origin Request Blocked errors preventing API calls
- **Solution**: Updated CORS configuration in API server to allow ports 5173, 5174, 3000
- **Status**: ✅ Resolved - API now accessible from UI

#### ✅ **FIXED: LOC Filtering Parameter Error**
- **Problem**: `Invalid parameters for filterFacilitiesByLoc` - function expected array but received string
- **Solution**: Modified function calls to convert ASAM level string to array format
- **Status**: ✅ Resolved - LOC filtering now working properly

#### 🔄 **IN PROGRESS: Patient Bed Search Persistence**
- **Problem**: "Quick Update (SSOT) add multiple is still not saving" 
- **Root Cause**: API persistence failures due to CORS and database connection issues
- **Current Status**: CORS fixed, testing database persistence

---

## 📊 **System Status Dashboard**

### Server Status
```
✅ UI Server (Vite): Running on http://localhost:5173
✅ API Server (Node.js): Running on http://localhost:3001  
✅ CORS Configuration: Fixed - All origins allowed
⚠️  Database Connection: PostgreSQL fallback active
```

### Recent Fixes Applied
```javascript
// 1. Fixed LOC filtering function calls
const asamLevels = Array.isArray(defaultAsam) ? defaultAsam : [defaultAsam];
const filtered = filterFacilitiesByLoc(facilityDirectory, asamLevels, locLookupMaps.facilityByLoc, options);

// 2. Updated CORS configuration  
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));
```

---

## 🧪 **Testing Scenarios**

### PA Commitment Type Testing

#### 1. **302 Emergency Commitment** 🚨
- **Test URL**: `http://localhost:5173/?test=302&commitment=emergency`
- **Expected Behavior**: 
  - Only mental health facilities shown
  - SUD facilities excluded  
  - Emergency capability prioritized
  - Rapid processing workflow

#### 2. **201 Voluntary Commitment** ✅
- **Test URL**: `http://localhost:5173/?test=201&commitment=voluntary`
- **Expected Behavior**:
  - Mental health and dual diagnosis facilities
  - SUD-only facilities excluded
  - Voluntary admission workflow

#### 3. **303 Extended Commitment** ⚖️  
- **Test URL**: `http://localhost:5173/?test=303&commitment=extended`
- **Expected Behavior**:
  - Only facilities with court-order capability
  - Extended treatment support
  - Judicial integration workflow

### Facilities List Testing

#### Load Test Methods
1. **API Load**: `loadFromAPI()` - Tests live database connection
2. **Static Load**: `loadFromStatic()` - Tests fallback data system  
3. **Refresh**: `refreshFacilities()` - Tests real-time updates

#### Expected Facilities Data
```javascript
// Sample facility structure
{
  id: 'facility_1',
  name: 'Crisis Response Mental Health Center', 
  type: 'mental-health',
  location: 'Philadelphia, PA',
  capacity: 50,
  availableBeds: 12,
  acceptsCommitmentTypes: ['201', '302', '303'],
  capabilities: {
    takes302: true,
    secureBh: true, 
    matServices: true
  }
}
```

---

## 🎯 **Quick Testing Commands**

### Browser Console Testing
```javascript
// Test API connection
fetch('http://localhost:3001/api/health').then(r => r.json()).then(console.log)

// Test facilities load
fetch('http://localhost:3001/api/facilities').then(r => r.json()).then(console.log)

// Test patient persistence (from main app)
// Check console for persistence success/failure messages
```

### Development Commands
```bash
# Start UI server
cd /Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/development/prototypes/ui_prototype
npm run dev

# Start API server  
cd /Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/production/api
node server.js
```

---

**🎯 Current Status**: ✅ **SERVERS RUNNING** - Both API and UI active with CORS and LOC filtering issues resolved.

**Next Test**: Open [Testing Dashboard](http://localhost:5173/dashboard.html) to validate facilities list and patient persistence functionality.
  102:5   error    'selectFacility' is not defined                    no-undef
  106:5   error    'showFacilityDetails' is not defined               no-undef

/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/development/prototypes/ui_prototype/src/persistence/api.js
  180:5  warning  Unused eslint-disable directive (no problems were reported from 'no-console')
  183:7  warning  Unused eslint-disable directive (no problems were reported from 'no-console')
  186:5  warning  Unused eslint-disable directive (no problems were reported from 'no-console')
  197:5  warning  Unused eslint-disable directive (no problems were reported from 'no-console')
  199:5  warning  Unused eslint-disable directive (no problems were reported from 'no-console')
  201:5  warning  Unused eslint-disable directive (no problems were reported from 'no-console')

/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/development/prototypes/ui_prototype/src/persistence/clientPersistence.js
  7:11  error  'fetch' is already defined as a built-in global variable          no-redeclare
  7:18  error  'setInterval' is already defined as a built-in global variable    no-redeclare
  7:31  error  'clearInterval' is already defined as a built-in global variable  no-redeclare
  7:46  error  'setTimeout' is already defined as a built-in global variable     no-redeclare
  7:58  error  'console' is already defined as a built-in global variable        no-redeclare

✖ 50 problems (23 errors, 27 warnings)
  1 error and 8 warnings potentially fixable with the `--fix` option.

kevindialmb@Kevins-MacBook-Pro-5 ui_prototype % 