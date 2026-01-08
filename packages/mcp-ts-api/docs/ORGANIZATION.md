# Documentation Organization

**Last Updated:** 2025-10-06

This document explains the organization of all documentation in the mcp-ts-api project.

---

## Directory Structure

```
mcp-ts-api/
├── README.md                           # Quick start (entry point)
├── DOCUMENT_INDEX.md                   # Master navigation hub
├── agent.constitution.md               # Agent runtime rules
│
├── docs/
│   ├── ORGANIZATION.md                 # This file
│   │
│   ├── adrs/                          # Architecture Decision Records
│   │   ├── ADR-001-typescript-over-mcp.md
│   │   ├── ADR-002-deno-sandbox.md
│   │   ├── ADR-003-single-json-line.md
│   │   └── ADR-004-constitution-runtime-contract.md
│   │
│   ├── guides/                        # User guides (moved here)
│   │   ├── SETUP.md
│   │   ├── CONTRIBUTING.md
│   │   ├── GITHUB_SETUP.md
│   │   └── PRODUCTION_READY.md
│   │
│   ├── reference/                     # Quick reference materials
│   │   ├── QUICK_REFERENCE.md
│   │   └── QUICK_REFERENCE_CARD.md
│   │
│   └── archive/                       # Historical/meta documentation
│       ├── BOOTSTRAP_RESULTS.md
│       ├── COMPLETE_SETUP_SUMMARY.md
│       ├── SSOT_CREATION_SUMMARY.md
│       ├── DOCUMENTATION_AUDIT_REPORT.md
│       ├── IMPROVEMENTS_IMPLEMENTED.md
│       └── REVIEW_COMPLETE.md
│
├── SSOT_DESIGN_AUTHORITY.md          # PRIMARY AUTHORITY (root level)
└── SECURITY.md                        # Security policy (root level)
```

---

## File Categories

### Root Level (Essential Files)

**Keep at root for maximum visibility:**

1. **README.md** - Entry point, quick start
2. **DOCUMENT_INDEX.md** - Master navigation
3. **SSOT_DESIGN_AUTHORITY.md** - Primary authority
4. **SECURITY.md** - Security policy
5. **agent.constitution.md** - Agent runtime rules

**Why Root?** These files are accessed most frequently and should be immediately visible.

---

### docs/adrs/ (Architecture Decisions)

**Purpose:** Standalone, browsable architecture decision records

**Files:**
- ADR-001-typescript-over-mcp.md
- ADR-002-deno-sandbox.md
- ADR-003-single-json-line.md
- ADR-004-constitution-runtime-contract.md

**Audience:** Developers, architects, auditors

**Updates:** Via PR, triggers version guard in CI

---

### docs/guides/ (User Guides)

**Purpose:** Step-by-step instructions for common tasks

**Files:**
- SETUP.md - Installation and configuration
- CONTRIBUTING.md - Contribution workflow
- GITHUB_SETUP.md - Repository setup
- PRODUCTION_READY.md - Production deployment

**Audience:** New users, contributors, DevOps

**Updates:** Keep aligned with SSOT

---

### docs/reference/ (Quick Reference)

**Purpose:** Quick lookup for daily development

**Files:**
- QUICK_REFERENCE.md - Commands and workflows
- QUICK_REFERENCE_CARD.md - Printable cheat sheet

**Audience:** Active developers

**Updates:** When commands or patterns change

---

### docs/archive/ (Historical Documentation)

**Purpose:** Preserve session logs and meta-documentation

**Files:**
- BOOTSTRAP_RESULTS.md - Initial bootstrap session
- COMPLETE_SETUP_SUMMARY.md - Setup summary
- SSOT_CREATION_SUMMARY.md - SSOT creation session
- DOCUMENTATION_AUDIT_REPORT.md - Audit report
- IMPROVEMENTS_IMPLEMENTED.md - Implementation log
- REVIEW_COMPLETE.md - Review summary

**Audience:** Maintainers, historians

**Updates:** Append-only (historical record)

---

## Migration Plan

Files will be moved to their new locations while preserving git history:

```bash
# Guides
git mv SETUP.md docs/guides/
git mv CONTRIBUTING.md docs/guides/
git mv GITHUB_SETUP.md docs/guides/
git mv PRODUCTION_READY.md docs/guides/

# Reference
git mv QUICK_REFERENCE.md docs/reference/
git mv QUICK_REFERENCE_CARD.md docs/reference/

# Archive
git mv BOOTSTRAP_RESULTS.md docs/archive/
git mv COMPLETE_SETUP_SUMMARY.md docs/archive/
git mv SSOT_CREATION_SUMMARY.md docs/archive/
git mv DOCUMENTATION_AUDIT_REPORT.md docs/archive/
git mv IMPROVEMENTS_IMPLEMENTED.md docs/archive/
git mv REVIEW_COMPLETE.md docs/archive/
```

**Note:** All internal links will be updated after migration.

---

## Access Patterns

### "I want to start using this"
→ **README.md** → Quick start

### "I need to set this up"
→ **docs/guides/SETUP.md**

### "I want to contribute"
→ **docs/guides/CONTRIBUTING.md**

### "I need to understand why something works this way"
→ **SSOT_DESIGN_AUTHORITY.md** → ADRs

### "I need a quick command reference"
→ **docs/reference/QUICK_REFERENCE_CARD.md**

### "I want to deploy to production"
→ **docs/guides/PRODUCTION_READY.md**

### "I want to see what changed recently"
→ **docs/archive/** (session logs)

---

## Maintenance Rules

### Root Files
- README.md: Update for major feature changes
- DOCUMENT_INDEX.md: Update when docs are added/moved
- SSOT_DESIGN_AUTHORITY.md: Follow governance (Section 8)
- SECURITY.md: Update for security policy changes only

### docs/adrs/
- Create new ADR for architectural decisions
- Update via PR (triggers version guard)
- Never delete (mark as superseded instead)

### docs/guides/
- Keep aligned with SSOT
- Update when features/workflows change
- Test instructions before committing

### docs/reference/
- Update when commands change
- Keep concise and scannable
- Sync with package.json scripts

### docs/archive/
- Append-only (don't modify historical logs)
- Add new session logs as created
- Preserve for audit trail

---

## Link Update Strategy

After migration, update these files:

1. **README.md** - Update guide links
2. **DOCUMENT_INDEX.md** - Update all paths
3. **SSOT_DESIGN_AUTHORITY.md** - Update ADR links
4. **All guides** - Update cross-references

**Search patterns:**
```bash
# Find links to moved files
grep -r "SETUP.md" *.md
grep -r "CONTRIBUTING.md" *.md
grep -r "QUICK_REFERENCE" *.md
```

---

## Benefits of This Organization

### Clarity
- ✅ Clear separation of concerns
- ✅ Easy to find what you need
- ✅ Logical grouping by audience/purpose

### Maintainability
- ✅ Archive preserves history without cluttering root
- ✅ ADRs are first-class, browsable files
- ✅ Guides are grouped together

### Scalability
- ✅ Easy to add new ADRs (docs/adrs/)
- ✅ Easy to add new guides (docs/guides/)
- ✅ Session logs don't pollute root

### Discoverability
- ✅ Root level shows only essential files
- ✅ DOCUMENT_INDEX provides clear navigation
- ✅ Purpose-based directories

---

## Status

**Current:** Documentation scattered at root level
**Target:** Organized structure with clear hierarchy
**Migration:** Pending (preserve git history with `git mv`)

---

**Last Updated:** 2025-10-06  
**Next Review:** After file migration complete
