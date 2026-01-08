# 18_Prior_Authorization — CRC SSOT / Facility Finder
**Date:** 2025-09-23 15:16 UTC  
**Scope:** Visual-first specification for Prior Authorization (PA/Pre-Cert) panel placed **directly under Assessment Overview**. Includes fields, status palette, Quick Update integration, guardrails, SDE/operational model, endpoints, ACs & tests.

---

## Panel (ASCII)
```
┌──────────────────────────────────────────────────────────────────────────────┐
│ PRIOR AUTHORIZATION / PRE-CERT                                               │
│ Payer:  [ Community Behavioral Health (CBH) ▾ ]   Plan: [ Standard SUD ▾ ]   │
│ Service context:  Facility = [ Friends Hospital — Secure Detox ▾ ]           │
│                   Level of Care = [ 3.7 — Medically Managed Detox ▾ ]        │
│ Requirement:  [ Auto-check ▸ ]  Result:  [ REQUIRED ]   Policy: [ view ▸ ]   │
│ Status:   [ ▾ Not started | Required | Submitted | P2P requested | Approved  │
│            | Denied | Appeal filed | Not required ]    SLA:  7h left (24h)   │
├──────────────────────────────────────────────────────────────────────────────┤
│ Submission                                                                  │
│  Method: [ ▾ Portal | Fax | Phone ]  Ref # / Ticket: [ _____________ ]       │
│  Submitted by: [ Morgan Lee ▾ ]  Date/Time: [ 09/22 09:35 ]  Expedited: [ ]  │
│  Contact / UM line: [ 888-555-0100 ]   Fax/Portal URL: [ _________ ]         │
│  Attach: [x] CoreSummary  [x] ASAM  [x] Meds  [x] LastDose  [ ] SUD labs*    │
│          [ ] 302 docs*  [ ] ROI*   (*gated by ROI/BTG)  [ + Add PDF ]        │
│  Notes to payer (short): [ Clinical risk requires secure detox; CIWA 11 ↑ ]  │
│  Quick actions: [ Generate fax cover ] [ Phone script ] [ Log call ]         │
├──────────────────────────────────────────────────────────────────────────────┤
│ Decision                                                                    │
│  Decision: [ ▾ Approved | Denied | More info | P2P requested ]               │
│  Auth # / Cert #: [ __________ ]   Coverage span: [ 3 days ▾ ]               │
│  Decision time:  [ 09/22 11:05 ]   Agent: [ Patel, UM RN ]                   │
│  If Denied → Reason: [ ▾ Medical necessity | OON | LOC mismatch | Other ]    │
│               Rationale (short): [ _____________ ]  [ Start Appeal ]         │
│  P2P (if requested) → Date/Time: [ 09/22 12:30 ]  Clinician: [ Dr. Singh ▾ ] │
├──────────────────────────────────────────────────────────────────────────────┤
│ Guardrails & Tasks                                                          │
│  Blocks to Finalize:  ▣ PA not approved      ▢ P2P pending      ▢ None       │
│  Tasks:  [ Create P2P task ]  [ Create appeal task ]  [ Remind in 2h ]       │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Status palette
- **Not required** (gray) · **Required / Submitted / More info** (amber) · **P2P requested** (purple) · **Approved** (green) · **Denied** (red) · **Appeal filed** (indigo)

### Quick Update (PA-aware)
```
Target: (•) Selected facility search [ Friends Hospital ▾ ]  ( ) SSOT only
Reason: [ ▾ PA submitted | PA approved | PA denied | P2P requested ]
Note:   [ “Submitted PA via portal; ticket #CBH-1175” ]
Side effects: [✓] Update PA status  [✓] Audit  [ ] Copy to SSOT notes
[ Save Quick Update ]
```

### Heuristic Auto-check (visual-only)
Inputs: Payer/Plan, ASAM/LOC, 201/302, in/out network, benefit type.
Rules (visual): 302 → *Not required*; ASAM 3.7/4.0 inpatient → *Required*; OON non-emergent → *Required*; same-system blanket auth → *Not required*.

---

## Data mapping

### Visit-level SDEs
- `SDE.CRC.RUNNOTE.AUTH_REQUIRED` *(Y/N/Unknown)*  
- `SDE.CRC.RUNNOTE.AUTH_STATUS` *(NotStarted|Required|Submitted|P2P|Approved|Denied|Appeal|NotRequired)*  
- `SDE.CRC.RUNNOTE.AUTH_NUMBER`  
- `SDE.CRC.RUNNOTE.AUTH_METHOD` *(Portal|Fax|Phone)*  
- `SDE.CRC.RUNNOTE.AUTH_SUBMITTED_TS`, `AUTH_DECISION_TS`  
- `SDE.CRC.RUNNOTE.P2P_SCHEDULED_TS`, `P2P_CLINICIAN`  
- `SDE.CRC.RUNNOTE.AUTH_PAYER_ID`, `AUTH_PLAN_ID`  
- `SDE.CRC.RUNNOTE.AUTH_EXPEDITED` *(Y/N)*

### Operational (per service/facility): `AUTH_REQUEST`
See `18a_AUTH_REQUEST.schema.json` for full JSON Schema.

---

## Endpoints (suggested)
- `GET /visits/{visitId}/auth` — list auth requests for visit (optionally filter by facility).  
- `POST /visits/{visitId}/auth` — create request.  
- `PUT /auth/{authId}` — update status/decision/refs.  
- `POST /auth/{authId}/attachments` — upload doc.  
- `POST /auth/{authId}/tasks` — create follow-ups (P2P/appeal).

---

## Guardrails
- Finalize transfer is **blocked** if `AUTH_REQUIRED=Y` and `AUTH_STATUS ∉ {Approved, NotRequired}`. Override requires attestation; audit logs event.

---

## Acceptance Criteria
1) Panel renders beneath Assessment with Status + Requirement chips.  
2) Auto-check sets Requirement based on heuristics and links “Policy”.  
3) Quick Update → PA reasons update the panel Status and write audit.  
4) Submission captures method, ref#, submitted-by, ts, attachments.  
5) Decision captures Approved/Denied (+ coverage span, agent, rationale).  
6) P2P scheduled shows purple pill in header 30m prior.  
7) Guardrails block Finalize until Approved/Not required.  
8) SUD/302/ROI docs gated by BTG/ROI.

## Tests (visual)
- CBH + 302 + 3.7 → Not required; Finalize unblocked by PA.  
- Commercial + 3.7 → Required → Submitted → Approved → Unblocked.  
- Denied → Start Appeal sets status = Appeal (indigo).  
- Quick Update “PA submitted” updates status chip to Submitted (amber).
