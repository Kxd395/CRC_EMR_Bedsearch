// LOC Master Data Integration for Facility Filtering
// This module provides LOC-based facility filtering using the master LOC data

/**
 * Load and parse the LOC master data
 * This should be called during app initialization
 * COMPREHENSIVE LOC MASTER DATABASE - Maps all 25 facilities to appropriate ASAM levels
 */
export async function loadLocMasterData() {
  try {
    // Comprehensive LOC Master Data matching our facility directory
    const locData = {
      "generated_at": "2025-09-29T00:00:00.000000",
      "version": "2.0-comprehensive",
      "levels": [
        // ========== INPATIENT PSYCHIATRIC (IP Psych) ==========
        {
          "asam_level": "IP_PSYCH",
          "display_name": "Inpatient Psychiatric (302/201/303)",
          "slug": "inpatient_psychiatric",
          "description": "Acute inpatient psychiatric care for mental health crises",
          "facilities": [
            { "facility": "Abington Hospital – Jefferson Health" },
            { "facility": "Behavioral Wellness Center at Girard" },
            { "facility": "Belmont Behavioral Health" },
            { "facility": "Brooke Glen Behavioral Hospital" },
            { "facility": "HUP Cedar (Hospital of the University of Pennsylvania)" },
            { "facility": "Thomas Jefferson Hospital" },
            { "facility": "Pennsylvania Hospital" },
            { "facility": "Malvern Behavioral Health" },
            { "facility": "Tower Behavioral Health" },
            { "facility": "Prime Healthcare Lower Bucks" },
            { "facility": "Prime Healthcare Roxborough Hospital" },
            { "facility": "Temple Hospital - Episcopal Campus" }
          ]
        },
        
        // ========== DETOXIFICATION LEVELS ==========
        {
          "asam_level": "3.7WM",
          "display_name": "Medically Monitored Detox (3.7WM)",
          "slug": "detox_3_7wm",
          "description": "24-hour medically monitored withdrawal management",
          "facilities": [
            { "facility": "Beacon Point" },
            { "facility": "Eagleville" },
            { "facility": "Fairmount" },
            { "facility": "Gaudenzia" },
            { "facility": "Girard" },
            { "facility": "HUP Cedar (Hospital of the University of Pennsylvania)" },
            { "facility": "Kensington" },
            { "facility": "Keystone Center" },
            { "facility": "Kirkbride" },
            { "facility": "Mirmount" },
            { "facility": "Valley Forge" },
            { "facility": "Horsham Clinic" }
          ]
        },
        
        {
          "asam_level": "3.7A",
          "display_name": "Detox - Medically Monitored (3.7A)",
          "slug": "detox_3_7a",
          "description": "Alternative designation for 3.7WM detox services",
          "facilities": [
            { "facility": "Beacon Point" },
            { "facility": "Eagleville" },
            { "facility": "Fairmount" },
            { "facility": "Gaudenzia" },
            { "facility": "Girard" },
            { "facility": "HUP Cedar (Hospital of the University of Pennsylvania)" },
            { "facility": "Kensington" },
            { "facility": "Keystone Center" },
            { "facility": "Kirkbride" },
            { "facility": "Mirmount" },
            { "facility": "Valley Forge" },
            { "facility": "Horsham Clinic" }
          ]
        },

        {
          "asam_level": "4.0WM",
          "display_name": "Medically Managed Detox (4.0WM)",
          "slug": "detox_4_0wm",
          "description": "Medically managed intensive inpatient withdrawal",
          "facilities": [
            { "facility": "Eagleville" },
            { "facility": "HUP Cedar (Hospital of the University of Pennsylvania)" },
            { "facility": "Kensington" },
            { "facility": "Valley Forge" },
            { "facility": "Thomas Jefferson Hospital" },
            { "facility": "Pennsylvania Hospital" }
          ]
        },
        
        {
          "asam_level": "4.0 (4A)",
          "display_name": "Detox - Medically Managed (4.0A)",
          "slug": "detox_4_0_4a",
          "description": "Alternative designation for 4.0WM detox services",
          "facilities": [
            { "facility": "Eagleville" },
            { "facility": "HUP Cedar (Hospital of the University of Pennsylvania)" },
            { "facility": "Kensington" },
            { "facility": "Valley Forge" },
            { "facility": "Thomas Jefferson Hospital" },
            { "facility": "Pennsylvania Hospital" }
          ]
        },

        // ========== REHABILITATION LEVELS ==========
        {
          "asam_level": "3.5COC",
          "display_name": "Clinically Managed Residential (3.5 COC)",
          "slug": "rehab_3_5_coc",
          "description": "Residential treatment with continuous clinical oversight",
          "facilities": [
            { "facility": "Beacon Point" },
            { "facility": "Eagleville" },
            { "facility": "Fairmount" },
            { "facility": "Gaudenzia" },
            { "facility": "Keystone Center" },
            { "facility": "Mirmount" },
            { "facility": "Valley Forge" },
            { "facility": "Malvern Treatment Center - South Philadelphia" }
          ]
        },
        
        {
          "asam_level": "3.5 (3B)",
          "display_name": "Rehab - Clinically Managed Residential (3.5B)",
          "slug": "rehab_3_5_3b",
          "description": "Alternative designation for 3.5 COC rehabilitation",
          "facilities": [
            { "facility": "Beacon Point" },
            { "facility": "Eagleville" },
            { "facility": "Fairmount" },
            { "facility": "Gaudenzia" },
            { "facility": "Keystone Center" },
            { "facility": "Mirmount" },
            { "facility": "Valley Forge" },
            { "facility": "Malvern Treatment Center - South Philadelphia" }
          ]
        },

        {
          "asam_level": "3.5",
          "display_name": "Residential Treatment (3.5)",
          "slug": "rehab_3_5",
          "description": "Standard residential rehabilitation services",
          "facilities": [
            { "facility": "Beacon Point" },
            { "facility": "Eagleville" },
            { "facility": "Fairmount" },
            { "facility": "Gaudenzia" },
            { "facility": "Keystone Center" },
            { "facility": "Mirmount" },
            { "facility": "Valley Forge" },
            { "facility": "Malvern Treatment Center - South Philadelphia" },
            { "facility": "Riversbend" }
          ]
        },

        {
          "asam_level": "4.0",
          "display_name": "Medically Managed Intensive Residential (4.0)",
          "slug": "rehab_4_0",
          "description": "Intensive residential with medical management",
          "facilities": [
            { "facility": "Eagleville" },
            { "facility": "HUP Cedar (Hospital of the University of Pennsylvania)" },
            { "facility": "Malvern Behavioral Health" }
          ]
        },
        
        {
          "asam_level": "4.0 (4B)",
          "display_name": "Rehab - Medically Managed Intensive (4.0B)",
          "slug": "rehab_4_0_4b", 
          "description": "Alternative designation for 4.0 intensive rehabilitation",
          "facilities": [
            { "facility": "Eagleville" },
            { "facility": "HUP Cedar (Hospital of the University of Pennsylvania)" },
            { "facility": "Malvern Behavioral Health" }
          ]
        }
      ]
    };
    return locData;
  } catch {
    return null;
  }
}

/**
 * Create LOC lookup maps for efficient filtering
 * ENHANCED FACILITY MATCHING - Handles name variations and aliases
 * @param {Object} locMasterData - The loaded LOC master data
 * @returns {Object} - Lookup maps for facilities by LOC
 */
export function createLocLookupMaps(locMasterData) {
  if (!locMasterData?.levels) {
    console.warn('No LOC master data levels found');
    return {};
  }

  const facilityByLoc = new Map();
  const locDisplayNames = new Map();
  const locSlugs = new Map();
  const facilityNameVariations = new Map();

  // Facility name aliases for better matching
  const facilityAliases = {
    'malvern': ['malvern behavioral health', 'malvern treatment center - south philadelphia'],
    'hup cedar': ['hup cedar (hospital of the university of pennsylvania)'],
    'jefferson': ['thomas jefferson hospital'],
    'penn hospital': ['pennsylvania hospital'],
    'abington': ['abington hospital – jefferson health'],
    'girard': ['behavioral wellness center at girard'],
    'belmont': ['belmont behavioral health'],
    'brooke glen': ['brooke glen behavioral hospital'],
    'tower': ['tower behavioral health'],
    'horsham': ['horsham clinic'],
    'riversbend': ['riversbend'],
    'prime lower bucks': ['prime healthcare lower bucks'],
    'prime roxborough': ['prime healthcare roxborough hospital'],
    'temple episcopal': ['temple hospital - episcopal campus']
  };

  // Build reverse alias mapping
  Object.entries(facilityAliases).forEach(([shortName, fullNames]) => {
    fullNames.forEach(fullName => {
      facilityNameVariations.set(fullName.toLowerCase(), shortName.toLowerCase());
    });
  });

  locMasterData.levels.forEach(level => {
    const asamLevel = level.asam_level;
    const displayName = level.display_name;
    const slug = level.slug;
    const facilities = level.facilities || [];

    // Store lookup maps
    locDisplayNames.set(asamLevel, displayName);
    locSlugs.set(asamLevel, slug);
    
    // Create facility lookup by name for this LOC with enhanced matching
    const facilityNames = new Set();
    
    facilities.forEach(f => {
      const facilityName = f.facility.toLowerCase();
      facilityNames.add(facilityName);
      
      // Add alias variations
      const alias = facilityNameVariations.get(facilityName);
      if (alias) {
        facilityNames.add(alias);
      }
      
      // Add common abbreviations
      if (facilityName.includes('hospital')) {
        facilityNames.add(facilityName.replace('hospital', 'hosp'));
      }
      if (facilityName.includes('behavioral')) {
        facilityNames.add(facilityName.replace('behavioral', 'bh'));
      }
    });
    
    facilityByLoc.set(asamLevel, facilityNames);
  });

  console.log('LOC Lookup Maps Created:', {
    totalLevels: facilityByLoc.size,
    levels: Array.from(facilityByLoc.keys()),
    sampleFacilities: facilityByLoc.get('3.7WM') ? Array.from(facilityByLoc.get('3.7WM')).slice(0, 3) : []
  });

  return {
    facilityByLoc,
    locDisplayNames,
    locSlugs,
    availableLocs: Array.from(facilityByLoc.keys()),
    facilityNameVariations
  };
}

/**
 * Map ASAM level selections to LOC master data levels
 * COMPREHENSIVE MAPPING - Covers all ASAM levels used in the EMR system
 * @param {string} selectedAsam - The selected ASAM level from UI
 * @returns {string[]} - Array of matching LOC levels
 */
export function mapAsamToLocLevels(selectedAsam) {
  const asamToLocMap = {
    // DETOXIFICATION LEVELS
    '3.7WM': ['3.7WM', '3.7A'],
    '3.7A': ['3.7A', '3.7WM'], 
    '4.0WM': ['4.0WM', '4.0 (4A)'],
    '4.0 (4A)': ['4.0 (4A)', '4.0WM'],
    
    // REHABILITATION LEVELS  
    '3.5COC': ['3.5COC', '3.5 (3B)', '3.5'],
    '3.5 (3B)': ['3.5 (3B)', '3.5COC', '3.5'],
    '3.5': ['3.5', '3.5COC', '3.5 (3B)'],
    '4.0': ['4.0', '4.0 (4B)'],
    '4.0 (4B)': ['4.0 (4B)', '4.0'],
    
    // PSYCHIATRIC LEVELS
    'IP Psych': ['IP_PSYCH'],
    'IP_PSYCH': ['IP_PSYCH'],
    'Inpatient Psychiatric': ['IP_PSYCH'],
    'Psychiatric': ['IP_PSYCH'],
    
    // ALTERNATIVE FORMATS
    '3.7': ['3.7WM', '3.7A'],
    '4A': ['4.0 (4A)', '4.0WM'],
    '4B': ['4.0 (4B)', '4.0'],
    '3B': ['3.5 (3B)', '3.5COC', '3.5'],
    
    // COMMON VARIATIONS
    'detox': ['3.7WM', '3.7A', '4.0WM', '4.0 (4A)'],
    'rehab': ['3.5COC', '3.5 (3B)', '3.5', '4.0', '4.0 (4B)'],
    'residential': ['3.5COC', '3.5 (3B)', '3.5', '4.0', '4.0 (4B)']
  };

  const mappedLevels = asamToLocMap[selectedAsam] || [];
  
  // If no mapping found, try case-insensitive matching
  if (mappedLevels.length === 0) {
    const lowerAsam = selectedAsam.toLowerCase();
    for (const [key, value] of Object.entries(asamToLocMap)) {
      if (key.toLowerCase() === lowerAsam) {
        return value;
      }
    }
  }

  return mappedLevels;
}

/**
 * Filter facilities based on LOC levels with improved name matching
 * UPDATED FOR NEW LOC MASTER STRUCTURE - Works with Map-based facility data
 * @param {Array} facilities - Array of facility objects
 * @param {Array} locLevels - Array of LOC level strings (e.g., ['3.7WM', '3.7A'])
 * @param {Map} facilityByLocMap - Map of LOC levels to Set of facility names
 * @returns {Array} Filtered facilities
 */
function filterFacilitiesByLoc(facilities, locLevels, facilityByLocMap) {
    if (!facilities || !Array.isArray(facilities) || !locLevels || !Array.isArray(locLevels)) {
        console.warn('Invalid parameters for filterFacilitiesByLoc:', { facilities, locLevels });
        return facilities || [];
    }
    
    if (locLevels.length === 0) {
        return facilities;
    }
    
    console.log('LOC Filtering Debug:');
    console.log('- Required LOC levels:', locLevels);
    console.log('- Available facilities in directory:', facilities.map(f => f.name));
    
    // Get all facility names from the LOC master for the required levels
    const validFacilityNames = new Set();
    
    if (facilityByLocMap && facilityByLocMap instanceof Map) {
        console.log('- Available facilities in LOC master:', Array.from(facilityByLocMap.keys()));
        
        locLevels.forEach(locLevel => {
            const facilitiesForLoc = facilityByLocMap.get(locLevel);
            if (facilitiesForLoc) {
                facilitiesForLoc.forEach(name => validFacilityNames.add(name));
                console.log(`- LOC ${locLevel}: ${facilitiesForLoc.size} facilities available`);
            } else {
                console.log(`- LOC ${locLevel}: No facilities found`);
            }
        });
    } else {
        console.log('- Available facilities in LOC master: []');
        console.warn('facilityByLocMap is not a Map or is undefined:', facilityByLocMap);
    }
    
    console.log('- Total valid facility names after LOC filtering:', validFacilityNames.size);
    console.log('- Valid facility names:', Array.from(validFacilityNames).slice(0, 5), '...');
    
    const filtered = facilities.filter(facility => {
        const facilityName = facility.name;
        const facilityNameLower = facilityName.toLowerCase();
        
        // Check if facility is in the valid set (case-insensitive)
        const hasMatch = validFacilityNames.has(facilityNameLower);
        
        if (!hasMatch) {
            console.log(`No LOC data found for facility: "${facilityName}"`);
        }
        
        return hasMatch;
    });
    
    console.log(`LOC Filtering Result: ${facilities.length} facilities -> ${filtered.length} filtered for LOC levels:`, locLevels);
    console.log('Filtered facilities:', filtered.map(f => f.name));
    return filtered;
}

/**
 * Filter facilities by LOC levels (exported version)
 * @param {Array} facilities - Array of facility objects
 * @param {Array} locLevels - Array of LOC level strings (e.g., ['3.7A', '4.0A'])
 * @param {Object} facilityToLocMap - Map of facility names to LOC levels
 * @returns {Array} Filtered facilities
 */
export { filterFacilitiesByLoc };

/**
 * Get LOC information for a facility
 * @param {string} facilityName - Name of the facility
 * @param {Object} locLookupMaps - LOC lookup maps
 * @returns {Array} - Array of LOC levels this facility provides
 */
export function getFacilityLocLevels(facilityName, locLookupMaps) {
  const facilityNameLower = facilityName.toLowerCase();
  const facilityLocs = [];

  locLookupMaps.facilityByLoc.forEach((facilityNames, locLevel) => {
    if (facilityNames.has(facilityNameLower)) {
      facilityLocs.push({
        asamLevel: locLevel,
        displayName: locLookupMaps.locDisplayNames.get(locLevel),
        slug: locLookupMaps.locSlugs.get(locLevel)
      });
    }
  });

  return facilityLocs;
}