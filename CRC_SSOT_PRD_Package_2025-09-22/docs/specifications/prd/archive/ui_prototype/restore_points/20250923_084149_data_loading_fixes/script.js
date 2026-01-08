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
    direct: 'Secure Email',
    emr: 'EMR Clinicals'
  };

  const patients = [
    {
      id: 'S1',
      label: 'S1 — Jordan Rivera (Methadone continue, meds on person)',
      name: 'Rivera, Jordan',
      mrn: '1234567',
      fin: 'FIN1000456',
      payer: 'Jefferson Medicaid',
      handoff: 'CRC placement pool monitoring call-backs; lab confirm pending.',
      consent: { act148: false, part2: false, expiry: null },
      note: {
        asam: '3.7WM',
        assessmentTs: '2025-09-22T08:32:00',
        matNeeds: 'MethadoneContinue',
        placementNeeded: 'Y',
        requires302: true,
        medicalAcuity: 'Secured',
        reassessFlag: 'N',
        transferStatus: 'draft',
        selectedFacilityId: null,
        facilityStatus: null,
        lastUpdated: '09/22 08:58 by Furline, M',
        override: { used: false, reason: '', user: '' }
      },
      medsOnPerson: true,
      tox: { posBenzo: false, bac: null, posFentanyl: false },
      contact: {
        next: 'Call Friends Hospital transfer center at 09:30',
        last: '09:05 — left voicemail with intake RN'
      },
      tasks: [
        { text: 'Confirm secure bed with Friends Hospital transfer center', owner: 'CRC RN', badge: 'info' },
        { text: 'Update transport ETA once facility accepts', owner: 'Transfer Center', badge: 'info' }
      ],
      timeline: ['Arrival & Assessment', 'Quick Update recorded', 'Facility selected', 'Packet sent', 'Transfer finalized'],
      timelineIndex: 1,
      activities: [
        { action: 'Call facility', outcome: 'Voicemail left', notes: 'Initial outreach to Friends Hospital transfer center', timestamp: '09/22 09:05' }
      ],
      audit: [],
      placementPoolTasks: [],
      reassessReasons: [],
      searches: [
        {
          id: 'S1-001',
          facilityId: 'FRIENDS-HOSP',
          facilityName: 'Friends Hospital',
          status: 'Accepted',
          channels: { fax: true, direct: false, emr: false },
          notes: 'Secure unit confirmed, bed ready at 14:00',
          createdBy: 'Morgan Lee (CRC Tech)',
          createdTs: '08:30',
          updatedTs: '08:55',
          history: [
            { ts: '08:30', user: 'Morgan Lee', action: 'packet_sent', message: 'Initial packet sent' },
            { ts: '08:55', user: 'Morgan Lee', action: 'accepted', message: 'Bed confirmed by transfer center' }
          ]
        },
        {
          id: 'S1-002',
          facilityId: 'TEMPLE-PSYCH',
          facilityName: 'Temple Psychiatric',
          status: 'Denied',
          channels: { fax: true, direct: false, emr: false },
          notes: 'Cannot accommodate methadone protocol',
          createdBy: 'Morgan Lee (CRC Tech)',
          createdTs: '08:15',
          updatedTs: '08:25',
          history: [
            { ts: '08:15', user: 'Morgan Lee', action: 'packet_sent', message: 'Packet faxed to intake' },
            { ts: '08:25', user: 'Morgan Lee', action: 'denied', message: 'Denied - methadone not supported' }
          ]
        }
      ]
    },
    {
      id: 'S2',
      label: 'S2 — Alicia Gomez (Methadone continue, no meds on hand)',
      name: 'Gomez, Alicia',
      mrn: '9934412',
      fin: 'FIN1000457',
      payer: 'Jefferson Medicaid',
      handoff: 'Need facility willing to restart methadone; patient arrived without dose card.',
      consent: { act148: true, part2: true, expiry: '2026-01-15' },
      note: {
        asam: '3.5',
        assessmentTs: '2025-09-22T07:55:00',
        matNeeds: 'MethadoneContinue',
        placementNeeded: 'Y',
        requires302: false,
        medicalAcuity: 'Secured',
        reassessFlag: 'N',
        transferStatus: 'draft',
        selectedFacilityId: null,
        facilityStatus: null,
        lastUpdated: '09/22 08:40 by CRS Chen',
        override: { used: false, reason: '', user: '' }
      },
      medsOnPerson: false,
      tox: { posBenzo: false, bac: null, posFentanyl: false },
      contact: {
        next: 'Fax packet to Behavioral Wellness Center once methadone plan confirmed',
        last: '08:35 — chat sent to CRS for MAT verification'
      },
      tasks: [
        { text: 'Confirm Behavioral Wellness Center accepts methadone continuation', owner: 'CRS', badge: 'warn' }
      ],
      timeline: ['Arrival & Assessment', 'Quick Update recorded', 'Facility selection pending', 'Packet sent', 'Transfer finalized'],
      timelineIndex: 0,
      activities: [],
      audit: [],
      placementPoolTasks: [],
      reassessReasons: [],
      searches: [
        {
          id: 'S-0001',
          facilityId: 'HOPERIDGE',
          facilityName: 'Hope Ridge Recovery',
          status: 'PendingReview',
          channels: { fax: true, direct: false, emr: false },
          notes: 'Packet sent 09:20, awaiting rounds at 11:00',
          createdBy: 'Morgan Lee (CRC Tech)',
          createdTs: '09:20',
          updatedTs: '09:21',
          history: [
            { ts: '09:20', user: 'Morgan Lee', action: 'packet_sent', message: 'Fax packet sent to intake' }
          ]
        },
        {
          id: 'S-0002',
          facilityId: 'RIVERVIEW',
          facilityName: 'Riverview Detox Center',
          status: 'NoBeds',
          channels: { fax: true, direct: false, emr: false },
          notes: 'Unit full until evening; recheck after 15:00',
          createdBy: 'Kevin Dial (CRS)',
          createdTs: '09:30',
          updatedTs: '09:31',
          history: [
            { ts: '09:30', user: 'Kevin Dial', action: 'no_beds', message: 'Unit at capacity, asked to call back after 15:00' }
          ]
        },
        {
          id: 'S-0003',
          facilityId: 'CITY-ACUTE',
          facilityName: 'City Acute BH',
          status: 'Denied',
          channels: { fax: true, direct: true, emr: false },
          notes: 'Not secure BH capable tonight',
          createdBy: 'Morgan Lee (CRC Tech)',
          createdTs: '09:40',
          updatedTs: '09:41',
          history: [
            { ts: '09:40', user: 'Morgan Lee', action: 'denied', message: 'Denied by intake supervisor - capacity issues' }
          ]
        }
      ]
    },
    {
      id: 'S3',
      label: 'S3 — Tyler Brooks (302 required, MAT none)',
      name: 'Brooks, Tyler',
      mrn: '7745120',
      fin: 'FIN1000458',
      payer: 'Keystone PPO',
      handoff: 'Legal 302 paperwork scanned; need secure unit accepting involuntary hold.',
      consent: { act148: false, part2: false, expiry: null },
      note: {
        asam: '3.3',
        assessmentTs: '2025-09-22T06:48:00',
        matNeeds: 'None',
        placementNeeded: 'Y',
        requires302: true,
        medicalAcuity: 'StepUp',
        reassessFlag: 'N',
        transferStatus: 'draft',
        selectedFacilityId: null,
        facilityStatus: null,
        lastUpdated: '09/22 07:05 by UM Patel',
        override: { used: false, reason: '', user: '' }
      },
      medsOnPerson: false,
      tox: { posBenzo: false, bac: null, posFentanyl: false },
      contact: {
        next: 'Connect with Bed Mgmt on seclusion availability',
        last: '07:10 — UM initiated pre-cert call'
      },
      tasks: [
        { text: 'Upload 302 documentation to packet', owner: 'UM', badge: 'info' },
        { text: 'Coordinate security transport once bed confirmed', owner: 'Bed Mgmt', badge: 'info' }
      ],
      timeline: ['Arrival & Assessment', 'Quick Update recorded', 'Facility selection blocked', 'Override review', 'Transfer finalized'],
      timelineIndex: 0,
      activities: [],
      audit: [],
      placementPoolTasks: [],
      reassessReasons: [],
      searches: [
        {
          id: 'S3-001',
          facilityId: 'SECURE-UNIT',
          facilityName: 'Philadelphia Secure Unit',
          status: 'PendingReview',
          channels: { fax: true, direct: false, emr: false },
          notes: 'Awaiting 302 review by psychiatrist',
          createdBy: 'Kevin Dial (CRS)',
          createdTs: '07:15',
          updatedTs: '07:20',
          history: [
            { ts: '07:15', user: 'Kevin Dial', action: 'packet_sent', message: '302 paperwork included in packet' }
          ]
        },
        {
          id: 'S3-002',
          facilityId: 'CRISIS-CENTER',
          facilityName: 'Crisis Response Center',
          status: 'Denied',
          channels: { fax: true, direct: false, emr: false },
          notes: 'Cannot accept involuntary holds tonight',
          createdBy: 'Kevin Dial (CRS)',
          createdTs: '06:50',
          updatedTs: '07:05',
          history: [
            { ts: '06:50', user: 'Kevin Dial', action: 'packet_sent', message: 'Initial inquiry sent' },
            { ts: '07:05', user: 'Kevin Dial', action: 'denied', message: 'Denied - no involuntary capacity' }
          ]
        },
        {
          id: 'S3-003',
          facilityId: 'SAFE-HAVEN',
          facilityName: 'Safe Haven Recovery',
          status: 'Denied',
          channels: { fax: true, direct: false, emr: false },
          notes: 'No 302 capability available',
          createdBy: 'Kevin Dial (CRS)',
          createdTs: '07:00',
          updatedTs: '07:10',
          history: [
            { ts: '07:00', user: 'Kevin Dial', action: 'packet_sent', message: 'Packet sent with 302 docs' },
            { ts: '07:10', user: 'Kevin Dial', action: 'denied', message: 'Cannot accommodate 302 requirements' }
          ]
        }
      ]
    },
    {
      id: 'S4',
      label: 'S4 — Mei Chen (UDS positive benzo post assessment)',
      name: 'Chen, Mei',
      mrn: '5519088',
      fin: 'FIN1000459',
      payer: 'Medicare',
      handoff: 'Awaiting reassessment after benzo confirmation; placement on hold.',
      consent: { act148: true, part2: true, expiry: '2025-12-01' },
      note: {
        asam: '3.5',
        assessmentTs: '2025-09-22T05:58:00',
        matNeeds: 'SuboxoneInduction',
        placementNeeded: 'Y',
        requires302: false,
        medicalAcuity: 'Routine',
        reassessFlag: 'N',
        transferStatus: 'draft',
        selectedFacilityId: null,
        facilityStatus: null,
        lastUpdated: '09/22 07:55 by CRS Hall',
        override: { used: false, reason: '', user: '' }
      },
      medsOnPerson: false,
      tox: { posBenzo: false, bac: null, posFentanyl: false },
      contact: {
        next: 'Reassess and resend packet once tox cleared',
        last: '08:05 — InBasket reassignment to CRS Hall'
      },
      tasks: [
        { text: 'Complete reassessment after benzo confirmation', owner: 'CRC RN', badge: 'warn' }
      ],
      timeline: ['Arrival & Assessment', 'Quick Update recorded', 'Facility selection pending', 'Reassessment required', 'Transfer finalized'],
      timelineIndex: 1,
      activities: [],
      audit: [],
      placementPoolTasks: [],
      reassessReasons: [],
      searches: [
        {
          id: 'S4-001',
          facilityId: 'RECOVERY-PLUS',
          facilityName: 'Recovery Plus Treatment',
          status: 'Denied',
          channels: { fax: true, direct: false, emr: false },
          notes: 'Denied due to recent benzo positive',
          createdBy: 'CRS Hall',
          createdTs: '08:10',
          updatedTs: '08:15',
          history: [
            { ts: '08:10', user: 'CRS Hall', action: 'packet_sent', message: 'Initial assessment packet sent' },
            { ts: '08:15', user: 'CRS Hall', action: 'denied', message: 'Denied - recent benzo positive screen' }
          ]
        },
        {
          id: 'S4-002',
          facilityId: 'WELLNESS-CENTER',
          facilityName: 'Behavioral Wellness Center',
          status: 'Denied',
          channels: { fax: true, direct: false, emr: false },
          notes: 'Policy excludes recent benzo positives',
          createdBy: 'CRS Hall',
          createdTs: '07:45',
          updatedTs: '07:50',
          history: [
            { ts: '07:45', user: 'CRS Hall', action: 'packet_sent', message: 'Packet sent for review' },
            { ts: '07:50', user: 'CRS Hall', action: 'denied', message: 'Denied - benzo exclusion policy' }
          ]
        }
      ]
    },
    {
      id: 'S5',
      label: 'S5 — Omar Wallace (No MAT, positive VOC, ROI pending)',
      name: 'Wallace, Omar',
      mrn: '2201987',
      fin: 'FIN1000460',
      payer: 'Commercial',
      handoff: 'Waiting on ROI scan to release HIV details; partial packet ready.',
      consent: { act148: false, part2: false, expiry: null },
      note: {
        asam: '3.1',
        assessmentTs: '2025-09-21T22:45:00',
        matNeeds: 'None',
        placementNeeded: 'Y',
        requires302: false,
        medicalAcuity: 'Routine',
        reassessFlag: 'N',
        transferStatus: 'draft',
        selectedFacilityId: null,
        facilityStatus: null,
        lastUpdated: '09/22 06:50 by CRS Hall',
        override: { used: false, reason: '', user: '' }
      },
      medsOnPerson: false,
      tox: { posBenzo: false, bac: 0.04, posFentanyl: false },
      contact: {
        next: 'Scan ROI and resend packet with HIV section',
        last: '06:55 — ROI awaiting scanning'
      },
      tasks: [
        { text: 'Scan ROI (Act 148) and attach to chart', owner: 'Clerk', badge: 'warn' }
      ],
      timeline: ['Arrival & Assessment', 'Quick Update recorded', 'ROI pending', 'Packet sent', 'Transfer finalized'],
      timelineIndex: 2,
      activities: [],
      audit: [],
      placementPoolTasks: [],
      reassessReasons: [],
      searches: [
        {
          id: 'S5-001',
          facilityId: 'COMMUNITY-CARE',
          facilityName: 'Community Care Center',
          status: 'AwaitingCallback',
          channels: { fax: true, direct: false, emr: false },
          notes: 'Waiting for ROI clearance before acceptance',
          createdBy: 'CRS Hall',
          createdTs: '06:30',
          updatedTs: '06:45',
          history: [
            { ts: '06:30', user: 'CRS Hall', action: 'packet_sent', message: 'Partial packet sent pending ROI' },
            { ts: '06:45', user: 'CRS Hall', action: 'callback_requested', message: 'Requested callback when ROI ready' }
          ]
        },
        {
          id: 'S5-002',
          facilityId: 'RECOVERY-HOUSE',
          facilityName: 'New Hope Recovery House',
          status: 'Denied',
          channels: { fax: true, direct: false, emr: false },
          notes: 'Cannot accept without complete medical history',
          createdBy: 'CRS Hall',
          createdTs: '06:15',
          updatedTs: '06:25',
          history: [
            { ts: '06:15', user: 'CRS Hall', action: 'packet_sent', message: 'Incomplete packet sent for pre-review' },
            { ts: '06:25', user: 'CRS Hall', action: 'denied', message: 'Denied - incomplete documentation' }
          ]
        }
      ]
    }
  ];

  // Preserve a pristine copy of the seeded patient data so we can restore it when persisted snapshots are empty.
  const seedPatients = JSON.parse(JSON.stringify(patients));

  // Patient List Preview Data Model - SDE/Operational Field Mapping
  const patientListData = [
    {
      id: 'S1',
      patient: 'Rivera, Jordan',
      placement: {
        type: 'placed',
        facilityName: 'Friends Hospital',
        facilityId: 12345,
        unit: '3.7WM — Secure',
        bedHold: '09/22 14:00',
        asamLevel: '3.7WM'
      },
      mat: 'Methadone Continue',
      status: 'accepted',
      transport: {
        status: 'scheduled',
        eta: '13:30',
        vendor: 'MedTrans',
        requestedBy: 'Morgan Lee',
        requestedAt: '09/22 08:55'
      },
      assigned: {
        name: 'Morgan Lee',
        role: 'CRC Tech',
        id: 'mlee'
      },
      lastUpdate: '09/22 08:58',
      reassess: false,
      sde: {
        placementStatus: 'Accepted',
        facilitySelectedId: 12345,
        asamRequested: '3.7WM',
        matNeeds: 'MethadoneContinue',
        transportStatus: 'Scheduled',
        transportEta: '13:30',
        transportVendor: 'MedTrans',
        assignedTo: 'mlee',
        lastUpdateTs: '2025-09-22T08:58:00',
        reassessFlag: 'N'
      }
    },
    {
      id: 'S2',
      patient: 'Gomez, Alicia',
      placement: {
        type: 'placed',
        facilityName: 'City Stepdown Center',
        facilityId: 22331,
        unit: '3.1 — Stepdown',
        bedHold: '09/22 18:00',
        asamLevel: '3.1'
      },
      mat: 'Methadone Continue',
      status: 'waiting',
      transport: {
        status: 'waiting',
        requestedBy: 'Kevin Dial',
        requestedAt: '09/22 09:10'
      },
      assigned: {
        name: 'Kevin Dial',
        role: 'CRS',
        id: 'kdial'
      },
      lastUpdate: '09/22 09:12',
      reassess: false,
      sde: {
        placementStatus: 'Accepted',
        facilitySelectedId: 22331,
        asamRequested: '3.1',
        matNeeds: 'MethadoneContinue',
        transportStatus: 'Waiting',
        assignedTo: 'kdial',
        lastUpdateTs: '2025-09-22T09:12:00',
        reassessFlag: 'N'
      }
    },
    {
      id: 'S3',
      patient: 'Brooks, Tyler',
      placement: {
        type: 'searching',
        asamLevel: '3.3',
        locTag: '3.3 — 302 Required',
        specialFlags: ['302 req', 'Involuntary']
      },
      mat: 'No MAT need',
      status: 'searching',
      transport: {
        status: 'not-required'
      },
      assigned: {
        name: 'Kevin Dial',
        role: 'CRS',
        id: 'kdial'
      },
      lastUpdate: '09/22 07:05',
      reassess: false,
      sde: {
        placementStatus: 'Searching',
        facilitySelectedId: null,
        asamRequested: '3.3',
        matNeeds: 'None',
        transportStatus: 'None',
        assignedTo: 'kdial',
        lastUpdateTs: '2025-09-22T07:05:00',
        reassessFlag: 'N'
      }
    },
    {
      id: 'S4',
      patient: 'Chen, Mei',
      placement: {
        type: 'reassess-required',
        asamLevel: '3.5',
        locTag: '3.5 — Reassess Required',
        specialFlags: ['Benzo+', 'Reassess']
      },
      mat: 'Suboxone Induction',
      status: 'denied',
      transport: {
        status: 'not-required'
      },
      assigned: {
        name: 'CRS Hall',
        role: 'CRS',
        id: 'shall'
      },
      lastUpdate: '09/22 08:15',
      reassess: true,
      sde: {
        placementStatus: 'Denied',
        facilitySelectedId: null,
        asamRequested: '3.5',
        matNeeds: 'SuboxoneInduction',
        transportStatus: 'None',
        assignedTo: 'shall',
        lastUpdateTs: '2025-09-22T08:15:00',
        reassessFlag: 'Y'
      }
    },
    {
      id: 'S5',
      patient: 'Wallace, Omar',
      placement: {
        type: 'pending-documentation',
        asamLevel: '3.1',
        locTag: '3.1 — ROI Pending',
        specialFlags: ['ROI Required']
      },
      mat: 'No MAT need',
      status: 'pending',
      transport: {
        status: 'not-required'
      },
      assigned: {
        name: 'CRS Hall',
        role: 'CRS',
        id: 'shall'
      },
      lastUpdate: '09/22 06:50',
      reassess: false,
      sde: {
        placementStatus: 'PendingReview',
        facilitySelectedId: null,
        asamRequested: '3.1',
        matNeeds: 'None',
        transportStatus: 'None',
        assignedTo: 'shall',
        lastUpdateTs: '2025-09-22T06:50:00',
        reassessFlag: 'N'
      }
    },
    {
      id: 'S6',
      patient: 'Nguyen, Liem',
      placement: {
        type: 'placed',
        facilityName: 'Hope Ridge Recovery',
        facilityId: 33452,
        unit: '3.5 COC — Dual Capable',
        bedHold: '09/22 20:00',
        asamLevel: '3.5COC'
      },
      mat: 'No MAT need',
      status: 'accepted',
      transport: {
        status: 'complete',
        completedAt: '09/22 08:20',
        vendor: 'HealthRide'
      },
      assigned: {
        name: 'Jennifer Chen',
        role: 'CRC RN',
        id: 'jchen'
      },
      lastUpdate: '09/22 08:25',
      reassess: false,
      sde: {
        placementStatus: 'Accepted',
        facilitySelectedId: 33452,
        asamRequested: '3.5COC',
        matNeeds: 'None',
        transportStatus: 'Complete',
        assignedTo: 'jchen',
        lastUpdateTs: '2025-09-22T08:25:00',
        reassessFlag: 'N'
      }
    },
    {
      id: 'S7',
      patient: 'Singh, Priya',
      placement: {
        type: 'placed',
        facilityName: 'Jefferson Detox Unit',
        facilityId: 41567,
        unit: '3.7WM — Detox',
        bedHold: '09/23 04:00',
        asamLevel: '3.7WM'
      },
      mat: 'Methadone Induction',
      status: 'waiting',
      transport: {
        status: 'scheduled',
        eta: '22:15',
        vendor: 'City EMS',
        requestedBy: 'Morgan Lee',
        requestedAt: '09/22 09:45'
      },
      assigned: {
        name: 'Morgan Lee',
        role: 'CRC Tech',
        id: 'mlee'
      },
      lastUpdate: '09/22 09:46',
      reassess: false,
      sde: {
        placementStatus: 'Accepted',
        facilitySelectedId: 41567,
        asamRequested: '3.7WM',
        matNeeds: 'MethadoneInduction',
        transportStatus: 'Scheduled',
        transportEta: '22:15',
        transportVendor: 'City EMS',
        assignedTo: 'mlee',
        lastUpdateTs: '2025-09-22T09:46:00',
        reassessFlag: 'N'
      }
    },
    {
      id: 'S8',
      patient: 'Lopez, Daniela',
      placement: {
        type: 'awaiting-response',
        asamLevel: '2.1',
        locTag: '2.1 — IOP',
        specialFlags: ['Pregnancy accomodations']
      },
      mat: 'Suboxone Continue',
      status: 'pending',
      transport: {
        status: 'not-required'
      },
      assigned: {
        name: 'Sanjay Patel',
        role: 'UM',
        id: 'spatel'
      },
      lastUpdate: '09/22 09:20',
      reassess: false,
      sde: {
        placementStatus: 'PendingReview',
        facilitySelectedId: null,
        asamRequested: '2.1',
        matNeeds: 'SuboxoneContinue',
        transportStatus: 'None',
        assignedTo: 'spatel',
        lastUpdateTs: '2025-09-22T09:20:00',
        reassessFlag: 'N'
      }
    },
    {
      id: 'S9',
      patient: 'King, Mariah',
      placement: {
        type: 'searching',
        asamLevel: 'Acute-302',
        locTag: 'Acute-302 — Secure Hold',
        specialFlags: ['302 req', 'High acuity']
      },
      mat: 'Detox Only',
      status: 'nobeds',
      transport: {
        status: 'not-required'
      },
      assigned: {
        name: 'Kevin Dial',
        role: 'CRS',
        id: 'kdial'
      },
      lastUpdate: '09/22 08:05',
      reassess: false,
      sde: {
        placementStatus: 'NoBeds',
        facilitySelectedId: null,
        asamRequested: 'ACUTE302',
        matNeeds: 'DetoxOnly',
        transportStatus: 'None',
        assignedTo: 'kdial',
        lastUpdateTs: '2025-09-22T08:05:00',
        reassessFlag: 'N'
      }
    },
    {
      id: 'S10',
      patient: 'Hernandez, Luis',
      placement: {
        type: 'canceled',
        asamLevel: '3.5',
        locTag: '3.5 — Packet Withdrawn',
        specialFlags: ['Family opted out']
      },
      mat: 'No MAT need',
      status: 'canceled',
      transport: {
        status: 'not-required'
      },
      assigned: {
        name: 'Jennifer Chen',
        role: 'CRC RN',
        id: 'jchen'
      },
      lastUpdate: '09/22 06:10',
      reassess: false,
      sde: {
        placementStatus: 'Canceled',
        facilitySelectedId: null,
        asamRequested: '3.5',
        matNeeds: 'None',
        transportStatus: 'None',
        assignedTo: 'jchen',
        lastUpdateTs: '2025-09-22T06:10:00',
        reassessFlag: 'N'
      }
    }
  ];

  // Preserve a pristine copy of the seeded patient data so we can restore it when persisted snapshots are empty.
  const seedPatients = JSON.parse(JSON.stringify(patients));

  // Patient List Preview Data Model - SDE/Operational Field Mapping
  const patientListData = [
    {
      id: 'S1',
      patient: 'Rivera, Jordan',
      placement: {
        type: 'placed',
        facilityName: 'Friends Hospital',
        facilityId: 12345,
        unit: '3.7WM — Secure',
        bedHold: '09/22 14:00',
        asamLevel: '3.7WM'
      },
      mat: 'Methadone Continue',
      status: 'accepted',
      transport: {
        status: 'scheduled',
        eta: '13:30',
        vendor: 'MedTrans',
        requestedBy: 'Morgan Lee',
        requestedAt: '09/22 08:55'
      },
      assigned: {
        name: 'Morgan Lee',
        role: 'CRC Tech',
        id: 'mlee'
      },
      lastUpdate: '09/22 08:58',
      reassess: false,
      sde: {
        placementStatus: 'Accepted',
        facilitySelectedId: 12345,
        asamRequested: '3.7WM',
        matNeeds: 'MethadoneContinue',
        transportStatus: 'Scheduled',
        transportEta: '13:30',
        transportVendor: 'MedTrans',
        assignedTo: 'mlee',
        lastUpdateTs: '2025-09-22T08:58:00',
        reassessFlag: 'N'
      }
    },
    {
      id: 'S2',
      patient: 'Gomez, Alicia',
      placement: {
        type: 'placed',
        facilityName: 'City Stepdown Center',
        facilityId: 22331,
        unit: '3.1 — Stepdown',
        bedHold: '09/22 18:00',
        asamLevel: '3.1'
      },
      mat: 'Methadone Continue',
      status: 'waiting',
      transport: {
        status: 'waiting',
        requestedBy: 'Kevin Dial',
        requestedAt: '09/22 09:10'
      },
      assigned: {
        name: 'Kevin Dial',
        role: 'CRS',
        id: 'kdial'
      },
      lastUpdate: '09/22 09:12',
      reassess: false,
      sde: {
        placementStatus: 'Accepted',
        facilitySelectedId: 22331,
        asamRequested: '3.1',
        matNeeds: 'MethadoneContinue',
        transportStatus: 'Waiting',
        assignedTo: 'kdial',
        lastUpdateTs: '2025-09-22T09:12:00',
        reassessFlag: 'N'
      }
    },
    {
      id: 'S3',
      patient: 'Brooks, Tyler',
      placement: {
        type: 'searching',
        asamLevel: '3.3',
        locTag: '3.3 — 302 Required',
        specialFlags: ['302 req', 'Involuntary']
      },
      mat: 'No MAT need',
      status: 'searching',
      transport: {
        status: 'not-required'
      },
      assigned: {
        name: 'Kevin Dial',
        role: 'CRS',
        id: 'kdial'
      },
      lastUpdate: '09/22 07:05',
      reassess: false,
      sde: {
        placementStatus: 'Searching',
        facilitySelectedId: null,
        asamRequested: '3.3',
        matNeeds: 'None',
        transportStatus: 'None',
        assignedTo: 'kdial',
        lastUpdateTs: '2025-09-22T07:05:00',
        reassessFlag: 'N'
      }
    },
    {
      id: 'S4',
      patient: 'Chen, Mei',
      placement: {
        type: 'reassess-required',
        asamLevel: '3.5',
        locTag: '3.5 — Reassess Required',
        specialFlags: ['Benzo+', 'Reassess']
      },
      mat: 'Suboxone Induction',
      status: 'denied',
      transport: {
        status: 'not-required'
      },
      assigned: {
        name: 'CRS Hall',
        role: 'CRS',
        id: 'shall'
      },
      lastUpdate: '09/22 08:15',
      reassess: true,
      sde: {
        placementStatus: 'Denied',
        facilitySelectedId: null,
        asamRequested: '3.5',
        matNeeds: 'SuboxoneInduction',
        transportStatus: 'None',
        assignedTo: 'shall',
        lastUpdateTs: '2025-09-22T08:15:00',
        reassessFlag: 'Y'
      }
    },
    {
      id: 'S5',
      patient: 'Wallace, Omar',
      placement: {
        type: 'pending-documentation',
        asamLevel: '3.1',
        locTag: '3.1 — ROI Pending',
        specialFlags: ['ROI Required']
      },
      mat: 'No MAT need',
      status: 'pending',
      transport: {
        status: 'not-required'
      },
      assigned: {
        name: 'CRS Hall',
        role: 'CRS',
        id: 'shall'
      },
      lastUpdate: '09/22 06:50',
      reassess: false,
      sde: {
        placementStatus: 'PendingReview',
        facilitySelectedId: null,
        asamRequested: '3.1',
        matNeeds: 'None',
        transportStatus: 'None',
        assignedTo: 'shall',
        lastUpdateTs: '2025-09-22T06:50:00',
        reassessFlag: 'N'
      }
    },
    {
      id: 'S6',
      patient: 'Nguyen, Liem',
      placement: {
        type: 'placed',
        facilityName: 'Hope Ridge Recovery',
        facilityId: 33452,
        unit: '3.5 COC — Dual Capable',
        bedHold: '09/22 20:00',
        asamLevel: '3.5COC'
      },
      mat: 'No MAT need',
      status: 'accepted',
      transport: {
        status: 'complete',
        completedAt: '09/22 08:20',
        vendor: 'HealthRide'
      },
      assigned: {
        name: 'Jennifer Chen',
        role: 'CRC RN',
        id: 'jchen'
      },
      lastUpdate: '09/22 08:25',
      reassess: false,
      sde: {
        placementStatus: 'Accepted',
        facilitySelectedId: 33452,
        asamRequested: '3.5COC',
        matNeeds: 'None',
        transportStatus: 'Complete',
        assignedTo: 'jchen',
        lastUpdateTs: '2025-09-22T08:25:00',
        reassessFlag: 'N'
      }
    },
    {
      id: 'S7',
      patient: 'Singh, Priya',
      placement: {
        type: 'placed',
        facilityName: 'Jefferson Detox Unit',
        facilityId: 41567,
        unit: '3.7WM — Detox',
        bedHold: '09/23 04:00',
        asamLevel: '3.7WM'
      },
      mat: 'Methadone Induction',
      status: 'waiting',
      transport: {
        status: 'scheduled',
        eta: '22:15',
        vendor: 'City EMS',
        requestedBy: 'Morgan Lee',
        requestedAt: '09/22 09:45'
      },
      assigned: {
        name: 'Morgan Lee',
        role: 'CRC Tech',
        id: 'mlee'
      },
      lastUpdate: '09/22 09:46',
      reassess: false,
      sde: {
        placementStatus: 'Accepted',
        facilitySelectedId: 41567,
        asamRequested: '3.7WM',
        matNeeds: 'MethadoneInduction',
        transportStatus: 'Scheduled',
        transportEta: '22:15',
        transportVendor: 'City EMS',
        assignedTo: 'mlee',
        lastUpdateTs: '2025-09-22T09:46:00',
        reassessFlag: 'N'
      }
    },
    {
      id: 'S8',
      patient: 'Lopez, Daniela',
      placement: {
        type: 'awaiting-response',
        asamLevel: '2.1',
        locTag: '2.1 — IOP',
        specialFlags: ['Pregnancy accomodations']
      },
      mat: 'Suboxone Continue',
      status: 'pending',
      transport: {
        status: 'not-required'
      },
      assigned: {
        name: 'Sanjay Patel',
        role: 'UM',
        id: 'spatel'
      },
      lastUpdate: '09/22 09:20',
      reassess: false,
      sde: {
        placementStatus: 'PendingReview',
        facilitySelectedId: null,
        asamRequested: '2.1',
        matNeeds: 'SuboxoneContinue',
        transportStatus: 'None',
        assignedTo: 'spatel',
        lastUpdateTs: '2025-09-22T09:20:00',
        reassessFlag: 'N'
      }
    },
    {
      id: 'S9',
      patient: 'King, Mariah',
      placement: {
        type: 'searching',
        asamLevel: 'Acute-302',
        locTag: 'Acute-302 — Secure Hold',
        specialFlags: ['302 req', 'High acuity']
      },
      mat: 'Detox Only',
      status: 'nobeds',
      transport: {
        status: 'not-required'
      },
      assigned: {
        name: 'Kevin Dial',
        role: 'CRS',
        id: 'kdial'
      },
      lastUpdate: '09/22 08:05',
      reassess: false,
      sde: {
        placementStatus: 'NoBeds',
        facilitySelectedId: null,
        asamRequested: 'ACUTE302',
        matNeeds: 'DetoxOnly',
        transportStatus: 'None',
        assignedTo: 'kdial',
        lastUpdateTs: '2025-09-22T08:05:00',
        reassessFlag: 'N'
      }
    },
    {
      id: 'S10',
      patient: 'Hernandez, Luis',
      placement: {
        type: 'canceled',
        asamLevel: '3.5',
        locTag: '3.5 — Packet Withdrawn',
        specialFlags: ['Family opted out']
      },
      mat: 'No MAT need',
      status: 'canceled',
      transport: {
        status: 'not-required'
      },
      assigned: {
        name: 'Jennifer Chen',
        role: 'CRC RN',
        id: 'jchen'
      },
      lastUpdate: '09/22 06:10',
      reassess: false,
      sde: {
        placementStatus: 'Canceled',
        facilitySelectedId: null,
        asamRequested: '3.5',
        matNeeds: 'None',
        transportStatus: 'None',
        assignedTo: 'jchen',
        lastUpdateTs: '2025-09-22T06:10:00',
        reassessFlag: 'N'
      }
    }
  ];

  // Preserve a pristine copy of the seeded patient data so we can restore it when persisted snapshots are empty.
  const seedPatients = JSON.parse(JSON.stringify(patients));

  // Patient List Preview Data Model - SDE/Operational Field Mapping
  const patientListData = [
    {
      id: 'S1',
      patient: 'Rivera, Jordan',
      placement: {
        type: 'placed',
        facilityName: 'Friends Hospital',
        facilityId: 12345,
        unit: '3.7WM — Secure',
        bedHold: '09/22 14:00',
        asamLevel: '3.7WM'
      },
      mat: 'Methadone Continue',
      status: 'accepted',
      transport: {
        status: 'scheduled',
        eta: '13:30',
        vendor: 'MedTrans',
        requestedBy: 'Morgan Lee',
        requestedAt: '09/22 08:55'
      },
      assigned: {
        name: 'Morgan Lee',
        role: 'CRC Tech',
        id: 'mlee'
      },
      lastUpdate: '09/22 08:58',
      reassess: false,
      sde: {
        placementStatus: 'Accepted',
        facilitySelectedId: 12345,
        asamRequested: '3.7WM',
        matNeeds: 'MethadoneContinue',
        transportStatus: 'Scheduled',
        transportEta: '13:30',
        transportVendor: 'MedTrans',
        assignedTo: 'mlee',
        lastUpdateTs: '2025-09-22T08:58:00',
        reassessFlag: 'N'
      }
    },
    {
      id: 'S2',
      patient: 'Gomez, Alicia',
      placement: {
        type: 'placed',
        facilityName: 'City Stepdown Center',
        facilityId: 22331,
        unit: '3.1 — Stepdown',
        bedHold: '09/22 18:00',
        asamLevel: '3.1'
      },
      mat: 'Methadone Continue',
      status: 'waiting',
      transport: {
        status: 'waiting',
        requestedBy: 'Kevin Dial',
        requestedAt: '09/22 09:10'
      },
      assigned: {
        name: 'Kevin Dial',
        role: 'CRS',
        id: 'kdial'
      },
      lastUpdate: '09/22 09:12',
      reassess: false,
      sde: {
        placementStatus: 'Accepted',
        facilitySelectedId: 22331,
        asamRequested: '3.1',
        matNeeds: 'MethadoneContinue',
        transportStatus: 'Waiting',
        assignedTo: 'kdial',
        lastUpdateTs: '2025-09-22T09:12:00',
        reassessFlag: 'N'
      }
    },
    {
      id: 'S3',
      patient: 'Brooks, Tyler',
      placement: {
        type: 'searching',
        asamLevel: '3.3',
        locTag: '3.3 — 302 Required',
        specialFlags: ['302 req', 'Involuntary']
      },
      mat: 'No MAT need',
      status: 'searching',
      transport: {
        status: 'not-required'
      },
      assigned: {
        name: 'Kevin Dial',
        role: 'CRS',
        id: 'kdial'
      },
      lastUpdate: '09/22 07:05',
      reassess: false,
      sde: {
        placementStatus: 'Searching',
        facilitySelectedId: null,
        asamRequested: '3.3',
        matNeeds: 'None',
        transportStatus: 'None',
        assignedTo: 'kdial',
        lastUpdateTs: '2025-09-22T07:05:00',
        reassessFlag: 'N'
      }
    },
    {
      id: 'S4',
      patient: 'Chen, Mei',
      placement: {
        type: 'reassess-required',
        asamLevel: '3.5',
        locTag: '3.5 — Reassess Required',
        specialFlags: ['Benzo+', 'Reassess']
      },
      mat: 'Suboxone Induction',
      status: 'denied',
      transport: {
        status: 'not-required'
      },
      assigned: {
        name: 'CRS Hall',
        role: 'CRS',
        id: 'shall'
      },
      lastUpdate: '09/22 08:15',
      reassess: true,
      sde: {
        placementStatus: 'Denied',
        facilitySelectedId: null,
        asamRequested: '3.5',
        matNeeds: 'SuboxoneInduction',
        transportStatus: 'None',
        assignedTo: 'shall',
        lastUpdateTs: '2025-09-22T08:15:00',
        reassessFlag: 'Y'
      }
    },
    {
      id: 'S5',
      patient: 'Wallace, Omar',
      placement: {
        type: 'pending-documentation',
        asamLevel: '3.1',
        locTag: '3.1 — ROI Pending',
        specialFlags: ['ROI Required']
      },
      mat: 'No MAT need',
      status: 'pending',
      transport: {
        status: 'not-required'
      },
      assigned: {
        name: 'CRS Hall',
        role: 'CRS',
        id: 'shall'
      },
      lastUpdate: '09/22 06:50',
      reassess: false,
      sde: {
        placementStatus: 'PendingReview',
        facilitySelectedId: null,
        asamRequested: '3.1',
        matNeeds: 'None',
        transportStatus: 'None',
        assignedTo: 'shall',
        lastUpdateTs: '2025-09-22T06:50:00',
        reassessFlag: 'N'
      }
    },
    {
      id: 'S6',
      patient: 'Nguyen, Liem',
      placement: {
        type: 'placed',
        facilityName: 'Hope Ridge Recovery',
        facilityId: 33452,
        unit: '3.5 COC — Dual Capable',
        bedHold: '09/22 20:00',
        asamLevel: '3.5COC'
      },
      mat: 'No MAT need',
      status: 'accepted',
      transport: {
        status: 'complete',
        completedAt: '09/22 08:20',
        vendor: 'HealthRide'
      },
      assigned: {
        name: 'Jennifer Chen',
        role: 'CRC RN',
        id: 'jchen'
      },
      lastUpdate: '09/22 08:25',
      reassess: false,
      sde: {
        placementStatus: 'Accepted',
        facilitySelectedId: 33452,
        asamRequested: '3.5COC',
        matNeeds: 'None',
        transportStatus: 'Complete',
        assignedTo: 'jchen',
        lastUpdateTs: '2025-09-22T08:25:00',
        reassessFlag: 'N'
      }
    },
    {
      id: 'S7',
      patient: 'Singh, Priya',
      placement: {
        type: 'placed',
        facilityName: 'Jefferson Detox Unit',
        facilityId: 41567,
        unit: '3.7WM — Detox',
        bedHold: '09/23 04:00',
        asamLevel: '3.7WM'
      },
      mat: 'Methadone Induction',
      status: 'waiting',
      transport: {
        status: 'scheduled',
        eta: '22:15',
        vendor: 'City EMS',
        requestedBy: 'Morgan Lee',
        requestedAt: '09/22 09:45'
      },
      assigned: {
        name: 'Morgan Lee',
        role: 'CRC Tech',
        id: 'mlee'
      },
      lastUpdate: '09/22 09:46',
      reassess: false,
      sde: {
        placementStatus: 'Accepted',
        facilitySelectedId: 41567,
        asamRequested: '3.7WM',
        matNeeds: 'MethadoneInduction',
        transportStatus: 'Scheduled',
        transportEta: '22:15',
        transportVendor: 'City EMS',
        assignedTo: 'mlee',
        lastUpdateTs: '2025-09-22T09:46:00',
        reassessFlag: 'N'
      }
    },
    {
      id: 'S8',
      patient: 'Lopez, Daniela',
      placement: {
        type: 'awaiting-response',
        asamLevel: '2.1',
        locTag: '2.1 — IOP',
        specialFlags: ['Pregnancy accomodations']
      },
      mat: 'Suboxone Continue',
      status: 'pending',
      transport: {
        status: 'not-required'
      },
      assigned: {
        name: 'Sanjay Patel',
        role: 'UM',
        id: 'spatel'
      },
      lastUpdate: '09/22 09:20',
      reassess: false,
      sde: {
        placementStatus: 'PendingReview',
        facilitySelectedId: null,
        asamRequested: '2.1',
        matNeeds: 'SuboxoneContinue',
        transportStatus: 'None',
        assignedTo: 'spatel',
        lastUpdateTs: '2025-09-22T09:20:00',
        reassessFlag: 'N'
      }
    },
    {
      id: 'S9',
      patient: 'King, Mariah',
      placement: {
        type: 'searching',
        asamLevel: 'Acute-302',
        locTag: 'Acute-302 — Secure Hold',
        specialFlags: ['302 req', 'High acuity']
      },
      mat: 'Detox Only',
      status: 'nobeds',
      transport: {
        status: 'not-required'
      },
      assigned: {
        name: 'Kevin Dial',
        role: 'CRS',
        id: 'kdial'
      },
      lastUpdate: '09/22 08:05',
      reassess: false,
      sde: {
        placementStatus: 'NoBeds',
        facilitySelectedId: null,
        asamRequested: 'ACUTE302',
        matNeeds: 'DetoxOnly',
        transportStatus: 'None',
        assignedTo: 'kdial',
        lastUpdateTs: '2025-09-22T08:05:00',
        reassessFlag: 'N'
      }
    },
    {
      id: 'S10',
      patient: 'Hernandez, Luis',
      placement: {
        type: 'canceled',
        asamLevel: '3.5',
        locTag: '3.5 — Packet Withdrawn',
        specialFlags: ['Family opted out']
      },
      mat: 'No MAT need',
      status: 'canceled',
      transport: {
        status: 'not-required'
      },
      assigned: {
        name: 'Jennifer Chen',
        role: 'CRC RN',
        id: 'jchen'
      },
      lastUpdate: '09/22 06:10',
      reassess: false,
      sde: {
        placementStatus: 'Canceled',
        facilitySelectedId: null,
        asamRequested: '3.5',
        matNeeds: 'None',
        transportStatus: 'None',
        assignedTo: 'jchen',
        lastUpdateTs: '2025-09-22T06:10:00',
        reassessFlag: 'N'
      }
    }
  ];

  // Preserve a pristine copy of the seeded patient data so we can restore it when persisted snapshots are empty.
  const seedPatients = JSON.parse(JSON.stringify(patients));

  // Patient List Preview Data Model - SDE/Operational Field Mapping
  const patientListData = [
    {
      id: 'S1',
      patient: 'Rivera, Jordan',
      placement: {
        type: 'placed',
        facilityName: 'Friends Hospital',
        facilityId: 12345,
        unit: '3.7WM — Secure',
        bedHold: '09/22 14:00',
        asamLevel: '3.7WM'
      },
      mat: 'Methadone Continue',
      status: 'accepted',
      transport: {
        status: 'scheduled',
        eta: '13:30',
        vendor: 'MedTrans',
        requestedBy: 'Morgan Lee',
        requestedAt: '09/22 08:55'
      },
      assigned: {
        name: 'Morgan Lee',
        role: 'CRC Tech',
        id: 'mlee'
      },
      lastUpdate: '09/22 08:58',
      reassess: false,
      sde: {
        placementStatus: 'Accepted',
        facilitySelectedId: 12345,
        asamRequested: '3.7WM',
        matNeeds: 'MethadoneContinue',
        transportStatus: 'Scheduled',
        transportEta: '13:30',
        transportVendor: 'MedTrans',
        assignedTo: 'mlee',
        lastUpdateTs: '2025-09-22T08:58:00',
        reassessFlag: 'N'
      }
    },
    {
      id: 'S2',
      patient: 'Gomez, Alicia',
      placement: {
        type: 'placed',
        facilityName: 'City Stepdown Center',
        facilityId: 22331,
        unit: '3.1 — Stepdown',
        bedHold: '09/22 18:00',
        asamLevel: '3.1'
      },
      mat: 'Methadone Continue',
      status: 'waiting',
      transport: {
        status: 'waiting',
        requestedBy: 'Kevin Dial',
        requestedAt: '09/22 09:10'
      },
      assigned: {
        name: 'Kevin Dial',
        role: 'CRS',
        id: 'kdial'
      },
      lastUpdate: '09/22 09:12',
      reassess: false,
      sde: {
        placementStatus: 'Accepted',
        facilitySelectedId: 22331,
        asamRequested: '3.1',
        matNeeds: 'MethadoneContinue',
        transportStatus: 'Waiting',
        assignedTo: 'kdial',
        lastUpdateTs: '2025-09-22T09:12:00',
        reassessFlag: 'N'
      }
    },
    {
      id: 'S3',
      patient: 'Brooks, Tyler',
      placement: {
        type: 'searching',
        asamLevel: '3.3',
        locTag: '3.3 — 302 Required',
        specialFlags: ['302 req', 'Involuntary']
      },
      mat: 'No MAT need',
      status: 'searching',
      transport: {
        status: 'not-required'
      },
      assigned: {
        name: 'Kevin Dial',
        role: 'CRS',
        id: 'kdial'
      },
      lastUpdate: '09/22 07:05',
      reassess: false,
      sde: {
        placementStatus: 'Searching',
        facilitySelectedId: null,
        asamRequested: '3.3',
        matNeeds: 'None',
        transportStatus: 'None',
        assignedTo: 'kdial',
        lastUpdateTs: '2025-09-22T07:05:00',
        reassessFlag: 'N'
      }
    },
    {
      id: 'S4',
      patient: 'Chen, Mei',
      placement: {
        type: 'reassess-required',
        asamLevel: '3.5',
        locTag: '3.5 — Reassess Required',
        specialFlags: ['Benzo+', 'Reassess']
      },
      mat: 'Suboxone Induction',
      status: 'denied',
      transport: {
        status: 'not-required'
      },
      assigned: {
        name: 'CRS Hall',
        role: 'CRS',
        id: 'shall'
      },
      lastUpdate: '09/22 08:15',
      reassess: true,
      sde: {
        placementStatus: 'Denied',
        facilitySelectedId: null,
        asamRequested: '3.5',
        matNeeds: 'SuboxoneInduction',
        transportStatus: 'None',
        assignedTo: 'shall',
        lastUpdateTs: '2025-09-22T08:15:00',
        reassessFlag: 'Y'
      }
    },
    {
      id: 'S5',
      patient: 'Wallace, Omar',
      placement: {
        type: 'pending-documentation',
        asamLevel: '3.1',
        locTag: '3.1 — ROI Pending',
        specialFlags: ['ROI Required']
      },
      mat: 'No MAT need',
      status: 'pending',
      transport: {
        status: 'not-required'
      },
      assigned: {
        name: 'CRS Hall',
        role: 'CRS',
        id: 'shall'
      },
      lastUpdate: '09/22 06:50',
      reassess: false,
      sde: {
        placementStatus: 'PendingReview',
        facilitySelectedId: null,
        asamRequested: '3.1',
        matNeeds: 'None',
        transportStatus: 'None',
        assignedTo: 'shall',
        lastUpdateTs: '2025-09-22T06:50:00',
        reassessFlag: 'N'
      }
    },
    {
      id: 'S6',
      patient: 'Nguyen, Liem',
      placement: {
        type: 'placed',
        facilityName: 'Hope Ridge Recovery',
        facilityId: 33452,
        unit: '3.5 COC — Dual Capable',
        bedHold: '09/22 20:00',
        asamLevel: '3.5COC'
      },
      mat: 'No MAT need',
      status: 'accepted',
      transport: {
        status: 'complete',
        completedAt: '09/22 08:20',
        vendor: 'HealthRide'
      },
      assigned: {
        name: 'Jennifer Chen',
        role: 'CRC RN',
        id: 'jchen'
      },
      lastUpdate: '09/22 08:25',
      reassess: false,
      sde: {
        placementStatus: 'Accepted',
        facilitySelectedId: 33452,
        asamRequested: '3.5COC',
        matNeeds: 'None',
        transportStatus: 'Complete',
        assignedTo: 'jchen',
        lastUpdateTs: '2025-09-22T08:25:00',
        reassessFlag: 'N'
      }
    },
    {
      id: 'S7',
      patient: 'Singh, Priya',
      placement: {
        type: 'placed',
        facilityName: 'Jefferson Detox Unit',
        facilityId: 41567,
        unit: '3.7WM — Detox',
        bedHold: '09/23 04:00',
        asamLevel: '3.7WM'
      },
      mat: 'Methadone Induction',
      status: 'waiting',
      transport: {
        status: 'scheduled',
        eta: '22:15',
        vendor: 'City EMS',
        requestedBy: 'Morgan Lee',
        requestedAt: '09/22 09:45'
      },
      assigned: {
        name: 'Morgan Lee',
        role: 'CRC Tech',
        id: 'mlee'
      },
      lastUpdate: '09/22 09:46',
      reassess: false,
      sde: {
        placementStatus: 'Accepted',
        facilitySelectedId: 41567,
        asamRequested: '3.7WM',
        matNeeds: 'MethadoneInduction',
        transportStatus: 'Scheduled',
        transportEta: '22:15',
        transportVendor: 'City EMS',
        assignedTo: 'mlee',
        lastUpdateTs: '2025-09-22T09:46:00',
        reassessFlag: 'N'
      }
    },
    {
      id: 'S8',
      patient: 'Lopez, Daniela',
      placement: {
        type: 'awaiting-response',
        asamLevel: '2.1',
        locTag: '2.1 — IOP',
        specialFlags: ['Pregnancy accomodations']
      },
      mat: 'Suboxone Continue',
      status: 'pending',
      transport: {
        status: 'not-required'
      },
      assigned: {
        name: 'Sanjay Patel',
        role: 'UM',
        id: 'spatel'
      },
      lastUpdate: '09/22 09:20',
      reassess: false,
      sde: {
        placementStatus: 'PendingReview',
        facilitySelectedId: null,
        asamRequested: '2.1',
        matNeeds: 'SuboxoneContinue',
        transportStatus: 'None',
        assignedTo: 'spatel',
        lastUpdateTs: '2025-09-22T09:20:00',
        reassessFlag: 'N'
      }
    },
    {
      id: 'S9',
      patient: 'King, Mariah',
      placement: {
        type: 'searching',
        asamLevel: 'Acute-302',
        locTag: 'Acute-302 — Secure Hold',
        specialFlags: ['302 req', 'High acuity']
      },
      mat: 'Detox Only',
      status: 'nobeds',
      transport: {
        status: 'not-required'
      },
      assigned: {
        name: 'Kevin Dial',
        role: 'CRS',
        id: 'kdial'
      },
      lastUpdate: '09/22 08:05',
      reassess: false,
      sde: {
        placementStatus: 'NoBeds',
        facilitySelectedId: null,
        asamRequested: 'ACUTE302',
        matNeeds: 'DetoxOnly',
        transportStatus: 'None',
        assignedTo: 'kdial',
        lastUpdateTs: '2025-09-22T08:05:00',
        reassessFlag: 'N'
      }
    },
    {
      id: 'S10',
      patient: 'Hernandez, Luis',
      placement: {
        type: 'canceled',
        asamLevel: '3.5',
        locTag: '3.5 — Packet Withdrawn',
        specialFlags: ['Family opted out']
      },
      mat: 'No MAT need',
      status: 'canceled',
      transport: {
        status: 'not-required'
      },
      assigned: {
        name: 'Jennifer Chen',
        role: 'CRC RN',
        id: 'jchen'
      },
      lastUpdate: '09/22 06:10',
      reassess: false,
      sde: {
        placementStatus: 'Canceled',
        facilitySelectedId: null,
        asamRequested: '3.5',
        matNeeds: 'None',
        transportStatus: 'None',
        assignedTo: 'jchen',
        lastUpdateTs: '2025-09-22T06:10:00',
        reassessFlag: 'N'
      }
    }
  ];

  // Generate patient list data from main patients array
  function generatePatientListData() {
    return patients.map(patient => ({
      id: patient.id,
      name: patient.name,
      patient: patient.name,
      placement: patient.note?.selectedFacilityId ? {
        type: 'placed',
        facilityName: patient.note.selectedFacilityId,
        text: `${patient.note.selectedFacilityId} — ${patient.note.asam || ''}`
      } : {
        type: 'searching',
        text: `Searching — ${patient.note?.asam || 'Unknown'}`
      },
      mat: patient.note?.matNeeds || '',
      status: patient.note?.transferStatus || 'draft',
      transport: patient.transport || 'Pending',
      assigned: patient.assigned || 'Unassigned',
      lastUpdate: patient.note?.lastUpdated || '',
      reassessFlag: patient.note?.reassessFlag || 'N'
    }));
  }

  // Staff Directory for Assignment
  const staffDirectory = [
    { id: 'mlee', name: 'Morgan Lee', role: 'CRC Tech', contact: 'mlee@hospital.org', phone: '555-0123' },
    { id: 'kdial', name: 'Kevin Dial', role: 'CRS', contact: 'kdial@hospital.org', phone: '555-0124' },
    { id: 'spatel', name: 'Sanjay Patel', role: 'UM', contact: 'spatel@hospital.org', phone: '555-0125' },
    { id: 'jchen', name: 'Jennifer Chen', role: 'CRC RN', contact: 'jchen@hospital.org', phone: '555-0126' }
  ];

  const facilitiesData = [
  {
    "id": 6446,
    "name": "Albert Einstein Medical Center",
    "address": "5501 Old York Road",
    "city": "Philadelphia, PA",
    "distance": 3.1,
    "phone": "215-456-7890",
    "matSupports": [
      "MethadoneContinue",
      "MethadoneInduction",
      "SuboxoneInduction"
    ],
    "asamLevels": [
      "3.5",
      "3.7"
    ],
    "acuteBh": true,
    "acuteMed": true,
    "takes302": true,
    "secureDetox": true,
    "stepUp": true,
    "coOccurring": true,
    "dualDx": true,
    "bhMedInit": true,
    "requiresMedsOnHand": false,
    "payerPlans": [
      "Jefferson Medicaid",
      "Medicare",
      "Keystone PPO"
    ],
    "bed": {
      "status": "Open (2 beds)",
      "lastUpdated": "2025-09-22T08:30:00Z"
    },
    "lastVerified": "2025-09-21T13:00:00Z",
    "score": 93,
    "highlights": [
      "Onsite MAT medical director",
      "Step-up medical pod"
    ],
    "warnings": [],
    "transferInstructions": "Call CRC intake, fax packet, confirm transport ETA.",
    "capacity": "ASAM 3.7 WM secure detox, mixed gender",
    "notes": "Prefers arrival before 21:00; 24/7 psychiatry.",
    "contact": {
      "name": "CRC Intake Desk",
      "phone": "215-456-7890",
      "direct": "einsteincrc@direct.org",
      "fax": "215-456-7888"
    },
    "metadata": {
      "source": "chronicles",
      "verifiedBy": "einstein.steward",
      "method": "Phone check-in"
    }
  },
  {
    "id": 18297,
    "name": "Behavioral Wellness Center",
    "address": "801 West Girard Avenue",
    "city": "Philadelphia, PA",
    "distance": 1.4,
    "phone": "215-787-2163",
    "matSupports": [
      "MethadoneInduction",
      "SuboxoneInduction"
    ],
    "asamLevels": [
      "3.7",
      "3.5"
    ],
    "acuteBh": true,
    "acuteMed": true,
    "takes302": true,
    "secureDetox": true,
    "stepUp": true,
    "coOccurring": true,
    "dualDx": true,
    "bhMedInit": true,
    "requiresMedsOnHand": false,
    "payerPlans": [
      "Jefferson Medicaid",
      "Commercial",
      "Medicare"
    ],
    "bed": {
      "status": "Waitlist (<12h)",
      "lastUpdated": "2025-09-22T07:55:00Z"
    },
    "lastVerified": "2025-09-18T09:30:00Z",
    "score": 82,
    "highlights": [
      "Detox + rehab continuum",
      "Onsite MAT pharmacy"
    ],
    "warnings": [
      "Verification is 4 days old — confirm before transfer."
    ],
    "transferInstructions": "Page intake RN with packet, confirm withdrawal protocol.",
    "capacity": "ASAM 3.7 WM and 3.5 residential",
    "notes": "Waitlist clears twice daily; after-hours admissions limited.",
    "contact": {
      "name": "Intake RN",
      "phone": "215-787-2163",
      "direct": "bwc@direct.org",
      "fax": "215-787-2150"
    },
    "metadata": {
      "source": "chronicles",
      "verifiedBy": "bwc.steward",
      "method": "Portal attestation"
    }
  },
  {
    "id": 18328,
    "name": "Belmont Behavioral Hospital",
    "address": "4200 Monument Road",
    "city": "Philadelphia, PA",
    "distance": 5.6,
    "phone": "215-877-2000",
    "matSupports": [
      "MethadoneContinue",
      "SuboxoneInduction"
    ],
    "asamLevels": [
      "3.5"
    ],
    "acuteBh": true,
    "acuteMed": false,
    "takes302": true,
    "secureDetox": true,
    "stepUp": false,
    "coOccurring": true,
    "dualDx": true,
    "bhMedInit": true,
    "requiresMedsOnHand": false,
    "payerPlans": [
      "Jefferson Medicaid",
      "Keystone PPO",
      "Commercial"
    ],
    "bed": {
      "status": "Female bed opening 18:00",
      "lastUpdated": "2025-09-22T06:45:00Z"
    },
    "lastVerified": "2025-09-15T12:10:00Z",
    "score": 79,
    "highlights": [
      "Dedicated co-occurring unit"
    ],
    "warnings": [
      "No IV step-up; coordinate medical clearance."
    ],
    "transferInstructions": "Call admissions, email packet, arrange secure transport.",
    "capacity": "ASAM 3.5 dual-diagnosis",
    "notes": "Requires onsite BH evaluation before admission.",
    "contact": {
      "name": "Admissions Coordinator",
      "phone": "215-877-2000",
      "direct": "belmont@direct.org",
      "fax": "215-877-2099"
    },
    "metadata": {
      "source": "chronicles",
      "verifiedBy": "belmont.steward",
      "method": "Weekly steward call"
    }
  },
  {
    "id": 18340,
    "name": "Citizens Acting Together Can Help Inc",
    "address": "700 Packer Avenue",
    "city": "Philadelphia, PA",
    "distance": 4.2,
    "phone": "215-336-6926",
    "matSupports": [
      "SuboxoneContinue"
    ],
    "asamLevels": [
      "3.1",
      "2.1"
    ],
    "acuteBh": true,
    "acuteMed": false,
    "takes302": false,
    "secureDetox": false,
    "stepUp": false,
    "coOccurring": true,
    "dualDx": true,
    "bhMedInit": false,
    "requiresMedsOnHand": false,
       "payerPlans": [
      "Jefferson Medicaid",
      "Medicare"
    ],
    "bed": {
      "status": "Open groups",
      "lastUpdated": "2025-09-21T17:30:00Z"
    },
    "lastVerified": "2025-09-20T10:00:00Z",
    "score": 70,
    "highlights": [
      "Community-based stabilization",
      "Peer support embedded"
    ],
    "warnings": [
      "Does not accept 302 holds."
    ],
    "transferInstructions": "Warm handoff call, schedule intake slot before discharge.",
    "capacity": "ASAM 3.1 extended care",
    "notes": "Great for step-down when legal hold cleared.",
    "contact": {
      "name": "Step-Down Coordinator",
      "phone": "215-336-6926",
      "direct": "catch@direct.org",
      "fax": "215-336-6950"
    },
    "metadata": {
      "source": "api",
      "verifiedBy": "catch.api",
      "method": "API sync"
    }
  },
  {
    "id": 18345,
    "name": "Community Council for MH/MR",
    "address": "4900 Wyalusing Avenue",
    "city": "Philadelphia, PA",
    "distance": 6.3,
    "phone": "215-473-7033",
    "matSupports": [
      "None"
    ],
    "asamLevels": [
      "2.1"
    ],
    "acuteBh": true,
    "acuteMed": false,
    "takes302": false,
    "secureDetox": false,
    "stepUp": false,
    "coOccurring": true,
    "dualDx": true,
    "bhMedInit": false,
    "requiresMedsOnHand": false,
    "payerPlans": [
      "Jefferson Medicaid",
      "Magellan"
    ],
    "bed": {
      "status": "Outpatient slots",
      "lastUpdated": "2025-09-21T09:05:00Z"
    },
    "lastVerified": "2025-09-19T08:40:00Z",
    "score": 68,
    "highlights": [
      "Strong community wraparound"
    ],
    "warnings": [
      "No detox or MAT; use for outpatient step-down only."
    ],
    "transferInstructions": "Submit referral packet via portal, confirm first appointment.",
    "capacity": "ASAM 2.1 intensive outpatient",
    "notes": "Ideal for post-detox stabilization and housing support.",
    "contact": {
      "name": "Care Navigator",
      "phone": "215-473-7033",
      "direct": "communitycouncil@direct.org",
      "fax": "215-473-7099"
    },
    "metadata": {
      "source": "chronicles",
      "verifiedBy": "ccmh.steward",
      "method": "In-person visit"
    }
  },
  {
    "id": 6452,
    "name": "Friends Hospital",
    "address": "4641 Roosevelt Boulevard",
    "city": "Philadelphia, PA",
    "distance": 4.9,
    "phone": "215-831-4600",
    "matSupports": [
      "MethadoneContinue",
      "SuboxoneContinue"
    ],
    "asamLevels": [
      "3.5",
      "3.7"
    ],
    "acuteBh": true,
    "acuteMed": true,
    "takes302": true,
    "secureDetox": true,
    "stepUp": true,
    "coOccurring": true,
    "dualDx": true,
    "bhMedInit": true,
    "requiresMedsOnHand": false,
    "payerPlans": [
      "Jefferson Medicaid",
      "Keystone PPO",
      "Medicare"
    ],
    "bed": {
      "status": "Secure unit has 1 bed",
      "lastUpdated": "2025-09-22T05:50:00Z"
    },
    "lastVerified": "2025-09-22T07:15:00Z",
    "score": 91,
    "highlights": [
      "Dedicated secure unit",
      "Neuromodulation consults"
    ],
    "warnings": [],
    "transferInstructions": "Call transfer center, fax labs, coordinate security escort.",
    "capacity": "ASAM 3.7 psychiatric hospital",
    "notes": "Can accept 302s; requires med reconciliation before arrival.",
    "contact": {
      "name": "Transfer Center",
      "phone": "215-831-4600",
      "direct": "friends@direct.org",
      "fax": "215-831-4699"
    },
    "metadata": {
      "source": "chronicles",
      "verifiedBy": "friends.steward",
      "method": "Daily steward huddle"
    }
  },
  {
    "id": 6831,
    "name": "Gaudenzia DRC Inc",
    "address": "3200 A Henry Avenue",
    "city": "Philadelphia, PA",
    "distance": 3.8,
    "phone": "215-991-9700",
    "matSupports": ["MethadoneContinue", "SuboxoneContinue"],
    "asamLevels": ["3.5"],
    "acuteBh": true,
    "acuteMed": false,
    "takes302": false,
    "secureDetox": false,
    "stepUp": false,
    "coOccurring": true,
    "dualDx": true,
    "bhMedInit": false,
    "requiresMedsOnHand": false,
    "payerPlans": ["Jefferson Medicaid", "Medicare", "Commercial"],
    "bed": {"status": "Residential beds (men)", "lastUpdated": "2025-09-21T12:20:00Z"},
    "lastVerified": "2025-09-20T14:00:00Z",
    "score": 76,
    "highlights": ["Long-term MAT-friendly residential"],
    "warnings": ["No 302 acceptance; verify MAT documentation."],
    "transferInstructions": "Call placement desk, secure transportation with paperwork.",
    "capacity": "ASAM 3.5 residential",
    "notes": "Requires med list and TB screening within 30 days.",
    "contact": {"name": "Placement Desk", "phone": "215-991-9700", "direct": "gaudenzia-henry@direct.org", "fax": "215-991-9799"},
    "metadata": {"source": "api", "verifiedBy": "gaudenzia.api", "method": "API sync"}
  },
  {
    "id": 6830,
    "name": "Gaudenzia Inc",
    "address": "1306 Spring Garden Street",
    "city": "Philadelphia, PA",
    "distance": 0.9,
    "phone": "215-238-2150",
    "matSupports": ["SuboxoneInduction", "SuboxoneContinue"],
    "asamLevels": ["3.1", "2.1"],
    "acuteBh": true,
    "acuteMed": false,
    "takes302": false,
    "secureDetox": false,
    "stepUp": false,
    "coOccurring": true,
    "dualDx": true,
    "bhMedInit": false,
    "requiresMedsOnHand": false,
    "payerPlans": ["Jefferson Medicaid", "Magellan", "Commercial"],
    "bed": {"status": "Coed units stable", "lastUpdated": "2025-09-21T11:45:00Z"},
    "lastVerified": "2025-09-19T16:10:00Z",
    "score": 74,
    "highlights": ["Urban recovery community", "Peer navigation"],
    "warnings": ["MAT limited to buprenorphine; no methadone."],
    "transferInstructions": "Schedule intake, send labs, confirm buprenorphine plan.",
    "capacity": "ASAM 3.1 step-down",
    "notes": "Requires verification of housing plan.",
    "contact": {"name": "Admissions", "phone": "215-238-2150", "direct": "gaudenzia-sg@direct.org", "fax": "215-238-2140"},
    "metadata": {"source": "chronicles", "verifiedBy": "gaudenzia.steward", "method": "Steward outreach"}
  },
  {
    "id": 6460,
    "name": "COMHAR Inc",
    "address": "2055 East Allegheny Avenue",
    "city": "Philadelphia, PA",
    "distance": 2.8,
    "phone": "215-427-1010",
    "matSupports": ["None"],
    "asamLevels": ["2.1"],
    "acuteBh": true,
    "acuteMed": false,
    "takes302": false,
    "secureDetox": false,
    "stepUp": false,
    "coOccurring": true,
    "dualDx": true,
    "bhMedInit": false,
    "requiresMedsOnHand": false,
    "payerPlans": ["Jefferson Medicaid", "Medicare"],
    "bed": {"status": "Outpatient slots", "lastUpdated": "2025-09-20T09:30:00Z"},
    "lastVerified": "2025-09-18T09:00:00Z",
    "score": 66,
    "highlights": ["Assertive community treatment"],
    "warnings": ["No detox, no 302 capacity."],
    "transferInstructions": "Route to ACT team; ensure community supports engaged.",
    "capacity": "ASAM 2.1 intensive outpatient",
    "notes": "Ideal for long-term community stabilization.",
    "contact": {"name": "ACT Scheduler", "phone": "215-427-1010", "direct": "comhar@direct.org", "fax": "215-427-1099"},
    "metadata": {"source": "chronicles", "verifiedBy": "comhar.steward", "method": "Site visit"}
  },
  {
    "id": 6456,
    "name": "Child Guidance Resource Centers",
    "address": "2901 Island Avenue",
    "city": "Philadelphia, PA",
    "distance": 7.5,
    "phone": "267-713-4100",
    "matSupports": ["None"],
    "asamLevels": ["2.1"],
    "acuteBh": true,
    "acuteMed": false,
    "takes302": false,
    "secureDetox": false,
    "stepUp": false,
    "coOccurring": true,
    "dualDx": true,
    "bhMedInit": false,
    "requiresMedsOnHand": false,
    "payerPlans": ["Jefferson Medicaid", "CHIP", "Commercial"],
    "bed": {"status": "Youth IOP openings", "lastUpdated": "2025-09-21T10:05:00Z"},
    "lastVerified": "2025-09-19T10:15:00Z",
    "score": 65,
    "highlights": ["Family-focused youth services"],
    "warnings": ["Pediatrics only; age <18."],
    "transferInstructions": "Coordinate with family navigator; obtain guardianship paperwork.",
    "capacity": "ASAM 2.1 youth intensive outpatient",
    "notes": "Requires family participation contract.",
    "contact": {"name": "Youth Navigator", "phone": "267-713-4100", "direct": "cgrowth@direct.org", "fax": "267-713-4110"},
    "metadata": {"source": "chronicles", "verifiedBy": "cgrc.steward", "method": "Phone check-in"}
  }
];


  const referenceNow = new Date('2025-09-22T10:00:00');
  const facilities = facilitiesData.map((facility) => {
    const lastVerifiedDate = new Date(facility.lastVerified);
    const bedUpdatedDate = facility.bed?.lastUpdated ? new Date(facility.bed.lastUpdated) : null;
    const daysStale = Math.floor((referenceNow - lastVerifiedDate) / (1000 * 60 * 60 * 24));
    return { ...facility, lastVerifiedDate, bedUpdatedDate, daysStale };
  });

  const payerOptions = Array.from(new Set(facilities.flatMap((f) => f.payerPlans))).sort();

  const elements = {
    patientSelect: document.getElementById('patientSelect'),
    patientName: document.getElementById('patientName'),
    patientMrn: document.getElementById('patientMrn'),
    patientFin: document.getElementById('patientFin'),
    patientConsent: document.getElementById('patientConsent'),
    patientPart2: document.getElementById('patientPart2'),
    breakGlassBtn: document.getElementById('breakGlass'),
    navTabs: document.querySelectorAll('.workflow-nav li'),
    finalizeButton: document.getElementById('finalizeTransfer'),
    noteUpdated: document.getElementById('noteUpdated'),
    asamField: document.getElementById('asamField'),
    assessmentTs: document.getElementById('assessmentTs'),
    matNeeds: document.getElementById('matNeeds'),
    facilitySearch: document.getElementById('facilitySearch'),
    clearSearch: document.getElementById('clearSearch'),
    filterAsam: document.getElementById('filterAsam'),
    filterAcuteBh: document.getElementById('filterAcuteBh'),
    filterAcuteMed: document.getElementById('filterAcuteMed'),
    filterDistance: document.getElementById('filterDistance'),
    matNeedsFilter: document.getElementById('filterMat'),
    matFilterWrap: document.getElementById('filterMat'),
    threeOhTwo: document.getElementById('threeOhTwo'),
    acuity: document.getElementById('acuity'),
    placementNeeded: document.getElementById('placementNeeded'),
    selectedFacility: document.getElementById('selectedFacility'),
    overrideReason: document.getElementById('overrideReason'),
    reassessFlag: document.getElementById('reassessFlag'),
    transferStatus: document.getElementById('transferStatus'),
    quickNotes: document.getElementById('quickNotes'),
    saveQuickUpdate: document.getElementById('saveQuickUpdate'),
    simulatePacket: document.getElementById('simulatePacket'),
    postTox: document.getElementById('postTox'),
    contactNext: document.getElementById('contactNext'),
    contactLast: document.getElementById('contactLast'),
    logCallAttempt: document.getElementById('logCallAttempt'),
    markPacketSent: document.getElementById('markPacketSent'),
    scanConsent: document.getElementById('scanConsent'),
    filterMat: document.getElementById('filterMat'),
    filter302: document.getElementById('filter302'),
    filterPayer: document.getElementById('filterPayer'),
    hideStale: document.getElementById('hideStale'),
    showBlocks: document.getElementById('showBlocks'),
    results: document.getElementById('results'),
    taskList: document.getElementById('taskList'),
    handoffSummary: document.getElementById('handoffSummary'),
    sendHandoff: document.getElementById('sendHandoff'),
    activityLog: document.getElementById('activityLog'),
    activityForm: document.getElementById('activityForm'),
    clearActivity: document.getElementById('clearActivity'),
    activityAction: document.getElementById('activityAction'),
    activityOutcome: document.getElementById('activityOutcome'),
    activityNotes: document.getElementById('activityNotes'),
    timelineList: document.getElementById('timelineList'),
    advanceTimeline: document.getElementById('advanceTimeline'),
    resetTimeline: document.getElementById('resetTimeline'),
    openDirectory: document.getElementById('openDirectory'),
    exportAudit: document.getElementById('exportAudit'),
    auditList: document.getElementById('auditList'),
    patientList: document.getElementById('patientList'),
    patientListBody: document.getElementById('patientListBody'),
    toast: document.getElementById('toast'),
    storyboard: document.getElementById('storyboard'),
    dismissBanner: document.getElementById('dismissBanner'),
    facilityModal: document.getElementById('facilityModal'),
    facilityModalTitle: document.getElementById('facilityModalTitle'),
    facilityModalBody: document.getElementById('facilityModalBody'),
    facilityAlternatives: document.getElementById('facilityAlternatives'),
    facilityPrimaryAction: document.getElementById('facilityPrimaryAction'),
    facilitySecondaryAction: document.getElementById('facilitySecondaryAction'),
    facilityOverrideAction: document.getElementById('facilityOverrideAction'),
    closeFacilityModal: document.getElementById('closeFacilityModal'),
    facilityDetailsModal: document.getElementById('facilityDetailsModal'),
    closeFacilityDetails: document.getElementById('closeFacilityDetails'),
    facilityDetailsBody: document.getElementById('facilityDetailsBody'),
    detailsSelect: document.getElementById('detailsSelect'),
    detailsCall: document.getElementById('detailsCall'),
    packetModal: document.getElementById('packetModal'),
    closePacket: document.getElementById('closePacket'),
    packetPreview: document.getElementById('packetPreview'),
    packetFinalize: document.getElementById('packetFinalize'),
    packetPrint: document.getElementById('packetPrint'),
    breakGlassModal: document.getElementById('breakGlassModal'),
    closeBreakGlass: document.getElementById('closeBreakGlass'),
    breakGlassForm: document.getElementById('breakGlassForm'),
    breakDuration: document.getElementById('breakDuration'),
    breakReason: document.getElementById('breakReason'),
    breakNotes: document.getElementById('breakNotes'),
    breakSupervisor: document.getElementById('breakSupervisor'),
    reassessModal: document.getElementById('reassessModal'),
    closeReassess: document.getElementById('closeReassess'),
    startReassess: document.getElementById('startReassess'),
    deferReassess: document.getElementById('deferReassess'),
    scanModal: document.getElementById('scanModal'),
    closeScan: document.getElementById('closeScan'),
    scanForm: document.getElementById('scanForm'),
    scanAct148: document.getElementById('scanAct148'),
    scanSUD: document.getElementById('scanSUD'),
    scanExpiry: document.getElementById('scanExpiry'),

    addSearchBtn: document.getElementById('addSearchBtn'),
    addMultipleSearchBtn: document.getElementById('addMultipleSearchBtn'),
    searchPopover: document.getElementById('searchPopover'),
    closeSearchPopover: document.getElementById('closeSearchPopover'),
    searchFacilitiesSelect: document.getElementById('searchFacilities'),
    searchFacilityChips: document.getElementById('searchFacilityChips'),
    searchAddOther: document.getElementById('searchAddOther'),
    searchTakes302: document.getElementById('searchTakes302'),
    searchAcuteMed: document.getElementById('searchAcuteMed'),
    searchAcuteBh: document.getElementById('searchAcuteBh'),
    searchSecureBh: document.getElementById('searchSecureBh'),
    searchDualDx: document.getElementById('searchDualDx'),
    searchBhMed: document.getElementById('searchBhMed'),
    searchInNetwork: document.getElementById('searchInNetwork'),
    searchChannelFax: document.getElementById('searchChannelFax'),
    searchChannelDirect: document.getElementById('searchChannelDirect'),
    searchChannelEmr: document.getElementById('searchChannelEmr'),
    searchNotesField: document.getElementById('searchNotes'),
    searchAudit: document.getElementById('searchAudit'),
    searchVerify: document.getElementById('searchVerify'),
    searchPublish: document.getElementById('searchPublish'),
    searchCancel: document.getElementById('searchCancel'),
    searchResults: document.getElementById('searchResults'),
    searchList: document.getElementById('searchList'),
    searchHistory: document.getElementById('searchHistory'),
    acceptanceModal: document.getElementById('acceptanceModal'),
    closeAcceptanceModal: document.getElementById('closeAcceptanceModal'),
    acceptanceForm: document.getElementById('acceptanceForm'),
    acceptFacilityName: document.getElementById('acceptFacilityName'),
    acceptUnit: document.getElementById('acceptUnit'),
    acceptBedHold: document.getElementById('acceptBedHold'),
    acceptClinician: document.getElementById('acceptClinician'),
    acceptClinicianRole: document.getElementById('acceptClinicianRole'),
    acceptClinicianNpi: document.getElementById('acceptClinicianNpi'),
    acceptRep: document.getElementById('acceptRep'),
    acceptRepRole: document.getElementById('acceptRepRole'),
    acceptRepPhone: document.getElementById('acceptRepPhone'),
    acceptReference: document.getElementById('acceptReference'),
    acceptTransportMode: document.getElementById('acceptTransportMode'),
    acceptTransportVendor: document.getElementById('acceptTransportVendor'),
    acceptPickupTs: document.getElementById('acceptPickupTs'),
    acceptDestination: document.getElementById('acceptDestination'),
    acceptEta: document.getElementById('acceptEta'),
    acceptTransportNotes: document.getElementById('acceptTransportNotes'),
    acceptAttachment: document.getElementById('acceptAttachment'),
    acceptCancelOthers: document.getElementById('acceptCancelOthers'),
    openDowntime: document.getElementById('openDowntime')
  };

  const searchState = {
    facilities: [],
    overrides: {
      takes302: false,
      acuteMed: false,
      acuteBh: false,
      secureBh: false,
      dualDx: false,
      bhMedInit: false,
      inNetwork: false,
    },
    channels: {
      fax: true,
      direct: false,
      emr: false,
    },
    notes: '',
    results: [],
    lastRun: null,
  };

  const state = {
    patient: null,
    selectedFacility: null,
    facilityStatus: null,
    facilityEvaluation: null,
    overrideUsed: false,
    breakGlassGranted: false,
    toastTimer: null,
    facilityCandidate: null,
    searchTerm: '',
    activeSearchId: null,
  };

  let activeAcceptanceRecord = null;

  function ensureSearchArrays(patient) {
    if (!patient.searches) patient.searches = [];
    if (!patient.searchHistory) patient.searchHistory = [];
  }

  function formatTimestamp(date) {
    const d = date instanceof Date ? date : new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${month}/${day} ${hours}:${minutes}`;
  }


  function openSearchPopover() {
    elements.searchPopover.classList.remove('hidden');
    updateSearchAudit();
    renderSearchChips();
  }

  function closeSearchPopover() {
    elements.searchPopover.classList.add('hidden');
  }

  function createEpicModal({ title = '', size = 'medium', showClose = false } = {}) {
    const overlay = document.createElement('div');
    overlay.className = 'epic-modal dynamic-epic-modal show';

    const content = document.createElement('div');
    content.className = 'epic-modal-content';
    if (size === 'large') {
      content.classList.add('epic-modal-lg');
    } else if (size === 'small') {
      content.classList.add('epic-modal-sm');
    }

    const header = document.createElement('div');
    header.className = 'epic-modal-header';

    const titleEl = document.createElement('h3');
    titleEl.className = 'epic-modal-title';
    titleEl.textContent = title;
    header.appendChild(titleEl);

    if (showClose) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'epic-modal-close';
      closeBtn.setAttribute('aria-label', 'Close modal');
      closeBtn.innerHTML = '&times;';
      closeBtn.addEventListener('click', () => close());
      header.appendChild(closeBtn);
    }

    const body = document.createElement('div');
    body.className = 'epic-modal-body';

    content.appendChild(header);
    content.appendChild(body);
    overlay.appendChild(content);
    document.body.appendChild(overlay);

    function close() {
      overlay.classList.remove('show');
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
      }, 200);
    }

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        close();
      }
    });

    return {
      overlay,
      container: content,
      header,
      body,
      close
    };
  }

  function openSettingsModal() {
    console.log('Opening Settings Modal...');
    
    // Create comprehensive settings modal based on settings.md requirements
    const modal = createEpicModal({
      title: '⚙️ EMR Layout & Preferences',
      size: 'large',
      showClose: true
    });

    const settingsContent = `
      <div class="settings-container">
        <div class="settings-nav">
          <button class="settings-tab active" data-tab="layout">🎨 Layout & Panels</button>
          <button class="settings-tab" data-tab="patientlist">📋 Patient List</button>
          <button class="settings-tab" data-tab="filters">🔍 Default Filters</button>
          <button class="settings-tab" data-tab="preferences">👤 User Preferences</button>
          <button class="settings-tab" data-tab="export">💾 Data Management</button>
        </div>
        
        <div class="settings-content">
          <!-- Layout & Panels Tab -->
          <div class="settings-panel active" id="layout-panel">
            <h3>Panel Visibility & Layout</h3>
            <div class="panel-controls">
              <div class="panel-group">
                <h4>Main Content Panels</h4>
                <label class="panel-toggle">
                  <input type="checkbox" data-panel="runningNote" checked> 
                  <span>CRC Unit Running Note (SSOT)</span>
                </label>
                <label class="panel-toggle">
                  <input type="checkbox" data-panel="activeSearches" checked> 
                  <span>Active Placement Searches</span>
                </label>
                <label class="panel-toggle">
                  <input type="checkbox" data-panel="contactPlanner" checked> 
                  <span>Contact Planner</span>
                </label>
              </div>
              
              <div class="panel-group">
                <h4>Right Column Panels</h4>
                <label class="panel-toggle">
                  <input type="checkbox" data-panel="workflowTimeline" checked> 
                  <span>Workflow Timeline</span>
                </label>
                <label class="panel-toggle">
                  <input type="checkbox" data-panel="patientList" checked> 
                  <span>Patient List Preview</span>
                </label>
                <label class="panel-toggle">
                  <input type="checkbox" data-panel="directorySteward" checked> 
                  <span>Directory Steward Console</span>
                </label>
                <label class="panel-toggle">
                  <input type="checkbox" data-panel="auditPrivacy" checked> 
                  <span>Audit & Privacy Review</span>
                </label>
              </div>
              
              <div class="panel-group">
                <h4>Layout Presets</h4>
                <div class="preset-buttons">
                  <button class="preset-btn" data-preset="default">📄 Default</button>
                  <button class="preset-btn" data-preset="quickPlacement">⚡ Quick Placement</button>
                  <button class="preset-btn" data-preset="supervisor">👥 Supervisor</button>
                  <button class="preset-btn" data-preset="transport">🚐 Transport Ops</button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Patient List Tab -->
          <div class="settings-panel" id="patientlist-panel">
            <h3>Patient List Configuration</h3>
            <div class="patientlist-config">
              <div class="config-group">
                <h4>Visible Columns</h4>
                <label class="column-toggle">
                  <input type="checkbox" data-column="patient" checked disabled> 
                  <span>Patient Name (Required)</span>
                </label>
                <label class="column-toggle">
                  <input type="checkbox" data-column="placement" checked> 
                  <span>Placement/ASAM</span>
                </label>
                <label class="column-toggle">
                  <input type="checkbox" data-column="mat" checked> 
                  <span>MAT Needs</span>
                </label>
                <label class="column-toggle">
                  <input type="checkbox" data-column="status" checked> 
                  <span>Status</span>
                </label>
                <label class="column-toggle">
                  <input type="checkbox" data-column="transport" checked> 
                  <span>Transport</span>
                </label>
                <label class="column-toggle">
                  <input type="checkbox" data-column="assigned" checked> 
                  <span>Assigned To</span>
                </label>
                <label class="column-toggle">
                  <input type="checkbox" data-column="lastupdate" checked> 
                  <span>Last Update</span>
                </label>
                <label class="column-toggle">
                  <input type="checkbox" data-column="reassess" checked> 
                  <span>Reassess Flag</span>
                </label>
              </div>
              
              <div class="config-group">
                <h4>Display Options</h4>
                <label class="setting-option">
                  <input type="radio" name="listMode" value="compact" checked> 
                  <span>Compact View</span>
                </label>
                <label class="setting-option">
                  <input type="radio" name="listMode" value="detailed"> 
                  <span>Detailed View</span>
                </label>
                <label class="setting-option">
                  <input type="checkbox" data-setting="autoRefresh" checked> 
                  <span>Auto-refresh every 30 seconds</span>
                </label>
                <label class="setting-option">
                  <input type="checkbox" data-setting="showStatusColors" checked> 
                  <span>Show status color coding</span>
                </label>
              </div>
            </div>
          </div>
          
          <!-- Default Filters Tab -->
          <div class="settings-panel" id="filters-panel">
            <h3>Default Filter Settings</h3>
            <div class="filter-config">
              <div class="config-group">
                <h4>Active Placement Searches</h4>
                <label class="filter-option">
                  <span>Default Status Filter:</span>
                  <select data-filter="searchStatus">
                    <option value="">All Statuses</option>
                    <option value="searching">Searching Only</option>
                    <option value="pending">Pending Review</option>
                    <option value="accepted">Accepted</option>
                  </select>
                </label>
                <label class="filter-option">
                  <input type="checkbox" data-filter="onlyAssigned"> 
                  <span>Show only searches assigned to me</span>
                </label>
                <label class="filter-option">
                  <input type="checkbox" data-filter="hideCompleted"> 
                  <span>Hide completed searches by default</span>
                </label>
              </div>
              
              <div class="config-group">
                <h4>Patient List Filters</h4>
                <label class="filter-option">
                  <span>Default Unit Filter:</span>
                  <select data-filter="unitFilter">
                    <option value="">All Units</option>
                    <option value="3.1">3.1 - Outpatient</option>
                    <option value="3.3">3.3 - Residential</option>
                    <option value="3.5">3.5 - Intensive</option>
                    <option value="3.7">3.7WM - Medically Monitored</option>
                  </select>
                </label>
                <label class="filter-option">
                  <input type="checkbox" data-filter="showReassessOnly"> 
                  <span>Highlight reassess flags</span>
                </label>
              </div>
            </div>
          </div>
          
          <!-- User Preferences Tab -->
          <div class="settings-panel" id="preferences-panel">
            <h3>Personal Preferences</h3>
            <div class="preferences-config">
              <div class="config-group">
                <h4>Notifications & Alerts</h4>
                <label class="pref-option">
                  <input type="checkbox" data-pref="toastNotifications" checked> 
                  <span>Show toast notifications</span>
                </label>
                <label class="pref-option">
                  <input type="checkbox" data-pref="soundAlerts"> 
                  <span>Enable sound alerts</span>
                </label>
                <label class="pref-option">
                  <input type="checkbox" data-pref="urgentPopups" checked> 
                  <span>Show urgent placement popups</span>
                </label>
              </div>
              
              <div class="config-group">
                <h4>Auto-Save & Timing</h4>
                <label class="pref-option">
                  <span>Auto-save interval:</span>
                  <select data-pref="autoSaveInterval">
                    <option value="15">15 seconds</option>
                    <option value="30" selected>30 seconds</option>
                    <option value="60">1 minute</option>
                    <option value="300">5 minutes</option>
                  </select>
                </label>
                <label class="pref-option">
                  <input type="checkbox" data-pref="sessionPersistence" checked> 
                  <span>Remember session across browser restarts</span>
                </label>
              </div>
              
              <div class="config-group">
                <h4>Role & Access</h4>
                <div class="role-info">
                  <p><strong>Current Role:</strong> CRC Tech</p>
                  <p><strong>Access Level:</strong> Standard User</p>
                  <p><strong>Can Edit:</strong> Own assignments, placement searches</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Data Management Tab -->
          <div class="settings-panel" id="export-panel">
            <h3>Data Management</h3>
            <div class="data-management">
              <div class="management-group">
                <h4>Current Session Data</h4>
                <div class="data-stats">
                  <p>📊 <strong>Active Searches:</strong> <span id="activeSearchCount">0</span></p>
                  <p>👥 <strong>Patients Tracked:</strong> <span id="patientCount">5</span></p>
                  <p>💾 <strong>Data Size:</strong> <span id="dataSize">--</span> KB</p>
                  <p>🕒 <strong>Last Saved:</strong> <span id="lastSaved">--</span></p>
                </div>
              </div>
              
              <div class="management-group">
                <h4>Export Options</h4>
                <div class="export-buttons">
                  <button class="epic-btn secondary" onclick="exportSearchData()">
                    📄 Export Search Data (CSV)
                  </button>
                  <button class="epic-btn secondary" onclick="exportPatientData()">
                    👥 Export Patient List (CSV)
                  </button>
                  <button class="epic-btn secondary" onclick="exportSettings()">
                    ⚙️ Export Settings (JSON)
                  </button>
                </div>
              </div>
              
              <div class="management-group">
                <h4>Data Maintenance</h4>
                <div class="maintenance-buttons">
                  <button class="epic-btn secondary" onclick="clearSearchHistory()">
                    🗑️ Clear Search History
                  </button>
                  <button class="epic-btn secondary" onclick="resetToDefaults()">
                    🔄 Reset All Settings
                  </button>
                  <button class="epic-btn danger" onclick="clearAllData()">
                    ⚠️ Clear All Local Data
                  </button>
                </div>
              </div>
              
              <div class="management-group">
                <h4>Documentation & Support</h4>
                <div class="support-links">
                  <a href="#" class="epic-link">📖 User Guide</a>
                  <a href="#" class="epic-link">🎥 Training Videos</a>
                  <a href="#" class="epic-link">📞 IT Support</a>
                  <a href="#" class="epic-link">🐛 Report Issue</a>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="settings-footer">
          <button class="epic-btn secondary" onclick="closeSettingsModal()">Cancel</button>
          <button class="epic-btn secondary" onclick="resetSettings()">Reset to Defaults</button>
          <button class="epic-btn primary" onclick="saveSettings()">💾 Save Settings</button>
        </div>
      </div>
    `;

    window.closeSettingsModal = () => {
      modal.close();
      window.closeSettingsModal = () => {};
    };

    modal.body.innerHTML = settingsContent;
    
    // Setup settings tab navigation
    setupSettingsTabs();
    
    // Load current settings values
    loadCurrentSettings();
    
    // Update data counts
    updateDataCounts();
    
    // Show toast notification
    showToast('⚙️ Settings panel opened', 'info');
  }

  function renderSearchChips() {
    const container = elements.searchFacilityChips;
    container.innerHTML = '';
    if (!searchState.facilities.length) {
      container.innerHTML = '<span class="hint">No facilities selected.</span>';
      return;
    }
    searchState.facilities.forEach((facilityId) => {
      const facility = facilities.find((f) => f.id === facilityId);
      const chip = document.createElement('div');
      chip.className = 'chip';
      const name = facility ? facility.name : `Facility ${facilityId}`;
      chip.innerHTML = `${name}<button data-id="${facilityId}">×</button>`;
      chip.querySelector('button').addEventListener('click', () => {
        searchState.facilities = searchState.facilities.filter((id) => id !== facilityId);
        setSelectedOptions(elements.searchFacilitiesSelect, searchState.facilities.map(String));
        collectSearchForm();
        renderSearchChips();
      });
      container.appendChild(chip);
    });
  }

  function updateSearchAudit() {
    const timestamp = formatTimestamp(new Date());
    const lastVerify = searchState.lastRun ? formatTimestamp(searchState.lastRun) : 'Not run';
    elements.searchAudit.textContent = `User: Morgan Lee · Time: ${timestamp} · BTG: ${state.breakGlassGranted ? 'Active' : 'Not required'} · Last verify: ${lastVerify}`;
  }

  // ============================================
  // Settings Support Functions
  // ============================================

  function setupSettingsTabs() {
    const tabs = document.querySelectorAll('.settings-tab');
    const panels = document.querySelectorAll('.settings-panel');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs and panels
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        
        // Add active class to clicked tab
        tab.classList.add('active');
        
        // Show corresponding panel
        const panelId = tab.dataset.tab + '-panel';
        const panel = document.getElementById(panelId);
        if (panel) {
          panel.classList.add('active');
        }
      });
    });
  }

  function loadCurrentSettings() {
    // Load settings from localStorage and populate form
    const settings = getSettings();
    
    // Panel visibility settings
    Object.keys(settings.panels || {}).forEach(panelKey => {
      const checkbox = document.querySelector(`[data-panel="${panelKey}"]`);
      if (checkbox) {
        checkbox.checked = settings.panels[panelKey].visible !== false;
      }
    });
    
    // Column visibility settings
    Object.keys(settings.patientList?.columns || {}).forEach(columnKey => {
      const checkbox = document.querySelector(`[data-column="${columnKey}"]`);
      if (checkbox) {
        checkbox.checked = settings.patientList.columns[columnKey] !== false;
      }
    });
    
    // Other settings
    const autoRefresh = document.querySelector('[data-setting="autoRefresh"]');
    if (autoRefresh) {
      autoRefresh.checked = settings.patientList?.autoRefresh !== false;
    }
    
    const showStatusColors = document.querySelector('[data-setting="showStatusColors"]');
    if (showStatusColors) {
      showStatusColors.checked = settings.patientList?.showStatusColors !== false;
    }
  }

  function updateDataCounts() {
    setTimeout(() => {
      const patient = getCurrentPatient();
      const searchCountEl = document.getElementById('activeSearchCount');
      const patientCountEl = document.getElementById('patientCount');
      const dataSizeEl = document.getElementById('dataSize');
      const lastSavedEl = document.getElementById('lastSaved');
      
      if (searchCountEl && patient?.searches) {
        searchCountEl.textContent = patient.searches.length;
      }
      
      if (patientCountEl) {
        patientCountEl.textContent = patients.length;
      }
      
      if (dataSizeEl) {
        const data = localStorage.getItem('crc_ssot_data');
        const sizeKB = data ? Math.round(data.length / 1024) : 0;
        dataSizeEl.textContent = sizeKB;
      }
      
      if (lastSavedEl) {
        const lastSaved = localStorage.getItem('crc_ssot_lastSaved');
        if (lastSaved) {
          lastSavedEl.textContent = new Date(lastSaved).toLocaleString();
        } else {
          lastSavedEl.textContent = 'Never';
        }
      }
    }, 100);
  }

  function getSettings() {
    const saved = localStorage.getItem('crc_ssot_settings');
    const defaultSettings = {
      version: 'v1',
      panels: {
        runningNote: { visible: true, collapsed: false, order: 1 },
        activeSearches: { visible: true, collapsed: false, order: 2 },
        contactPlanner: { visible: true, collapsed: true, order: 3 },
        workflowTimeline: { visible: true, collapsed: false, order: 1 },
        patientList: { visible: true, collapsed: false, order: 2 },
        directorySteward: { visible: true, collapsed: true, order: 3 },
        auditPrivacy: { visible: true, collapsed: true, order: 4 }
      },
      patientList: {
        columns: {
          patient: true,
          placement: true,
          mat: true,
          status: true,
          transport: true,
          assigned: true,
          lastupdate: true,
          reassess: true
        },
        autoRefresh: true,
        showStatusColors: true,
        compactMode: false
      },
      filters: {
        searchStatus: '',
        onlyAssigned: false,
        hideCompleted: false,
        unitFilter: '',
        showReassessOnly: false
      },
      preferences: {
        toastNotifications: true,
        soundAlerts: false,
        urgentPopups: true,
        autoSaveInterval: 30,
        sessionPersistence: true
      }
    };
    
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch (e) {
        console.warn('Invalid settings data, using defaults');
        return defaultSettings;
      }
    }
    
    return defaultSettings;
  }

  function saveSettings() {
    const settings = getSettings();
    
    // Collect panel settings
    document.querySelectorAll('[data-panel]').forEach(checkbox => {
      const panel = checkbox.dataset.panel;
      if (settings.panels[panel]) {
        settings.panels[panel].visible = checkbox.checked;
      }
    });
    
    // Collect column settings
    document.querySelectorAll('[data-column]').forEach(checkbox => {
      const column = checkbox.dataset.column;
      settings.patientList.columns[column] = checkbox.checked;
    });
    
    // Collect other settings
    const autoRefresh = document.querySelector('[data-setting="autoRefresh"]');
    if (autoRefresh) {
      settings.patientList.autoRefresh = autoRefresh.checked;
    }
    
    const showStatusColors = document.querySelector('[data-setting="showStatusColors"]');
    if (showStatusColors) {
      settings.patientList.showStatusColors = showStatusColors.checked;
    }
    
    // Save to localStorage
    localStorage.setItem('crc_ssot_settings', JSON.stringify(settings));
    localStorage.setItem('crc_ssot_lastSaved', new Date().toISOString());
    
    // Apply settings immediately
    applySettings(settings);
    
    // Close modal and show success
    closeSettingsModal();
    showToast('✅ Settings saved successfully', 'success');
    
    // Re-render patient list with new settings
    renderPatientList();
  }

  function applySettings(settings) {
    // Apply panel visibility
    Object.keys(settings.panels).forEach(panelKey => {
      const panel = settings.panels[panelKey];
      const element = document.querySelector(`[data-panel-id="${panelKey}"]`) || 
                     document.querySelector(`.${panelKey}-card`) ||
                     document.querySelector(`#${panelKey}`);
      
      if (element) {
        element.style.display = panel.visible ? 'block' : 'none';
      }
    });
    
    // Apply patient list column visibility
    Object.keys(settings.patientList.columns).forEach(columnKey => {
      const visible = settings.patientList.columns[columnKey];
      const headerCell = document.querySelector(`th.col-${columnKey}`);
      const dataCells = document.querySelectorAll(`td.col-${columnKey}`);
      
      if (headerCell) {
        headerCell.style.display = visible ? '' : 'none';
      }
      dataCells.forEach(cell => {
        cell.style.display = visible ? '' : 'none';
      });
    });
    
    // Apply other visual settings
    const table = document.querySelector('.patient-list-table');
    if (table) {
      table.classList.toggle('no-status-colors', !settings.patientList.showStatusColors);
    }
  }

  function resetSettings() {
    if (confirm('Reset all settings to defaults? This will reload the page.')) {
      localStorage.removeItem('crc_ssot_settings');
      location.reload();
    }
  }

  // Global functions for settings actions
  window.exportSearchData = function() {
    const patient = getCurrentPatient();
    if (!patient || !patient.searches?.length) {
      showToast('❌ No search data to export', 'error');
      return;
    }
    
    const csvData = [
      ['Facility', 'ASAM Level', 'Status', 'Created', 'Updated', 'Notes'],
      ...patient.searches.map(search => [
        search.facilityName || search.facility,
        search.asamLevel,
        search.status,
        search.createdAt,
        search.updatedAt,
        search.notes || ''
      ])
    ];
    
    const csv = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    downloadCSV(csv, `searches_${patient.name}_${new Date().toISOString().split('T')[0]}.csv`);
    showToast('📄 Search data exported', 'success');
  };

  window.exportPatientData = function() {
    const csvData = [
      ['Patient', 'Status', 'ASAM', 'MAT', 'Transport', 'Assigned', 'Last Update', 'Reassess'],
      ...patientListData.map(patient => [
        patient.patient,
        patient.status,
        patient.placement.asamLevel || patient.placement.facilityName,
        patient.mat,
        patient.transport.status,
        patient.assigned.name,
        patient.lastUpdate,
        patient.reassess ? 'Yes' : 'No'
      ])
    ];
    
    const csv = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    downloadCSV(csv, `patient_list_${new Date().toISOString().split('T')[0]}.csv`);
    showToast('👥 Patient data exported', 'success');
  };

  window.exportSettings = function() {
    const settings = getSettings();
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emr_settings_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('⚙️ Settings exported', 'success');
  };

  window.clearSearchHistory = function() {
    if (confirm('Clear all search history? This will remove all saved searches but keep current data.')) {
      patients.forEach(patient => {
        if (patient.searches) {
          patient.searches = [];
        }
      });
      savePatientData();
      renderSearchList();
      showToast('🗑️ Search history cleared', 'success');
    }
  };

  window.resetToDefaults = function() {
    resetSettings();
  };

  window.clearAllData = function() {
    if (confirm('⚠️ Clear ALL data including patients, searches, and settings? This cannot be undone and will reload the page.')) {
      localStorage.removeItem('crc_ssot_data');
      localStorage.removeItem('crc_ssot_settings');
      showToast('🗑️ All data cleared. Reloading...', 'info');
      setTimeout(() => location.reload(), 1500);
    }
  };

  function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
  function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.remove('hidden');
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => {
      elements.toast.classList.add('hidden');
    }, 4000);
  }

  function populateMatSelect(select, includeAny = false) {
    const options = matOptions.map((option) => {
      return `<option value="${option.value}">${option.label}</option>`;
    });
    select.innerHTML = includeAny ? `<option value="">Any</option>${options.join('')}` : options.join('');
  }

  function populateAsamSelect(select) {
    select.innerHTML = asamOptions.map((value) => `<option value="${value}">ASAM ${value}</option>`).join('');
  }

  function populatePayerFilter() {
    elements.filterPayer.innerHTML = ['<option value="">Any</option>', ...payerOptions.map((p) => `<option value="${p}">${p}</option>`)].join('');
  }

  function populateSearchFacilityOptions() {
    const options = facilities
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((facility) => `<option value="${facility.id}">${facility.name}</option>`);
    elements.searchFacilitiesSelect.innerHTML = options.join('');
    setSelectedOptions(elements.searchFacilitiesSelect, searchState.facilities.map(String));
  }

  function applyAcceptanceToPatient(patient, search, acceptance, cancelOthers) {
    patient.note.selectedFacilityId = search.facilityId;
    patient.note.facilityStatus = 'accepted';
    patient.note.lastUpdated = `${formatTimestamp(new Date())} by Morgan Lee`;
    elements.noteUpdated.textContent = patient.note.lastUpdated;
    patient.contact = patient.contact || {};
    patient.contact.next = `Coordinate transport to ${search.facilityName}`;
    patient.contact.last = `Acceptance recorded ${formatTimestamp(new Date())}`;
    patient.note.placementNeeded = 'Y';
    patient.note.transferStatus = 'accepted';
    patient.sde = patient.sde || {};
    patient.sde.placementStatus = 'Accepted';
    patient.sde.acceptedUnit = acceptance.unit;
    patient.sde.acceptedBedHoldUntil = acceptance.bedHold;
    patient.sde.acceptedByName = acceptance.clinician;
    patient.sde.acceptedByRole = acceptance.clinicianRole;
    patient.sde.transportMode = acceptance.transportMode;
    patient.sde.pickupTs = acceptance.pickupTs;
    patient.sde.destination = acceptance.destination;

    appendSearchHistory(search, 'Promoted to placement');

    if (cancelOthers) {
      patient.searches.forEach((item) => {
        if (item.id !== search.id && !['Denied', 'NoBeds', 'Canceled'].includes(item.status)) {
          updateSearchStatus(item, 'Canceled', 'Accepted elsewhere');
        }
      });
    }
  }

  function getSelectedOptions(select) {
    return Array.from(select.selectedOptions).map((option) => option.value);
  }

  function setSelectedOptions(select, values) {
    const valueSet = new Set(values);
    Array.from(select.options).forEach((option) => {
      option.selected = valueSet.has(option.value);
    });
  }

  function parseAsamLevel(value) {
    if (!value) return '';
    const match = value.match(/(\d\.\d)/);
    return match ? match[1] : '';
  }

  function renderPatientSelect() {
    elements.patientSelect.innerHTML = patients.map((patient) => `<option value="${patient.id}">${patient.label}</option>`).join('');
  }

  function renderPatientContext() {
    const { patient } = state;
    elements.patientName.textContent = patient.name;
    elements.patientMrn.textContent = patient.mrn;
    elements.patientFin.textContent = patient.fin;
    const consentText = patient.consent.act148 ? `Act 148 consent (exp ${patient.consent.expiry || '—'})` : 'Consent not on file';
    elements.patientConsent.textContent = consentText;
    let part2Text = 'Restricted — Break-the-Glass required';
    if (patient.consent.part2) {
      part2Text = 'Accessible (consent on file)';
    } else if (state.breakGlassGranted) {
      part2Text = 'Accessible (Break-the-Glass session)';
    }
    elements.patientPart2.textContent = part2Text;
  }

  function renderNote() {
    const { patient } = state;
    elements.noteUpdated.textContent = patient.note.lastUpdated;
    elements.asamField.value = patient.note.asam;
    elements.assessmentTs.value = formatTimestamp(patient.note.assessmentTs);
    elements.matNeeds.value = patient.note.matNeeds;
    elements.threeOhTwo.value = patient.note.requires302 ? '302Required' : '';
    elements.acuity.value = patient.note.medicalAcuity;
    elements.placementNeeded.value = patient.note.placementNeeded;
    elements.selectedFacility.value = patient.note.selectedFacilityId ? lookupFacilityName(patient.note.selectedFacilityId) : '';
    elements.overrideReason.value = patient.note.override.reason;
    elements.reassessFlag.value = patient.note.reassessFlag;
    elements.transferStatus.value = patient.note.transferStatus;
    elements.quickNotes.value = '';
    elements.contactNext.textContent = patient.contact.next;
    elements.contactLast.textContent = patient.contact.last;
    elements.handoffSummary.textContent = patient.handoff;
    toggleStoryboard(patient.note.reassessFlag === 'Y');
    updateFinalizeAvailability();
  }

  function renderTasks() {
    elements.taskList.innerHTML = '';
    const tasks = [...state.patient.tasks, ...state.patient.placementPoolTasks];
    if (!tasks.length) {
      elements.taskList.innerHTML = '<li class="task-item">No open tasks</li>';
      return;
    }
    tasks.forEach((task) => {
      const li = document.createElement('li');
      li.className = 'task-item';
      const badge = document.createElement('span');
      badge.className = `task-badge ${task.badge === 'warn' ? 'warn' : 'info'}`;
      badge.textContent = task.owner;
      const text = document.createElement('div');
      text.textContent = task.text;
      li.appendChild(badge);
      li.appendChild(text);
      if (task.due) {
        const due = document.createElement('div');
        due.className = 'activity-meta';
        due.textContent = `Due ${task.due}`;
        li.appendChild(due);
      }
      elements.taskList.appendChild(li);
    });
  }

  function renderTimeline() {
    const { patient } = state;
    elements.timelineList.innerHTML = '';
    patient.timeline.forEach((step, idx) => {
      const li = document.createElement('li');
      li.textContent = step;
      if (idx === patient.timelineIndex) {
        li.classList.add('active');
      }
      elements.timelineList.appendChild(li);
    });
  }

  function renderActivity() {
    elements.activityLog.innerHTML = '';
    if (!state.patient.activities.length) {
      elements.activityLog.innerHTML = '<div class="activity-entry">No logged activity yet.</div>';
      return;
    }
    state.patient.activities.forEach((entry) => {
      const block = document.createElement('div');
      block.className = 'activity-entry';
      block.innerHTML = `<strong>${entry.action}</strong> — ${entry.outcome}<div class="activity-meta">${entry.timestamp} • ${entry.notes || 'No additional notes'}</div>`;
      elements.activityLog.appendChild(block);
    });
  }

  function renderAudit() {
    elements.auditList.innerHTML = '';
    if (!state.patient.audit.length) {
      elements.auditList.innerHTML = '<li>No recent overrides or break-glass events.</li>';
      return;
    }
    state.patient.audit.slice(-5).forEach((entry) => {
      const li = document.createElement('li');
      li.textContent = `${entry.timestamp} — ${entry.type}: ${entry.detail}`;
      elements.auditList.appendChild(li);
    });
  }

  function renderPatientTable() {
    elements.patientList.innerHTML = '';
    patients.forEach((patient) => {
      const row = document.createElement('tr');
      if (patient.id === state.patient.id) {
        row.style.background = 'rgba(44,91,224,0.08)';
      }
      const facilityName = patient.note.selectedFacilityId ? lookupFacilityName(patient.note.selectedFacilityId) : '—';
      const reassessClass = patient.note.reassessFlag === 'Y' ? 'status-warn' : 'status-no';
      const placementClass = patient.note.placementNeeded === 'Y' ? 'status-yes' : 'status-no';
      row.innerHTML = `
        <td>${patient.name}</td>
        <td class="status-pill ${placementClass}">${patient.note.placementNeeded === 'Y' ? 'Yes' : 'No'}</td>
        <td>${matLabel(patient.note.matNeeds)}</td>
        <td>${facilityName}</td>
        <td>${patient.note.lastUpdated.split(' by ')[0]}</td>
        <td class="status-pill ${reassessClass}">${patient.note.reassessFlag === 'Y' ? 'Yes' : 'No'}</td>
      `;
      elements.patientList.appendChild(row);
    });
  }

  function matLabel(value) {
    if (value === 'None' || !value) return 'No MAT need';
    const option = matOptions.find((opt) => opt.value === value);
    return option ? option.label : value;
  }

  function createSearchRecord({ facilityId, status = 'Searching', channels, notes }) {
    const timestamp = formatTimestamp(new Date());
    const facility = facilities.find((f) => f.id === facilityId);
    return {
      id: `srch-${facilityId}-${Date.now()}`,
      facilityId,
      facilityName: facility ? facility.name : `Facility ${facilityId}`,
      status,
      statusReason: '',
      channels,
      notes,
      createdTs: timestamp,
      updatedTs: timestamp,
      overrides: { ...searchState.overrides },
      history: [
        {
          ts: timestamp,
          message: `Created search${notes ? ` — ${notes}` : ''}`
        }
      ],
      acceptance: null,
      metadata: {}
    };
  }

  function lookupFacilityName(id) {
    const found = facilities.find((facility) => facility.id === id);
    return found ? found.name : '';
  }

  function toggleStoryboard(show) {
    elements.storyboard.classList.toggle('hidden', !show);
  }

  function updateFinalizeAvailability() {
    const ready = canFinalize();
    elements.finalizeButton.disabled = !ready;
    elements.packetFinalize.disabled = !ready;
  }

  function canFinalize() {
    const patient = state.patient;
    const hasFacility = Boolean(patient.note.selectedFacilityId);
    const okStatus = patient.note.facilityStatus === 'confirm' || (patient.note.facilityStatus === 'block' && patient.note.override.used) || patient.note.facilityStatus === 'warn';
    const reassessClear = patient.note.reassessFlag !== 'Y';
    return hasFacility && okStatus && reassessClear;
  }

  function evaluateFacility(facility, patient) {
    const result = {
      status: 'confirm',
      summary: 'Meets patient requirements.',
      warnings: [],
      blocks: [],
      score: facility.score,
      alternatives: []
    };

    if (patient.note.matNeeds && patient.note.matNeeds !== 'None' && !facility.matSupports.includes(patient.note.matNeeds)) {
      result.status = 'block';
      result.blocks.push(`${facility.name} does not support ${matLabel(patient.note.matNeeds)}.`);
    }
    if (patient.note.requires302 && !facility.takes302) {
      result.status = 'block';
      result.blocks.push('Facility does not accept patients on an active 302 hold.');
    }
    if (facility.requiresMedsOnHand && !patient.medsOnPerson) {
      if (result.status !== 'block') result.status = 'warn';
      result.warnings.push('Facility expects patient to arrive with methadone dose or card in hand.');
      result.summary = 'Verify methadone documentation before finalizing transfer.';
      result.score -= 6;
    }
    if (facility.daysStale > 30) {
      if (result.status !== 'block') result.status = 'warn';
      result.warnings.push(`Verification stale (${facility.daysStale} days). Confirm details.`);
      result.score -= 8;
    } else if (facility.daysStale > 14) {
      if (result.status === 'confirm') {
        result.status = 'warn';
        result.summary = 'Verification older than 14 days.';
      }
      result.warnings.push(`Verification is ${facility.daysStale} days old.`);
      result.score -= 4;
    }
    if (patient.note.medicalAcuity === 'Secured' && !facility.secureDetox) {
      result.status = 'block';
      result.blocks.push('Secure detox capability required.');
    }
    if (patient.note.medicalAcuity === 'StepUp' && !facility.stepUp) {
      if (result.status !== 'block') {
        result.status = 'warn';
        result.warnings.push('Requires verification of step-up IV meds support.');
      }
    }
    if (patient.note.matNeeds === 'None' && facility.matSupports.includes('None')) {
      result.summary = 'Secure behavioral unit available.';
    }
    if (result.blocks.length) {
      result.summary = result.blocks.join(' ');
    } else if (result.warnings.length) {
      result.summary = result.summary !== 'Meets patient requirements.' ? result.summary : result.warnings[0];
    }

    result.alternatives = facilities
      .filter((candidate) => candidate.id !== facility.id)
      .filter((candidate) => evaluateFacilityBasic(candidate, patient) === 'confirm')
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((candidate) => ({ id: candidate.id, name: candidate.name, score: candidate.score }));

    return result;
  }

  function evaluateFacilityBasic(facility, patient) {
    if (patient.note.matNeeds && patient.note.matNeeds !== 'None' && !facility.matSupports.includes(patient.note.matNeeds)) return 'block';
    if (patient.note.requires302 && !facility.takes302) return 'block';
    if (patient.note.medicalAcuity === 'Secured' && !facility.secureDetox) return 'block';
    if (facility.requiresMedsOnHand && !patient.medsOnPerson) return 'warn';
    if (facility.daysStale > 30) return 'warn';
    if (facility.daysStale > 14) return 'warn';
    if (patient.note.medicalAcuity === 'StepUp' && !facility.stepUp) return 'warn';
    return 'confirm';
  }

  function renderFacilities() {
    const filtered = facilities
      .filter((facility) => {
        if (state.searchTerm && !facility.name.toLowerCase().includes(state.searchTerm) && !facility.city.toLowerCase().includes(state.searchTerm)) return false;
        if (elements.filterMat.value && !facility.matSupports.includes(elements.filterMat.value)) return false;
        if (elements.filter302.value === 'required' && !facility.takes302) return false;
        if (elements.filterAcuteBh.checked && !facility.acuteBh) return false;
        if (elements.filterAcuteMed.checked && !facility.acuteMed) return false;
        const selectedAsams = getSelectedOptions(elements.filterAsam);
        if (selectedAsams.length && !selectedAsams.some((level) => facility.asamLevels.includes(level))) return false;
        if (elements.filterPayer.value && !facility.payerPlans.includes(elements.filterPayer.value)) return false;
        if (elements.filterDistance.value) {
          const radius = Number(elements.filterDistance.value);
          if (!Number.isNaN(radius) && facility.distance && facility.distance > radius) return false;
        }
        if (elements.hideStale.checked && facility.daysStale > 30) return false;
        return true;
      })
      .map((facility) => {
        const evaluation = evaluateFacility(facility, state.patient);
        return { facility, evaluation };
      })
      .filter(({ evaluation }) => elements.showBlocks.checked || evaluation.status !== 'block')
      .sort((a, b) => b.evaluation.score - a.evaluation.score);

    elements.results.innerHTML = '';

    if (!filtered.length) {
      const empty = document.createElement('div');
      empty.className = 'card empty-state';
      empty.innerHTML = `
        <strong>No facilities match these filters.</strong>
        <p>Try removing high-intensity filters, toggle "Hide stale" off, or expand the search radius.</p>
        <div class="empty-actions">
          <button class="ghost-btn" id="resultsShowAlternatives">Show alternatives</button>
          <button class="ghost-btn" id="resultsSearchStatewide">Search statewide</button>
        </div>
      `;
      elements.results.appendChild(empty);
      const altBtn = document.getElementById('resultsShowAlternatives');
      const statewideBtn = document.getElementById('resultsSearchStatewide');
      altBtn?.addEventListener('click', () => {
        elements.hideStale.checked = false;
        elements.showBlocks.checked = true;
        elements.filterDistance.value = '';
        renderFacilities();
      });
      statewideBtn?.addEventListener('click', () => {
        elements.filterDistance.value = '';
        elements.hideStale.checked = false;
        state.searchTerm = '';
        elements.facilitySearch.value = '';
        elements.clearSearch.disabled = true;
        showToast('Expanded search statewide (prototype action).');
        renderFacilities();
      });
      return;
    }

    filtered.forEach(({ facility, evaluation }) => {
      const card = document.createElement('article');
      card.className = 'result-card';
      card.innerHTML = templateFacilityCard(facility, evaluation);
      card.querySelectorAll('.result-action').forEach((button) => {
        const action = button.dataset.action;
        if (action === 'call') {
          button.addEventListener('click', () => logFacilityCall(facility));
        }
        if (action === 'packet') {
          button.addEventListener('click', () => logPacketDraft(facility));
        }
        if (action === 'select') {
          button.addEventListener('click', () => openFacilityModal(facility, evaluation));
        }
        if (action === 'more') {
          button.addEventListener('click', () => openFacilityDetails(facility, evaluation));
        }
      });
      elements.results.appendChild(card);
    });
  }

  function handleSearchInput() {
    state.searchTerm = elements.facilitySearch.value.trim().toLowerCase();
    elements.clearSearch.disabled = !state.searchTerm;
    renderFacilities();
  }

  function templateFacilityCard(facility, evaluation) {
    const scoreClass = evaluation.status === 'confirm' ? 'score-confirm' : evaluation.status === 'warn' ? 'score-warn' : 'score-block';
    const scoreLabel = `${evaluation.status.charAt(0).toUpperCase() + evaluation.status.slice(1)} • Match ${evaluation.score}`;
    const staleBadgeClass = facility.daysStale > 30 ? 'badge badge-stale-red' : facility.daysStale > 14 ? 'badge badge-stale-yellow' : 'badge';
    const staleBadge = `<span class="${staleBadgeClass}">Verified ${facility.daysStale}d ago</span>`;
    const badges = badgeSet(facility).map((badge) => `<span class="badge">${badge}</span>`).join('');
    const warnings = evaluation.warnings.length ? `<ul class="warning-list">${evaluation.warnings.map((warn) => `<li>${warn}</li>`).join('')}</ul>` : '';
    const highlights = facility.highlights?.length ? `<p class="highlights"><strong>Highlights:</strong> ${facility.highlights.join(' • ')}</p>` : '';
    const distanceValue = typeof facility.distance === 'number' ? facility.distance.toFixed(1) : null;
    const distanceText = distanceValue ? `${distanceValue} mi • ` : '';
    const bedText = facility.bed?.status ? `${facility.bed.status}` : 'Bed status unknown';
    const bedStamp = facility.bedUpdatedDate ? ` (updated ${formatTimestamp(facility.bedUpdatedDate)})` : '';
    return `
      <div class="result-header">
        <div>
          <h3>${facility.name}</h3>
          <p class="result-subtitle">${distanceText}${facility.city} • ${facility.phone}</p>
        </div>
        <span class="score-pill ${scoreClass}">${scoreLabel}</span>
      </div>
      <div class="badge-row">
        ${staleBadge}
        ${badges}
      </div>
      <p class="match-summary">${evaluation.summary}</p>
      <p class="highlights"><strong>Bed status:</strong> ${bedText}${bedStamp}</p>
      ${warnings}
      ${highlights}
      <div class="result-footer">
        <div class="verified-text">${formatVerifiedText(facility)}</div>
        <div class="result-actions">
          <button class="result-action" data-action="call">Call</button>
          <button class="result-action" data-action="packet">Send Packet</button>
          <button class="result-action primary" data-action="select">Select</button>
          <button class="result-action" data-action="more">More</button>
        </div>
      </div>
    `;
  }

  function formatVerifiedText(facility) {
    if (!facility.lastVerifiedDate) return 'Not yet verified';
    const verifier = facility.metadata?.verifiedBy ? facility.metadata.verifiedBy : 'unassigned';
    const method = facility.metadata?.method ? ` (${facility.metadata.method})` : '';
    return `Verified ${formatTimestamp(facility.lastVerifiedDate)} by ${verifier}${method}`;
  }

  function badgeSet(facility) {
    const badges = [];
    facility.asamLevels.forEach((level) => badges.push(`ASAM ${level}`));
    const hasMethContinue = facility.matSupports.includes('MethadoneContinue');
    const hasMethInduct = facility.matSupports.includes('MethadoneInduction');
    const hasSuboxoneContinue = facility.matSupports.includes('SuboxoneContinue');
    const hasSuboxoneInduction = facility.matSupports.includes('SuboxoneInduction');
    badges.push(`Methadone cont: ${hasMethContinue ? '✓' : '✗'}`);
    badges.push(`Methadone induct: ${hasMethInduct ? '✓' : '✗'}`);
    badges.push(`Suboxone cont: ${hasSuboxoneContinue ? '✓' : '✗'}`);
    badges.push(`Suboxone induct: ${hasSuboxoneInduction ? '✓' : '✗'}`);
    badges.push(`Acute BH: ${facility.acuteBh ? '✓' : '✗'}`);
    badges.push(`Acute med: ${facility.acuteMed ? '✓' : '✗'}`);
    badges.push(`302: ${facility.takes302 ? '✓' : '✗'}`);
    badges.push(`Dual dx: ${facility.dualDx ? '✓' : '✗'}`);
    if (facility.bhMedInit) badges.push('BH med init: ✓');
    if (facility.requiresMedsOnHand) badges.push('Meds-on-hand required');
    badges.push(`Payers: ${facility.payerPlans.join(', ')}`);
    return badges;
  }

  function logFacilityCall(facility) {
    const detail = `Called ${facility.name} (${facility.phone})`;
    addActivity('Call facility', 'Attempted', detail);
    state.patient.contact.last = `${formatTimestamp(new Date())} — ${detail}`;
    state.patient.contact.next = `Awaiting call-back from ${facility.name}`;
    elements.contactLast.textContent = state.patient.contact.last;
    elements.contactNext.textContent = state.patient.contact.next;
    showToast(`Dialing ${facility.phone} for ${facility.name}...`);
  }

  function logPacketDraft(facility) {
    addActivity('Send packet', 'Draft opened', `Packet drafted for ${facility.name}.`);
    state.patient.contact.next = `Awaiting response from ${facility.name}`;
    elements.contactNext.textContent = state.patient.contact.next;
    showToast(`Packet builder opened for ${facility.name}.`);
  }

  function openFacilityDetails(facility, evaluation) {
    state.facilityCandidate = { facility, evaluation };
    elements.facilityDetailsTitle.textContent = facility.name;
    // Transport cell click
    const transportCell = row.querySelector('.transport-status');
    if (transportCell) {
      transportCell.addEventListener('click', (e) => {
        e.stopPropagation();
        handleTransportClick(patient);
      });
    }

    // Assigned staff click
    const assignedCell = row.querySelector('.assigned-staff');
    if (assignedCell) {
      assignedCell.addEventListener('click', (e) => {
        e.stopPropagation();
        handleAssignedClick(patient);
      });
    }

    // Row keyboard navigation
    row.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        handlePatientRowEnter(patient);
      } else if (e.key === 't' || e.key === 'T') {
        handleTransportClick(patient);
      }
    });
  }

  function handlePlacementClick(patient) {
    if (patient.placement.type === 'placed') {
      // Show acceptance summary
      showAcceptanceSummary(patient);
    } else {
      // Open Finder modal pre-filtered
      openFinderForPatient(patient);
    }
  }

  function handleStatusClick(patient) {
    // Open search list for this patient
    showPatientSearches(patient.id);
  }

  function handleTransportClick(patient) {
    // Open transport planning modal
    showTransportModal(patient);
  }

  function handleAssignedClick(patient) {
    // Show staff assignment popover
    showStaffAssignmentMenu(patient);
  }

  function handlePatientRowEnter(patient) {
    // Open quick patient summary
    showPatientSummary(patient);
  }

  function setupPatientListFilters() {
    // Filter chips
    const filterChips = document.querySelectorAll('.filter-chip');
    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        applyPatientListFilter(chip.dataset.filter);
      });
    });

    // Status filter dropdown
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
      statusFilter.addEventListener('change', () => {
        applyPatientListFilter('status', statusFilter.value);
      });
    }

    // Assigned filter dropdown
    const assignedFilter = document.getElementById('assignedFilter');
    if (assignedFilter) {
      assignedFilter.addEventListener('change', () => {
        applyPatientListFilter('assigned', assignedFilter.value);
      });
    }
  }

  function applyPatientListFilter(filterType, filterValue = null) {
    // Use dynamic data instead of static array
    const baseData = generatePatientListData();
    let filteredData = [...baseData];

    switch (filterType) {
      case 'placed':
        filteredData = filteredData.filter(p => p.placement && p.placement.type === 'placed');
        break;
      case 'transport':
        filteredData = filteredData.filter(p => 
          p.transport && (p.transport.status === 'waiting' || p.transport.status === 'scheduled')
        );
        break;
      case 'status':
        if (filterValue) {
          filteredData = filteredData.filter(p => p.status === filterValue);
        }
        break;
      case 'assigned':
        if (filterValue === 'unassigned') {
          filteredData = filteredData.filter(p => !p.assigned || !p.assigned.name);
        } else if (filterValue) {
          filteredData = filteredData.filter(p => p.assigned && p.assigned.id === filterValue);
        }
        break;
    }

    renderPatientList(filteredData);
  }

  // Placeholder functions for modal interactions
  function showAcceptanceSummary(patient) {
    console.log('Show acceptance summary for:', patient.patient);
    // TODO: Implement acceptance summary modal
  }

  function openFinderForPatient(patient) {
    console.log('Open finder for patient:', patient.patient);
    // TODO: Pre-filter finder by patient's ASAM/MAT needs
  }

  function showPatientSearches(patientId) {
    console.log('Show searches for patient:', patientId);
    // TODO: Filter search list by patient
  }

  function showTransportModal(patient) {
    console.log('Show transport modal for:', patient.patient);
    // TODO: Implement transport planning modal
  }

  function showStaffAssignmentMenu(patient) {
    console.log('Show staff assignment for:', patient.patient);
    // TODO: Implement staff assignment dropdown
  }

  function showPatientSummary(patient) {
    console.log('Show summary for:', patient.patient);
    // TODO: Implement quick patient summary modal
  }

  function initPatientList() {
    // Add patient list body element reference
    elements.patientListBody = document.getElementById('patientListBody');
    
    // Setup filters
    setupPatientListFilters();
    
    // Initial render with dynamic data
    const currentPatientData = generatePatientListData();
    renderPatientList(currentPatientData);
  }

  // ============================================
  // Search List Filtering Functions
  // ============================================

  let searchListFilters = {
    status: '',
    facility: '',
    channel: '',
    timeframe: ''
  };

  function setupSearchListFilters() {
    // Filter chips
    const searchFilterChips = document.querySelectorAll('.search-list-filters .filter-chip');
    searchFilterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        searchFilterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        applySearchListFilter(chip.dataset.filter);
      });
    });

    // Time filter dropdown
    const searchTimeFilter = document.getElementById('searchTimeFilter');
    if (searchTimeFilter) {
      searchTimeFilter.addEventListener('change', () => {
        searchListFilters.timeframe = searchTimeFilter.value;
        renderFilteredSearchList();
      });
    }

    // Status filter dropdown
    const searchStatusFilter = document.getElementById('searchStatusFilter');
    if (searchStatusFilter) {
      searchStatusFilter.addEventListener('change', () => {
        searchListFilters.status = searchStatusFilter.value;
        renderFilteredSearchList();
      });
    }

    // Facility filter dropdown
    const searchFacilityFilter = document.getElementById('searchFacilityFilter');
    if (searchFacilityFilter) {
      searchFacilityFilter.addEventListener('change', () => {
        searchListFilters.facility = searchFacilityFilter.value;
        renderFilteredSearchList();
      });
    }

    // Channel filter dropdown
    const searchChannelFilter = document.getElementById('searchChannelFilter');
    if (searchChannelFilter) {
      searchChannelFilter.addEventListener('change', () => {
        searchListFilters.channel = searchChannelFilter.value;
        renderFilteredSearchList();
      });
    }
  }

  function applySearchListFilter(filterType) {
    // Reset specific filters when using chips
    searchListFilters = { status: '', facility: '', channel: '', timeframe: '' };
    
    switch (filterType) {
      case 'pending':
        searchListFilters.status = 'pending';
        break;
      case 'accepted':
        searchListFilters.status = 'accepted';
        break;
      case 'denied':
        searchListFilters.status = 'denied';
        break;
      case 'all':
      default:
        // No filters applied
        break;
    }

    // Update dropdown selections
    updateSearchFilterDropdowns();
    renderFilteredSearchList();
  }

  function updateSearchFilterDropdowns() {
    const timeFilter = document.getElementById('searchTimeFilter');
    const statusFilter = document.getElementById('searchStatusFilter');
    const facilityFilter = document.getElementById('searchFacilityFilter');
    const channelFilter = document.getElementById('searchChannelFilter');

    if (timeFilter) timeFilter.value = searchListFilters.timeframe;
    if (statusFilter) statusFilter.value = searchListFilters.status;
    if (facilityFilter) facilityFilter.value = searchListFilters.facility;
    if (channelFilter) channelFilter.value = searchListFilters.channel;
  }

  function isWithinTimeframe(dateString, timeframe) {
    if (!timeframe || !dateString) return true;
    
    const searchDate = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    switch (timeframe) {
      case 'today':
        return searchDate >= today;
      case 'yesterday':
        return searchDate >= yesterday && searchDate < today;
      case 'last3days':
        const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);
        return searchDate >= threeDaysAgo;
      case 'thisweek':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        return searchDate >= startOfWeek;
      case 'lastweek':
        const startOfLastWeek = new Date(today);
        startOfLastWeek.setDate(today.getDate() - today.getDay() - 7);
        const endOfLastWeek = new Date(today);
        endOfLastWeek.setDate(today.getDate() - today.getDay());
        return searchDate >= startOfLastWeek && searchDate < endOfLastWeek;
      case 'last30days':
        const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        return searchDate >= thirtyDaysAgo;
      default:
        return true;
    }
  }

  function normalizeStatus(value) {
    return (value || '').toString().toLowerCase();
  }

  function normalizeFacilityId(value) {
    return (value || '').toString().replace(/[^a-z0-9]/gi, '').toLowerCase();
  }

  function filterSearchList(searches) {
    return searches.filter(search => {
      // Time filter
      if (searchListFilters.timeframe && !isWithinTimeframe(search.createdTs, searchListFilters.timeframe)) {
        return false;
      }

      // Status filter
      const filterStatus = normalizeStatus(searchListFilters.status);
      if (filterStatus && normalizeStatus(search.status) !== filterStatus) {
        return false;
      }

      // Facility filter
      const filterFacility = normalizeFacilityId(searchListFilters.facility);
      if (filterFacility && normalizeFacilityId(search.facilityId || search.facilityName) !== filterFacility) {
        return false;
      }

      // Channel filter
      if (searchListFilters.channel) {
        const hasChannel = search.channels && search.channels[searchListFilters.channel];
        if (!hasChannel) return false;
      }

      return true;
    });
  }

  function renderFilteredSearchList() {
    if (!elements.searchList || !state.patient) return;
    ensureSearchArrays(state.patient);
    const searches = state.patient.searches;
    
    if (!searches.length) {
      elements.searchList.innerHTML = '<p class="hint">No active placement searches yet.</p>';
      return;
    }

    const filteredSearches = filterSearchList(searches);
    
    if (!filteredSearches.length) {
      elements.searchList.innerHTML = '<p class="hint">No searches match the current filters.</p>';
      return;
    }

    elements.searchList.innerHTML = filteredSearches
      .map((search) => {
        const config = statusConfig[search.status] || statusConfig.Searching;
        const channels = search.channels
          ? Object.entries(search.channels)
              .filter(([, enabled]) => enabled)
              .map(([key]) => channelLabels[key] || key)
              .join(', ')
          : 'Not set';
        const overrides = Object.entries(search.overrides || {})
          .filter(([, value]) => value)
          .map(([key]) => key)
          .join(', ');
        const overrideLine = overrides ? `<span>Overrides: ${overrides}</span>` : '';
        const notes = search.notes ? `<span>${search.notes}</span>` : '';
        const staleness = calculateStalenessBadge(search);
        const historyHint = search.history?.length ? search.history[search.history.length - 1].message : '';

        return `
          <div class="search-row ${config.rowClass}" data-search-id="${search.id}">
            <div class="search-actions-quick">
              <button class="btn-quick-edit" data-action="edit" title="Edit">✏️</button>
              <button class="btn-quick-details" data-action="details" title="View Details">🔍</button>
              <button class="btn-quick-delete" data-action="delete" title="Delete">🗑️</button>
            </div>
            <div class="search-header">
              <div class="search-facility">${search.facilityName}</div>
              <span class="${config.chipClass}">${config.icon} ${config.label}</span>
            </div>
            <div class="search-meta">
              <span>Updated: ${search.updatedTs}</span>
              <span>Channels: ${channels}</span>
              <span>Created by: ${search.createdBy || 'System'}</span>
              ${staleness}
            </div>
            ${notes || overrideLine || historyHint ? `
            <div class="search-notes">
              ${notes}
              ${overrideLine}
              ${historyHint ? `<span class="hint">${historyHint}</span>` : ''}
            </div>
            ` : ''}
            <div class="search-actions">
              <button class="btn ghost-btn search-edit" data-action="edit">✏️ Edit</button>
              <button class="btn ghost-btn search-delete" data-action="delete">🗑️ Delete</button>
              <button class="btn ghost-btn search-verify" data-action="verify">Verify</button>
              <button class="btn ghost-btn search-packet" data-action="packet">Send packet</button>
              <button class="btn primary-btn search-accept" data-action="accept">Record acceptance</button>
              <button class="btn ghost-btn search-deny" data-action="deny">Mark denied</button>
              <button class="btn ghost-btn search-nobeds" data-action="nobeds">No beds</button>
              <button class="btn ghost-btn search-cancel" data-action="cancel">Cancel</button>
            </div>
          </div>
        `;
      })
      .join('');

    // Add event listeners to the rendered search rows
    elements.searchList.querySelectorAll('.search-row').forEach((row) => {
      const id = row.dataset.searchId;
      
      // Quick action buttons
      row.querySelectorAll('.search-actions-quick button').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          handleQuickAction(id, btn.dataset.action);
        });
      });
      
      // Regular action buttons
      row.querySelectorAll('.search-actions button').forEach((btn) => {
        btn.addEventListener('click', () => handleSearchAction(id, btn.dataset.action));
      });
    });
  }

  function handleQuickAction(searchId, action) {
    const search = findSearchById(searchId);
    if (!search) return;

    switch (action) {
      case 'edit':
        if (typeof window.openEpicEditModal === 'function') {
          window.openEpicEditModal(searchId);
        }
        break;
      case 'details':
        if (typeof window.showSearchDetails === 'function') {
          window.showSearchDetails(searchId);
        }
        break;
      case 'delete':
        if (typeof window.deleteSearch === 'function') {
          window.deleteSearch(searchId);
        }
        break;
    }
  }

  function findSearchById(searchId) {
    return state.patient?.searches?.find(s => s.id === searchId);
  }

  function saveSearchEdit() {
    const modal = document.getElementById('editSearchModal');
    const searchId = modal.dataset.searchId;
    const search = findSearchById(searchId);
    
    if (!search) return;

    // Get form values
    const statusField = document.getElementById('editSearchStatus');
    const channelField = document.getElementById('editSearchChannel');
    const priorityField = document.getElementById('editSearchPriority');
    const notesField = document.getElementById('editSearchNotes');

    // Update search object
    search.status = statusField.value;
    search.priority = priorityField.value;
    search.notes = notesField.value;
    search.updatedTs = formatTimestamp(new Date());

    // Update channels if changed
    if (channelField.value) {
      search.channels = {
        fax: channelField.value === 'fax',
        direct: channelField.value === 'direct',
        emr: channelField.value === 'emr',
        phone: channelField.value === 'phone'
      };
    }

    // Add history entry
    search.history = search.history || [];
    search.history.push({
      ts: search.updatedTs,
      user: 'Morgan Lee',
      action: 'updated',
      message: `Status changed to ${statusConfig[search.status]?.label || search.status}`
    });

    // Close modal and refresh display
    modal.classList.add('hidden');
    renderFilteredSearchList();
    showToast('Search updated successfully.');
  }

  function setupEditSearchModal() {
    const modal = document.getElementById('editSearchModal');
    const closeBtn = document.getElementById('closeEditSearch');
    const cancelBtn = document.getElementById('cancelEditSearch');
    const form = document.getElementById('editSearchForm');

    closeBtn?.addEventListener('click', () => modal.classList.add('hidden'));
    cancelBtn?.addEventListener('click', () => modal.classList.add('hidden'));
    
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      saveSearchEdit();
    });

    // Close on outside click
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.add('hidden');
    });
  }

  function setupSearchDetailsModal() {
    const modal = document.getElementById('searchDetailsModal');
    const closeBtn = document.getElementById('closeSearchDetails');

    closeBtn?.addEventListener('click', () => modal.classList.add('hidden'));
    
    // Close on outside click
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.add('hidden');
    });
  }

  function initSearchListFilters() {
    setupSearchListFilters();
    setupEditSearchModal();
    setupSearchDetailsModal();
  }

  // ============================================
  // Search List Rendering Functions
  // ============================================

  function renderFilteredSearchList() {
    if (!elements.searchList || !state.patient) return;
    ensureSearchArrays(state.patient);
    const searches = state.patient.searches;
    
    if (!searches.length) {
      elements.searchList.innerHTML = '<p class="hint">No active placement searches yet.</p>';
      return;
    }

    const filteredSearches = filterSearchList(searches);
    
    if (!filteredSearches.length) {
      elements.searchList.innerHTML = '<p class="hint">No searches match the current filters.</p>';
      return;
    }

    elements.searchList.innerHTML = filteredSearches
      .map((search) => {
        const config = statusConfig[search.status] || statusConfig.Searching;
        const channels = search.channels
          ? Object.entries(search.channels)
              .filter(([, enabled]) => enabled)
              .map(([key]) => channelLabels[key] || key)
              .join(', ')
          : 'Not set';
        const overrides = Object.entries(search.overrides || {})
          .filter(([, value]) => value)
          .map(([key]) => key)
          .join(', ');
        const overrideLine = overrides ? `<span>Overrides: ${overrides}</span>` : '';
        const notes = search.notes ? `<span>${search.notes}</span>` : '';
        const staleness = calculateStalenessBadge(search);
        const historyHint = search.history?.length ? search.history[search.history.length - 1].message : '';

        return `
          <div class="search-row ${config.rowClass}" data-search-id="${search.id}">
            <div class="search-actions-quick">
              <button class="btn-quick-edit" data-action="edit" title="Edit">✏️</button>
              <button class="btn-quick-details" data-action="details" title="View Details">🔍</button>
              <button class="btn-quick-delete" data-action="delete" title="Delete">🗑️</button>
            </div>
            <div class="search-header">
              <div class="search-facility">${search.facilityName}</div>
              <span class="${config.chipClass}">${config.icon} ${config.label}</span>
            </div>
            <div class="search-meta">
              <span>Updated: ${search.updatedTs}</span>
              <span>Channels: ${channels}</span>
              <span>Created by: ${search.createdBy || 'System'}</span>
              ${staleness}
            </div>
            <div class="search-details">
              ${notes}
              ${overrideLine}
              ${historyHint ? `<div class="search-hint">${historyHint}</div>` : ''}
            </div>
          </div>
        `;
      })
      .join('');

    // Add event listeners to search rows
    setupSearchRowEvents();
  }

  function setupSearchRowEvents() {
    document.querySelectorAll('.search-row').forEach(row => {
      const searchId = row.dataset.searchId;
      
      row.querySelectorAll('.btn-quick-edit, .btn-quick-details, .btn-quick-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const action = btn.dataset.action;
          handleSearchAction(searchId, action);
        });
      });
    });
  }

  function handleSearchAction(searchId, action) {
    const patient = state.patient;
    if (!patient) return;
    ensureSearchArrays(patient);
    const search = patient.searches?.find((item) => item.id === searchId);
    if (!search) return;

    switch (action) {
      case 'edit':
        if (typeof window.openEpicEditModal === 'function') {
          window.openEpicEditModal(searchId);
        }
        return;
      case 'details':
        if (typeof window.showSearchDetails === 'function') {
          window.showSearchDetails(searchId);
        }
        return;
      case 'delete':
        if (typeof window.deleteSearch === 'function') {
          window.deleteSearch(searchId);
        }
        return;
      case 'verify': {
        const facility = facilities.find((f) => f.id === search.facilityId);
        if (facility) {
          const evaluation = evaluateFacility(facility, patient);
          openFacilityDetails(facility, evaluation);
        }
        return;
      }
      case 'packet':
        logPacketDraft({ id: search.facilityId, name: search.facilityName, phone: '' });
        appendSearchHistory(search, 'Packet queued');
        search.status = 'PacketSent';
        search.updatedTs = formatTimestamp(new Date());
        renderSearchList();
        return;
      case 'accept':
        activeAcceptanceRecord = search;
        populateAcceptanceModal(search);
        elements.acceptanceModal.classList.remove('hidden');
        return;
      case 'deny': {
        const reason = prompt('Enter denial reason:', search.statusReason || '');
        if (reason === null) return;
        const reapply = prompt('Can re-apply at (optional — YYYY-MM-DD HH:mm):', search.retryAt || '');
        updateSearchStatus(search, 'Denied', reason, { canReapplyAt: reapply || null });
        renderSearchHistory();
        return;
      }
      case 'nobeds': {
        const recheck = prompt('Recheck at (default +3h):', search.retryAt || '');
        updateSearchStatus(search, 'NoBeds', 'Reported no beds', { recheckAt: recheck || null });
        return;
      }
      case 'cancel': {
        const reason = prompt('Cancel reason?', 'Accepted elsewhere');
        if (reason === null) return;
        updateSearchStatus(search, 'Canceled', reason);
        renderSearchHistory();
        return;
      }
      default:
        return;
    }
  }

  function ensureSearchArrays(patient) {
    if (!patient.searches) {
      patient.searches = [];
    }
    if (!patient.searchHistory) {
      patient.searchHistory = [];
    }
  }

  // ============================================
  // Data Persistence Functions
  // ============================================

  function savePatientData() {
    try {
      const dataToSave = {
        patients: patients,
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem('crc_ssot_data', JSON.stringify(dataToSave));
      console.log('Patient data saved to localStorage');
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }

  function loadPatientData() {
    try {
      const savedData = localStorage.getItem('crc_ssot_data');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (parsedData.patients && Array.isArray(parsedData.patients)) {
          // Merge saved data with default patients data
          parsedData.patients.forEach((savedPatient, index) => {
            const defaultPatient = patients[index];
            if (defaultPatient && defaultPatient.id === savedPatient.id) {
              const savedSearches = Array.isArray(savedPatient.searches) ? savedPatient.searches : null;
              const savedHistory = Array.isArray(savedPatient.searchHistory) ? savedPatient.searchHistory : null;

              if (savedSearches && savedSearches.length) {
                defaultPatient.searches = savedSearches;
              }

              if (savedHistory && savedHistory.length) {
                defaultPatient.searchHistory = savedHistory;
              }

              defaultPatient.note = { ...defaultPatient.note, ...(savedPatient.note || {}) };

              if (Array.isArray(savedPatient.activities) && savedPatient.activities.length) {
                defaultPatient.activities = savedPatient.activities;
              }
            }
          });

          // Check if we have searches to display
          const hasVisibleSearches = patients.some(p => Array.isArray(p.searches) && p.searches.length);
          if (!hasVisibleSearches) {
            // Load seed data for searches
            patients.forEach((patient, index) => {
              const seed = seedPatients[index];
              if (!seed) return;
              patient.searches = Array.isArray(seed.searches) ? [...seed.searches] : [];
              patient.searchHistory = Array.isArray(seed.searchHistory) ? [...seed.searchHistory] : [];
            });
          }
          console.log('Patient data loaded from localStorage');
          return true;
        }
      }
      
      // If no saved data, ensure patients have search arrays and use default data
      patients.forEach((patient, index) => {
        if (!patient.searches) patient.searches = [];
        if (!patient.searchHistory) patient.searchHistory = [];
        
        // Use seed data if available
        const seed = seedPatients[index];
        if (seed) {
          if (!patient.searches.length && seed.searches) {
            patient.searches = [...seed.searches];
          }
          if (!patient.searchHistory.length && seed.searchHistory) {
            patient.searchHistory = [...seed.searchHistory];
          }
        }
      });
      console.log('Using default patient data with search history');
      
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
      // Ensure patients have search arrays even on error
      patients.forEach((patient, index) => {
        if (!patient.searches) patient.searches = [];
        if (!patient.searchHistory) patient.searchHistory = [];
        
        // Use seed data as fallback
        const seed = seedPatients[index];
        if (seed) {
          if (seed.searches) patient.searches = [...seed.searches];
          if (seed.searchHistory) patient.searchHistory = [...seed.searchHistory];
        }
      });
    }
    return false;
  }

  // Refresh both patient list and active searches
  function refreshDashboard() {
    // Refresh patient list with current data
    const currentPatientData = generatePatientListData();
    renderPatientList(currentPatientData);
    
    // Refresh active searches
    renderActiveSearches();
    
    console.log('Dashboard refreshed with', currentPatientData.length, 'patients');
  }

  function updateSearchAndSave(patientId, searchData) {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      ensureSearchArrays(patient);
      
      // Update or add search
      const existingIndex = patient.searches.findIndex(s => s.id === searchData.id);
      if (existingIndex >= 0) {
        patient.searches[existingIndex] = searchData;
      } else {
        patient.searches.push(searchData);
      }
      
      // Save to localStorage
      savePatientData();
      
      // Re-render search list
      if (state.patient && state.patient.id === patientId) {
        renderSearchList();
      }
      
      // Refresh active searches widget
      renderActiveSearches();
    }
  }

  function deleteSearchAndSave(patientId, searchId) {
    const patient = patients.find(p => p.id === patientId);
    if (patient && patient.searches) {
      patient.searches = patient.searches.filter(s => s.id !== searchId);
      savePatientData();
      
      // Re-render search list
      if (state.patient && state.patient.id === patientId) {
        renderSearchList();
      }
      
      // Refresh active searches widget
      renderActiveSearches();
    }
  }

  function init() {
    // Load persisted data first
    const dataLoaded = loadPatientData();
    
    populateMatSelect(elements.matNeeds);
    populateMatSelect(elements.filterMat, true);
    populatePayerFilter();
    populateSearchFacilityOptions();
    renderPatientSelect();
    setupEvents();
    loadPatient(patients[0].id);
    toggleTab('noteTab'); // Start with Running Note tab as requested
    
    // Initialize Patient List
    initPatientList();
    
    // Force initial render of patient list with fallback data
    setTimeout(() => {
      // Use dynamic data generation
      const currentPatientData = generatePatientListData();
      if (currentPatientData && currentPatientData.length > 0) {
        renderPatientList(currentPatientData);
        console.log('Patient List initialized with', currentPatientData.length, 'patients');
      } else {
        // Fallback to empty state display
        renderPatientList([]);
        console.log('Patient List initialized with empty state');
      }
      
      // Render active searches with data from patients
      renderActiveSearches();
    }, 200);
    
    // Initialize Search List Filters
    initSearchListFilters();
    
    // Initialize Epic EMR Modal Functions
    initEpicModal();
    
    // Auto-save data periodically
    setInterval(savePatientData, 30000); // Save every 30 seconds
    
    // Debug function - add to window for console access
    window.debugSearches = function() {
      const patient = getCurrentPatient();
      if (patient) {
        console.log('Current patient:', patient.id, patient.name);
        console.log('Searches:', patient.searches);
        console.log('Search count:', patient.searches?.length || 0);
        if (elements.searchList) {
          console.log('Search list element:', elements.searchList);
          console.log('Search list innerHTML:', elements.searchList.innerHTML);
        }
      }
    };
    
    // Test button functionality
    window.testButtons = function() {
      const activeBtn = document.getElementById('showActiveSearches');
      const settingsBtn = document.getElementById('openSettings');
      console.log('Active Searches Button:', activeBtn);
      console.log('Settings Button:', settingsBtn);
      showToast('🔧 Button test complete - check console for details', 'info');
    };
    
    // Force render search list on startup
    console.log('Initial render of search list...');
    setTimeout(() => {
      renderSearchList();
      window.debugSearches();
      window.testButtons();
      showToast('🚀 EMR Application loaded successfully', 'success');
    }, 100);
  }

  // Epic EMR Modal Functions
  function initEpicModal() {
    window.openEpicEditModal = function(searchId) {
      const modal = document.getElementById('epicEditModal');
      const patient = getCurrentPatient();
      ensureSearchArrays(patient);
      const search = patient.searches.find(s => s.id === searchId);
      
      if (search) {
        // Populate modal fields
        document.getElementById('epicSearchStatus').value = search.status || 'active';
        document.getElementById('epicSearchPriority').value = search.priority || 'medium';
        document.getElementById('epicSearchNotes').value = search.notes || '';
        document.getElementById('epicAssignedTo').value = search.assignedTo || 'morgan';
        
        // Store current search ID for saving
        modal.dataset.searchId = searchId;
        
        // Show modal with animation
        modal.classList.add('show');
      } else {
        console.error('Search not found:', searchId);
      }
    };

    window.closeEpicModal = function() {
      const modal = document.getElementById('epicEditModal');
      modal.classList.remove('show');
    };

    window.saveEpicChanges = function() {
      const modal = document.getElementById('epicEditModal');
      const searchId = modal.dataset.searchId;
      const patient = getCurrentPatient();
      
      if (patient && searchId) {
        ensureSearchArrays(patient);
        const search = patient.searches.find(s => s.id === searchId);
        if (search) {
          // Update search with new values
          search.status = document.getElementById('epicSearchStatus').value;
          search.priority = document.getElementById('epicSearchPriority').value;
          search.notes = document.getElementById('epicSearchNotes').value;
          search.assignedTo = document.getElementById('epicAssignedTo').value;
          search.updatedTs = formatTimestamp(new Date());
          search.modifiedBy = 'Morgan Lee';
          
          // Add to history
          if (!search.history) search.history = [];
          search.history.push({
            ts: formatTimestamp(new Date()),
            user: 'Morgan Lee',
            action: 'updated',
            message: `Status: ${search.status}, Priority: ${search.priority}`
          });
          
          // Save using persistence system
          updateSearchAndSave(patient.id, search);
          
          // Show success notification
          showToast(`✅ Search #${searchId} updated successfully`, 'success');
          
          // Close modal
          window.window.closeEpicModal();
        }
      }
    };

    // Close modal when clicking outside
    document.getElementById('epicEditModal').addEventListener('click', function(e) {
      if (e.target === this) {
        window.closeEpicModal();
      }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && document.getElementById('epicEditModal').classList.contains('show')) {
        window.closeEpicModal();
      }
    });

    // Add global functions for button interactions
    window.showSearchDetails = function(searchId) {
      const patient = getCurrentPatient();
      ensureSearchArrays(patient);
      const search = patient.searches.find(s => s.id === searchId);
      if (search) {
        const modal = document.getElementById('searchDetailsModal');
        const content = modal.querySelector('.search-details-content');
        
        content.innerHTML = `
          <div class="details-grid">
            <div class="detail-section">
              <h3>Search Information</h3>
              <p><strong>Facility:</strong> ${search.facilityName}</p>
              <p><strong>Status:</strong> ${search.status}</p>
              <p><strong>Created:</strong> ${search.createdTs || 'Unknown'}</p>
              <p><strong>Updated:</strong> ${search.updatedTs}</p>
              <p><strong>Created by:</strong> ${search.createdBy || 'System'}</p>
            </div>
            <div class="detail-section">
              <h3>Communication Channels</h3>
              <p><strong>Channels:</strong> ${Object.entries(search.channels || {}).map(([k,v]) => v ? channelLabels[k] || k : '').filter(Boolean).join(', ') || 'None specified'}</p>
            </div>
            <div class="detail-section">
              <h3>Notes</h3>
              <p>${search.notes || 'No notes available'}</p>
            </div>
            <div class="detail-section">
              <h3>History</h3>
              <div class="history-list">
                ${search.history?.map(h => `<p><strong>${h.ts}:</strong> ${h.message}</p>`).join('') || '<p>No history available</p>'}
              </div>
            </div>
          </div>
        `;
        
        showModal('searchDetailsModal');
      }
    };

    window.deleteSearch = function(searchId) {
      if (confirm('Are you sure you want to delete this search?')) {
        const patient = getCurrentPatient();
        if (patient) {
          // Use the persistence system
          deleteSearchAndSave(patient.id, searchId);
          showToast('🗑️ Search deleted successfully', 'success');
        }
      }
    };

    // Add refresh function
    window.refreshSearchList = function() {
      renderSearchList();
    };
  }

  // Enhanced facility details function
  window.showFacilityDetails = function(facilityId) {
    const facility = facilities.find(f => f.id === facilityId);
    if (!facility) return;

    const modal = document.getElementById('facilityDetailsModal');
    const content = modal.querySelector('.modal-content');
    
    content.innerHTML = `
      <div class="epic-card">
        <div class="epic-card-header">
          <h3 class="epic-card-title">${facility.name}</h3>
          <div class="epic-badge ${facility.beds > 0 ? 'priority-low' : 'priority-high'}">
            ${facility.beds > 0 ? 'Beds Available' : 'No Beds'}
          </div>
        </div>
        <div class="facility-details-grid">
          <div class="detail-section">
            <h4>Contact Information</h4>
            <p><strong>Phone:</strong> ${facility.phone || 'Not available'}</p>
            <p><strong>Fax:</strong> ${facility.fax || 'Not available'}</p>
            <p><strong>Address:</strong> ${facility.address || 'Address not available'}</p>
          </div>
          
          <div class="detail-section">
            <h4>Capacity & Availability</h4>
            <p><strong>Available Beds:</strong> ${facility.beds}</p>
            <p><strong>Total Capacity:</strong> ${facility.totalBeds || 'Not specified'}</p>
            <p><strong>Wait List:</strong> ${facility.waitList || 0} patients</p>
          </div>
          
          <div class="detail-section">
            <h4>Program Details</h4>
            <p><strong>ASAM Levels:</strong> ${facility.asamLevels?.join(', ') || 'Not specified'}</p>
            <p><strong>MAT Services:</strong> ${facility.matServices?.join(', ') || 'Not specified'}</p>
            <p><strong>Specialties:</strong> ${facility.specialties?.join(', ') || 'General'}</p>
          </div>
          
          <div class="detail-section">
            <h4>Insurance & Payers</h4>
            <p><strong>Accepted:</strong> ${facility.acceptedPayers?.join(', ') || 'Contact facility'}</p>
          </div>
        </div>
        
        <div class="modal-actions">
          <button class="epic-btn epic-btn-primary" onclick="closeModal('facilityDetailsModal')">Close</button>
          <button class="epic-btn epic-btn-secondary" onclick="initiateContact('${facility.id}')">📞 Contact Facility</button>
        </div>
      </div>
    `;
    
    showModal('facilityDetailsModal');
  };

  // Initialize the application
  const init = () => {
    console.log('Initializing Epic EMR Application...');
    
    // Load patient data (seed data if localStorage is empty)
    const storedPatients = localStorage.getItem('crc-patients');
    const patientData = storedPatients ? JSON.parse(storedPatients) : patients;
    
    // Load search data (seed data if localStorage is empty)
    const storedSearches = localStorage.getItem('crc-active-searches');
    let searchData = storedSearches ? JSON.parse(storedSearches) : [
      {
        id: 'S1',
        patient: 'Rivera, Jordan',
        mrn: '1234567',
        asam: '3.7WM',
        mat: 'MethadoneContinue',
        placement: 'Friends Hospital • Unit 3B hold',
        status: 'Accepted',
        nextAction: 'Transport arranged for 14:30',
        lastUpdate: '09/22 09:15'
      },
      {
        id: 'S2', 
        patient: 'Chen, Alex',
        mrn: '2345678',
        asam: '3.5COC',
        mat: 'SuboxoneInduction',
        placement: 'Searching for 3.5 level care',
        status: 'Searching',
        nextAction: 'Contact Unity Recovery at 10:30',
        lastUpdate: '09/22 08:45'
      },
      {
        id: 'S3',
        patient: 'Johnson, Maria',
        mrn: '3456789', 
        asam: '3.3',
        mat: 'None',
        placement: 'Searching for 3.3 level care',
        status: 'PendingReview',
        nextAction: 'Await bed confirmation from Valley Health',
        lastUpdate: '09/22 09:00'
      }
    ];
    
    // Store initial data if not already stored
    if (!storedPatients) {
      localStorage.setItem('crc-patients', JSON.stringify(patientData));
    }
    if (!storedSearches) {
      localStorage.setItem('crc-active-searches', JSON.stringify(searchData));
    }
    
    // Render patient list
    renderPatientList(patientData);
    
    // Render active searches
    renderActiveSearches(searchData);
    
    console.log('Epic EMR Application initialized successfully');
  };

  // Render patient list function - write rows into the main patient table body
  const renderPatientList = (patientData = null) => {
    const tbody = document.getElementById('patientListBody');
    if (!tbody) {
      console.warn('patientListBody element not found');
      return;
    }

    // Use provided data or generate from current patients
    const dataToRender = patientData || generatePatientListData();
    
    if (dataToRender.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No patients found</td></tr>';
      return;
    }

    const rows = dataToRender.map(patient => {
      // If createPatientRow exists (table-based renderer), use it for consistency
      if (typeof createPatientRow === 'function') {
        return createPatientRow(patient);
      }

      const tr = document.createElement('tr');
      tr.className = `plac-${patient.status || 'unknown'}`;
      tr.setAttribute('data-patient-id', patient.id || '');
      tr.innerHTML = `
        <td class="col-patient"><div class="patient-name">${patient.name || patient.patient || ''}</div></td>
        <td class="col-placement">${patient.placement?.text || patient.placement || ''}</td>
        <td class="col-mat">${patient.mat || ''}</td>
        <td class="col-status">${patient.note?.transferStatus || patient.status || ''}</td>
        <td class="col-transport">${patient.transport || ''}</td>
        <td class="col-assigned">${patient.assigned || ''}</td>
        <td class="col-lastupdate">${patient.lastUpdate || ''}</td>
        <td class="col-reassess">${patient.reassessFlag || ''}</td>
      `;
      return tr;
    });

    // Clear and append rows
    tbody.innerHTML = '';
    rows.forEach(r => tbody.appendChild(r));
    
    console.log('Patient list rendered with', dataToRender.length, 'patients');
  };
  
  // Render active searches function
  const renderActiveSearches = (searchData = null) => {
    const searchContainer = document.getElementById('searchList');
    if (!searchContainer) {
      console.warn('Search list container not found');
      return;
    }
    
    // Collect all searches from all patients if no specific data provided
    let allSearches = searchData;
    if (!allSearches) {
      allSearches = [];
      patients.forEach(patient => {
        if (patient.searches && Array.isArray(patient.searches)) {
          // Add patient context to each search
          const patientSearches = patient.searches.map(search => ({
            ...search,
            patientId: patient.id,
            patientName: patient.name
          }));
          allSearches.push(...patientSearches);
        }
      });
    }
    
    if (allSearches.length === 0) {
      searchContainer.innerHTML = '<div class="empty-state">No active searches yet. <button id="addFirstSearch" class="primary-btn">Add Search</button></div>';
      return;
    }
    
    searchContainer.innerHTML = allSearches.map(search => `
      <div class="search-row" data-search-id="${search.id}" data-patient-id="${search.patientId || ''}">
        <div class="search-patient">${search.patientName || search.patient || ''}</div>
        <div class="search-placement">${search.placement || search.facilityName || ''}</div>
        <div class="search-status">
          <span class="status-badge badge-${(search.status || 'unknown').toLowerCase()}">${search.status || 'Pending'}</span>
        </div>
        <div class="search-actions">
          <button class="epic-btn epic-btn-sm" onclick="editSearch('${search.id}')">Edit</button>
        </div>
      </div>
    `).join('');
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Expose functions for debugging / manual re-run
  try { 
    window.init = init; 
    window.refreshDashboard = refreshDashboard;
    window.renderActiveSearches = renderActiveSearches;
    window.renderPatientList = renderPatientList;
  } catch (e) { /* non-browser envs ignore */ }
})();
