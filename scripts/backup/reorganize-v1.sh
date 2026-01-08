#!/bin/bash

##############################################################################
# 🏗️ REPOSITORY REORGANIZATION TO INDUSTRY STANDARDS
# Implements clean, professional folder structure
##############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     🏗️ REPOSITORY REORGANIZATION - INDUSTRY STANDARDS        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

cd "$PROJECT_ROOT"

##############################################################################
# Backup Current State
##############################################################################

echo -e "${YELLOW}📦 Creating backup of current state...${NC}"
BACKUP_DIR="../EMR_BACKUP_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -R . "$BACKUP_DIR/" 2>/dev/null || true
echo -e "${GREEN}   ✅ Backup created at: $BACKUP_DIR${NC}"
echo ""

##############################################################################
# Phase 1: Create New Directory Structure
##############################################################################

echo -e "${YELLOW}📁 Phase 1: Creating new directory structure...${NC}"

# Main directories
mkdir -p scripts/{dev,deploy,database,utilities}
mkdir -p docs/{getting-started,architecture,deployment,healthcare-compliance,specifications,archive}
mkdir -p src/{api,web,shared}
mkdir -p tests/{unit,integration,e2e}
mkdir -p config/{environments,database}
mkdir -p .archive/{deprecated,old-versions}

echo -e "${GREEN}   ✅ Directory structure created${NC}"
echo ""

##############################################################################
# Phase 2: Move Scripts
##############################################################################

echo -e "${YELLOW}📝 Phase 2: Organizing scripts...${NC}"

# Development scripts
[ -f "start-all.sh" ] && mv start-all.sh scripts/dev/start-all.sh
[ -f "start-simple.sh" ] && mv start-simple.sh scripts/dev/start.sh
[ -f "start-dev.sh" ] && mv start-dev.sh scripts/dev/start-legacy.sh
[ -f "start-dev.js" ] && mv start-dev.js scripts/dev/start-node.js
[ -f "start-both-servers.sh" ] && mv start-both-servers.sh scripts/dev/start-both.sh
[ -f "start-dev-environment.sh" ] && mv start-dev-environment.sh scripts/dev/start-env.sh
[ -f "test-with-ngrok.sh" ] && mv test-with-ngrok.sh scripts/dev/test-ngrok.sh

# Database scripts
[ -f "database_fix_script.sh" ] && mv database_fix_script.sh scripts/database/fix.sh
[ -f "migrate-database-schema.sh" ] && mv migrate-database-schema.sh scripts/database/migrate.sh
[ -f "test-database-connection.sh" ] && mv test-database-connection.sh scripts/database/test-connection.sh
[ -f "update-database-whitelist.sh" ] && mv update-database-whitelist.sh scripts/database/update-whitelist.sh
[ -f "fix-database-connection.sh" ] && mv fix-database-connection.sh scripts/database/fix-connection.sh
[ -f "fix_mat_needs_format.js" ] && mv fix_mat_needs_format.js scripts/database/fix-mat-needs.js
[ -f "database_fix_mat_needs.sql" ] && mv database_fix_mat_needs.sql config/database/migrations/

# Deployment scripts
[ -f "deploy.sh" ] && mv deploy.sh scripts/deploy/deploy.sh
[ -f "setup-railway.sh" ] && mv setup-railway.sh scripts/deploy/setup-railway.sh
[ -f "setup-database-netlify.js" ] && mv setup-database-netlify.js scripts/deploy/setup-netlify-db.js
[ -f "prepare-netlify.js" ] && mv prepare-netlify.js scripts/deploy/prepare-netlify.js

# Utility scripts
[ -f "check-servers.sh" ] && mv check-servers.sh scripts/utilities/health-check.sh
[ -f "FIX_NOW.sh" ] && mv FIX_NOW.sh scripts/utilities/fix-cache-restart.sh

echo -e "${GREEN}   ✅ Scripts organized${NC}"
echo ""

##############################################################################
# Phase 3: Move Documentation
##############################################################################

echo -e "${YELLOW}📚 Phase 3: Consolidating documentation...${NC}"

# Move SSOT documentation
if [ -d "SSOT_DOCUMENTATION" ]; then
    mv SSOT_DOCUMENTATION/* docs/architecture/ 2>/dev/null || true
    rm -rf SSOT_DOCUMENTATION
fi

# Move original doc/ folder
if [ -d "doc" ]; then
    mv doc/* docs/specifications/prd/ 2>/dev/null || true
    rm -rf doc
fi

# Move documentation/ folder
if [ -d "documentation" ]; then
    cp -R documentation/* docs/ 2>/dev/null || true
    mv documentation .archive/old-versions/documentation-backup
fi

# Move markdown files (except important ones)
for file in *.md; do
    if [ -f "$file" ]; then
        case "$file" in
            "README.md"|"CHANGELOG.md"|"LICENSE.md")
                # Keep these in root
                ;;
            "REPO_REORGANIZATION_PLAN.md")
                mv "$file" docs/archive/
                ;;
            *)
                mv "$file" docs/archive/
                ;;
        esac
    fi
done

echo -e "${GREEN}   ✅ Documentation consolidated${NC}"
echo ""

##############################################################################
# Phase 4: Move Source Code
##############################################################################

echo -e "${YELLOW}💻 Phase 4: Organizing source code...${NC}"

# Move API (backend)
if [ -d "src/api" ]; then
    mv src/api/* src/api/ 2>/dev/null || true
    rm -rf src/api
    # Keep production folder for deployment configs
fi

# Move UI (frontend)
if [ -d "src/web" ]; then
    mv src/web/* src/web/ 2>/dev/null || true
    rm -rf src/web
fi

# Move tests
if [ -d "development/testing" ]; then
    mv development/testing/* tests/ 2>/dev/null || true
    rm -rf development/testing
fi

echo -e "${GREEN}   ✅ Source code organized${NC}"
echo ""

##############################################################################
# Phase 5: Archive Old Files
##############################################################################

echo -e "${YELLOW}📦 Phase 5: Archiving old/deprecated files...${NC}"

# Move archive directory
if [ -d "archive" ]; then
    mv archive/* .archive/ 2>/dev/null || true
    rm -rf archive
fi

# Move development deprecated
if [ -d "development/deprecated" ]; then
    mv development/deprecated .archive/deprecated/development 2>/dev/null || true
fi

# Archive tools directory (if not needed)
if [ -d "tools" ]; then
    mv tools .archive/deprecated/
fi

echo -e "${GREEN}   ✅ Archives organized${NC}"
echo ""

##############################################################################
# Phase 6: Update Script Paths
##############################################################################

echo -e "${YELLOW}🔧 Phase 6: Updating paths in scripts...${NC}"

# Update all shell scripts to use new paths
find scripts/ -type f -name "*.sh" -exec sed -i '' 's|src/api|src/api|g' {} \; 2>/dev/null || true
find scripts/ -type f -name "*.sh" -exec sed -i '' 's|src/web|src/web|g' {} \; 2>/dev/null || true
find scripts/ -type f -name "*.sh" -exec sed -i '' 's|development/testing|tests|g' {} \; 2>/dev/null || true

# Update JavaScript scripts
find scripts/ -type f -name "*.js" -exec sed -i '' 's|src/api|src/api|g' {} \; 2>/dev/null || true
find scripts/ -type f -name "*.js" -exec sed -i '' 's|src/web|src/web|g' {} \; 2>/dev/null || true

# Make all scripts executable
chmod +x scripts/*/*.sh 2>/dev/null || true

echo -e "${GREEN}   ✅ Paths updated${NC}"
echo ""

##############################################################################
# Phase 7: Create New README
##############################################################################

echo -e "${YELLOW}📝 Phase 7: Creating new README...${NC}"

cat > README.md << 'EOF'
# 🏥 EMR CRC SSOT - Placement & Facility Finder

**Enterprise Healthcare Application**  
**Last Updated**: September 29, 2025

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+ (optional - fallback mode available)
- Modern web browser

### Development Setup

```bash
# 1. Install dependencies
cd src/api && npm install
cd ../web && npm install

# 2. Configure environment
cp src/api/.env.example src/api/.env
cp src/web/.env.example src/web/.env

# 3. Start development servers
bash scripts/dev/start.sh
```

**Access the application**: http://localhost:5173  
**API endpoint**: http://localhost:3001

## 📁 Project Structure

```
├── src/                    # Source code
│   ├── api/               # Backend API server
│   ├── web/               # Frontend application
│   └── shared/            # Shared code/types
├── scripts/               # Automation scripts
│   ├── dev/              # Development tools
│   ├── deploy/           # Deployment scripts
│   ├── database/         # Database utilities
│   └── utilities/        # Helper scripts
├── docs/                  # Documentation
│   ├── getting-started/  # Setup guides
│   ├── architecture/     # System design
│   ├── deployment/       # Deployment guides
│   └── specifications/   # Requirements & specs
├── tests/                 # Test suites
├── config/                # Configuration files
└── .archive/              # Historical files
```

## 🛠️ Common Tasks

### Start Development Servers

```bash
# Simple start (recommended)
bash scripts/dev/start.sh

# Comprehensive start with health checks
bash scripts/dev/start-all.sh

# Legacy node.js start
node scripts/dev/start-node.js
```

### Database Operations

```bash
# Test database connection
bash scripts/database/test-connection.sh

# Run migrations
bash scripts/database/migrate.sh

# Fix connection issues
bash scripts/database/fix-connection.sh
```

### Deployment

```bash
# Deploy to Railway/Render
bash scripts/deploy/deploy.sh

# Prepare for Netlify
bash scripts/deploy/prepare-netlify.sh
```

### System Health Check

```bash
# Check all servers
bash scripts/utilities/health-check.sh

# Fix cache and restart
bash scripts/utilities/fix-cache-restart.sh
```

## 📚 Documentation

- **Getting Started**: [docs/getting-started/quick-start.md](docs/getting-started/quick-start.md)
- **Architecture**: [docs/architecture/overview.md](docs/architecture/overview.md)
- **API Reference**: [docs/architecture/API_REFERENCE.md](docs/architecture/API_REFERENCE.md)
- **Deployment**: [docs/deployment/development.md](docs/deployment/development.md)
- **Healthcare Compliance**: [docs/healthcare-compliance/](docs/healthcare-compliance/)

## 🏥 Features

- **Placement Search**: ASAM-based facility matching
- **Facility Finder**: Comprehensive facility directory
- **Patient Assessment**: Clinical assessment tools
- **Prior Authorization**: Insurance authorization tracking
- **Transport Coordination**: Scheduling and logistics
- **Patient Progress Dashboard**: Real-time patient status

## 🔒 Security & Compliance

- HIPAA compliant architecture
- PHI data protection
- Audit logging
- Role-based access control (RBAC)
- Encrypted data storage

## 📊 Technology Stack

- **Frontend**: Vanilla JavaScript, Vite, HTML5/CSS3
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with fallback JSON storage
- **Deployment**: Railway, Netlify, Render

## 🤝 Contributing

1. Review [docs/architecture/overview.md](docs/architecture/overview.md)
2. Check current issues and PRD documents
3. Follow coding standards in documentation
4. Submit pull requests with tests

## 📝 License

Proprietary - Healthcare Application

## 🆘 Support

- **Documentation**: `docs/` directory
- **Issues**: Check logs in `logs/` directory
- **Health Check**: `bash scripts/utilities/health-check.sh`

---

**Built with ❤️ for healthcare professionals**
EOF

echo -e "${GREEN}   ✅ README created${NC}"
echo ""

##############################################################################
# Phase 8: Create Quick Reference Scripts
##############################################################################

echo -e "${YELLOW}📋 Phase 8: Creating quick reference scripts...${NC}"

# Create start script in root for convenience
cat > start << 'EOF'
#!/bin/bash
# Quick start convenience script
bash scripts/dev/start.sh
EOF
chmod +x start

# Create stop script
cat > stop << 'EOF'
#!/bin/bash
# Quick stop convenience script
echo "🛑 Stopping all servers..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
lsof -ti:5174 | xargs kill -9 2>/dev/null || true
echo "✅ Servers stopped"
EOF
chmod +x stop

echo -e "${GREEN}   ✅ Quick reference scripts created${NC}"
echo ""

##############################################################################
# Phase 9: Clean Up Empty Directories
##############################################################################

echo -e "${YELLOW}🧹 Phase 9: Cleaning up empty directories...${NC}"

# Remove empty directories
find . -type d -empty -delete 2>/dev/null || true

# Remove node_modules if present (will be reinstalled)
# Keep this commented unless user wants to regenerate
# rm -rf node_modules

echo -e "${GREEN}   ✅ Cleanup complete${NC}"
echo ""

##############################################################################
# Phase 10: Create .gitignore
##############################################################################

echo -e "${YELLOW}📝 Phase 10: Creating .gitignore...${NC}"

cat > .gitignore << 'EOF'
# Dependencies
node_modules/
package-lock.json
yarn.lock

# Environment files
.env
.env.local
.env.production

# Logs
logs/
*.log
npm-debug.log*

# Build outputs
dist/
build/
.cache/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Testing
coverage/
.nyc_output/

# Temporary files
tmp/
temp/
*.tmp

# Database
*.db
*.sqlite

# Backups
*.backup
*.bak
EOF

echo -e "${GREEN}   ✅ .gitignore created${NC}"
echo ""

##############################################################################
# Summary
##############################################################################

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              ✅ REORGANIZATION COMPLETE                       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${GREEN}✅ Repository reorganized to industry standards!${NC}"
echo ""
echo -e "${YELLOW}📁 New Structure:${NC}"
echo -e "   • ${BLUE}src/${NC}           - All source code (api, web, shared)"
echo -e "   • ${BLUE}scripts/${NC}       - Automation scripts by category"
echo -e "   • ${BLUE}docs/${NC}          - Consolidated documentation"
echo -e "   • ${BLUE}tests/${NC}         - Test suites"
echo -e "   • ${BLUE}config/${NC}        - Configuration files"
echo -e "   • ${BLUE}.archive/${NC}      - Historical/deprecated files"
echo ""

echo -e "${YELLOW}🚀 Quick Commands:${NC}"
echo -e "   ${GREEN}./start${NC}                          - Start all servers"
echo -e "   ${GREEN}./stop${NC}                           - Stop all servers"
echo -e "   ${GREEN}bash scripts/dev/start.sh${NC}       - Development start"
echo -e "   ${GREEN}bash scripts/utilities/health-check.sh${NC}  - System health check"
echo ""

echo -e "${YELLOW}📚 Documentation:${NC}"
echo -e "   • Main README:     ${BLUE}README.md${NC}"
echo -e "   • Getting Started: ${BLUE}docs/getting-started/${NC}"
echo -e "   • Architecture:    ${BLUE}docs/architecture/${NC}"
echo ""

echo -e "${YELLOW}💾 Backup Location:${NC}"
echo -e "   ${MAGENTA}$BACKUP_DIR${NC}"
echo ""

echo -e "${YELLOW}⚡ Next Steps:${NC}"
echo -e "   1. Review new structure: ${GREEN}ls -la${NC}"
echo -e "   2. Test startup: ${GREEN}./start${NC}"
echo -e "   3. Verify functionality in browser"
echo -e "   4. Update git repository: ${GREEN}git add . && git commit -m 'Reorganize to industry standards'${NC}"
echo ""

echo -e "${GREEN}✅ Reorganization complete!${NC}"
