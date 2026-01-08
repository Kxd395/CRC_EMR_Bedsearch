# 🏥 EMR CRC SSOT - Placement & Facility Finder# 🏥 CRC SSOT EMR System - Healthcare Database Integration



**Enterprise Healthcare Application**  **Project Status**: ✅ **Production Deployed - Operational**  

**Version**: 2.0 (Reorganized)  **Database Status**: ✅ **100% Database Operational**  

**Last Updated**: September 30, 2025  **Last Updated**: September 28, 2025  

**Status**: ✅ Production Ready**Database**: PostgreSQL 14.16 (Local) + PostgreSQL 16.10 (Production)  

**System**: Patient Placement Coordination with HIPAA Compliance  

---

**🎉 PERSISTENCE ISSUE RESOLVED**: All data now saves to database correctly!

## 🚀 Quick Start

---

Get started in seconds with our quick commands:

## 🚀 **Quick Start Guide**

```bash

# Start all servers (API + UI)### **For Healthcare Operations Teams**

./start- **Database Access**: → [Production Database Guide](production/database/README.md)

- **System Status**: → [Production Status](PRODUCTION_STATUS.md)

# Stop all servers- **Emergency Procedures**: → [Database Restore Guide](production/database/documentation/restore_procedures.md)

./stop

### **For IT/Development Teams**  

# Check system health- **Development Setup**: → [Development Resources](development/README.md)

./health- **API Integration**: → [API Specifications](production/api/README.md)

```- **System Architecture**: → [Technical Documentation](documentation/README.md)



**Access Points:**### **For Compliance Officers**

- 🌐 **UI Application**: http://localhost:5173- **HIPAA Compliance**: → [Healthcare Compliance Guide](documentation/healthcare_compliance/README.md)

- 🔌 **API Server**: http://localhost:3001- **Audit Procedures**: → [Audit Documentation](documentation/healthcare_compliance/audit_procedures.md)

- 📊 **API Health**: http://localhost:3001/health- **Data Security**: → [Security Overview](documentation/healthcare_compliance/data_security.md)



------



## 📁 Project Structure## 📊 **System Overview**



```### **Production Components**

CRC_SSOT_PRD_Package_2025-09-22/| Component | Status | Location | Purpose |

├── 📄 README.md                # This file|-----------|--------|----------|---------|

├── 📦 package.json             # Root dependencies| **Database** | ✅ Operational | [production/database/](production/database/) | PostgreSQL EMR database |

├── ⚡ start                    # Quick start command| **API Specs** | 📋 Ready | [production/api/](production/api/) | Backend integration guides |

├── ⚡ stop                     # Quick stop command| **Restore Points** | ✅ Active | [production/database/restore_points/](production/database/restore_points/) | Emergency recovery |

├── ⚡ health                   # Health check command

│### **Healthcare Workflow Capabilities**

├── 💻 src/                     # Source Code- **Patient Management**: Demographics, MRN tracking, PHI security

│   ├── api/                   # Backend (Node.js/Express)- **Provider Network**: Multi-facility coordination (mental health, addiction, medical)

│   │   ├── server.js         # API server- **Placement Coordination**: Complete workflow from intake to transfer

│   │   ├── persistence.js    # Database layer- **Clinical Documentation**: Provider notes with audit trails

│   │   ├── package.json      # API dependencies- **HIPAA Compliance**: Real-time audit logging for all PHI interactions

│   │   └── data/             # Data files

│   │### **Current Production Status**

│   ├── web/                   # Frontend (Vite/Vanilla JS)- **Database**: ✅ 100% Operational - All data persisting to PostgreSQL

│   │   ├── index.html        # Main UI- **API Endpoints**: ✅ All endpoints using database (patients, assessments, placements)

│   │   ├── src/app.js        # Application logic- **Performance**: ✅ < 0.1s response times for all operations

│   │   ├── package.json      # UI dependencies- **Backup System**: ✅ Fallback mechanism available as safety net

│   │   └── vite.config.js    # Vite configuration- **System Health**: ✅ Full database connectivity confirmed

│   │- **Data Records**: 4+ patients, 2+ assessments, 2+ placements verified in database

│   └── shared/                # Shared utilities (future)

│---

├── 📝 scripts/                 # Automation Scripts

│   ├── dev/                   # Development scripts## 📁 **Directory Structure**

│   │   ├── start.sh          # Simple server start

│   │   ├── start-all.sh      # Comprehensive start```

│   │   ├── start-both.sh     # Both serversCRC_SSOT_PRD_Package_2025-09-22/

│   │   ├── start-env.sh      # Environment setup├── 📊 PRODUCTION_STATUS.md           # Current system status

│   │   ├── start-legacy.sh   # Legacy start├── 🏭 production/                    # Production-ready components

│   │   ├── start-node.js     # Node.js start│   ├── 💾 database/                  # Database integration (ACTIVE)

│   │   └── test-ngrok.sh     # Test with ngrok│   └── 🔌 api/                       # Backend API specifications

│   │├── 🛠️ development/                   # Development resources

│   ├── database/              # Database scripts│   ├── 🎨 prototypes/                # UI prototypes and demos

│   │   ├── test-connection.sh    # Test DB connection│   ├── 📋 specifications/            # Requirements and specs

│   │   ├── migrate.sh            # Run migrations│   └── 🧪 testing/                   # Test data and validation

│   │   ├── fix-connection.sh     # Fix connection issues├── 📚 documentation/                 # Project documentation

│   │   ├── fix-mat-needs.js      # Fix data format│   ├── 🏥 healthcare_compliance/     # HIPAA and compliance docs

│   │   └── update-whitelist.sh   # Update IP whitelist│   ├── 🔧 implementation_guides/     # Technical implementation

│   ││   └── 👥 user_guides/               # End-user documentation

│   ├── deploy/                # Deployment scripts├── 📦 archive/                       # Archived/legacy content

│   │   ├── deploy.sh             # Main deployment└── 🔧 tools/                         # Utilities and scripts

│   │   ├── prepare-netlify.js    # Netlify prep```

│   │   ├── setup-netlify-db.js   # Netlify DB setup

│   │   └── setup-railway.sh      # Railway setup---

│   │

│   └── utilities/             # Utility scripts## 🎯 **Common Tasks**

│       ├── health-check.sh       # System health check

│       ├── fix-cache-restart.sh  # Clear cache & restart### **Database Operations**

│       ├── security-scanner.sh   # Security scan```bash

│       └── setup-security.sh     # Security setup# Connect to production database

│cd production/database/scripts

├── 📚 docs/                    # Documentation./connect_emr_db.sh

│   ├── getting-started/       # Setup & quickstart guides

│   ├── architecture/          # Technical documentation# Create backup

│   ├── deployment/            # Deployment guides./backup_emr_db.sh

│   ├── troubleshooting/       # Problem-solving guides

│   ├── reports/               # Status reports & summaries# Validate system health

│   ├── healthcare-compliance/ # HIPAA & compliance docs./validate_emr_schema.sh

│   ├── specifications/        # Requirements & PRD```

│   └── archive/               # Historical documentation

│### **Development Setup**

├── 🧪 tests/                   # Test Suites```bash

│   ├── playwright-report/     # Test reports# Start UI prototype

│   ├── test_data/            # Test data filescd development/prototypes/ui_prototype

│   └── tests/                # Test filesnpm run dev

│```

├── ⚙️ config/                  # Configuration Files

│   └── database/             # Database configurations### **Emergency Recovery**

│       ├── local_schema.sql  # Local DB schema```bash

│       └── migrations/       # Migration scripts# Restore from latest backup

│cd production/database/restore_points

├── 📊 logs/                    # Application Logs./validate_restore_point.sh

│   ├── api-server.log        # API server logs# Follow restore procedures in documentation/

│   ├── ui-server.log         # UI server logs```

│   ├── vite-server.log       # Vite build logs

│   └── ngrok.log             # Ngrok tunnel logs---

│

└── 📦 .archive/                # Historical Files (Hidden)## 🚨 **Emergency Contacts**

    ├── deprecated/           # Deprecated code

    ├── old-versions/         # Old directory structures- **Database Issues**: Reference production team procedures in `production/database/documentation/`

    └── parent-files/         # Files from parent directory- **Clinical Systems**: Healthcare IT support documented in compliance guides

```- **Network Access**: Tailscale VPN administrator contacts in system documentation

- **HIPAA Compliance**: Audit trail procedures in `documentation/healthcare_compliance/`

---

---

## 🛠️ Common Tasks

## 📈 **Project History**

### Development

- **September 28, 2025**: Production database deployment completed

#### Start Development Servers- **September 25, 2025**: Development prototype and specifications finalized

```bash- **Project Start**: Healthcare EMR placement coordination system development

# Quickest way - just run this:

./start---



# Alternative - use the organized script:## 🔗 **Key Links**

bash scripts/dev/start.sh

- [📊 Production Status Dashboard](PRODUCTION_STATUS.md)

# Comprehensive start with health checks:- [💾 Database Integration Guide](production/database/README.md)

bash scripts/dev/start-all.sh- [🏥 HIPAA Compliance Documentation](documentation/healthcare_compliance/README.md)

```- [🛠️ Development Resources](development/README.md)

- [📚 Complete Documentation Index](documentation/README.md)

#### Stop Servers

```bash---

./stop

```*🏥 CRC SSOT EMR System - Healthcare Database Integration Complete*  

*Production deployment operational as of September 28, 2025*
#### Check System Health
```bash
./health
```

#### View Logs
```bash
# API logs:
tail -f logs/api-server.log

# UI logs:
tail -f logs/ui-server.log
```

---

### Database Operations

```bash
# Test database connection
bash scripts/database/test-connection.sh

# Run database migrations
bash scripts/database/migrate.sh

# Fix database connection issues
bash scripts/database/fix-connection.sh
```

---

### Deployment

```bash
# Deploy to production
bash scripts/deploy/deploy.sh

# Prepare for Netlify
bash scripts/deploy/prepare-netlify.js

# Setup Railway deployment
bash scripts/deploy/setup-railway.sh
```

---

## 🏥 Features

### Patient Management
- ✅ **Patient Assessment** - ASAM-based clinical assessment tools
- ✅ **Demographics** - Complete patient information management
- ✅ **Medical History** - Comprehensive medical record tracking
- ✅ **Progress Tracking** - Real-time patient status dashboard

### Facility Operations
- ✅ **Facility Search** - Comprehensive facility directory
- ✅ **Bed Availability** - Real-time bed search and tracking
- ✅ **Multi-facility Support** - Mental health, addiction treatment, medical facilities
- ✅ **Provider Network** - Facility and provider coordination

### Clinical Workflows
- ✅ **Prior Authorization** - Insurance authorization tracking
- ✅ **Transport Coordination** - Patient transport scheduling and logistics
- ✅ **Clinical Documentation** - Provider notes with audit trails
- ✅ **Placement Coordination** - Complete intake to transfer workflow

### Data & Persistence
- ✅ **Database-First Architecture** - PostgreSQL primary, JSON fallback
- ✅ **Automatic Sync** - Background synchronization
- ✅ **Data Persistence** - All changes saved automatically
- ✅ **Offline Support** - Fallback mode when database unavailable

---

## 🔒 Security & Compliance

### HIPAA Compliance
- ✅ **PHI Protection** - Protected Health Information encryption
- ✅ **Audit Logging** - Complete audit trail for all PHI access
- ✅ **Access Control** - Role-based access control (RBAC)
- ✅ **Data Encryption** - SSL/TLS for all communications

### Security Features
- ✅ **SSL/TLS Encryption** - Secure database connections
- ✅ **Environment Variables** - No hardcoded credentials
- ✅ **IP Whitelisting** - Database access control
- ✅ **Security Scanning** - Automated vulnerability scanning

**📖 Compliance Documentation**: See `docs/healthcare-compliance/`

---

## 💻 Technology Stack

### Frontend
- **Framework**: Vanilla JavaScript (ES6+)
- **Build Tool**: Vite 7.1.7
- **UI**: HTML5, CSS3 (Custom styling)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL 14/16
- **Fallback**: JSON file storage

### Deployment
- **Frontend**: Netlify, Vercel
- **Backend**: Railway, Render
- **Database**: Production PostgreSQL server

---

## 📚 Documentation

### Getting Started
- [Quick Start Guide](docs/getting-started/QUICK_START.md)
- [Development Setup](docs/getting-started/DEV_SETUP.md)

### Architecture & Technical
- [API Reference](docs/architecture/API_REFERENCE.md)
- [Database Schema](docs/architecture/DATABASE_SCHEMA.md)
- [System Architecture](docs/architecture/SYSTEM_ARCHITECTURE.md)
- [Persistence Implementation](docs/architecture/DATABASE_PERSISTENCE_IMPLEMENTATION.md)

### Deployment
- [Deployment Checklist](docs/deployment/DEPLOYMENT_CHECKLIST.md)
- [Netlify Deployment](docs/deployment/NETLIFY_DEPLOYMENT.md)
- [Production Status](docs/deployment/PRODUCTION_STATUS.md)

### Troubleshooting
- [Common Issues](docs/troubleshooting/)
- [Database Troubleshooting](docs/troubleshooting/CORS_DATABASE_TROUBLESHOOTING.md)
- [Persistence Fixes](docs/troubleshooting/BED_SEARCH_PERSISTENCE_FIX.md)

### Reports
- [Reorganization Complete](docs/reports/BATCH_MOVE_COMPLETE.md)
- [Implementation Status](docs/reports/IMPLEMENTATION_STATUS.md)
- [Achievement Report](docs/reports/FINAL_ACHIEVEMENT_REPORT.md)

---

## 🔧 Configuration

### Environment Variables

**API Server** (`src/api/.env`):
```env
DB_HOST=your-database-host
DB_PORT=5432
DB_NAME=emr_crc_ssot
DB_USER=emr_admin
DB_PASSWORD=your-password
DB_SSL=true
PORT=3001
```

**UI Server** (`src/web/.env`):
```env
VITE_API_URL=http://localhost:3001
```

---

## 📊 System Status

### Current Status
- **API Server**: ✅ Operational
- **UI Server**: ✅ Operational
- **Database**: ⚠️ Degraded (IP whitelist pending)
- **Fallback Mode**: ✅ Active (27 patients)

### Database Status
- **Connection**: Blocked by IP whitelist (100.94.125.38 needs whitelisting)
- **Fallback**: JSON file storage active
- **Sync**: Auto-sync when database connects
- **Functionality**: 100% functional in fallback mode

---

## 🆘 Support & Troubleshooting

### Quick Fixes

**Servers won't start?**
```bash
./stop
bash scripts/utilities/fix-cache-restart.sh
```

**Database connection issues?**
```bash
bash scripts/database/fix-connection.sh
```

**Can't see patient data?**
```bash
# Hard refresh browser
# Mac: Cmd + Shift + R
# Windows/Linux: Ctrl + Shift + F5
```

### Get Help
- **Documentation**: Check `docs/` directory
- **Troubleshooting**: See `docs/troubleshooting/`
- **Logs**: Check `logs/` directory
- **Health Check**: Run `./health`

---

## 🎯 Project History

### Version 2.0 (September 30, 2025)
- ✅ Complete repository reorganization to industry standards
- ✅ 50+ files organized into logical structure
- ✅ Scripts categorized by purpose
- ✅ Documentation consolidated
- ✅ Quick start commands created

### Version 1.x (September 2025)
- ✅ Database persistence implementation
- ✅ Bug fixes for API response format
- ✅ SSL configuration
- ✅ Fallback storage system

---

**Built with ❤️ for healthcare professionals**

**Last Updated**: September 30, 2025  
**Status**: ✅ Production Ready
