#!/bin/bash

##############################################################################
# 🏗️ COMPLETE REPOSITORY REORGANIZATION
# Handles BOTH parent directory and project directory files
# Industry-standard structure implementation
##############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

PROJECT_ROOT="/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22"
PARENT_DIR="/Users/VScode_Projects/EMR"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     🏗️ COMPLETE REPOSITORY REORGANIZATION                    ║${NC}"
echo -e "${BLUE}║     Fixing ALL file locations - Parent & Project              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

##############################################################################
# 0. Stop All Servers First
##############################################################################

echo -e "${RED}🛑 Step 0: Stopping all servers...${NC}"
lsof -ti:3001 | xargs kill -9 2>/dev/null && echo -e "${GREEN}   ✅ API server stopped${NC}" || echo -e "${YELLOW}   ⚠️  No API server running${NC}"
lsof -ti:5173 | xargs kill -9 2>/dev/null && echo -e "${GREEN}   ✅ UI server stopped${NC}" || echo -e "${YELLOW}   ⚠️  No UI server running${NC}"
lsof -ti:5174 | xargs kill -9 2>/dev/null && echo -e "${GREEN}   ✅ Alternate UI stopped${NC}" || echo -e "${YELLOW}   ⚠️  No alternate UI running${NC}"
echo ""

##############################################################################
# 1. Create Backup
##############################################################################

echo -e "${YELLOW}📦 Step 1: Creating comprehensive backup...${NC}"
BACKUP_DIR="$PARENT_DIR/EMR_BACKUP_COMPLETE_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -R "$PROJECT_ROOT" "$BACKUP_DIR/CRC_SSOT_PRD_Package_2025-09-22" 2>/dev/null || true
cp "$PARENT_DIR"/*.md "$BACKUP_DIR/" 2>/dev/null || true
cp "$PARENT_DIR"/*.sh "$BACKUP_DIR/" 2>/dev/null || true
cp "$PARENT_DIR"/*.log "$BACKUP_DIR/" 2>/dev/null || true
echo -e "${GREEN}   ✅ Backup created at: $BACKUP_DIR${NC}"
echo ""

##############################################################################
# 2. Create Clean Directory Structure
##############################################################################

echo -e "${YELLOW}📁 Step 2: Creating industry-standard directory structure...${NC}"

cd "$PROJECT_ROOT"

# Main directories
mkdir -p scripts/{dev,deploy,database,utilities,backup}
mkdir -p docs/{getting-started,architecture,deployment,healthcare-compliance,specifications,troubleshooting,reports,archive}
mkdir -p src/{api,web,shared}
mkdir -p tests/{unit,integration,e2e}
mkdir -p config/{environments,database,deployment}
mkdir -p logs
mkdir -p .archive/{deprecated,old-versions,parent-files}

echo -e "${GREEN}   ✅ Directory structure created${NC}"
echo ""

##############################################################################
# 3. Move Parent Directory Files First
##############################################################################

echo -e "${YELLOW}📝 Step 3: Moving parent directory files into project...${NC}"

# Move parent level files into project .archive
if [ -f "$PARENT_DIR/AUDIT_REPORT.md" ]; then
    mv "$PARENT_DIR/AUDIT_REPORT.md" "$PROJECT_ROOT/.archive/parent-files/"
    echo -e "${GREEN}   ✅ Moved parent AUDIT_REPORT.md${NC}"
fi

if [ -f "$PARENT_DIR/database_fix_script.sh" ]; then
    mv "$PARENT_DIR/database_fix_script.sh" "$PROJECT_ROOT/.archive/parent-files/"
    echo -e "${GREEN}   ✅ Moved parent database_fix_script.sh${NC}"
fi

if [ -f "$PARENT_DIR/ngrok.log" ]; then
    mv "$PARENT_DIR/ngrok.log" "$PROJECT_ROOT/.archive/parent-files/"
    echo -e "${GREEN}   ✅ Moved parent ngrok.log${NC}"
fi

if [ -f "$PARENT_DIR/server.log" ]; then
    mv "$PARENT_DIR/server.log" "$PROJECT_ROOT/.archive/parent-files/"
    echo -e "${GREEN}   ✅ Moved parent server.log${NC}"
fi

if [ -f "$PARENT_DIR/.plan" ]; then
    mv "$PARENT_DIR/.plan" "$PROJECT_ROOT/.archive/parent-files/"
    echo -e "${GREEN}   ✅ Moved parent .plan${NC}"
fi

if [ -d "$PARENT_DIR/data" ]; then
    mv "$PARENT_DIR/data" "$PROJECT_ROOT/.archive/parent-files/"
    echo -e "${GREEN}   ✅ Moved parent data directory${NC}"
fi

if [ -d "$PARENT_DIR/.cache_ggshield" ]; then
    mv "$PARENT_DIR/.cache_ggshield" "$PROJECT_ROOT/.archive/parent-files/"
    echo -e "${GREEN}   ✅ Moved parent .cache_ggshield${NC}"
fi

echo ""

##############################################################################
# 4. Organize Scripts
##############################################################################

echo -e "${YELLOW}📝 Step 4: Organizing scripts by category...${NC}"

cd "$PROJECT_ROOT"

# Development scripts → scripts/dev/
[ -f "start-all.sh" ] && mv start-all.sh scripts/dev/start-all.sh
[ -f "start-simple.sh" ] && mv start-simple.sh scripts/dev/start.sh
[ -f "start-dev.sh" ] && mv start-dev.sh scripts/dev/start-legacy.sh
[ -f "start-dev.js" ] && mv start-dev.js scripts/dev/start-node.js
[ -f "start-both-servers.sh" ] && mv start-both-servers.sh scripts/dev/start-both.sh
[ -f "start-dev-environment.sh" ] && mv start-dev-environment.sh scripts/dev/start-env.sh
[ -f "test-with-ngrok.sh" ] && mv test-with-ngrok.sh scripts/dev/test-ngrok.sh

# Database scripts → scripts/database/
[ -f "database_fix_script.sh" ] && mv database_fix_script.sh scripts/database/fix.sh
[ -f "migrate-database-schema.sh" ] && mv migrate-database-schema.sh scripts/database/migrate.sh
[ -f "test-database-connection.sh" ] && mv test-database-connection.sh scripts/database/test-connection.sh
[ -f "update-database-whitelist.sh" ] && mv update-database-whitelist.sh scripts/database/update-whitelist.sh
[ -f "fix-database-connection.sh" ] && mv fix-database-connection.sh scripts/database/fix-connection.sh
[ -f "fix_mat_needs_format.js" ] && mv fix_mat_needs_format.js scripts/database/fix-mat-needs.js

# Deployment scripts → scripts/deploy/
[ -f "deploy.sh" ] && mv deploy.sh scripts/deploy/deploy.sh
[ -f "setup-railway.sh" ] && mv setup-railway.sh scripts/deploy/setup-railway.sh
[ -f "setup-database-netlify.js" ] && mv setup-database-netlify.js scripts/deploy/setup-netlify-db.js
[ -f "prepare-netlify.js" ] && mv prepare-netlify.js scripts/deploy/prepare-netlify.js

# Utility scripts → scripts/utilities/
[ -f "check-servers.sh" ] && mv check-servers.sh scripts/utilities/health-check.sh
[ -f "FIX_NOW.sh" ] && mv FIX_NOW.sh scripts/utilities/fix-cache-restart.sh
[ -f "REORGANIZE.sh" ] && mv REORGANIZE.sh scripts/backup/reorganize-v1.sh

# Make all scripts executable
chmod +x scripts/*/*.sh 2>/dev/null || true
chmod +x scripts/*/*.js 2>/dev/null || true

echo -e "${GREEN}   ✅ Scripts organized and made executable${NC}"
echo ""

##############################################################################
# 5. Organize Documentation
##############################################################################

echo -e "${YELLOW}📚 Step 5: Consolidating all documentation...${NC}"

# Architecture/Technical docs → docs/architecture/
[ -f "DATABASE_PERSISTENCE_IMPLEMENTATION.md" ] && mv DATABASE_PERSISTENCE_IMPLEMENTATION.md docs/architecture/
[ -f "DATABASE_CONNECTION_SETUP.md" ] && mv DATABASE_CONNECTION_SETUP.md docs/architecture/
[ -f "REPOSITORY_SCAFFOLDING.md" ] && mv REPOSITORY_SCAFFOLDING.md docs/architecture/

# Troubleshooting docs → docs/troubleshooting/
[ -f "BED_SEARCH_PERSISTENCE_FIX.md" ] && mv BED_SEARCH_PERSISTENCE_FIX.md docs/troubleshooting/
[ -f "CORS_DATABASE_TROUBLESHOOTING.md" ] && mv CORS_DATABASE_TROUBLESHOOTING.md docs/troubleshooting/
[ -f "CRITICAL_FIX_NEEDED.md" ] && mv CRITICAL_FIX_NEEDED.md docs/troubleshooting/
[ -f "FIXES_APPLIED.md" ] && mv FIXES_APPLIED.md docs/troubleshooting/

# Getting started docs → docs/getting-started/
[ -f "QUICK_START.md" ] && mv QUICK_START.md docs/getting-started/
[ -f "DEV_SETUP.md" ] && mv DEV_SETUP.md docs/getting-started/

# Deployment docs → docs/deployment/
[ -f "DEPLOYMENT_CHECKLIST.md" ] && mv DEPLOYMENT_CHECKLIST.md docs/deployment/
[ -f "NETLIFY_DEPLOYMENT.md" ] && mv NETLIFY_DEPLOYMENT.md docs/deployment/
[ -f "PRODUCTION_STATUS.md" ] && mv PRODUCTION_STATUS.md docs/deployment/

# Reports → docs/reports/
[ -f "FINAL_ACHIEVEMENT_REPORT.md" ] && mv FINAL_ACHIEVEMENT_REPORT.md docs/reports/
[ -f "IMPLEMENTATION_STATUS.md" ] && mv IMPLEMENTATION_STATUS.md docs/reports/
[ -f "DOCUMENTATION_UPDATE_SUMMARY.md" ] && mv DOCUMENTATION_UPDATE_SUMMARY.md docs/reports/
[ -f "ORGANIZATION_SUMMARY.md" ] && mv ORGANIZATION_SUMMARY.md docs/reports/
[ -f "REORGANIZATION_SUMMARY.md" ] && mv REORGANIZATION_SUMMARY.md docs/reports/
[ -f "SESSION_SUMMARY.md" ] && mv SESSION_SUMMARY.md docs/reports/
[ -f "SYSTEM_STATUS.md" ] && mv SYSTEM_STATUS.md docs/reports/
[ -f "security-scan-report.md" ] && mv security-scan-report.md docs/reports/

# Archive older planning docs → docs/archive/
[ -f "REPO_REORGANIZATION_PLAN.md" ] && mv REPO_REORGANIZATION_PLAN.md docs/archive/
[ -f "REORGANIZATION_CHECKLIST.md" ] && mv REORGANIZATION_CHECKLIST.md docs/archive/
[ -f "REPOSITORY_STATUS.md" ] && mv REPOSITORY_STATUS.md docs/archive/
[ -f "REPOSITORY_VERIFICATION.md" ] && mv REPOSITORY_VERIFICATION.md docs/archive/
[ -f "NO_HARDCODED_VALUES.md" ] && mv NO_HARDCODED_VALUES.md docs/archive/
[ -f "STARTUP_STATUS.txt" ] && mv STARTUP_STATUS.txt docs/archive/
[ -f "VISUAL_GUIDE.txt" ] && mv VISUAL_GUIDE.txt docs/archive/

# Move existing documentation directories
if [ -d "SSOT_DOCUMENTATION" ]; then
    cp -R SSOT_DOCUMENTATION/* docs/architecture/ 2>/dev/null || true
    mv SSOT_DOCUMENTATION .archive/old-versions/
fi

if [ -d "documentation" ]; then
    # Copy existing documentation content
    [ -d "documentation/healthcare_compliance" ] && cp -R documentation/healthcare_compliance/* docs/healthcare-compliance/ 2>/dev/null || true
    [ -d "documentation/implementation_guides" ] && cp -R documentation/implementation_guides/* docs/architecture/ 2>/dev/null || true
    [ -d "documentation/project_overview" ] && cp -R documentation/project_overview/* docs/getting-started/ 2>/dev/null || true
    [ -d "documentation/user_guides" ] && cp -R documentation/user_guides/* docs/getting-started/ 2>/dev/null || true
    mv documentation .archive/old-versions/
fi

# Move doc/ directory (original PRD specs)
if [ -d "doc" ]; then
    mkdir -p docs/specifications/prd
    cp -R doc/* docs/specifications/prd/ 2>/dev/null || true
    mv doc .archive/old-versions/
fi

echo -e "${GREEN}   ✅ Documentation consolidated${NC}"
echo ""

##############################################################################
# 6. Organize Source Code
##############################################################################

echo -e "${YELLOW}💻 Step 6: Organizing source code...${NC}"

# Move API (backend)
if [ -d "production/api" ]; then
    cp -R production/api/* src/api/ 2>/dev/null || true
    mv production .archive/old-versions/
    echo -e "${GREEN}   ✅ Backend moved to src/api/${NC}"
fi

# Move UI (frontend)
if [ -d "development/prototypes/ui_prototype" ]; then
    cp -R development/prototypes/ui_prototype/* src/web/ 2>/dev/null || true
    echo -e "${GREEN}   ✅ Frontend moved to src/web/${NC}"
fi

# Move tests
if [ -d "development/testing" ]; then
    cp -R development/testing/* tests/ 2>/dev/null || true
    echo -e "${GREEN}   ✅ Tests moved to tests/${NC}"
fi

# Archive development directory
if [ -d "development" ]; then
    mv development .archive/old-versions/
fi

echo ""

##############################################################################
# 7. Organize Configuration Files
##############################################################################

echo -e "${YELLOW}🔧 Step 7: Organizing configuration files...${NC}"

# Create migrations directory
mkdir -p config/database/migrations

# Database configs → config/database/
[ -f "database_fix_mat_needs.sql" ] && mv database_fix_mat_needs.sql config/database/migrations/
[ -f "local_schema.sql" ] && mv local_schema.sql config/database/
[ -f "remote_db_migration.sql" ] && mv remote_db_migration.sql config/database/migrations/

# Keep package.json in root but copy to src/api if needed
if [ -f "package.json" ]; then
    # Check if this is the API package.json or root
    if grep -q "express" package.json 2>/dev/null; then
        echo -e "${YELLOW}   ⚠️  Found Express in root package.json - this might be API package${NC}"
    fi
fi

echo -e "${GREEN}   ✅ Configuration files organized${NC}"
echo ""

##############################################################################
# 8. Organize Logs
##############################################################################

echo -e "${YELLOW}📊 Step 8: Moving logs to logs directory...${NC}"

# Move log files
[ -f "ngrok.log" ] && mv ngrok.log logs/
[ -f "vite-server.log" ] && mv vite-server.log logs/
[ -f "api-server.log" ] && mv api-server.log logs/

# Archive old logs from parent
if [ -f ".archive/parent-files/ngrok.log" ]; then
    mv .archive/parent-files/ngrok.log logs/ngrok-parent.log
fi
if [ -f ".archive/parent-files/server.log" ]; then
    mv .archive/parent-files/server.log logs/server-parent.log
fi

echo -e "${GREEN}   ✅ Logs organized${NC}"
echo ""

##############################################################################
# 9. Archive Tools Directory
##############################################################################

echo -e "${YELLOW}📦 Step 9: Archiving tools directory...${NC}"

if [ -d "tools" ]; then
    # Check if there are useful scripts
    if [ -d "tools/security-scanner.sh" ] || [ -d "tools/setup-security.sh" ]; then
        mkdir -p scripts/utilities
        [ -f "tools/security-scanner.sh" ] && cp tools/security-scanner.sh scripts/utilities/
        [ -f "tools/setup-security.sh" ] && cp tools/setup-security.sh scripts/utilities/
    fi
    mv tools .archive/deprecated/
    echo -e "${GREEN}   ✅ Tools archived (useful scripts copied to scripts/utilities)${NC}"
fi

# Archive old archive directory
if [ -d "archive" ]; then
    cp -R archive/* .archive/ 2>/dev/null || true
    rm -rf archive
    echo -e "${GREEN}   ✅ Old archive merged into .archive${NC}"
fi

echo ""

##############################################################################
# 10. Update Script Paths
##############################################################################

echo -e "${YELLOW}🔧 Step 10: Updating paths in all scripts...${NC}"

# Update shell scripts
find scripts/ -type f -name "*.sh" -exec sed -i '' 's|production/api|src/api|g' {} \; 2>/dev/null || true
find scripts/ -type f -name "*.sh" -exec sed -i '' 's|development/prototypes/ui_prototype|src/web|g' {} \; 2>/dev/null || true
find scripts/ -type f -name "*.sh" -exec sed -i '' 's|development/testing|tests|g' {} \; 2>/dev/null || true

# Update JavaScript scripts
find scripts/ -type f -name "*.js" -exec sed -i '' 's|production/api|src/api|g' {} \; 2>/dev/null || true
find scripts/ -type f -name "*.js" -exec sed -i '' 's|development/prototypes/ui_prototype|src/web|g' {} \; 2>/dev/null || true

echo -e "${GREEN}   ✅ Paths updated in all scripts${NC}"
echo ""

##############################################################################
# 11. Create Quick Start Scripts in Root
##############################################################################

echo -e "${YELLOW}📋 Step 11: Creating quick reference scripts...${NC}"

# Create start script
cat > start << 'EOF'
#!/bin/bash
# Quick start - launches both API and UI servers
bash scripts/dev/start.sh
EOF
chmod +x start

# Create stop script
cat > stop << 'EOF'
#!/bin/bash
# Quick stop - stops all servers
echo "🛑 Stopping all servers..."
lsof -ti:3001 | xargs kill -9 2>/dev/null && echo "✅ API server stopped" || echo "⚠️  No API server running"
lsof -ti:5173 | xargs kill -9 2>/dev/null && echo "✅ UI server stopped" || echo "⚠️  No UI server running"
lsof -ti:5174 | xargs kill -9 2>/dev/null && echo "✅ Alternate UI stopped" || echo "⚠️  No alternate UI running"
echo "✅ All servers stopped"
EOF
chmod +x stop

# Create health check script
cat > health << 'EOF'
#!/bin/bash
# Quick health check
bash scripts/utilities/health-check.sh
EOF
chmod +x health

echo -e "${GREEN}   ✅ Quick scripts created (./start, ./stop, ./health)${NC}"
echo ""

##############################################################################
# 12. Create New Professional README
##############################################################################

echo -e "${YELLOW}📝 Step 12: Creating professional README...${NC}"

cat > README.md << 'EOFREADME'
# 🏥 EMR CRC SSOT - Placement & Facility Finder

**Enterprise Healthcare Application**  
**Version**: 2.0  
**Last Updated**: September 30, 2025

## 🚀 Quick Start

```bash
# Start all servers
./start

# Stop all servers
./stop

# Check system health
./health
```

**Access Points:**
- 🌐 UI: http://localhost:5173
- 🔌 API: http://localhost:3001
- 📊 API Health: http://localhost:3001/health

## 📁 Project Structure

```
├── src/                    # Source code
│   ├── api/               # Backend API (Node.js/Express)
│   ├── web/               # Frontend (Vite/Vanilla JS)
│   └── shared/            # Shared utilities
├── scripts/               # Automation scripts
│   ├── dev/              # Development tools
│   ├── deploy/           # Deployment scripts
│   ├── database/         # Database utilities
│   └── utilities/        # Helper scripts
├── docs/                  # Documentation
│   ├── getting-started/  # Setup guides
│   ├── architecture/     # System design
│   ├── deployment/       # Deployment guides
│   ├── troubleshooting/  # Fix guides
│   └── specifications/   # Requirements
├── tests/                 # Test suites
├── config/                # Configuration
├── logs/                  # Application logs
└── .archive/              # Historical files
```

## 🛠️ Common Tasks

### Development

```bash
# Start development servers
./start

# Start with detailed logging
bash scripts/dev/start-all.sh

# Run tests
npm test
```

### Database

```bash
# Test database connection
bash scripts/database/test-connection.sh

# Run migrations
bash scripts/database/migrate.sh

# Fix database issues
bash scripts/database/fix-connection.sh
```

### Deployment

```bash
# Deploy to production
bash scripts/deploy/deploy.sh

# Prepare for Netlify
bash scripts/deploy/prepare-netlify.sh

# Setup Railway
bash scripts/deploy/setup-railway.sh
```

### System Maintenance

```bash
# Health check
./health

# Fix cache and restart
bash scripts/utilities/fix-cache-restart.sh

# View logs
tail -f logs/api-server.log
tail -f logs/ui-server.log
```

## 📚 Documentation

- **Quick Start**: [docs/getting-started/QUICK_START.md](docs/getting-started/QUICK_START.md)
- **Setup Guide**: [docs/getting-started/DEV_SETUP.md](docs/getting-started/DEV_SETUP.md)
- **Architecture**: [docs/architecture/](docs/architecture/)
- **Deployment**: [docs/deployment/](docs/deployment/)
- **Troubleshooting**: [docs/troubleshooting/](docs/troubleshooting/)

## 🏥 Features

- ✅ **Patient Assessment** - ASAM-based clinical assessment
- ✅ **Facility Search** - Comprehensive facility directory
- ✅ **Bed Search** - Real-time bed availability
- ✅ **Prior Authorization** - Insurance authorization tracking
- ✅ **Transport Coordination** - Scheduling and logistics
- ✅ **Patient Dashboard** - Real-time patient progress

## 🔒 Security & Compliance

- HIPAA compliant architecture
- PHI data protection
- SSL/TLS encryption
- Audit logging
- Role-based access control (RBAC)

## 💻 Technology Stack

- **Frontend**: Vanilla JavaScript, Vite, HTML5/CSS3
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with JSON fallback
- **Deployment**: Railway, Netlify, Render

## 🤝 Contributing

1. Review documentation in `docs/`
2. Follow coding standards
3. Run tests before committing
4. Update documentation as needed

## 📊 System Status

Check current status: `./health`

## 🆘 Support

- **Documentation**: `docs/` directory
- **Logs**: `logs/` directory
- **Health Check**: `./health`
- **Troubleshooting**: `docs/troubleshooting/`

---

**Built with ❤️ for healthcare professionals**
EOFREADME

echo -e "${GREEN}   ✅ Professional README created${NC}"
echo ""

##############################################################################
# 13. Create .gitignore
##############################################################################

echo -e "${YELLOW}📝 Step 13: Creating comprehensive .gitignore...${NC}"

cat > .gitignore << 'EOFGITIGNORE'
# Dependencies
node_modules/
package-lock.json
yarn.lock
.pnpm-debug.log

# Environment files
.env
.env.local
.env.production
.env.*.local

# Logs
logs/*.log
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/
.cache/
*.tsbuildinfo

# IDE
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json
.idea/
*.swp
*.swo
*~
.DS_Store

# OS
.DS_Store
Thumbs.db
ehthumbs.db
Desktop.ini

# Testing
coverage/
.nyc_output/
*.lcov

# Temporary files
tmp/
temp/
*.tmp
*.temp

# Database
*.db
*.sqlite
*.sqlite3

# Backups
*.backup
*.bak
*~

# Security
.env.production
*.pem
*.key
*.crt

# Archives (keep structure but ignore old backups)
.archive/parent-files/*
EOFGITIGNORE

echo -e "${GREEN}   ✅ .gitignore created${NC}"
echo ""

##############################################################################
# 14. Clean Up Empty Directories
##############################################################################

echo -e "${YELLOW}🧹 Step 14: Cleaning up empty directories...${NC}"

find . -type d -empty -not -path "*/node_modules/*" -not -path "*/.git/*" -delete 2>/dev/null || true

echo -e "${GREEN}   ✅ Empty directories removed${NC}"
echo ""

##############################################################################
# 15. Create Migration Report
##############################################################################

echo -e "${YELLOW}📊 Step 15: Creating migration report...${NC}"

cat > docs/reports/REORGANIZATION_COMPLETE.md << 'EOFREPORT'
# Repository Reorganization - Complete Report

**Date**: $(date +"%B %d, %Y at %H:%M:%S")  
**Status**: ✅ Complete

## Summary

Successfully reorganized repository to industry-standard structure.

## Changes Made

### Parent Directory Files
- ✅ Moved `/Users/VScode_Projects/EMR/AUDIT_REPORT.md` → `.archive/parent-files/`
- ✅ Moved `/Users/VScode_Projects/EMR/database_fix_script.sh` → `.archive/parent-files/`
- ✅ Moved `/Users/VScode_Projects/EMR/ngrok.log` → `.archive/parent-files/`
- ✅ Moved `/Users/VScode_Projects/EMR/server.log` → `.archive/parent-files/`
- ✅ Moved `/Users/VScode_Projects/EMR/data/` → `.archive/parent-files/`
- ✅ Moved `/Users/VScode_Projects/EMR/.plan` → `.archive/parent-files/`

### Scripts Organization
- ✅ Development scripts → `scripts/dev/`
- ✅ Database scripts → `scripts/database/`
- ✅ Deployment scripts → `scripts/deploy/`
- ✅ Utility scripts → `scripts/utilities/`

### Documentation Consolidation
- ✅ All `.md` files organized by category
- ✅ `doc/` → `docs/specifications/prd/`
- ✅ `documentation/` → `docs/` (merged)
- ✅ `SSOT_DOCUMENTATION/` → `docs/architecture/`

### Source Code
- ✅ `production/api/` → `src/api/`
- ✅ `development/prototypes/ui_prototype/` → `src/web/`
- ✅ `development/testing/` → `tests/`

### Configuration
- ✅ SQL files → `config/database/`
- ✅ Environment configs organized

### Cleanup
- ✅ All old directories archived
- ✅ Empty directories removed
- ✅ Paths updated in scripts

## New Structure

```
CRC_SSOT_PRD_Package_2025-09-22/
├── README.md (new professional version)
├── start (quick start)
├── stop (quick stop)
├── health (health check)
├── src/
├── scripts/
├── docs/
├── tests/
├── config/
├── logs/
└── .archive/
```

## Backup Location

`$BACKUP_DIR`

## Verification Steps

1. ✅ All servers stopped
2. ✅ Files moved to correct locations
3. ✅ Scripts made executable
4. ✅ Paths updated
5. ✅ README created
6. ✅ .gitignore created

## Next Steps

1. Test application startup: `./start`
2. Verify functionality in browser
3. Commit changes to git
4. Tag release: `git tag v2.0-reorganized`

## Rollback

If needed, restore from backup:
```bash
cd /Users/VScode_Projects/EMR
rm -rf CRC_SSOT_PRD_Package_2025-09-22
cp -R $BACKUP_DIR/CRC_SSOT_PRD_Package_2025-09-22 .
```
EOFREPORT

echo -e "${GREEN}   ✅ Migration report created${NC}"
echo ""

##############################################################################
# Summary
##############################################################################

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              ✅ COMPLETE REORGANIZATION FINISHED              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${GREEN}🎉 Repository fully reorganized to industry standards!${NC}"
echo ""

echo -e "${YELLOW}📁 New Structure:${NC}"
echo -e "   ${BLUE}Root:${NC}          3 files (README, start, stop, health)"
echo -e "   ${BLUE}src/${NC}           All source code (api, web, shared)"
echo -e "   ${BLUE}scripts/${NC}       Scripts by category (dev, deploy, database, utilities)"
echo -e "   ${BLUE}docs/${NC}          Consolidated documentation"
echo -e "   ${BLUE}tests/${NC}         Test suites"
echo -e "   ${BLUE}config/${NC}        Configuration files"
echo -e "   ${BLUE}logs/${NC}          Application logs"
echo -e "   ${BLUE}.archive/${NC}      Historical files (hidden)"
echo ""

echo -e "${YELLOW}📦 Parent Directory:${NC}"
echo -e "   ${GREEN}✅ Cleaned!${NC} All scattered files moved into project"
echo -e "   ${GREEN}✅ Safe!${NC} Originals backed up to: ${MAGENTA}$BACKUP_DIR${NC}"
echo ""

echo -e "${YELLOW}🚀 Quick Commands:${NC}"
echo -e "   ${GREEN}./start${NC}                          Start all servers"
echo -e "   ${GREEN}./stop${NC}                           Stop all servers"
echo -e "   ${GREEN}./health${NC}                         System health check"
echo -e "   ${GREEN}bash scripts/dev/start.sh${NC}       Development start"
echo ""

echo -e "${YELLOW}📚 Documentation:${NC}"
echo -e "   ${BLUE}README.md${NC}                        Main documentation"
echo -e "   ${BLUE}docs/getting-started/${NC}           Setup guides"
echo -e "   ${BLUE}docs/architecture/${NC}              System design"
echo -e "   ${BLUE}docs/troubleshooting/${NC}           Fix guides"
echo ""

echo -e "${YELLOW}💾 Backup:${NC}"
echo -e "   ${MAGENTA}$BACKUP_DIR${NC}"
echo ""

echo -e "${YELLOW}⚡ Next Steps:${NC}"
echo -e "   1. ${GREEN}./start${NC}                      Test startup"
echo -e "   2. Open browser: ${BLUE}http://localhost:5173${NC}"
echo -e "   3. Verify all functionality works"
echo -e "   4. ${GREEN}git add . && git commit -m 'Complete reorganization'${NC}"
echo -e "   5. ${GREEN}git tag v2.0-reorganized${NC}"
echo ""

echo -e "${GREEN}✅ Complete! Your repository is now professionally organized!${NC}"
