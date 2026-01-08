# CRC EMR Bedsearch

Patient placement and facility finder system for Clinical Resource Centers (CRC). This system helps healthcare providers manage patient placement workflows, facility searches, and bed availability tracking.

## 🏥 Overview

The CRC Bedsearch system provides:
- **Running Note (SSOT)** - Single source of truth for clinical documentation
- **Facility Finder** - Directory lookup filtered by patient acuity and level of care
- **Tasks & Approvals** - Management of pending clinical and administrative actions
- **Activity Log** - Real-time audit trail of all searches and updates

## 📁 Project Structure

```
CRC_EMR_Bedsearch/
├── apps/                    # Deployable applications
│   ├── web/                 # Frontend application (Vite)
│   ├── api/                 # Backend API server (Node.js/Express)
│   └── prototype/           # Standalone UI prototype
├── docs/                    # Documentation
│   ├── prd/                 # Product requirements
│   ├── specs/               # Technical specifications
│   └── architecture/        # Architecture docs
├── packages/                # Shared packages
│   └── mcp-ts-api/          # MCP TypeScript API bindings
├── scripts/                 # Build and deploy scripts
├── config/                  # Shared configuration
└── _archive/                # Archived/completed work
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Running the Prototype
```bash
# Open directly in browser
open apps/prototype/index.html
```

### Running the Web App
```bash
cd apps/web
npm install
npm run dev
```

### Running the API Server
```bash
cd apps/api
npm install
npm start
```

## 🔧 Development

See individual app READMEs for detailed setup:
- [Web App](apps/web/README.md)
- [API Server](apps/api/README.md)
- [MCP TypeScript API](packages/mcp-ts-api/README.md)

## 📚 Documentation

- [Product Requirements](docs/prd/)
- [Technical Specifications](docs/specs/)
- [Architecture](docs/architecture/)

## 🔐 Environment Variables

Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

## 📄 License

Proprietary - All rights reserved.
