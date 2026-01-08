/**
 * 🏥 EMR CRC SSOT - Documentation Dashboard Module
 * State machine for healthcare documentation workflow
 */

/**
 * Documentation state machine: MISSING → PENDING → RECEIVED|SIGNED → (REJECTED optional)
 */
export class DocumentationDashboard {
  constructor() {
    this.documents = new Map();
    this.eventListeners = new Map();
    this.autoRules = new Map();
    
    this.initializeAutoRules();
  }

  /**
   * Initialize automatic documentation rules (PSP notifications, etc.)
   */
  initializeAutoRules() {
    // PSP notification rules for involuntary commitments
    this.autoRules.set('commitment_302_303', {
      trigger: 'commitmentStatusChange',
      condition: (data) => ['302_INVOLUNTARY', '303_EXTENDED'].includes(data.newStatus),
      action: (patientId) => {
        this.queueDocument(patientId, 'PSP_NOTICE', {
          type: 'upload_and_send',
          urgency: 'immediate',
          autoGenerate: true,
          description: 'PSP notification for involuntary commitment'
        });
      }
    });

    // No SMD notice rule
    this.autoRules.set('no_smd_notice', {
      trigger: 'physicianAssessment',
      condition: (data) => data.noSevereMentalDisability === true,
      action: (patientId) => {
        this.queueDocument(patientId, 'PSP_NO_SMD', {
          type: 'upload_and_send',
          urgency: 'normal',
          autoGenerate: true,
          description: 'PSP "No SMD" notice'
        });
      }
    });
  }

  /**
   * Set document state and update UI
   * @param {string} patientId - Patient ID
   * @param {string} docCode - Document code
   * @param {string} state - New document state
   * @param {Object} metadata - Additional metadata
   */
  setDocumentState(patientId, docCode, state, metadata = {}) {
    const key = `${patientId}_${docCode}`;
    const doc = this.documents.get(key) || { patientId, docCode };
    
    // Validate state transition
    if (!this.isValidStateTransition(doc.state, state)) {
      throw new Error(`Invalid state transition: ${doc.state} → ${state}`);
    }

    // Update document
    doc.state = state;
    doc.lastUpdated = new Date().toISOString();
    doc.metadata = { ...doc.metadata, ...metadata };
    doc.synced = false; // Mark as needing sync

    this.documents.set(key, doc);
    
    // Update UI
    this.updateDocumentUI(patientId, docCode, doc);
    
    // Trigger event listeners
    this.triggerEvent('documentStateChanged', { patientId, docCode, state, doc });
    
    return doc;
  }

  /**
   * Validate state transition
   * @param {string} currentState - Current state
   * @param {string} newState - New state
   * @returns {boolean} Whether transition is valid
   */
  isValidStateTransition(currentState, newState) {
    const validTransitions = {
      undefined: ['MISSING', 'PENDING', 'RECEIVED', 'SIGNED'], // Initial state
      'MISSING': ['PENDING', 'RECEIVED', 'SIGNED'],
      'PENDING': ['RECEIVED', 'SIGNED', 'REJECTED', 'MISSING'],
      'RECEIVED': ['SIGNED', 'REJECTED', 'PENDING'],
      'SIGNED': ['REJECTED'], // Can be rejected after signing
      'REJECTED': ['PENDING', 'RECEIVED', 'SIGNED']
    };

    const allowed = validTransitions[currentState] || [];
    return allowed.includes(newState);
  }

  /**
   * Update document UI representation
   * @param {string} patientId - Patient ID
   * @param {string} docCode - Document code
   * @param {Object} doc - Document object
   */
  updateDocumentUI(patientId, docCode, doc) {
    const row = document.querySelector(`[data-testid="docs-row-${docCode}"][data-patient-id="${patientId}"]`);
    if (!row) return;

    const indicator = row.querySelector('.status-indicator');
    const actions = row.querySelector('.actions');
    const syncBadge = row.querySelector('.sync-badge');

    // Update status indicator
    if (indicator) {
      const { text, className } = this.getStatusDisplay(doc.state);
      indicator.innerHTML = text;
      indicator.className = `status-indicator ${className}`;
    }

    // Update available actions
    if (actions) {
      actions.innerHTML = this.getActionButtons(doc.state, docCode, patientId);
    }

    // Update sync badge
    if (syncBadge) {
      syncBadge.textContent = doc.synced ? 'Synced' : 'Pending';
      syncBadge.className = `sync-badge ${doc.synced ? 'synced' : 'pending'}`;
    }

    // Add visual feedback for state change
    row.classList.add('state-updated');
    setTimeout(() => {
      row.classList.remove('state-updated');
    }, 1000);
  }

  /**
   * Get status display configuration
   * @param {string} state - Document state
   * @returns {Object} Display configuration
   */
  getStatusDisplay(state) {
    const displays = {
      'MISSING': { text: '🔴 Missing', className: 'missing' },
      'PENDING': { text: '🟡 Pending', className: 'pending' },
      'RECEIVED': { text: '🟢 Received', className: 'received' },
      'SIGNED': { text: '✅ Complete', className: 'complete' },
      'REJECTED': { text: '🔴 Rejected', className: 'rejected' }
    };

    return displays[state] || { text: '❓ Unknown', className: 'unknown' };
  }

  /**
   * Generate action buttons HTML for current state
   * @param {string} state - Document state
   * @param {string} docCode - Document code
   * @param {string} patientId - Patient ID
   * @returns {string} Action buttons HTML
   */
  getActionButtons(state, docCode, patientId) {
    const actions = {
      'MISSING': [
        { text: 'Upload', action: 'upload', primary: true },
        { text: 'Generate', action: 'generate', secondary: true },
        { text: 'Request', action: 'request', secondary: true }
      ],
      'PENDING': [
        { text: 'Upload', action: 'upload', primary: true },
        { text: 'View Request', action: 'view_request', secondary: true }
      ],
      'RECEIVED': [
        { text: 'View', action: 'view', primary: true },
        { text: 'Sign', action: 'sign', primary: true },
        { text: 'Reject', action: 'reject', danger: true }
      ],
      'SIGNED': [
        { text: 'View', action: 'view', primary: true },
        { text: 'Download', action: 'download', secondary: true }
      ],
      'REJECTED': [
        { text: 'Upload New', action: 'upload', primary: true },
        { text: 'Revise', action: 'revise', secondary: true }
      ]
    };

    const stateActions = actions[state] || [];
    
    return stateActions.map(action => {
      const classes = ['doc-action'];
      if (action.primary) classes.push('primary');
      if (action.secondary) classes.push('secondary');
      if (action.danger) classes.push('danger');

      return `<button class="${classes.join(' ')}" 
                      data-action="${action.action}" 
                      data-doc-code="${docCode}" 
                      data-patient-id="${patientId}">
                ${action.text}
              </button>`;
    }).join('');
  }

  /**
   * Queue document automatically based on rules
   * @param {string} patientId - Patient ID
   * @param {string} docCode - Document code
   * @param {Object} config - Document configuration
   */
  queueDocument(patientId, docCode, config) {
    this.setDocumentState(patientId, docCode, 'PENDING', {
      ...config,
      queuedAt: new Date().toISOString(),
      autoQueued: true
    });

    // Show notification
    this.showNotification(`Document queued: ${docCode}`, 'info');
  }

  /**
   * Handle commitment status change and trigger auto-rules
   * @param {string} patientId - Patient ID
   * @param {string} newStatus - New commitment status
   * @param {string} oldStatus - Previous commitment status
   */
  handleCommitmentStatusChange(patientId, newStatus, oldStatus) {
    // Trigger auto-rules
    this.autoRules.forEach((rule, _ruleId) => {
      if (rule.trigger === 'commitmentStatusChange') {
        if (rule.condition({ newStatus, oldStatus, patientId })) {
          rule.action(patientId);
        }
      }
    });
  }

  /**
   * Handle physician assessment and trigger rules
   * @param {string} patientId - Patient ID
   * @param {Object} assessment - Assessment data
   */
  handlePhysicianAssessment(patientId, assessment) {
    this.autoRules.forEach((rule, _ruleId) => {
      if (rule.trigger === 'physicianAssessment') {
        if (rule.condition({ ...assessment, patientId })) {
          rule.action(patientId);
        }
      }
    });
  }

  /**
   * Get document by patient and code
   * @param {string} patientId - Patient ID
   * @param {string} docCode - Document code
   * @returns {Object|null} Document object or null
   */
  getDocument(patientId, docCode) {
    const key = `${patientId}_${docCode}`;
    return this.documents.get(key) || null;
  }

  /**
   * Get all documents for a patient
   * @param {string} patientId - Patient ID
   * @returns {Array} Array of documents
   */
  getPatientDocuments(patientId) {
    const docs = [];
    this.documents.forEach((doc, _key) => {
      if (doc.patientId === patientId) {
        docs.push(doc);
      }
    });
    return docs;
  }

  /**
   * Get document summary for patient
   * @param {string} patientId - Patient ID
   * @returns {Object} Document summary
   */
  getDocumentSummary(patientId) {
    const docs = this.getPatientDocuments(patientId);
    
    const summary = {
      total: docs.length,
      missing: 0,
      pending: 0,
      received: 0,
      signed: 0,
      rejected: 0,
      complete: 0
    };

    docs.forEach(doc => {
      summary[doc.state.toLowerCase()]++;
      if (doc.state === 'SIGNED') {
        summary.complete++;
      }
    });

    summary.completionRate = summary.total > 0 ? 
      Math.round((summary.complete / summary.total) * 100) : 0;

    return summary;
  }

  /**
   * Mark document as synced with server
   * @param {string} patientId - Patient ID
   * @param {string} docCode - Document code
   */
  markSynced(patientId, docCode) {
    const key = `${patientId}_${docCode}`;
    const doc = this.documents.get(key);
    
    if (doc) {
      doc.synced = true;
      doc.lastSyncedAt = new Date().toISOString();
      this.documents.set(key, doc);
      this.updateDocumentUI(patientId, docCode, doc);
    }
  }

  /**
   * Mark document as sync failed
   * @param {string} patientId - Patient ID
   * @param {string} docCode - Document code
   * @param {string} error - Error message
   */
  markSyncFailed(patientId, docCode, error) {
    const key = `${patientId}_${docCode}`;
    const doc = this.documents.get(key);
    
    if (doc) {
      doc.synced = false;
      doc.syncError = error;
      doc.lastSyncAttempt = new Date().toISOString();
      this.documents.set(key, doc);
      this.updateDocumentUI(patientId, docCode, doc);
      
      // Show error notification
      this.showNotification(`Sync failed for ${docCode}: ${error}`, 'error');
    }
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  addEventListener(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  /**
   * Trigger event
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  triggerEvent(event, data) {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${event} listener:`, error);
      }
    });
  }

  /**
   * Show notification to user
   * @param {string} message - Notification message
   * @param {string} type - Notification type
   */
  showNotification(message, type = 'info') {
    // Create or update notification
    let notification = document.getElementById('doc-notification');
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'doc-notification';
      notification.className = 'notification';
      document.body.appendChild(notification);
    }

    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Auto-hide
    setTimeout(() => {
      notification.style.display = 'none';
    }, 5000);
  }

  /**
   * Initialize document dashboard for patient
   * @param {string} patientId - Patient ID
   * @param {Array} requiredDocs - Array of required document codes
   */
  initializePatientDashboard(patientId, requiredDocs) {
    requiredDocs.forEach(docCode => {
      const existing = this.getDocument(patientId, docCode);
      if (!existing) {
        this.setDocumentState(patientId, docCode, 'MISSING');
      }
    });
  }

  /**
   * Export patient documents state for saving
   * @param {string} patientId - Patient ID
   * @returns {Object} Exportable state
   */
  exportPatientState(patientId) {
    const docs = this.getPatientDocuments(patientId);
    return {
      patientId,
      documents: docs,
      summary: this.getDocumentSummary(patientId),
      exportedAt: new Date().toISOString()
    };
  }

  /**
   * Import patient documents state
   * @param {Object} state - Previously exported state
   */
  importPatientState(state) {
    state.documents.forEach(doc => {
      const key = `${doc.patientId}_${doc.docCode}`;
      this.documents.set(key, doc);
      this.updateDocumentUI(doc.patientId, doc.docCode, doc);
    });
  }
}

// Create and export singleton instance
export const docDashboard = new DocumentationDashboard();

// Standard healthcare document codes
export const DOC_CODES = {
  // Psychiatric commitments
  'PSP_NOTICE': 'PSP Notification',
  'PSP_NO_SMD': 'PSP No SMD Notice',
  'COMMITMENT_PETITION': 'Commitment Petition',
  'PHYSICIAN_CERTIFICATE': 'Physician Certificate',
  
  // Medical records
  'MEDICAL_HISTORY': 'Medical History',
  'MEDICATION_LIST': 'Current Medications',
  'DISCHARGE_SUMMARY': 'Discharge Summary',
  'TREATMENT_PLAN': 'Treatment Plan',
  
  // Insurance and authorization
  'INSURANCE_CARD': 'Insurance Card',
  'PRIOR_AUTH': 'Prior Authorization',
  'BENEFITS_VERIFICATION': 'Benefits Verification',
  
  // Legal and consent
  'CONSENT_TREATMENT': 'Consent for Treatment',
  'CONSENT_DISCLOSURE': 'Consent for Disclosure',
  'GUARDIANSHIP_PAPERS': 'Guardianship Papers',
  'ADVANCE_DIRECTIVE': 'Advance Directive'
};