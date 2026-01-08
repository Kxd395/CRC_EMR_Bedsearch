import { commitmentFixtures } from './data/commitmentFixtures.js';
import { renderCommitmentPanel } from './commitmentPanel.js';
import {
  facilityDirectory as facilityDirectoryData,
  transformForFacilityFinder
} from './data/facilityDirectory.js';
import { newPatientScenarios } from './data/newPatientScenarios.js';

(() => {
  const asamOptions = [
    { value: '3.7WM', label: '3.7 WM — Medically Managed Withdrawal' },
    { value: '3.5COC', label: '3.5 COC — Clinically Managed High-Intensity' },
    { value: '3.5', label: '3.5 — Clinically Managed High-Intensity Residential' },
    { value: '3.3', label: '3.3 — Population Specific High-Intensity' },
    { value: '3.1', label: '3.1 — Clinically Managed Low-Intensity' },
    { value: '4.0WM', label: '4.0 WM — Medically Managed Intensive Withdrawal' },
    { value: '4.0', label: '4.0 — Medically Managed Intensive Treatment' },
    { value: '2.1', label: '2.1 — Intensive Outpatient' },
    { value: 'IP Psych', label: 'IP Psych — Inpatient Psychiatric' },
    { value: 'ACUTE201', label: 'Acute 201 — Involuntary Emergency Hold' },
    { value: 'ACUTE302', label: 'Acute 302 — Court Ordered Hold' },
    { value: 'DIAL', label: 'DIAL — Diversion & Assessment' }
  ];

  const matOptions = [
    { value: 'None', label: 'No MAT need' },
    { value: 'MethadoneInduction', label: 'Methadone Induction' },
    { value: 'MethadoneContinue', label: 'Methadone Continue' },
    { value: 'SuboxoneInduction', label: 'Suboxone Induction' },
    { value: 'SuboxoneContinue', label: 'Suboxone Continue' },
    { value: 'DetoxOnly', label: 'Detox Only (non-maintenance)' }
  ];

  const commitmentOptions = [
    { value: '', label: 'Select commitment status' },
    { value: 'Voluntary', label: 'Voluntary' },
    { value: '302Hold', label: '302 Hold' },
    { value: '201Hold', label: '201 Hold' },
    { value: 'CourtOrdered', label: 'Court Ordered' },
    { value: 'None', label: 'No commitment' }
  ];

  const acuityOptions = [
    { value: '', label: 'Select medical acuity' },
    { value: 'Medically Monitored', label: 'Medically Monitored' },
    { value: 'Medically Managed', label: 'Medically Managed' },
    { value: 'High-Intensity Residential', label: 'High-Intensity Residential' },
    { value: 'Acute Psychiatric', label: 'Acute Psychiatric' },
    { value: 'Routine', label: 'Routine' },
    { value: 'StepUp', label: 'Step Up' },
    { value: 'Secured', label: 'Secured' }
  ];

  // Status styles from updateCard.md specification (canonical snake_case keys)
  const STATUS_STYLES = {
    searching:         { badge:'#6B7280', badgeText: '#ffffff', bg:'#F3F4F6', icon:'⟳', label: 'Searching' },
    packet_sent:       { badge:'#2563EB', badgeText: '#ffffff', bg:'#EFF6FF', icon:'📤', label: 'Packet sent' },
    accepted:          { badge:'#16A34A', badgeText: '#000000', bg:'#ECFDF5', icon:'✓', label: 'Accepted' },
    waiting_transport: { badge:'#4F46E5', badgeText: '#ffffff', bg:'#EEF2FF', icon:'🚗', label: 'Waiting transport' },
    pending_review:    { badge:'#D97706', badgeText: '#000000', bg:'#FFFBEB', icon:'⏰', label: 'Pending review' },
    no_beds:           { badge:'#334155', badgeText: '#ffffff', bg:'#F1F5F9', icon:'🛏️', label: 'No beds' },
    denied:            { badge:'#DC2626', badgeText: '#ffffff', bg:'#FEF2F2', icon:'✗', label: 'Denied' },
    canceled:          { badge:'#0EA5E9', badgeText: '#000000', bg:'#F0F9FF', icon:'🚫', label: 'Canceled' },
    expired:           { badge:'#52525B', badgeText: '#ffffff', bg:'#FAFAFA', icon:'⧗', label: 'Hold expired' },
    reassess_required: { badge:'#C026D3', badgeText: '#ffffff', bg:'#F8E8FF', icon:'⚠️', label: 'Reassess required' }
  };

  function injectStatusThemeStyles() {
    if (typeof document === 'undefined') return;
    const styleId = 'status-theme-styles';
    const existing = document.getElementById(styleId);
    const statusCss = Object.entries(STATUS_STYLES)
      .map(([key, style]) => {
        const badgeColor = style.badge || '#6B7280';
        const badgeTextColor = style.badgeText || pickBadgeTextColor(badgeColor);
        const backgroundColor = style.bg || '#F3F4F6';
        return `
          .search-row[data-status-key="${key}"] { background:${backgroundColor}; border-left:3px solid ${badgeColor}; }
          .search-row[data-status-key="${key}"] .status-badge { background:${badgeColor}; color:${badgeTextColor}; }
          .history-entry[data-status-key="${key}"] .status-badge { background:${badgeColor}; color:${badgeTextColor}; }
        `;
      })
      .join('\n');

    // Add facet chip base styles
    const facetCss = `
      .facet-chips {
        display: flex;
        gap: 6px;
        margin: 8px 0 4px 0;
        flex-wrap: wrap;
      }
      .facet-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 6px;
        font-size: 0.75rem;
        background: rgba(0,0,0,0.05);
        border: 1px solid rgba(0,0,0,0.1);
        border-radius: 12px;
        color: rgba(0,0,0,0.7);
        line-height: 1.2;
      }
      .chip-ic {
        font-size: 0.7rem;
        opacity: 0.8;
      }
    `;

    // Add action tag styles
    const actionTagCss = `
      .action-tags {
        display: flex;
        gap: 8px;
        margin: 6px 0 8px 0;
        flex-wrap: wrap;
      }
      .action-tag {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        font-size: 0.8rem;
        background: linear-gradient(135deg, #fef3c7, #fed7aa);
        border: 1px solid #f59e0b;
        border-radius: 16px;
        color: #92400e;
        font-weight: 500;
        box-shadow: 0 1px 2px rgba(0,0,0,0.1);
      }
      .action-tag .tag-icon {
        font-size: 0.9rem;
      }
      .action-tags-section {
        margin: 12px 0;
        padding: 12px;
        border: 2px solid #3b82f6;
        border-radius: 4px;
        background: #dbeafe !important;
        min-height: 60px;
      }
      .action-tags-section label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        font-size: 1rem;
        color: #1e40af;
        text-transform: uppercase;
      }
      .action-tags-selector {
        margin: 8px 0;
      }
      .tag-category {
        margin-bottom: 12px;
      }
      .tag-category h4 {
        margin: 0 0 6px 0;
        font-size: 0.85rem;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .tag-options {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
      }
      .tag-option {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        font-size: 0.75rem;
        background: #f9fafb;
        border: 1px solid #d1d5db;
        border-radius: 12px;
        color: #374151;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .tag-option:hover {
        background: #f3f4f6;
        border-color: #9ca3af;
      }
      .tag-option.active {
        background: #fef3c7;
        border-color: #f59e0b;
        color: #92400e;
      }
      .action-tags-current {
        margin: 8px 0;
        min-height: 32px;
      }
      .current-tag {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        margin: 2px 4px 2px 0;
        font-size: 0.75rem;
        background: #fef3c7;
        border: 1px solid #f59e0b;
        border-radius: 12px;
        color: #92400e;
      }
      .remove-tag {
        margin-left: 4px;
        padding: 0 4px;
        background: none;
        border: none;
        color: #b45309;
        cursor: pointer;
        font-weight: bold;
        font-size: 0.9rem;
        line-height: 1;
      }
      .remove-tag:hover {
        color: #dc2626;
      }
      .no-tags {
        color: #6b7280;
        font-style: italic;
        font-size: 0.8rem;
        margin: 0;
      }
    `;

    const css = statusCss + '\n' + facetCss + '\n' + actionTagCss;

    if (existing) {
      existing.textContent = css;
    } else {
      const styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.textContent = css;
      document.head.appendChild(styleEl);
    }
  }

  const STATUS_KEY_ALIASES = {
    searching: 'searching',
    Searching: 'searching',
    PendingReview: 'pending_review',
    'pending_review': 'pending_review',
    AwaitingCallback: 'pending_review',
    AwaitingFax: 'pending_review',
    AwaitingRounds: 'pending_review',
    PacketSent: 'packet_sent',
    WaitingTransport: 'waiting_transport',
    Accepted: 'accepted',
    Denied: 'denied',
    NoBeds: 'no_beds',
    Canceled: 'canceled',
    Cancelled: 'canceled',
    Expired: 'expired',
    ReassessRequired: 'reassess_required',
    Reassess: 'reassess_required'
  };

  function hexToRgb(hex = '') {
    const normalized = hex.trim().replace('#', '');
    if (![3, 6].includes(normalized.length)) return null;
    const chunkSize = normalized.length === 3 ? 1 : 2;
    const expand = (value) => (value.length === 1 ? value.repeat(2) : value);
    const parts = normalized.match(new RegExp(`.{${chunkSize}}`, 'g')) || [];
    if (parts.length !== 3) return null;
    const [r, g, b] = parts.map((part) => parseInt(expand(part), 16));
    if ([r, g, b].some((value) => Number.isNaN(value))) return null;
    return [r, g, b];
  }

  function srgbToLinearComponent(component) {
    const srgb = component / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
  }

  function luminance(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return null;
    const [r, g, b] = rgb.map(srgbToLinearComponent);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  function contrastRatio(hexA, hexB) {
    const lumA = luminance(hexA);
    const lumB = luminance(hexB);
    if (lumA === null || lumB === null) return null;
    const [light, dark] = lumA > lumB ? [lumA, lumB] : [lumB, lumA];
    return (light + 0.05) / (dark + 0.05);
  }

  function pickBadgeTextColor(badgeHex, threshold = 4.5) {
    const whiteContrast = contrastRatio(badgeHex, '#ffffff');
    const blackContrast = contrastRatio(badgeHex, '#000000');

    if (whiteContrast !== null && whiteContrast >= threshold) {
      return '#ffffff';
    }

    if (blackContrast !== null && blackContrast >= threshold) {
      return '#000000';
    }

    if (whiteContrast === null && blackContrast === null) {
      return '#ffffff';
    }

    if ((whiteContrast || 0) >= (blackContrast || 0)) {
      return '#ffffff';
    }

    return '#000000';
  }

  function normalizeStatusKey(raw) {
    if (raw === undefined || raw === null) return 'searching';
    if (STATUS_KEY_ALIASES[raw]) return STATUS_KEY_ALIASES[raw];
    const compact = String(raw)
      .toLowerCase()
      .trim()
      .replace(/\s+|[-–—]/g, '_')
      .replace(/[^a-z0-9_]/g, '');
    if (STATUS_KEY_ALIASES[compact]) return STATUS_KEY_ALIASES[compact];
    if (STATUS_STYLES[compact]) return compact;
    return 'searching';
  }

  function getStatusPresentation(rawStatus) {
    const key = normalizeStatusKey(rawStatus);
    const style = STATUS_STYLES[key] || STATUS_STYLES.searching;
    const badgeColor = style.badge || '#6B7280';
    const badgeTextColor = style.badgeText || pickBadgeTextColor(badgeColor);
    return {
      key,
      label: style.label || key.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase()),
      icon: style.icon || '',
      badgeColor,
      badgeTextColor,
      backgroundColor: style.bg || '#F3F4F6'
    };
  }

  // Facet icons and labels
  const FACET_ICONS = {
    transport: { icon: '🚗', label: 'Transport' },
    accepted:  { icon: '✓',  label: 'Accepted' },
    hold:      { icon: '🕒', label: 'Hold' },
    docs:      { icon: '📤', label: 'Docs sent' },
    recheck:   { icon: '🔁', label: 'Recheck' },
    insurance: { icon: '🧾', label: 'Insurance' },
    reassess:  { icon: '⚠️', label: 'Reassess' },
    note:      { icon: '📝', label: 'Note' }
  };

  // display/order priority for chips
  const FACET_ORDER = ['transport','accepted','hold','docs','recheck','insurance','reassess','note'];

  // === Stage derivation (one primary state for color) ===
  function deriveStage(events = []) {
    const ev = [...(events || [])].sort((a,b) => b.ts.localeCompare(a.ts));
    const has = (pred) => ev.find(pred);

    if (has(e => e.type==='call_outcome' && e.payload?.outcome==='patient_denies')) return 'canceled';
    if (has(e => e.type==='call_outcome' && e.payload?.outcome==='facility_denied')) return 'denied';
    if (has(e => e.type==='status_override' && e.payload?.status==='expired')) return 'expired';
    if (has(e => e.type==='transport_scheduled')) return 'waiting_transport';
    if (has(e => e.type==='acceptance')) return 'accepted';
    if (has(e => e.type==='docs_sent' || e.type==='packet_sent')) return 'packet_sent';
    if (has(e => e.type==='call_outcome' && e.payload?.outcome==='no_beds')) return 'no_beds';
    if (has(e => e.type==='note' && e.payload?.reassess === true)) return 'reassess_required';
    if (has(e => e.type==='call_outcome' && e.payload?.awaiting === 'rounds')) return 'pending_review';
    return 'searching';
  }

  // === Facet derivation (orthogonal truths) ===
  function deriveFacets(events = []) {
    const ev = [...(events || [])].sort((a,b)=>b.ts.localeCompare(a.ts));
    const facets = new Set();

    if (ev.find(e => e.type==='acceptance')) facets.add('accepted');
    const hold = ev.find(e => e.type==='acceptance' && e.payload?.hold_until);
    if (hold && new Date(hold.payload.hold_until) > new Date()) facets.add('hold');

    if (ev.find(e => e.type==='transport_scheduled')) facets.add('transport');
    if (ev.find(e => e.type==='docs_sent' || e.type==='packet_sent')) facets.add('docs');

    const nb = ev.find(e => e.type==='call_outcome' && e.payload?.outcome==='no_beds' && e.payload?.recheck_at);
    if (nb && new Date(nb.payload.recheck_at) > new Date()) facets.add('recheck');

    if (ev.find(e => e.payload?.insurance_status)) facets.add('insurance');
    if (ev.find(e => e.payload?.reassess === true)) facets.add('reassess');
    if (ev.find(e => e.type==='note')) facets.add('note');

    // return in a stable visual order
    return FACET_ORDER.filter(f => facets.has(f));
  }

  // Build chips HTML (wraps in .facet-chips). Uses latest event data for labels.
  function getFacetChipsHtml(facets = [], events = []) {
    if (!facets.length) return '';
    const sorted = [...(events||[])].sort((a,b)=>b.ts.localeCompare(a.ts));
    const latest = (type) => sorted.find(e => e.type === type);

    const parts = facets.map((f) => {
      const meta = FACET_ICONS[f];
      if (!meta) return '';
      let label = meta.label;
      if (f === 'hold') {
        const a = latest('acceptance');
        if (a?.payload?.hold_until) label += ' ' + formatDisplayTimestamp(a.payload.hold_until);
      }
      if (f === 'transport') {
        const t = latest('transport_scheduled');
        if (t?.payload?.pickup_at) label += ' ' + formatDisplayTimestamp(t.payload.pickup_at);
      }
      if (f === 'docs') {
        const d = latest('docs_sent') || latest('packet_sent');
        if (Array.isArray(d?.payload?.docs) && d.payload.docs.length) {
          label += ': ' + d.payload.docs.join(', ');
        }
      }
      if (f === 'recheck') {
        const nb = latest('call_outcome');
        if (nb?.payload?.recheck_at) label += ' ' + formatDisplayTimestamp(nb.payload.recheck_at);
      }
      return `<span class="facet-chip" data-facet="${f}" title="${label}">
                <span class="chip-ic">${meta.icon}</span><span class="chip-label">${label}</span>
              </span>`;
    }).filter(Boolean);

    return `<div class="facet-chips">${parts.join(' ')}</div>`;
  }

  function formatDisplayTimestamp(value) {
    if (!value) return '';
    try {
      const date = new Date(value);
      const options = { hour: '2-digit', minute: '2-digit' };
      return date.toLocaleString('en-US', options);
    } catch (err) {
      return value;
    }
  }

  const channelLabels = {
    fax: 'Fax',
    phone: 'Phone',
    email: 'Secure Email',
    portal: 'Provider Portal'
  };

  const statusOptions = [
    { value: 'searching', label: 'Searching' },
    { value: 'pending_review', label: 'Pending review' },
    { value: 'packet_sent', label: 'Packet sent' },
    { value: 'waiting_transport', label: 'Waiting transport' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'denied', label: 'Denied' },
    { value: 'no_beds', label: 'No beds' },
    { value: 'canceled', label: 'Canceled' },
    { value: 'expired', label: 'Hold expired' },
    { value: 'reassess_required', label: 'Reassess required' }
  ];

  const quickReasonDefinitions = [
    { value: 'ACCEPT_PHONE', label: 'Bed hold confirmed — phone', status: 'accepted', requiresClinician: true },
    { value: 'PACKET_SENT', label: 'Packet sent to facility', status: 'packet_sent' },
    { value: 'PENDING_AWAITING_ROUNDS', label: 'Waiting for intake rounds', status: 'pending_review' },
    { value: 'PA_SUBMITTED', label: 'PA submitted', status: 'pending_review', updatesPAStatus: 'SUBMITTED' },
    { value: 'PA_APPROVED', label: 'PA approved', status: 'accepted', updatesPAStatus: 'APPROVED' },
    { value: 'PA_DENIED', label: 'PA denied', status: 'denied', updatesPAStatus: 'DENIED', requiresReason: true },
    { value: 'DENY_NO_PROGRAM', label: 'Denied — no program', status: 'denied', requiresReason: true },
    { value: 'NOBEDS_FULL_UNIT', label: 'No beds — recheck scheduled', status: 'no_beds', requiresRecheck: true },
    { value: 'WAITING_TRANSPORT', label: 'Waiting for transport pickup', status: 'waiting_transport' }
  ];

  const drawerReasonOptions = [
    { value: 'ACCEPT_PHONE', label: 'Accept — Phone confirmation' },
    { value: 'ACCEPT_EMAIL', label: 'Accept — Email confirmation' },
    { value: 'PACKET_SENT', label: 'Packet sent' },
    { value: 'PENDING_AWAITING_ROUNDS', label: 'Pending — Awaiting rounds' },
    { value: 'DENY_NO_PROGRAM', label: 'Denied — No program' },
    { value: 'DENY_PAYER_MISMATCH', label: 'Denied — Payer mismatch' },
    { value: 'NOBEDS_FULL_UNIT', label: 'No beds — Full unit' },
    { value: 'CANCEL_USER', label: 'Canceled by user' }
  ];


  const staffDirectory = {
    mlee: 'Morgan Lee',
    kdial: 'Kevin Dial',
    transfer: 'Transfer Center',
    chen: 'CRS Chen',
    unassigned: 'Unassigned'
  };

  const patientScenarios = newPatientScenarios;

  // Add sample action tags to searches for demonstration
  patientScenarios.forEach((scenario) => {
    scenario.searches.forEach((search, index) => {
      // Add some sample action tags to demonstrate the functionality
      if (index === 0) {
        search.actionTags = ['waiting_transport', 'contact_patient'];
      } else if (index === 1) {
        search.actionTags = ['verify_insurance', 'send_packet'];
      } else if (index === 2 && scenario.searches.length > 2) {
        search.actionTags = ['waiting_auth', 'follow_up_call'];
      }
    });
  });

  patientScenarios.forEach((scenario) => {
    if (commitmentFixtures[scenario.id]) {
      scenario.commitmentDetails = commitmentFixtures[scenario.id];
    }
  });

  patientScenarios.forEach((scenario) => {
    if (commitmentFixtures[scenario.id]) {
      scenario.commitmentDetails = commitmentFixtures[scenario.id];
    }
  });

  const facilityDirectory = facilityDirectoryData.map((facility) => {
    const finderData = transformForFacilityFinder(facility);
    const combinedTags = [...new Set([...(facility.tags || []), ...(finderData.services || [])])];
    const locationSummary = [facility.city, facility.state].filter(Boolean).join(', ');
    return {
      ...finderData,
      availability: finderData.availability || 'Call to verify',
      verified: finderData.verified || '',
      tags: combinedTags,
      locationSummary: locationSummary || null,
      fax: facility.fax || null,
      website: facility.website || null,
      city: facility.city || null,
      state: facility.state || null,
      operationalData: facility.operationalData || {},
      sourceFacility: facility
    };
  });

  const auditEvents = [
    { ts: '09/22 09:18', user: 'J. Chen', action: 'Reassess flag set', detail: 'New tox result requires provider review (S2).' },
    { ts: '09/22 08:58', user: 'Morgan Lee', action: 'Packet sent', detail: 'Friends Hospital secure fax (S1).' },
    { ts: '09/21 18:35', user: 'Morgan Lee', action: 'Acceptance recorded', detail: 'Sunrise Treatment Center selected (S3).' }
  ];

  const panelLayoutDefaults = [
    { key: 'activeSearches', name: 'Active Placement Searches', column: 'Center', order: 1, visible: true, collapsed: false, locked: true },
    { key: 'runningNote', name: 'Running Note', column: 'Left', order: 1, visible: true, collapsed: false, locked: false },
    { key: 'contactPlanner', name: 'Contact Planner', column: 'Left', order: 2, visible: true, collapsed: false, locked: false },
    { key: 'patientList', name: 'Patient List Preview', column: 'Right', order: 1, visible: true, collapsed: false, locked: false },
    { key: 'workflow', name: 'Workflow Timeline', column: 'Right', order: 2, visible: true, collapsed: false, locked: false },
    { key: 'steward', name: 'Directory Steward Console', column: 'Right', order: 3, visible: true, collapsed: true, locked: false },
    { key: 'audit', name: 'Audit & Privacy Review', column: 'Right', order: 4, visible: true, collapsed: true, locked: false },
    { key: 'commitment', name: 'Commitment Summary & Panel', column: 'Left', order: 3, visible: true, collapsed: false, locked: false }
  ];

  const workspaceTabs = ['noteTab', 'finderTab', 'tasksTab', 'activityTab'];

  const panelStorageKey = 'crc-ssot-panel-visibility';

  const commitmentSettingsKey = 'crc-ssot-commitment-settings';

  // Event-driven bed search model (from updateCard.md spec)
  const BedSearchEventTypes = {
    CALL_OUTCOME: 'call_outcome',
    DOCS_SENT: 'docs_sent', 
    PACKET_SENT: 'packet_sent',
    ACCEPTANCE: 'acceptance',
    TRANSPORT_SCHEDULED: 'transport_scheduled',
    NOTE: 'note',
    STATUS_OVERRIDE: 'status_override'
  };

  // Status derivation from events (canonical snake_case, used by presentation)
  function deriveSearchStatus(events = []) {
    return deriveStage(events);
  }

  // Action Tags System - actionable items that can be added/removed
  const ACTION_TAG_OPTIONS = [
    { id: 'waiting_transport', label: 'Waiting on Transport', icon: '🚐', category: 'transport' },
    { id: 'schedule_transport', label: 'Schedule Transport', icon: '📅', category: 'transport' },
    { id: 'waiting_uds', label: 'Waiting on UDS', icon: '🧪', category: 'docs' },
    { id: 'waiting_auth', label: 'Waiting on Authorization', icon: '📋', category: 'insurance' },
    { id: 'schedule_intake', label: 'Schedule Intake', icon: '📝', category: 'process' },
    { id: 'verify_insurance', label: 'Verify Insurance', icon: '💳', category: 'insurance' },
    { id: 'contact_patient', label: 'Contact Patient', icon: '📞', category: 'communication' },
    { id: 'contact_family', label: 'Contact Family', icon: '👨‍👩‍👧', category: 'communication' },
    { id: 'send_packet', label: 'Send Packet', icon: '📦', category: 'docs' },
    { id: 'follow_up_call', label: 'Follow-up Call Needed', icon: '☎️', category: 'communication' },
    { id: 'bed_confirmation', label: 'Bed Confirmation Needed', icon: '🛏️', category: 'process' },
    { id: 'medical_clearance', label: 'Medical Clearance Pending', icon: '🏥', category: 'docs' },
    { id: 'social_work_eval', label: 'Social Work Evaluation', icon: '👩‍⚕️', category: 'process' },
    { id: 'level_of_care', label: 'Level of Care Review', icon: '📊', category: 'process' }
  ];

  // Action tag management functions
  function getActionTags(search) {
    return search.actionTags || [];
  }

  function addActionTag(search, tagId) {
    if (!search.actionTags) search.actionTags = [];
    if (!search.actionTags.includes(tagId)) {
      search.actionTags.push(tagId);
      // Add event to history
      const tagDef = ACTION_TAG_OPTIONS.find(t => t.id === tagId);
      if (tagDef && search.events) {
        search.events.push({
          type: 'action_tag_added',
          tag_id: tagId,
          tag_label: tagDef.label,
          user_id: 'current_user',
          ts: new Date().toISOString(),
          details: `Added action tag: ${tagDef.label}`
        });
      }
    }
  }

  function removeActionTag(search, tagId) {
    if (!search.actionTags) return;
    const index = search.actionTags.indexOf(tagId);
    if (index > -1) {
      search.actionTags.splice(index, 1);
      // Add event to history
      const tagDef = ACTION_TAG_OPTIONS.find(t => t.id === tagId);
      if (tagDef && search.events) {
        search.events.push({
          type: 'action_tag_removed',
          tag_id: tagId,
          tag_label: tagDef.label,
          user_id: 'current_user',
          ts: new Date().toISOString(),
          details: `Removed action tag: ${tagDef.label}`
        });
      }
    }
  }

  function renderActionTags(search) {
    const tags = getActionTags(search);
    if (!tags.length) return '';
    
    return `
      <div class="action-tags">
        ${tags.map(tagId => {
          const tagDef = ACTION_TAG_OPTIONS.find(t => t.id === tagId);
          if (!tagDef) return '';
          return `
            <div class="action-tag" data-tag-id="${tagId}" data-category="${tagDef.category}">
              <span class="tag-icon">${tagDef.icon}</span>
              <span class="tag-label">${tagDef.label}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // Add event to search (with concurrency control)
  function addSearchEvent(search, eventType, payload, userId = 'current_user') {
    if (!search.events) search.events = [];
    
    const event = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      search_id: search.id,
      ts: new Date().toISOString(),
      user_id: userId,
      type: eventType,
      payload: payload || {},
      version: (search.events.length + 1)
    };
    
    search.events.push(event);
    
    // Update derived status and timestamp
    search.status = deriveSearchStatus(search.events);
    search.updated = formatTimestamp(new Date());
    
    // Add to legacy searchHistory for backwards compatibility
    if (!search.searchHistory) search.searchHistory = [];
    search.searchHistory.unshift({
      ts: search.updated,
      status: search.status,
      facility: search.facilityName,
      detail: formatEventDetail(event)
    });
    
    return event;
  }

  // Format event for display
  function formatEventDetail(event) {
    const { type, payload } = event;
    switch (type) {
      case 'call_outcome':
        if (payload.outcome === 'no_beds') return `No beds available${payload.recheck_time ? '; recheck at ' + payload.recheck_time : ''}`;
        if (payload.outcome === 'bed_available') return 'Bed available for placement';
        if (payload.outcome === 'patient_denies') return 'Patient declined placement';
        if (payload.outcome === 'facility_denied') return 'Facility declined patient';
        return `Call outcome: ${payload.outcome}`;
      case 'docs_sent':
        return `Documents sent: ${payload.docs ? payload.docs.join(', ') : 'clinical packet'}`;
      case 'packet_sent':
        return 'Clinical packet sent to facility';
      case 'acceptance':
        return `Placement accepted${payload.hold_until ? ' (hold until ' + payload.hold_until + ')' : ''}`;
      case 'transport_scheduled':
        return `Transport scheduled for ${payload.pickup_at}`;
      case 'note':
        return payload.text || 'Note added';
      default:
        return `${type}: ${JSON.stringify(payload)}`;
    }
  }

  const defaultPanelVisibility = {
    noteTab: true,
    finderTab: true,
    tasksTab: true,
    activityTab: true,
    contactPlanner: true,
    patientList: true,
    workflow: true,
    steward: true,
    audit: true,
    commitment: true
  };

  const defaultCommitmentSettings = {
    visible: true,
    collapsedByDefault: false,
    autoExpandOn302: true,
    autoExpandOnPending: true,
    sections: {
      docs: true,
      schedule: true,
      facilities302: true,
      quickActions: true,
      quickUpdate: true,
      guardrails: true
    },
    items: {
      // Commitment Status items
      statusIndicator: true,
      statusType: true,
      statusStartDate: true,
      statusExpiryDate: true,
      statusProgress: true,
      statusNextAction: true,
      
      // Legal Documentation items
      docsHeader: true,
      docsProgressBar: true,
      docsChecklist: true,
      docsBlockersMessage: true,
      docsPetition: true,
      docsValidation: true,
      docsPacket: true,
      docsLegalSummary: true,
      docsUpload: true,
      docsReview: true,
      
      // Court & Legal Schedule items
      scheduleHeader: true,
      scheduleNextEvent: true,
      schedulePriorEvents: true,
      scheduleAddEvent: true,
      schedulePrintPacket: true,
      scheduleExportSummary: true,
      
      // 302-capable accepting facilities items
      facilitiesHeader: true,
      facilitiesFilters: true,
      facilitiesList: true,
      facilitiesOpenFinder: true,
      
      // Quick Actions items
      actionsHeader: true,
      actionsButtons: true,
      actionsGuardrails: true,
      actionsWarnings: true,
      actionsValidation: true,
      
      // Quick Update items
      updateHeader: true,
      updateForm: true,
      updateSideEffects: true,
      updateSaveButton: true
    }
  };

  let patientListOverrides = null;

function loadStoredPanelVisibility() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return null;
      }
      const raw = window.localStorage.getItem(panelStorageKey);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
      return null;
    } catch (err) {
      console.warn('Unable to load panel visibility preferences', err);
      return null;
    }
  }

  function deepCloneCommitmentSettings(source) {
    return {
      visible: source.visible,
      collapsedByDefault: source.collapsedByDefault,
      autoExpandOn302: source.autoExpandOn302,
      autoExpandOnPending: source.autoExpandOnPending,
      sections: { ...source.sections },
      items: { ...source.items }
    };
  }

  function loadCommitmentSettings() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return deepCloneCommitmentSettings(defaultCommitmentSettings);
      }
      const raw = window.localStorage.getItem(commitmentSettingsKey);
      if (!raw) {
        return deepCloneCommitmentSettings(defaultCommitmentSettings);
      }
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const result = deepCloneCommitmentSettings(defaultCommitmentSettings);
        if (parsed.visible !== undefined) result.visible = parsed.visible;
        if (parsed.collapsedByDefault !== undefined) result.collapsedByDefault = parsed.collapsedByDefault;
        if (parsed.autoExpandOn302 !== undefined) result.autoExpandOn302 = parsed.autoExpandOn302;
        if (parsed.autoExpandOnPending !== undefined) result.autoExpandOnPending = parsed.autoExpandOnPending;
        result.sections = { ...defaultCommitmentSettings.sections, ...(parsed.sections || {}) };
        result.items = { ...defaultCommitmentSettings.items, ...(parsed.items || {}) };
        return result;
      }
      return deepCloneCommitmentSettings(defaultCommitmentSettings);
    } catch (err) {
      console.warn('Unable to load commitment settings', err);
      return deepCloneCommitmentSettings(defaultCommitmentSettings);
    }
  }

  function saveCommitmentSettings(settings) {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return;
      }
      window.localStorage.setItem(commitmentSettingsKey, JSON.stringify(settings));
    } catch (err) {
      console.warn('Unable to save commitment settings', err);
    }
  }

  function getCommitmentSettings() {
    return deepCloneCommitmentSettings(commitmentSettingsState);
  }

  function updateCommitmentSettings(patch = {}) {
    const next = deepCloneCommitmentSettings(commitmentSettingsState);
    const keys = ['visible', 'collapsedByDefault', 'autoExpandOn302', 'autoExpandOnPending'];
    keys.forEach((key) => {
      if (patch[key] !== undefined) {
        next[key] = patch[key];
      }
    });
    if (patch.sections) {
      next.sections = { ...next.sections, ...patch.sections };
    }
    if (patch.items) {
      next.items = { ...next.items, ...patch.items };
    }
    commitmentSettingsState = next;
    saveCommitmentSettings(commitmentSettingsState);
  }

  function resetCommitmentSettings() {
    commitmentSettingsState = deepCloneCommitmentSettings(defaultCommitmentSettings);
    saveCommitmentSettings(commitmentSettingsState);
  }

  function resolvePanelVisibility() {
    const stored = loadStoredPanelVisibility();
    return { ...defaultPanelVisibility, ...(stored || {}) };
  }

  let commitmentSettingsState = loadCommitmentSettings();

  const state = {
    currentPatientId: patientScenarios[0].id,
    searchFilters: {
      chip: 'all',
      status: '',
      facility: '',
      channel: '',
      time: ''
    },
    patientListFilters: {
      chip: 'all',
      status: '',
      assigned: '',
      sortBy: '',
      sortDir: 'asc'
    },
    session: {
      quickNotes: {},
      overrideReasons: {},
      selectedFacility: {},
      reassessOverride: {},
      timelineIndex: {},
      activities: {},
      contacts: {},
      panelVisibility: resolvePanelVisibility(),
      commitmentExpanded: {}
    },
    ui: {
      pendingConflict: null,
      pendingDrawer: null,
      pendingPopover: null,
      activeTab: 'noteTab',
      settingsKeyHandler: null
    }
  };

  if (commitmentSettingsState.visible === false) {
    state.session.panelVisibility.commitment = false;
  }

  const dom = {};
  let toastTimer = null;

  function getReasonDefinition(code) {
    return quickReasonDefinitions.find((item) => item.value === code) || null;
  }

  function cacheDom() {
    const ids = [
      'patientSelect', 'patientName', 'patientMrn', 'patientFin', 'patientConsent', 'patientPart2',
      'noteUpdated', 'asamField', 'assessmentTs', 'matNeeds', 'threeOhTwo', 'acuity', 'placementNeeded',
      'saveQuickUpdate', 'simulatePacket', 'postTox', 'quickHelp', 'quickFacilitySelect', 'quickReason',
      'quickEta', 'quickNote', 'quickApplyStatus', 'quickApplyAudit', 'quickApplySsot', 'quickConfirmation',
      'quickTargetFacility', 'quickTargetSsot', 'contactNext', 'contactLast', 'logCallAttempt', 'markPacketSent', 'scanConsent',
      'searchTimeFilter', 'searchStatusFilter', 'searchFacilityFilter', 'searchChannelFilter', 'searchList',
      'searchHistory', 'noteTab', 'finderTab', 'tasksTab', 'activityTab',
      'panelActiveSearches', 'panelContactPlanner', 'panelPatientList', 'panelWorkflow', 'panelSteward', 'panelAudit',
      'statusFilter', 'assignedFilter', 'patientListBody', 'taskList', 'handoffSummary',
      'sendHandoff', 'results', 'filterAsam', 'filterMat', 'filter302', 'filterPayer', 'filterDistance',
      'filterAcuteBh', 'filterAcuteMed', 'hideStale', 'showBlocks', 'facilitySearch', 'clearSearch',
      'activityLog', 'activityForm', 'activityAction', 'activityOutcome', 'activityNotes', 'clearActivity',
      'timelineList', 'advanceTimeline', 'resetTimeline', 'auditList', 'toast', 'breakGlass', 'finalizeTransfer',
      'storyboard', 'dismissBanner', 'addSearchBtn', 'addMultipleSearchBtn', 'searchPopover', 'closeSearchPopover',
      'searchFacilities', 'searchFacilityChips', 'searchAddOther', 'searchVerify', 'searchPublish', 'searchCancel',
      'searchNotes', 'searchResults', 'searchTakes302', 'searchAcuteMed', 'searchAcuteBh', 'searchSecureBh',
      'searchDualDx', 'searchBhMed', 'searchInNetwork', 'searchChannelFax', 'searchChannelDirect', 'searchChannelEmr',
      'packetModal', 'packetPreview', 'closePacket', 'packetFinalize', 'packetPrint', 'openSettings', 'settingsModal',
      'closeSettings', 'saveSettings', 'resetSettings', 'settingsSummary', 'openDowntime', 'openDirectory', 'exportAudit',
      'facilityDrawer', 'drawerTitle', 'drawerSubtitle', 'drawerStatus', 'drawerReason', 'drawerAssigned',
      'drawerSummary', 'drawerClinician', 'drawerClinicianRole', 'drawerClinicianNpi', 'drawerRep', 'drawerRepContact',
      'drawerUnit', 'drawerBedHold', 'drawerReference', 'drawerConditions', 'drawerCancelOthers', 'drawerChannels',
      'drawerDocuments', 'drawerDelivery', 'drawerTransportRequired', 'drawerTransportMode', 'drawerTransportVendor',
      'drawerTransportPickup', 'drawerTransportDestination', 'drawerTransportEta', 'drawerNotes', 'drawerAttachments', 'drawerAudit',
      'drawerSave', 'drawerClose', 'drawerCancel', 'drawerSavePublish', 'drawerSaveChanges', 'drawerAcceptanceSection',
      'editInfoPopover', 'closeEditPopover', 'popoverStatus', 'popoverReason', 'popoverClinician', 'popoverBedHold',
      'popoverSummary', 'openDrawerFromPopover', 'cancelEditPopover', 'saveEditPopover',
      'actionTagsSelector', 'actionTagsCurrent',
      'conflictModal', 'closeConflict', 'conflictMessage', 'conflictForm', 'conflictAttestation', 'cancelConflict', 'confirmConflict',
      'quickHelpModal', 'closeQuickHelp', 'commitmentSummary', 'commitmentStatusPanel'
    ];

    ids.forEach((id) => {
      dom[id] = document.getElementById(id);
    });

    // Debug: Check if action tags elements exist
    if (!document.getElementById('actionTagsSelector')) {
      showToast('DEBUG: actionTagsSelector not found in HTML');
    }
    if (!document.getElementById('actionTagsCurrent')) {
      showToast('DEBUG: actionTagsCurrent not found in HTML');
    }

    dom.navTabs = document.querySelectorAll('.workflow-nav li');
  }

  function findAncestor(element, selector) {
    let current = element;
    while (current && current !== document.body) {
      if (current.matches && current.matches(selector)) {
        return current;
      }
      current = current.parentElement;
    }
    return null;
  }

  function populateStaticSelects() {
    if (dom.asamField) {
      dom.asamField.innerHTML = asamOptions
        .map((opt) => `<option value="${opt.value}">${opt.label}</option>`)
        .join('');
    }

    if (dom.matNeeds) {
      dom.matNeeds.innerHTML = matOptions
        .map((opt) => `<option value="${opt.value}">${opt.label}</option>`)
        .join('');
    }

    if (dom.threeOhTwo) {
      dom.threeOhTwo.innerHTML = commitmentOptions
        .map((opt) => `<option value="${opt.value}">${opt.label}</option>`)
        .join('');
    }

    if (dom.acuity) {
      dom.acuity.innerHTML = acuityOptions
        .map((opt) => `<option value="${opt.value}">${opt.label}</option>`)
        .join('');
    }

    if (dom.filterMat) {
      dom.filterMat.innerHTML = ['<option value="">Any</option>', ...matOptions.map((opt) => `<option value="${opt.value}">${opt.label}</option>`)].join('');
    }

    if (dom.filterAsam) {
      dom.filterAsam.innerHTML = asamOptions
        .map((opt) => `<option value="${opt.value}">${opt.label}</option>`)
        .join('');
    }

    if (dom.quickReason) {
      dom.quickReason.innerHTML = quickReasonDefinitions
        .map((reason) => `<option value="${reason.value}">${reason.label}</option>`)
        .join('');
      dom.quickReason.value = quickReasonDefinitions[0]?.value || '';
    }

    if (dom.drawerStatus) {
      dom.drawerStatus.innerHTML = statusOptions
        .map((item) => `<option value="${item.value}">${item.label}</option>`)
        .join('');
    }

    if (dom.drawerReason) {
      dom.drawerReason.innerHTML = drawerReasonOptions
        .map((item) => `<option value="${item.value}">${item.label}</option>`)
        .join('');
    }

    if (dom.drawerAssigned) {
      dom.drawerAssigned.innerHTML = Object.entries(staffDirectory)
        .map(([key, name]) => `<option value="${key}">${name}</option>`)
        .join('');
    }

    const facilitySet = new Set();
    patientScenarios.forEach((patient) => {
      patient.searches.forEach((search) => {
        if (search && search.facilityId) {
          facilitySet.add(search.facilityId);
        }
      });
    });

    const uniqueFacilities = Array.from(facilitySet).map((id) => {
      const facility = facilityDirectory.find((f) => f.id === id);
      return facility ? { id: facility.id, name: facility.name } : { id, name: id };
    });

    if (dom.searchFacilityFilter) {
      dom.searchFacilityFilter.innerHTML = ['<option value="">All Facilities</option>', ...uniqueFacilities.map((f) => `<option value="${f.id}">${f.name}</option>`)].join('');
    }

    const uniquePayers = ['Jefferson Medicaid', 'Independence Blue Cross', 'Medicare Advantage'];
    if (dom.filterPayer) {
      dom.filterPayer.innerHTML = uniquePayers.map((p, idx) => `<option value="${idx === 0 ? 'Jefferson Medicaid' : p}">${p}</option>`).join('');
      dom.filterPayer.insertAdjacentHTML('afterbegin', '<option value="">Any</option>');
    }
  }

  function populateQuickFacilityOptions(patient) {
    if (!dom.quickFacilitySelect) return;
    const rows = patient.searches || [];
    const options = rows.reduce((acc, search) => {
      if (!acc.some((item) => item.value === search.facilityId)) {
        acc.push({ value: search.facilityId, label: search.facilityName });
      }
      return acc;
    }, [{ value: '', label: 'Select facility' }]);
    dom.quickFacilitySelect.innerHTML = options
      .map((opt) => `<option value="${opt.value}">${opt.label}</option>`)
      .join('');
    if (options.length > 1) {
      dom.quickFacilitySelect.value = options[1].value;
    }
  }

  function populatePatientSelector() {
    if (!dom.patientSelect) return;
    dom.patientSelect.innerHTML = patientScenarios
      .map((patient) => `<option value="${patient.id}">${patient.label}</option>`)
      .join('');
    dom.patientSelect.value = state.currentPatientId;
  }

  function getCurrentPatient() {
    return patientScenarios.find((p) => p.id === state.currentPatientId) || patientScenarios[0];
  }

  function mapStatusToFilter(status) {
    const key = normalizeStatusKey(status);
    if (key === 'accepted') return 'accepted';
    if (key === 'denied') return 'denied';
    if (key === 'no_beds') return 'nobeds';
    if (key === 'canceled') return 'canceled';
    if (key === 'waiting_transport') return 'waiting';
    if (['pending_review', 'packet_sent', 'reassess_required'].includes(key)) return 'pending';
    if (key === 'expired') return 'expired';
    return 'searching';
  }

  function applySearchFilters(searches) {
    return searches.filter((search) => {
      if (state.searchFilters.chip !== 'all') {
        const chipMatch = mapStatusToFilter(search.status) === state.searchFilters.chip;
        if (!chipMatch) return false;
      }

      if (state.searchFilters.status) {
        if (mapStatusToFilter(search.status) !== state.searchFilters.status) return false;
      }

      if (state.searchFilters.facility) {
        if (search.facilityId !== state.searchFilters.facility) return false;
      }

      if (state.searchFilters.channel) {
        if (!search.channels.includes(state.searchFilters.channel)) return false;
      }

      if (state.searchFilters.time) {
        if (search.timeBucket !== state.searchFilters.time) return false;
      }

      return true;
    });
  }

  function renderPatientContext(patient) {
    if (!patient) return;
    dom.patientName.textContent = patient.identifiers.name;
    dom.patientMrn.textContent = patient.identifiers.mrn;
    dom.patientFin.textContent = patient.identifiers.fin;
    dom.patientConsent.textContent = patient.consent.act148 ? 'Granted' : 'Not on file';
    dom.patientPart2.textContent = patient.consent.part2 ? 'Granted' : 'Restricted';
  }

  function renderRunningNote(patient) {
    if (!patient) return;
    const note = patient.note;
    dom.noteUpdated.textContent = note.lastUpdated;
    const asamMatch = asamOptions.find((opt) => opt.value === note.asam);
    dom.asamField.value = asamMatch ? asamMatch.value : note.asam;
    dom.assessmentTs.value = formatTimestamp(note.assessmentTs);
    dom.matNeeds.value = note.matNeeds;
    dom.threeOhTwo.value = note.commitment || '';
    dom.acuity.value = note.acuity;
    dom.placementNeeded.value = note.placementNeeded;

    if (dom.overrideReason) {
      let override = state.session.overrideReasons[patient.id];
      if (override === undefined || override === null) {
        override = note.overrideReason;
      }
      dom.overrideReason.value = override || '';
    }

    if (dom.reassessFlag) {
      let reassessSetting = state.session.reassessOverride[patient.id];
      if (reassessSetting === undefined || reassessSetting === null) {
        reassessSetting = note.reassessFlag;
      }
      dom.reassessFlag.value = reassessSetting;
    }

    if (dom.transferStatus) {
      dom.transferStatus.value = note.transferStatus;
    }

    if (dom.selectedFacility) {
      let selectedFacility = state.session.selectedFacility[patient.id];
      if (selectedFacility === undefined || selectedFacility === null) {
        selectedFacility = note.selectedFacility;
      }
      dom.selectedFacility.value = selectedFacility;
    }

    if (dom.quickNotes) {
      let quickNote = state.session.quickNotes[patient.id];
      if (quickNote === undefined || quickNote === null) {
        quickNote = note.quickNotes;
      }
      dom.quickNotes.value = quickNote;
    }

    const commitmentSettings = getCommitmentSettings();
    const statusValue = dom.threeOhTwo ? dom.threeOhTwo.value : '';
    const panelAllowed = isPanelVisible('commitment') && commitmentSettings.visible !== false;

    if (!panelAllowed || !statusValue) {
      if (dom.commitmentSummary) {
        setElementVisibility(dom.commitmentSummary, false);
        dom.commitmentSummary.dataset.hasCommitment = 'false';
      }
      if (dom.commitmentStatusPanel) {
        setElementVisibility(dom.commitmentStatusPanel, false);
      }
      delete state.session.commitmentExpanded[patient.id];
      return;
    }

    renderCommitmentPanel({
      summaryContainer: dom.commitmentSummary,
      panelContainer: dom.commitmentStatusPanel,
      patient,
      status: statusValue,
      settings: commitmentSettings,
      expandedState: state.session.commitmentExpanded,
      setExpanded: (id, value) => {
        if (value === undefined) {
          delete state.session.commitmentExpanded[id];
        } else {
          state.session.commitmentExpanded[id] = value;
        }
      },
      showToast
    });
  }

  function renderContactPlanner(patient) {
    const contacts = state.session.contacts[patient.id] || patient.contact;
    dom.contactNext.textContent = contacts.next;
    dom.contactLast.textContent = contacts.last;
  }

  function renderActiveSearches(patient) {
    if (!dom.searchList) return;
    const searches = applySearchFilters(patient.searches);

    if (!searches.length) {
      dom.searchList.innerHTML = '<p class="hint">No placement searches match the current filters.</p>';
      return;
    }

    dom.searchList.innerHTML = searches
      .map((search) => {
        const status = getStatusPresentation(search.status);
        const channels = search.channels.map((ch) => channelLabels[ch] || ch).join(', ');
        const reasonText = search.status_reason_text || search.summary || '';
        const confirmation = search.lastMessage
          ? `<div class="search-inline-confirm">${search.lastMessage}</div>`
          : '';
  const rowStyle = `background:${status.backgroundColor}; background-color:${status.backgroundColor}; border-left: 3px solid ${status.badgeColor};`;
  const badgeStyle = `background:${status.badgeColor}; background-color:${status.badgeColor}; color:${status.badgeTextColor};`;

        // Generate timeline from events (updateCard.md spec)
        const events = search.events || [];
        const facets = deriveFacets(events);
        const facetsHtml = getFacetChipsHtml(facets, events);
        const actionTagsHtml = renderActionTags(search);
        const timelineHtml = events.length > 0 ? `
          <div class="search-timeline" data-search-id="${search.id}">
            <div class="timeline-toggle" data-action="toggle-timeline" data-search-id="${search.id}">
              <span class="timeline-label">Timeline (${events.length})</span>
              <span class="timeline-icon">▸</span>
            </div>
            <div class="timeline-content" style="display: none;">
              ${events.slice().reverse().map(event => `
                <div class="timeline-event">
                  <span class="event-time">${formatTimestamp(new Date(event.ts))}</span>
                  <span class="event-user">${staffDirectory[event.user_id] || event.user_id}</span>
                  <span class="event-detail">${formatEventDetail(event)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : '';

        return `
          <div class="search-row" data-search-id="${search.id}" data-status-key="${status.key}" style="${rowStyle}">
            <div class="search-header">
              <div class="search-facility">${search.facilityName}</div>
              <span class="status-badge" style="${badgeStyle}">${status.icon ? `${status.icon} ` : ''}${status.label}</span>
            </div>
            ${facetsHtml}
            ${actionTagsHtml}
            <div class="search-meta">
              <span>Updated: ${search.updated}</span>
              <span>Channels: ${channels}</span>
              <span>Assigned: ${staffDirectory[search.assignedTo] || 'CRC Team'}</span>
            </div>
            <div class="search-notes">
              <span>${reasonText}</span>
            </div>
            ${confirmation}
            ${timelineHtml}
            <div class="search-actions">
              <button class="ghost-btn" data-action="open-drawer" data-search-id="${search.id}">View details</button>
              <button class="ghost-btn" data-action="open-popover" data-search-id="${search.id}">Edit info</button>
              <button class="ghost-btn" data-action="record" data-search-id="${search.id}">Record acceptance</button>
              <button class="ghost-btn" data-action="add-event" data-search-id="${search.id}">Add event</button>
            </div>
          </div>
        `;
      })
      .join('');

    dom.searchList.querySelectorAll('[data-action="open-drawer"]').forEach((btn) => {
      btn.addEventListener('click', () => openFacilityDrawer(btn.dataset.searchId));
    });

    dom.searchList.querySelectorAll('[data-action="open-popover"]').forEach((btn) => {
      btn.addEventListener('click', (event) => openEditPopover(btn.dataset.searchId, event.currentTarget));
    });

    dom.searchList.querySelectorAll('[data-action="record"]').forEach((btn) => {
      btn.addEventListener('click', () => showToast('Prototype action: Record acceptance handled via drawer.'));
    });

    // Timeline toggle handlers (updateCard.md spec)
    dom.searchList.querySelectorAll('[data-action="toggle-timeline"]').forEach((btn) => {
      btn.addEventListener('click', () => toggleSearchTimeline(btn.dataset.searchId));
    });

    // Add event handlers
    dom.searchList.querySelectorAll('[data-action="add-event"]').forEach((btn) => {
      btn.addEventListener('click', () => showAddEventModal(btn.dataset.searchId));
    });
  }

  function renderSearchHistory(patient) {
    if (!dom.searchHistory) return;
    dom.searchHistory.innerHTML = patient.searchHistory
      .map((entry) => {
        const status = getStatusPresentation(entry.status);
        const badgeStyle = `background:${status.badgeColor}; color:${status.badgeTextColor};`;
        return `
          <div class="history-entry" data-status-key="${status.key}">
            <span class="history-time">${entry.ts}</span>
            <span class="history-status status-badge" style="${badgeStyle}">${status.icon ? `${status.icon} ` : ''}${status.label}</span>
            <div class="history-detail">
              <strong>${entry.facility}</strong>
              <p>${entry.detail}</p>
            </div>
          </div>
        `;
      })
      .join('');
  }

  function statusKeyToClass(value = '') {
    const key = normalizeStatusKey(value);
    return key.replace(/[^a-z0-9]+/gi, '-');
  }

  function resolveStaffId(name = '') {
    if (!name) return '';
    const match = Object.entries(staffDirectory).find(([, label]) => label.toLowerCase() === name.toLowerCase());
    if (match) return match[0];
    const slug = `staff_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
    staffDirectory[slug] = name;
    return slug;
  }

  function formatPatientDisplayName(name = '') {
    if (!name) return 'Unknown patient';
    if (name.includes(',')) return name;
    const parts = name.trim().split(/\s+/);
    if (parts.length < 2) return name;
    const last = parts.pop();
    return `${last}, ${parts.join(' ')}`;
  }

  function formatPlacementDisplay(entry) {
    const facilityName = entry?.facility?.name || entry?.facilityName || 'Unknown facility';
    const level = entry.level_of_care || {};
    const fragments = [];
    if (level.program) fragments.push(level.program.trim());
    if (level.code) fragments.push(level.code.trim());
    if (!fragments.length && level.label) fragments.push(level.label.trim());
    return fragments.length ? `${facilityName} — ${fragments.join(' ')}` : facilityName;
  }

  function mapMatDisplay(value = '') {
    if (!value) return '—';
    const normalized = value.toLowerCase();
    const option = matOptions.find((opt) => opt.value.toLowerCase() === normalized);
    const rawLabel = option ? option.label : value.replace(/[_-]+/g, ' ');
    const lower = rawLabel.toLowerCase();
    const formatted = lower.charAt(0).toUpperCase() + lower.slice(1);
    return formatted.replace(/mat/gi, 'MAT');
  }

  function formatStatusDisplay(statusValue) {
    const presentation = getStatusPresentation(statusValue);
    const icon = presentation.icon ? `${presentation.icon} ` : '';
    return `${icon}${presentation.label}`.trim();
  }

  function formatDisplayTimestamp(value) {
    if (!value) return '—';
    try {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return value;
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${month}/${day} ${hours}:${minutes}`;
    } catch (err) {
      return value;
    }
  }

  function mapScenarioToRow(patient) {
    const board = patient.board || {};
    const statusKey = normalizeStatusKey(board.statusKey || board.statusLabel || board.status || 'searching');
    const assignedId = board.assignedId || patient.assignment?.id || '';
    return {
      id: patient.id,
      name: formatPatientDisplayName(patient.identifiers?.name || ''),
      placement: board.placement || '',
      mat: board.mat ? mapMatDisplay(board.mat) : board.mat || '',
      statusKey,
      statusLabel: formatStatusDisplay(statusKey),
      transport: board.transport || '',
      assignedId,
      assignedDisplay: staffDirectory[assignedId] || 'Unassigned',
      lastUpdate: board.lastUpdate || '',
      reassess: board.reassess || '',
      isPlaced: board.isPlaced || statusKey === 'accepted',
      needsTransport: board.needsTransport || statusKey === 'waiting_transport'
    };
  }

  function mapOverrideToRow(entry = {}) {
    const statusKey = normalizeStatusKey(entry.status || 'searching');
    const assignedName = entry.assigned || '';
    const assignedId = resolveStaffId(assignedName);
    return {
      id: entry.id || entry.patient_name || entry.facility?.name || 'patient',
      name: formatPatientDisplayName(entry.patient_name),
      placement: formatPlacementDisplay(entry),
      mat: mapMatDisplay(entry.mat),
      statusKey,
      statusLabel: formatStatusDisplay(statusKey),
      transport: entry.transport || '',
      assignedId,
      assignedDisplay: staffDirectory[assignedId] || assignedName || 'Unassigned',
      lastUpdate: formatDisplayTimestamp(entry.last_update),
      reassess: entry.reassess ? 'Yes' : 'No',
      isPlaced: statusKey === 'accepted',
      needsTransport: statusKey === 'waiting_transport'
    };
  }

  const PATIENT_LIST_PATH = '/doc/Review/update2.md';

  // Timeline functions (updateCard.md spec)
  function toggleSearchTimeline(searchId) {
    const timeline = document.querySelector(`.search-timeline[data-search-id="${searchId}"]`);
    if (!timeline) return;
    
    const content = timeline.querySelector('.timeline-content');
    const icon = timeline.querySelector('.timeline-icon');
    
    if (content.style.display === 'none') {
      content.style.display = 'block';
      icon.textContent = '▾';
    } else {
      content.style.display = 'none';
      icon.textContent = '▸';
    }
  }

  function showAddEventModal(searchId) {
    const patient = getCurrentPatient();
    if (!patient) return;
    
    const search = patient.searches.find(s => s.id === searchId);
    if (!search) return;

    // Simple modal for demo - in production would be more sophisticated
    const eventType = window.prompt(`Add event to ${search.facilityName}:

Event types:
- call_outcome
- docs_sent  
- packet_sent
- acceptance
- transport_scheduled
- note

Enter event type:`);

    if (!eventType) return;

    let payload = {};
    
    if (eventType === 'call_outcome') {
      const outcome = window.prompt('Call outcome (no_beds, bed_available, patient_denies, facility_denied):');
      payload.outcome = outcome;
      if (outcome === 'no_beds') {
        const recheckTime = window.prompt('Recheck time (optional):');
        if (recheckTime) payload.recheck_time = recheckTime;
      }
    } else if (eventType === 'docs_sent' || eventType === 'packet_sent') {
      const docs = window.prompt('Documents sent (comma separated):');
      if (docs) payload.docs = docs.split(',').map(d => d.trim());
    } else if (eventType === 'acceptance') {
      const holdUntil = window.prompt('Hold until (optional):');
      if (holdUntil) payload.hold_until = holdUntil;
    } else if (eventType === 'transport_scheduled') {
      const pickupAt = window.prompt('Pickup time:');
      if (pickupAt) payload.pickup_at = pickupAt;
    } else if (eventType === 'note') {
      const text = window.prompt('Note text:');
      if (text) payload.text = text;
    }

    // Add the event
    addSearchEvent(search, eventType, payload, 'current_user');
    
    // Update patient searchHistory for backwards compatibility
    if (!patient.searchHistory) patient.searchHistory = [];
    patient.searchHistory.unshift({
      ts: search.updated,
      status: search.status, 
      facility: search.facilityName,
      detail: formatEventDetail(search.events[search.events.length - 1])
    });

    // Re-render the search list
    renderActiveSearches(patient);
    showToast(`Event added: ${formatEventDetail(search.events[search.events.length - 1])}`);
  }

  async function loadPatientListFromDoc() {
    if (typeof fetch === 'undefined') {
      patientListOverrides = null;
      return;
    }
    try {
      const response = await fetch(PATIENT_LIST_PATH);
      if (!response.ok) {
        patientListOverrides = null;
        return;
      }
      const text = await response.text();
      const startMarker = '<!--PATIENT_LIST_START-->';
      const endMarker = '<!--PATIENT_LIST_END-->';
      const startIndex = text.indexOf(startMarker);
      const endIndex = text.indexOf(endMarker);
      if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
        patientListOverrides = null;
        return;
      }
      const jsonText = text.slice(startIndex + startMarker.length, endIndex).trim();
      if (!jsonText) {
        patientListOverrides = null;
        return;
      }
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        patientListOverrides = null;
        return;
      }
      patientListOverrides = parsed.map((item) => mapOverrideToRow(item)).filter(Boolean);
    } catch (err) {
      console.warn('Unable to load patient list overrides', err);
      patientListOverrides = null;
    }
  }

  function applyPatientListFilters(rows) {
    return rows.filter((row) => {
      if (state.patientListFilters.chip === 'placed' && !row.isPlaced) return false;
      if (state.patientListFilters.chip === 'transport' && !row.needsTransport) return false;
      if (state.patientListFilters.status && row.statusKey !== state.patientListFilters.status) return false;
      if (state.patientListFilters.assigned && row.assignedId !== state.patientListFilters.assigned) return false;
      return true;
    });
  }

  function sortPatientListRows(rows) {
    if (!state.patientListFilters.sortBy) return rows;
    
    const sortBy = state.patientListFilters.sortBy;
    const sortDir = state.patientListFilters.sortDir;
    
    return [...rows].sort((a, b) => {
      let aVal = a[sortBy] || '';
      let bVal = b[sortBy] || '';
      
      // Handle different data types
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      
      let result = 0;
      if (aVal < bVal) result = -1;
      else if (aVal > bVal) result = 1;
      
      return sortDir === 'desc' ? -result : result;
    });
  }

  function renderPatientList() {
    if (!dom.patientListBody) return;
    const overrideRows = Array.isArray(patientListOverrides) && patientListOverrides.length
      ? patientListOverrides
      : null;
    const fallbackRows = patientScenarios.map((patient) => mapScenarioToRow(patient));
    const sourceRows = overrideRows || fallbackRows;

    const filtered = applyPatientListFilters(sourceRows);
    const sorted = sortPatientListRows(filtered);

    if (!sorted.length) {
      dom.patientListBody.innerHTML = `<tr><td colspan="8" class="hint">No patients match the current filters.</td></tr>`;
      return;
    }

    dom.patientListBody.innerHTML = sorted
      .map((row) => {
        const key = normalizeStatusKey(row.statusKey || row.statusLabel || 'searching');
        const presentation = getStatusPresentation(key);
        const display = `${presentation.icon ? `${presentation.icon} ` : ''}${presentation.label}`;
  const chipStyle = `background:${presentation.badgeColor}; background-color:${presentation.badgeColor}; color:${presentation.badgeTextColor};`;
        return `
          <tr data-patient-id="${row.id}">
            <td>${row.name || ''}</td>
            <td>${row.placement || ''}</td>
            <td>${row.mat || ''}</td>
            <td><span class="status-badge" style="${chipStyle}">${display}</span></td>
            <td>${row.transport || ''}</td>
            <td>${staffDirectory[row.assignedId] || row.assignedDisplay || 'Unassigned'}</td>
            <td>${row.lastUpdate || ''}</td>
            <td>${row.reassess || ''}</td>
          </tr>
        `;
      })
      .join('');
  }

  function renderTasks(patient) {
    if (!dom.taskList) return;
    dom.taskList.innerHTML = patient.tasks
      .map((task) => `<li class="task task-${task.tone}"><strong>${task.owner}</strong> — ${task.text}</li>`)
      .join('');
    dom.handoffSummary.textContent = patient.handoff;
  }

  function renderActivityLog(patient) {
    if (!dom.activityLog) return;
    const overrides = state.session.activities[patient.id] || [];
    const entries = [...patient.activities, ...overrides];
    dom.activityLog.innerHTML = entries
      .map((entry) => `
        <article class="activity-item">
          <header>${entry.ts} — <strong>${entry.action}</strong> (${entry.outcome})</header>
          <p>${entry.notes}</p>
        </article>
      `)
      .join('');
  }

  function renderTimeline(patient) {
    if (!dom.timelineList) return;
    const baseIndex = patient.timeline.activeIndex;
    const override = state.session.timelineIndex[patient.id];
    const activeIndex = typeof override === 'number' ? override : baseIndex;

    dom.timelineList.innerHTML = patient.timeline.steps
      .map((step, index) => `
        <li class="${index === activeIndex ? 'active' : ''}">
          <strong>${step}</strong>
          <p>${index <= activeIndex ? '✓ Complete or in progress' : 'Upcoming workflow step'}</p>
        </li>
      `)
      .join('');
  }

  function getFacilityTags(facility) {
    const tagSource = facility.tags && facility.tags.length ? facility.tags : facility.services || [];
    return tagSource.slice(0, 6);
  }

  function getFacilityMetaParts(facility) {
    const metaParts = [];
    if (facility.locationSummary) {
      metaParts.push(facility.locationSummary);
    } else if (facility.address) {
      metaParts.push(facility.address);
    }
    if (facility.verified) {
      metaParts.push(facility.verified);
    }
    if (facility.operationalData?.lastUpdate) {
      metaParts.push(`Updated ${facility.operationalData.lastUpdate}`);
    }
    return metaParts;
  }

  function buildFacilityCard(facility) {
    const availability = facility.availability || 'Call to verify';
    const notes = facility.notes || 'No notes available.';
    const metaLine = getFacilityMetaParts(facility).join(' • ') || 'Details unavailable';
    const tagsMarkup = getFacilityTags(facility)
      .map((badge) => `<span class="tag">${badge}</span>`)
      .join('');
    return `
        <article class="facility-card" data-facility-id="${facility.id}">
          <header>
            <h4>${facility.name}</h4>
            <span class="badge badge-muted">${availability}</span>
          </header>
          <p class="facility-distance">${metaLine}</p>
          <p>${notes}</p>
          <div class="facility-tags">
            ${tagsMarkup}
          </div>
          <footer>
            <button class="ghost-btn" data-prototype="compare">Compare</button>
            <button class="primary-btn" data-prototype="select">Select facility</button>
          </footer>
        </article>
      `;
  }

  function renderFacilityCards(facilities) {
    return facilities.map((facility) => buildFacilityCard(facility)).join('');
  }

  function attachFacilityCardEvents() {
    if (!dom.results) return;
    dom.results.querySelectorAll('[data-prototype]').forEach((btn) => {
      btn.addEventListener('click', () => showToast('Directory actions are storyboarded in this mock.'));
    });
  }

  function renderFacilityResults(patient) {
    if (!dom.results) return;
    const defaultAsam = patient.note.asam || '';
    const defaultMat = patient.note.matNeeds || 'None';
    const needs302 = (patient.note.commitment || '').toLowerCase().includes('302');
    const needsSecure = patient.note.acuity === 'Secured';
    const asamNumeric = defaultAsam.match(/[0-9.]+/);
    const asamNeedle = asamNumeric ? asamNumeric[0] : '';

    const filtered = facilityDirectory.filter((facility) => {
      if (needs302 && !facility.capabilities?.takes302) return false;
      if (needsSecure && !facility.capabilities?.secureBh) return false;
      return true;
    });

    const scored = filtered.map((facility) => {
      let score = 0;
      const haystack = [
        facility.level,
        facility.category,
        ...(facility.services || []),
        ...(facility.tags || [])
      ]
        .filter(Boolean)
        .map((value) => value.toLowerCase());

      if (asamNeedle) {
        const asamKey = asamNeedle.toLowerCase();
        if (haystack.some((value) => value.includes(asamKey))) {
          score += 2;
        }
      }

      if (defaultAsam.toUpperCase().includes('ACUTE') && facility.capabilities?.secureBh) {
        score += 2;
      }

      if (defaultMat && defaultMat !== 'None') {
        const matKey = defaultMat.toLowerCase();
        if (matKey.includes('methadone') && haystack.some((value) => value.includes('methadone'))) {
          score += 2;
        }
        if (matKey.includes('suboxone') && haystack.some((value) => value.includes('suboxone'))) {
          score += 2;
        }
      }

      if (facility.availability === 'Accepting') score += 1;
      if (facility.operationalData?.acceptingAdmissions) score += 1;
      return { facility, score };
    });

    const sortedFacilities = scored
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return a.facility.name.localeCompare(b.facility.name);
      })
      .map(({ facility }) => facility);

    const baseList = filtered.length ? filtered : facilityDirectory;
    const renderList = sortedFacilities.length ? sortedFacilities.slice(0, 8) : baseList.slice(0, 8);
    dom.results.innerHTML = renderFacilityCards(renderList);
    attachFacilityCardEvents();
  }

  function renderAuditPanel(patient) {
    if (!dom.auditList) return;
    const entries = [...patient.audit, ...auditEvents];
    dom.auditList.innerHTML = entries
      .map((entry) => `<li><strong>${entry.ts}</strong> — ${entry.user}: ${entry.detail || entry.action}</li>`)
      .join('');
  }

  function renderStoryboard(patient) {
    if (!dom.storyboard) return;
    const isReassess = (state.session.reassessOverride[patient.id] || patient.note.reassessFlag) === 'Y';
    dom.storyboard.classList.toggle('hidden', !isReassess);
  }

  function renderSettingsContent() {
    if (!dom.settingsSummary) return;

    const toggleSections = [
      {
        legend: 'Workspace Tabs',
        items: [
          {
            key: 'finderTab',
            label: 'Facility Finder tab',
            description: 'Hide the facility directory view when concentrating on patient notes.'
          },
          {
            key: 'tasksTab',
            label: 'Tasks & Approvals tab',
            description: 'Remove the task/approval board from the navigation when work is tracked elsewhere.'
          },
          {
            key: 'activityTab',
            label: 'Activity Log tab',
            description: 'Silence the real-time activity feed during demos or focused reviews.'
          }
        ]
      },
      {
        legend: 'Layout Panels',
        items: [
          {
            key: 'contactPlanner',
            label: 'Contact Planner card',
            description: 'Hide quick-call tools when outreach is managed outside this workspace.'
          },
          {
            key: 'patientList',
            label: 'Patient List preview',
            description: 'Remove the census snapshot when the full board is presented elsewhere.'
          },
          {
            key: 'workflow',
            label: 'Workflow Timeline',
            description: 'Collapse the milestone tracker if another system provides status reporting.'
          },
          {
            key: 'steward',
            label: 'Directory Steward console',
            description: 'Hide stewardship metrics during end-user walkthroughs.'
          },
          {
            key: 'audit',
            label: 'Audit & Privacy review',
            description: 'Remove audit callouts when they are not needed for the conversation.'
          },
          {
            key: 'commitment',
            label: 'Commitment panel',
            description: 'Show the legal commitment summary and details when a hold is active.'
          }
        ]
      }
    ];

    const toggleMarkup = toggleSections
      .map(({ legend, items }) => {
        const controls = items
          .map(({ key, label, description }) => {
            const checked = state.session.panelVisibility?.[key] !== false;
            return `
              <label class="settings-toggle">
                <input type="checkbox" data-panel-toggle="${key}" ${checked ? 'checked' : ''}>
                <div class="toggle-copy">
                  <strong>${label}</strong>
                  <p>${description}</p>
                </div>
              </label>
            `;
          })
          .join('');
        return `
          <fieldset class="settings-group">
            <legend>${legend}</legend>
            ${controls}
          </fieldset>
        `;
      })
      .join('');

    const rows = panelLayoutDefaults
      .map((panel) => {
        const visibility = panel.visible ? 'Visible' : 'Hidden';
        const collapsed = panel.collapsed ? 'Collapsed' : 'Expanded';
        const lockState = panel.locked ? 'Locked' : 'User can hide';
        return `
          <tr>
            <td>${panel.name}</td>
            <td>${panel.column}</td>
            <td>${panel.order}</td>
            <td>${visibility}</td>
            <td>${collapsed}</td>
            <td>${lockState}</td>
          </tr>
        `;
      })
      .join('');

    const commitmentPrefs = getCommitmentSettings();

    const commitmentPrefMarkup = `
      <fieldset class="settings-group">
        <legend>Commitment Panel Preferences</legend>
        <label class="settings-toggle">
          <input type="checkbox" data-commitment-pref="collapsedByDefault" ${commitmentPrefs.collapsedByDefault ? 'checked' : ''}>
          <div class="toggle-copy">
            <strong>Collapse by default</strong>
            <p>Show the short info line until you expand the panel.</p>
          </div>
        </label>
        <label class="settings-toggle">
          <input type="checkbox" data-commitment-pref="autoExpandOn302" ${commitmentPrefs.autoExpandOn302 ? 'checked' : ''}>
          <div class="toggle-copy">
            <strong>Auto-expand for 302 holds</strong>
            <p>Always open the panel when a 302 emergency hold is active.</p>
          </div>
        </label>
        <label class="settings-toggle">
          <input type="checkbox" data-commitment-pref="autoExpandOnPending" ${commitmentPrefs.autoExpandOnPending ? 'checked' : ''}>
          <div class="toggle-copy">
            <strong>Auto-expand for pending statuses</strong>
            <p>Open the panel automatically when commitment status is pending.</p>
          </div>
        </label>
      </fieldset>
      <fieldset class="settings-group">
        <legend>Commitment Panel Sections</legend>
        <label class="settings-toggle">
          <input type="checkbox" data-commitment-section="docs" ${commitmentPrefs.sections?.docs !== false ? 'checked' : ''}>
          <div class="toggle-copy">
            <strong>Legal Documentation</strong>
            <p>Required documents checklist (Petition, Physician Cert, Law enforcement affidavit, etc.)</p>
          </div>
        </label>
        <label class="settings-toggle">
          <input type="checkbox" data-commitment-section="schedule" ${commitmentPrefs.sections?.schedule !== false ? 'checked' : ''}>
          <div class="toggle-copy">
            <strong>Court & Legal Schedule</strong>
            <p>Upcoming hearings (303 Hearing, Court events) and prior event timeline</p>
          </div>
        </label>
        <label class="settings-toggle">
          <input type="checkbox" data-commitment-section="facilities302" ${commitmentPrefs.sections?.facilities302 !== false ? 'checked' : ''}>
          <div class="toggle-copy">
            <strong>302-capable accepting facilities</strong>
            <p>Filtered facility finder for emergency holds (TAKES_302, Secure BH, Acute Med)</p>
          </div>
        </label>
        <label class="settings-toggle">
          <input type="checkbox" data-commitment-section="quickActions" ${commitmentPrefs.sections?.quickActions !== false ? 'checked' : ''}>
          <div class="toggle-copy">
            <strong>Quick Actions</strong>
            <p>One-click buttons and guardrails warnings (⚠️ 302 documentation complete, etc.)</p>
          </div>
        </label>
        <label class="settings-toggle">
          <input type="checkbox" data-commitment-section="quickUpdate" ${commitmentPrefs.sections?.quickUpdate !== false ? 'checked' : ''}>
          <div class="toggle-copy">
            <strong>Quick Update — Legal</strong>
            <p>Form for legal status updates with automatic commitment status and audit logging</p>
          </div>
      </fieldset>
    `;

    // Create comprehensive commitment settings with individual item controls
    const itemPrefs = commitmentPrefs.items || defaultCommitmentSettings.items;
    
    const statusItemsMarkup = `
      <fieldset class="settings-group">
        <legend>Commitment Status Items</legend>
        <label class="settings-toggle">
          <input type="checkbox" data-commitment-item="statusIndicator" ${itemPrefs.statusIndicator !== false ? 'checked' : ''}>
          <div class="toggle-copy">
            <strong>Status indicator</strong>
            <p>Main commitment status badge (Active, Pending, Expired, etc.)</p>
          </div>
        </label>
        <label class="settings-toggle">
          <input type="checkbox" data-commitment-item="statusType" ${itemPrefs.statusType !== false ? 'checked' : ''}>
          <div class="toggle-copy">
            <strong>Commitment type</strong>
            <p>Type classification (302, Voluntary, Court-Ordered, etc.)</p>
          </div>
        </label>
        <label class="settings-toggle">
          <input type="checkbox" data-commitment-item="statusStartDate" ${itemPrefs.statusStartDate !== false ? 'checked' : ''}>
          <div class="toggle-copy">
            <strong>Start date</strong>
            <p>When the commitment period began</p>
          </div>
        </label>
        <label class="settings-toggle">
          <input type="checkbox" data-commitment-item="statusExpiryDate" ${itemPrefs.statusExpiryDate !== false ? 'checked' : ''}>
          <div class="toggle-copy">
            <strong>Expiry date</strong>
            <p>When the commitment expires or requires renewal</p>
          </div>
        </label>
        <label class="settings-toggle">
          <input type="checkbox" data-commitment-item="statusProgress" ${itemPrefs.statusProgress !== false ? 'checked' : ''}>
          <div class="toggle-copy">
            <strong>Time progress</strong>
            <p>Visual indicator of time elapsed vs. total commitment period</p>
          </div>
        </label>
        <label class="settings-toggle">
          <input type="checkbox" data-commitment-item="statusNextAction" ${itemPrefs.statusNextAction !== false ? 'checked' : ''}>
          <div class="toggle-copy">
            <strong>Next action</strong>
            <p>Next required action or deadline for the commitment</p>
          </div>
        </label>
      </fieldset>
    `;
    
    const docsItemsMarkup = commitmentPrefs.sections?.docs !== false ? `
      <fieldset class="settings-group">
        <legend>Legal Documentation Items</legend>
        <label class="settings-toggle">
          <input type="checkbox" data-commitment-item="docsProgressBar" ${itemPrefs.docsProgressBar !== false ? 'checked' : ''}>
          <div class="toggle-copy">
            <strong>Documentation progress bar</strong>
            <p>Visual progress indicator showing completed vs. total documents (e.g., "2/6")</p>
          </div>
        </label>
        <label class="settings-toggle">
          <input type="checkbox" data-commitment-item="docsChecklist" ${itemPrefs.docsChecklist !== false ? 'checked' : ''}>
          <div class="toggle-copy">
            <strong>Document checklist</strong>
            <p>Individual document items with completion status and timestamps</p>
          </div>
        </label>
        <label class="settings-toggle">
          <input type="checkbox" data-commitment-item="docsPetition" ${itemPrefs.docsPetition !== false ? 'checked' : ''}>
          <div class="toggle-copy">
            <strong>✓ Petition document</strong>
            <p>Show petition filing status and timestamp</p>
          </div>
        </label>
        <label class="settings-toggle">
          <input type="checkbox" data-commitment-item="docsPhysicianCert" ${itemPrefs.docsPhysicianCert !== false ? 'checked' : ''}>
          <div class="toggle-copy">
            <strong>✓ Physician Exam/Cert</strong>
            <p>Show physician certification status and timestamp</p>
          </div>
        </label>
        <label class="settings-toggle">
          <input type="checkbox" data-commitment-item="docsLawEnforcement" ${itemPrefs.docsLawEnforcement !== false ? 'checked' : ''}>
          <div class="toggle-copy">
            <strong>Law enforcement / affidavit</strong>
            <p>Show law enforcement affidavit requirement status</p>
          </div>
        </label>
        <label class="settings-toggle">
          <input type="checkbox" data-commitment-item="docsGucForm" ${itemPrefs.docsGucForm !== false ? 'checked' : ''}>
          <div class="toggle-copy">
            <strong>GUC site form</strong>
            <p>Show GUC (Getting Up to Code) site form status</p>
          </div>
        </label>
        <label class="settings-toggle">
          <input type="checkbox" data-commitment-item="docsRightsNotice" ${itemPrefs.docsRightsNotice !== false ? 'checked' : ''}>
          <div class="toggle-copy">
            <strong>Rights/notifications</strong>
            <p>Show patient rights notification documentation</p>
          </div>
        </label>
        <label class="settings-toggle">
          <input type="checkbox" data-commitment-item="docsAdditionalUpload" ${itemPrefs.docsAdditionalUpload !== false ? 'checked' : ''}>
          <div class="toggle-copy">
            <strong>Additional upload</strong>
            <p>Show additional documentation upload option</p>
          </div>
        </label>
        <label class="settings-toggle">
          <input type="checkbox" data-commitment-item="docsBlockersMessage" ${itemPrefs.docsBlockersMessage !== false ? 'checked' : ''}>
          <div class="toggle-copy">
            <strong>⚠️ Legal blockers message</strong>
            <p>"Legal blockers remain until documentation is complete" warning</p>
          </div>
        </label>
      </fieldset>
    ` : '';

    const scheduleItemsMarkup = commitmentPrefs.sections?.schedule !== false ? `
      <fieldset class="settings-group">
        <legend>Court & Legal Schedule Items</legend>
        <label class="settings-toggle">
          <input type="checkbox" data-commitment-item="scheduleNextEvent" ${itemPrefs.scheduleNextEvent !== false ? 'checked' : ''}>
          <div class="toggle-copy">
            <strong>Next event details</strong>
            <p>Upcoming hearing info: "303 Hearing · 09/23, 11:30 AM · Courtroom 2"</p>
          </div>
        </label>
        <label class="settings-toggle">
          <input type="checkbox" data-commitment-item="schedulePriorEvents" ${itemPrefs.schedulePriorEvents !== false ? 'checked' : ''}>
          <div class="toggle-copy">
            <strong>Prior events timeline</strong>
            <p>Historical events: "302 Approved (09/22, 07:40 AM)", "Petition filed"</p>
          </div>
        </label>
        <label class="settings-toggle">
          <input type="checkbox" data-commitment-item="scheduleAddEventBtn" ${itemPrefs.scheduleAddEventBtn !== false ? 'checked' : ''}>
          <div class="toggle-copy">
            <strong>"Add event" button</strong>
            <p>Allow manual entry of court events and hearings</p>
          </div>
        </label>
        <label class="settings-toggle">
          <input type="checkbox" data-commitment-item="schedulePrintPacketBtn" ${itemPrefs.schedulePrintPacketBtn !== false ? 'checked' : ''}>
          <div class="toggle-copy">
            <strong>"Print packet" button</strong>
            <p>Generate printable court packet for legal proceedings</p>
          </div>
        </label>
        <label class="settings-toggle">
          <input type="checkbox" data-commitment-item="scheduleExportSummaryBtn" ${itemPrefs.scheduleExportSummaryBtn !== false ? 'checked' : ''}>
          <div class="toggle-copy">
            <strong>"Export legal summary" button</strong>
            <p>Export comprehensive legal timeline and status summary</p>
          </div>
        </label>
      </fieldset>
    ` : '';

    const facilitiesItemsMarkup = commitmentPrefs.sections?.facilities302 !== false ? `
      <fieldset class="settings-group">
        <legend>302-capable Accepting Facilities Items</legend>
        <label class="settings-toggle">
          <input type="checkbox" data-commitment-item="facilitiesFilters" ${itemPrefs.facilitiesFilters !== false ? 'checked' : ''}>
          <div class="toggle-copy">
            <strong>Facility filter chips</strong>
            <p>TAKES_302, Secure BH, Acute Med Stab filter toggles</p>
          </div>
        </label>
        <label class="settings-toggle">
          <input type="checkbox" data-commitment-item="facilitiesMatches" ${itemPrefs.facilitiesMatches !== false ? 'checked' : ''}>
          <div class="toggle-copy">
            <strong>Facility match cards</strong>
            <p>Individual facility cards: "Hope Ridge Detox — Secure • 3.7"</p>
          </div>
        </label>
        <label class="settings-toggle">
          <input type="checkbox" data-commitment-item="facilitiesOpenFinderBtn" ${itemPrefs.facilitiesOpenFinderBtn !== false ? 'checked' : ''}>
          <div class="toggle-copy">
            <strong>"Open full Finder" button</strong>
            <p>Link to complete facility directory for broader searches</p>
          </div>
        </label>
      </fieldset>
    ` : '';

    const quickActionsItemsMarkup = commitmentPrefs.sections?.quickActions !== false ? `
      <fieldset class="settings-group">
        <legend>Quick Actions Items</legend>
        <label class="settings-toggle">
          <input type="checkbox" data-commitment-item="quickActionsButtons" ${itemPrefs.quickActionsButtons !== false ? 'checked' : ''}>
          <div class="toggle-copy">
            <strong>Quick action buttons</strong>
            <p>One-click buttons for common legal actions and workflows</p>
          </div>
        </label>
        <label class="settings-toggle">
          <input type="checkbox" data-commitment-item="quickActionsGuardrails" ${itemPrefs.quickActionsGuardrails !== false ? 'checked' : ''}>
          <div class="toggle-copy">
            <strong>Guardrails checklist</strong>
            <p>Warning indicators for legal blockers and requirements</p>
          </div>
        </label>
        <label class="settings-toggle">
          <input type="checkbox" data-commitment-item="guardrailDocsComplete" ${itemPrefs.guardrailDocsComplete !== false ? 'checked' : ''}>
          <div class="toggle-copy">
            <strong>⚠️ 302 documentation complete</strong>
            <p>Legal documentation completion status indicator</p>
          </div>
        </label>
        <label class="settings-toggle">
          <input type="checkbox" data-commitment-item="guardrailCourtOverdue" ${itemPrefs.guardrailCourtOverdue !== false ? 'checked' : ''}>
          <div class="toggle-copy">
            <strong>✓ Court / hearing requirement overdue</strong>
            <p>Court dependency and hearing timeline status</p>
          </div>
        </label>
        <label class="settings-toggle">
          <input type="checkbox" data-commitment-item="guardrailReassessRequired" ${itemPrefs.guardrailReassessRequired !== false ? 'checked' : ''}>
          <div class="toggle-copy">
            <strong>✓ Clinical reassessment required</strong>
            <p>Clinical reassessment flag and requirements</p>
          </div>
        </label>
      </fieldset>
    ` : '';

    const quickUpdateItemsMarkup = commitmentPrefs.sections?.quickUpdate !== false ? `
      <fieldset class="settings-group">
        <legend>Quick Update — Legal Items</legend>
        <label class="settings-toggle">
          <input type="checkbox" data-commitment-item="quickUpdateActionDropdown" ${itemPrefs.quickUpdateActionDropdown !== false ? 'checked' : ''}>
          <div class="toggle-copy">
            <strong>Action dropdown</strong>
            <p>Predefined legal actions: "Petition filed", "302 approved", etc.</p>
          </div>
        </label>
        <label class="settings-toggle">
          <input type="checkbox" data-commitment-item="quickUpdateNoteField" ${itemPrefs.quickUpdateNoteField !== false ? 'checked' : ''}>
          <div class="toggle-copy">
            <strong>Note field (140 chars)</strong>
            <p>Free text field for additional legal update details</p>
          </div>
        </label>
        <label class="settings-toggle">
          <input type="checkbox" data-commitment-item="quickUpdateSideEffects" ${itemPrefs.quickUpdateSideEffects !== false ? 'checked' : ''}>
          <div class="toggle-copy">
            <strong>Side effects description</strong>
            <p>"Updates commitment status and audit automatically. Copy to SSOT notes optional."</p>
          </div>
        </label>
        <label class="settings-toggle">
          <input type="checkbox" data-commitment-item="quickUpdateSaveButton" ${itemPrefs.quickUpdateSaveButton !== false ? 'checked' : ''}>
          <div class="toggle-copy">
            <strong>Save button</strong>
            <p>Submit legal update and trigger status/audit changes</p>
          </div>
        </label>
      </fieldset>
    ` : '';

    dom.settingsSummary.innerHTML = `
      ${toggleMarkup}
      ${commitmentPrefMarkup}
      ${statusItemsMarkup}
      ${docsItemsMarkup}
      ${scheduleItemsMarkup}
      ${facilitiesItemsMarkup}
      ${quickActionsItemsMarkup}
      ${quickUpdateItemsMarkup}
      <p>Defaults sourced from <code>crc.layout.v1</code> user preferences. Use this gear to reference SSOT expectations during design reviews.</p>
      <table>
        <thead>
          <tr>
            <th>Panel</th>
            <th>Column</th>
            <th>Order</th>
            <th>Visibility</th>
            <th>Collapsed</th>
            <th>Lock</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
      <p class="hint">Active Placement Searches remains locked on for CRCs. Other panels respect user collapse state but stay visible on first load.</p>
    `;

    dom.settingsSummary.querySelectorAll('[data-panel-toggle]').forEach((input) => {
      if (input.disabled) return;
      input.addEventListener('change', (event) => {
        const panelKey = event.target.getAttribute('data-panel-toggle');
        const isChecked = event.target.checked;
        state.session.panelVisibility[panelKey] = isChecked;
        persistPanelVisibility();
        if (panelKey === 'commitment') {
          updateCommitmentSettings({ visible: isChecked });
          state.session.commitmentExpanded = {};
        }
        applyPanelVisibility();
        const current = getCurrentPatient();
        if (current) {
          renderRunningNote(current);
        }
      });
    });

    dom.settingsSummary.querySelectorAll('[data-commitment-pref]').forEach((input) => {
      input.addEventListener('change', (event) => {
        const prefKey = event.target.getAttribute('data-commitment-pref');
        const value = event.target.checked;
        updateCommitmentSettings({ [prefKey]: value });
        if (prefKey === 'collapsedByDefault') {
          state.session.commitmentExpanded = {};
        }
        const current = getCurrentPatient();
        if (current) {
          renderRunningNote(current);
        }
      });
    });

    dom.settingsSummary.querySelectorAll('[data-commitment-section]').forEach((input) => {
      input.addEventListener('change', (event) => {
        const sectionKey = event.target.getAttribute('data-commitment-section');
        const value = event.target.checked;
        updateCommitmentSettings({ sections: { [sectionKey]: value } });
        const current = getCurrentPatient();
        if (current) {
          renderRunningNote(current);
        }
      });
    });

    dom.settingsSummary.querySelectorAll('[data-commitment-item]').forEach((input) => {
      input.addEventListener('change', (event) => {
        const itemKey = event.target.getAttribute('data-commitment-item');
        const value = event.target.checked;
        updateCommitmentSettings({ items: { [itemKey]: value } });
        const current = getCurrentPatient();
        if (current) {
          renderRunningNote(current);
        }
      });
    });
  }

  function openSettingsModal() {
    if (!dom.settingsModal) return;
    renderSettingsContent();
    dom.settingsModal.classList.remove('hidden');
    if (!state.ui.settingsKeyHandler) {
      state.ui.settingsKeyHandler = (event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          closeSettingsModal();
        }
      };
    }
    document.addEventListener('keydown', state.ui.settingsKeyHandler);
  }

  function closeSettingsModal() {
    if (!dom.settingsModal) return;
    dom.settingsModal.classList.add('hidden');
    if (state.ui.settingsKeyHandler) {
      document.removeEventListener('keydown', state.ui.settingsKeyHandler);
      state.ui.settingsKeyHandler = null;
    }
  }

  function updateFinalizeButton(patient) {
    if (!dom.finalizeTransfer) return;
    const hasAcceptance = normalizeStatusKey(patient.note.transferStatus) === 'accepted' || patient.searches.some((s) => normalizeStatusKey(s.status) === 'accepted');
    const blocked = (state.session.reassessOverride[patient.id] || patient.note.reassessFlag) === 'Y';
    dom.finalizeTransfer.disabled = !(hasAcceptance && !blocked);
  }

  function renderAll() {
    const patient = getCurrentPatient();
    populateQuickFacilityOptions(patient);
    renderPatientContext(patient);
    renderRunningNote(patient);
    renderContactPlanner(patient);
    renderActiveSearches(patient);
    renderSearchHistory(patient);
    renderPatientList();
    renderTasks(patient);
    renderActivityLog(patient);
    renderTimeline(patient);
    renderFacilityResults(patient);
    renderAuditPanel(patient);
    renderStoryboard(patient);
    updateFinalizeButton(patient);
    applyPanelVisibility();
  }

  function formatTimestamp(value) {
    if (!value) return '—';
    try {
      const date = new Date(value);
      const options = { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' };
      return date.toLocaleString('en-US', options);
    } catch (err) {
      return value;
    }
  }

  function showToast(message) {
    if (!dom.toast) return;
    dom.toast.textContent = message;
    dom.toast.classList.remove('hidden');
    if (toastTimer) {
      clearTimeout(toastTimer);
    }
    toastTimer = setTimeout(() => {
      dom.toast.classList.add('hidden');
    }, 3200);
  }

  function handleSaveQuickUpdate() {
    const patient = getCurrentPatient();
    const target = dom.quickTargetFacility && dom.quickTargetFacility.checked ? 'facility' : 'ssot';
    const reasonCode = dom.quickReason ? dom.quickReason.value : '';
    const reasonDef = getReasonDefinition(reasonCode);
    const noteText = dom.quickNote ? dom.quickNote.value.trim() : '';
    const eta = dom.quickEta ? dom.quickEta.value : '';

    if (target === 'facility') {
      const facilityId = dom.quickFacilitySelect ? dom.quickFacilitySelect.value : '';
      if (!facilityId) {
        showToast('Select a facility before saving the quick update.');
        return;
      }

      const { search, created } = ensureFacilitySearch(patient, facilityId);
      const applyStatus = dom.quickApplyStatus ? dom.quickApplyStatus.checked : true;
      const applyAudit = dom.quickApplyAudit ? dom.quickApplyAudit.checked : true;
      const writeSsot = dom.quickApplySsot ? dom.quickApplySsot.checked : false;

      if (applyStatus && reasonDef && normalizeStatusKey(reasonDef.status) === 'no_beds' && normalizeStatusKey(search.status) === 'accepted') {
        state.ui.pendingConflict = {
          patientId: patient.id,
          searchId: search.id,
          reasonCode,
          noteText,
          eta,
          applyStatus,
          applyAudit,
          writeSsot
        };
        openConflictModal(search);
        return;
      }

      applyQuickUpdate({ patient, search, reasonDef, noteText, eta, applyStatus, applyAudit, writeSsot });
      showQuickConfirmation(`${search.facilityName}: update saved${created ? ' (new search created)' : ''}.`);
    } else {
      const applyAudit = dom.quickApplyAudit ? dom.quickApplyAudit.checked : true;
      if (dom.quickApplySsot && dom.quickApplySsot.checked) {
        const existing = patient.note.quickNotes || '';
        const appended = noteText ? `${existing ? `${existing}\n` : ''}${noteText}` : existing;
        patient.note.quickNotes = appended;
        state.session.quickNotes[patient.id] = appended;
      }
      if (applyAudit && noteText) {
        appendAudit(patient, {
          ts: formatTimestamp(new Date()),
          user: 'Morgan Lee',
          action: 'quick_update',
          detail: noteText
        });
      }
      showQuickConfirmation('SSOT note updated.');
    }

    if (dom.quickNote) {
      dom.quickNote.value = '';
    }
    if (dom.quickEta) {
      dom.quickEta.value = '';
    }
    renderAll();
  }

  function ensureFacilitySearch(patient, facilityId) {
    const existing = (patient.searches || []).find((search) => search.facilityId === facilityId);
    if (existing) {
      return { search: existing, created: false };
    }
    const facility = facilityDirectory.find((f) => f.id === facilityId) || { name: facilityId };
    const fresh = {
      id: `${facilityId}-${Date.now()}`,
      facilityId,
      facilityName: facility.name,
      status: 'Searching',
      status_reason_code: '',
      status_reason_text: '',
      summary: 'Search created via quick update',
      channels: ['fax'],
      assignedTo: 'mlee',
      updated: formatTimestamp(new Date()),
      history: []
    };
    patient.searches.push(fresh);
    return { search: fresh, created: true };
  }

  function appendSearchHistory(patient, search, status, detail) {
    if (!patient.searchHistory) {
      patient.searchHistory = [];
    }
    patient.searchHistory.unshift({
      ts: formatTimestamp(new Date()),
      status,
      facility: search.facilityName,
      detail
    });
  }

  function appendAudit(patient, entry) {
    if (!patient.audit) {
      patient.audit = [];
    }
    patient.audit.unshift(entry);
  }

  function addHoursToNow(hours) {
    const ts = new Date();
    ts.setHours(ts.getHours() + hours);
    return ts;
  }

  function applyQuickUpdate({ patient, search, reasonDef, noteText, eta, applyStatus, applyAudit, writeSsot, attestation }) {
    const now = new Date();
    const reasonLabel = reasonDef ? reasonDef.label : 'Quick update';
    const message = noteText || reasonLabel;

    search.status_reason_code = reasonDef ? reasonDef.value : search.status_reason_code;
    search.status_reason_text = message;
    search.summary = message;
    if (applyStatus && reasonDef && reasonDef.status) {
      search.status = normalizeStatusKey(reasonDef.status);
    }
    const normalizedStatus = normalizeStatusKey(search.status);
    const statusPresentation = getStatusPresentation(normalizedStatus);
    search.status = normalizedStatus;
    search.updated = formatTimestamp(now);
    search.lastMessage = `${formatTimestamp(now)} — ${message}`;
    search.history = search.history || [];
    search.history.push({
      ts: formatTimestamp(now),
      user: 'Morgan Lee',
      action: 'quick_update',
      message
    });

    if (reasonDef && reasonDef.requiresRecheck) {
      const recheckTs = eta ? new Date(`${new Date().toISOString().split('T')[0]}T${eta}`) : addHoursToNow(3);
      search.nextRecheckAt = formatTimestamp(recheckTs);
    }

    if (!patient.board) {
      patient.board = {};
    }
    patient.board.statusKey = normalizedStatus;
    patient.board.statusLabel = statusPresentation.label;
    patient.board.lastUpdate = formatTimestamp(now);
    patient.board.isPlaced = normalizedStatus === 'accepted';
    patient.board.needsTransport = normalizedStatus === 'waiting_transport';

    // Handle PA status updates for PA-aware Quick Update reasons
    if (reasonDef && reasonDef.updatesPAStatus) {
      if (!patient.priorAuth) {
        patient.priorAuth = {
          status: 'NOT_STARTED',
          submission: {},
          decision: {},
          guardrails: {}
        };
      }
      patient.priorAuth.status = reasonDef.updatesPAStatus;
      patient.priorAuth.lastUpdated = formatTimestamp(now);
      patient.priorAuth.lastUpdatedBy = 'Morgan Lee';
      
      // Update submission status tracking
      if (reasonDef.updatesPAStatus === 'SUBMITTED') {
        patient.priorAuth.submission.status = 'SUBMITTED';
        patient.priorAuth.submission.submittedAt = formatTimestamp(now);
      }
      
      // Update decision status tracking
      if (['APPROVED', 'DENIED'].includes(reasonDef.updatesPAStatus)) {
        patient.priorAuth.decision.status = reasonDef.updatesPAStatus;
        patient.priorAuth.decision.decidedAt = formatTimestamp(now);
        patient.priorAuth.decision.decidedBy = patient.priorAuth.decision.decidedBy || 'Unknown';
      }
      
      // Refresh PA panel if visible
      if (typeof priorAuthModule !== 'undefined' && priorAuthModule.refreshDisplay) {
        priorAuthModule.refreshDisplay();
      }
    }

    appendSearchHistory(patient, search, search.status, message);

    if (applyAudit) {
      appendAudit(patient, {
        ts: formatTimestamp(now),
        user: 'Morgan Lee',
        action: 'quick_update',
        detail: message + (attestation ? ` | Attestation: ${attestation}` : '')
      });
    }

    if (writeSsot && noteText) {
      const existing = patient.note.quickNotes || '';
      const appended = existing ? `${existing}\n${noteText}` : noteText;
      patient.note.quickNotes = appended;
      state.session.quickNotes[patient.id] = appended;
    }
  }

  function showQuickConfirmation(message) {
    if (!dom.quickConfirmation) return;
    dom.quickConfirmation.textContent = message;
    dom.quickConfirmation.hidden = false;
    setTimeout(() => {
      dom.quickConfirmation.hidden = true;
    }, 3200);
    showToast(message);
  }

  function openConflictModal(search) {
    if (!dom.conflictModal) return;
    const message = `You are switching ${search.facilityName} to "No beds" but it was previously accepted (last update ${search.updated}).`;
    if (dom.conflictMessage) {
      dom.conflictMessage.textContent = message;
    }
    if (dom.conflictForm) {
      dom.conflictForm.reset();
    }
    if (dom.conflictAttestation) {
      dom.conflictAttestation.value = '';
    }
    dom.conflictModal.classList.remove('hidden');
  }

  function closeConflictModal() {
    if (dom.conflictModal) {
      dom.conflictModal.classList.add('hidden');
    }
    state.ui.pendingConflict = null;
  }

  function handleConflictSubmit(event) {
    event.preventDefault();
    const pending = state.ui.pendingConflict;
    if (!pending) {
      closeConflictModal();
      return;
    }
    const formData = new FormData(dom.conflictForm);
    const choice = formData.get('conflictChoice');
    if (choice !== 'override') {
      state.ui.pendingConflict = null;
      closeConflictModal();
      showToast('No changes applied.');
      return;
    }
    const attestation = dom.conflictAttestation ? dom.conflictAttestation.value.trim() : '';
    if (!attestation) {
      showToast('Provide an attestation to override the status.');
      return;
    }
    const patient = patientScenarios.find((p) => p.id === pending.patientId);
    if (!patient) {
      closeConflictModal();
      return;
    }
    const search = patient.searches.find((item) => item.id === pending.searchId);
    if (!search) {
      closeConflictModal();
      return;
    }
    const reasonDef = getReasonDefinition(pending.reasonCode);
    applyQuickUpdate({
      patient,
      search,
      reasonDef,
      noteText: pending.noteText,
      eta: pending.eta,
      applyStatus: pending.applyStatus,
      applyAudit: pending.applyAudit,
      writeSsot: pending.writeSsot,
      attestation
    });
    state.ui.pendingConflict = null;
    closeConflictModal();
    showQuickConfirmation(`${search.facilityName}: override applied.`);
    renderAll();
  }

  function openQuickHelpModal() {
    if (dom.quickHelpModal) {
      dom.quickHelpModal.classList.remove('hidden');
    }
  }

  function closeQuickHelpModal() {
    if (dom.quickHelpModal) {
      dom.quickHelpModal.classList.add('hidden');
    }
  }

  function openFacilityDrawer(searchId) {
    if (!dom.facilityDrawer) return;
    const patient = getCurrentPatient();
    const search = patient.searches.find((item) => item.id === searchId);
    if (!search) {
      showToast('Unable to open drawer for this search.');
      return;
    }
    populateDrawer(search, patient);
    dom.facilityDrawer.dataset.searchId = search.id;
    dom.facilityDrawer.dataset.patientId = patient.id;
    dom.facilityDrawer.classList.remove('hidden');
  }

  function closeFacilityDrawer() {
    if (dom.facilityDrawer) {
      dom.facilityDrawer.classList.add('hidden');
    }
  }

  function populateDrawer(search, patient) {
    if (!dom.facilityDrawer) return;
    if (dom.drawerTitle) {
      dom.drawerTitle.textContent = `${search.facilityName}`;
    }
    if (dom.drawerSubtitle) {
      dom.drawerSubtitle.textContent = `${search.status} • Updated ${search.updated}`;
    }
    if (dom.drawerStatus) {
      populateOptions(dom.drawerStatus, statusOptions, search.status);
    }
    if (dom.drawerReason) {
      populateOptions(dom.drawerReason, drawerReasonOptions, search.status_reason_code);
    }
    if (dom.drawerAssigned) {
      populateOptions(dom.drawerAssigned, Object.entries(staffDirectory).map(([value, label]) => ({ value, label })), search.assignedTo);
    }
    if (dom.drawerSummary) {
      dom.drawerSummary.value = search.summary || '';
    }
    if (dom.drawerClinician) {
      dom.drawerClinician.value = search.accepted_by_name || '';
    }
    if (dom.drawerClinicianRole) {
      dom.drawerClinicianRole.value = search.accepted_by_role || '';
    }
    if (dom.drawerClinicianNpi) {
      dom.drawerClinicianNpi.value = search.accepted_by_npi || '';
    }
    if (dom.drawerRep) {
      dom.drawerRep.value = search.facility_rep || '';
    }
    if (dom.drawerRepContact) {
      dom.drawerRepContact.value = search.facility_rep_contact || '';
    }
    if (dom.drawerUnit) {
      dom.drawerUnit.value = search.accepted_unit || '';
    }
    if (dom.drawerBedHold) {
      dom.drawerBedHold.value = search.accepted_bed_hold_until || '';
    }
    if (dom.drawerReference) {
      dom.drawerReference.value = search.acceptance_reference || '';
    }
    if (dom.drawerConditions) {
      dom.drawerConditions.value = search.acceptance_conditions || '';
    }
    if (dom.drawerCancelOthers) {
      dom.drawerCancelOthers.checked = Boolean(search.cancelOthers);
    }
    if (dom.drawerChannels) {
      dom.drawerChannels.innerHTML = ['fax', 'email', 'portal'].map((channel) => {
        const checked = search.channels.includes(channel) ? 'checked' : '';
        return `<label class="checkbox"><input type="checkbox" data-drawer-channel="${channel}" ${checked}> <span>${channelLabels[channel] || channel}</span></label>`;
      }).join('');
    }
    if (dom.drawerDocuments) {
      const docs = search.documents || ['CoreSummary', 'ASAM', 'Meds'];
      dom.drawerDocuments.innerHTML = docs.map((doc) => `<span class="chip">${doc}</span>`).join('');
    }
    if (dom.drawerDelivery) {
      const delivery = search.deliveryStatus || 'Fax: Sent 09:20 ✓  • Retries: 0  • Last error: —';
      dom.drawerDelivery.textContent = delivery;
    }
    if (dom.drawerTransportRequired) {
      dom.drawerTransportRequired.value = search.transport_required || 'unknown';
    }
    if (dom.drawerTransportMode) {
      dom.drawerTransportMode.value = search.transport_mode || '';
    }
    if (dom.drawerTransportVendor) {
      dom.drawerTransportVendor.value = search.transport_vendor || '';
    }
    if (dom.drawerTransportPickup) {
      dom.drawerTransportPickup.value = search.transport_pickup || '';
    }
    if (dom.drawerTransportDestination) {
      dom.drawerTransportDestination.value = search.transport_destination || '';
    }
    if (dom.drawerTransportEta) {
      dom.drawerTransportEta.value = search.transport_eta || '';
    }
    if (dom.drawerNotes) {
      dom.drawerNotes.value = search.drawer_notes || '';
    }
    if (dom.drawerAttachments) {
      const attachments = search.attachments || [];
      dom.drawerAttachments.innerHTML = attachments.length
        ? attachments.map((att) => `<span class="chip">${att.type || 'Attachment'} (${att.ts || ''})</span>`).join('')
        : '<span class="hint">No attachments uploaded</span>';
    }
    if (dom.drawerAudit) {
      dom.drawerAudit.innerHTML = (search.history || [])
        .slice()
        .reverse()
        .map((item) => `<li><strong>${item.ts}</strong> — ${item.user}: ${item.message}</li>`)
        .join('');
    }
  }

  function populateOptions(select, options, selectedValue) {
    if (!select) return;
    select.innerHTML = options
      .map((opt) => {
        const value = typeof opt === 'object' ? opt.value : opt[0];
        const label = typeof opt === 'object' ? opt.label : opt[1];
        const selected = value === selectedValue ? 'selected' : '';
        return `<option value="${value}" ${selected}>${label}</option>`;
      })
      .join('');
  }

  function openEditPopover(searchId) {
    try {
      // Test if basic functions work
      alert('DEBUG: openEditPopover called for search ' + searchId);
      
      if (!dom.editInfoPopover) {
        alert('DEBUG: editInfoPopover not found');
        return;
      }
      
      const patient = getCurrentPatient();
      const search = patient.searches.find((item) => item.id === searchId);
      if (!search) {
        alert('DEBUG: Search not found');
        return;
      }
      
      populateOptions(dom.popoverStatus, statusOptions, search.status);
      populateOptions(dom.popoverReason, drawerReasonOptions, search.status_reason_code);
      if (dom.popoverClinician) {
        dom.popoverClinician.value = search.accepted_by_name || '';
      }
      if (dom.popoverBedHold) {
        dom.popoverBedHold.value = search.accepted_bed_hold_until || '';
      }
      if (dom.popoverSummary) {
        dom.popoverSummary.value = search.summary || '';
      }
      
      alert('DEBUG: About to inject Action Tags');
      
      // ALWAYS inject Action Tags section for debugging
      const popoverBody = dom.editInfoPopover.querySelector('.popover-body');
      if (popoverBody) {
        // Remove any existing action tags section first
        const existing = popoverBody.querySelector('.action-tags-section');
        if (existing) existing.remove();
        
        const actionTagsHTML = `
          <div class="action-tags-section" style="background: #ff0000 !important; color: white !important; padding: 20px !important; margin: 20px 0 !important; border: 3px solid #000 !important;">
            <h3 style="color: white !important; margin: 0 0 10px 0 !important;">🚨 ACTION TAGS DEBUG MODE 🚨</h3>
            <div class="action-tags-selector" id="actionTagsSelector">
              <button type="button" style="background: yellow; color: black; padding: 10px; margin: 5px;">🚐 Test Transport Tag</button>
              <button type="button" style="background: yellow; color: black; padding: 10px; margin: 5px;">📞 Test Call Tag</button>
            </div>
            <div class="action-tags-current" id="actionTagsCurrent">
              <p style="color: white !important;">Current tags will appear here</p>
            </div>
          </div>
        `;
        popoverBody.insertAdjacentHTML('beforeend', actionTagsHTML);
        alert('DEBUG: Action Tags injected successfully!');
      } else {
        alert('DEBUG: Could not find popover body');
      }
      
      dom.editInfoPopover.dataset.searchId = search.id;
      dom.editInfoPopover.dataset.patientId = patient.id;
      dom.editInfoPopover.classList.remove('hidden');
      
      alert('DEBUG: Popover should be visible now');
      
    } catch (error) {
      alert('DEBUG ERROR: ' + error.message);
    }
  }

  function populateActionTagsSelector(search) {
    // Try direct DOM lookup if cached references aren't working
    const actionTagsSelector = dom.actionTagsSelector || document.getElementById('actionTagsSelector');
    const actionTagsCurrent = dom.actionTagsCurrent || document.getElementById('actionTagsCurrent');
    
    if (!actionTagsSelector || !actionTagsCurrent) {
      showToast('Action Tags section not found - this is a debug message');
      return;
    }
    
    const currentTags = getActionTags(search);
    
    // Populate available tags (grouped by category)
    const categories = [...new Set(ACTION_TAG_OPTIONS.map(tag => tag.category))];
    actionTagsSelector.innerHTML = categories.map(category => {
      const categoryTags = ACTION_TAG_OPTIONS.filter(tag => tag.category === category);
      return `
        <div class="tag-category">
          <h4>${category.charAt(0).toUpperCase() + category.slice(1)}</h4>
          <div class="tag-options">
            ${categoryTags.map(tag => `
              <button type="button" class="tag-option ${currentTags.includes(tag.id) ? 'active' : ''}" 
                      data-tag-id="${tag.id}" data-action="toggle-tag">
                <span class="tag-icon">${tag.icon}</span>
                <span class="tag-label">${tag.label}</span>
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
    
    // Populate current tags
    updateCurrentTagsDisplay(search, actionTagsCurrent);
    
    // Add event listeners for tag toggles
    actionTagsSelector.querySelectorAll('[data-action="toggle-tag"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleActionTag(search, btn.dataset.tagId);
        populateActionTagsSelector(search); // Refresh display
      });
    });
  }

  function updateCurrentTagsDisplay(search, actionTagsCurrent) {
    const targetElement = actionTagsCurrent || dom.actionTagsCurrent || document.getElementById('actionTagsCurrent');
    if (!targetElement) return;
    
    const currentTags = getActionTags(search);
    if (!currentTags.length) {
      targetElement.innerHTML = '<p class="no-tags">No action tags selected</p>';
      return;
    }
    
    targetElement.innerHTML = currentTags.map(tagId => {
      const tagDef = ACTION_TAG_OPTIONS.find(t => t.id === tagId);
      if (!tagDef) return '';
      return `
        <div class="current-tag" data-tag-id="${tagId}">
          <span class="tag-icon">${tagDef.icon}</span>
          <span class="tag-label">${tagDef.label}</span>
          <button type="button" class="remove-tag" data-tag-id="${tagId}" data-action="remove-tag">×</button>
        </div>
      `;
    }).join('');
    
    // Add remove listeners
    targetElement.querySelectorAll('[data-action="remove-tag"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        removeActionTag(search, btn.dataset.tagId);
        populateActionTagsSelector(search); // Refresh display
      });
    });
  }

  function toggleActionTag(search, tagId) {
    const currentTags = getActionTags(search);
    if (currentTags.includes(tagId)) {
      removeActionTag(search, tagId);
    } else {
      addActionTag(search, tagId);
    }
  }

  function closeEditPopover() {
    if (dom.editInfoPopover) {
      dom.editInfoPopover.classList.add('hidden');
    }
  }

  function saveEditPopover() {
    if (!dom.editInfoPopover) return;
    const searchId = dom.editInfoPopover.dataset.searchId;
    const patientId = dom.editInfoPopover.dataset.patientId;
    const patient = patientScenarios.find((item) => item.id === patientId);
    if (!patient) {
      closeEditPopover();
      return;
    }
    const search = patient.searches.find((item) => item.id === searchId);
    if (!search) {
      closeEditPopover();
      return;
    }
    const statusValue = dom.popoverStatus ? dom.popoverStatus.value : search.status;
    const reasonValue = dom.popoverReason ? dom.popoverReason.value : search.status_reason_code;
    const reasonDef = getReasonDefinition(reasonValue) || drawerReasonOptions.find((item) => item.value === reasonValue);
    search.status = statusValue;
    search.status_reason_code = reasonValue;
    search.summary = dom.popoverSummary ? dom.popoverSummary.value : search.summary;
    if (dom.popoverClinician) {
      search.accepted_by_name = dom.popoverClinician.value;
    }
    if (dom.popoverBedHold) {
      search.accepted_bed_hold_until = dom.popoverBedHold.value;
    }
    search.updated = formatTimestamp(new Date());
    search.history = search.history || [];
    search.history.push({
      ts: formatTimestamp(new Date()),
      user: 'Morgan Lee',
      action: 'edit_info',
      message: search.summary || (reasonDef ? reasonDef.label : 'Updated details')
    });
    appendSearchHistory(patient, search, search.status, search.summary || 'Details updated');
    closeEditPopover();
    showQuickConfirmation(`${search.facilityName}: details updated.`);
    renderAll();
  }

  function persistDrawerChanges(publishToSsot = false) {
    if (!dom.facilityDrawer) return;
    const searchId = dom.facilityDrawer.dataset.searchId;
    const patientId = dom.facilityDrawer.dataset.patientId;
    const patient = patientScenarios.find((item) => item.id === patientId);
    if (!patient) {
      closeFacilityDrawer();
      return;
    }
    const search = patient.searches.find((item) => item.id === searchId);
    if (!search) {
      closeFacilityDrawer();
      return;
    }
    if (dom.drawerStatus) {
      search.status = dom.drawerStatus.value;
    }
    if (dom.drawerReason) {
      search.status_reason_code = dom.drawerReason.value;
    }
    if (dom.drawerSummary) {
      search.summary = dom.drawerSummary.value;
    }
    if (dom.drawerAssigned) {
      search.assignedTo = dom.drawerAssigned.value;
    }
    if (dom.drawerClinician) {
      search.accepted_by_name = dom.drawerClinician.value;
    }
    if (dom.drawerClinicianRole) {
      search.accepted_by_role = dom.drawerClinicianRole.value;
    }
    if (dom.drawerClinicianNpi) {
      search.accepted_by_npi = dom.drawerClinicianNpi.value;
    }
    if (dom.drawerRep) {
      search.facility_rep = dom.drawerRep.value;
    }
    if (dom.drawerRepContact) {
      search.facility_rep_contact = dom.drawerRepContact.value;
    }
    if (dom.drawerUnit) {
      search.accepted_unit = dom.drawerUnit.value;
    }
    if (dom.drawerBedHold) {
      search.accepted_bed_hold_until = dom.drawerBedHold.value;
    }
    if (dom.drawerReference) {
      search.acceptance_reference = dom.drawerReference.value;
    }
    if (dom.drawerConditions) {
      search.acceptance_conditions = dom.drawerConditions.value;
    }
    if (dom.drawerCancelOthers) {
      search.cancelOthers = dom.drawerCancelOthers.checked;
    }
    if (dom.drawerTransportRequired) {
      search.transport_required = dom.drawerTransportRequired.value;
    }
    if (dom.drawerTransportMode) {
      search.transport_mode = dom.drawerTransportMode.value;
    }
    if (dom.drawerTransportVendor) {
      search.transport_vendor = dom.drawerTransportVendor.value;
    }
    if (dom.drawerTransportPickup) {
      search.transport_pickup = dom.drawerTransportPickup.value;
    }
    if (dom.drawerTransportDestination) {
      search.transport_destination = dom.drawerTransportDestination.value;
    }
    if (dom.drawerTransportEta) {
      search.transport_eta = dom.drawerTransportEta.value;
    }
    if (dom.drawerNotes) {
      search.drawer_notes = dom.drawerNotes.value;
    }
    const now = new Date();
    search.updated = formatTimestamp(now);
    search.lastMessage = `${formatTimestamp(now)} — Drawer saved`;
    search.history = search.history || [];
    search.history.push({
      ts: formatTimestamp(now),
      user: 'Morgan Lee',
      action: publishToSsot ? 'save_publish' : 'drawer_save',
      message: search.summary || 'Details updated via drawer'
    });
    appendSearchHistory(patient, search, search.status, search.summary || 'Drawer update');
    appendAudit(patient, {
      ts: formatTimestamp(now),
      user: 'Morgan Lee',
      action: publishToSsot ? 'drawer_publish' : 'drawer_save',
      detail: `${search.facilityName} updated${publishToSsot ? ' (published to SSOT)' : ''}`
    });
    if (publishToSsot) {
      patient.note.selectedFacility = search.facilityName;
      state.session.selectedFacility[patient.id] = search.facilityName;
    }
    closeFacilityDrawer();
    showQuickConfirmation(`${search.facilityName}: drawer changes saved${publishToSsot ? ' and published to SSOT' : ''}.`);
    renderAll();
  }

  function handlePostTox() {
    const patient = getCurrentPatient();
    state.session.reassessOverride[patient.id] = 'Y';
    renderStoryboard(patient);
    updateFinalizeButton(patient);
    showToast('Prototype alert: Reassess banner toggled on for this patient.');
  }

  function handleLogActivity(event) {
    event.preventDefault();
    const patient = getCurrentPatient();
    const newEntry = {
      ts: 'Now',
      action: dom.activityAction.value,
      outcome: dom.activityOutcome.value,
      notes: dom.activityNotes.value || 'No additional detail provided.'
    };
    if (!state.session.activities[patient.id]) {
      state.session.activities[patient.id] = [];
    }
    state.session.activities[patient.id].push(newEntry);
    dom.activityNotes.value = '';
    renderActivityLog(patient);
    showToast('Prototype log: Activity appended to the visual timeline.');
  }

  function handleClearActivity() {
    const patient = getCurrentPatient();
    state.session.activities[patient.id] = [];
    renderActivityLog(patient);
    showToast('Prototype reset: Activity additions cleared.');
  }

  function handleTimelineAdvance() {
    const patient = getCurrentPatient();
    const maxIndex = patient.timeline.steps.length - 1;
    const storedIndex = state.session.timelineIndex[patient.id];
    const current = typeof storedIndex === 'number' ? storedIndex : patient.timeline.activeIndex;
    const nextIndex = Math.min(current + 1, maxIndex);
    state.session.timelineIndex[patient.id] = nextIndex;
    renderTimeline(patient);
    showToast(`Prototype timeline advanced to step ${nextIndex + 1}.`);
  }

  function handleTimelineReset() {
    const patient = getCurrentPatient();
    delete state.session.timelineIndex[patient.id];
    renderTimeline(patient);
    showToast('Prototype timeline reset to baseline.');
  }

  function handlePatientSwitch(event) {
    state.currentPatientId = event.target.value;
    renderAll();
    // Load PA data for the new patient
    priorAuthModule.loadPaData();
  }

  function wireFilterChips(container, onChange) {
    if (!container) return;
    container.querySelectorAll('.filter-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        container.querySelectorAll('.filter-chip').forEach((btn) => btn.classList.remove('active'));
        chip.classList.add('active');
        onChange(chip.dataset.filter);
      });
    });
  }

  function setupFilters() {
    let searchChipContainer = null;
    if (dom.searchList) {
      const searchCard = findAncestor(dom.searchList, '.card');
      if (searchCard) {
        searchChipContainer = searchCard.querySelector('.filter-chips');
      }
    }

    wireFilterChips(searchChipContainer, (value) => {
      state.searchFilters.chip = value || 'all';
      renderActiveSearches(getCurrentPatient());
    });

    let patientChipContainer = null;
    if (dom.patientListBody) {
      const patientCard = findAncestor(dom.patientListBody, '.card');
      if (patientCard) {
        const patientHeader = patientCard.querySelector('.patient-list-header');
        if (patientHeader) {
          patientChipContainer = patientHeader.querySelector('.filter-chips');
        }
      }
    }

    wireFilterChips(patientChipContainer, (value) => {
      state.patientListFilters.chip = value || 'all';
      renderPatientList();
    });

    if (dom.searchStatusFilter) {
      dom.searchStatusFilter.addEventListener('change', (event) => {
        state.searchFilters.status = event.target.value;
        renderActiveSearches(getCurrentPatient());
      });
    }

    if (dom.searchFacilityFilter) {
      dom.searchFacilityFilter.addEventListener('change', (event) => {
        state.searchFilters.facility = event.target.value;
        renderActiveSearches(getCurrentPatient());
      });
    }

    if (dom.searchChannelFilter) {
      dom.searchChannelFilter.addEventListener('change', (event) => {
        state.searchFilters.channel = event.target.value;
        renderActiveSearches(getCurrentPatient());
      });
    }

    if (dom.searchTimeFilter) {
      dom.searchTimeFilter.addEventListener('change', (event) => {
        state.searchFilters.time = event.target.value;
        renderActiveSearches(getCurrentPatient());
      });
    }

    if (dom.statusFilter) {
      dom.statusFilter.addEventListener('change', (event) => {
        state.patientListFilters.status = event.target.value;
        renderPatientList();
      });
    }

    if (dom.assignedFilter) {
      dom.assignedFilter.addEventListener('change', (event) => {
        state.patientListFilters.assigned = event.target.value;
        renderPatientList();
      });
    }

    // Setup table header sorting
    const patientListTable = document.getElementById('patientListTable');
    if (patientListTable) {
      const sortableHeaders = patientListTable.querySelectorAll('th.sortable');
      sortableHeaders.forEach((header) => {
        header.addEventListener('click', () => {
          const sortBy = header.dataset.sort;
          
          // Toggle sort direction if clicking the same column
          if (state.patientListFilters.sortBy === sortBy) {
            state.patientListFilters.sortDir = state.patientListFilters.sortDir === 'asc' ? 'desc' : 'asc';
          } else {
            state.patientListFilters.sortBy = sortBy;
            state.patientListFilters.sortDir = 'asc';
          }
          
          // Update header visual indicators
          sortableHeaders.forEach((h) => {
            h.classList.remove('sort-asc', 'sort-desc');
          });
          header.classList.add(state.patientListFilters.sortDir === 'asc' ? 'sort-asc' : 'sort-desc');
          
          renderPatientList();
        });
      });
    }
  }

  function getNavItem(tabId) {
    if (!dom.navTabs || typeof dom.navTabs.forEach !== 'function') {
      dom.navTabs = document.querySelectorAll('.workflow-nav li');
    }
    if (!dom.navTabs) return null;
    return Array.from(dom.navTabs).find((item) => item.dataset.tab === tabId) || null;
  }

  function setElementVisibility(element, visible) {
    if (!element) return;
    element.style.display = visible ? '' : 'none';
    element.setAttribute('aria-hidden', (!visible).toString());
    if (visible) {
      element.removeAttribute('hidden');
    } else {
      element.setAttribute('hidden', '');
    }
  }

  function persistPanelVisibility() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return;
      }
      window.localStorage.setItem(panelStorageKey, JSON.stringify(state.session.panelVisibility));
    } catch (err) {
      console.warn('Unable to save panel visibility preferences', err);
    }
  }

  function resetPanelVisibilityToDefaults() {
    state.session.panelVisibility = { ...defaultPanelVisibility };
    persistPanelVisibility();
    resetCommitmentSettings();
    state.session.commitmentExpanded = {};
    applyPanelVisibility();
    if (dom.settingsModal && !dom.settingsModal.classList.contains('hidden')) {
      renderSettingsContent();
    }
    const current = getCurrentPatient();
    if (current) {
      renderRunningNote(current);
    }
    showToast('Layout reset to defaults.');
  }

  function isPanelVisible(tabId) {
    if (tabId === 'noteTab') {
      return true;
    }
    return state.session.panelVisibility?.[tabId] !== false;
  }

  function switchTab(tabId) {
    if (!workspaceTabs.includes(tabId)) {
      return;
    }

    if (!isPanelVisible(tabId)) {
      showToast('Panel hidden in Settings. Enable it to view.');
      return;
    }

    state.ui.activeTab = tabId;

    workspaceTabs.forEach((sectionId) => {
      const sectionEl = dom[sectionId];
      if (!sectionEl) return;
      const shouldDisplay = sectionId === tabId && isPanelVisible(sectionId);
      if (shouldDisplay) {
        sectionEl.removeAttribute('hidden');
      } else {
        sectionEl.setAttribute('hidden', '');
      }
    });

    if (dom.navTabs && typeof dom.navTabs.forEach === 'function') {
      dom.navTabs.forEach((item) => {
        const targetId = item.dataset.tab;
        const disabled = !isPanelVisible(targetId);
        if (disabled) {
          item.classList.remove('active');
          item.setAttribute('aria-selected', 'false');
          return;
        }
        const isActive = targetId === tabId;
        item.classList.toggle('active', isActive);
        item.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    }
  }

  function applyPanelVisibility() {
    if (!state.session.panelVisibility) {
      state.session.panelVisibility = resolvePanelVisibility();
      persistPanelVisibility();
    }

    workspaceTabs.forEach((tabId) => {
      if (tabId === 'noteTab') return;
      const visible = isPanelVisible(tabId);
      const sectionEl = dom[tabId];
      const navItem = getNavItem(tabId);

      if (sectionEl) {
        const shouldShow = visible && state.ui.activeTab === tabId;
        setElementVisibility(sectionEl, shouldShow);
      }

      if (navItem) {
        navItem.classList.toggle('disabled', !visible);
        navItem.setAttribute('aria-disabled', (!visible).toString());
        if (!visible) {
          navItem.setAttribute('aria-selected', 'false');
          navItem.classList.remove('active');
        }
        setElementVisibility(navItem, visible);
      }
    });

    const layoutPanels = {
      contactPlanner: dom.panelContactPlanner,
      patientList: dom.panelPatientList,
      workflow: dom.panelWorkflow,
      steward: dom.panelSteward,
      audit: dom.panelAudit
    };

    Object.entries(layoutPanels).forEach(([key, element]) => {
      if (!element) return;
      const visible = state.session.panelVisibility?.[key] !== false;
      setElementVisibility(element, visible);
    });

    const commitmentVisible = isPanelVisible('commitment') && getCommitmentSettings().visible !== false;
    if (dom.commitmentSummary) {
      const hasCommitment = dom.commitmentSummary.dataset.hasCommitment === 'true';
      setElementVisibility(dom.commitmentSummary, commitmentVisible && hasCommitment);
    }
    if (!commitmentVisible && dom.commitmentStatusPanel) {
      setElementVisibility(dom.commitmentStatusPanel, false);
    }

    if (!isPanelVisible(state.ui.activeTab)) {
      switchTab('noteTab');
    } else {
      switchTab(state.ui.activeTab || 'noteTab');
    }
  }

  function setupNavigation() {
    if (!dom.navTabs || dom.navTabs.length === 0) {
      dom.navTabs = document.querySelectorAll('.workflow-nav li');
    }

    if (dom.navTabs && typeof dom.navTabs.forEach === 'function') {
      dom.navTabs.forEach((item) => {
        item.addEventListener('click', () => {
          const targetId = item.dataset.tab;
          if (!targetId) return;
          if (!isPanelVisible(targetId)) {
            showToast('Panel hidden in Settings. Enable it to view.');
            return;
          }
          switchTab(targetId);
        });
      });
    }

    applyPanelVisibility();
  }

  function setupPrototypeActions() {
    if (dom.saveQuickUpdate) {
      dom.saveQuickUpdate.addEventListener('click', handleSaveQuickUpdate);
    }
    if (dom.postTox) {
      dom.postTox.addEventListener('click', handlePostTox);
    }
    if (dom.simulatePacket) {
      dom.simulatePacket.addEventListener('click', openPacketPreview);
    }
    if (dom.logCallAttempt) {
      dom.logCallAttempt.addEventListener('click', () => showToast('Prototype log: Call attempt noted for storyboard review.'));
    }
    if (dom.markPacketSent) {
      dom.markPacketSent.addEventListener('click', () => showToast('Prototype log: Packet status would flip to Sent in production.'));
    }
    if (dom.scanConsent) {
      dom.scanConsent.addEventListener('click', () => showToast('Prototype action: Document scanning opens in the real build.'));
    }
    if (dom.sendHandoff) {
      dom.sendHandoff.addEventListener('click', () => showToast('Prototype action: Handoff message queued for next shift.'));
    }
    if (dom.openSettings) {
      dom.openSettings.addEventListener('click', openSettingsModal);
    }
    if (dom.closeSettings) {
      dom.closeSettings.addEventListener('click', closeSettingsModal);
    }
    if (dom.saveSettings) {
      dom.saveSettings.addEventListener('click', () => {
        persistPanelVisibility();
        closeSettingsModal();
        showToast('Layout preferences saved.');
      });
    }
    if (dom.resetSettings) {
      dom.resetSettings.addEventListener('click', resetPanelVisibilityToDefaults);
    }
    if (dom.settingsModal) {
      dom.settingsModal.addEventListener('click', (event) => {
        if (event.target === dom.settingsModal) {
          closeSettingsModal();
        }
      });
      
      // Add event delegation for commitment settings checkboxes
      dom.settingsModal.addEventListener('change', (event) => {
        const target = event.target;
        if (target.type === 'checkbox' && target.hasAttribute('data-commitment-item')) {
          const itemKey = target.getAttribute('data-commitment-item');
          const isChecked = target.checked;
          
          // Update the commitment settings state
          const currentSettings = getCommitmentSettings();
          if (currentSettings.items) {
            currentSettings.items[itemKey] = isChecked;
            saveCommitmentSettings(currentSettings);
            
            // Re-render the commitment panel to reflect changes
            renderCommitmentPanel();
            
            // Show feedback to user
            showToast(`Commitment setting "${itemKey}" ${isChecked ? 'enabled' : 'disabled'}`);
          }
        }
      });
    }
    if (dom.openDowntime) {
      dom.openDowntime.addEventListener('click', () => showToast('Prototype illustration: Downtime playbook would open here.'));
    }
    if (dom.openDirectory) {
      dom.openDirectory.addEventListener('click', () => showToast('Prototype action: Directory stewardship console is not wired in this mock.'));
    }
    if (dom.exportAudit) {
      dom.exportAudit.addEventListener('click', () => showToast('Prototype export: Audit file download would trigger in production.'));
    }
    const updateQuickTargetUI = () => {
      const facilitySelected = dom.quickTargetFacility ? dom.quickTargetFacility.checked : true;
      if (dom.quickFacilitySelect) {
        dom.quickFacilitySelect.disabled = !facilitySelected;
      }
      if (dom.quickReason) {
        dom.quickReason.disabled = !facilitySelected;
      }
      if (dom.quickEta) {
        dom.quickEta.disabled = !facilitySelected;
      }
      if (dom.quickApplyStatus) {
        dom.quickApplyStatus.disabled = !facilitySelected;
      }
    };
    if (dom.quickTargetFacility) {
      dom.quickTargetFacility.addEventListener('change', updateQuickTargetUI);
    }
    if (dom.quickTargetSsot) {
      dom.quickTargetSsot.addEventListener('change', updateQuickTargetUI);
    }
    if (dom.quickHelp) {
      dom.quickHelp.addEventListener('click', openQuickHelpModal);
    }
    if (dom.threeOhTwo) {
      dom.threeOhTwo.addEventListener('change', () => {
        renderCommitmentPanel({
          container: dom.commitmentStatusPanel,
          patient: getCurrentPatient(),
          status: dom.threeOhTwo.value,
          showToast
        });
      });
    }
    if (dom.closeQuickHelp) {
      dom.closeQuickHelp.addEventListener('click', closeQuickHelpModal);
    }
    if (dom.quickHelpModal) {
      dom.quickHelpModal.addEventListener('click', (event) => {
        if (event.target === dom.quickHelpModal) {
          closeQuickHelpModal();
        }
      });
    }
    if (dom.breakGlass) {
      dom.breakGlass.addEventListener('click', () => showToast('Prototype action: Break-the-glass workflow is represented visually only.'));
    }
    if (dom.finalizeTransfer) {
      dom.finalizeTransfer.addEventListener('click', () => showToast('Prototype guard: Finalize transfer is read-only in this visual.'));
    }
    if (dom.addSearchBtn) {
      dom.addSearchBtn.addEventListener('click', openSearchPopover);
    }
    if (dom.addMultipleSearchBtn) {
      dom.addMultipleSearchBtn.addEventListener('click', openSearchPopover);
    }
    if (dom.closeSearchPopover) {
      dom.closeSearchPopover.addEventListener('click', closeSearchPopover);
    }
    if (dom.searchCancel) {
      dom.searchCancel.addEventListener('click', closeSearchPopover);
    }
    if (dom.searchVerify) {
      dom.searchVerify.addEventListener('click', () => showToast('Prototype verify: Rule engine would run checks here.'));
    }
    if (dom.searchPublish) {
      dom.searchPublish.addEventListener('click', handleSearchPublish);
    }
    if (dom.searchAddOther) {
      dom.searchAddOther.addEventListener('click', () => showToast('Prototype input: Free-text facility entry reserved for future build.'));
    }
    if (dom.facilitySearch) {
      dom.facilitySearch.addEventListener('input', filterFacilityResults);
    }
    if (dom.clearSearch) {
      dom.clearSearch.addEventListener('click', resetFacilitySearch);
    }
    if (dom.activityForm) {
      dom.activityForm.addEventListener('submit', handleLogActivity);
    }
    if (dom.clearActivity) {
      dom.clearActivity.addEventListener('click', handleClearActivity);
    }
    if (dom.advanceTimeline) {
      dom.advanceTimeline.addEventListener('click', handleTimelineAdvance);
    }
    if (dom.resetTimeline) {
      dom.resetTimeline.addEventListener('click', handleTimelineReset);
    }
    if (dom.dismissBanner) {
      dom.dismissBanner.addEventListener('click', () => {
        const patient = getCurrentPatient();
        state.session.reassessOverride[patient.id] = 'N';
        renderStoryboard(patient);
        updateFinalizeButton(patient);
        showToast('Prototype action: Reassess banner dismissed for this view.');
      });
    }
    if (dom.closePacket) {
      dom.closePacket.addEventListener('click', closePacketModal);
    }
    if (dom.packetFinalize) {
      dom.packetFinalize.addEventListener('click', () => showToast('Prototype finalize: Packet routing is not active in this mock.'));
    }
    if (dom.packetPrint) {
      dom.packetPrint.addEventListener('click', () => showToast('Prototype print: Print dialog omitted for mock review.'));
    }
    if (dom.conflictForm) {
      dom.conflictForm.addEventListener('submit', handleConflictSubmit);
    }
    if (dom.closeConflict) {
      dom.closeConflict.addEventListener('click', closeConflictModal);
    }
    if (dom.cancelConflict) {
      dom.cancelConflict.addEventListener('click', closeConflictModal);
    }
    if (dom.facilityDrawer) {
      dom.facilityDrawer.addEventListener('click', (event) => {
        if (event.target === dom.facilityDrawer) {
          closeFacilityDrawer();
        }
      });
    }
    if (dom.drawerClose) {
      dom.drawerClose.addEventListener('click', closeFacilityDrawer);
    }
    if (dom.drawerCancel) {
      dom.drawerCancel.addEventListener('click', closeFacilityDrawer);
    }
    if (dom.drawerSave) {
      dom.drawerSave.addEventListener('click', () => persistDrawerChanges(false));
    }
    if (dom.drawerSaveChanges) {
      dom.drawerSaveChanges.addEventListener('click', () => persistDrawerChanges(false));
    }
    if (dom.drawerSavePublish) {
      dom.drawerSavePublish.addEventListener('click', () => persistDrawerChanges(true));
    }
    if (dom.editInfoPopover) {
      dom.editInfoPopover.addEventListener('click', (event) => {
        if (event.target === dom.editInfoPopover) {
          closeEditPopover();
        }
      });
    }
    if (dom.closeEditPopover) {
      dom.closeEditPopover.addEventListener('click', closeEditPopover);
    }
    if (dom.cancelEditPopover) {
      dom.cancelEditPopover.addEventListener('click', closeEditPopover);
    }
    if (dom.saveEditPopover) {
      dom.saveEditPopover.addEventListener('click', saveEditPopover);
    }
    if (dom.openDrawerFromPopover) {
      dom.openDrawerFromPopover.addEventListener('click', () => {
        const searchId = dom.editInfoPopover ? dom.editInfoPopover.dataset.searchId : null;
        closeEditPopover();
        if (searchId) {
          openFacilityDrawer(searchId);
        }
      });
    }
    updateQuickTargetUI();
  }

  function filterFacilityResults() {
    if (!dom.facilitySearch || !dom.results) return;
    const term = dom.facilitySearch.value.trim().toLowerCase();
    const patient = getCurrentPatient();
    const filtered = facilityDirectory.filter((facility) => {
      if (!term) {
        return true;
      }
      const haystack = [
        facility.name,
        facility.locationSummary,
        facility.address,
        ...(facility.services || []),
        ...(facility.tags || [])
      ]
        .filter(Boolean)
        .map((value) => value.toLowerCase());
      return haystack.some((value) => value.includes(term));
    });
    if (dom.clearSearch) {
      dom.clearSearch.disabled = !term;
    }
    const list = term ? filtered : facilityDirectory;
    dom.results.innerHTML = renderFacilityCards(list);
    attachFacilityCardEvents();

    // Keep default filters tied to current patient even while searching
    renderStoryboard(patient);
  }

  function resetFacilitySearch() {
    if (!dom.facilitySearch) return;
    dom.facilitySearch.value = '';
    if (dom.clearSearch) {
      dom.clearSearch.disabled = true;
    }
    renderFacilityResults(getCurrentPatient());
  }

  function openSearchPopover() {
    if (!dom.searchPopover) return;
    const patient = getCurrentPatient();
    dom.searchPopover.classList.remove('hidden');
    if (dom.searchFacilities) {
      dom.searchFacilities.innerHTML = facilityDirectory
        .map((facility) => `<option value="${facility.id}">${facility.name}</option>`)
        .join('');
    }
    if (dom.searchFacilityChips) {
      dom.searchFacilityChips.innerHTML = patient.searches
        .map((search) => `<span class="chip">${search.facilityName}</span>`)
        .join('');
    }
    if (dom.searchNotes) {
      dom.searchNotes.value = '';
    }
    if (dom.searchResults) {
      const previewFacilities = facilityDirectory.slice(0, 3);
      dom.searchResults.innerHTML = previewFacilities
        .map((facility) => {
          const metaLine = [facility.availability, ...getFacilityMetaParts(facility)]
            .filter(Boolean)
            .join(' • ') || 'Details unavailable';
          const notes = facility.notes || 'No notes available.';
          return `
          <div class="search-result-card">
            <strong>${facility.name}</strong>
            <p>${notes}</p>
            <small>${metaLine}</small>
          </div>
        `;
        })
        .join('');
    }
  }

  function closeSearchPopover() {
    if (dom.searchPopover) {
      dom.searchPopover.classList.add('hidden');
    }
  }

  function handleSearchPublish() {
    const patient = getCurrentPatient();
    if (!dom.searchFacilities) return;
    
    const selectedFacilityIds = Array.from(dom.searchFacilities.selectedOptions).map(option => option.value);
    if (selectedFacilityIds.length === 0) {
      showToast('Please select at least one facility to add to the search list.');
      return;
    }

    let addedCount = 0;
    selectedFacilityIds.forEach(facilityId => {
      const facility = facilityDirectory.find(f => f.id === facilityId);
      if (!facility) return;

      // Check if this facility is already being searched for this patient
      const existingSearch = patient.searches.find(s => s.facilityId === facilityId);
      if (existingSearch) {
        showToast(`${facility.name} is already in the search list.`);
        return;
      }

      // Create new search entry
      const now = new Date();
      const timestamp = `${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const searchId = `S${patient.id}-${(patient.searches.length + 1).toString().padStart(2, '0')}`;

      const newSearch = {
        id: searchId,
        facilityId: facility.id,
        facilityName: facility.name,
        status: 'Pending',
        updated: timestamp,
        created: timestamp,
        channels: ['fax'],
        summary: 'New search added from facility directory.',
        assignedTo: 'mlee',
        timeBucket: 'today'
      };

      patient.searches.push(newSearch);
      
      // Add to search history
      patient.searchHistory.unshift({
        ts: timestamp,
        status: 'Pending',
        facility: facility.name,
        detail: 'Search initiated from facility directory.'
      });
      
      addedCount++;
    });

    if (addedCount > 0) {
      showToast(`Added ${addedCount} ${addedCount === 1 ? 'facility' : 'facilities'} to search list.`);
      renderActiveSearches(patient);
      closeSearchPopover();
    }
  }

  function openPacketPreview() {
    if (!dom.packetModal) {
      showToast('Prototype packet preview not available in this view.');
      return;
    }
    dom.packetModal.classList.remove('hidden');
    if (dom.packetPreview) {
      dom.packetPreview.innerHTML = `
        <h3>Transfer Packet Preview</h3>
        <p>Includes assessment summary, MAT plan, transport checklist, and acceptance documentation.</p>
        <ul>
          <li>Assessment overview (ASAM, acuity)</li>
          <li>Placement search history</li>
          <li>Consent & ROI status</li>
          <li>Transport readiness checklist</li>
        </ul>
        <p class="hint">Prototype note: This preview illustrates the final packet contents without generating a real PDF.</p>
      `;
    }
  }

  function closePacketModal() {
    if (dom.packetModal) {
      dom.packetModal.classList.add('hidden');
    }
  }

  function setupGlobalStubs() {
    window.closeEpicModal = () => showToast('Prototype modal: Editing flow is illustrative only.');
    window.saveEpicChanges = () => showToast('Prototype modal: Changes are not persisted in this mock.');
  }

  function setupGlobalShortcuts() {
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (dom.settingsModal && !dom.settingsModal.classList.contains('hidden')) {
          closeSettingsModal();
        }
        if (dom.packetModal && !dom.packetModal.classList.contains('hidden')) {
          closePacketModal();
        }
        if (dom.searchPopover && !dom.searchPopover.classList.contains('hidden')) {
          closeSearchPopover();
        }
        if (dom.facilityDrawer && !dom.facilityDrawer.classList.contains('hidden')) {
          closeFacilityDrawer();
        }
        if (dom.editInfoPopover && !dom.editInfoPopover.classList.contains('hidden')) {
          closeEditPopover();
        }
        if (dom.conflictModal && !dom.conflictModal.classList.contains('hidden')) {
          closeConflictModal();
        }
        if (dom.quickHelpModal && !dom.quickHelpModal.classList.contains('hidden')) {
          closeQuickHelpModal();
        }
      }
    });
  }

  // ===============================================
  // PRIOR AUTHORIZATION MODULE (COMPLETE SYSTEM)
  // ===============================================

  const priorAuthModule = {
    // PA Auto-check heuristics based on the specification
    autoCheckRules: [
      {
        name: 'CBH 302 Not Required',
        condition: (data) => data.payer === 'CBH' && data.commitmentStatus === '302Required',
        result: 'NOT_REQUIRED',
        reason: '302 holds do not require PA for CBH'
      },
      {
        name: 'ASAM 3.7/4.0 Inpatient Required',
        condition: (data) => ['3.7', '4.0'].includes(data.asamLevel) && data.setting === 'inpatient',
        result: 'REQUIRED',
        reason: 'Inpatient ASAM 3.7/4.0 requires PA'
      },
      {
        name: 'Out-of-Network Non-Emergent Required',
        condition: (data) => data.networkStatus === 'OON' && !data.isEmergent,
        result: 'REQUIRED',
        reason: 'Out-of-network non-emergent services require PA'
      },
      {
        name: 'Same System Blanket Auth Not Required',
        condition: (data) => data.facilitySystem === data.payerSystem && data.blanketAuth,
        result: 'NOT_REQUIRED',
        reason: 'Same-system blanket authorization applies'
      }
    ],

    // Initialize PA panel
    init() {
      this.bindEvents();
      this.showPAForm(); // Always show form initially
      this.loadInitialData();
      this.setupConditionalSections();
    },

    bindEvents() {
      const elements = {
        autoCheck: document.getElementById('paAutoCheck'),
        payer: document.getElementById('paPayer'),
        plan: document.getElementById('paPlan'),
        facility: document.getElementById('paFacility'),
        levelOfCare: document.getElementById('paLevelOfCare'),
        status: document.getElementById('paStatus'),
        policyView: document.getElementById('paPolicyView'),
        decision: document.getElementById('paDecision'),
        startAppeal: document.getElementById('startAppeal'),
        generateFaxCover: document.getElementById('generateFaxCover'),
        phoneScript: document.getElementById('phoneScript'),
        logCall: document.getElementById('logCall'),
        createP2PTask: document.getElementById('createP2PTask'),
        createAppealTask: document.getElementById('createAppealTask'),
        remindIn2h: document.getElementById('remindIn2h'),
        addPdf: document.querySelector('.add-pdf-btn')
      };

      // Core functionality
      if (elements.autoCheck) {
        elements.autoCheck.addEventListener('click', () => this.runAutoCheck());
      }

      if (elements.payer) {
        elements.payer.addEventListener('change', () => this.updatePlans());
      }

      if (elements.status) {
        elements.status.addEventListener('change', (e) => this.updateStatusDisplay(e.target.value));
      }

      if (elements.decision) {
        elements.decision.addEventListener('change', (e) => this.handleDecisionChange(e.target.value));
      }

      if (elements.policyView) {
        elements.policyView.addEventListener('click', () => this.showPolicyInfo());
      }

      if (elements.startAppeal) {
        elements.startAppeal.addEventListener('click', () => this.startAppealProcess());
      }

      // Quick Actions
      if (elements.generateFaxCover) {
        elements.generateFaxCover.addEventListener('click', () => this.generateFaxCover());
      }

      if (elements.phoneScript) {
        elements.phoneScript.addEventListener('click', () => this.showPhoneScript());
      }

      if (elements.logCall) {
        elements.logCall.addEventListener('click', () => this.logCallAttempt());
      }

      // Task Management
      if (elements.createP2PTask) {
        elements.createP2PTask.addEventListener('click', () => this.createP2PTask());
      }

      if (elements.createAppealTask) {
        elements.createAppealTask.addEventListener('click', () => this.createAppealTask());
      }

      if (elements.remindIn2h) {
        elements.remindIn2h.addEventListener('click', () => this.createReminder());
      }

      if (elements.addPdf) {
        elements.addPdf.addEventListener('click', () => this.addPdfAttachment());
      }

      // Expandable sections
      const expandSubmission = document.getElementById('expandSubmission');
      const expandGuardrails = document.getElementById('expandGuardrails');
      const expandAuthorization = document.getElementById('expandAuthorization');
      const expandDecision = document.getElementById('expandDecision');
      
      if (expandAuthorization) {
        expandAuthorization.addEventListener('click', () => this.toggleSection('authorization'));
      }
      
      if (expandDecision) {
        expandDecision.addEventListener('click', () => this.toggleSection('decision'));
      }
      
      if (expandSubmission) {
        expandSubmission.addEventListener('click', () => this.toggleSection('submission'));
      }
      
      if (expandGuardrails) {
        expandGuardrails.addEventListener('click', () => this.toggleSection('guardrails'));
      }

      // Drawer controls
      const moreOptionsBtn = document.getElementById('paMoreOptions');
      const closeDrawerBtn = document.getElementById('closeDrawer');
      const optionsDrawer = document.getElementById('paOptionsDrawer');
      
      if (moreOptionsBtn) {
        moreOptionsBtn.addEventListener('click', () => this.openDrawer());
      }
      
      if (closeDrawerBtn) {
        closeDrawerBtn.addEventListener('click', () => this.closeDrawer());
      }

      // Quick control buttons
      const collapseAllBtn = document.getElementById('paCollapseAll');
      const expandAllBtn = document.getElementById('paExpandAll');
      
      if (collapseAllBtn) {
        collapseAllBtn.addEventListener('click', () => this.collapseAllSections());
      }
      
      if (expandAllBtn) {
        expandAllBtn.addEventListener('click', () => this.expandAllSections());
      }

      // Submit and summary controls
      const submitBtn = document.getElementById('paSubmitBtn');
      const clearBtn = document.getElementById('paClearBtn');
      const editBtn = document.getElementById('paEditBtn');
      
      if (submitBtn) {
        submitBtn.addEventListener('click', () => this.submitAndGenerateSummary());
      }
      
      if (clearBtn) {
        clearBtn.addEventListener('click', () => this.clearAllFields());
      }
      
      if (editBtn) {
        editBtn.addEventListener('click', () => this.editPA());
      }

      // Auto-sync with Assessment data when available
      this.syncWithAssessment();

      // Auto-save on field changes
      this.setupAutoSave();
    },

    setupConditionalSections() {
      // Show/hide sections based on decision
      const decisionSelect = document.getElementById('paDecision');
      const denialSection = document.getElementById('denialSection');
      const p2pSection = document.getElementById('p2pSection');

      if (decisionSelect) {
        decisionSelect.addEventListener('change', (e) => {
          const decision = e.target.value;
          
          if (denialSection) {
            denialSection.style.display = decision === 'Denied' ? 'block' : 'none';
          }
          
          if (p2pSection) {
            p2pSection.style.display = decision === 'P2P requested' ? 'block' : 'none';
          }
        });
      }
    },

    setupAutoSave() {
      // Auto-save PA data when fields change
      const fieldsToWatch = [
        'paPayer', 'paPlan', 'paFacility', 'paLevelOfCare', 'paStatus',
        'paSubmissionMethod', 'paRefNumber', 'paSubmittedBy', 'paSubmittedDateTime',
        'paContactLine', 'paPortalUrl', 'paPayerNotes', 'paDecision',
        'paAuthNumber', 'paCoverageSpan', 'paDecisionTime', 'paAgent',
        'paDenialReason', 'paDenialRationale', 'paP2PDateTime', 'paP2PClinician',
        'paNotes'
      ];

      fieldsToWatch.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
          element.addEventListener('change', () => {
            this.savePaData();
            this.updateGuardrails();
          });
        }
      });

      // Watch checkboxes too
      const checkboxes = document.querySelectorAll('.attachment-checkbox input, .expedited-checkbox input');
      checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => this.savePaData());
      });
    },

    loadInitialData() {
      // Set default values from current patient context
      const currentPatient = getCurrentPatient();
      if (currentPatient) {
        this.populateFromPatientData(currentPatient);
      }
      
      // Initialize SLA timer
      this.updateSlaDisplay();
      this.updateGuardrails();
    },

    populateFromPatientData(patient) {
      // Auto-populate from patient's insurance/assessment data
      const asamField = document.getElementById('asamField');
      const commitmentSelect = document.getElementById('threeOhTwo');
      
      if (asamField && asamField.value) {
        const asamValue = asamField.value.split(' ')[0]; // Extract ASAM level
        const paLevelOfCare = document.getElementById('paLevelOfCare');
        if (paLevelOfCare) {
          paLevelOfCare.value = asamValue;
        }
      }

      // Set default payer if available from patient insurance
      if (patient.insurance) {
        const paPayer = document.getElementById('paPayer');
        const paPlan = document.getElementById('paPlan');
        if (paPayer) {
          paPayer.value = patient.insurance.payer || '';
          this.updatePlans(); // Update plan options
        }
        if (paPlan && patient.insurance.plan) {
          // Delay to ensure plans are loaded
          setTimeout(() => {
            paPlan.value = patient.insurance.plan;
          }, 100);
        }
      }

      // Set current datetime for submissions
      const now = new Date();
      const localDateTime = now.toISOString().slice(0, -1);
      const submittedDateTime = document.getElementById('paSubmittedDateTime');
      if (submittedDateTime && !submittedDateTime.value) {
        submittedDateTime.value = localDateTime;
      }
    },

    syncWithAssessment() {
      // Listen for changes in Assessment fields to auto-update PA context
      const asamField = document.getElementById('asamField');
      const commitmentSelect = document.getElementById('threeOhTwo');
      
      if (asamField) {
        asamField.addEventListener('change', () => {
          const asamValue = asamField.value.split(' ')[0];
          const paLevelOfCare = document.getElementById('paLevelOfCare');
          if (paLevelOfCare) {
            paLevelOfCare.value = asamValue;
          }
        });
      }
    },

    runAutoCheck() {
      const data = this.gatherContextData();
      const result = this.evaluateRequirement(data);
      
      this.displayRequirementResult(result);
      this.updateSlaDisplay(result.result);
      
      // Auto-update status if not manually set
      const statusSelect = document.getElementById('paStatus');
      if (statusSelect && statusSelect.value === 'NOT_STARTED') {
        statusSelect.value = result.result;
        this.updateStatusDisplay(result.result);
      }

      showToast(`Auto-check complete: ${result.result.replace('_', ' ')}`);
    },

    gatherContextData() {
      const elements = {
        payer: document.getElementById('paPayer'),
        plan: document.getElementById('paPlan'),
        facility: document.getElementById('paFacility'),
        levelOfCare: document.getElementById('paLevelOfCare'),
        commitmentStatus: document.getElementById('threeOhTwo')
      };

      return {
        payer: elements.payer?.value || '',
        plan: elements.plan?.value || '',
        facility: elements.facility?.value || '',
        asamLevel: elements.levelOfCare?.value || '',
        commitmentStatus: elements.commitmentStatus?.value || '',
        setting: this.inferSetting(),
        networkStatus: this.inferNetworkStatus(),
        isEmergent: this.inferEmergencyStatus()
      };
    },

    inferSetting() {
      // Infer inpatient vs outpatient based on ASAM level
      const levelOfCare = document.getElementById('paLevelOfCare')?.value;
      return ['3.7', '4.0'].includes(levelOfCare) ? 'inpatient' : 'outpatient';
    },

    inferNetworkStatus() {
      // TODO: Implement network status logic based on payer/facility mapping
      return 'IN_NETWORK'; // Default assumption
    },

    inferEmergencyStatus() {
      // Check for 302/201 holds or emergency indicators
      const commitmentStatus = document.getElementById('threeOhTwo')?.value;
      return ['302Required', '201Active'].includes(commitmentStatus);
    },

    evaluateRequirement(data) {
      // Run through auto-check rules
      for (const rule of this.autoCheckRules) {
        if (rule.condition(data)) {
          return {
            result: rule.result,
            reason: rule.reason,
            rule: rule.name
          };
        }
      }

      // Default to required if no specific rule matches
      return {
        result: 'REQUIRED',
        reason: 'Standard PA requirement applies',
        rule: 'Default'
      };
    },

    displayRequirementResult(result) {
      const resultElement = document.getElementById('paRequirementResult');
      if (resultElement) {
        resultElement.textContent = result.result.replace('_', ' ').toLowerCase();
        resultElement.className = `requirement-chip ${result.result.toLowerCase().replace('_', '-')}`;
        resultElement.title = `${result.rule}: ${result.reason}`;
      }
    },

    updatePlans() {
      const payer = document.getElementById('paPayer')?.value;
      const planSelect = document.getElementById('paPlan');
      
      if (!planSelect) return;

      // Clear current options
      planSelect.innerHTML = '<option value="">Select plan...</option>';

      // Add payer-specific plans
      const plans = this.getPlansForPayer(payer);
      plans.forEach(plan => {
        const option = document.createElement('option');
        option.value = plan.value;
        option.textContent = plan.label;
        planSelect.appendChild(option);
      });
    },

    getPlansForPayer(payer) {
      const payerPlans = {
        'CBH': [
          { value: 'STANDARD_SUD', label: 'Standard SUD' },
          { value: 'MEDICAID_SUD', label: 'Medicaid SUD' }
        ],
        'IBHC': [
          { value: 'COMMERCIAL', label: 'Commercial' },
          { value: 'MEDICARE_SUPP', label: 'Medicare Supplement' }
        ],
        'AETNA': [
          { value: 'BETTER_HEALTH', label: 'Better Health' },
          { value: 'COMMERCIAL', label: 'Commercial' }
        ],
        'MEDICAID': [
          { value: 'MEDICAID_SUD', label: 'Medicaid SUD' }
        ],
        'AMERIHEALTH': [
          { value: 'CARITAS', label: 'Caritas' },
          { value: 'MEDICAID_SUD', label: 'Medicaid SUD' }
        ]
      };

      return payerPlans[payer] || [];
    },

    updateStatusDisplay(status) {
      // Apply status-based styling and behavior
      const statusSelect = document.getElementById('paStatus');
      if (statusSelect) {
        statusSelect.className = `pa-status-select status-${status.toLowerCase()}`;
      }

      // Update SLA display based on status
      this.updateSlaDisplay(status);
      this.updateGuardrails();
    },

    updateSlaDisplay(status = null) {
      const slaElement = document.getElementById('paSlaTime');
      if (!slaElement) return;

      const currentStatus = status || document.getElementById('paStatus')?.value;
      
      if (['REQUIRED', 'SUBMITTED'].includes(currentStatus)) {
        const currentPatient = getCurrentPatient();
        let hoursLeft = 7; // Default
        let totalHours = 24; // Default
        
        if (currentPatient?.priorAuth) {
          hoursLeft = currentPatient.priorAuth.hoursLeft || 7;
          totalHours = currentPatient.priorAuth.slaHours || 24;
        }
        
        slaElement.textContent = `SLA: ${hoursLeft}h left (${totalHours}h)`;
        
        if (hoursLeft <= 2) {
          slaElement.className = 'sla-display urgent';
        } else if (hoursLeft <= 6) {
          slaElement.className = 'sla-display warning';
        } else {
          slaElement.className = 'sla-display';
        }
      } else {
        slaElement.textContent = 'SLA: —';
        slaElement.className = 'sla-display';
      }
    },

    updateGuardrails() {
      // Update guardrail checkboxes based on current PA status
      const status = document.getElementById('paStatus')?.value;
      const blockPANotApproved = document.getElementById('blockPANotApproved');
      const blockP2PPending = document.getElementById('blockP2PPending');
      const blockNone = document.getElementById('blockNone');

      if (blockPANotApproved && blockP2PPending && blockNone) {
        // Reset all
        blockPANotApproved.checked = false;
        blockP2PPending.checked = false;
        blockNone.checked = false;

        if (status === 'APPROVED' || status === 'NOT_REQUIRED') {
          blockNone.checked = true;
        } else if (status === 'P2P_REQUESTED') {
          blockP2PPending.checked = true;
        } else if (['REQUIRED', 'SUBMITTED', 'DENIED'].includes(status)) {
          blockPANotApproved.checked = true;
        }
      }
    },

    handleDecisionChange(decision) {
      // Auto-update status based on decision
      const statusSelect = document.getElementById('paStatus');
      if (statusSelect) {
        switch (decision) {
          case 'Approved':
            statusSelect.value = 'APPROVED';
            break;
          case 'Denied':
            statusSelect.value = 'DENIED';
            break;
          case 'P2P requested':
            statusSelect.value = 'P2P_REQUESTED';
            break;
        }
        this.updateStatusDisplay(statusSelect.value);
      }
    },

    startAppealProcess() {
      const statusSelect = document.getElementById('paStatus');
      if (statusSelect) {
        statusSelect.value = 'APPEAL_FILED';
        this.updateStatusDisplay('APPEAL_FILED');
      }
      showToast('Appeal process initiated - status updated to Appeal Filed');
    },

    generateFaxCover() {
      // Generate fax cover sheet
      const currentPatient = getCurrentPatient();
      if (!currentPatient) {
        showToast('No patient selected');
        return;
      }

      const faxContent = this.buildFaxCoverTemplate(currentPatient);
      
      // For demo, show in modal or new window
      const newWindow = window.open('', '_blank');
      newWindow.document.write(`
        <html>
          <head><title>PA Fax Cover - ${currentPatient.identifiers.name}</title></head>
          <body style="font-family: monospace; white-space: pre-wrap; padding: 20px;">
${faxContent}
          </body>
        </html>
      `);
      newWindow.document.close();
      
      showToast('Fax cover sheet generated');
    },

    buildFaxCoverTemplate(patient) {
      const payer = document.getElementById('paPayer')?.value || '[PAYER]';
      const plan = document.getElementById('paPlan')?.value || '[PLAN]';
      const facility = document.getElementById('paFacility')?.value || '[FACILITY]';
      const asam = document.getElementById('paLevelOfCare')?.value || '[ASAM]';
      const contactLine = document.getElementById('paContactLine')?.value || '[CONTACT]';
      const refNumber = document.getElementById('paRefNumber')?.value || '[REF]';
      const payerNotes = document.getElementById('paPayerNotes')?.value || '[NOTES]';

      return `PRIOR AUTHORIZATION — FAX COVER
From: Morgan Lee, CRC Technician
Phone: 215-555-0123   Fax: 215-555-0124
Date/Time: ${new Date().toLocaleString()}

Payer: ${payer}   Plan: ${plan}
Patient: ${patient.identifiers.name}  DOB: [DOB]  MRN: ${patient.identifiers.mrn}  Visit: ${patient.identifiers.fin}
Service: ASAM ${asam} at ${facility}
Reason for request: ${payerNotes}

Included documents (check):
  [${document.getElementById('attachCoreSummary')?.checked ? 'X' : ' '}] Core Clinical Summary     [${document.getElementById('attachASAM')?.checked ? 'X' : ' '}] ASAM/LOC Summary
  [${document.getElementById('attachMeds')?.checked ? 'X' : ' '}] Medication List           [${document.getElementById('attachLastDose')?.checked ? 'X' : ' '}] Last MOUD Dose
  [ ] Vitals (24h)              [ ] Labs (non-sensitive)
  [${document.getElementById('attachSUDLabs')?.checked ? 'X' : ' '}] SUD Labs*                 [${document.getElementById('attach302Docs')?.checked ? 'X' : ' '}] 302 Docs*     [${document.getElementById('attachROI')?.checked ? 'X' : ' '}] ROI*
    *Share only per policy/consent (42 CFR Part 2).

Callback number for UM nurse: ${contactLine}
Reference/Ticket (if known): ${refNumber}`;
    },

    showPhoneScript() {
      const currentPatient = getCurrentPatient();
      if (!currentPatient) {
        showToast('No patient selected');
        return;
      }

      const facility = document.getElementById('paFacility')?.value || '[FACILITY]';
      const asam = document.getElementById('paLevelOfCare')?.value || '[ASAM]';
      const payerNotes = document.getElementById('paPayerNotes')?.value || '[CLINICAL NOTES]';

      const script = `PRIOR AUTH — PHONE SCRIPT (UM Line)

"Hi, this is Morgan Lee, CRC Technician calling about Prior Auth for ${currentPatient.identifiers.name}, DOB [DOB].
Service: ASAM ${asam} at ${facility}, expected admit [DATE/TIME].
Clinical risk: ${payerNotes}. We can fax or upload supporting documents now.
Can I get a ticket/reference number and confirm the best callback/fax?"`;

      alert(script); // For demo - in real app would be a proper modal
      showToast('Phone script displayed');
    },

    logCallAttempt() {
      const currentPatient = getCurrentPatient();
      if (!currentPatient) return;

      const timestamp = new Date().toLocaleString();
      const outcome = prompt('Call outcome (Connected/Voicemail/Busy/No Answer):') || 'Connected';
      const notes = prompt('Call notes:') || 'PA inquiry call logged';

      // Add to patient activities
      if (!currentPatient.activities) {
        currentPatient.activities = [];
      }
      
      currentPatient.activities.unshift({
        ts: timestamp,
        action: 'PA Call',
        outcome: outcome,
        notes: notes
      });

      savePatientData();
      renderAll();
      showToast('Call attempt logged to patient activities');
    },

    createP2PTask() {
      showToast('P2P task created - assigned to clinical team');
    },

    createAppealTask() {
      showToast('Appeal task created - assigned to appeals specialist');
    },

    createReminder() {
      showToast('Reminder set for 2 hours - you will be notified');
    },

    addPdfAttachment() {
      // For demo - in real app would open file picker
      const filename = prompt('Enter PDF filename:');
      if (filename) {
        showToast(`PDF "${filename}" attached to PA submission`);
      }
    },

    showPolicyInfo() {
      alert('Policy information:\n\nCBH Standard SUD Policy:\n- 302 holds: No PA required\n- Outpatient: Standard PA\n- Inpatient 3.7+: PA required\n\n(This is demo content - real policy links would be payer-specific)');
    },

    // Data persistence methods
    savePaData() {
      const currentPatient = getCurrentPatient();
      if (!currentPatient) return;

      const paData = {
        payer: document.getElementById('paPayer')?.value,
        plan: document.getElementById('paPlan')?.value,
        facility: document.getElementById('paFacility')?.value,
        levelOfCare: document.getElementById('paLevelOfCare')?.value,
        status: document.getElementById('paStatus')?.value,
        submissionMethod: document.getElementById('paSubmissionMethod')?.value,
        refNumber: document.getElementById('paRefNumber')?.value,
        submittedBy: document.getElementById('paSubmittedBy')?.value,
        submittedDateTime: document.getElementById('paSubmittedDateTime')?.value,
        contactLine: document.getElementById('paContactLine')?.value,
        portalUrl: document.getElementById('paPortalUrl')?.value,
        payerNotes: document.getElementById('paPayerNotes')?.value,
        expedited: document.getElementById('paExpedited')?.checked,
        decision: document.getElementById('paDecision')?.value,
        authNumber: document.getElementById('paAuthNumber')?.value,
        coverageSpan: document.getElementById('paCoverageSpan')?.value,
        decisionTime: document.getElementById('paDecisionTime')?.value,
        agent: document.getElementById('paAgent')?.value,
        denialReason: document.getElementById('paDenialReason')?.value,
        denialRationale: document.getElementById('paDenialRationale')?.value,
        p2pDateTime: document.getElementById('paP2PDateTime')?.value,
        p2pClinician: document.getElementById('paP2PClinician')?.value,
        notes: document.getElementById('paNotes')?.value,
        attachments: {
          coreSummary: document.getElementById('attachCoreSummary')?.checked,
          asam: document.getElementById('attachASAM')?.checked,
          meds: document.getElementById('attachMeds')?.checked,
          lastDose: document.getElementById('attachLastDose')?.checked,
          sudLabs: document.getElementById('attachSUDLabs')?.checked,
          docs302: document.getElementById('attach302Docs')?.checked,
          roi: document.getElementById('attachROI')?.checked
        },
        lastUpdated: new Date().toISOString()
      };

      // Store in patient data
      if (!currentPatient.priorAuth) {
        currentPatient.priorAuth = {};
      }
      
      // Preserve isSubmitted flag if it exists
      const existingSubmitted = currentPatient.priorAuth.isSubmitted;
      const existingSubmittedAt = currentPatient.priorAuth.submittedAt;
      
      Object.assign(currentPatient.priorAuth, paData);
      
      if (existingSubmitted) {
        currentPatient.priorAuth.isSubmitted = existingSubmitted;
        currentPatient.priorAuth.submittedAt = existingSubmittedAt;
      }
      
      // Save to localStorage
      savePatientData();
    },

    loadPaData() {
      const currentPatient = getCurrentPatient();
      if (!currentPatient?.priorAuth) return;

      const pa = currentPatient.priorAuth;
      
      // Load basic fields
      const fieldMappings = {
        paPayer: 'payer',
        paPlan: 'plan', 
        paFacility: 'facility',
        paLevelOfCare: 'levelOfCare',
        paStatus: 'status',
        paSubmissionMethod: 'submissionMethod',
        paRefNumber: 'refNumber',
        paSubmittedBy: 'submittedBy',
        paSubmittedDateTime: 'submittedDateTime',
        paContactLine: 'contactLine',
        paPortalUrl: 'portalUrl',
        paPayerNotes: 'payerNotes',
        paDecision: 'decision',
        paAuthNumber: 'authNumber',
        paCoverageSpan: 'coverageSpan',
        paDecisionTime: 'decisionTime',
        paAgent: 'agent',
        paDenialReason: 'denialReason',
        paDenialRationale: 'denialRationale',
        paP2PDateTime: 'p2pDateTime',
        paP2PClinician: 'p2pClinician',
        paNotes: 'notes'
      };

      Object.entries(fieldMappings).forEach(([elementId, dataKey]) => {
        const element = document.getElementById(elementId);
        if (element && pa[dataKey]) {
          element.value = pa[dataKey];
        }
      });

      // Load checkboxes
      if (document.getElementById('paExpedited') && pa.expedited !== undefined) {
        document.getElementById('paExpedited').checked = pa.expedited;
      }

      if (pa.attachments) {
        const checkboxMappings = {
          attachCoreSummary: 'coreSummary',
          attachASAM: 'asam',
          attachMeds: 'meds',
          attachLastDose: 'lastDose',
          attachSUDLabs: 'sudLabs',
          attach302Docs: 'docs302',
          attachROI: 'roi'
        };

        Object.entries(checkboxMappings).forEach(([elementId, dataKey]) => {
          const element = document.getElementById(elementId);
          if (element && pa.attachments[dataKey] !== undefined) {
            element.checked = pa.attachments[dataKey];
          }
        });
      }

      // Trigger status display update
      if (pa.status) {
        this.updateStatusDisplay(pa.status);
      }

      // Update plans dropdown if payer is set
      if (pa.payer) {
        this.updatePlans();
      }

      // Show/hide conditional sections
      this.setupConditionalSections();

      // Check if PA is completed/submitted and should show summary instead of form
      // Only show summary if explicitly submitted, not just based on status
      const isExplicitlySubmitted = pa.isSubmitted === true;
      if (isExplicitlySubmitted && this.hasSignificantData(pa)) {
        const summaryData = this.generateSummaryData();
        this.displaySummaryCard(summaryData);
        this.hidePAForm();
      } else {
        this.showPAForm();
      }
    },

    // Check if PA has significant data worth summarizing
    hasSignificantData(pa) {
      const significantFields = ['payer', 'plan', 'facility', 'decision', 'authNumber', 'status'];
      return significantFields.some(field => pa[field] && pa[field].trim());
    },

    // Toggle expandable sections
    toggleSection(sectionType) {
      const button = document.getElementById(`expand${sectionType.charAt(0).toUpperCase() + sectionType.slice(1)}`);
      const content = document.getElementById(`${sectionType}Content`);
      const icon = button?.querySelector('.expand-icon');
      
      if (content && button && icon) {
        const isExpanded = content.style.display !== 'none';
        
        if (isExpanded) {
          content.style.display = 'none';
          button.classList.remove('expanded');
          icon.style.transform = 'rotate(0deg)';
        } else {
          content.style.display = 'block';
          button.classList.add('expanded');
          icon.style.transform = 'rotate(90deg)';
        }
      }
    },

    // Open the options drawer
    openDrawer() {
      const drawer = document.getElementById('paOptionsDrawer');
      if (drawer) {
        drawer.style.display = 'block';
      }
    },

    // Close the options drawer
    closeDrawer() {
      const drawer = document.getElementById('paOptionsDrawer');
      if (drawer) {
        drawer.style.display = 'none';
      }
    },

    // Collapse all expandable sections
    collapseAllSections() {
      const sections = ['authorization', 'decision', 'submission', 'guardrails'];
      sections.forEach(sectionType => {
        const button = document.getElementById(`expand${sectionType.charAt(0).toUpperCase() + sectionType.slice(1)}`);
        const content = document.getElementById(`${sectionType}Content`);
        const icon = button?.querySelector('.expand-icon');
        
        if (content && button && icon) {
          content.style.display = 'none';
          button.classList.remove('expanded');
          icon.style.transform = 'rotate(0deg)';
        }
      });
    },

    // Expand all expandable sections
    expandAllSections() {
      const sections = ['authorization', 'decision', 'submission', 'guardrails'];
      sections.forEach(sectionType => {
        const button = document.getElementById(`expand${sectionType.charAt(0).toUpperCase() + sectionType.slice(1)}`);
        const content = document.getElementById(`${sectionType}Content`);
        const icon = button?.querySelector('.expand-icon');
        
        if (content && button && icon) {
          content.style.display = 'block';
          button.classList.add('expanded');
          icon.style.transform = 'rotate(90deg)';
        }
      });
    },

    // Submit PA data and generate summary card
    submitAndGenerateSummary() {
      // Mark as submitted in patient data
      const currentPatient = getCurrentPatient();
      if (currentPatient) {
        if (!currentPatient.priorAuth) {
          currentPatient.priorAuth = {};
        }
        currentPatient.priorAuth.isSubmitted = true;
        currentPatient.priorAuth.submittedAt = new Date().toISOString();
      }
      
      this.savePaData();
      const summaryData = this.generateSummaryData();
      this.displaySummaryCard(summaryData);
      this.hidePAForm();
      showToast('PA information saved and summary generated');
    },

    // Generate summary data from filled fields
    generateSummaryData() {
      const data = {};
      
      // Core fields
      const coreFields = [
        { id: 'paPayer', label: 'Payer' },
        { id: 'paPlan', label: 'Plan' },
        { id: 'paFacility', label: 'Facility' },
        { id: 'paLevelOfCare', label: 'Level of Care' },
        { id: 'paStatus', label: 'Status' },
        { id: 'paDecision', label: 'Decision' },
        { id: 'paAuthNumber', label: 'Auth Number' },
        { id: 'paCoverageSpan', label: 'Coverage' },
        { id: 'paContactLine', label: 'Contact Line' },
        { id: 'paAgent', label: 'Agent' },
        { id: 'paSubmissionMethod', label: 'Method' },
        { id: 'paRefNumber', label: 'Reference #' },
        { id: 'paNotes', label: 'Notes' }
      ];
      
      coreFields.forEach(field => {
        const element = document.getElementById(field.id);
        if (element && element.value && element.value.trim()) {
          data[field.label] = element.value.trim();
        }
      });
      
      // Handle checkboxes
      const expedited = document.getElementById('paExpedited');
      if (expedited && expedited.checked) {
        data['Expedited'] = 'Yes';
      }
      
      // Handle dates
      const submittedDate = document.getElementById('paSubmittedDateTime');
      if (submittedDate && submittedDate.value) {
        data['Submitted'] = new Date(submittedDate.value).toLocaleDateString();
      }
      
      const decisionDate = document.getElementById('paDecisionTime');
      if (decisionDate && decisionDate.value) {
        data['Decision Date'] = new Date(decisionDate.value).toLocaleDateString();
      }
      
      return data;
    },

    // Display the summary card
    displaySummaryCard(data) {
      const summaryCard = document.getElementById('paSummaryCard');
      const summaryContent = document.getElementById('paSummaryContent');
      
      if (!summaryCard || !summaryContent) return;
      
      let html = '';
      Object.entries(data).forEach(([label, value]) => {
        const statusClass = label === 'Status' ? `status ${value.toLowerCase().replace(' ', '-')}` : '';
        html += `
          <div class="pa-summary-row">
            <span class="pa-summary-label">${label}:</span>
            <span class="pa-summary-value ${statusClass}">${value}</span>
          </div>
        `;
      });
      
      summaryContent.innerHTML = html;
      summaryCard.style.display = 'block';
    },

    // Hide the PA form sections
    hidePAForm() {
      const sections = [
        '.pa-header-section',
        '.pa-expandable-section'
      ];
      
      sections.forEach(selector => {
        const section = document.querySelector(selector);
        if (section) {
          section.style.display = 'none';
        }
      });
    },

    // Show the PA form sections (for editing)
    showPAForm() {
      const sections = [
        '.pa-header-section',
        '.pa-expandable-section'
      ];
      
      sections.forEach(selector => {
        const section = document.querySelector(selector);
        if (section) {
          section.style.display = 'block';
        }
      });
      
      // Make sure submit section is definitely visible within the authorization content
      const submitSection = document.querySelector('.pa-submit-section');
      if (submitSection) {
        submitSection.style.display = 'block';
        submitSection.style.visibility = 'visible';
      }
      
      const summaryCard = document.getElementById('paSummaryCard');
      if (summaryCard) {
        summaryCard.style.display = 'none';
      }
    },

    // Edit PA - show form again
    editPA() {
      this.showPAForm();
      showToast('PA form restored for editing');
    },

    // Clear all PA fields
    clearAllFields() {
      if (!confirm('Are you sure you want to clear all PA information?')) return;
      
      // Clear all form inputs
      const inputs = document.querySelectorAll('.prior-auth-panel input, .prior-auth-panel select, .prior-auth-panel textarea');
      inputs.forEach(input => {
        if (input.type === 'checkbox') {
          input.checked = false;
        } else {
          input.value = '';
        }
      });
      
      // Clear patient data
      const currentPatient = getCurrentPatient();
      if (currentPatient && currentPatient.priorAuth) {
        currentPatient.priorAuth = {};
        savePatientData();
      }
      
      // Hide summary card and show form
      this.showPAForm();
      showToast('All PA information cleared');
    },

    // Refresh display after external PA status updates (e.g., from Quick Update)
    refreshDisplay() {
      this.loadPaData();
      this.runAutoCheck();
      showToast('Prior Authorization status updated');
    }
  };

  async function init() {
    injectStatusThemeStyles();
    await loadPatientListFromDoc();
    cacheDom();
    populateStaticSelects();
    populatePatientSelector();
    setupFilters();
    setupPrototypeActions();
    setupNavigation();
    setupGlobalStubs();
    setupGlobalShortcuts();
    priorAuthModule.init(); // Initialize Prior Authorization module
    if (dom.patientSelect) {
      dom.patientSelect.addEventListener('change', handlePatientSwitch);
    }
    renderAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      init().catch((err) => console.error('Init error', err));
    });
  } else {
    init().catch((err) => console.error('Init error', err));
  }
})();
