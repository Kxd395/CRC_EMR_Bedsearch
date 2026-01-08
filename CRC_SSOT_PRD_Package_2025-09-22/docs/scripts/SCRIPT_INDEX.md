# Script Index - EMR System

**Last Updated**: September 30, 2025  
**Repository Version**: v2.0  
**Total Scripts**: 21

---

## Table of Contents
1. [Development Scripts](#development-scripts)
2. [Database Scripts](#database-scripts)
3. [Deployment Scripts](#deployment-scripts)
4. [Utility Scripts](#utility-scripts)
5. [Backup Scripts](#backup-scripts)
6. [Quick Commands](#quick-commands)
7. [Script Status](#script-status)

---

## Development Scripts

**Location**: `scripts/dev/`  
**Purpose**: Development environment management

### 1. start.sh ✅ ACTIVE
**Path**: `/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/scripts/dev/start.sh`  
**Purpose**: Simple startup - start both API and UI servers  
**Usage**: 
```bash
bash scripts/dev/start.sh
# or
./start  # Quick command
```
**What it does**:
- Starts API server on port 3001
- Starts UI server on port 5173
- Shows server URLs and PIDs
- Colorized output for status

**Status**: ✅ CURRENT - Primary start script  
**Size**: 1.6K  
**Last Modified**: Sep 30, 2025

---

### 2. start-all.sh ✅ ACTIVE
**Path**: `/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/scripts/dev/start-all.sh`  
**Purpose**: Comprehensive startup with health checks and verbose output  
**Usage**: 
```bash
bash scripts/dev/start-all.sh
```
**What it does**:
- Pre-flight checks (Node.js version, ports)
- Installs dependencies if needed
- Starts both servers with detailed logging
- Health check after startup
- More verbose than start.sh

**Status**: ✅ ACTIVE - Alternative start with more info  
**Size**: 11K  
**Last Modified**: Sep 30, 2025

---

### 3. start-both.sh ✅ ACTIVE
**Path**: `/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/scripts/dev/start-both.sh`  
**Purpose**: Start API and UI separately in different terminals  
**Usage**: 
```bash
bash scripts/dev/start-both.sh
```
**What it does**:
- Starts API in one process
- Starts UI in another process
- Allows separate monitoring

**Status**: ✅ ACTIVE - For separate monitoring  
**Size**: 2.4K  
**Last Modified**: Sep 30, 2025

---

### 4. start-env.sh ⚠️ REVIEW
**Path**: `/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/scripts/dev/start-env.sh`  
**Purpose**: Start with environment variable validation  
**Usage**: 
```bash
bash scripts/dev/start-env.sh
```
**What it does**:
- Validates .env files exist
- Checks required environment variables
- Starts servers with env validation

**Status**: ⚠️ NEEDS REVIEW - May have old paths  
**Size**: 4.8K  
**Last Modified**: Sep 30, 2025

---

### 5. start-legacy.sh 📦 CONSIDER ARCHIVING
**Path**: `/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/scripts/dev/start-legacy.sh`  
**Purpose**: Legacy startup method from v1.x  
**Usage**: 
```bash
bash scripts/dev/start-legacy.sh
```
**What it does**:
- Old startup method
- May use deprecated paths

**Status**: 📦 CANDIDATE FOR ARCHIVING - Use start.sh instead  
**Size**: 5.1K  
**Last Modified**: Sep 30, 2025  
**Action**: Test if needed, archive if redundant

---

### 6. test-ngrok.sh ✅ ACTIVE
**Path**: `/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/scripts/dev/test-ngrok.sh`  
**Purpose**: Test ngrok tunnel for external access  
**Usage**: 
```bash
bash scripts/dev/test-ngrok.sh
```
**What it does**:
- Starts ngrok tunnel
- Exposes local server publicly
- For testing webhooks or external access

**Status**: ✅ ACTIVE - For ngrok testing  
**Size**: 3.3K  
**Last Modified**: Sep 30, 2025

---

### 7. start-node.js ⚠️ REVIEW
**Path**: `/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/scripts/dev/start-node.js`  
**Purpose**: Node.js version of start script  
**Usage**: 
```bash
node scripts/dev/start-node.js
```
**What it does**:
- JavaScript version of start script
- Uses Node.js spawn instead of bash

**Status**: ⚠️ NEEDS REVIEW - Verify if used  
**Size**: 7.0K  
**Last Modified**: Sep 30, 2025

---

## Database Scripts

**Location**: `scripts/database/`  
**Purpose**: Database management and maintenance

### 1. test-connection.sh ✅ ACTIVE
**Path**: `/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/scripts/database/test-connection.sh`  
**Purpose**: Test PostgreSQL database connection  
**Usage**: 
```bash
bash scripts/database/test-connection.sh
```
**What it does**:
- Tests connection to PostgreSQL
- Validates credentials
- Shows connection status
- Helpful for troubleshooting

**Status**: ✅ ACTIVE - Essential for DB troubleshooting  
**Size**: 2.3K  
**Last Modified**: Sep 30, 2025

---

### 2. migrate.sh ✅ ACTIVE
**Path**: `/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/scripts/database/migrate.sh`  
**Purpose**: Run database migrations  
**Usage**: 
```bash
bash scripts/database/migrate.sh
```
**What it does**:
- Applies schema migrations
- Updates database structure
- Runs migration files from config/database/migrations/

**Status**: ✅ ACTIVE - Critical for database updates  
**Size**: 4.3K  
**Last Modified**: Sep 30, 2025

---

### 3. fix-connection.sh ✅ ACTIVE
**Path**: `/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/scripts/database/fix-connection.sh`  
**Purpose**: Fix common database connection issues  
**Usage**: 
```bash
bash scripts/database/fix-connection.sh
```
**What it does**:
- Diagnoses connection problems
- Suggests fixes
- Tests connection after fixes

**Status**: ✅ ACTIVE - Troubleshooting tool  
**Size**: 3.0K  
**Last Modified**: Sep 30, 2025

---

### 4. update-whitelist.sh ✅ ACTIVE
**Path**: `/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/scripts/database/update-whitelist.sh`  
**Purpose**: Update IP whitelist for database access  
**Usage**: 
```bash
bash scripts/database/update-whitelist.sh
```
**What it does**:
- Gets current public IP
- Updates database firewall rules
- Helpful for cloud databases

**Status**: ✅ ACTIVE - For cloud database access  
**Size**: 3.2K  
**Last Modified**: Sep 30, 2025

---

### 5. fix-mat-needs.js ✅ ACTIVE
**Path**: `/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/scripts/database/fix-mat-needs.js`  
**Purpose**: Fix MAT needs data format  
**Usage**: 
```bash
node scripts/database/fix-mat-needs.js
```
**What it does**:
- Corrects MAT needs data format
- Database data cleanup
- One-time or periodic maintenance

**Status**: ✅ ACTIVE - Data maintenance  
**Size**: 1.5K  
**Last Modified**: Sep 30, 2025

---

## Deployment Scripts

**Location**: `scripts/deploy/`  
**Purpose**: Deployment automation

### 1. deploy.sh ✅ ACTIVE
**Path**: `/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/scripts/deploy/deploy.sh`  
**Purpose**: Main deployment script  
**Usage**: 
```bash
bash scripts/deploy/deploy.sh
```
**What it does**:
- Builds production assets
- Runs tests
- Deploys to production
- Full deployment workflow

**Status**: ✅ ACTIVE - Production deployment  
**Size**: 4.4K  
**Last Modified**: Sep 30, 2025

---

### 2. prepare-netlify.js ✅ ACTIVE
**Path**: `/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/scripts/deploy/prepare-netlify.js`  
**Purpose**: Prepare project for Netlify deployment  
**Usage**: 
```bash
node scripts/deploy/prepare-netlify.js
```
**What it does**:
- Configures for Netlify
- Creates necessary config files
- Prepares build directory

**Status**: ✅ ACTIVE - Netlify deployment  
**Size**: 3.9K  
**Last Modified**: Sep 30, 2025

---

### 3. setup-netlify-db.js ✅ ACTIVE
**Path**: `/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/scripts/deploy/setup-netlify-db.js`  
**Purpose**: Setup database for Netlify environment  
**Usage**: 
```bash
node scripts/deploy/setup-netlify-db.js
```
**What it does**:
- Configures database for Netlify
- Sets up environment variables
- Database initialization

**Status**: ✅ ACTIVE - Netlify DB setup  
**Size**: 3.2K  
**Last Modified**: Sep 30, 2025

---

### 4. setup-railway.sh ✅ ACTIVE
**Path**: `/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/scripts/deploy/setup-railway.sh`  
**Purpose**: Setup Railway deployment  
**Usage**: 
```bash
bash scripts/deploy/setup-railway.sh
```
**What it does**:
- Configures for Railway platform
- Sets up environment
- Prepares deployment

**Status**: ✅ ACTIVE - Railway deployment  
**Size**: 1.7K  
**Last Modified**: Sep 30, 2025

---

## Utility Scripts

**Location**: `scripts/utilities/`  
**Purpose**: Utility and maintenance scripts

### 1. health-check.sh ✅ ACTIVE
**Path**: `/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/scripts/utilities/health-check.sh`  
**Purpose**: System health monitoring  
**Usage**: 
```bash
bash scripts/utilities/health-check.sh
# or
./health  # Quick command
```
**What it does**:
- Checks API server status
- Checks UI server status
- Verifies database connection
- Shows system health

**Status**: ✅ ACTIVE - Essential monitoring  
**Size**: 3.0K  
**Last Modified**: Sep 30, 2025

---

### 2. fix-cache-restart.sh ✅ ACTIVE
**Path**: `/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/scripts/utilities/fix-cache-restart.sh`  
**Purpose**: Clear cache and restart servers  
**Usage**: 
```bash
bash scripts/utilities/fix-cache-restart.sh
```
**What it does**:
- Kills old server processes
- Clears Vite cache
- Restarts fresh servers
- Fixes browser cache issues

**Status**: ✅ ACTIVE - Troubleshooting tool  
**Size**: 9.0K  
**Last Modified**: Sep 30, 2025

---

### 3. security-scanner.sh ✅ ACTIVE
**Path**: `/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/scripts/utilities/security-scanner.sh`  
**Purpose**: Run security scans  
**Usage**: 
```bash
bash scripts/utilities/security-scanner.sh
```
**What it does**:
- Scans for security vulnerabilities
- Checks dependencies
- Generates security report

**Status**: ✅ ACTIVE - Security auditing  
**Size**: 10K  
**Last Modified**: Sep 30, 2025

---

### 4. setup-security.sh ✅ ACTIVE
**Path**: `/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/scripts/utilities/setup-security.sh`  
**Purpose**: Setup security tools and configurations  
**Usage**: 
```bash
bash scripts/utilities/setup-security.sh
```
**What it does**:
- Installs security tools
- Configures security settings
- Sets up git hooks for security

**Status**: ✅ ACTIVE - Security setup  
**Size**: 11K  
**Last Modified**: Sep 30, 2025

---

## Backup Scripts

**Location**: `scripts/backup/`  
**Purpose**: Backup and archived scripts

### 1. reorganize-v1.sh 📦 ARCHIVED
**Path**: `/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/scripts/backup/reorganize-v1.sh`  
**Purpose**: First reorganization attempt (superseded by BATCH_MOVE.sh)  
**Usage**: N/A - Historical reference only  
**What it does**:
- First attempt at reorganization
- Superseded by BATCH_MOVE.sh

**Status**: 📦 ARCHIVED - Historical reference  
**Size**: Unknown  
**Last Modified**: Sep 30, 2025  
**Note**: Keep for reference, do not use

---

## Quick Commands

**Location**: Repository root  
**Purpose**: Convenient shortcuts for common tasks

### 1. start ✅ ACTIVE
**Path**: `/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/start`  
**Purpose**: Quick start command  
**Usage**: 
```bash
./start
```
**What it does**:
- Executes `bash scripts/dev/start.sh`
- Simplest way to start servers

**Status**: ✅ ACTIVE - Primary quick command  
**Size**: 38 bytes  
**Last Modified**: Sep 30, 2025

---

### 2. stop ✅ ACTIVE
**Path**: `/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/stop`  
**Purpose**: Quick stop command  
**Usage**: 
```bash
./stop
```
**What it does**:
- Kills processes on ports 3001, 5173, 5174
- Stops all servers gracefully

**Status**: ✅ ACTIVE - Quick stop  
**Size**: 246 bytes  
**Last Modified**: Sep 30, 2025

---

### 3. health ✅ ACTIVE
**Path**: `/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/health`  
**Purpose**: Quick health check  
**Usage**: 
```bash
./health
```
**What it does**:
- Executes `bash scripts/utilities/health-check.sh`
- Quick system status

**Status**: ✅ ACTIVE - Quick health check  
**Size**: 51 bytes  
**Last Modified**: Sep 30, 2025

---

## Script Status Summary

### Active Scripts (18)
**Development**: 6 active, 1 needs review  
- ✅ start.sh
- ✅ start-all.sh
- ✅ start-both.sh
- ⚠️ start-env.sh (needs path review)
- ✅ test-ngrok.sh
- ⚠️ start-node.js (verify if used)

**Database**: 5 active  
- ✅ test-connection.sh
- ✅ migrate.sh
- ✅ fix-connection.sh
- ✅ update-whitelist.sh
- ✅ fix-mat-needs.js

**Deployment**: 4 active  
- ✅ deploy.sh
- ✅ prepare-netlify.js
- ✅ setup-netlify-db.js
- ✅ setup-railway.sh

**Utilities**: 4 active  
- ✅ health-check.sh
- ✅ fix-cache-restart.sh
- ✅ security-scanner.sh
- ✅ setup-security.sh

**Quick Commands**: 3 active  
- ✅ start
- ✅ stop
- ✅ health

### Needs Review (2)
- ⚠️ scripts/dev/start-env.sh - Check for old paths
- ⚠️ scripts/dev/start-node.js - Verify if still used

### Archived (1)
- 📦 scripts/backup/reorganize-v1.sh

### Candidates for Archiving (1)
- 📦 scripts/dev/start-legacy.sh - Test and potentially archive

---

## Recommended Actions

### Immediate
1. ⚠️ **Review start-env.sh** - Update paths to v2.0 structure
2. ⚠️ **Review start-node.js** - Verify if still needed
3. 📦 **Test start-legacy.sh** - Archive if redundant with start.sh

### Short Term
1. Add headers to scripts without them
2. Create unit tests for critical scripts
3. Document environment variables needed

### Long Term
1. Consider consolidating start scripts (start.sh, start-all.sh, start-both.sh)
2. Create automated script testing
3. Add error handling to all scripts

---

## Usage Guide

### Daily Development
```bash
./start          # Start development
./health         # Check status
./stop           # Stop when done
```

### Database Work
```bash
bash scripts/database/test-connection.sh    # Test connection
bash scripts/database/migrate.sh            # Run migrations
```

### Deployment
```bash
bash scripts/deploy/deploy.sh               # Deploy to production
```

### Troubleshooting
```bash
bash scripts/utilities/fix-cache-restart.sh # Clear cache
bash scripts/utilities/health-check.sh      # Check health
```

---

## Script Maintenance

### Adding New Scripts
1. Create in appropriate `scripts/` subdirectory
2. Add header with purpose, usage, location
3. Make executable: `chmod +x script.sh`
4. Update this index
5. Test thoroughly
6. Commit

### Archiving Old Scripts
1. Test if script still works
2. Move to `scripts/backup/`
3. If definitely not needed, move to `.archive/deprecated/scripts/`
4. Document why in `.archive/deprecated/README.md`
5. Update this index

---

## Notes

- All scripts updated to v2.0 paths (src/api, src/web)
- All scripts are executable
- All scripts in correct categories
- Quick commands provide shortcuts for common tasks
- Legacy scripts preserved in backup/

---

**Index Maintainer**: System Documentation  
**Last Index Update**: September 30, 2025  
**Next Review**: When new scripts added or structure changes
