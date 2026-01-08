#!/bin/bash

# EMR CRC SSOT Security Setup Script
# Sets up Git hooks and security measures for the project

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${BLUE}${BOLD}🛡️  EMR CRC SSOT Security Setup${NC}"
echo -e "${BLUE}=================================${NC}"
echo ""

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo -e "${GREEN}📂 Project root: $PROJECT_ROOT${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

if ! command_exists git; then
    echo -e "${RED}❌ Git is not installed${NC}"
    exit 1
fi

if ! command_exists node; then
    echo -e "${YELLOW}⚠️  Node.js is not installed. Some features may not work.${NC}"
else
    echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"
fi

if ! command_exists npm; then
    echo -e "${YELLOW}⚠️  npm is not installed. Some features may not work.${NC}"
else
    echo -e "${GREEN}✅ npm found: $(npm --version)${NC}"
fi

echo ""

# Initialize git repository if needed
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}📦 Initializing Git repository...${NC}"
    git init
    echo -e "${GREEN}✅ Git repository initialized${NC}"
else
    echo -e "${GREEN}✅ Git repository already exists${NC}"
fi

# Set up Git hooks
echo -e "${BLUE}⚙️  Setting up Git hooks...${NC}"

# Create hooks directory if it doesn't exist
mkdir -p .git/hooks

# Install pre-commit hook
if [ -f ".githooks/pre-commit" ]; then
    cp .githooks/pre-commit .git/hooks/pre-commit
    chmod +x .git/hooks/pre-commit
    echo -e "${GREEN}✅ Pre-commit hook installed${NC}"
else
    echo -e "${RED}❌ Pre-commit hook not found at .githooks/pre-commit${NC}"
    echo -e "${YELLOW}   Creating basic pre-commit hook...${NC}"
    
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "🔍 Running security checks..."
if [ -f "./tools/security-scanner.sh" ]; then
    ./tools/security-scanner.sh --ci
else
    echo "⚠️  Security scanner not found. Please run setup-security.sh first."
    exit 1
fi
EOF
    chmod +x .git/hooks/pre-commit
    echo -e "${GREEN}✅ Basic pre-commit hook created${NC}"
fi

# Create pre-push hook for additional security
cat > .git/hooks/pre-push << 'EOF'
#!/bin/bash

echo "🛡️  Running pre-push security validation..."

# Check for .env files
if find . -name ".env" -not -path "./.git/*" | head -1 | grep -q .; then
    echo "🚫 ERROR: .env files found in repository!"
    echo "   These should not be pushed to remote repository."
    find . -name ".env" -not -path "./.git/*"
    echo ""
    echo "To fix:"
    echo "1. Add .env to .gitignore"
    echo "2. git rm --cached .env"
    echo "3. git commit -m 'Remove .env from tracking'"
    exit 1
fi

# Check for large files that might contain sensitive data
large_files=$(find . -type f -size +10M -not -path "./.git/*" -not -path "./node_modules/*" | head -5)
if [ -n "$large_files" ]; then
    echo "⚠️  WARNING: Large files detected (>10MB):"
    echo "$large_files"
    echo "   Ensure these don't contain sensitive healthcare data."
fi

echo "✅ Pre-push validation passed"
EOF

chmod +x .git/hooks/pre-push
echo -e "${GREEN}✅ Pre-push hook installed${NC}"

# Set up .gitignore
echo -e "${BLUE}📝 Configuring .gitignore...${NC}"

if [ ! -f ".gitignore" ]; then
    echo -e "${YELLOW}Creating .gitignore...${NC}"
    cat > .gitignore << 'EOF'
# Environment variables and sensitive configuration
.env
.env.local
.env.production
.env.development
.env.staging
*.env

# Security and audit files
security-scan-report.md
audit-*.log
*.key
*.pem
*.p12
*.pfx

# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.npm
.yarn-integrity

# Build outputs
dist/
build/
coverage/
.nyc_output

# IDE and editor files
.vscode/settings.json
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Healthcare specific - never commit real data
patient-data/
real-*.csv
production-*.sql
backup-*.sql
*-production-*
*-prod-*

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
.env.test

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/
EOF
    echo -e "${GREEN}✅ .gitignore created${NC}"
else
    # Check if .gitignore has essential entries
    if ! grep -q "\.env" .gitignore; then
        echo -e "${YELLOW}Adding .env to .gitignore...${NC}"
        echo "" >> .gitignore
        echo "# Environment variables" >> .gitignore
        echo ".env*" >> .gitignore
        echo "*.env" >> .gitignore
    fi
    
    if ! grep -q "patient-data" .gitignore; then
        echo -e "${YELLOW}Adding healthcare data patterns to .gitignore...${NC}"
        echo "" >> .gitignore
        echo "# Healthcare data - never commit real patient data" >> .gitignore
        echo "patient-data/" >> .gitignore
        echo "real-*.csv" >> .gitignore
        echo "*-production-*" >> .gitignore
        echo "*-prod-*" >> .gitignore
    fi
    
    echo -e "${GREEN}✅ .gitignore updated${NC}"
fi

# Set up npm security tools
echo -e "${BLUE}🔧 Setting up npm security tools...${NC}"

if command_exists npm; then
    # Add security-related scripts to package.json
    if [ -f "package.json" ]; then
        echo -e "${YELLOW}Adding security scripts to package.json...${NC}"
        
        # Use node to modify package.json
        node -e "
        const fs = require('fs');
        const path = 'package.json';
        if (fs.existsSync(path)) {
            const pkg = JSON.parse(fs.readFileSync(path, 'utf8'));
            pkg.scripts = pkg.scripts || {};
            pkg.scripts['security:scan'] = './tools/security-scanner.sh';
            pkg.scripts['security:audit'] = 'npm audit';
            pkg.scripts['security:fix'] = 'npm audit fix';
            pkg.scripts['security:check'] = 'npm run security:scan && npm run security:audit';
            pkg.scripts['precommit'] = 'npm run security:check';
            fs.writeFileSync(path, JSON.stringify(pkg, null, 2));
            console.log('✅ Security scripts added to package.json');
        }
        " 2>/dev/null || echo -e "${YELLOW}⚠️  Could not modify package.json automatically${NC}"
    fi
    
    # Install security-related dev dependencies
    echo -e "${YELLOW}Installing security tools...${NC}"
    npm install --save-dev eslint eslint-plugin-security 2>/dev/null || echo -e "${YELLOW}⚠️  Could not install security tools automatically${NC}"
else
    echo -e "${YELLOW}⚠️  npm not available - skipping npm security tools${NC}"
fi

# Make security scanner executable
if [ -f "tools/security-scanner.sh" ]; then
    chmod +x tools/security-scanner.sh
    echo -e "${GREEN}✅ Security scanner made executable${NC}"
fi

# Create security configuration files
echo -e "${BLUE}📋 Creating security configuration...${NC}"

# ESLint security configuration
cat > .eslintrc.security.json << 'EOF'
{
  "extends": [
    "eslint:recommended",
    "plugin:security/recommended"
  ],
  "plugins": ["security"],
  "env": {
    "node": true,
    "browser": true,
    "es6": true
  },
  "parserOptions": {
    "ecmaVersion": 2021,
    "sourceType": "module"
  },
  "rules": {
    "security/detect-hardcoded-credentials": "error",
    "security/detect-unsafe-regex": "error",
    "security/detect-buffer-noassert": "error",
    "security/detect-child-process": "warn",
    "security/detect-disable-mustache-escape": "error",
    "security/detect-eval-with-expression": "error",
    "security/detect-new-buffer": "error",
    "security/detect-no-csrf-before-method-override": "error",
    "security/detect-non-literal-fs-filename": "warn",
    "security/detect-non-literal-regexp": "warn",
    "security/detect-non-literal-require": "warn",
    "security/detect-object-injection": "warn",
    "security/detect-possible-timing-attacks": "warn",
    "security/detect-pseudoRandomBytes": "error",
    "no-console": "warn"
  }
}
EOF
echo -e "${GREEN}✅ ESLint security configuration created${NC}"

# Create VS Code settings for security
mkdir -p .vscode
cat > .vscode/settings.security.json << 'EOF'
{
  "files.associations": {
    ".env.*": "dotenv",
    "*.env": "dotenv"
  },
  "files.exclude": {
    "**/.env": true,
    "**/node_modules": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/.env": true,
    "**/dist": true,
    "**/coverage": true
  },
  "eslint.options": {
    "configFile": ".eslintrc.security.json"
  },
  "eslint.validate": [
    "javascript",
    "typescript"
  ]
}
EOF
echo -e "${GREEN}✅ VS Code security settings created${NC}"

# Run initial security scan
echo ""
echo -e "${BLUE}🔍 Running initial security scan...${NC}"

if [ -f "tools/security-scanner.sh" ]; then
    ./tools/security-scanner.sh -v || echo -e "${YELLOW}⚠️  Security scan found issues - please review${NC}"
else
    echo -e "${YELLOW}⚠️  Security scanner not found${NC}"
fi

# Summary and next steps
echo ""
echo -e "${BLUE}${BOLD}📊 Setup Summary${NC}"
echo -e "${BLUE}=================${NC}"
echo -e "${GREEN}✅ Git hooks installed${NC}"
echo -e "${GREEN}✅ .gitignore configured${NC}"
echo -e "${GREEN}✅ Security tools set up${NC}"
echo -e "${GREEN}✅ Configuration files created${NC}"
echo ""
echo -e "${BLUE}${BOLD}🚀 Next Steps${NC}"
echo -e "${BLUE}=============${NC}"
echo "1. Review and customize .env.example for your deployment needs"
echo "2. Ensure all team members run this setup script"
echo "3. Configure your CI/CD pipeline to use .github/workflows/security-scan.yml"
echo "4. Review NO_HARDCODED_VALUES.md for detailed security guidelines"
echo "5. Run 'npm run security:check' before each commit"
echo ""
echo -e "${BLUE}${BOLD}🛡️  Security Features Active${NC}"
echo -e "${BLUE}============================${NC}"
echo "• Pre-commit hooks to prevent hardcoded values"
echo "• Pre-push validation for sensitive files"
echo "• Automated security scanning"
echo "• Healthcare data protection patterns"
echo "• Environment variable enforcement"
echo ""
echo -e "${GREEN}${BOLD}✅ EMR Security Setup Complete!${NC}"