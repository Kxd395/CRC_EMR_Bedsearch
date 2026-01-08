import { getMatchingFacilities } from './realFacilities.js';

export const commitmentFixtures = {
  S1: {
    type: '302',
    status: 'Active',
    startedAt: '2025-09-22T07:15:00-04:00',
    expiresAt: '2025-09-22T11:52:00-04:00',
    legalNotes: 'Emergency 302 hold; awaiting physician reassessment before sunset.',
    docsByType: {
      '302': [
        { id: 'petition', label: 'Petition', completed: true, timestamp: '09/22 09:18' },
        { id: 'physicianCert', label: 'Physician Exam/Cert', completed: true, timestamp: '09/22 09:26' },
        { id: 'lawEnforcement', label: 'Law enforcement / affidavit', completed: false },
        { id: 'gucForm', label: 'GUC site form', completed: false },
        { id: 'rightsNotice', label: 'Rights/notifications', completed: false },
        { id: 'upload', label: 'Additional upload', completed: false }
      ],
      '201': [
        { id: '201Consent', label: '201 Voluntary Consent', completed: true, timestamp: '09/12 15:05' },
        { id: 'dischargeRequest', label: '72h Discharge Request (if filed)', completed: false }
      ],
      ECT: [
        { id: 'courtOrder', label: 'Court order / Consent', completed: false },
        { id: 'anesthesia', label: 'Anesthesia clearance', completed: false }
      ]
    },
    schedule: {
      next: {
        event: '303 Hearing',
        datetime: '2025-09-23T11:30:00-04:00',
        location: 'Courtroom 2',
        judicialOfficer: '',
        served: 'Y',
        servedTo: 'Patient'
      },
      prior: [
        { event: '302 Approved', datetime: '2025-09-22T07:40:00-04:00' },
        { event: 'Petition filed', datetime: '2025-09-22T07:18:00-04:00' }
      ]
    },
    facilityFilters: {
      takes302: true,
      secureBh: true,
      acuteMed: false
    },
    facilityMatches: getMatchingFacilities({
      takes302: true,
      secureBh: true,
      availability: 'Accepting'
    }).slice(0, 5), // Show top 5 matching facilities
    quickActions: [
      { id: 'logPetition', label: 'Log petition' },
      { id: 'mark302Approved', label: 'Mark 302 approved' },
      { id: 'schedule303', label: 'Schedule 303' },
      { id: 'record201Discharge', label: 'Record 201 discharge request' },
      { id: 'uploadDoc', label: 'Upload doc' },
      { id: 'generateCourtPacket', label: 'Generate court packet' }
    ],
    quickUpdate: {
      actions: [
        'Petition filed',
        '302 approved',
        '303 scheduled',
        '201 discharge request',
        'Hearing held',
        'Extended to 304',
        'Commitment discontinued'
      ],
      defaultNote: '',
      updateStatus: true,
      appendAudit: true,
      copyToSsot: false
    },
    guardrails: {
      legalDocsComplete: false,
      courtDependencyOverdue: false,
      reassessFlag: false
    }
  },
  S2: {
    type: '201',
    status: 'Pending',
    startedAt: '2025-09-21T20:45:00-04:00',
    expiresAt: '2025-09-24T20:45:00-04:00',
    legalNotes: 'Voluntary request under review; provide discharge rights summary.',
    docsByType: {
      '201': [
        { id: '201Consent', label: '201 Voluntary Consent', completed: true, timestamp: '09/21 21:05' },
        { id: 'dischargeRequest', label: '72h Discharge Request (if filed)', completed: false }
      ],
      '302': [
        { id: 'petition', label: 'Petition', completed: false },
        { id: 'physicianCert', label: 'Physician Exam/Cert', completed: false }
      ],
      ECT: [
        { id: 'courtOrder', label: 'Court order / Consent', completed: false }
      ]
    },
    schedule: {
      next: {
        event: '201 Review',
        datetime: '2025-09-23T09:00:00-04:00',
        location: 'Unit conference room',
        judicialOfficer: 'Legal Liaison',
        served: 'N',
        servedTo: ''
      },
      prior: [
        { event: '201 Signed', datetime: '2025-09-21T21:05:00-04:00' }
      ]
    },
    facilityFilters: {
      takes302: false,
      secureBh: false,
      acuteMed: false
    },
    facilityMatches: getMatchingFacilities({
      takes302: false, // For 201 voluntary, might be looking at non-302 facilities
      secureBh: false,
      acuteMed: false
    }).slice(0, 3), // Show fewer for 201 commitments
    quickActions: [
      { id: 'log201Consent', label: 'Log 201 consent' },
      { id: 'recordDischargeReq', label: 'Record discharge request' },
      { id: 'uploadRightsNotice', label: 'Upload rights notice' }
    ],
    quickUpdate: {
      actions: [
        '201 consent signed',
        'Discharge request logged',
        'Reviewer notified',
        'Commitment discontinued'
      ],
      defaultNote: '',
      updateStatus: true,
      appendAudit: true,
      copyToSsot: false
    },
    guardrails: {
      legalDocsComplete: false,
      courtDependencyOverdue: false,
      reassessFlag: false
    }
  }
};
