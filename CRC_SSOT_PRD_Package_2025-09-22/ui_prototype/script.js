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
    WaitingTransport: { ...canonicalStatusPalette.Waiting, label: 'Waiting — Transport', canonical: 'Waiting' },
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

  const statusOptions = [
    { value: 'Searching', label: 'Searching' },
    { value: 'PendingReview', label: 'Pending review' },
    { value: 'PacketSent', label: 'Packet sent' },
    { value: 'WaitingTransport', label: 'Waiting transport' },
    { value: 'Accepted', label: 'Accepted' },
    { value: 'Denied', label: 'Denied' },
    { value: 'NoBeds', label: 'No beds' },
    { value: 'Canceled', label: 'Canceled' }
  ];

  const quickReasonDefinitions = [
    { value: 'ACCEPT_PHONE', label: 'Bed hold confirmed — phone', status: 'Accepted', requiresClinician: true },
    { value: 'PACKET_SENT', label: 'Packet sent to facility', status: 'PacketSent' },
    { value: 'PENDING_AWAITING_ROUNDS', label: 'Waiting for intake rounds', status: 'PendingReview' },
    { value: 'PA_SUBMITTED', label: 'PA submitted', status: 'PASubmitted', updatesPAStatus: 'SUBMITTED' },
    { value: 'PA_APPROVED', label: 'PA approved', status: 'PAApproved', updatesPAStatus: 'APPROVED' },
    { value: 'PA_DENIED', label: 'PA denied', status: 'PADenied', updatesPAStatus: 'DENIED', requiresReason: true },
    { value: 'DENY_NO_PROGRAM', label: 'Denied — no program', status: 'Denied', requiresReason: true },
    { value: 'NOBEDS_FULL_UNIT', label: 'No beds — recheck scheduled', status: 'NoBeds', requiresRecheck: true },
    { value: 'WAITING_TRANSPORT', label: 'Waiting for transport pickup', status: 'WaitingTransport' }
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
      ],
      insurance: {
        payer: 'CBH',
        plan: 'STANDARD_SUD',
        memberNumber: 'CBH123456789',
        groupNumber: 'GRP001'
      },
      priorAuth: {
        payer: 'CBH',
        plan: 'STANDARD_SUD',
        facility: 'FRIENDS_DETOX',
        levelOfCare: '3.7',
        status: 'NOT_REQUIRED',
        requirement: 'NOT_REQUIRED',
        reason: '302 holds do not require PA for CBH',
        submissionMethod: '',
        refNumber: '',
        submittedBy: '',
        submittedDateTime: '',
        contactLine: '888-555-0100',
        portalUrl: '',
        payerNotes: '302 emergency hold - no PA required per CBH policy',
        expedited: false,
        decision: '',
        authNumber: '',
        coverageSpan: '',
        decisionTime: '',
        agent: '',
        attachments: {
          coreSummary: true,
          asam: true,
          meds: true,
          lastDose: false,
          sudLabs: false,
          docs302: true,
          roi: false
        },
        slaHours: 24,
        hoursLeft: 24,
        lastUpdated: '2025-09-22T08:35:00Z'
      }
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
      ],
      insurance: {
        payer: 'IBHC',
        plan: 'COMMERCIAL',
        memberNumber: 'IBHC987654321',
        groupNumber: 'GRP002'
      },
      priorAuth: {
        payer: 'IBHC',
        plan: 'COMMERCIAL',
        facility: 'HOPE_RIDGE',
        levelOfCare: '3.5',
        status: 'SUBMITTED',
        requirement: 'REQUIRED',
        reason: 'Inpatient ASAM 3.5 requires PA',
        submissionMethod: 'Portal',
        refNumber: 'IBHC-PA-2025-0922-1102',
        submittedBy: 'Morgan Lee',
        submittedDateTime: '2025-09-22T11:02:00',
        contactLine: '888-555-0100',
        portalUrl: 'https://provider.ibhc.com/auth',
        payerNotes: 'Clinical risk requires secure detox; CIWA 11 ↑',
        expedited: false,
        decision: '',
        authNumber: '',
        coverageSpan: '',
        decisionTime: '',
        agent: '',
        attachments: {
          coreSummary: true,
          asam: true,
          meds: true,
          lastDose: true,
          sudLabs: false,
          docs302: false,
          roi: true
        },
        slaHours: 24,
        hoursLeft: 7,
        lastUpdated: '2025-09-22T11:02:00Z'
      }
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
    },
    ui: {
      pendingConflict: null,
      pendingDrawer: null,
      pendingPopover: null
    }
  };

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
      'closeSettings', 'settingsSummary', 'openDowntime', 'openDirectory', 'exportAudit',
      'facilityDrawer', 'drawerTitle', 'drawerSubtitle', 'drawerStatus', 'drawerReason', 'drawerAssigned',
      'drawerSummary', 'drawerClinician', 'drawerClinicianRole', 'drawerClinicianNpi', 'drawerRep', 'drawerRepContact',
      'drawerUnit', 'drawerBedHold', 'drawerReference', 'drawerConditions', 'drawerCancelOthers', 'drawerChannels',
      'drawerDocuments', 'drawerDelivery', 'drawerTransportRequired', 'drawerTransportMode', 'drawerTransportVendor',
      'drawerTransportPickup', 'drawerTransportDestination', 'drawerTransportEta', 'drawerNotes', 'drawerAttachments', 'drawerAudit',
      'drawerSave', 'drawerClose', 'drawerCancel', 'drawerSavePublish', 'drawerSaveChanges', 'drawerAcceptanceSection',
      'editInfoPopover', 'closeEditPopover', 'popoverStatus', 'popoverReason', 'popoverClinician', 'popoverBedHold',
      'popoverSummary', 'openDrawerFromPopover', 'cancelEditPopover', 'saveEditPopover',
      'conflictModal', 'closeConflict', 'conflictMessage', 'conflictForm', 'conflictAttestation', 'cancelConflict', 'confirmConflict',
      'quickHelpModal', 'closeQuickHelp'
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
    switch (status) {
      case 'Accepted':
        return 'accepted';
      case 'Denied':
        return 'denied';
      case 'NoBeds':
        return 'nobeds';
      case 'Canceled':
        return 'canceled';
      case 'WaitingTransport':
        return 'waiting';
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
        const reasonText = search.status_reason_text || search.summary || '';
        const confirmation = search.lastMessage
          ? `<div class="search-inline-confirm">${search.lastMessage}</div>`
          : '';
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
              <span>${reasonText}</span>
            </div>
            ${confirmation}
            <div class="search-actions">
              <button class="ghost-btn" data-action="open-drawer" data-search-id="${search.id}">View details</button>
              <button class="ghost-btn" data-action="open-popover" data-search-id="${search.id}">Edit info</button>
              <button class="ghost-btn" data-action="record" data-search-id="${search.id}">Record acceptance</button>
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

      if (applyStatus && reasonDef && reasonDef.status === 'NoBeds' && search.status === 'Accepted') {
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
      search.status = reasonDef.status;
    }
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
    if (!dom.editInfoPopover) return;
    const patient = getCurrentPatient();
    const search = patient.searches.find((item) => item.id === searchId);
    if (!search) {
      showToast('Unable to open edit popover.');
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
    dom.editInfoPopover.dataset.searchId = search.id;
    dom.editInfoPopover.dataset.patientId = patient.id;
    dom.editInfoPopover.classList.remove('hidden');
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

  function init() {
    cacheDom();
    populateStaticSelects();
    populatePatientSelector();
    setupFilters();
    setupPrototypeActions();
    setupGlobalStubs();
    setupGlobalShortcuts();
    priorAuthModule.init(); // Initialize Prior Authorization module
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
