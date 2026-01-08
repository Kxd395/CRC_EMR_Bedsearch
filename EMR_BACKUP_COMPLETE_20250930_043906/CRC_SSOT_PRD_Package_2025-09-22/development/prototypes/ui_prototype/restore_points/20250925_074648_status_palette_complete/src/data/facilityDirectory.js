// Comprehensive Facility Directory - Based on CRC Facility Resource Guide July 2025
// This serves as the master directory for all facility-related data in the CRC SSOT system

// Extended facility directory with additional operational data
export const facilityDirectory = [
  {
    id: 'BELMONT',
    name: 'Belmont',
    category: 'Psychiatric Hospital',
    level: 'Inpatient Psychiatric',
    address: null,
    city: null,
    state: 'PA',
    zip: null,
    phone: '(215) 581-3980',
    fax: '(215) 581-3890',
    email: null,
    website: null,
    services: ['Dual Diagnosis', 'Inpatient Psychiatric Hospital'],
    capabilities: {
      takes302: true,
      secureBh: true,
      acuteMed: false,
      dualDiagnosis: true,
      detox: false,
      rehab: false,
      partialProgram: false,
      ect: false
    },
    operationalData: {
      verified: 'Verified 1w',
      availability: 'Call to verify',
      lastUpdate: '2025-09-24',
      bedCount: null,
      acceptingAdmissions: null,
      averageStay: null
    },
    contacts: {
      admissions: '(215) 581-3980',
      nursing: null,
      socialWork: null,
      medical: null
    },
    notes: 'Specializes in dual diagnosis treatment',
    tags: ['Dual Diagnosis', 'Psychiatric Hospital']
  },
  {
    id: 'EAGLEVILLE',
    name: 'Eagleville',
    category: 'Treatment Center',
    level: '3.7/4.0',
    address: '100 Eagleville Rd',
    city: 'Norristown',
    state: 'PA',
    zip: '19403',
    phone: '(610) 539-6000',
    fax: '(610) 539-7624',
    email: 'admissions@eagleville.org',
    website: null,
    services: ['Dual Diagnosis', 'Co-Occurring Disorders', 'Detox (3.7 & 4.0)', 'Rehab (3.5 & 4.0)', 'Inpatient Psychiatric Hospital'],
    capabilities: {
      takes302: true,
      secureBh: true,
      acuteMed: true,
      dualDiagnosis: true,
      detox: true,
      rehab: true,
      partialProgram: true,
      ect: false
    },
    operationalData: {
      verified: 'Verified 2d',
      availability: 'Accepting',
      lastUpdate: '2025-09-24',
      bedCount: null,
      acceptingAdmissions: true,
      averageStay: '7-14 days'
    },
    contacts: {
      admissions: 'admissions@eagleville.org',
      nursing: null,
      socialWork: null,
      medical: null
    },
    notes: 'Comprehensive dual diagnosis and addiction treatment',
    tags: ['TAKES_302', 'Dual Diagnosis', 'Detox', 'Rehab']
  },
  {
    id: 'FAIRMOUNT',
    name: 'Fairmount',
    category: 'Treatment Center',
    level: '3.7/3.5',
    address: '561 Fairthorne Ave.',
    city: 'Philadelphia',
    state: 'PA',
    zip: '19128',
    phone: '(215) 487-4100',
    fax: '(215) 487-7396',
    email: null,
    website: null,
    services: ['Dual Diagnosis', 'Detox (3.7)', 'Rehab (3.5)'],
    capabilities: {
      takes302: false,
      secureBh: false,
      acuteMed: false,
      dualDiagnosis: true,
      detox: true,
      rehab: true,
      partialProgram: false,
      ect: false
    },
    operationalData: {
      verified: 'Verified 3d',
      availability: 'Limited',
      lastUpdate: '2025-09-24',
      bedCount: null,
      acceptingAdmissions: false,
      averageStay: null
    },
    contacts: {
      admissions: '(215) 487-4100',
      nursing: null,
      socialWork: null,
      medical: null
    },
    notes: 'Dual diagnosis with detox and rehabilitation services',
    tags: ['Dual Diagnosis', 'Detox', 'Rehab']
  },
  {
    id: 'HORSHAM_CLINIC',
    name: 'Horsham Clinic',
    category: 'Psychiatric Hospital',
    level: 'Inpatient/Partial',
    address: '722 Butler Pike',
    city: 'Ambler',
    state: 'PA',
    zip: '19002',
    phone: null,
    fax: '(215) 654-1148',
    email: null,
    website: null,
    services: ['Dual Diagnosis (Horsham listed)', 'Inpatient/Partial program (Horsham Clinic)'],
    capabilities: {
      takes302: true,
      secureBh: true,
      acuteMed: false,
      dualDiagnosis: true,
      detox: false,
      rehab: false,
      partialProgram: true,
      ect: false
    },
    operationalData: {
      verified: 'Verified 1d',
      availability: 'Call to verify',
      lastUpdate: '2025-09-24',
      bedCount: null,
      acceptingAdmissions: null,
      averageStay: null
    },
    contacts: {
      admissions: '(215) 654-1148',
      partialProgram: '(215) 643-6014',
      nursing: null,
      socialWork: null,
      medical: null
    },
    notes: 'Separate admission fax numbers for inpatient vs partial program',
    tags: ['Dual Diagnosis', 'Inpatient', 'Partial Program']
  },
  {
    id: 'HUP_CEDAR',
    name: 'HUP Cedar (Hospital of the University of Pennsylvania)',
    category: 'University Hospital',
    level: '3.7/4.0/3.5',
    address: 'Cedar Ave.',
    city: 'Philadelphia',
    state: 'PA',
    zip: null,
    phone: null,
    fax: null,
    email: null,
    website: null,
    services: ['Dual Diagnosis', 'Detox (3.7 & 4.0)', 'Rehab (3.5)', 'Inpatient Psychiatric Hospital'],
    capabilities: {
      takes302: true,
      secureBh: true,
      acuteMed: true,
      dualDiagnosis: true,
      detox: true,
      rehab: true,
      partialProgram: false,
      ect: true
    },
    operationalData: {
      verified: 'Verified 1d',
      availability: 'Accepting',
      lastUpdate: '2025-09-24',
      bedCount: null,
      acceptingAdmissions: true,
      averageStay: '5-10 days'
    },
    contacts: {
      admissions: null,
      nursing: null,
      socialWork: null,
      medical: null
    },
    notes: 'University hospital with comprehensive psychiatric services',
    tags: ['TAKES_302', 'University Hospital', 'Dual Diagnosis', 'Detox', 'Rehab']
  },
  {
    id: 'THOMAS_JEFFERSON',
    name: 'Thomas Jefferson Hospital',
    category: 'University Hospital',
    level: 'Academic Medical Center',
    address: '833 Chestnut St.',
    city: 'Philadelphia',
    state: 'PA',
    zip: '19107',
    phone: '(215) 890-6277',
    fax: '(215) 503-2823',
    email: null,
    website: null,
    services: ['Emergency Psychiatry', 'Inpatient Psychiatric', 'Consultation-Liaison'],
    capabilities: {
      takes302: true,
      secureBh: true,
      acuteMed: true,
      dualDiagnosis: true,
      detox: true,
      rehab: false,
      partialProgram: true,
      ect: true
    },
    operationalData: {
      verified: 'Verified 1d',
      availability: 'Accepting',
      lastUpdate: '2025-09-24',
      bedCount: 32,
      acceptingAdmissions: true,
      averageStay: '4-7 days'
    },
    contacts: {
      admissions: '(215) 890-6277',
      emergency: '(215) 955-6000',
      nursing: null,
      socialWork: '(215) 890-6280',
      medical: '(215) 890-6277'
    },
    notes: 'Jefferson Health flagship hospital with comprehensive psychiatric emergency services',
    tags: ['TAKES_302', 'Jefferson Health', 'University Hospital', 'Emergency Psychiatry']
  },
  {
    id: 'PENN_HOSPITAL',
    name: 'Pennsylvania Hospital',
    category: 'Hospital',
    level: 'General Hospital',
    address: '800 Spruce St.',
    city: 'Philadelphia',
    state: 'PA',
    zip: '19107',
    phone: '(215) 829-3000',
    fax: null,
    email: null,
    website: null,
    services: ['Emergency Psychiatry', 'Inpatient Psychiatric', 'Crisis Intervention'],
    capabilities: {
      takes302: true,
      secureBh: true,
      acuteMed: true,
      dualDiagnosis: true,
      detox: false,
      rehab: false,
      partialProgram: false,
      ect: false
    },
    operationalData: {
      verified: 'Verified 1d',
      availability: 'Accepting',
      lastUpdate: '2025-09-24',
      bedCount: 24,
      acceptingAdmissions: true,
      averageStay: '3-5 days'
    },
    contacts: {
      admissions: '(215) 829-3000',
      emergency: '(215) 829-3000',
      nursing: null,
      socialWork: null,
      medical: null
    },
    notes: 'Historic hospital with psychiatric emergency services',
    tags: ['TAKES_302', 'Hospital', 'Psychiatric Services', 'Emergency']
  },
  {
    id: 'MALVERN_BH',
    name: 'Malvern Behavioral Health',
    category: 'Behavioral Health Center',
    level: 'Specialized Behavioral Health',
    address: '1930 South Broad St.',
    city: 'Philadelphia',
    state: 'PA',
    zip: null,
    phone: '(610) 480-8919',
    fax: '(484) 329-6299',
    email: 'MTCSouthPhila_Admissions@malverntreatment.com',
    website: null,
    services: ['Addiction Treatment', 'Mental Health', 'Dual Diagnosis'],
    capabilities: {
      takes302: true,
      secureBh: true,
      acuteMed: false,
      dualDiagnosis: true,
      detox: true,
      rehab: true,
      partialProgram: true,
      ect: false
    },
    operationalData: {
      verified: 'Verified 1d',
      availability: 'Accepting',
      lastUpdate: '2025-09-24',
      bedCount: null,
      acceptingAdmissions: true,
      averageStay: '7-21 days'
    },
    contacts: {
      admissions: 'MTCSouthPhila_Admissions@malverntreatment.com',
      phone: '(610) 480-8919',
      nursing: null,
      socialWork: null,
      medical: null
    },
    notes: 'Specialized behavioral health and addiction treatment center',
    tags: ['Behavioral Health', 'Treatment Center', 'Dual Diagnosis']
  },
  {
    id: 'TOWER_BEHAVIORAL',
    name: 'Tower Behavioral Health',
    category: 'Behavioral Health Hospital',
    level: 'Specialized Behavioral Health',
    address: '201 Wellness Way',
    city: 'Reading',
    state: 'PA',
    zip: '19605',
    phone: '(484) 659-2300',
    fax: '(610) 374-1619',
    email: null,
    website: null,
    services: ['Inpatient Psychiatric', 'Partial Hospitalization', 'Intensive Outpatient'],
    capabilities: {
      takes302: true,
      secureBh: true,
      acuteMed: false,
      dualDiagnosis: true,
      detox: false,
      rehab: false,
      partialProgram: true,
      ect: false
    },
    operationalData: {
      verified: 'Verified 3d',
      availability: 'Limited',
      lastUpdate: '2025-09-24',
      bedCount: null,
      acceptingAdmissions: false,
      averageStay: null
    },
    contacts: {
      admissions: '(484) 659-2300',
      nursing: null,
      socialWork: null,
      medical: null
    },
    notes: 'Specialized behavioral health facility serving Berks County region',
    tags: ['TAKES_302', 'Behavioral Health', 'Specialized', 'Regional']
  }
];

// Utility functions for facility operations
export const getFacilityById = (id) => 
  facilityDirectory.find(f => f.id === id);

export const getFacilitiesByCapability = (capability) =>
  facilityDirectory.filter(f => f.capabilities[capability] === true);

export const getFacilitiesByAvailability = (availability) =>
  facilityDirectory.filter(f => f.operationalData.availability === availability);

export const getFacilitiesByCity = (city) =>
  facilityDirectory.filter(f => f.city?.toLowerCase() === city.toLowerCase());

export const getAccepting302Facilities = () =>
  facilityDirectory.filter(f => 
    f.capabilities.takes302 && 
    f.operationalData.acceptingAdmissions !== false
  );

export const searchFacilities = (query) => {
  const lowerQuery = query.toLowerCase();
  return facilityDirectory.filter(f => 
    f.name.toLowerCase().includes(lowerQuery) ||
    f.services.some(s => s.toLowerCase().includes(lowerQuery)) ||
    f.tags.some(t => t.toLowerCase().includes(lowerQuery))
  );
};

// Transform facility data for different UI components
export const transformForDropdown = (facility) => ({
  value: facility.id,
  label: facility.name,
  category: facility.category
});

export const transformForCommitmentPanel = (facility) => ({
  id: facility.id,
  name: facility.name,
  level: facility.level,
  verified: facility.operationalData.verified,
  tags: facility.tags.slice(0, 3),
  selected: false
});

export const transformForFacilityFinder = (facility) => ({
  id: facility.id,
  name: facility.name,
  category: facility.category,
  level: facility.level,
  address: facility.address ? `${facility.address}, ${facility.city}, ${facility.state} ${facility.zip || ''}`.trim() : null,
  phone: facility.phone,
  email: facility.email,
  services: facility.services,
  capabilities: facility.capabilities,
  availability: facility.operationalData.availability,
  bedCount: facility.operationalData.bedCount,
  verified: facility.operationalData.verified,
  notes: facility.notes
});

export default facilityDirectory;