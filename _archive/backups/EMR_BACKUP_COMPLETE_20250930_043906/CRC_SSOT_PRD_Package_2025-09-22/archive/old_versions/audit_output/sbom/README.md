# SBOM Status

CycloneDX/SPDX generation is blocked because the provided package lacks package.json, pnpm-lock, requirements, poetry.lock, go.mod, or other manifests. 

To produce the SBOM once code is available:
1. Gather all application repositories (Epic build export, companion services, infrastructure).
2. For JS/TS packages run `cyclonedx-npm` or `pnpm dlx @cyclonedx/cyclonedx-npm`.
3. For Python services run `cyclonedx-py` (pip/poetry) and combine with JS output.
4. Aggregate results into `_audit_out/sbom/` with versioned filenames and sign the SBOM for supply-chain attestations.
