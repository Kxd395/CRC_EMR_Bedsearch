# CRC SSOT Development Environment

Single-command setup to start the complete CRC SSOT development environment.

## Quick Start

Choose one of these options to start both API and UI servers:

### Option 1: Bash Script (macOS/Linux)
```bash
./start-dev.sh
```

### Option 2: Node.js Script (Cross-platform)
```bash
node start-dev.js
# or
./start-dev.js
```

## What Gets Started

- **API Server**: `http://localhost:3001`
  - PostgreSQL database connection
  - 19 patients loaded
  - All CRUD endpoints operational

- **UI Development Server**: `http://localhost:5173` or `5174`
  - Vite dev server with hot reload
  - 25 facilities with LOC filtering
  - Complete facility finder functionality

## Features Ready for Testing

1. **Patient Management**: 19 patients with detailed scenarios
2. **Facility Finder**: Smart filtering by ASAM level, MAT needs, 302 requirements
3. **LOC Integration**: Automatic facility matching based on patient assessment
4. **Real-time Search**: Live filtering by facility name, location, services
5. **Database Persistence**: All data saves to PostgreSQL

## Usage

1. Run the start script
2. Open `http://localhost:5173` (or the port shown)
3. Select a patient from the dropdown
4. Click "Facility Finder" tab
5. See filtered facilities based on patient's needs
6. Try search and filters

## Stopping

Press `Ctrl+C` in the terminal to stop both servers.

## Troubleshooting

- **Port conflicts**: Scripts automatically detect and use alternative ports
- **Database issues**: Ensure PostgreSQL is running
- **Dependencies**: Run `npm install` in the UI directory if needed

## Manual Startup (Alternative)

If you prefer to start services manually:

```bash
# Terminal 1: API Server
cd production/api
node server.js

# Terminal 2: UI Server  
cd development/prototypes/ui_prototype
npm run dev
```