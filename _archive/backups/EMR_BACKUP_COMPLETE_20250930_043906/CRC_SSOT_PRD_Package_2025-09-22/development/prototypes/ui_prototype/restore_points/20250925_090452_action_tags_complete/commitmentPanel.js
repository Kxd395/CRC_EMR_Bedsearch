const commitmentTypeLabels = {
  '201': '201 (Voluntary)',
  '302': '302 (Emergency Involuntary)',
  '303': '303 (Extended Involuntary)',
  '304': '304 (Court-Ordered)',
  'ECT': 'ECT (Consent/Court Order)',
  OTHER: 'Other'
};

const commitmentStatusLabels = {
  Active: 'Active',
  Pending: 'Pending',
  Requested: 'Requested',
  Approved: 'Approved',
  Expired: 'Expired',
  Discontinued: 'Discontinued'
};

const DEFAULT_SECTION_PREFS = {
  docs: true,
  schedule: true,
  facilities302: true,
  quickActions: true,
  quickUpdate: true,
  guardrails: true
};

function getTypeLabel(type) {
  return commitmentTypeLabels[type] || commitmentTypeLabels.OTHER;
}

function formatShortDateTime(value) {
  if (!value) return '—';
  try {
    const date = new Date(value);
    const options = { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleString('en-US', options);
  } catch (err) {
    return value;
  }
}

function formatCountdown(targetIso) {
  if (!targetIso) {
    return { label: '—', status: 'neutral' };
  }
  const now = new Date();
  const target = new Date(targetIso);
  let diff = target - now;
  const overdue = diff < 0;
  diff = Math.abs(diff);
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const label = `${overdue ? '-' : ''}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  let status = 'neutral';
  if (overdue) {
    status = 'badge-critical';
  } else if (diff <= 2 * 3_600_000) {
    status = 'badge-warn';
  }
  return { label, status };
}

function deriveTypeFromStatus(status = '') {
  const lower = status.toLowerCase();
  if (lower.includes('302')) return '302';
  if (lower.includes('303')) return '303';
  if (lower.includes('304')) return '304';
  if (lower.includes('201')) return '201';
  if (lower.includes('ect')) return 'ECT';
  if (lower.includes('other')) return 'OTHER';
  return null;
}

function deriveStatusOption(status = '') {
  const lower = status.toLowerCase();
  if (lower.includes('pending')) return 'Pending';
  if (lower.includes('request')) return 'Requested';
  if (lower.includes('approve')) return 'Approved';
  if (lower.includes('expire')) return 'Expired';
  if (lower.includes('discontinu')) return 'Discontinued';
  if (lower.includes('required') || lower.includes('active')) return 'Active';
  return 'Active';
}

function renderDocChecklist(docs = []) {
  if (!docs.length) {
    return '<p class="hint">No required documentation configured for this commitment type.</p>';
  }
  return docs
    .map((doc) => {
      const statusClass = doc.completed ? 'complete' : 'pending';
      const statusIcon = doc.completed ? '✓' : '○';
      const timestamp = doc.timestamp ? doc.timestamp : '';
      const timestampDisplay = timestamp ? `<span class="commitment-doc-timestamp">${timestamp}</span>` : '';
      return `<div class="commitment-doc-item ${statusClass}">
        <span class="commitment-doc-status">${statusIcon}</span>
        <span class="commitment-doc-label">${doc.label}</span>
        ${timestampDisplay}
      </div>`;
    })
    .join('');
}

function renderFacilities(facilities = []) {
  if (!facilities.length) {
    return '<p class="hint">No filtered facilities available. Use Open full Finder for a broader search.</p>';
  }
  return facilities
    .map((facility) => {
      const tags = (facility.tags || [])
        .map((tag) => `<span class="commitment-tag">${tag}</span>`)
        .join('');
      return `
        <div class="commitment-facility-card">
          <div class="commitment-facility-name">${facility.name}</div>
          <div class="commitment-facility-level">${facility.level}</div>
          <div class="commitment-facility-verified">${facility.verified || ''}</div>
          <div class="commitment-facility-tags">${tags}</div>
          <div class="commitment-actions-horizontal">
            <button class="ghost-btn" data-legal-action="details" data-facility="${facility.id}">Details</button>
            <button class="primary-btn" data-legal-action="select" data-facility="${facility.id}">Select</button>
          </div>
        </div>
      `;
    })
    .join('');
}

function renderSchedule(schedule = {}) {
  const next = schedule.next
    ? `
      <div>
        <strong>Next event:</strong>
        <div>${schedule.next.event || '—'} · ${formatShortDateTime(schedule.next.datetime)} · ${schedule.next.location || 'TBD'}</div>
        <div class="hint">Judge/Officer: ${schedule.next.judicialOfficer || '—'} · Served: ${schedule.next.served || 'N'} ${schedule.next.servedTo ? `(${schedule.next.servedTo})` : ''}</div>
      </div>
    `
    : '<div><strong>Next event:</strong> —</div>';
  const prior = (schedule.prior || [])
    .map((entry) => `<li>${entry.event} (${formatShortDateTime(entry.datetime)})</li>`)
    .join('');
  return `${next}<div><strong>Prior events:</strong><ul>${prior || '<li>None recorded</li>'}</ul></div>`;
}

function renderGuardrails(guardrails = {}) {
  const items = [
    { key: 'legalDocsComplete', label: '302 documentation complete', invert: true },
    { key: 'courtDependencyOverdue', label: 'Court / hearing requirement overdue', invert: false },
    { key: 'reassessFlag', label: 'Clinical reassessment required', invert: false }
  ];
  return items
    .map((item) => {
      const active = !!guardrails[item.key];
      const ok = item.invert ? active : !active;
      return `<li>${ok ? '✓' : '⚠️'} ${item.label}</li>`;
    })
    .join('');
}

function renderFacilityFilters(filters = {}) {
  const chips = [
    { key: 'takes302', label: 'TAKES_302' },
    { key: 'secureBh', label: 'Secure BH' },
    { key: 'acuteMed', label: 'Acute Med Stab' }
  ];
  return chips
    .map((chip) => {
      const value = filters[chip.key];
      const checked = value ? 'checked' : '';
      return `<label><input type="checkbox" disabled ${checked}> ${chip.label}</label>`;
    })
    .join('');
}

function hideElement(element) {
  if (!element) return;
  element.style.display = 'none';
  element.setAttribute('hidden', '');
}

function showElement(element, display = 'block') {
  if (!element) return;
  element.style.display = display;
  element.removeAttribute('hidden');
}

function buildSummary({
  summaryContainer,
  expanded,
  typeLabel,
  statusLabel,
  timerInfo,
  docsSummary,
  nextEventLabel,
  hasLegalBlock,
  toggle
}) {
  if (!summaryContainer) return;
  const alertDot = `<span class="commitment-summary-dot ${hasLegalBlock ? 'alert' : ''}" aria-hidden="true"></span>`;
  const summaryText = `<span class="commitment-summary-text"><strong>COMMITMENT</strong> • ${typeLabel} (${statusLabel}) • Expires in ${timerInfo.label} • Docs ${docsSummary} • Next: ${nextEventLabel}</span>`;
  const toggleText = expanded ? 'Less…' : 'More…';
  summaryContainer.innerHTML = `
    <button type="button" class="commitment-summary-toggle" aria-expanded="${expanded}" aria-controls="commitmentStatusPanel" aria-label="${expanded ? 'Hide' : 'Show'} commitment details" ${hasLegalBlock ? 'data-alert="true"' : ''}>
      <span class="commitment-summary-main">${alertDot}${summaryText}</span>
      <span class="commitment-summary-more">${toggleText}</span>
    </button>
  `;
  summaryContainer.dataset.hasCommitment = 'true';
  showElement(summaryContainer, 'block');
  const button = summaryContainer.querySelector('.commitment-summary-toggle');
  if (button && typeof toggle === 'function') {
    button.addEventListener('click', toggle);
    button.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        toggle();
      }
    });
  }
}

export function renderCommitmentPanel({
  summaryContainer,
  panelContainer,
  patient,
  status,
  settings,
  expandedState,
  setExpanded,
  showToast
}) {
  if (!summaryContainer || !panelContainer) {
    return;
  }

  const normalizedStatus = (status || '').trim();
  if (settings.visible === false || !normalizedStatus) {
    hideElement(summaryContainer);
    hideElement(panelContainer);
    summaryContainer.dataset.hasCommitment = 'false';
    if (patient?.id && setExpanded) {
      setExpanded(patient.id, undefined);
    }
    return;
  }

  const details = patient?.commitmentDetails || null;
  const derivedType = deriveTypeFromStatus(normalizedStatus) || details?.type || 'OTHER';
  const resolvedStatus = details?.status || deriveStatusOption(normalizedStatus);
  const sectionPrefs = { ...DEFAULT_SECTION_PREFS, ...(settings.sections || {}) };

  const resolvedDetails = {
    type: derivedType,
    status: resolvedStatus,
    startedAt: details?.startedAt || null,
    expiresAt: details?.expiresAt || null,
    legalNotes: details?.legalNotes || '',
    docsByType: details?.docsByType || {},
    schedule: details?.schedule || {},
    facilityFilters: details?.facilityFilters || {},
    facilityMatches: details?.facilityMatches || [],
    quickActions: details?.quickActions || [],
    quickUpdate: details?.quickUpdate || { actions: [], updateStatus: true, appendAudit: true, copyToSsot: false },
    guardrails: details?.guardrails || {}
  };

  // Extract individual item settings
  const items = settings.items || {};

  const docsForType = (resolvedDetails.docsByType && resolvedDetails.docsByType[resolvedDetails.type]) || [];
  const completedDocs = docsForType.filter((doc) => doc.completed).length;
  const totalDocs = docsForType.length;
  const docsSummary = `${completedDocs}/${totalDocs || 0}`;
  const timerInfo = formatCountdown(resolvedDetails.expiresAt);
  const nextEventLabel = resolvedDetails.schedule?.next
    ? `${resolvedDetails.schedule.next.event || 'Event'} ${formatShortDateTime(resolvedDetails.schedule.next.datetime)}`
    : 'None';

  const typeLabel = getTypeLabel(resolvedDetails.type);
  const statusLabel = commitmentStatusLabels[resolvedDetails.status] || resolvedDetails.status;

  let expanded = expandedState?.[patient?.id];
  if (expanded === undefined) {
    expanded = !settings.collapsedByDefault;
    if (settings.autoExpandOn302 && resolvedDetails.type === '302') {
      expanded = true;
    }
    if (settings.autoExpandOnPending && statusLabel.toLowerCase() === 'pending') {
      expanded = true;
    }
    if (patient?.id && setExpanded) {
      setExpanded(patient.id, expanded);
    }
  }

  const legalDocsComplete = resolvedDetails.guardrails?.legalDocsComplete !== false;
  const courtOverdue = !!resolvedDetails.guardrails?.courtDependencyOverdue;
  const reassessFlag = !!resolvedDetails.guardrails?.reassessFlag;
  const legalBlock = (resolvedDetails.type === '302' && !legalDocsComplete) || courtOverdue || reassessFlag;

  buildSummary({
    summaryContainer,
    expanded,
    typeLabel,
    statusLabel,
    timerInfo,
    docsSummary,
    nextEventLabel,
    hasLegalBlock: legalBlock,
    toggle: () => {
      const next = !expanded;
      if (patient?.id && setExpanded) {
        setExpanded(patient.id, next);
      }
      renderCommitmentPanel({
        summaryContainer,
        panelContainer,
        patient,
        status,
        settings,
        expandedState,
        setExpanded,
        showToast
      });
    }
  });

  const docsHtml = renderDocChecklist(docsForType);
  const scheduleHtml = renderSchedule(resolvedDetails.schedule);
  const facilitiesHtml = renderFacilities(resolvedDetails.facilityMatches);
  const guardrailHtml = renderGuardrails(resolvedDetails.guardrails);
  const filtersHtml = renderFacilityFilters(resolvedDetails.facilityFilters);
  const quickActionsList = (resolvedDetails.quickActions && resolvedDetails.quickActions.length)
    ? resolvedDetails.quickActions
    : [
        { id: 'logPetition', label: 'Log petition' },
        { id: 'mark302Approved', label: 'Mark 302 approved' },
        { id: 'schedule303', label: 'Schedule 303' },
        { id: 'record201Discharge', label: 'Record 201 discharge request' }
      ];
  const quickActionButtons = quickActionsList
    .map((action) => `<button class="ghost-btn" data-legal-action="${action.id}">${action.label}</button>`)
    .join('');
  const quickUpdateList = (resolvedDetails.quickUpdate?.actions && resolvedDetails.quickUpdate.actions.length)
    ? resolvedDetails.quickUpdate.actions
    : ['Legal update'];
  const quickUpdateOptions = quickUpdateList
    .map((action) => `<option value="${action}">${action}</option>`)
    .join('');

  const showSchedule = ['201', '302', '303', '304', 'ECT', 'OTHER'].includes(resolvedDetails.type);

  const statusEnabled = true; // Status section always enabled for commitment panels
  const docsEnabled = sectionPrefs.docs !== false;
  const scheduleEnabled = sectionPrefs.schedule !== false;
  const facilitiesEnabled = sectionPrefs.facilities302 !== false && resolvedDetails.type === '302';
  const quickActionsEnabled = sectionPrefs.quickActions !== false;
  const quickUpdateEnabled = sectionPrefs.quickUpdate !== false;

  // Format dates and calculate progress
  const startDate = resolvedDetails.startedAt ? new Date(resolvedDetails.startedAt).toLocaleDateString() : 'Not set';
  const expiryDate = resolvedDetails.expiresAt ? new Date(resolvedDetails.expiresAt).toLocaleDateString() : 'Not set';
  const progressPercent = timerInfo.percentage || 0;
  const nextAction = resolvedDetails.nextAction || 'Review documentation';

  const statusSection = statusEnabled
    ? `
    <div class="commitment-status">
      <header><strong>Commitment Status Overview</strong></header>
      ${items.statusIndicator !== false ? `<div class="status-indicator">
        <span class="status-badge status-${resolvedDetails.status?.toLowerCase()}">${statusLabel}</span>
      </div>` : ''}
      ${items.statusType !== false ? `<div><strong>Type:</strong> ${typeLabel}</div>` : ''}
      ${items.statusStartDate !== false ? `<div><strong>Started:</strong> ${startDate}</div>` : ''}
      ${items.statusExpiryDate !== false ? `<div><strong>Expires:</strong> ${expiryDate}</div>` : ''}
      ${items.statusProgress !== false ? `<div class="status-progress">
        <strong>Time elapsed:</strong>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progressPercent}%"></div>
        </div>
        <span class="progress-text">${timerInfo.label}</span>
      </div>` : ''}
      ${items.statusNextAction !== false ? `<div><strong>Next action:</strong> ${nextAction}</div>` : ''}
    </div>
  `
    : '';

  const docsSection = docsEnabled
    ? `
    <div class="commitment-docs">
      <header class="commitment-docs-header">
        <span class="commitment-section-flag">Required Documentation</span>
        <span class="commitment-progress-flag">Docs complete: ${docsSummary}</span>
      </header>
      ${items.docsProgressBar !== false ? `<div class="commitment-progress-track">
        <div class="commitment-progress-bar" style="width: ${totalDocs ? Math.round((completedDocs / totalDocs) * 100) : 0}%"></div>
      </div>` : ''}
      ${items.docsChecklist !== false ? `<div class="commitment-doc-list">${docsHtml}</div>` : ''}
      ${items.docsBlockersMessage !== false && resolvedDetails.type === '302' && !legalDocsComplete ? '<div class="commitment-legal-blocker"><span class="commitment-warning-flag">⚠️ LEGAL BLOCKERS</span> Documentation incomplete</div>' : ''}
      <div class="commitment-actions-horizontal">
        ${items.docsPetition !== false ? '<button class="ghost-btn" data-legal-action="logPetition">Log petition</button>' : ''}
        <button class="ghost-btn" data-legal-action="validateDocs">Validate docs</button>
        <button class="ghost-btn" data-legal-action="printPacket">Print packet</button>
        <button class="ghost-btn" data-legal-action="exportSummary">Export summary</button>
        <button class="ghost-btn" data-legal-action="uploadDoc">Upload doc</button>
        <button class="ghost-btn" data-legal-action="reviewDocs">Review all</button>
      </div>
    </div>
  `
    : '';

  const scheduleSection = showSchedule && scheduleEnabled
    ? `
      <div class="commitment-schedule">
        <header><strong>Court &amp; Legal Schedule</strong></header>
        ${items.scheduleNextEvent !== false ? (resolvedDetails.schedule.next ? `
          <div>
            <strong>Next event:</strong>
            <div>${resolvedDetails.schedule.next.event || '—'} · ${formatShortDateTime(resolvedDetails.schedule.next.datetime)} · ${resolvedDetails.schedule.next.location || 'TBD'}</div>
            <div class="hint">Judge/Officer: ${resolvedDetails.schedule.next.judicialOfficer || '—'} · Served: ${resolvedDetails.schedule.next.served || 'N'} ${resolvedDetails.schedule.next.servedTo ? `(${resolvedDetails.schedule.next.servedTo})` : ''}</div>
          </div>
        ` : '<div><strong>Next event:</strong> —</div>') : ''}
        ${items.schedulePriorEvents !== false ? `<div><strong>Prior events:</strong><ul>${(resolvedDetails.schedule.prior || []).map((entry) => `<li>${entry.event} (${formatShortDateTime(entry.datetime)})</li>`).join('') || '<li>None recorded</li>'}</ul></div>` : ''}
        <div class="commitment-actions-horizontal">
          <button class="ghost-btn" data-legal-action="addEvent">Add event</button>
          <button class="ghost-btn" data-legal-action="printPacket">Print packet</button>
          <button class="ghost-btn" data-legal-action="exportSummary">Export summary</button>
        </div>
      </div>
    `
    : '';

  const facilitiesSection = facilitiesEnabled
    ? `
      <div class="commitment-facilities">
        <header class="commitment-facilities-header">
          <span class="commitment-section-flag">302-capable accepting facilities</span>
        </header>
        <div class="commitment-tags">${filtersHtml}</div>
        <div class="commitment-facility-grid">${facilitiesHtml}</div>
        <div><button class="ghost-btn" data-legal-action="openFinder">Open full Finder</button></div>
      </div>
    `
    : '';

  const quickActionsSection = quickActionsEnabled
    ? `
    <div class="commitment-actions">
      <header><strong>Quick Actions</strong></header>
      <div>${quickActionButtons || '<span class="hint">No quick actions configured.</span>'}</div>
      <ul class="commitment-guardrails">${guardrailHtml}</ul>
      ${legalBlock ? '<div class="commitment-legal-blocker">⚠️ Legal blockers present — finalize transfer unavailable until resolved</div>' : ''}
      <div><button class="ghost-btn" data-legal-action="validateAll">Validate all requirements</button></div>
    </div>
  `
    : '';

  const quickUpdateSection = quickUpdateEnabled
    ? `
    <div class="commitment-quick-update">
      <header><strong>Quick Update — Legal</strong></header>
      <div class="form-row">
        <div class="commitment-field">
          <label>Action</label>
          <select id="legalQuickAction">${quickUpdateOptions}</select>
        </div>
        <div class="commitment-field">
          <label>Note (140 chars)</label>
          <textarea id="legalQuickNote" maxlength="140" placeholder="Enter legal update..."></textarea>
        </div>
      </div>
      <div class="commitment-field">
        <label>Side effects</label>
        <div class="hint">Updates commitment status and audit automatically. Copy to SSOT notes optional.</div>
      </div>
      <div>
        <button class="primary-btn" id="legalQuickUpdate">Save</button>
      </div>
    </div>
  `
    : '';

  panelContainer.innerHTML = [
    statusSection,
    docsSection,
    scheduleSection,
    facilitiesSection,
    quickActionsSection,
    quickUpdateSection
  ]
    .filter(Boolean)
    .join('\n');

  if (expanded) {
    showElement(panelContainer, 'block');
  } else {
    hideElement(panelContainer);
  }

  const legalUpdateButton = panelContainer.querySelector('#legalQuickUpdate');
  const legalActionSelect = panelContainer.querySelector('#legalQuickAction');
  const legalNote = panelContainer.querySelector('#legalQuickNote');
  if (legalUpdateButton) {
    legalUpdateButton.onclick = () => {
      const action = legalActionSelect?.value || 'Legal update';
      const noteValue = legalNote?.value?.trim();
      if (legalNote) {
        legalNote.value = '';
      }
      if (typeof showToast === 'function') {
        showToast(`Legal update saved: ${action}${noteValue ? ` — ${noteValue}` : ''}`);
      }
    };
  }

  panelContainer.querySelectorAll('[data-legal-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.getAttribute('data-legal-action');
      if (typeof showToast !== 'function') {
        return;
      }
      if (action === 'select') {
        const facilityId = button.getAttribute('data-facility');
        showToast(`Facility ${facilityId} selected for follow-up.`);
      } else if (action === 'details') {
        showToast('Facility details view is storyboarded in this prototype.');
      } else if (action === 'openFinder') {
        showToast('Opening full finder is storyboarded in this mock.');
      } else {
        showToast(`Action recorded: ${button.textContent.trim()}`);
      }
    });
  });
}
