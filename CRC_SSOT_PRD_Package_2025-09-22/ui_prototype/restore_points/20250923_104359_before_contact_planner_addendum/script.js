(() => {
  const asamOptions = [
    { value: '3.7WM', label: '3.7 WM — Medically Managed Withdrawal' },
    { value: '3.5COC', label: '3.5 COC — Clinically Managed High-Intensity' },
    { value: '3.3', label: '3.3 — Population Specific High-Intensity' },
    { value: '3.1', label: '3.1 — Clinically Managed Low-Intensity' },
    { value: '2.1', label: '2.1 — Intensive Outpatient' },
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

  const canonicalStatusPalette = {
    Waiting: {
      label: 'Waiting / Sent',
      icon: '⧗',
      chipClass: 'status-badge badge-waiting',
      rowClass: 'st-pending'
    },
    Accepted: {
      label: 'Accepted',
      icon: '✓',
      chipClass: 'status-badge badge-accepted',
      rowClass: 'st-accepted'
    },
    Denied: {
      label: 'Denied',
      icon: '⨯',
      chipClass: 'status-badge badge-denied',
      rowClass: 'st-denied'
    },
    NoBeds: {
      label: 'No beds',
      icon: '∅',
      chipClass: 'status-badge badge-nobeds',
      rowClass: 'st-nobeds'
    }
  };

  const statusConfig = {
    Searching: { ...canonicalStatusPalette.Waiting, label: 'Waiting — Searching', canonical: 'Waiting' },
    PendingReview: { ...canonicalStatusPalette.Waiting, label: 'Waiting — Pending review', canonical: 'Waiting' },
    AwaitingCallback: { ...canonicalStatusPalette.Waiting, label: 'Waiting — Awaiting call-back', canonical: 'Waiting' },
    AwaitingFax: { ...canonicalStatusPalette.Waiting, label: 'Waiting — Awaiting fax', canonical: 'Waiting' },
    PacketSent: { ...canonicalStatusPalette.Waiting, label: 'Waiting — Packet sent', canonical: 'Waiting' },
    Accepted: { ...canonicalStatusPalette.Accepted, canonical: 'Accepted' },
    Denied: { ...canonicalStatusPalette.Denied, canonical: 'Denied' },
    NoBeds: { ...canonicalStatusPalette.NoBeds, canonical: 'NoBeds' },
    Canceled: { ...canonicalStatusPalette.Waiting, label: 'Waiting — Canceled', canonical: 'Waiting' }
  };

  const channelLabels = {
    fax: 'Fax',
    phone: 'Phone',
    email: 'Secure Email',
    portal: 'Provider Portal'
  };

  const staffDirectory = {
    mlee: 'Morgan Lee',
    kdial: 'Kevin Dial',
    transfer: 'Transfer Center',
    chen: 'CRS Chen',
    unassigned: 'Unassigned'
  };

  const patientScenarios = [
    {
      id: 'S1',
      label: 'S1 — Jordan Rivera (302 hold, methadone continue)',
      identifiers: { name: 'Rivera, Jordan', mrn: '1234567', fin: 'FIN1000456' },
      consent: { act148: false, part2: false, expiry: null },
      note: {
        asam: '3.7WM',
        assessmentTs: '2025-09-22T08:32:00Z',
        matNeeds: 'MethadoneContinue',
        placementNeeded: 'Y',
        commitment: '302Required',
        acuity: 'Secured',
        selectedFacility: 'Friends Hospital — Secure Detox',
        overrideReason: '',
        reassessFlag: 'N',
        transferStatus: 'sent',
        quickNotes: 'Bed confirmed for 14:00 arrival. 302 packet uploaded and waiting transport window.',
        lastUpdated: '09/22 09:10 by Furline, M'
      },
      contact: {
        next: 'Call Friends Hospital transfer center at 09:30 to lock transport window.',
        last: '09:05 — Voicemail left for transfer center (Friends Hospital)'
      },
      assignment: { id: 'mlee', role: 'CRC Tech' },
      handoff: 'Keep 302 paperwork handy; confirm transport ETA once acceptance paperwork is signed.',
      tasks: [
        { text: 'Confirm secure bed at Friends Hospital transfer center', owner: 'CRC RN', tone: 'info' },
        { text: 'Upload signed 302 paperwork to packet set', owner: 'Morgan Lee', tone: 'warn' }
      ],
      timeline: {
        steps: ['Arrival & assessment', 'Quick update recorded', 'Packet sent', 'Acceptance received', 'Transport scheduled', 'Transfer finalized'],
        activeIndex: 3
      },
      activities: [
        { ts: '09/22 09:05', action: 'Call facility', outcome: 'Voicemail left', notes: 'Initial outreach to Friends Hospital transfer center.' },
        { ts: '09/22 08:55', action: 'Send packet', outcome: 'Fax sent', notes: 'Packet faxed to secure detox unit.' }
      ],
      board: {
        placement: 'Friends Hospital — Secure Detox',
        statusKey: 'accepted',
        statusLabel: 'Accepted',
        mat: 'Methadone continue',
        transport: 'Needs pickup window',
        needsTransport: true,
        isPlaced: true,
        assignedId: 'mlee',
        lastUpdate: '09/22 09:10',
        reassess: 'No'
      },
      searches: [
        {
          id: 'S1-01',
          facilityId: 'FRIENDS_HOSP',
          facilityName: 'Friends Hospital',
          status: 'Accepted',
          updated: '09/22 09:10',
          created: '09/22 08:32',
          channels: ['fax'],
          summary: 'Secure bed confirmed for 14:00 arrival.',
          assignedTo: 'mlee',
          timeBucket: 'today'
        },
        {
          id: 'S1-02',
          facilityId: 'TEMPLE_PSYCH',
          facilityName: 'Temple Psychiatric',
          status: 'Denied',
          updated: '09/22 08:40',
          created: '09/22 08:15',
          channels: ['fax'],
          summary: 'Unable to support methadone continuation.',
          assignedTo: 'mlee',
          timeBucket: 'today'
        }
      ],
      searchHistory: [
        { ts: '09/22 09:10', status: 'Accepted', facility: 'Friends Hospital', detail: 'Bed confirmed by intake RN; holding until 14:00.' },
        { ts: '09/22 08:55', status: 'PacketSent', facility: 'Friends Hospital', detail: 'Packet faxed to secure detox unit.' },
        { ts: '09/22 08:40', status: 'Denied', facility: 'Temple Psychiatric', detail: 'Declined — no methadone program.' }
      ],
      audit: [
        { ts: '09/22 08:58', user: 'Morgan Lee', detail: 'Override not required — facility matches preferences.' }
      ]
    },
    {
      id: 'S2',
      label: 'S2 — Alicia Gomez (reassess after tox)',
      identifiers: { name: 'Gomez, Alicia', mrn: '9934412', fin: 'FIN1000457' },
      consent: { act148: true, part2: true, expiry: '2026-01-15' },
      note: {
        asam: '3.5COC',
        assessmentTs: '2025-09-22T07:55:00Z',
        matNeeds: 'MethadoneInduction',
        placementNeeded: 'Y',
        commitment: '',
        acuity: 'StepUp',
        selectedFacility: '— awaiting acceptance —',
        overrideReason: '',
        reassessFlag: 'Y',
        transferStatus: 'draft',
        quickNotes: 'MAT plan pending OTP verification. New tox result requires provider reassessment before finalize.',
        lastUpdated: '09/22 09:25 by Chen, J'
      },
      contact: {
        next: 'Check back with Hope Ridge after 11:00 rounds.',
        last: '09:15 — Secure chat sent to MAT pharmacist for dose verification.'
      },
      assignment: { id: 'chen', role: 'CRS' },
      handoff: 'Awaiting MAT verification; highlight reassess requirement before transport scheduling.',
      tasks: [
        { text: 'Obtain methadone verification from OTP', owner: 'CRS Chen', tone: 'warn' },
        { text: 'Schedule reassessment with provider', owner: 'CRC Team', tone: 'info' }
      ],
      timeline: {
        steps: ['Arrival & assessment', 'Quick update recorded', 'Packet sent', 'Acceptance received', 'Transport scheduled', 'Transfer finalized'],
        activeIndex: 1
      },
      activities: [
        { ts: '09/22 09:15', action: 'Secure chat', outcome: 'MAT pharmacist looped in', notes: 'Requested prior dose confirmation.' },
        { ts: '09/22 08:50', action: 'Call facility', outcome: 'No beds', notes: 'Riverview: no female beds until tomorrow.' }
      ],
      board: {
        placement: 'Searching 3.5 High Intensity',
        statusKey: 'pending',
        statusLabel: 'Pending review',
        mat: 'Methadone induction',
        transport: 'Reassess required',
        needsTransport: false,
        isPlaced: false,
        assignedId: 'chen',
        lastUpdate: '09/22 09:25',
        reassess: 'Yes'
      },
      searches: [
        {
          id: 'S2-01',
          facilityId: 'HOPE_RIDGE',
          facilityName: 'Hope Ridge Recovery',
          status: 'PendingReview',
          updated: '09/22 09:25',
          created: '09/22 09:20',
          channels: ['fax', 'portal'],
          summary: 'Clinical packet received; medical director rounds at 11:00.',
          assignedTo: 'chen',
          timeBucket: 'today'
        },
        {
          id: 'S2-02',
          facilityId: 'RIVERVIEW',
          facilityName: 'Riverview Detox Center',
          status: 'NoBeds',
          updated: '09/22 08:50',
          created: '09/22 08:30',
          channels: ['phone'],
          summary: 'No female beds until 09/23 12:00.',
          assignedTo: 'chen',
          timeBucket: 'today'
        },
        {
          id: 'S2-03',
          facilityId: 'CITY_ACUTE',
          facilityName: 'City Acute BH',
          status: 'PacketSent',
          updated: '09/22 09:05',
          created: '09/22 08:45',
          channels: ['fax', 'email'],
          summary: 'Awaiting callback; requires 302 paperwork if accepted.',
          assignedTo: 'chen',
          timeBucket: 'today'
        }
      ],
      searchHistory: [
        { ts: '09/22 09:25', status: 'PendingReview', facility: 'Hope Ridge Recovery', detail: 'Packet under review; follow up after rounds.' },
        { ts: '09/22 08:50', status: 'NoBeds', facility: 'Riverview Detox Center', detail: 'No beds available until tomorrow.' },
        { ts: '09/22 08:45', status: 'PacketSent', facility: 'City Acute BH', detail: 'Packet sent; waiting for secure callback.' }
      ],
      audit: [
        { ts: '09/22 09:18', user: 'J. Chen', detail: 'Flagged reassessment required due to tox result.' }
      ]
    },
    {
      id: 'S3',
      label: 'S3 — Chris Patel (step-down planning)',
      identifiers: { name: 'Patel, Chris', mrn: '7722101', fin: 'FIN1000458' },
      consent: { act148: true, part2: false, expiry: '2025-12-01' },
      note: {
        asam: '3.1',
        assessmentTs: '2025-09-21T16:20:00Z',
        matNeeds: 'None',
        placementNeeded: 'Y',
        commitment: '',
        acuity: 'Routine',
        selectedFacility: 'Sunrise Treatment Center — Step-down',
        overrideReason: '',
        reassessFlag: 'N',
        transferStatus: 'accepted',
        quickNotes: 'Family meeting complete. Sunrise ready for evening admission; transport scheduling in progress.',
        lastUpdated: '09/22 08:20 by Patel, S'
      },
      contact: {
        next: 'Coordinate pickup with MedTrans for 16:30 arrival.',
        last: '08:45 — Sunrise confirmed bed hold until 17:00.'
      },
      assignment: { id: 'mlee', role: 'CRC Tech' },
      handoff: 'Finalize transport with MedTrans and confirm with Sunrise admissions.',
      tasks: [
        { text: 'Share discharge summary with Sunrise clinical team', owner: 'Morgan Lee', tone: 'info' },
        { text: 'Confirm transport ETA with MedTrans', owner: 'Transfer Center', tone: 'info' }
      ],
      timeline: {
        steps: ['Arrival & assessment', 'Quick update recorded', 'Packet sent', 'Acceptance received', 'Transport scheduled', 'Transfer finalized'],
        activeIndex: 4
      },
      activities: [
        { ts: '09/22 08:45', action: 'Portal update', outcome: 'Accepted', notes: 'Sunrise confirmed acceptance and bed hold until 17:00.' },
        { ts: '09/21 18:30', action: 'Send packet', outcome: 'Portal', notes: 'Packet shared via Sunrise portal.' }
      ],
      board: {
        placement: 'Sunrise Treatment Center',
        statusKey: 'accepted',
        statusLabel: 'Accepted',
        mat: 'No MAT need',
        transport: 'Transport scheduled',
        needsTransport: true,
        isPlaced: true,
        assignedId: 'mlee',
        lastUpdate: '09/22 08:45',
        reassess: 'No'
      },
      searches: [
        {
          id: 'S3-01',
          facilityId: 'SUNRISE',
          facilityName: 'Sunrise Treatment Center',
          status: 'Accepted',
          updated: '09/22 08:45',
          created: '09/21 18:30',
          channels: ['portal'],
          summary: 'Bed held until 17:00; transport pending.',
          assignedTo: 'mlee',
          timeBucket: 'thisweek'
        },
        {
          id: 'S3-02',
          facilityId: 'SEASIDE',
          facilityName: 'Seaside Recovery',
          status: 'Canceled',
          updated: '09/21 16:10',
          created: '09/21 15:00',
          channels: ['fax'],
          summary: 'Patient preference change after family consult.',
          assignedTo: 'mlee',
          timeBucket: 'last3days'
        }
      ],
      searchHistory: [
        { ts: '09/22 08:45', status: 'Accepted', facility: 'Sunrise Treatment Center', detail: 'Acceptance confirmed in portal; bed hold until 17:00.' },
        { ts: '09/21 16:10', status: 'Canceled', facility: 'Seaside Recovery', detail: 'Search canceled — patient chose Sunrise.' },
        { ts: '09/21 15:00', status: 'PacketSent', facility: 'Seaside Recovery', detail: 'Packet sent via fax.' }
      ],
      audit: [
        { ts: '09/21 18:35', user: 'Morgan Lee', detail: 'Marked Sunrise as selected facility and notified transport.' }
      ]
    }
  ];

  const facilityDirectory = [
    {
      id: 'FRIENDS_HOSP',
      name: 'Friends Hospital — Secure Detox',
      asam: ['3.7WM'],
      mat: ['MethadoneContinue'],
      distance: 6,
      lastUpdated: 'Updated 4h ago',
      badges: ['Takes 302', 'Secure BH'],
      notes: 'Secure detox beds with 24/7 medical team. Prefers 2h notice for transport.',
      status: 'Accepting'
    },
    {
      id: 'HOPE_RIDGE',
      name: 'Hope Ridge Recovery',
      asam: ['3.5COC', '3.3'],
      mat: ['MethadoneInduction', 'SuboxoneInduction'],
      distance: 18,
      lastUpdated: 'Updated 1h ago',
      badges: ['Dual Dx'],
      notes: 'Rounds at 11:00 and 17:00. Prefers secure fax for packet updates.',
      status: 'Reviewing packets'
    },
    {
      id: 'RIVERVIEW',
      name: 'Riverview Detox Center',
      asam: ['3.7WM'],
      mat: ['MethadoneContinue'],
      distance: 14,
      lastUpdated: 'Updated 30m ago',
      badges: ['Takes 302'],
      notes: 'No female beds until 09/23. Contact charge nurse for cancellations.',
      status: 'No beds'
    },
    {
      id: 'SUNRISE',
      name: 'Sunrise Treatment Center',
      asam: ['3.1', '2.1'],
      mat: ['None', 'SuboxoneContinue'],
      distance: 22,
      lastUpdated: 'Updated yesterday',
      badges: ['Family program'],
      notes: 'Accepts Medicaid and commercial plans. Requires discharge summary before arrival.',
      status: 'Accepting'
    },
    {
      id: 'CITY_ACUTE',
      name: 'City Acute Behavioral Health',
      asam: ['ACUTE302', 'ACUTE201'],
      mat: ['MethadoneContinue'],
      distance: 9,
      lastUpdated: 'Updated today',
      badges: ['Takes 302', 'Acute BH'],
      notes: 'Requires 302 paperwork scanned with packet. Transport must be secure.',
      status: 'Awaiting docs'
    }
  ];

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
    { key: 'audit', name: 'Audit & Privacy Review', column: 'Right', order: 4, visible: true, collapsed: true, locked: false }
  ];

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
      assigned: ''
    },
    session: {
      quickNotes: {},
      overrideReasons: {},
      selectedFacility: {},
      reassessOverride: {},
      timelineIndex: {},
      activities: {},
      contacts: {}
    }
  };

  const dom = {};
  let toastTimer = null;

  function cacheDom() {
    const ids = [
      'patientSelect', 'patientName', 'patientMrn', 'patientFin', 'patientConsent', 'patientPart2',
      'noteUpdated', 'asamField', 'assessmentTs', 'matNeeds', 'threeOhTwo', 'acuity', 'placementNeeded',
      'selectedFacility', 'overrideReason', 'reassessFlag', 'transferStatus', 'quickNotes', 'saveQuickUpdate',
      'simulatePacket', 'postTox', 'contactNext', 'contactLast', 'logCallAttempt', 'markPacketSent', 'scanConsent',
      'searchTimeFilter', 'searchStatusFilter', 'searchFacilityFilter', 'searchChannelFilter', 'searchList',
      'searchHistory', 'statusFilter', 'assignedFilter', 'patientListBody', 'taskList', 'handoffSummary',
      'sendHandoff', 'results', 'filterAsam', 'filterMat', 'filter302', 'filterPayer', 'filterDistance',
      'filterAcuteBh', 'filterAcuteMed', 'hideStale', 'showBlocks', 'facilitySearch', 'clearSearch',
      'activityLog', 'activityForm', 'activityAction', 'activityOutcome', 'activityNotes', 'clearActivity',
      'timelineList', 'advanceTimeline', 'resetTimeline', 'auditList', 'toast', 'breakGlass', 'finalizeTransfer',
      'storyboard', 'dismissBanner', 'addSearchBtn', 'addMultipleSearchBtn', 'searchPopover', 'closeSearchPopover',
      'searchFacilities', 'searchFacilityChips', 'searchAddOther', 'searchVerify', 'searchPublish', 'searchCancel',
      'searchNotes', 'searchResults', 'searchTakes302', 'searchAcuteMed', 'searchAcuteBh', 'searchSecureBh',
      'searchDualDx', 'searchBhMed', 'searchInNetwork', 'searchChannelFax', 'searchChannelDirect', 'searchChannelEmr',
      'packetModal', 'packetPreview', 'closePacket', 'packetFinalize', 'packetPrint', 'openSettings', 'settingsModal',
      'closeSettings', 'settingsSummary', 'openDowntime', 'openDirectory', 'exportAudit'
    ];

    ids.forEach((id) => {
      dom[id] = document.getElementById(id);
    });
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
    if (dom.matNeeds) {
      dom.matNeeds.innerHTML = matOptions
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
    switch (status) {
      case 'Accepted':
        return 'accepted';
      case 'Denied':
        return 'denied';
      case 'NoBeds':
        return 'nobeds';
      case 'Canceled':
        return 'canceled';
      case 'PendingReview':
      case 'AwaitingCallback':
      case 'PacketSent':
        return 'pending';
      default:
        return 'searching';
    }
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
    dom.asamField.value = asamMatch ? asamMatch.label : note.asam;
    dom.assessmentTs.value = formatTimestamp(note.assessmentTs);
    dom.matNeeds.value = note.matNeeds;
    dom.threeOhTwo.value = note.commitment || '';
    dom.acuity.value = note.acuity;
    dom.placementNeeded.value = note.placementNeeded;

    let override = state.session.overrideReasons[patient.id];
    if (override === undefined || override === null) {
      override = note.overrideReason;
    }
    dom.overrideReason.value = override || '';

    let reassessSetting = state.session.reassessOverride[patient.id];
    if (reassessSetting === undefined || reassessSetting === null) {
      reassessSetting = note.reassessFlag;
    }
    dom.reassessFlag.value = reassessSetting;
    dom.transferStatus.value = note.transferStatus;

    let selectedFacility = state.session.selectedFacility[patient.id];
    if (selectedFacility === undefined || selectedFacility === null) {
      selectedFacility = note.selectedFacility;
    }
    dom.selectedFacility.value = selectedFacility;

    let quickNote = state.session.quickNotes[patient.id];
    if (quickNote === undefined || quickNote === null) {
      quickNote = note.quickNotes;
    }
    dom.quickNotes.value = quickNote;
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
        const config = statusConfig[search.status] || statusConfig.Searching;
        const channels = search.channels.map((ch) => channelLabels[ch] || ch).join(', ');
        return `
          <div class="search-row ${config.rowClass}" data-search-id="${search.id}">
            <div class="search-header">
              <div class="search-facility">${search.facilityName}</div>
              <span class="${config.chipClass}">${config.icon} ${config.label}</span>
            </div>
            <div class="search-meta">
              <span>Updated: ${search.updated}</span>
              <span>Channels: ${channels}</span>
              <span>Assigned: ${staffDirectory[search.assignedTo] || 'CRC Team'}</span>
            </div>
            <div class="search-notes">
              <span>${search.summary}</span>
            </div>
            <div class="search-actions">
              <button class="ghost-btn" data-prototype="view-search" data-search-id="${search.id}">View details</button>
              <button class="ghost-btn" data-prototype="record" data-search-id="${search.id}">Record acceptance</button>
            </div>
          </div>
        `;
      })
      .join('');

    dom.searchList.querySelectorAll('[data-prototype]').forEach((btn) => {
      btn.addEventListener('click', () => showToast('Prototype action: this workflow is storyboard only.'));
    });
  }

  function renderSearchHistory(patient) {
    if (!dom.searchHistory) return;
    dom.searchHistory.innerHTML = patient.searchHistory
      .map((entry) => {
        const config = statusConfig[entry.status] || statusConfig.Searching;
        return `
          <div class="history-entry">
            <span class="history-time">${entry.ts}</span>
            <span class="history-status ${config.chipClass}">${config.icon} ${config.label}</span>
            <div class="history-detail">
              <strong>${entry.facility}</strong>
              <p>${entry.detail}</p>
            </div>
          </div>
        `;
      })
      .join('');
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

  function renderPatientList() {
    if (!dom.patientListBody) return;
    const rows = patientScenarios.map((patient) => ({
      ...patient.board,
      name: patient.identifiers.name,
      id: patient.id
    }));

    const filtered = applyPatientListFilters(rows);

    if (!filtered.length) {
      dom.patientListBody.innerHTML = `<tr><td colspan="8" class="hint">No patients match the current filters.</td></tr>`;
      return;
    }

    dom.patientListBody.innerHTML = filtered
      .map((row) => {
        const config = statusConfig[row.statusLabel === 'Accepted' ? 'Accepted' : row.statusLabel === 'Pending review' ? 'PendingReview' : 'Searching'];
        const statusBadge = config ? `${config.icon} ${config.label}` : row.statusLabel;
        return `
          <tr data-patient-id="${row.id}">
            <td>${row.name}</td>
            <td>${row.placement}</td>
            <td>${row.mat}</td>
            <td><span class="status-badge badge-${row.statusKey || 'waiting'}">${statusBadge}</span></td>
            <td>${row.transport}</td>
            <td>${staffDirectory[row.assignedId] || 'Unassigned'}</td>
            <td>${row.lastUpdate}</td>
            <td>${row.reassess}</td>
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

  function renderFacilityResults(patient) {
    if (!dom.results) return;
    const defaultAsam = patient.note.asam;
    const defaultMat = patient.note.matNeeds;

    const matchingFacilities = facilityDirectory.filter((facility) => {
      const matchesAsam = facility.asam.includes(defaultAsam);
      const matchesMat = defaultMat === 'None' || facility.mat.includes(defaultMat) || facility.mat.includes('None');
      return matchesAsam && matchesMat;
    });

    dom.results.innerHTML = matchingFacilities
      .map((facility) => `
        <article class="facility-card" data-facility-id="${facility.id}">
          <header>
            <h4>${facility.name}</h4>
            <span class="badge badge-muted">${facility.status}</span>
          </header>
          <p class="facility-distance">${facility.distance} mi · ${facility.lastUpdated}</p>
          <p>${facility.notes}</p>
          <div class="facility-tags">
            ${facility.badges.map((badge) => `<span class="tag">${badge}</span>`).join('')}
          </div>
          <footer>
            <button class="ghost-btn" data-prototype="compare">Compare</button>
            <button class="primary-btn" data-prototype="select">Select facility</button>
          </footer>
        </article>
      `)
      .join('');

    dom.results.querySelectorAll('[data-prototype]').forEach((btn) => {
      btn.addEventListener('click', () => showToast('Directory actions are storyboarded in this mock.'));
    });
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

    dom.settingsSummary.innerHTML = `
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
  }

  function openSettingsModal() {
    if (!dom.settingsModal) return;
    renderSettingsContent();
    dom.settingsModal.classList.remove('hidden');
  }

  function closeSettingsModal() {
    if (!dom.settingsModal) return;
    dom.settingsModal.classList.add('hidden');
  }

  function updateFinalizeButton(patient) {
    if (!dom.finalizeTransfer) return;
    const hasAcceptance = patient.note.transferStatus === 'accepted' || patient.searches.some((s) => s.status === 'Accepted');
    const blocked = (state.session.reassessOverride[patient.id] || patient.note.reassessFlag) === 'Y';
    dom.finalizeTransfer.disabled = !(hasAcceptance && !blocked);
  }

  function renderAll() {
    const patient = getCurrentPatient();
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
    state.session.quickNotes[patient.id] = dom.quickNotes.value;
    state.session.overrideReasons[patient.id] = dom.overrideReason.value;
    state.session.selectedFacility[patient.id] = dom.selectedFacility.value || patient.note.selectedFacility;
    showToast('Prototype save: Quick update captured for this scenario.');
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
        patientChipContainer = patientCard.querySelector('.filter-chips');
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
    if (dom.settingsModal) {
      dom.settingsModal.addEventListener('click', (event) => {
        if (event.target === dom.settingsModal) {
          closeSettingsModal();
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
      dom.searchPublish.addEventListener('click', () => showToast('Prototype publish: Placement searches stay static in this mock.'));
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
  }

  function filterFacilityResults() {
    if (!dom.facilitySearch || !dom.results) return;
    const term = dom.facilitySearch.value.trim().toLowerCase();
    const patient = getCurrentPatient();
    const filtered = facilityDirectory.filter((facility) => facility.name.toLowerCase().includes(term));
    if (dom.clearSearch) {
      dom.clearSearch.disabled = !term;
    }
    const list = term ? filtered : facilityDirectory;
    dom.results.innerHTML = list
      .map((facility) => `
        <article class="facility-card" data-facility-id="${facility.id}">
          <header>
            <h4>${facility.name}</h4>
            <span class="badge badge-muted">${facility.status}</span>
          </header>
          <p class="facility-distance">${facility.distance} mi · ${facility.lastUpdated}</p>
          <p>${facility.notes}</p>
          <div class="facility-tags">
            ${facility.badges.map((badge) => `<span class="tag">${badge}</span>`).join('')}
          </div>
          <footer>
            <button class="ghost-btn" data-prototype="compare">Compare</button>
            <button class="primary-btn" data-prototype="select">Select facility</button>
          </footer>
        </article>
      `)
      .join('');

    const resultButtons = dom.results.querySelectorAll('[data-prototype]');
    resultButtons.forEach((btn) => {
      btn.addEventListener('click', () => showToast('Directory actions are storyboarded in this mock.'));
    });

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
      dom.searchResults.innerHTML = facilityDirectory
        .slice(0, 3)
        .map((facility) => `
          <div class="search-result-card">
            <strong>${facility.name}</strong>
            <p>${facility.notes}</p>
            <small>${facility.distance} mi · ${facility.lastUpdated}</small>
          </div>
        `)
        .join('');
    }
  }

  function closeSearchPopover() {
    if (dom.searchPopover) {
      dom.searchPopover.classList.add('hidden');
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
      }
    });
  }

  function init() {
    cacheDom();
    populateStaticSelects();
    populatePatientSelector();
    setupFilters();
    setupPrototypeActions();
    setupGlobalStubs();
    setupGlobalShortcuts();
    if (dom.patientSelect) {
      dom.patientSelect.addEventListener('change', handlePatientSwitch);
    }
    renderAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
