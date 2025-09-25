// Updated Patient Scenarios - Based on Facility List from update2.md
// 15 new patients mapped to actual facilities with correct Level of Care

export const newPatientScenarios = [
  {
    id: 'pt_501',
    label: 'pt_501 — Nguyen, Dana (Detox 3.7 WM, methadone continue)',
    identifiers: { name: 'Nguyen, Dana', mrn: '2025501', fin: 'FIN2025501' },
    consent: { act148: true, part2: true, expiry: '2025-12-24' },
    note: {
      asam: '3.7WM',
      assessmentTs: '2025-09-24T09:00:00Z',
      matNeeds: 'MethadoneContinue',
      placementNeeded: 'Y',
      commitment: '302Hold',
      acuity: 'Medically Monitored',
      selectedFacility: 'Eagleville — Detox 3.7 WM',
      overrideReason: '',
      reassessFlag: 'N',
      transferStatus: 'waiting_transport',
      quickNotes: 'Methadone continue approved. Transport scheduled 16:30.',
      lastUpdated: '09/24 10:15 by Lee, M'
    },
    contact: {
      next: 'Confirm pickup time with transport at 16:00.',
      last: '10:10 — Eagleville confirmed bed ready'
    },
    assignment: { id: 'mlee', role: 'CRC Tech' },
    handoff: 'Monitor methadone timing for transport window.',
    tasks: [
      { text: 'Coordinate transport pickup window', owner: 'Morgan Lee', tone: 'warn' }
    ],
    timeline: {
      steps: ['Assessment', 'Facility selected', 'Accepted', 'Transport scheduled', 'Transfer pending'],
      activeIndex: 3
    },
    activities: [
      { ts: '09/24 10:10', action: 'Call facility', outcome: 'Confirmed', notes: 'Eagleville confirmed bed ready for 16:30 arrival.' }
    ],
    board: {
      placement: 'Eagleville — Detox 3.7 WM',
      statusKey: 'waiting_transport',
      statusLabel: 'Waiting transport',
      mat: 'Methadone continue',
      transport: 'Ride 16:30',
      needsTransport: true,
      isPlaced: true,
      assignedId: 'mlee',
      lastUpdate: '09/24 10:15',
      reassess: 'No'
    },
    searches: [
      {
        id: 'pt_501-01',
        facilityId: 'EAGLEVILLE',
        facilityName: 'Eagleville',
        status: 'Accepted',
        updated: '09/24 10:15',
        created: '09/24 09:00',
        channels: ['phone'],
        summary: 'Bed confirmed, transport scheduled.',
        assignedTo: 'mlee',
        timeBucket: 'today'
      }
    ],
    searchHistory: [
      { ts: '09/24 10:15', status: 'WaitingTransport', facility: 'Eagleville', detail: 'Transport scheduled for 16:30.' }
    ],
    audit: [
      { ts: '09/24 10:15', user: 'Morgan Lee', detail: 'Transport arranged with MedTrans.' }
    ]
  },
  {
    id: 'pt_502',
    label: 'pt_502 — Santos, Miguel (Rehab 3.5, suboxone induction)',
    identifiers: { name: 'Santos, Miguel', mrn: '2025502', fin: 'FIN2025502' },
    consent: { act148: true, part2: false, expiry: null },
    note: {
      asam: '3.5',
      assessmentTs: '2025-09-24T08:30:00Z',
      matNeeds: 'SuboxoneInduction',
      placementNeeded: 'Y',
      commitment: 'Voluntary',
      acuity: 'High-Intensity Residential',
      selectedFacility: 'Kirkbride — Rehab 3.5',
      overrideReason: '',
      reassessFlag: 'Y',
      transferStatus: 'no_beds',
      quickNotes: 'No beds currently. Recheck scheduled 14:00.',
      lastUpdated: '09/24 09:40 by Chen, CRS'
    },
    contact: {
      next: 'Recheck bed availability at 14:00.',
      last: '09:35 — Kirkbride reports full census'
    },
    assignment: { id: 'cchen', role: 'CRS' },
    handoff: 'Monitor for bed availability. Patient ready for induction.',
    tasks: [
      { text: 'Recheck Kirkbride bed status at 14:00', owner: 'CRS Chen', tone: 'warn' }
    ],
    timeline: {
      steps: ['Assessment', 'Facility contacted', 'No beds', 'Recheck scheduled'],
      activeIndex: 2
    },
    activities: [
      { ts: '09/24 09:35', action: 'Call facility', outcome: 'No beds', notes: 'Kirkbride full, recheck at 14:00.' }
    ],
    board: {
      placement: 'Kirkbride — Rehab 3.5',
      statusKey: 'no_beds',
      statusLabel: 'No beds',
      mat: 'Suboxone induction',
      transport: 'Recheck 14:00',
      needsTransport: false,
      isPlaced: false,
      assignedId: 'cchen',
      lastUpdate: '09/24 09:40',
      reassess: 'Yes'
    },
    searches: [
      {
        id: 'pt_502-01',
        facilityId: 'KIRKBRIDE',
        facilityName: 'Kirkbride (Kirkbride Center)',
        status: 'NoBeds',
        updated: '09/24 09:40',
        created: '09/24 08:30',
        channels: ['phone'],
        summary: 'Full census, recheck at 14:00.',
        assignedTo: 'cchen',
        timeBucket: 'today'
      }
    ],
    searchHistory: [
      { ts: '09/24 09:40', status: 'NoBeds', facility: 'Kirkbride', detail: 'Full census, recheck scheduled 14:00.' }
    ],
    audit: [
      { ts: '09/24 09:40', user: 'CRS Chen', detail: 'Set recheck reminder for 14:00.' }
    ]
  },
  {
    id: 'pt_503',
    label: 'pt_503 — Shah, Priya (Detox 3.7 WM, no MAT)',
    identifiers: { name: 'Shah, Priya', mrn: '2025503', fin: 'FIN2025503' },
    consent: { act148: true, part2: true, expiry: '2025-11-24' },
    note: {
      asam: '3.7WM',
      assessmentTs: '2025-09-24T07:45:00Z',
      matNeeds: 'None',
      placementNeeded: 'Y',
      commitment: 'Voluntary',
      acuity: 'Medically Monitored',
      selectedFacility: 'Fairmount — Detox 3.7 WM',
      overrideReason: '',
      reassessFlag: 'N',
      transferStatus: 'accepted',
      quickNotes: 'Accepted. Needs pickup window confirmation.',
      lastUpdated: '09/24 08:55 by Dial, K'
    },
    contact: {
      next: 'Coordinate transport pickup window.',
      last: '08:50 — Fairmount accepted placement'
    },
    assignment: { id: 'kdial', role: 'CRC Tech' },
    handoff: 'Patient ready for transport. No MAT complications.',
    tasks: [
      { text: 'Schedule transport pickup window', owner: 'Kevin Dial', tone: 'info' }
    ],
    timeline: {
      steps: ['Assessment', 'Facility contacted', 'Accepted', 'Transport pending'],
      activeIndex: 3
    },
    activities: [
      { ts: '09/24 08:50', action: 'Call facility', outcome: 'Accepted', notes: 'Fairmount confirmed bed available.' }
    ],
    board: {
      placement: 'Fairmount — Detox 3.7 WM',
      statusKey: 'accepted',
      statusLabel: 'Accepted',
      mat: 'None',
      transport: 'Needs pickup window',
      needsTransport: true,
      isPlaced: true,
      assignedId: 'kdial',
      lastUpdate: '09/24 08:55',
      reassess: 'No'
    },
    searches: [
      {
        id: 'pt_503-01',
        facilityId: 'FAIRMOUNT',
        facilityName: 'Fairmount',
        status: 'Accepted',
        updated: '09/24 08:55',
        created: '09/24 07:45',
        channels: ['phone'],
        summary: 'Bed confirmed, transport needed.',
        assignedTo: 'kdial',
        timeBucket: 'today'
      }
    ],
    searchHistory: [
      { ts: '09/24 08:55', status: 'Accepted', facility: 'Fairmount', detail: 'Bed confirmed, arranging transport.' }
    ],
    audit: [
      { ts: '09/24 08:55', user: 'Kevin Dial', detail: 'Accepted placement, coordinating transport.' }
    ]
  },
  {
    id: 'pt_504',
    label: 'pt_504 — Brooks, Anthony (IP Psych, methadone induction)',
    identifiers: { name: 'Brooks, Anthony', mrn: '2025504', fin: 'FIN2025504' },
    consent: { act148: false, part2: false, expiry: null },
    note: {
      asam: 'IP Psych',
      assessmentTs: '2025-09-24T10:00:00Z',
      matNeeds: 'MethadoneInduction',
      placementNeeded: 'Y',
      commitment: '302Hold',
      acuity: 'Acute Psychiatric',
      selectedFacility: 'Belmont — IP Psych',
      overrideReason: '',
      reassessFlag: 'Y',
      transferStatus: 'pending_review',
      quickNotes: 'Pending psych review for methadone protocol.',
      lastUpdated: '09/24 11:05 by Lee, M'
    },
    contact: {
      next: 'Await psychiatrist review for MAT clearance.',
      last: '11:00 — Belmont reviewing methadone protocol'
    },
    assignment: { id: 'mlee', role: 'CRC Tech' },
    handoff: 'Complex case - psych + MAT coordination needed.',
    tasks: [
      { text: 'Follow up on psychiatric clearance', owner: 'Morgan Lee', tone: 'warn' }
    ],
    timeline: {
      steps: ['Assessment', 'Facility contacted', 'Pending review'],
      activeIndex: 2
    },
    activities: [
      { ts: '09/24 11:00', action: 'Call facility', outcome: 'Pending review', notes: 'Belmont reviewing methadone induction protocol.' }
    ],
    board: {
      placement: 'Belmont — IP Psych',
      statusKey: 'pending_review',
      statusLabel: 'Pending review',
      mat: 'Methadone induction',
      transport: 'N/A',
      needsTransport: false,
      isPlaced: false,
      assignedId: 'mlee',
      lastUpdate: '09/24 11:05',
      reassess: 'Yes'
    },
    searches: [
      {
        id: 'pt_504-01',
        facilityId: 'BELMONT',
        facilityName: 'Belmont',
        status: 'PendingReview',
        updated: '09/24 11:05',
        created: '09/24 10:00',
        channels: ['phone'],
        summary: 'Pending psychiatric review.',
        assignedTo: 'mlee',
        timeBucket: 'today'
      }
    ],
    searchHistory: [
      { ts: '09/24 11:05', status: 'PendingReview', facility: 'Belmont', detail: 'Psychiatrist reviewing methadone protocol.' }
    ],
    audit: [
      { ts: '09/24 11:05', user: 'Morgan Lee', detail: 'Escalated for psychiatric review.' }
    ]
  },
  {
    id: 'pt_505',
    label: 'pt_505 — Martinez, Sofia (Rehab 3.5, suboxone continue)',
    identifiers: { name: 'Martinez, Sofia', mrn: '2025505', fin: 'FIN2025505' },
    consent: { act148: true, part2: true, expiry: '2025-10-24' },
    note: {
      asam: '3.5',
      assessmentTs: '2025-09-24T06:30:00Z',
      matNeeds: 'SuboxoneContinue',
      placementNeeded: 'Y',
      commitment: 'Voluntary',
      acuity: 'High-Intensity Residential',
      selectedFacility: 'Girard — Rehab 3.5',
      overrideReason: '',
      reassessFlag: 'N',
      transferStatus: 'packet_sent',
      quickNotes: 'Packet sent, awaiting facility response.',
      lastUpdated: '09/24 07:45 by Chen, CRS'
    },
    contact: {
      next: 'Follow up on packet status.',
      last: '07:40 — Packet faxed to Girard intake'
    },
    assignment: { id: 'cchen', role: 'CRS' },
    handoff: 'Routine placement, awaiting response.',
    tasks: [
      { text: 'Follow up on faxed packet', owner: 'CRS Chen', tone: 'info' }
    ],
    timeline: {
      steps: ['Assessment', 'Facility contacted', 'Packet sent', 'Awaiting response'],
      activeIndex: 3
    },
    activities: [
      { ts: '09/24 07:40', action: 'Send packet', outcome: 'Fax sent', notes: 'Complete packet faxed to Girard intake.' }
    ],
    board: {
      placement: 'Girard — Rehab 3.5',
      statusKey: 'packet_sent',
      statusLabel: 'Packet sent',
      mat: 'Suboxone continue',
      transport: 'Awaiting response',
      needsTransport: false,
      isPlaced: false,
      assignedId: 'cchen',
      lastUpdate: '09/24 07:45',
      reassess: 'No'
    },
    searches: [
      {
        id: 'pt_505-01',
        facilityId: 'GIRARD',
        facilityName: 'Girard',
        status: 'PacketSent',
        updated: '09/24 07:45',
        created: '09/24 06:30',
        channels: ['fax'],
        summary: 'Packet sent, awaiting response.',
        assignedTo: 'cchen',
        timeBucket: 'today'
      }
    ],
    searchHistory: [
      { ts: '09/24 07:45', status: 'PacketSent', facility: 'Girard', detail: 'Complete packet faxed to intake.' }
    ],
    audit: [
      { ts: '09/24 07:45', user: 'CRS Chen', detail: 'Packet sent via fax.' }
    ]
  },
  {
    id: 'pt_506',
    label: 'pt_506 — Kim, Trevor (Detox 3.7 WM, no MAT)',
    identifiers: { name: 'Kim, Trevor', mrn: '2025506', fin: 'FIN2025506' },
    consent: { act148: true, part2: false, expiry: null },
    note: {
      asam: '3.7WM',
      assessmentTs: '2025-09-23T16:00:00Z',
      matNeeds: 'None',
      placementNeeded: 'N',
      commitment: 'Voluntary',
      acuity: 'Medically Monitored',
      selectedFacility: '',
      overrideReason: 'Clinical mismatch - patient history',
      reassessFlag: 'N',
      transferStatus: 'denied',
      quickNotes: 'Denied by Keystone - clinical mismatch.',
      lastUpdated: '09/23 18:20 by Dial, K'
    },
    contact: {
      next: 'Assess alternative facilities.',
      last: '18:15 — Keystone denied placement'
    },
    assignment: { id: 'kdial', role: 'CRC Tech' },
    handoff: 'Need alternative facility options.',
    tasks: [
      { text: 'Research alternative detox facilities', owner: 'Kevin Dial', tone: 'warn' }
    ],
    timeline: {
      steps: ['Assessment', 'Facility contacted', 'Denied'],
      activeIndex: 2
    },
    activities: [
      { ts: '09/23 18:15', action: 'Call facility', outcome: 'Denied', notes: 'Keystone denied - clinical mismatch.' }
    ],
    board: {
      placement: 'Keystone Center — Detox 3.7 WM',
      statusKey: 'denied',
      statusLabel: '✕ Denied',
      mat: 'None',
      transport: 'Clinical mismatch',
      needsTransport: false,
      isPlaced: false,
      assignedId: 'kdial',
      lastUpdate: '09/23 18:20',
      reassess: 'No'
    },
    searches: [
      {
        id: 'pt_506-01',
        facilityId: 'KEYSTONE',
        facilityName: 'Keystone Center',
        status: 'Denied',
        updated: '09/23 18:20',
        created: '09/23 16:00',
        channels: ['phone'],
        summary: 'Denied - clinical mismatch.',
        assignedTo: 'kdial',
        timeBucket: 'yesterday'
      }
    ],
    searchHistory: [
      { ts: '09/23 18:20', status: 'Denied', facility: 'Keystone Center', detail: 'Clinical mismatch - patient history.' }
    ],
    audit: [
      { ts: '09/23 18:20', user: 'Kevin Dial', detail: 'Keystone denied placement.' }
    ]
  },
  {
    id: 'pt_507',
    label: 'pt_507 — Johnson, Lila (Rehab 3.5, methadone continue)',
    identifiers: { name: 'Johnson, Lila', mrn: '2025507', fin: 'FIN2025507' },
    consent: { act148: true, part2: true, expiry: '2025-12-24' },
    note: {
      asam: '3.5',
      assessmentTs: '2025-09-24T11:00:00Z',
      matNeeds: 'MethadoneContinue',
      placementNeeded: 'N',
      commitment: 'Voluntary',
      acuity: 'High-Intensity Residential',
      selectedFacility: '',
      overrideReason: 'Patient unable to return call',
      reassessFlag: 'N',
      transferStatus: 'canceled',
      quickNotes: 'Patient unreachable, placement canceled.',
      lastUpdated: '09/24 12:10 by Lee, M'
    },
    contact: {
      next: 'Patient to call back when ready.',
      last: '12:05 — Patient unreachable'
    },
    assignment: { id: 'mlee', role: 'CRC Tech' },
    handoff: 'Await patient contact.',
    tasks: [],
    timeline: {
      steps: ['Assessment', 'Patient contact attempted', 'Canceled'],
      activeIndex: 2
    },
    activities: [
      { ts: '09/24 12:05', action: 'Call patient', outcome: 'No answer', notes: 'Multiple attempts, no callback.' }
    ],
    board: {
      placement: 'Malvern — Rehab 3.5',
      statusKey: 'canceled',
      statusLabel: 'Canceled',
      mat: 'Methadone continue',
      transport: 'Patient unable to return',
      needsTransport: false,
      isPlaced: false,
      assignedId: 'mlee',
      lastUpdate: '09/24 12:10',
      reassess: 'No'
    },
    searches: [],
    searchHistory: [
      { ts: '09/24 12:10', status: 'Canceled', facility: 'Malvern', detail: 'Patient unreachable.' }
    ],
    audit: [
      { ts: '09/24 12:10', user: 'Morgan Lee', detail: 'Placement canceled - patient unreachable.' }
    ]
  },
  {
    id: 'pt_508',
    label: 'pt_508 — Haddad, Omar (Detox 4.0 WM, suboxone induction)',
    identifiers: { name: 'Haddad, Omar', mrn: '2025508', fin: 'FIN2025508' },
    consent: { act148: true, part2: true, expiry: '2025-10-24' },
    note: {
      asam: '4.0WM',
      assessmentTs: '2025-09-24T08:00:00Z',
      matNeeds: 'SuboxoneInduction',
      placementNeeded: 'Y',
      commitment: '302Hold',
      acuity: 'Medically Managed',
      selectedFacility: '',
      overrideReason: '',
      reassessFlag: 'N',
      transferStatus: 'searching',
      quickNotes: 'Multiple facilities contacted, calls in progress.',
      lastUpdated: '09/24 09:05 by Chen, CRS'
    },
    contact: {
      next: 'Continue facility outreach.',
      last: '09:00 — Valley Forge call pending'
    },
    assignment: { id: 'cchen', role: 'CRS' },
    handoff: 'Active search ongoing.',
    tasks: [
      { text: 'Follow up Valley Forge callback', owner: 'CRS Chen', tone: 'info' }
    ],
    timeline: {
      steps: ['Assessment', 'Multiple facilities contacted', 'Searching'],
      activeIndex: 2
    },
    activities: [
      { ts: '09/24 09:00', action: 'Call facility', outcome: 'Callback pending', notes: 'Valley Forge reviewing case.' }
    ],
    board: {
      placement: 'Valley Forge — Detox 4.0 WM',
      statusKey: 'searching',
      statusLabel: 'Searching',
      mat: 'Suboxone induction',
      transport: 'Calls in progress',
      needsTransport: false,
      isPlaced: false,
      assignedId: 'cchen',
      lastUpdate: '09/24 09:05',
      reassess: 'No'
    },
    searches: [
      {
        id: 'pt_508-01',
        facilityId: 'VALLEY_FORGE',
        facilityName: 'Valley Forge',
        status: 'Searching',
        updated: '09/24 09:05',
        created: '09/24 08:00',
        channels: ['phone'],
        summary: 'Callback pending.',
        assignedTo: 'cchen',
        timeBucket: 'today'
      }
    ],
    searchHistory: [
      { ts: '09/24 09:05', status: 'Searching', facility: 'Valley Forge', detail: 'Multiple facilities contacted.' }
    ],
    audit: [
      { ts: '09/24 09:05', user: 'CRS Chen', detail: 'Active search in progress.' }
    ]
  },
  {
    id: 'pt_509',
    label: 'pt_509 — Lin, Mei (Detox 4.0 WM, no MAT)',
    identifiers: { name: 'Lin, Mei', mrn: '2025509', fin: 'FIN2025509' },
    consent: { act148: false, part2: false, expiry: null },
    note: {
      asam: '4.0WM',
      assessmentTs: '2025-09-23T20:00:00Z',
      matNeeds: 'None',
      placementNeeded: 'Y',
      commitment: '302Hold',
      acuity: 'Medically Managed',
      selectedFacility: '',
      overrideReason: 'Hold expired before placement',
      reassessFlag: 'Y',
      transferStatus: 'expired',
      quickNotes: 'Hold expired at 22:30. Needs reassessment.',
      lastUpdated: '09/23 22:30 by Dial, K'
    },
    contact: {
      next: 'Reassess if patient presents again.',
      last: '22:25 — Hold expired'
    },
    assignment: { id: 'kdial', role: 'CRC Tech' },
    handoff: 'Hold expired. Reassess if patient returns.',
    tasks: [
      { text: 'Reassess if patient presents', owner: 'Kevin Dial', tone: 'warn' }
    ],
    timeline: {
      steps: ['Assessment', 'Hold period', 'Expired'],
      activeIndex: 2
    },
    activities: [
      { ts: '09/23 22:25', action: 'System alert', outcome: 'Hold expired', notes: 'Automatic expiry at 22:30.' }
    ],
    board: {
      placement: 'Kensington Hospital — Detox 4.0 WM',
      statusKey: 'expired',
      statusLabel: 'Expired',
      mat: 'None',
      transport: 'Hold expired',
      needsTransport: false,
      isPlaced: false,
      assignedId: 'kdial',
      lastUpdate: '09/23 22:30',
      reassess: 'Yes'
    },
    searches: [],
    searchHistory: [
      { ts: '09/23 22:30', status: 'Expired', facility: 'Kensington Hospital', detail: 'Hold period expired.' }
    ],
    audit: [
      { ts: '09/23 22:30', user: 'System', detail: 'Hold expired automatically.' }
    ]
  },
  {
    id: 'pt_510',
    label: 'pt_510 — Patel, Jason (Detox 3.7 WM, methadone induction)',
    identifiers: { name: 'Patel, Jason', mrn: '2025510', fin: 'FIN2025510' },
    consent: { act148: true, part2: true, expiry: '2025-11-24' },
    note: {
      asam: '3.7WM',
      assessmentTs: '2025-09-24T12:00:00Z',
      matNeeds: 'MethadoneInduction',
      placementNeeded: 'Y',
      commitment: 'Voluntary',
      acuity: 'Medically Monitored',
      selectedFacility: '',
      overrideReason: 'New toxicology results require reassessment',
      reassessFlag: 'Y',
      transferStatus: 'reassess_required',
      quickNotes: 'New tox posted - reassessment required.',
      lastUpdated: '09/24 13:45 by Lee, M'
    },
    contact: {
      next: 'Complete reassessment with new tox.',
      last: '13:40 — New toxicology posted'
    },
    assignment: { id: 'mlee', role: 'CRC Tech' },
    handoff: 'New tox requires clinical review.',
    tasks: [
      { text: 'Review new toxicology with clinician', owner: 'Morgan Lee', tone: 'warn' }
    ],
    timeline: {
      steps: ['Assessment', 'New tox posted', 'Reassessment required'],
      activeIndex: 2
    },
    activities: [
      { ts: '09/24 13:40', action: 'Lab alert', outcome: 'New tox', notes: 'Additional substances detected.' }
    ],
    board: {
      placement: 'HUP Cedar — Detox 3.7 WM',
      statusKey: 'reassess_required',
      statusLabel: 'Reassess required',
      mat: 'Methadone induction',
      transport: 'New tox posted',
      needsTransport: false,
      isPlaced: false,
      assignedId: 'mlee',
      lastUpdate: '09/24 13:45',
      reassess: 'Yes'
    },
    searches: [],
    searchHistory: [
      { ts: '09/24 13:45', status: 'ReassessRequired', facility: 'HUP Cedar', detail: 'New toxicology requires review.' }
    ],
    audit: [
      { ts: '09/24 13:45', user: 'Morgan Lee', detail: 'Reassessment flagged for new tox.' }
    ]
  },
  {
    id: 'pt_511',
    label: 'pt_511 — Wallace, Renee (Rehab 4.0, methadone continue)',
    identifiers: { name: 'Wallace, Renee', mrn: '2025511', fin: 'FIN2025511' },
    consent: { act148: true, part2: true, expiry: '2025-12-24' },
    note: {
      asam: '4.0',
      assessmentTs: '2025-09-24T13:00:00Z',
      matNeeds: 'MethadoneContinue',
      placementNeeded: 'Y',
      commitment: 'Voluntary',
      acuity: 'Clinically Managed High-Intensity',
      selectedFacility: 'Eagleville — Rehab 4.0',
      overrideReason: '',
      reassessFlag: 'Y',
      transferStatus: 'packet_sent',
      quickNotes: 'Packet sent, awaiting insurance verification.',
      lastUpdated: '09/24 14:20 by Dial, K'
    },
    contact: {
      next: 'Follow up on insurance authorization.',
      last: '14:15 — Packet sent, insurance pending'
    },
    assignment: { id: 'kdial', role: 'CRC Tech' },
    handoff: 'Insurance verification in progress.',
    tasks: [
      { text: 'Follow up insurance authorization', owner: 'Kevin Dial', tone: 'warn' }
    ],
    timeline: {
      steps: ['Assessment', 'Facility contacted', 'Packet sent', 'Insurance pending'],
      activeIndex: 3
    },
    activities: [
      { ts: '09/24 14:15', action: 'Send packet', outcome: 'Insurance pending', notes: 'Awaiting Medicaid authorization.' }
    ],
    board: {
      placement: 'Eagleville — Rehab 4.0',
      statusKey: 'packet_sent',
      statusLabel: 'Packet sent',
      mat: 'Methadone continue',
      transport: 'Awaiting insurance',
      needsTransport: false,
      isPlaced: false,
      assignedId: 'kdial',
      lastUpdate: '09/24 14:20',
      reassess: 'Yes'
    },
    searches: [
      {
        id: 'pt_511-01',
        facilityId: 'EAGLEVILLE',
        facilityName: 'Eagleville',
        status: 'PacketSent',
        updated: '09/24 14:20',
        created: '09/24 13:00',
        channels: ['fax'],
        summary: 'Insurance verification pending.',
        assignedTo: 'kdial',
        timeBucket: 'today'
      }
    ],
    searchHistory: [
      { ts: '09/24 14:20', status: 'PacketSent', facility: 'Eagleville', detail: 'Insurance authorization pending.' }
    ],
    audit: [
      { ts: '09/24 14:20', user: 'Kevin Dial', detail: 'Packet sent, insurance pending.' }
    ]
  },
  {
    id: 'pt_512',
    label: 'pt_512 — Greene, Malik (Detox 3.7 WM, suboxone induction)',
    identifiers: { name: 'Greene, Malik', mrn: '2025512', fin: 'FIN2025512' },
    consent: { act148: true, part2: true, expiry: '2025-10-24' },
    note: {
      asam: '3.7WM',
      assessmentTs: '2025-09-24T11:30:00Z',
      matNeeds: 'SuboxoneInduction',
      placementNeeded: 'Y',
      commitment: '302Hold',
      acuity: 'Medically Monitored',
      selectedFacility: 'Mirmount — Detox 3.7 WM',
      overrideReason: '',
      reassessFlag: 'N',
      transferStatus: 'accepted',
      quickNotes: 'Accepted. Transport scheduled 15:30.',
      lastUpdated: '09/24 12:55 by Chen, CRS'
    },
    contact: {
      next: 'Confirm transport arrival.',
      last: '12:50 — Mirmount confirmed bed ready'
    },
    assignment: { id: 'cchen', role: 'CRS' },
    handoff: 'Transport scheduled, ready for transfer.',
    tasks: [
      { text: 'Monitor transport arrival', owner: 'CRS Chen', tone: 'info' }
    ],
    timeline: {
      steps: ['Assessment', 'Facility contacted', 'Accepted', 'Transport scheduled'],
      activeIndex: 3
    },
    activities: [
      { ts: '09/24 12:50', action: 'Call facility', outcome: 'Accepted', notes: 'Mirmount confirmed bed and transport.' }
    ],
    board: {
      placement: 'Mirmount — Detox 3.7 WM',
      statusKey: 'accepted',
      statusLabel: '✓ Accepted',
      mat: 'Suboxone induction',
      transport: 'Transport scheduled',
      needsTransport: true,
      isPlaced: true,
      assignedId: 'cchen',
      lastUpdate: '09/24 12:55',
      reassess: 'No'
    },
    searches: [
      {
        id: 'pt_512-01',
        facilityId: 'MIRMOUNT',
        facilityName: 'Mirmount',
        status: 'Accepted',
        updated: '09/24 12:55',
        created: '09/24 11:30',
        channels: ['phone'],
        summary: 'Accepted, transport at 15:30.',
        assignedTo: 'cchen',
        timeBucket: 'today'
      }
    ],
    searchHistory: [
      { ts: '09/24 12:55', status: 'Accepted', facility: 'Mirmount', detail: 'Transport scheduled 15:30.' }
    ],
    audit: [
      { ts: '09/24 12:55', user: 'CRS Chen', detail: 'Transport arranged.' }
    ]
  },
  {
    id: 'pt_513',
    label: 'pt_513 — O\'Connor, Aiden (IP Psych, no MAT)',
    identifiers: { name: 'O\'Connor, Aiden', mrn: '2025513', fin: 'FIN2025513' },
    consent: { act148: false, part2: false, expiry: null },
    note: {
      asam: 'IP Psych',
      assessmentTs: '2025-09-24T10:30:00Z',
      matNeeds: 'None',
      placementNeeded: 'Y',
      commitment: '302Hold',
      acuity: 'Acute Psychiatric',
      selectedFacility: '',
      overrideReason: '',
      reassessFlag: 'N',
      transferStatus: 'pending_review',
      quickNotes: 'Bed search in progress. Multiple calls out.',
      lastUpdated: '09/24 11:40 by Lee, M'
    },
    contact: {
      next: 'Continue psych facility outreach.',
      last: '11:35 — Horsham reviewing case'
    },
    assignment: { id: 'mlee', role: 'CRC Tech' },
    handoff: 'Active psychiatric bed search.',
    tasks: [
      { text: 'Follow up Horsham review', owner: 'Morgan Lee', tone: 'info' }
    ],
    timeline: {
      steps: ['Assessment', 'Facility contacted', 'Pending review'],
      activeIndex: 2
    },
    activities: [
      { ts: '09/24 11:35', action: 'Call facility', outcome: 'Under review', notes: 'Horsham reviewing psychiatric case.' }
    ],
    board: {
      placement: 'Horsham Clinic — IP Psych',
      statusKey: 'pending_review',
      statusLabel: '⧗ Pending review',
      mat: 'None',
      transport: 'Bed search in progress',
      needsTransport: false,
      isPlaced: false,
      assignedId: 'mlee',
      lastUpdate: '09/24 11:40',
      reassess: 'No'
    },
    searches: [
      {
        id: 'pt_513-01',
        facilityId: 'HORSHAM',
        facilityName: 'Horsham Clinic',
        status: 'PendingReview',
        updated: '09/24 11:40',
        created: '09/24 10:30',
        channels: ['phone'],
        summary: 'Case under review.',
        assignedTo: 'mlee',
        timeBucket: 'today'
      }
    ],
    searchHistory: [
      { ts: '09/24 11:40', status: 'PendingReview', facility: 'Horsham Clinic', detail: 'Psychiatric case under review.' }
    ],
    audit: [
      { ts: '09/24 11:40', user: 'Morgan Lee', detail: 'Psychiatric facility search ongoing.' }
    ]
  },
  {
    id: 'pt_514',
    label: 'pt_514 — Rivera, Sofia (Assessment/Stabilization, no MAT)',
    identifiers: { name: 'Rivera, Sofia', mrn: '2025514', fin: 'FIN2025514' },
    consent: { act148: true, part2: false, expiry: null },
    note: {
      asam: 'Assessment/Stabilization',
      assessmentTs: '2025-09-24T08:45:00Z',
      matNeeds: 'None',
      placementNeeded: 'Y',
      commitment: 'Voluntary',
      acuity: 'Assessment',
      selectedFacility: '',
      overrideReason: '',
      reassessFlag: 'N',
      transferStatus: 'searching',
      quickNotes: 'Intake scheduled 15:00. Confirming bed.',
      lastUpdated: '09/24 09:50 by Chen, CRS'
    },
    contact: {
      next: 'Confirm intake appointment.',
      last: '09:45 — WSAC intake scheduled'
    },
    assignment: { id: 'cchen', role: 'CRS' },
    handoff: 'Intake today at 15:00.',
    tasks: [
      { text: 'Confirm 15:00 intake appointment', owner: 'CRS Chen', tone: 'info' }
    ],
    timeline: {
      steps: ['Assessment', 'Facility contacted', 'Intake scheduled'],
      activeIndex: 2
    },
    activities: [
      { ts: '09/24 09:45', action: 'Schedule intake', outcome: 'Scheduled', notes: 'WSAC intake at 15:00.' }
    ],
    board: {
      placement: 'Gaudenzia (WSAC) — Assessment/Stabilization',
      statusKey: 'searching',
      statusLabel: 'Searching',
      mat: 'None',
      transport: 'Intake 15:00',
      needsTransport: false,
      isPlaced: false,
      assignedId: 'cchen',
      lastUpdate: '09/24 09:50',
      reassess: 'No'
    },
    searches: [
      {
        id: 'pt_514-01',
        facilityId: 'GAUDENZIA_WSAC',
        facilityName: 'Gaudenzia (WSAC)',
        status: 'Searching',
        updated: '09/24 09:50',
        created: '09/24 08:45',
        channels: ['phone'],
        summary: 'Intake scheduled 15:00.',
        assignedTo: 'cchen',
        timeBucket: 'today'
      }
    ],
    searchHistory: [
      { ts: '09/24 09:50', status: 'Searching', facility: 'Gaudenzia (WSAC)', detail: 'Intake scheduled for 15:00.' }
    ],
    audit: [
      { ts: '09/24 09:50', user: 'CRS Chen', detail: 'Intake appointment scheduled.' }
    ]
  },
  {
    id: 'pt_515',
    label: 'pt_515 — Bennett, Alicia (IP Psych, methadone continue)',
    identifiers: { name: 'Bennett, Alicia', mrn: '2025515', fin: 'FIN2025515' },
    consent: { act148: true, part2: true, expiry: '2025-11-24' },
    note: {
      asam: 'IP Psych',
      assessmentTs: '2025-09-24T07:00:00Z',
      matNeeds: 'MethadoneContinue',
      placementNeeded: 'Y',
      commitment: '302Hold',
      acuity: 'Acute Psychiatric',
      selectedFacility: 'Friends Hospital — IP Psych',
      overrideReason: '',
      reassessFlag: 'N',
      transferStatus: 'accepted',
      quickNotes: 'Accepted. Coordinating methadone transport.',
      lastUpdated: '09/24 08:10 by Lee, M'
    },
    contact: {
      next: 'Arrange specialized transport for MAT.',
      last: '08:05 — Friends accepted with MAT'
    },
    assignment: { id: 'mlee', role: 'CRC Tech' },
    handoff: 'Needs MAT-certified transport.',
    tasks: [
      { text: 'Arrange MAT-certified transport', owner: 'Morgan Lee', tone: 'info' }
    ],
    timeline: {
      steps: ['Assessment', 'Facility contacted', 'Accepted', 'Transport coordination'],
      activeIndex: 3
    },
    activities: [
      { ts: '09/24 08:05', action: 'Call facility', outcome: 'Accepted', notes: 'Friends confirmed MAT continuity.' }
    ],
    board: {
      placement: 'Friends Hospital — IP Psych',
      statusKey: 'accepted',
      statusLabel: '✓ Accepted',
      mat: 'Methadone continue',
      transport: 'Needs pickup window',
      needsTransport: true,
      isPlaced: true,
      assignedId: 'mlee',
      lastUpdate: '09/24 08:10',
      reassess: 'No'
    },
    searches: [
      {
        id: 'pt_515-01',
        facilityId: 'FRIENDS_HOSPITAL',
        facilityName: 'Friends Hospital',
        status: 'Accepted',
        updated: '09/24 08:10',
        created: '09/24 07:00',
        channels: ['phone'],
        summary: 'Accepted, MAT transport needed.',
        assignedTo: 'mlee',
        timeBucket: 'today'
      }
    ],
    searchHistory: [
      { ts: '09/24 08:10', status: 'Accepted', facility: 'Friends Hospital', detail: 'MAT-certified transport required.' }
    ],
    audit: [
      { ts: '09/24 08:10', user: 'Morgan Lee', detail: 'Accepted with MAT continuity.' }
    ]
  }
];

export default newPatientScenarios;