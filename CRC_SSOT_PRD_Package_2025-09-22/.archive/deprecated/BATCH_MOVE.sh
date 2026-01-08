#!/bin/bash

##############################################################################
# 🚀 BATCH MOVE - Organize All Remaining Files
##############################################################################

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_ROOT="/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22"

echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  🚀 BATCH MOVE - Organizing Files                      ${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

cd "$PROJECT_ROOT"

# Stop servers first
echo -e "${YELLOW}🛑 Stopping servers...${NC}"
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
echo ""

# Create ALL needed directories
echo -e "${YELLOW}📁 Creating directory structure...${NC}"
mkdir -p scripts/{dev,deploy,database,utilities,backup}
mkdir -p docs/{getting-started,architecture,deployment,troubleshooting,reports,archive,healthcare-compliance,specifications/prd}
mkdir -p src/{api,web,shared}
mkdir -p tests/{unit,integration,e2e}
mkdir -p config/{database/migrations,environments,deployment}
mkdir -p logs
mkdir -p .archive/{deprecated,old-versions,parent-files}
echo -e "${GREEN}✅ Directories created${NC}"
echo ""

# Move logs
echo -e "${YELLOW}📊 Moving logs...${NC}"
[ -f "api-server.log" ] && mv api-server.log logs/ && echo "  ✅ api-server.log → logs/"
[ -f "vite-server.log" ] && mv vite-server.log logs/ && echo "  ✅ vite-server.log → logs/"
[ -f "ngrok.log" ] && mv ngrok.log logs/ && echo "  ✅ ngrok.log → logs/"
echo ""

# Move SQL files
echo -e "${YELLOW}🗄️  Moving SQL files...${NC}"
[ -f "database_fix_mat_needs.sql" ] && mv database_fix_mat_needs.sql config/database/migrations/ && echo "  ✅ database_fix_mat_needs.sql → config/database/migrations/"
[ -f "local_schema.sql" ] && mv local_schema.sql config/database/ && echo "  ✅ local_schema.sql → config/database/"
[ -f "remote_db_migration.sql" ] && mv remote_db_migration.sql config/database/migrations/ && echo "  ✅ remote_db_migration.sql → config/database/migrations/"
echo ""

# Move scripts (check if they exist first)
echo -e "${YELLOW}📝 Moving scripts...${NC}"
[ -f "check-servers.sh" ] && mv check-servers.sh scripts/utilities/health-check.sh && echo "  ✅ check-servers.sh → scripts/utilities/health-check.sh"
[ -f "deploy.sh" ] && mv deploy.sh scripts/deploy/deploy.sh && echo "  ✅ deploy.sh → scripts/deploy/deploy.sh"
[ -f "fix-database-connection.sh" ] && mv fix-database-connection.sh scripts/database/fix-connection.sh && echo "  ✅ fix-database-connection.sh → scripts/database/fix-connection.sh"
[ -f "fix_mat_needs_format.js" ] && mv fix_mat_needs_format.js scripts/database/fix-mat-needs.js && echo "  ✅ fix_mat_needs_format.js → scripts/database/fix-mat-needs.js"
[ -f "FIX_NOW.sh" ] && mv FIX_NOW.sh scripts/utilities/fix-cache-restart.sh && echo "  ✅ FIX_NOW.sh → scripts/utilities/fix-cache-restart.sh"
[ -f "migrate-database-schema.sh" ] && mv migrate-database-schema.sh scripts/database/migrate.sh && echo "  ✅ migrate-database-schema.sh → scripts/database/migrate.sh"
[ -f "prepare-netlify.js" ] && mv prepare-netlify.js scripts/deploy/prepare-netlify.js && echo "  ✅ prepare-netlify.js → scripts/deploy/prepare-netlify.js"
[ -f "setup-database-netlify.js" ] && mv setup-database-netlify.js scripts/deploy/setup-netlify-db.js && echo "  ✅ setup-database-netlify.js → scripts/deploy/setup-netlify-db.js"
[ -f "setup-railway.sh" ] && mv setup-railway.sh scripts/deploy/setup-railway.sh && echo "  ✅ setup-railway.sh → scripts/deploy/setup-railway.sh"
[ -f "start-all.sh" ] && mv start-all.sh scripts/dev/start-all.sh && echo "  ✅ start-all.sh → scripts/dev/start-all.sh"
[ -f "start-both-servers.sh" ] && mv start-both-servers.sh scripts/dev/start-both.sh && echo "  ✅ start-both-servers.sh → scripts/dev/start-both.sh"
[ -f "start-dev-environment.sh" ] && mv start-dev-environment.sh scripts/dev/start-env.sh && echo "  ✅ start-dev-environment.sh → scripts/dev/start-env.sh"
[ -f "start-dev.js" ] && mv start-dev.js scripts/dev/start-node.js && echo "  ✅ start-dev.js → scripts/dev/start-node.js"
[ -f "start-dev.sh" ] && mv start-dev.sh scripts/dev/start-legacy.sh && echo "  ✅ start-dev.sh → scripts/dev/start-legacy.sh"
[ -f "start-simple.sh" ] && mv start-simple.sh scripts/dev/start.sh && echo "  ✅ start-simple.sh → scripts/dev/start.sh"
[ -f "test-database-connection.sh" ] && mv test-database-connection.sh scripts/database/test-connection.sh && echo "  ✅ test-database-connection.sh → scripts/database/test-connection.sh"
[ -f "test-with-ngrok.sh" ] && mv test-with-ngrok.sh scripts/dev/test-ngrok.sh && echo "  ✅ test-with-ngrok.sh → scripts/dev/test-ngrok.sh"
[ -f "update-database-whitelist.sh" ] && mv update-database-whitelist.sh scripts/database/update-whitelist.sh && echo "  ✅ update-database-whitelist.sh → scripts/database/update-whitelist.sh"
[ -f "REORGANIZE.sh" ] && mv REORGANIZE.sh scripts/backup/reorganize-v1.sh && echo "  ✅ REORGANIZE.sh → scripts/backup/reorganize-v1.sh"
echo ""

# Move documentation files
echo -e "${YELLOW}📚 Moving documentation...${NC}"
[ -f "BED_SEARCH_PERSISTENCE_FIX.md" ] && mv BED_SEARCH_PERSISTENCE_FIX.md docs/troubleshooting/ && echo "  ✅ BED_SEARCH_PERSISTENCE_FIX.md → docs/troubleshooting/"
[ -f "CORS_DATABASE_TROUBLESHOOTING.md" ] && mv CORS_DATABASE_TROUBLESHOOTING.md docs/troubleshooting/ && echo "  ✅ CORS_DATABASE_TROUBLESHOOTING.md → docs/troubleshooting/"
[ -f "CRITICAL_FIX_NEEDED.md" ] && mv CRITICAL_FIX_NEEDED.md docs/troubleshooting/ && echo "  ✅ CRITICAL_FIX_NEEDED.md → docs/troubleshooting/"
[ -f "DATABASE_CONNECTION_SETUP.md" ] && mv DATABASE_CONNECTION_SETUP.md docs/architecture/ && echo "  ✅ DATABASE_CONNECTION_SETUP.md → docs/architecture/"
[ -f "DATABASE_PERSISTENCE_IMPLEMENTATION.md" ] && mv DATABASE_PERSISTENCE_IMPLEMENTATION.md docs/architecture/ && echo "  ✅ DATABASE_PERSISTENCE_IMPLEMENTATION.md → docs/architecture/"
[ -f "DEPLOYMENT_CHECKLIST.md" ] && mv DEPLOYMENT_CHECKLIST.md docs/deployment/ && echo "  ✅ DEPLOYMENT_CHECKLIST.md → docs/deployment/"
[ -f "DEV_SETUP.md" ] && mv DEV_SETUP.md docs/getting-started/ && echo "  ✅ DEV_SETUP.md → docs/getting-started/"
[ -f "DOCUMENTATION_UPDATE_SUMMARY.md" ] && mv DOCUMENTATION_UPDATE_SUMMARY.md docs/reports/ && echo "  ✅ DOCUMENTATION_UPDATE_SUMMARY.md → docs/reports/"
[ -f "FINAL_ACHIEVEMENT_REPORT.md" ] && mv FINAL_ACHIEVEMENT_REPORT.md docs/reports/ && echo "  ✅ FINAL_ACHIEVEMENT_REPORT.md → docs/reports/"
[ -f "FIXES_APPLIED.md" ] && mv FIXES_APPLIED.md docs/troubleshooting/ && echo "  ✅ FIXES_APPLIED.md → docs/troubleshooting/"
[ -f "IMPLEMENTATION_STATUS.md" ] && mv IMPLEMENTATION_STATUS.md docs/reports/ && echo "  ✅ IMPLEMENTATION_STATUS.md → docs/reports/"
[ -f "NETLIFY_DEPLOYMENT.md" ] && mv NETLIFY_DEPLOYMENT.md docs/deployment/ && echo "  ✅ NETLIFY_DEPLOYMENT.md → docs/deployment/"
[ -f "NO_HARDCODED_VALUES.md" ] && mv NO_HARDCODED_VALUES.md docs/archive/ && echo "  ✅ NO_HARDCODED_VALUES.md → docs/archive/"
[ -f "ORGANIZATION_SUMMARY.md" ] && mv ORGANIZATION_SUMMARY.md docs/reports/ && echo "  ✅ ORGANIZATION_SUMMARY.md → docs/reports/"
[ -f "PRODUCTION_STATUS.md" ] && mv PRODUCTION_STATUS.md docs/deployment/ && echo "  ✅ PRODUCTION_STATUS.md → docs/deployment/"
[ -f "QUICK_START.md" ] && mv QUICK_START.md docs/getting-started/ && echo "  ✅ QUICK_START.md → docs/getting-started/"
[ -f "REORGANIZATION_CHECKLIST.md" ] && mv REORGANIZATION_CHECKLIST.md docs/archive/ && echo "  ✅ REORGANIZATION_CHECKLIST.md → docs/archive/"
[ -f "REORGANIZATION_SUMMARY.md" ] && mv REORGANIZATION_SUMMARY.md docs/reports/ && echo "  ✅ REORGANIZATION_SUMMARY.md → docs/reports/"
[ -f "REPO_REORGANIZATION_PLAN.md" ] && mv REPO_REORGANIZATION_PLAN.md docs/archive/ && echo "  ✅ REPO_REORGANIZATION_PLAN.md → docs/archive/"
[ -f "REPOSITORY_SCAFFOLDING.md" ] && mv REPOSITORY_SCAFFOLDING.md docs/architecture/ && echo "  ✅ REPOSITORY_SCAFFOLDING.md → docs/architecture/"
[ -f "REPOSITORY_STATUS.md" ] && mv REPOSITORY_STATUS.md docs/archive/ && echo "  ✅ REPOSITORY_STATUS.md → docs/archive/"
[ -f "REPOSITORY_VERIFICATION.md" ] && mv REPOSITORY_VERIFICATION.md docs/archive/ && echo "  ✅ REPOSITORY_VERIFICATION.md → docs/archive/"
[ -f "security-scan-report.md" ] && mv security-scan-report.md docs/reports/ && echo "  ✅ security-scan-report.md → docs/reports/"
[ -f "SESSION_SUMMARY.md" ] && mv SESSION_SUMMARY.md docs/reports/ && echo "  ✅ SESSION_SUMMARY.md → docs/reports/"
[ -f "STARTUP_STATUS.txt" ] && mv STARTUP_STATUS.txt docs/archive/ && echo "  ✅ STARTUP_STATUS.txt → docs/archive/"
[ -f "SYSTEM_STATUS.md" ] && mv SYSTEM_STATUS.md docs/reports/ && echo "  ✅ SYSTEM_STATUS.md → docs/reports/"
[ -f "VISUAL_GUIDE.txt" ] && mv VISUAL_GUIDE.txt docs/archive/ && echo "  ✅ VISUAL_GUIDE.txt → docs/archive/"
echo ""

# Make all scripts executable
echo -e "${YELLOW}🔧 Making scripts executable...${NC}"
find scripts/ -type f -name "*.sh" -exec chmod +x {} \; 2>/dev/null || true
find scripts/ -type f -name "*.js" -exec chmod +x {} \; 2>/dev/null || true
echo -e "${GREEN}✅ Scripts are executable${NC}"
echo ""

# Move source code directories if they exist
echo -e "${YELLOW}💻 Moving source code directories...${NC}"
if [ -d "production/api" ]; then
    cp -R production/api/* src/api/ 2>/dev/null || true
    mv production .archive/old-versions/ 2>/dev/null || true
    echo "  ✅ production/api → src/api/"
fi

if [ -d "development/prototypes/ui_prototype" ]; then
    cp -R development/prototypes/ui_prototype/* src/web/ 2>/dev/null || true
    echo "  ✅ development/prototypes/ui_prototype → src/web/"
fi

if [ -d "development/testing" ]; then
    cp -R development/testing/* tests/ 2>/dev/null || true
    echo "  ✅ development/testing → tests/"
fi

if [ -d "development" ]; then
    mv development .archive/old-versions/ 2>/dev/null || true
fi
echo ""

# Move documentation directories
echo -e "${YELLOW}📚 Moving documentation directories...${NC}"
if [ -d "SSOT_DOCUMENTATION" ]; then
    cp -R SSOT_DOCUMENTATION/* docs/architecture/ 2>/dev/null || true
    mv SSOT_DOCUMENTATION .archive/old-versions/ 2>/dev/null || true
    echo "  ✅ SSOT_DOCUMENTATION → docs/architecture/"
fi

if [ -d "documentation" ]; then
    [ -d "documentation/healthcare_compliance" ] && cp -R documentation/healthcare_compliance/* docs/healthcare-compliance/ 2>/dev/null || true
    [ -d "documentation/implementation_guides" ] && cp -R documentation/implementation_guides/* docs/architecture/ 2>/dev/null || true
    mv documentation .archive/old-versions/ 2>/dev/null || true
    echo "  ✅ documentation → docs/"
fi

if [ -d "doc" ]; then
    cp -R doc/* docs/specifications/prd/ 2>/dev/null || true
    mv doc .archive/old-versions/ 2>/dev/null || true
    echo "  ✅ doc → docs/specifications/prd/"
fi

if [ -d "tools" ]; then
    [ -f "tools/security-scanner.sh" ] && cp tools/security-scanner.sh scripts/utilities/ 2>/dev/null || true
    [ -f "tools/setup-security.sh" ] && cp tools/setup-security.sh scripts/utilities/ 2>/dev/null || true
    mv tools .archive/deprecated/ 2>/dev/null || true
    echo "  ✅ tools → .archive/deprecated/"
fi

if [ -d "archive" ]; then
    cp -R archive/* .archive/ 2>/dev/null || true
    rm -rf archive 2>/dev/null || true
    echo "  ✅ archive → .archive/"
fi
echo ""

# Handle parent directory files
echo -e "${YELLOW}📦 Moving parent directory files...${NC}"
PARENT_DIR="/Users/VScode_Projects/EMR"

[ -f "$PARENT_DIR/AUDIT_REPORT.md" ] && mv "$PARENT_DIR/AUDIT_REPORT.md" .archive/parent-files/ 2>/dev/null && echo "  ✅ Parent AUDIT_REPORT.md → .archive/parent-files/"
[ -f "$PARENT_DIR/database_fix_script.sh" ] && mv "$PARENT_DIR/database_fix_script.sh" .archive/parent-files/ 2>/dev/null && echo "  ✅ Parent database_fix_script.sh → .archive/parent-files/"
[ -f "$PARENT_DIR/ngrok.log" ] && mv "$PARENT_DIR/ngrok.log" .archive/parent-files/ 2>/dev/null && echo "  ✅ Parent ngrok.log → .archive/parent-files/"
[ -f "$PARENT_DIR/server.log" ] && mv "$PARENT_DIR/server.log" .archive/parent-files/ 2>/dev/null && echo "  ✅ Parent server.log → .archive/parent-files/"
[ -f "$PARENT_DIR/.plan" ] && mv "$PARENT_DIR/.plan" .archive/parent-files/ 2>/dev/null && echo "  ✅ Parent .plan → .archive/parent-files/"
[ -d "$PARENT_DIR/data" ] && mv "$PARENT_DIR/data" .archive/parent-files/ 2>/dev/null && echo "  ✅ Parent data/ → .archive/parent-files/"
[ -d "$PARENT_DIR/.cache_ggshield" ] && mv "$PARENT_DIR/.cache_ggshield" .archive/parent-files/ 2>/dev/null && echo "  ✅ Parent .cache_ggshield → .archive/parent-files/"
echo ""

# Update paths in scripts
echo -e "${YELLOW}🔧 Updating paths in scripts...${NC}"
find scripts/ -type f -name "*.sh" -exec sed -i '' 's|production/api|src/api|g' {} \; 2>/dev/null || true
find scripts/ -type f -name "*.sh" -exec sed -i '' 's|development/prototypes/ui_prototype|src/web|g' {} \; 2>/dev/null || true
find scripts/ -type f -name "*.js" -exec sed -i '' 's|production/api|src/api|g' {} \; 2>/dev/null || true
find scripts/ -type f -name "*.js" -exec sed -i '' 's|development/prototypes/ui_prototype|src/web|g' {} \; 2>/dev/null || true
echo -e "${GREEN}✅ Paths updated${NC}"
echo ""

# Create quick start scripts
echo -e "${YELLOW}📋 Creating quick start scripts...${NC}"

cat > start << 'EOF'
#!/bin/bash
bash scripts/dev/start.sh
EOF
chmod +x start

cat > stop << 'EOF'
#!/bin/bash
echo "🛑 Stopping all servers..."
lsof -ti:3001 | xargs kill -9 2>/dev/null && echo "✅ API stopped" || echo "⚠️ No API running"
lsof -ti:5173 | xargs kill -9 2>/dev/null && echo "✅ UI stopped" || echo "⚠️ No UI running"
EOF
chmod +x stop

cat > health << 'EOF'
#!/bin/bash
bash scripts/utilities/health-check.sh
EOF
chmod +x health

echo -e "${GREEN}✅ Quick scripts created (./start, ./stop, ./health)${NC}"
echo ""

# Clean up empty directories
echo -e "${YELLOW}🧹 Cleaning up...${NC}"
find . -type d -empty -not -path "*/node_modules/*" -not -path "*/.git/*" -delete 2>/dev/null || true
echo -e "${GREEN}✅ Cleanup complete${NC}"
echo ""

echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ BATCH MOVE COMPLETE!${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📁 New Structure:${NC}"
echo -e "   ${GREEN}✅${NC} scripts/     - All scripts organized"
echo -e "   ${GREEN}✅${NC} docs/        - All documentation consolidated"
echo -e "   ${GREEN}✅${NC} src/         - Source code (api, web)"
echo -e "   ${GREEN}✅${NC} config/      - Configuration & SQL files"
echo -e "   ${GREEN}✅${NC} logs/        - Log files"
echo -e "   ${GREEN}✅${NC} .archive/    - Historical files"
echo ""
echo -e "${YELLOW}🚀 Quick Commands:${NC}"
echo -e "   ${GREEN}./start${NC}      - Start servers"
echo -e "   ${GREEN}./stop${NC}       - Stop servers"
echo -e "   ${GREEN}./health${NC}     - Health check"
echo ""
