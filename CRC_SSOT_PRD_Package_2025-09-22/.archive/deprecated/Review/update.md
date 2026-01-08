Here’s a complete, EMR-grade “Patient Progress” dashboard spec you can build against—plus an ASCII wireframe you can paste into the README.

⸻

What the Patient Progress Dashboard should include

A) Header & At-a-Glance
	•	Patient banner: patientName, MRN, DOB, Sex, Allergies, Isolation, FallRisk.
	•	Clinical need (SUD LOC): asamLevel (3.1 / 3.5 / 3.7 / 3.7WM).
	•	Commitment status (PA): NONE | 201_VOLUNTARY | 302_INVOLUNTARY | 303_EXTENDED.
	•	Current search status (server-derived): PENDING | ACTIVE | OFFER_RECEIVED | SELECTED_FOR_TRANSFER | TRANSFER_SCHEDULED | TRANSFERRED | CLOSED | CANCELLED.
	•	Owners: crs, rn, sw, attending (display names & shift).
	•	Sync badge: Synced | Pending | Error (DB round-trip state).

B) Progress & Timing
	•	Stage progress bar: Assessment → Outreach → Offers → Selected → Scheduled → Transferred/Closed.
	•	Timers/KPIs: timeSinceOpened, timeInCurrentStage, contactsMade, offersCount, declinesCount, daysWaiting, lastActionBy.
	•	SLO hints: highlight when timeInCurrentStage exceeds thresholds.

C) Facility Shortlist (active search)

Each row shows:
	•	facilityName, levelOfCare (PSYCH_INPATIENT or ASAM_*), acceptsInvoluntary, distance, payerOK, bedType.
	•	Status chips: CONTACTED | OFFERED | DECLINED | ACCEPTED_CANDIDATE | SELECTED_FOR_TRANSFER.
	•	Quick actions: Contact, Record Offer, Select for Transfer (guard: only 1 selected), Add Note.
	•	Reason tooltips for hidden facilities (e.g., “Doesn’t accept involuntary admissions”).

D) Documentation & Consents (dashboard lights)
	•	Required set (by status & LOC):
	•	Always SUD: HIPAA_ACK, ROI_GENERAL (as needed), PART2_CONSENT prior to disclosures.
	•	201 (psych voluntary): FORM_201_VOLUNTARY, PATIENT_RIGHTS_201, HIPAA_ACK.
	•	302/303 (psych involuntary): MH_783_APPLICATION, PHYSICIAN_EXAM_302, COMMITMENT_ORDER_302, HIPAA_ACK, plus PSP tasks (below).
	•	State machine per doc: MISSING → PENDING → RECEIVED | SIGNED (REJECTED optional).
	•	Row actions: Upload, Generate, View, Sign, Reject, Mark Sent (where relevant).
	•	Sync badge next to each doc row.

E) PSP / Legal Tasks (302/303 only)
	•	Tasks auto-queued: PSP_NOTIFICATION (commitment notice); and, if applicable, PSP_NOTIFICATION_NO_SMD (physician 302b “No severe mental disability” notice).
	•	Actions: Upload form, Mark Sent, Add Confirmation #, Add Notes.

F) Prior Auth & Benefits
	•	Payer: plan, member ID, eligibility status.
	•	Auth status: NOT_REQUIRED | SUBMITTED | APPROVED | DENIED | APPEAL.
	•	Attachments: auth letter, fax confirmation.

G) Transport & Handoff
	•	Mode: BLS | ALS | Bariatric | Secure.
	•	Pickup window, receiving facility, handoff contact, handoff packet (printed/electronic).

H) Risks & Blockers
	•	Flag chips: No Part 2 consent, No PSP notice, No bed type, No prior auth, Medical acuity, Wound care, Dialysis, Pregnancy, Language, Wheelchair, O2, Isolation.
	•	Click to jump to the panel that resolves the blocker.

I) Timeline (append-only)
	•	Date-stamped events: outreach, offers, selections, docs received/signed, auth updates, PSP submissions, transport steps.

J) Team & Communication Log
	•	Who did what, when; phone/fax/email attempts; summary notes (no PHI spill into logs).

⸻

ASCII Wireframe (120-col desktop)

+======================================================================================================================+
|  PATIENT  |  Kevin Dial (MRN: 00123456)  |  DOB: 11/21/1977  |  ASAM: 3.7WM  |  Commitment: 302_INVOLUNTARY  | Synced |
+======================================================================================================================+
| OWNERS:  CRS: M. Lee   RN: S. Chen   SW: J. Ortiz   Attending: A. Patel                    Last Action: 12:44 PM     |
+----------------------------------------------------------------------------------------------------------------------+
|  PROGRESS                                                                                                            |
|  [ Assessment ]--->[ Outreach ]--->[ Offers ]--->[ SELECTED ]--->[ Scheduled ]--->[ Transferred ]                    |
|  Time Open: 18h 22m   Stage: Offers (6h)   Contacts: 7   Offers: 1   Declines: 2                                    |
+----------------------------------------------------------------------------------------------------------------------+
|  FACILITY SHORTLIST (filtered by 302: PSYCH_INPATIENT + acceptsInvoluntary=true)                                     |
|  ▸ Crisis Stabilization Unit (Psych Inpatient)   acceptsInvoluntary: ✓   Distance: 2.1mi   Payer: OK   Status: OFFERED|
|      [Contact] [Record Offer] [Select for Transfer] [Add Note]                                                       |
|  ▹ North Med Detox (ASAM 3.7WM)   (hidden)  Reason: Facility does not accept involuntary admissions (302)            |
|  ▹ Serenity Residential (ASAM 3.5) (hidden)  Reason: Ineligible during commitment (302/303)                          |
+----------------------------------------------------------------------------------------------------------------------+
|  DOCUMENTS & CONSENTS                                                                                                |
|  Code                         | Status      | Updated       | Actions                                                 |
|  HIPAA_ACK                    | RECEIVED    | 09/29 11:05   | [View] [Reject]                                        |
|  PART2_CONSENT                | SIGNED      | 09/29 11:07   | [View] [Download]                                      |
|  MH_783_APPLICATION           | PENDING     | 09/29 10:46   | [Upload] [View Request]                                |
|  PHYSICIAN_EXAM_302           | MISSING     | —             | [Upload] [Generate]                                    |
|  COMMITMENT_ORDER_302         | MISSING     | —             | [Upload]                                               |
+----------------------------------------------------------------------------------------------------------------------+
|  PSP / LEGAL TASKS (302/303)                                                                                        |
|  PSP_NOTIFICATION             | PENDING     | —             | [Upload] [Mark Sent] [Add Confirmation #]             |
|  PSP_NOTIFICATION_NO_SMD      | (conditional) appear after physician marks “No SMD”                                  |
+----------------------------------------------------------------------------------------------------------------------+
|  PRIOR AUTH / BENEFITS                                    |  TRANSPORT & HANDOFF                                     |
|  Plan: CBH / Medicaid  | Auth: SUBMITTED (fax 09/29)     |  Mode: BLS  | Window: Today 17:30–18:30                  |
|  Member ID: XXXXXX991   Eligibility: ACTIVE              |  Receiving: CS Unit  | Packet: Ready (7 docs)             |
+----------------------------------------------------------------------------------------------------------------------+
|  RISKS & BLOCKERS: [No 302 Commitment Order] [Auth Pending] [Isolation] [Wound Care] [Dialysis]                     |
+----------------------------------------------------------------------------------------------------------------------+
|  TIMELINE                                                                                                            |
|  09/29 12:40  Offer recorded from Crisis Stabilization Unit                                                          |
|  09/29 11:07  PART2_CONSENT signed                                                                                   |
|  09/29 10:46  MH_783_APPLICATION requested                                                                            |
|  09/29 09:10  Outreach to 5 facilities                                                                               |
+----------------------------------------------------------------------------------------------------------------------+
|  TEAM & COMMUNICATION LOG                                                                                            |
|  12:35  Call with CS Unit intake; left VM.  |  11:05  Fax HIPAA to CS Unit  |  10:20  SW documented prior auth fax   |
+======================================================================================================================+

(80-column version: collapse right-hand panels into stacked sections; keep the same order.)

⸻

Form-ready fields & codes (copy/paste)

Required doc codes (exact strings)

HIPAA_ACK, ROI_GENERAL, PART2_CONSENT, FORM_201_VOLUNTARY, PATIENT_RIGHTS_201, MH_783_APPLICATION, PHYSICIAN_EXAM_302, COMMITMENT_ORDER_302, COURT_ORDER_303, PSP_NOTIFICATION, PSP_NOTIFICATION_NO_SMD

Facility capability flags
	•	acceptsInvoluntary: boolean
	•	bedTypes: string[] (e.g., ACUTE, DUAL_DIAGNOSIS)
	•	payerAccepted: string[]
	•	services: string[] (e.g., WOUND_CARE, DIALYSIS, MAT)

Progress mapping (server-derived → stage)
	•	PENDING/ACTIVE → Outreach
	•	OFFER_RECEIVED → Offers
	•	SELECTED_FOR_TRANSFER → Selected
	•	TRANSFER_SCHEDULED → Scheduled
	•	TRANSFERRED | CLOSED → Transferred/Closed

E2E data-testid names
	•	Header: patient-banner, status-chip, sync-badge
	•	Progress: progress-stage-{name}
	•	Facility rows: facility-row-{facilityId}, toggle reason: facility-row-{id}-reason
	•	Docs rows: docs-row-{DOC_CODE}, actions docs-action-{DOC_CODE}-{action}
	•	PSP tasks: psp-row-PSP_NOTIFICATION, psp-row-PSP_NOTIFICATION_NO_SMD
	•	Prior auth: auth-status
	•	Transport: transport-mode, transport-window
	•	Risks: risk-chip-{code}
	•	Timeline: timeline-event-{id}

⸻

Dynamic behavior (rules you should enforce)
	•	SUD never requires a 201. 201/302/303 are psychiatric mechanisms.
	•	302/303 active: restrict to Psych Inpatient + acceptsInvoluntary=true; hide ASAM facilities (show reason chips).
	•	Docs: “lights up” green only at RECEIVED or SIGNED.
	•	Only one SELECTED_FOR_TRANSFER facility per search (DB & UI guard).
	•	Authoritative status comes from server summary; UI derivation is preview only.
	•	Idempotency & OCC: send Idempotency-Key & If-Match on all saves; 409 shows “Reload from server” (don’t silently overwrite).
	•	Part 2 gating: block outbound disclosures until PART2_CONSENT is present—or document emergency exception.

⸻

Telemetry you should capture (for QA/ops)
	•	save_latency_ms, version_conflicts, idempotency_reused, doc_upload_failures, psp_notice_sent_total, time_to_offer, time_to_selected, time_to_transfer.

⸻

Definition of Done (for this dashboard)
	•	UI matches ASCII layout and testids above.
	•	Facility filter honors commitment rules and capability flags.
	•	Docs dashboard drives from the doc codes; states persist; uploads update state.
	•	PSP tasks auto-queue on 302/303; “No SMD” task appears when physician marks it.
	•	Progress stages reflect server-derived status.
	•	Axe serious/critical = 0; keyboard order correct; toasts have aria-live.
	•	Local cache off in prod; no PHI in logs.

⸻

If you want, I can convert this into a set of React-free ES modules (dashboard.js, docs/dashboard.js, facilityFinder.js) with the testids and state machine baked in—just say “GO” and tell me the exact src/ structure you want.

Confidence: 90%