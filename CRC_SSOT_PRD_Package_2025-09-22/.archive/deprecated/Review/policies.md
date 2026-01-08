Locked in. Here’s a clean, final policy + logic spec that reflects your correction:
	•	ASAM LOC (3.5 / 3.7 WM / 4.0 WM) may not carry ANY commitment status.
	•	201 (voluntary) applies to acute dual-diagnosis / IP psych only.
	•	302 and above (302/303/304…) are acute psychiatric only; they cannot go to any ASAM LOC.

I’ve included enums, UI rules, validation, and drop-in TypeScript helpers.

⸻

0) Canonical definitions

LOC (codes)
	•	3.5 — Clinically Managed High-Intensity Residential (ASAM)
	•	3.7_WM — Medically Monitored Withdrawal Management (ASAM)
	•	4.0_WM — Medically Managed Withdrawal Management (ASAM)
	•	IP_PSYCH — Acute Inpatient Psychiatry / Dual-Dx (non-ASAM, acute)

Commitment status (MH legal)
	•	none
	•	201_active (voluntary MH — acute dual-dx)
	•	201_declined
	•	302_pending
	•	302_active
	•	303_active
	•	304_active

Hard rule: Any status other than none is psychiatric scope only.
ASAM LOC must always have commitment_status = none at finalize.

⸻

1) Policy rules (short form)

Rule	Enforcement
ASAM LOC (3.5/3.7_WM/4.0_WM) cannot have any MH commitment	If LOC ∈ ASAM → force commitment_status = none; hide commitment UI; block finalize if not none
201 (voluntary) is acute dual-dx only	If commitment_status = 201_active → LOC must be IP_PSYCH
Any 302+ (302/303/304) is acute psych only	If commitment_status ∈ {302*,303*,304*} → LOC must be IP_PSYCH
302_pending cannot stage SUD placement	With 302_pending, ASAM facility search may not be staged/finalized; route to IP psych or resolve/lift first
Switching LOC to ASAM auto-clears commitment	On change to ASAM LOC → soft prompt (“Clear MH commitment to proceed?”) → set to none if confirmed
Facility finder respects scope	If commitment_status != none → show only IP psych facilities; if none → show ASAM facilities per LOC


⸻

2) UI behavior
	•	Commitment panel:
	•	Shown only when LOC = IP_PSYCH.
	•	Hidden (and value forced to none) when LOC ∈ {3.5, 3.7_WM, 4.0_WM}.
	•	On LOC change → ASAM: show a confirm dialog:
“ASAM levels cannot carry MH commitments. Clear commitment status?”
	•	Yes → set commitment_status = none and proceed.
	•	No → keep prior LOC and remain in IP psych.
	•	Finalize button:
	•	Disabled if any rule is violated (e.g., ASAM + non-none commitment).
	•	Reasons list shows specific blocker text.
	•	Facility Finder:
	•	If commitment_status != none → filter to IP psych directories only.
	•	Else → filter to ASAM by LOC (3.5 vs 3.7/4.0).

⸻

3) Validation (“v-policies”)

V-1: LOC × Commitment compatibility
	•	If loc ∈ ASAM and commitment_status != none → BLOCK (cannot save/finalize).
	•	If loc = IP_PSYCH and commitment_status = none → ALLOW (voluntary psych w/o 201 is OK per local practice; optionally prompt for 201).
	•	If commitment_status = 201_active and loc != IP_PSYCH → BLOCK.
	•	If commitment_status ∈ {302_pending, 302_active, 303_active, 304_active} and loc != IP_PSYCH → BLOCK.

V-2: Staging vs. Finalize
	•	With commitment_status ∈ {302_pending, 302_active, 303_active, 304_active}:
	•	Do not allow staging or finalizing SUD searches (ASAM).
	•	Only IP_PSYCH searches are allowed.

V-3: Auto-sanitize on save
	•	If loc ∈ ASAM → write commitment_status = none (after user confirmed the clear).
	•	If commitment_status != none → force loc = IP_PSYCH or show blocking dialog.

⸻

4) Exact dropdown values (for forms)

LOC select
	•	3.5 — Clinically Managed High-Intensity Residential
	•	3.7 WM — Medically Monitored Withdrawal Management
	•	4.0 WM — Medically Managed Withdrawal Management
	•	IP Psych — Acute Psychiatry / Dual-Diagnosis

Commitment status (show only when LOC=IP_PSYCH)
	•	None
	•	201 — Voluntary (active)
	•	201 — Declined
	•	302 — Pending
	•	302 — Active
	•	303 — Active
	•	304 — Active

⸻

5) Drop-in TypeScript helpers

// types.ts
export type LocCode = '3.5' | '3.7_WM' | '4.0_WM' | 'IP_PSYCH';
export type CommitmentStatus =
  | 'none'
  | '201_active'
  | '201_declined'
  | '302_pending'
  | '302_active'
  | '303_active'
  | '304_active';

export const ASAM: LocCode[] = ['3.5', '3.7_WM', '4.0_WM'];

export function isAsam(loc: LocCode) { return ASAM.includes(loc); }

export function locSupportsCommitment(loc: LocCode) {
  return loc === 'IP_PSYCH';
}

export function commitmentRequiresPsych(cs: CommitmentStatus) {
  return cs !== 'none'; // any commitment implies psych scope
}

export function isCompatible(loc: LocCode, cs: CommitmentStatus) {
  if (isAsam(loc) && cs !== 'none') return false;
  if (loc === 'IP_PSYCH') return true;
  return true; // ASAM + none
}

export type ValidateResult = { ok: boolean; reasons: string[] };

export function validatePlacement(loc: LocCode, cs: CommitmentStatus): ValidateResult {
  const reasons: string[] = [];
  if (isAsam(loc) && cs !== 'none')
    reasons.push('ASAM levels cannot carry MH commitment status. Clear status or choose IP Psych.');

  if (loc !== 'IP_PSYCH' && commitmentRequiresPsych(cs))
    reasons.push('Any 201/302+ requires acute psychiatric LOC (IP Psych).');

  return { ok: reasons.length === 0, reasons };
}

// UI hooks
export function onLocChange(nextLoc: LocCode, currentCS: CommitmentStatus) {
  if (isAsam(nextLoc) && currentCS !== 'none') {
    // prompt user; assume caller handles confirm
    return { requireConfirmClearCommitment: true };
  }
  return { requireConfirmClearCommitment: false };
}

export function normalizeOnSave(loc: LocCode, cs: CommitmentStatus): { loc: LocCode; cs: CommitmentStatus } {
  if (isAsam(loc)) return { loc, cs: 'none' };
  return { loc, cs };
}


⸻

6) Facility-finder routing
	•	If commitment_status != none → only IP psych facilities are shown.
	•	If commitment_status = none and:
	•	loc = 3.5 → show Rehab 3.5 only.
	•	loc = 3.7_WM → show Detox 3.7 (and 3.7/3.7+).
	•	loc = 4.0_WM → show Detox 4.0 (and 4.0 capable).

⸻

7) Acceptance criteria
	•	Changing LOC to ASAM auto-hides commitment panel and (with user confirm) clears status to none.
	•	Attempting to save ASAM + any commitment shows blocking error and prevents save/finalize.
	•	Selecting any non-none commitment forces LOC to IP_PSYCH or blocks with reason text.
	•	Facility results always match scope (ASAM vs IP psych).
	•	Audit logs include: “LOC changed to 3.7_WM; commitment cleared (auto per policy)”.

⸻

8) Test cases
	•	TC-A: LOC=3.7_WM, CS=201_active → BLOCK; prompt to clear or switch to IP_PSYCH.
	•	TC-B: LOC=IP_PSYCH, CS=302_active → ALLOW (psych search); ASAM search hidden.
	•	TC-C: Switch LOC from IP_PSYCH→3.5 while CS=201_active: prompt; on confirm, CS becomes none; save succeeds.
	•	TC-D: LOC=4.0_WM, CS=none → ALLOW; ASAM facilities display; commitment panel hidden.
	•	TC-E: LOC=3.5, CS=302_pending → BLOCK finalize/stage; message: “302 pending is acute; route to IP Psych.”

⸻

Manager’s note

This aligns the EMR with Pennsylvania MH law and your bedside practice:
	•	Commitment lives in acute psychiatry.
	•	ASAM = SUD pathway and must be free of MH commitment at transfer.

If you want, I can drop this into /docs/policies/loc_commitment.md and /src/policy/commitment.ts with unit tests.

Kevin — I checked CBH/DBHIDS and Pennsylvania regs. A few things in your draft need correction to match Philadelphia/CBH reality, especially around IP psychiatry and ASAM placement while a mental‑health commitment is active.

⸻

What’s accurate vs. not (with sources)
	1.	IP Psychiatry does not require 201 only.
Pennsylvania’s Mental Health Procedures Act (MHPA) explicitly supports involuntary inpatient (302 → 303 → 304) as lawful pathways to inpatient psychiatric hospitalization. CBH’s Acute Inpatient Psychiatric (AIP) Clinical Performance Standards describe admissions/consent but do not restrict AIP to 201; they anticipate cases where consent is not obtained within 48 hours (i.e., involuntary is permissible). Conclusion: IP_PSYCH must allow 201 or active 302/303/304.  ￼
	2.	ASAM levels while a 302/303/304 is active—generally blocked.
Under 55 Pa. Code § 5100.90, a person in involuntary treatment may be transferred only to an “approved facility” (approved under MHPA). ASAM 3.5/3.7/4.0 WM programs are typically licensed as substance‑use treatment (DDAP), not MHPA “approved” psychiatric facilities. So a member on an active 302+ generally cannot be moved to rehab/detox until the MH commitment is resolved/lifted (or an appropriate court order exists).  ￼
	3.	ASAM while “201_active”.
“201_active” means the person is voluntarily admitted to inpatient psychiatry. They can’t simultaneously be admitted to ASAM detox/residential. ASAM should be blocked until psychiatric voluntary status is ended (discharge) and commitment status returns to none. CBH materials treat AIP and SUD as distinct LOCs with separate authorization flows; nothing indicates dual admission.  ￼
	4.	Authorization rules you wanted “from cbhphila”
CBH’s current Utilization Review Care Coordination Grid (Aug 2025) and Provider Manual (Aug 2025) lay out LOC‑specific registration/prior auth, initial days, and Medicare‑primary handling. Highlights:

	•	AIP (Adult Acute Psych): Registration via PES/Assigned CCM; initial 3–5 days, continued‑stay reviews required.
	•	ASAM 3.7WM & 4.0WM: Service Registration via PES/CCM; typical initial 5 days; physician consult for continued stay.
	•	ASAM 3.7 (Intensive IP SUD): Prior Authorization via PES/CCM; initial 10–15 days.
	•	ASAM 3.5: Service Registration via CBH Portal; initial 10–15 days.
	•	Medicare primary: For AIP, no CBH precert—CBH generates secondary auth automatically for in‑network providers.
	•	Uninsured / CBH secondary: For acute psych, CBH assists authorization; for other LOCs, contact BHSI/OMH per manual.  ￼

⸻

Corrected compatibility matrix (Philadelphia / CBH aligned)

Legend: ✓ Allowed △ Allowed with conditions ✕ Block

LOC \ Commitment	none	201_active	201_declined	302_pending	302_active	302_lifted	303_active	304_active	ect_initiated
3.5 (Rehab)	✓	✕	△	△	✕	✓	✕	✕	✕
3.7_WM (Detox)	✓	✕	△	△	✕	✓	✕	✕	✕
4.0_WM (Detox)	✓	✕	△	△	✕	✓	✕	✕	✕
IP_PSYCH	△	✓	△	△	✓	△	✓	✓	✓

Why these changes
	•	IP_PSYCH: allow 302/303/304 (legal inpatient commitment), and allow 201_active; if none/201_declined/302_pending/302_lifted, show conditional state requiring either signing 201 or activation of 302+ before finalize. (MHPA & CBH AIP CPS).  ￼
	•	ASAM 3.5/3.7/4.0WM: block when any MH commitment is active (201 or 302+/ECT in progress) and allow when none or 302_lifted. (Transfer limitation under §5100.90 + operational reality that 201 means they’re in AIP).  ￼

Conditions (△)
	•	201_declined + Detox (3.7/4.0WM) → finalize only after SUD voluntary detox consent + 201 refusal acknowledgement are documented (internal safety/consent policy, not a CBH mandate).
	•	302_pending + Detox → finalize only after petition withdrawn/denied and status = none.
	•	IP_PSYCH + none/201_declined/302_pending/302_lifted → finalize only after 201 signed or 302/303/304 is activated (document petition or court disposition as applicable).
(For LOC‑specific auth steps, see grid below.)  ￼

⸻

Payer & authorization policy (drop‑in)

CBH Medicaid (Philadelphia HealthChoices) – current rules
	•	AIP: Registration via PES/Assigned CCM; initial 3–5 days; continued‑stay review; discharge live/within 24 hrs.
	•	ASAM 3.7WM / 4.0WM: Service Registration via PES/CCM; initial 5 days; physician consult for continued stay.
	•	ASAM 3.7: Prior Auth via PES/CCM; initial 10–15 days.
	•	ASAM 3.5: Portal Service Registration; initial 10–15 days.  ￼

Medicare primary (CBH secondary)
For AIP, no CBH precert/approval required; CBH generates the secondary auth for in‑network providers. (Out‑of‑network requires CBH OON form.)  ￼

Uninsured / CBH secondary
CBH assists for acute psych authorizations; BHSI/OMH handle other LOCs per Provider Manual.  ￼

⸻

UI/Validation changes
	1.	Commitment panel
	•	IP_PSYCH: editable; show “Convert to 201” or “Activate 302 (petition approved)” flow when status is none/declined/pending/lifted.
	•	ASAM: read‑only badge; if anything ≠ none, show red banner:
“ASAM requires no active MH commitment. Resolve commitment before proceeding.” (Rationale: 55 Pa. Code § 5100.90 transfer rule.)  ￼
	2.	On LOC → IP_PSYCH
	•	If none/201_declined/302_pending/302_lifted → COND: disable Finalize; CTA: “Sign 201” or “Proceed when 302/303/304 active”.
	•	If 302/303/304 active or 201_active → allow; if 201_active but “voluntary_consent” missing, prompt to attach within 48 hrs per AIP CPS.  ￼
	3.	On LOC → ASAM
	•	If 201_active or 302+/ECT → BLOCK with reason: “Cannot transfer from active MH commitment to SUD LOC (55 Pa. Code § 5100.90).”  ￼

⸻

Documents required
	•	IP_PSYCH (201_active) → voluntary_consent (obtain ≤ 48 hrs or document refusal).  ￼
	•	IP_PSYCH conversion from 302+ → attach court disposition or lift/rescind + voluntary_consent if converting to 201.
	•	ASAM under conditional states
	•	201_declined → sud_voluntary_detox_consent + 201_refusal_ack (internal consent risk‑management).
	•	302_pending → petition_withdrawn_or_denied before finalize.

⸻

Drop‑in TypeScript (policy + payer/authorization)

Note: Citations for the logic are above; none are embedded inside the code block.

// src/policy/compat.ts
export type LocCode = '3.5' | '3.7_WM' | '4.0_WM' | 'IP_PSYCH';
export type CommitmentStatus =
  | 'none'
  | '201_active'
  | '201_declined'
  | '302_pending'
  | '302_active'
  | '302_lifted'
  | '303_active'
  | '304_active'
  | 'ect_initiated';

export type CompatState = 'allow' | 'cond' | 'block';

export const COMPAT_TABLE: Record<LocCode, Record<CommitmentStatus, CompatState>> = {
  '3.5': {
    none: 'allow', '201_active': 'block', '201_declined': 'cond',
    '302_pending': 'cond', '302_active': 'block', '302_lifted': 'allow',
    '303_active': 'block', '304_active': 'block', 'ect_initiated': 'block'
  },
  '3.7_WM': {
    none: 'allow', '201_active': 'block', '201_declined': 'cond',
    '302_pending': 'cond', '302_active': 'block', '302_lifted': 'allow',
    '303_active': 'block', '304_active': 'block', 'ect_initiated': 'block'
  },
  '4.0_WM': {
    none: 'allow', '201_active': 'block', '201_declined': 'cond',
    '302_pending': 'cond', '302_active': 'block', '302_lifted': 'allow',
    '303_active': 'block', '304_active': 'block', 'ect_initiated': 'block'
  },
  // IP psychiatry allows either voluntary (201) or involuntary (302/303/304) admission
  'IP_PSYCH': {
    none: 'cond', '201_active': 'allow', '201_declined': 'cond',
    '302_pending': 'cond', '302_active': 'allow', '302_lifted': 'cond',
    '303_active': 'allow', '304_active': 'allow', 'ect_initiated': 'allow'
  }
};

// src/policy/docs.ts
export const DOCS_REQUIRED: Partial<Record<CommitmentStatus, string[]>> = {
  '201_active': ['voluntary_consent'],
  '201_declined': ['sud_voluntary_detox_consent', '201_refusal_ack'],
  '302_pending': ['petition_withdrawn_or_denied'] // used to resolve to 'none' for ASAM; or replaced by 302_active for IP_PSYCH
};

export type ValidateResult = { state: CompatState; reasons: string[]; docsRequired: string[] };

export function validate(loc: LocCode, cs: CommitmentStatus, docs: Record<string, boolean>): ValidateResult {
  const state = COMPAT_TABLE[loc]?.[cs] ?? 'block';
  const reasons: string[] = [];
  const docsRequired: string[] = [];

  if (state === 'block') {
    if (loc === 'IP_PSYCH') {
      reasons.push('IP Psychiatry allows 201 or 302/303/304. Convert to 201 or activate 302+ to proceed.');
    } else {
      reasons.push('ASAM LOC requires no active MH commitment. Resolve commitment before proceeding.');
    }
    return { state, reasons, docsRequired };
  }

  // Conditional document gating
  if (state === 'cond') {
    let needed: string[] = [];
    if (loc === 'IP_PSYCH') {
      if (cs === 'none' || cs === '201_declined' || cs === '302_pending' || cs === '302_lifted') {
        // Must either sign 201 (voluntary) or have 302/303/304 active before finalize.
        needed = cs === '201_declined'
          ? ['voluntary_consent'] // if choosing 201 route; refusal requires ack kept on file
          : [];
        reasons.push('Finalize after: 201 signed or 302/303/304 active (attach disposition as applicable).');
      }
    } else {
      // ASAM conditional states
      if (cs === '201_declined') needed = ['sud_voluntary_detox_consent', '201_refusal_ack'];
      if (cs === '302_pending')  needed = ['petition_withdrawn_or_denied']; // resolve to 'none'
    }

    const missing = needed.filter(k => !docs[k]);
    docsRequired.push(...needed);
    if (missing.length) reasons.push(`Finalize requires: ${missing.join(', ')}`);
  }

  // For 201_active (any LOC) ensure required docs present
  if (cs === '201_active') {
    const needed = DOCS_REQUIRED['201_active'] ?? [];
    const missing = needed.filter(k => !docs[k]);
    docsRequired.push(...needed);
    if (missing.length) reasons.push(`Finalize requires: ${missing.join(', ')}`);
  }

  return { state, reasons, docsRequired };
}

// src/policy/auth.ts
export type Payer = 'CBH' | 'MedicarePrimary' | 'Other';
export type AuthRule = {
  registrationType: 'service_registration' | 'prior_auth';
  channel: 'PES/CCM' | 'CBH_Portal';
  initialDays: string;          // display only
  notes?: string[];
};

export const AUTH_TABLE: Record<LocCode, AuthRule> = {
  'IP_PSYCH': { registrationType: 'service_registration', channel: 'PES/CCM', initialDays: '3–5 days', notes: ['Continued-stay reviews; live discharge ≤24h'] },
  '3.7_WM':   { registrationType: 'service_registration', channel: 'PES/CCM', initialDays: '5 days', notes: ['Physician consult for continued stay'] },
  '4.0_WM':   { registrationType: 'service_registration', channel: 'PES/CCM', initialDays: '5 days', notes: ['Physician consult for continued stay'] },
  '3.5':      { registrationType: 'service_registration', channel: 'CBH_Portal', initialDays: '10–15 days', notes: [] }
};

export function resolveAuth(loc: LocCode, payer: Payer): {rule: AuthRule; payerNotes: string[]} {
  const base = AUTH_TABLE[loc];
  const payerNotes: string[] = [];

  if (payer === 'MedicarePrimary' && loc === 'IP_PSYCH') {
    payerNotes.push('No CBH precert needed for AIP; CBH generates secondary authorization for in-network providers.');
  } else if (payer === 'CBH') {
    payerNotes.push('Follow CBH UR grid for this LOC (current as of Aug 2025).');
  } else {
    payerNotes.push('Follow primary insurer’s prior auth rules; CBH not payer of record.');
  }

  return { rule: base, payerNotes };
}

Auth references: CBH UR Grid (Aug 2025) and Provider Manual (Aug 2025). Medicare‑primary AIP rule: CBH generates secondary auth; no CBH precert needed.  ￼

⸻

Acceptance criteria (updated)
	•	IP_PSYCH
	•	✓ Allow finalize when 201_active or 302/303/304_active (prompt for required docs/consents).
	•	△ If none/201_declined/302_pending/302_lifted, disable finalize and display “Sign 201 or finalize when 302/303/304 active.” (show petition/court doc slots).
	•	ASAM 3.5 / 3.7_WM / 4.0_WM
	•	✓ Finalize only when commitment = none (or 302_lifted).
	•	△ If 201_declined → require SUD voluntary detox consent + 201 refusal ack.
	•	△ If 302_pending → require petition withdrawn/denied and status to none.
	•	✕ If 201_active or 302/303/304/ECT → block with MHPA §5100.90 reason.  ￼

⸻

Targeted test cases (revised)
	1.	IP_PSYCH + 302_active → ALLOW.
	2.	IP_PSYCH + none → COND; reason: “Sign 201 or activate 302/303/304.”
	3.	IP_PSYCH + 201_active (missing consent) → ALLOW with reason: “Finalize requires: voluntary_consent.” (CPS ≤ 48 hrs rule).  ￼
	4.	3.7_WM + 201_active → BLOCK (cannot move from active MH commitment to ASAM).  ￼
	5.	4.0_WM + 302_pending → COND; finalize only after petition_withdrawn_or_denied and status = none.
	6.	3.5 + 302_lifted → ALLOW.
	7.	Any LOC + payer=MedicarePrimary (AIP) → resolveAuth returns note “no CBH precert; CBH auto‑generates secondary auth.”  ￼

⸻

Quick authorization crib (for forms)
	•	PES Pre‑Admission (AIP registrations); Assigned CCM for utilization reviews.  ￼
	•	ASAM 3.5 → CBH Provider Portal service registration.  ￼
	•	ASAM 3.7/4.0 WM & 3.7 (IP SUD) → PES/CCM (service registration for WM; prior auth for 3.7).  ￼
	•	Medicare primary (AIP) → skip CBH precert; document Medicare coverage; CBH generates secondary auth.  ￼
	•	Uninsured/CBH secondary → AIP via CBH; other LOCs via BHSI/OMH per manual.  ￼

⸻

Action log (what I changed)
	•	Fixed matrix: IP_PSYCH now allows 302/303/304; ASAM blocks when 201_active (previously incorrectly allowed).
	•	Added payer/authorization layer using CBH UR Grid.
	•	Tightened conditional docs and reason strings to mirror legal/operational constraints (MHPA § 5100.90; AIP CPS consent timing).
	•	Provided revised unit‑test targets you can port into compat.spec.ts.

⸻

Recommended next steps
	1.	Wire the new resolveAuth() output into your placement UI (right‑rail “Auth Checklist”), so staff see exact channel (PES/CCM vs Portal), initial day window, and payer‑specific notes.
	2.	Add a “Commitment Gate” banner on ASAM flows that reads the compat validator and cites MHPA § 5100.90.  ￼
	3.	Update facility search filters: when LOC = IP_PSYCH and commitment is active (201 or 302+/ECT), show psych beds only; when LOC is ASAM, hide psych beds and block finalize unless commitment is none.
	4.	Unit tests: snapshot the table and validate all 7 scenarios above.

⸻

Bottom line
	•	Your intent (keep ASAM “commitment = none”) is right, but the previous matrix had 201_active = allow for ASAM, which conflicts with practice and the transfer rule.
	•	For IP psychiatry, 201‑only is not accurate; 302/303/304 are valid admission statuses in PA.

Confidence: 87% (statutes and current CBH docs are clear on the big points; some conditional document steps are internal workflow standards rather than explicit CBH requirements, and implementation can vary by facility.)Confidence: 95%