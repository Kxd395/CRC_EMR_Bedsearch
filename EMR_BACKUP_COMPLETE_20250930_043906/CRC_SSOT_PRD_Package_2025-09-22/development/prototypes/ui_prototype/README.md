# CRC SSOT Prototype UI

A modernized Vite-powered frontend prototype for the CRC SSOT running note and facility finder experience. This project packages the original static HTML/CSS/JS prototype into a contemporary toolchain with repeatable local development, build, and deployment workflows.

## Getting Started

⚠️ **Important:** This project uses ES6 modules and **requires Vite** to run. Do not use `python -m http.server` or similar - it won't work.

```bash
npm install
npm run dev
```

The development server uses Vite and hot module replacement. Visit the URL printed in the terminal (default `http://localhost:5173`).

## Available Scripts

- `npm run dev` – Start a local development server with HMR.
- `npm run build` – Generate an optimized production build in `dist/` (used for validation after refactors).
- `npm run preview` – Serve the built assets locally to spot-check production output.
- `npm run lint` – Run ESLint over all source files.
- `npm run format` – Format source and configuration files with Prettier.

## Project Structure

```text
ui_prototype/
├── netlify.toml           # Netlify deploy configuration (builds via Vite)
├── package.json           # Project metadata and npm scripts
├── src/
│   ├── app.js             # Main application logic (migrated from legacy script.js)
│   ├── main.js            # Vite entry point wiring JS and CSS
│   └── styles/
│       └── main.css       # Primary stylesheet (migrated from legacy styles.css)
├── eslint.config.js       # Flat ESLint config targeting modern browsers
├── vite.config.js         # Vite dev/build settings
└── README.md              # This guide
```

Legacy backups (`index_backup.html`, `script_backup_*.js`, `restore_points/`, etc.) now live in `../doc/archive/ui_prototype/` and are not part of the active build.

## Documentation

Project-wide specification files, audit artifacts, and review materials now live in `../doc/` one level up from this UI workspace:

- `ui_prototype/DESIGN_COMPONENT_OVERVIEW.md` – Clickable map of key UI surfaces and modules.
- `ui_prototype/PA_PART1_IMPLEMENTATION.md` – Prior Authorization implementation notes from the prototype build.
- `ui_prototype/RECOMMENDATIONS.md` – Current retest findings and next-step guidance.
- `../doc/19_Commitment_Status.md` – Legal-only commitment panel specification and guardrails.
- Layout preferences in the Settings modal persist automatically in your browser; use the Save & Close button when finished adjusting panels.

## Layout Controls

- Open the gear button in the workflow header to toggle tabs and sidebar panels.
- Use the checkboxes to hide sections such as Facility Finder, Tasks & Approvals, or Audit & Privacy Review; Active Placement Searches stays locked on.
- Click `Save & Close` to persist your selections to localStorage; they reload automatically on your next visit.
- Use `Reset to defaults` to instantly restore visibility to the standard layout.
- Restore the default layout manually by reopening Settings and re-enabling panels or by clearing the `crc-ssot-panel-visibility` key in your browser storage.
- The Commitment panel exposes additional preferences (collapse by default, auto-expand for 302 or pending statuses, per-section visibility toggles) stored in `crc-ssot-commitment-settings`.

## Deployment Notes

- Netlify now executes `npm run build` and publishes from `dist/`.
- Production builds include source maps to aid debugging without shipping unminified source.

## Validation Checklist

1. Install dependencies and ensure `npm run build` completes without errors.
2. Optionally run `npm run preview` to confirm the UI renders end-to-end.
3. Keep large data fixtures within `src/app.js` until they are replaced by API integrations.

## Next Steps

- Break `src/app.js` into feature modules (data, state, UI bindings) for maintainability.
- Introduce automated smoke tests once APIs are available.
- Wire analytics or logging hooks once compliance requirements are defined.
