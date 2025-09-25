# File Index

This document provides a quick reference for all files in the review/overview documentation pack.

## Core Documentation

### STATUS_PALETTE.md

- **Purpose**: Canonical status colors and accessibility guidelines
- **Contents**: Color hex codes, badge/background values, WCAG contrast compliance
- **Source**: Extracted from `ui_prototype/src/app.js` STATUS_STYLES object

### SSOT_MAPPING.md

- **Purpose**: Event-to-stage mapping with precedence rules
- **Contents**: Status palette table, event type definitions, stage/facet separation
- **Source**: Logic derived from app.js helpers and system specifications

### DERIVATION_SPEC.md

- **Purpose**: Deterministic algorithms for status derivation
- **Contents**: Pseudocode for deriveStage/deriveFacets, time logic, example scenarios
- **Source**: Algorithmic specification based on precedence rules and event processing

### ASCII_OVERVIEW.md

- **Purpose**: Text-based system architecture diagram
- **Contents**: Component relationships, data flow, database constraints
- **Source**: System design documentation with ASCII art visualization

### CODEX_PROMPT.md

- **Purpose**: Context for AI coding assistants working with the system
- **Contents**: System overview, event model, status derivation, key functions
- **Source**: Comprehensive system knowledge compilation

### FILE_INDEX.md

- **Purpose**: Quick reference for all documentation files (this file)
- **Contents**: Purpose and contents description for each file
- **Source**: Generated index of documentation pack contents

### README.md

- **Purpose**: Documentation pack overview and usage instructions
- **Contents**: PlantUML viewing instructions, system principles, source references
- **Source**: Pack introduction and user guide

## PlantUML Diagrams

### plantuml/ARCHITECTURE.puml

- **Purpose**: System components and data flow visualization
- **Contents**: UI components, API layers, database tables, WebSocket connections
- **Format**: PlantUML component diagram with detailed relationships

### plantuml/DATAFLOW_ADD_EVENT.puml

- **Purpose**: Event processing sequence visualization
- **Contents**: Step-by-step flow from event submission to UI update
- **Format**: PlantUML sequence diagram showing temporal interactions

### plantuml/ERD.puml

- **Purpose**: Database schema and relationships
- **Contents**: Table structures, foreign keys, indexes, unique constraints
- **Format**: PlantUML entity relationship diagram

### plantuml/STAGE_STATE_MACHINE.puml

- **Purpose**: Primary stage transitions
- **Contents**: Valid state transitions, terminal states, trigger conditions
- **Format**: PlantUML state diagram showing status flow

## File Dependencies

```text
README.md                    (Entry point - references all others)
├── STATUS_PALETTE.md        (Referenced by SSOT_MAPPING.md)
├── SSOT_MAPPING.md          (Referenced by DERIVATION_SPEC.md)
├── DERIVATION_SPEC.md       (Implements logic from SSOT_MAPPING.md)
├── ASCII_OVERVIEW.md        (Visual complement to PlantUML diagrams)
├── CODEX_PROMPT.md          (Comprehensive context compilation)
├── FILE_INDEX.md           (This file - references all others)
└── plantuml/
    ├── ARCHITECTURE.puml    (System overview complement)
    ├── DATAFLOW_ADD_EVENT.puml (Process flow detail)
    ├── ERD.puml            (Database schema detail)
    └── STAGE_STATE_MACHINE.puml (Status logic visualization)
```

## Usage Workflow

1. **Start with README.md** for pack overview and PlantUML setup
2. **Review STATUS_PALETTE.md** for canonical colors and accessibility
3. **Study SSOT_MAPPING.md** for event-to-status mapping rules
4. **Examine DERIVATION_SPEC.md** for algorithmic implementation details
5. **Reference ASCII_OVERVIEW.md** for text-based architecture view
6. **Use CODEX_PROMPT.md** for AI assistant context when coding
7. **View PlantUML diagrams** for detailed visual representations
8. **Return to FILE_INDEX.md** (this file) for quick reference

## Maintenance

This documentation pack is generated from actual codebase sources. To maintain accuracy:

- Re-run documentation generation when status logic changes
- Verify PlantUML diagrams render correctly after updates
- Cross-reference status codes with current implementation
- Update source file paths if code organization changes
