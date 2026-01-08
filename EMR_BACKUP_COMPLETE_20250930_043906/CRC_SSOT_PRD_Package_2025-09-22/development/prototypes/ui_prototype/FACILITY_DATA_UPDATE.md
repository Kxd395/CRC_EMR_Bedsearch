# Facility Data Update - Real CRC Facility Resource Guide Integration

**Date:** September 24, 2025  
**Source:** CRC Facility Resource Guide July 2025 (PDF) + faciliotiesList.json  
**Updated Files:** Multiple facility data files and UI components  

## Summary of Changes

### 1. **New Real Facility Data Files**

#### `/src/data/realFacilities.js`
- **Purpose:** Core facility data extracted from real CRC Facility Resource Guide
- **Count:** 15+ real Pennsylvania facilities
- **Data Points:** Services, contact info, capabilities, operational status
- **Key Features:**
  - takes302, secureBh, acuteMed capability flags
  - Phone, fax, email, address information where available
  - Service classifications (Dual Diagnosis, Detox, Rehab, etc.)
  - Current availability status and verification dates

#### `/src/data/facilityDirectory.js`
- **Purpose:** Comprehensive master directory with extended operational data
- **Features:**
  - Detailed contact information (admissions, nursing, social work)
  - Operational metrics (bed counts, average stay, accepting status)
  - Utility functions for filtering and searching facilities
  - Multiple transform functions for different UI contexts

### 2. **Updated Facility References**

#### **Commitment Panel Fixtures** (`commitmentFixtures.js`)
- **Before:** Mock facilities (Hope Ridge, City Psych, etc.)
- **After:** Real facilities from directory using `getMatchingFacilities()`
- **S1 Fixture (302):** Shows facilities accepting 302 holds (Eagleville, HUP Cedar, etc.)
- **S2 Fixture (201):** Shows non-302 facilities for voluntary commitments

#### **UI Dropdown Options** (`index.html`)
- **Before:** Mock facility names in select elements
- **After:** Real facility names from directory
- **Updated Locations:**
  - Prior Authorization facility dropdown
  - Search facility filter dropdown
  - Both now include: Eagleville, HUP Cedar, Thomas Jefferson, Pennsylvania Hospital, Malvern BH, Tower Behavioral

### 3. **Real Facilities Included**

| Facility ID | Name | Type | 302 Capable | Key Services |
|-------------|------|------|-------------|--------------|
| EAGLEVILLE | Eagleville | Treatment Center | ✅ | Dual Diagnosis, Detox, Rehab |
| HUP_CEDAR | HUP Cedar (UPenn) | University Hospital | ✅ | Full psychiatric services |
| THOMAS_JEFFERSON | Thomas Jefferson Hospital | Academic Medical | ✅ | Emergency psychiatry, 32 beds |
| PENN_HOSPITAL | Pennsylvania Hospital | General Hospital | ✅ | Crisis intervention, 24 beds |
| MALVERN_BH | Malvern Behavioral Health | Behavioral Health | ✅ | Addiction treatment, dual diagnosis |
| TOWER_BEHAVIORAL | Tower Behavioral Health | Specialized BH | ✅ | Regional behavioral health |
| BELMONT | Belmont | Psychiatric Hospital | ✅ | Dual diagnosis specialization |
| HORSHAM_CLINIC | Horsham Clinic | Psychiatric Hospital | ✅ | Inpatient/Partial programs |
| FAIRMOUNT | Fairmount | Treatment Center | ❌ | Detox and rehabilitation |

### 4. **Data Quality Improvements**

#### **Comprehensive Contact Information**
- Phone numbers: Primary, admissions, emergency lines
- Fax numbers: Including specialized departments
- Email addresses: Direct admission contact emails
- Physical addresses: Complete street addresses with zip codes

#### **Service Capability Mapping**
- **takes302:** Emergency involuntary hold capability
- **secureBh:** Secure behavioral health unit
- **acuteMed:** Acute medical stabilization
- **dualDiagnosis:** Co-occurring mental health and substance use
- **detox:** Medical detoxification services
- **rehab:** Rehabilitation programs
- **partialProgram:** Partial hospitalization
- **ect:** Electroconvulsive therapy capability

#### **Operational Status Tracking**
- **Verification dates:** How recently facility info was verified
- **Availability status:** Accepting/Limited/Call to verify
- **Bed counts:** Where available (Jefferson: 32, Penn: 24)
- **Average stay:** Typical length of stay ranges
- **Admission status:** Currently accepting new patients

### 5. **Integration Points**

#### **Commitment Panel**
- Real facilities now populate the "302-capable accepting facilities" section
- Filters apply correctly based on actual facility capabilities
- Tags reflect real services and specializations

#### **Facility Finder**
- Dropdown filters now contain real facility names
- Search results will show actual Pennsylvania facilities
- Contact information matches real facility resource guide

#### **Prior Authorization**
- PA facility selection includes real treatment centers
- Service levels reflect actual facility classifications

### 6. **Data Source Confidence**

**Source Document:** CRC Facility Resource Guide July 2025.pdf  
**Extraction Method:** OCR + manual verification  
**Data Confidence:** 94% (per faciliotiesList.json metadata)  
**Last Updated:** September 24, 2025  

**Note:** Some address/contact fields may have OCR artifacts. For production use, verify critical contact information against original PDF source.

### 7. **Testing Verification**

✅ **Commitment Panel:** Displays real facilities in both S1 and S2 scenarios  
✅ **Dropdown Filters:** Show real facility names in search and PA forms  
✅ **Data Integrity:** All facility objects have required properties  
✅ **Filtering Logic:** Correctly filters by 302 capability, security level, etc.  
✅ **UI Compatibility:** Maintains existing UI styling and functionality  

### 8. **Future Enhancements**

- **Dynamic Bed Availability:** Real-time bed count integration
- **Facility Status API:** Live operational status updates
- **Geographic Routing:** Distance-based facility recommendations
- **Insurance Verification:** Payer acceptance and authorization status
- **Quality Metrics:** Patient outcomes and satisfaction scores

---

This update transforms the CRC SSOT prototype from using mock facility data to real Pennsylvania behavioral health facilities based on the official CRC Facility Resource Guide, providing much more authentic and useful facility matching for 302 holds and voluntary psychiatric placements.