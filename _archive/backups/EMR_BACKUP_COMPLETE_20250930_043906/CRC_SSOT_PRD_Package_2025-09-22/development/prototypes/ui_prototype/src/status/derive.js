/**
 * 🏥 EMR CRC SSOT - Status Derivation Module
 * Pure functions for status computation and validation
 */

/**
 * Derive search status from events (never set status directly)
 * @param {Object} search - Search object with events array
 * @returns {string} Derived status
 */
export function deriveSearchStatus(search) {
  const events = search.events || [];
  if (events.length === 0) return 'PENDING';
  
  // Get the most recent event
  const latestEvent = events[events.length - 1];
  
  // Status derivation rules (based on latest event)
  const statusMap = {
    'SEARCH_CREATED': 'ACTIVE',
    'FACILITY_CONTACTED': 'ACTIVE',
    'BED_REQUEST_SENT': 'ACTIVE',
    'BED_AVAILABLE': 'ACTIVE',
    'FACILITY_SELECTED': 'SELECTED_FOR_TRANSFER',
    'TRANSFER_APPROVED': 'SELECTED_FOR_TRANSFER', 
    'PLACEMENT_CONFIRMED': 'CONFIRMED',
    'TRANSFER_IN_PROGRESS': 'TRANSFER_IN_PROGRESS',
    'PLACEMENT_COMPLETE': 'COMPLETE',
    'PLACEMENT_CANCELLED': 'CANCELLED',
    'SEARCH_EXPIRED': 'EXPIRED'
  };
  
  return statusMap[latestEvent.type] || 'ACTIVE';
}

/**
 * Derive overall patient status from all searches
 * @param {Object} patient - Patient object with searches array
 * @returns {string} Overall patient status
 */
export function derivePatientStatus(patient) {
  const searches = patient.searches || [];
  
  if (searches.length === 0) {
    return 'NO_ACTIVE_SEARCH';
  }
  
  // Get status for each search
  const searchStatuses = searches.map(search => deriveSearchStatus(search));
  
  // Priority order for patient status
  const statusPriority = [
    'TRANSFER_IN_PROGRESS',    // Highest priority
    'CONFIRMED',
    'SELECTED_FOR_TRANSFER', 
    'ACTIVE',
    'COMPLETE',
    'CANCELLED',
    'EXPIRED',
    'PENDING'                 // Lowest priority
  ];
  
  // Find highest priority status
  for (const status of statusPriority) {
    if (searchStatuses.includes(status)) {
      return status;
    }
  }
  
  return 'NO_ACTIVE_SEARCH';
}

/**
 * Add event to search and derive new status (event-driven updates)
 * @param {Object} search - Search object
 * @param {string} eventType - Type of event
 * @param {Object} eventData - Event data
 * @param {string} userId - User creating the event
 * @returns {Object} Updated search with new event and status
 */
export function addSearchEvent(search, eventType, eventData = {}, userId = null) {
  const event = {
    id: generateEventId(),
    type: eventType,
    timestamp: new Date().toISOString(),
    userId: userId,
    data: eventData
  };
  
  const updatedSearch = {
    ...search,
    events: [...(search.events || []), event],
    updatedAt: event.timestamp
  };
  
  // Always derive status from events, never set directly
  updatedSearch.status = deriveSearchStatus(updatedSearch);
  
  return updatedSearch;
}

/**
 * Validate search status invariants
 * @param {Object} patient - Patient object
 * @returns {Object} Validation result
 */
export function validateSearchInvariants(patient) {
  const errors = [];
  const warnings = [];
  
  const searches = patient.searches || [];
  
  // Invariant 1: Only one facility can be "Selected for Transfer" per patient
  const selectedFacilities = searches
    .map(search => deriveSearchStatus(search) === 'SELECTED_FOR_TRANSFER' ? search.facilityId : null)
    .filter(Boolean);
  
  const uniqueSelectedFacilities = new Set(selectedFacilities);
  
  if (uniqueSelectedFacilities.size > 1) {
    errors.push('Multiple facilities selected for transfer');
  }
  
  // Invariant 2: Events should be chronologically ordered
  searches.forEach((search, searchIndex) => {
    const events = search.events || [];
    for (let i = 1; i < events.length; i++) {
      const prevTime = new Date(events[i - 1].timestamp);
      const currTime = new Date(events[i].timestamp);
      
      if (currTime < prevTime) {
        warnings.push(`Search ${searchIndex}: Events not chronologically ordered`);
      }
    }
  });
  
  // Invariant 3: Status should match derived status
  searches.forEach((search, searchIndex) => {
    const derivedStatus = deriveSearchStatus(search);
    if (search.status && search.status !== derivedStatus) {
      errors.push(`Search ${searchIndex}: Status mismatch (${search.status} vs ${derivedStatus})`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get search events by type
 * @param {Object} search - Search object
 * @param {string} eventType - Event type to filter
 * @returns {Array} Matching events
 */
export function getEventsByType(search, eventType) {
  const events = search.events || [];
  return events.filter(event => event.type === eventType);
}

/**
 * Get latest event of specific type
 * @param {Object} search - Search object
 * @param {string} eventType - Event type to find
 * @returns {Object|null} Latest matching event or null
 */
export function getLatestEvent(search, eventType) {
  const events = getEventsByType(search, eventType);
  return events.length > 0 ? events[events.length - 1] : null;
}

/**
 * Check if search has specific event
 * @param {Object} search - Search object
 * @param {string} eventType - Event type to check
 * @returns {boolean} Whether event exists
 */
export function hasEvent(search, eventType) {
  return getLatestEvent(search, eventType) !== null;
}

/**
 * Derive facility contact status for a search
 * @param {Object} search - Search object
 * @param {string} facilityId - Facility ID
 * @returns {string} Contact status
 */
export function deriveFacilityContactStatus(search, facilityId) {
  const events = search.events || [];
  const facilityEvents = events.filter(event => 
    event.data && event.data.facilityId === facilityId
  );
  
  if (facilityEvents.length === 0) return 'NOT_CONTACTED';
  
  const latestEvent = facilityEvents[facilityEvents.length - 1];
  
  const contactStatusMap = {
    'FACILITY_CONTACTED': 'CONTACTED',
    'BED_REQUEST_SENT': 'BED_REQUESTED',
    'BED_AVAILABLE': 'BED_AVAILABLE',
    'BED_UNAVAILABLE': 'BED_UNAVAILABLE',
    'FACILITY_SELECTED': 'SELECTED',
    'PLACEMENT_CONFIRMED': 'CONFIRMED',
    'PLACEMENT_CANCELLED': 'CANCELLED'
  };
  
  return contactStatusMap[latestEvent.type] || 'CONTACTED';
}

/**
 * Calculate search duration metrics
 * @param {Object} search - Search object
 * @returns {Object} Duration metrics
 */
export function calculateSearchMetrics(search) {
  const events = search.events || [];
  
  if (events.length === 0) {
    return {
      totalDuration: 0,
      timeToFirstContact: 0,
      timeToSelection: 0,
      timeToConfirmation: 0
    };
  }
  
  const startEvent = events[0];
  const startTime = new Date(startEvent.timestamp);
  const now = new Date();
  
  const firstContact = events.find(e => e.type === 'FACILITY_CONTACTED');
  const selection = events.find(e => e.type === 'FACILITY_SELECTED');
  const confirmation = events.find(e => e.type === 'PLACEMENT_CONFIRMED');
  
  return {
    totalDuration: now - startTime,
    timeToFirstContact: firstContact ? new Date(firstContact.timestamp) - startTime : null,
    timeToSelection: selection ? new Date(selection.timestamp) - startTime : null,
    timeToConfirmation: confirmation ? new Date(confirmation.timestamp) - startTime : null
  };
}

/**
 * Generate search summary for display
 * @param {Object} search - Search object
 * @returns {Object} Search summary
 */
export function generateSearchSummary(search) {
  const status = deriveSearchStatus(search);
  const events = search.events || [];
  const metrics = calculateSearchMetrics(search);
  
  // Count facilities contacted
  const facilitiesContacted = new Set(
    events
      .filter(e => e.type === 'FACILITY_CONTACTED' && e.data?.facilityId)
      .map(e => e.data.facilityId)
  ).size;
  
  // Find selected facility
  const selectionEvent = getLatestEvent(search, 'FACILITY_SELECTED');
  const selectedFacilityId = selectionEvent?.data?.facilityId;
  
  return {
    id: search.id,
    status,
    createdAt: events[0]?.timestamp,
    updatedAt: search.updatedAt,
    facilitiesContacted,
    selectedFacilityId,
    eventCount: events.length,
    duration: Math.round(metrics.totalDuration / (1000 * 60)), // minutes
    isActive: ['ACTIVE', 'SELECTED_FOR_TRANSFER'].includes(status)
  };
}

/**
 * Generate unique event ID
 * @returns {string} Unique event ID
 */
function generateEventId() {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate event data structure
 * @param {string} eventType - Event type
 * @param {Object} eventData - Event data to validate
 * @returns {Object} Validation result
 */
export function validateEventData(eventType, eventData) {
  const errors = [];
  
  switch (eventType) {
    case 'FACILITY_CONTACTED':
    case 'BED_REQUEST_SENT':
    case 'BED_AVAILABLE':
    case 'BED_UNAVAILABLE':
    case 'FACILITY_SELECTED':
      if (!eventData.facilityId) {
        errors.push('facilityId is required for facility events');
      }
      break;
      
    case 'PLACEMENT_CONFIRMED':
      if (!eventData.facilityId) {
        errors.push('facilityId is required for confirmation');
      }
      if (!eventData.confirmationDetails) {
        errors.push('confirmationDetails required for confirmation');
      }
      break;
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}