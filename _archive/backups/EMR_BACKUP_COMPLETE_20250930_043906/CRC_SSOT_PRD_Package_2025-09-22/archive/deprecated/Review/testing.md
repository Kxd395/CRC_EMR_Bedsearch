CRC SSOT — Placement & Facility Finder

URL: https://crc-emr-prototype.netlify.app/
Scope: functional pass of navigation, forms, modals/drawers, filters, and system banners — text-only report for agent ingestion.

⸻

1) What you get in this doc
	•	✅ A map of the app and what each tab does right now
	•	✅ All prototype-only actions (toasts) so your agent can ignore them
	•	✅ A prioritized bug list with repro steps and expected vs. actual
	•	✅ Concrete fixes and acceptance criteria
	•	✅ A lean regression checklist + test matrix you can run or delegate
	•	✅ Copy-paste templates for bugs and test cases

⸻

2) Environment & persona used
	•	Persona: default header user “Morgan Lee — CRC Tech | Epic EMR”
	•	Patient scenarios: S1–S3 via Patient scenario dropdown
	•	No back-end; many actions return prototype toasts only
	•	Browser: assumed modern desktop; no mobile checks performed

⸻

3) App map (what’s where)

Header (global)
	•	Patient scenario (S1–S3), Patient, MRN, FIN, consents, Break-the-Glass, Finalize transfer
	•	Tabs: Running Note, Facility Finder, Tasks & Approvals, Activity Log
	•	Action buttons: Active Searches, Settings, Open downtime playbook

Prototype-only: Break-the-Glass, Open downtime playbook, many export/admin buttons

⸻

4) Running Note — what works / doesn’t

4.1 Assessment Overview
	•	Works: Commitment status, Medical acuity, Placement needed — dropdowns respond
	•	Doesn’t:
	•	LOC/ASAM level is non-interactive (click has no effect)
	•	Assessment timestamp is plain text (no picker; can’t edit)

4.2 Prior Authorization / Pre-Cert
	•	Works: Payer, Facility, Level of care, Status dropdowns persist
	•	Bug: Plan dropdown choice (e.g., “Standard SUD”) does not persist (reverts to “Select plan…”)

4.3 Quick Update (SSOT)
	•	Add Search/Add Multiple opens a modal with facilities + capability overrides
	•	Verify shows a toast; no validation/persist. Publish to SSOT not verified.
	•	Help explains rules
	•	Save Quick Update persists a free-text note in the search card
	•	View Transfer Packet preview is informational (prototype note)
	•	Simulate new tox result flips a Reassess Required banner (prototype)

4.4 Contact Planner
	•	Buttons Log call attempt, Packet sent, Scan ROI → prototype toasts only

4.5 Active Placement Searches
	•	Filters: scope/time/status/facility/channel all respond
	•	Card actions:
	•	View details → drawer (save needed to persist)
	•	Edit info → small modal (can open full drawer; save required)
	•	Record acceptance → prototype toast only

4.6 Patient List Preview
	•	Filters: All/Placed Only/Need Transport, All Statuses, All Staff — all respond
	•	Displays placement + transport + clinician assignment

4.7 Recent Placement Searches
	•	Informational log of changes across facilities (not interactive)

4.8 Workflow Timeline & Audit/Directory sections
	•	Shown in Running Note and Facility Finder
	•	Open directory admin / Export last 7 days → prototype toasts

⸻

5) Facility Finder / Tasks & Approvals / Activity Log
	•	Facility Finder: repeats Workflow Timeline & Directory/Audit; same prototype buttons
	•	Tasks & Approvals / Activity Log: “header + empty body + timeline.” No task or log content shown (likely unimplemented).

⸻

6) Settings (gear)
	•	“CRC Layout Defaults” modal with many toggles
	•	No save/apply — toggles do not persist; closing discards state → prototype

⸻

7) Prototype-only catalogue (treat as no-ops)

Feature	Behaviour
Break-the-Glass	Shows toast, no effect
Open downtime playbook	Shows toast, no effect
Active Searches (header)	Jumps to empty anchor, no content
Export last 7 days	Toast only
Open directory admin	Toast only
Log call attempt / Packet sent / Scan ROI	Toast only
Record acceptance (card)	Toast only
Simulate new tox result	Toggles reassess banner only
Settings toggles	No save/apply


⸻

8) Bugs & inconsistencies (prioritized)

Severity: H = High (blocks core flow), M = Medium, L = Low (prototype gap)

ID	Area	Severity	Repro (short)	Expected	Actual	Notes
B-01	Prior Auth – Plan	H	Select a plan (e.g., “Standard SUD”)	Persists after closing & page interactions	Reverts to “Select plan…”	Data not bound / state dropped
B-02	Assessment – LOC/ASAM	M	Click LOC/ASAM level	Opens dropdown	No response	Element inert
B-03	Assessment – Timestamp	M	Click Assessment timestamp	Edit via date/time picker	Read-only text	UX limitation (needs input)
B-04	Settings (gear)	L	Toggle any panel switch	Layout updates/persists	No save/apply; discards	Prototype—note clearly or disable
B-05	Tasks & Approvals / Activity Log	M	Open tabs	Show tasks/log items	Empty page except timeline	Implement or hide tab
B-06	Active Searches (header)	L	Click	Show list content	Scroll to empty anchor	Provide content or remove link
B-07	Record acceptance	M	Click on card	Acceptance saved to card	Toast only	Wire to drawer save or disable

Full repro steps (examples)

B-01 – Plan dropdown does not persist
	1.	Go Running Note → Prior Authorization / Pre-Cert
	2.	Set Payer: CBH, Plan: “Standard SUD”
	3.	Click away / close modal / navigate then return
Expected: Plan remains Standard SUD
Actual: Plan resets to “Select plan…”

B-02 – LOC/ASAM non-interactive
	1.	Go Assessment Overview
	2.	Click LOC/ASAM level control
Expected: Dropdown opens
Actual: No focus/interaction

⸻

9) Fix plan (by team) + acceptance criteria

Frontend
	1.	Bind and persist Plan dropdown (B-01)
	•	AC: Selected plan value remains after navigation and reload within the session.
	2.	Make LOC/ASAM a real select (B-02)
	•	AC: User can change LOC; value propagated to dependent logic/UI.
	3.	Datetime input for Assessment timestamp (B-03)
	•	AC: User can choose date/time via picker; value validates and persists.
	4.	Settings modal
	•	AC: Include Apply and Reset to defaults. Applied layout changes reflect immediately and persist in session.
	5.	Hide/task-gate incomplete tabs (Tasks/Log)
	•	AC: If no data source, show empty state with “Coming soon” OR remove tabs until implemented.
	6.	Header “Active Searches”
	•	AC: Opens the searches section with real content or remove button.
	7.	Record acceptance
	•	AC: Button routes to the edit drawer with Acceptance panel focused; on Save, acceptance status and fields reflect on the card.

Backend / Data (if/when wired)
	•	Provide endpoints for plan persistence, settings layout, acceptance updates, and activity/task feeds.

Design / Product
	•	Clarify which features are prototype-only via visible label or by disabling buttons.
	•	Provide empty-state messaging for tabs without data.
	•	Confirm required fields for Prior Auth and Acceptance flows.

QA
	•	Add regression cases (see § 11) for plan persistence, LOC dropdown, timestamp edit, settings apply, acceptance save, and header link behavior.

⸻

10) UX polish & clarity
	•	Mark non-functional buttons with a “Prototype” badge or disable them to reduce confusion.
	•	Add small helper text under non-editable fields (e.g., “Time set by EHR; not editable here”).
	•	In the Add Search modal, if Publish is safe, include a confirmation and success message in the card (instead of just a toast).
	•	In drawers/modals: show a sticky Save vs. Close bar to nudge persistence.

⸻

11) Test matrix (lean)

Area	Case	Steps	Expected
PA / Plan	Persist selection	Set Plan → navigate away → back	Plan still set
Assessment	LOC dropdown	Click→select new LOC	New LOC shown & used
Assessment	Timestamp edit	Open picker→set time	Value persists; format valid
Quick Update	Save note	Enter note→Save	Note appears on card
Add Search	Verify/Publish	Add facility→Publish	Card shows new facility/status
Record acceptance	From card	Click→drawer→save	Card shows acceptance details
Settings	Apply layout	Toggle panels→Apply	Panels reflect toggles
Tasks tab	Empty state	Open tab	Clear “Coming soon” or gated
Header link	Active Searches	Click link	Visible list; not an empty anchor
Prototype buttons	B-the-G, exports	Click	Clear disabled/prototype behavior


⸻

12) Regression checklist (copy-paste for runs)
	•	Plan selection persists across nav and reload
	•	LOC dropdown opens and sets value
	•	Assessment time editable and saved
	•	Save Quick Update note → visible on card
	•	Add Search → facility shows on card after publish/save
	•	Record acceptance → fields saved and reflected
	•	Settings Apply/Reset work; layout changes visible
	•	Tasks/Log tabs show proper state (content or actionable empty)
	•	Active Searches button reveals content (no dead anchor)
	•	Prototype-only buttons are disabled or clearly labeled

⸻

13) Bug & test templates (for your agent)

# BUG
**Title:** [Area] short description  
**Env/URL:** https://crc-emr-prototype.netlify.app/  
**Steps to Reproduce:**
1) …
2) …
**Expected:** …  
**Actual:** …  
**Severity:** High / Medium / Low  
**Notes/Attachments:** …

# TEST CASE
**ID:** TC-###  
**Area:** …  
**Pre-req:** …  
**Steps:**  
1) …  
2) …  
**Expected:** …  
**Pass/Fail:** …


⸻

14) Quick explainer for your agent (text-only)
	•	Many buttons are prototype-only (they show a toast and do nothing).
	•	Real interactions to focus on: Assessment dropdowns, Prior Auth (except Plan), Quick Update Save, Add Search modal/drawer, card drawers (View details / Edit info).
	•	The most critical bug to fix first: Plan dropdown not persisting. Next: make LOC selectable and add a time picker for the assessment time.
	•	If a feature isn’t implemented (Tasks, Activity Log, settings), either disable it or add clear empty-state text so users aren’t confused.

⸻

15) Summary priorities (P0 → P2)
	•	P0 (ship stop): Plan persistence (B-01), LOC interactivity (B-02), header link to real content or remove, record-acceptance wiring
	•	P1: Assessment timestamp picker, Settings apply/save, tab empty-states
	•	P2: De-emphasize prototype buttons, design polish/labels, print/finalize pathways

⸻

If you want, I can rewrite this into GitHub issues, a Jira import CSV, or a step-by-step QA runbook.

Confidence: 93%