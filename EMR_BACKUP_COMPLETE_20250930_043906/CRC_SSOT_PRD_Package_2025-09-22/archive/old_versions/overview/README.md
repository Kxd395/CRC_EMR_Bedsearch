# EMR Bed-Search Workflow Review Pack

This documentation pack provides a comprehensive overview of the bed-search workflow system, including status derivation, UI components, and data flow patterns.

## Contents

### Core Documentation

- **STATUS_PALETTE.md** - Canonical status colors and accessibility guidelines
- **SSOT_MAPPING.md** - Event-to-stage mapping with precedence rules
- **DERIVATION_SPEC.md** - Deterministic algorithms for status derivation
- **ASCII_OVERVIEW.md** - Text-based system architecture diagram
- **FILE_INDEX.md** - Quick reference for all documentation files

### PlantUML Diagrams

- **plantuml/ARCHITECTURE.puml** - System components and data flow
- **plantuml/DATAFLOW_ADD_EVENT.puml** - Event processing sequence
- **plantuml/ERD.puml** - Database schema and relationships
- **plantuml/STAGE_STATE_MACHINE.puml** - Primary stage transitions

## Viewing PlantUML Diagrams

### VSCode Extension

1. Install "PlantUML" extension by jebbs
2. Open any `.puml` file
3. Press `Alt+D` or use Command Palette: "PlantUML: Preview Current Diagram"

### Command Line

```bash
# Install PlantUML
brew install plantuml

# Render to PNG
plantuml review/overview/plantuml/*.puml

# Render to SVG
plantuml -tsvg review/overview/plantuml/*.puml
```

### Online Viewer

Copy diagram content to <http://www.plantuml.com/plantuml/uml>

## Key System Principles

1. **Append-Only Events** - All changes recorded as immutable events
2. **Derived State** - Current status computed from event history
3. **One Active Card** - UNIQUE constraint on (facility_id, FIN) per active search
4. **Dual-State Model** - Primary stage (card color) + facets (status chips)
5. **Deterministic Derivation** - Consistent status calculation from events

## Synchronization

This documentation pack is generated from actual codebase sources. To update:

1. Run the documentation generation agent
2. Verify PlantUML diagrams render correctly
3. Check that status codes match current implementation

## Source Files Referenced

- `ui_prototype/src/app.js` - Status normalization and theme injection
- `ui_prototype/src/data/newPatientScenarios.js` - Event samples
- `ui_prototype/RESTORE_NOTES.md` - Historical context and accessibility notes

Last Updated: September 25, 2025

