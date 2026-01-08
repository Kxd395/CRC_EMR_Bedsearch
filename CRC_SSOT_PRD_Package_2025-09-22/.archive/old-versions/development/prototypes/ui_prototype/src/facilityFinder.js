/**
 * 🏥 EMR CRC SSOT - Facility Finder Module  
 * Pure functions for facility search, filtering, and matching
 */

/**
 * Filter facilities based on patient criteria and commitment status
 * @param {Array} facilities - Array of facility objects
 * @param {Object} criteria - Search criteria
 * @param {string} commitmentStatus - Patient commitment status
 * @returns {Array} Filtered facilities
 */
export function filterFacilities(facilities, criteria, commitmentStatus) {
  return facilities.filter(facility => {
    // Apply commitment-based filtering first (PA rules)
    if (!isCommitmentCompatible(facility, commitmentStatus)) {
      return false;
    }

    // Level of Care filtering
    if (criteria.levelOfCare && facility.levelOfCare !== criteria.levelOfCare) {
      return false;
    }

    // Insurance acceptance
    if (criteria.insurance && facility.acceptedInsurance) {
      if (!facility.acceptedInsurance.includes(criteria.insurance)) {
        return false;
      }
    }

    // Distance filtering
    if (criteria.maxDistance && criteria.userLocation && facility.location) {
      const distance = calculateDistance(facility.location, criteria.userLocation);
      if (distance > criteria.maxDistance) {
        return false;
      }
    }

    // Bed availability
    if (criteria.requireAvailableBeds && !facility.hasAvailableBeds) {
      return false;
    }

    // Service requirements
    if (criteria.requiredServices && criteria.requiredServices.length > 0) {
      const facilityServices = facility.servicesOffered || [];
      const hasAllServices = criteria.requiredServices.every(service => 
        facilityServices.includes(service)
      );
      if (!hasAllServices) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Check if facility is compatible with patient commitment status (PA rules)
 * @param {Object} facility - Facility object
 * @param {string} commitmentStatus - Commitment status
 * @returns {boolean} Whether facility is compatible
 */
export function isCommitmentCompatible(facility, commitmentStatus) {
  // SUD placements never require 201
  if (commitmentStatus === 'SUD') {
    // Only show ASAM levels for SUD
    return facility.levelOfCare && facility.levelOfCare.startsWith('ASAM');
  }

  // Psychiatric commitments
  const psychiatricCommitments = ['201_VOLUNTARY', '302_INVOLUNTARY', '303_EXTENDED'];
  if (psychiatricCommitments.includes(commitmentStatus)) {
    // Only psychiatric inpatient facilities
    if (facility.levelOfCare !== 'PSYCH_INPATIENT') {
      return false;
    }

    // Involuntary commitments require acceptsInvoluntary capability
    if ((commitmentStatus === '302_INVOLUNTARY' || commitmentStatus === '303_EXTENDED')) {
      return facility.acceptsInvoluntary === true;
    }

    return true;
  }

  // No specific filtering for other statuses
  return true;
}

/**
 * Rank facilities based on preferences and scoring algorithm
 * @param {Array} facilities - Filtered facilities
 * @param {Object} preferences - Scoring preferences
 * @returns {Array} Ranked facilities with scores
 */
export function rankFacilities(facilities, preferences) {
  return facilities
    .map(facility => ({
      ...facility,
      score: calculateFacilityScore(facility, preferences)
    }))
    .sort((a, b) => b.score - a.score);
}

/**
 * Calculate facility score based on multiple factors
 * @param {Object} facility - Facility object
 * @param {Object} preferences - User preferences
 * @returns {number} Calculated score (0-100)
 */
export function calculateFacilityScore(facility, preferences) {
  let score = 0;
  let maxScore = 0;

  // Distance scoring (closer is better)
  if (preferences.userLocation && facility.location) {
    const distance = calculateDistance(facility.location, preferences.userLocation);
    const distanceScore = Math.max(0, 100 - (distance * 2)); // 2 points per mile
    score += distanceScore * (preferences.distanceWeight || 0.3);
    maxScore += 100 * (preferences.distanceWeight || 0.3);
  }

  // Bed availability (immediate availability preferred)
  if (facility.hasAvailableBeds) {
    score += 100 * (preferences.availabilityWeight || 0.4);
  }
  maxScore += 100 * (preferences.availabilityWeight || 0.4);

  // Quality rating
  if (facility.qualityRating) {
    const qualityScore = (facility.qualityRating / 5) * 100;
    score += qualityScore * (preferences.qualityWeight || 0.2);
    maxScore += 100 * (preferences.qualityWeight || 0.2);
  }

  // Insurance acceptance
  if (preferences.insurance && facility.acceptedInsurance) {
    if (facility.acceptedInsurance.includes(preferences.insurance)) {
      score += 100 * (preferences.insuranceWeight || 0.1);
    }
  }
  maxScore += 100 * (preferences.insuranceWeight || 0.1);

  // Normalize score to 0-100 range
  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
}

/**
 * Calculate distance between two geographic points
 * @param {Object} point1 - {lat, lng}
 * @param {Object} point2 - {lat, lng}
 * @returns {number} Distance in miles
 */
export function calculateDistance(point1, point2) {
  const R = 3959; // Earth's radius in miles
  const dLat = degToRad(point2.lat - point1.lat);
  const dLon = degToRad(point2.lng - point1.lng);

  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degToRad(point1.lat)) * Math.cos(degToRad(point2.lat)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 * @param {number} deg - Degrees
 * @returns {number} Radians
 */
function degToRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Search facilities with text-based query
 * @param {Array} facilities - All facilities
 * @param {string} searchText - Search query
 * @returns {Array} Matching facilities
 */
export function searchFacilities(facilities, searchText) {
  if (!searchText || searchText.trim() === '') {
    return facilities;
  }

  const query = searchText.toLowerCase().trim();

  return facilities.filter(facility => {
    // Search in facility name
    if (facility.name && facility.name.toLowerCase().includes(query)) {
      return true;
    }

    // Search in facility type
    if (facility.facilityType && facility.facilityType.toLowerCase().includes(query)) {
      return true;
    }

    // Search in services offered
    if (facility.servicesOffered && facility.servicesOffered.some(service => 
      service.toLowerCase().includes(query)
    )) {
      return true;
    }

    // Search in city/location
    if (facility.location && facility.location.city) {
      if (facility.location.city.toLowerCase().includes(query)) {
        return true;
      }
    }

    return false;
  });
}

/**
 * Get facilities that match MAT (Medication Assisted Treatment) needs
 * @param {Array} facilities - All facilities  
 * @param {Object} matNeeds - MAT requirements
 * @returns {Array} MAT-compatible facilities
 */
export function filterByMatNeeds(facilities, matNeeds) {
  if (!matNeeds || !matNeeds.required) {
    return facilities;
  }

  return facilities.filter(facility => {
    // Check if facility offers MAT services
    if (!facility.servicesOffered || !facility.servicesOffered.includes('MAT')) {
      return false;
    }

    // Check specific substance treatment
    if (matNeeds.substances && matNeeds.substances.length > 0) {
      const facilitySubstances = facility.matCapabilities?.substances || [];
      return matNeeds.substances.some(substance => 
        facilitySubstances.includes(substance)
      );
    }

    return true;
  });
}

/**
 * Batch process facility updates (for real-time availability)
 * @param {Array} facilities - Current facilities
 * @param {Array} updates - Availability updates
 * @returns {Array} Updated facilities
 */
export function updateFacilityAvailability(facilities, updates) {
  const updateMap = new Map();
  updates.forEach(update => {
    updateMap.set(update.facilityId, update);
  });

  return facilities.map(facility => {
    const update = updateMap.get(facility.id);
    if (update) {
      return {
        ...facility,
        hasAvailableBeds: update.availableBeds > 0,
        availableBeds: update.availableBeds,
        lastUpdated: update.timestamp
      };
    }
    return facility;
  });
}

/**
 * Validate facility data structure
 * @param {Object} facility - Facility object to validate
 * @returns {Object} Validation result
 */
export function validateFacility(facility) {
  const errors = [];
  const warnings = [];

  // Required fields
  if (!facility.id) errors.push('Missing facility ID');
  if (!facility.name) errors.push('Missing facility name');
  if (!facility.levelOfCare) errors.push('Missing level of care');

  // Location validation
  if (!facility.location) {
    errors.push('Missing location data');
  } else {
    if (typeof facility.location.lat !== 'number') {
      errors.push('Invalid latitude');
    }
    if (typeof facility.location.lng !== 'number') {
      errors.push('Invalid longitude');
    }
  }

  // Insurance validation
  if (!facility.acceptedInsurance || !Array.isArray(facility.acceptedInsurance)) {
    warnings.push('Missing or invalid accepted insurance data');
  }

  // Services validation
  if (!facility.servicesOffered || !Array.isArray(facility.servicesOffered)) {
    warnings.push('Missing or invalid services offered data');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}