# Acceptance Criteria (UAT‑ready)

1. **ASAM/LOC autopopulate:** Running Note pre‑fills from most recent visit LOC/ASAM; if none, prompt to complete.
2. **Quick Update:** One‑line update writes SDEs and appears in Storyboard + patient list within 5 seconds.
3. **Finder fidelity:** Filtering `MAT = MethadoneContinue` returns only facilities with that flag and shows LAST_VERIFIED_TS and BED_STATUS.
4. **Validation enforcement:** Mismatched selection shows reason; Finalize blocked without override (with reason); audit captured.
5. **UDS event:** New benzo positive after assessment ⇒ banner + In Basket ≤ 2 minutes; finalize disabled until reassessed or overridden.
6. **Audit visibility:** Privacy/HIM report shows edits, selections, overrides with user and timestamp.
7. **Security segmentation:** Users without SUD permission cannot view protected elements; Break‑the‑Glass works and is audited.
8. **Performance:** Finder returns results < 2 seconds typical scenarios.
9. **Data freshness:** Facility cards show staleness badges (14/30‑day thresholds); filter can hide stale.
10. **302 workflow:** If 302 required, Finder defaults to facilities with TAKES_302=Y and SECURE_DETOX_CAPABLE=Y.
