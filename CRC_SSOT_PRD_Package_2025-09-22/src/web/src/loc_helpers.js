// Helper functions for LOC integration

function mapAsamToLocLevels(asamLevel) {
  // Map ASAM levels to LOC levels
  const mapping = {
    '1.0': ['1-WM', '1-OTP'],
    '2.1': ['2.1-IOP'],
    '2.5': ['2.5-PH'],
    '3.1': ['3.1-CSS'],
    '3.3': ['3.3-CSS'],
    '3.5': ['3.5-CRT', '3.5-CSS'],
    '3.7': ['3.7-MMS'],
    '3.7WM': ['3.7-WM'],
    '4.0': ['4-MMS'],
    'ACUTE': ['ACUTE-IP', 'ACUTE-302']
  };
  
  return mapping[asamLevel] || [];
}

function filterFacilitiesByLoc(facilities, asamLevel, locMaps, options = {}) {
  console.log('🎯 DEBUG: filterFacilitiesByLoc called with:', { asamLevel, options, facilitiesCount: facilities.length });
  
  const { needs302, needsSecure } = options;
  const locLevels = mapAsamToLocLevels(asamLevel);
  
  console.log('🎯 DEBUG: Mapped LOC levels:', locLevels);
  console.log('🎯 DEBUG: LOC maps size:', locMaps.facilityByLoc?.size || 0);
  
  if (!locLevels.length || !locMaps.facilityByLoc) {
    console.log('🎯 DEBUG: No LOC levels or maps - returning all facilities');
    return facilities; // No LOC filtering possible
  }
  
  if (locMaps.facilityByLoc.size === 0) {
    console.log('🎯 DEBUG: Empty LOC data - this should not happen with new comprehensive data');
    return facilities; // Fallback for empty data
  }
  
  // Get all facilities that provide the required LOC levels
  const validFacilityNames = new Set();
  locLevels.forEach(locLevel => {
    const facilitiesForLoc = locMaps.facilityByLoc.get(locLevel) || [];
    console.log(`🎯 DEBUG: Facilities for ${locLevel}:`, facilitiesForLoc.length);
    facilitiesForLoc.forEach(name => validFacilityNames.add(name.toLowerCase()));
  });
  
  console.log('🎯 DEBUG: Valid facility names count:', validFacilityNames.size);
  
  // Filter facilities
  const filtered = facilities.filter(facility => {
    // Check basic requirements
    if (needs302 && !facility.capabilities?.takes302) {
      console.log('🎯 DEBUG: Facility rejected - needs 302 but no takes302:', facility.name);
      return false;
    }
    if (needsSecure && !facility.capabilities?.secureBh) {
      console.log('🎯 DEBUG: Facility rejected - needs secure but no secureBh:', facility.name);
      return false;
    }
    
    // Check if facility provides required LOC
    const locMatch = validFacilityNames.has(facility.name.toLowerCase());
    if (!locMatch) {
      console.log('🎯 DEBUG: Facility rejected - no LOC match:', facility.name);
    }
    return locMatch;
  });
  
  console.log('🎯 DEBUG: Final filtered count:', filtered.length);
  return filtered;
}

function renderFacilityCards(scoredFacilities) {
  if (!dom.results) return;
  
  dom.results.innerHTML = '';
  
  if (!scoredFacilities.length) {
    dom.results.innerHTML = `
      <div class="empty-state">
        <p>No facilities match the selected criteria.</p>
        <p>Try adjusting the ASAM level or removing filters.</p>
      </div>
    `;
    return;
  }
  
  scoredFacilities.forEach(({ facility, score }) => {
    const card = createFacilityCard(facility, score);
    dom.results.appendChild(card);
  });
}

function createFacilityCard(facility, score) {
  const card = document.createElement('div');
  card.className = 'facility-card';
  card.dataset.facilityId = facility.id;
  
  // Add LOC tags
  const locTags = facility.tags?.filter(tag => tag.startsWith('LOC:')) || [];
  const locBadges = locTags.map(tag => 
    `<span class="badge loc-badge">${tag}</span>`
  ).join('');
  
  card.innerHTML = `
    <div class="facility-header">
      <h3>${facility.name}</h3>
      <span class="score-badge">Match: ${score}</span>
    </div>
    <div class="facility-info">
      <p class="facility-level">Level: ${facility.level || 'Not specified'}</p>
      <p class="facility-category">${facility.category || ''}</p>
      ${locBadges}
    </div>
    <div class="facility-capabilities">
      ${facility.capabilities?.takes302 ? '<span class="capability">✓ 302</span>' : ''}
      ${facility.capabilities?.secureBh ? '<span class="capability">✓ Secure</span>' : ''}
      ${facility.capabilities?.acuteMed ? '<span class="capability">✓ Medical</span>' : ''}
    </div>
    <div class="facility-actions">
      <button class="btn-select" data-facility-id="${facility.id}">Select</button>
      <button class="btn-info" data-facility-id="${facility.id}">Details</button>
    </div>
  `;
  
  // Attach event listeners
  card.querySelector('.btn-select').addEventListener('click', () => {
    selectFacility(facility);
  });
  
  card.querySelector('.btn-info').addEventListener('click', () => {
    showFacilityDetails(facility);
  });
  
  return card;
}
