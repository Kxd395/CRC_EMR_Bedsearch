#!/bin/bash

# EMR CRC SSOT Security Scanner
# Comprehensive scan for hardcoded values, security issues, and HIPAA compliance

set -e

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

# Configuration
SCAN_EXTENSIONS="js,ts,jsx,tsx,vue,py,java,cs,php,rb,go,rs,swift,kt,json,yaml,yml,sql"
EXCLUDE_DIRS=".git,node_modules,dist,build,coverage,__pycache__,.venv,venv"
REPORT_FILE="security-scan-report.md"

echo -e "${BLUE}${BOLD}🛡️  EMR CRC SSOT Security Scanner${NC}"
echo -e "${BLUE}====================================${NC}"
echo ""

# Parse command line arguments
VERBOSE=false
FIX_MODE=false
CI_MODE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -f|--fix)
            FIX_MODE=true
            shift
            ;;
        --ci)
            CI_MODE=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  -v, --verbose    Show detailed output"
            echo "  -f, --fix        Attempt to auto-fix some issues"
            echo "  --ci             CI mode (machine readable output)"
            echo "  -h, --help       Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option $1"
            exit 1
            ;;
    esac
done

# Initialize counters
CRITICAL_ISSUES=0
HIGH_ISSUES=0
MEDIUM_ISSUES=0
LOW_ISSUES=0

# Create report file
cat > "$REPORT_FILE" << EOF
# EMR CRC SSOT Security Scan Report
Generated: $(date)

## Summary
EOF

# Function to log issues
log_issue() {
    local severity=$1
    local file=$2
    local line=$3
    local message=$4
    local details=${5:-""}
    
    case $severity in
        CRITICAL)
            ((CRITICAL_ISSUES++))
            if [ "$CI_MODE" = true ]; then
                echo "::error file=$file,line=$line::$message"
            else
                echo -e "${RED}🚨 CRITICAL: $file:$line - $message${NC}"
            fi
            ;;
        HIGH)
            ((HIGH_ISSUES++))
            if [ "$CI_MODE" = true ]; then
                echo "::error file=$file,line=$line::$message"
            else
                echo -e "${RED}❌ HIGH: $file:$line - $message${NC}"
            fi
            ;;
        MEDIUM)
            ((MEDIUM_ISSUES++))
            if [ "$CI_MODE" = true ]; then
                echo "::warning file=$file,line=$line::$message"
            else
                echo -e "${YELLOW}⚠️  MEDIUM: $file:$line - $message${NC}"
            fi
            ;;
        LOW)
            ((LOW_ISSUES++))
            if [ "$CI_MODE" = true ]; then
                echo "::notice file=$file,line=$line::$message"
            else
                echo -e "${BLUE}ℹ️  LOW: $file:$line - $message${NC}"
            fi
            ;;
    esac
    
    # Add to report
    echo "- **$severity**: \`$file:$line\` - $message" >> "$REPORT_FILE"
    if [ -n "$details" ]; then
        echo "  - $details" >> "$REPORT_FILE"
    fi
}

# Function to scan file for hardcoded values
scan_file() {
    local file=$1
    local line_num=0
    
    [ "$VERBOSE" = true ] && echo "Scanning: $file"
    
    while IFS= read -r line; do
        ((line_num++))
        
        # Skip comments and documentation
        if echo "$line" | grep -qE '^\s*(#|//|/\*|\*|<!--|-->)'; then
            continue
        fi
        
        # Critical Issues
        
        # Hardcoded IP addresses (excluding common safe ones)
        if echo "$line" | grep -qE '\b([0-9]{1,3}\.){3}[0-9]{1,3}\b' && ! echo "$line" | grep -qE '(127\.0\.0\.1|0\.0\.0\.0|192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)'; then
            log_issue "CRITICAL" "$file" "$line_num" "Hardcoded IP address detected" "Line: $line"
        fi
        
        # Database connection strings with credentials
        if echo "$line" | grep -qE 'postgresql://[^:]+:[^@]+@'; then
            log_issue "CRITICAL" "$file" "$line_num" "Database connection string with credentials" "Use environment variables for DB credentials"
        fi
        
        # API keys and secrets (common patterns)
        if echo "$line" | grep -qiE '(api[_-]?key|secret[_-]?key|private[_-]?key)\s*[:=]\s*["\x27][A-Za-z0-9+/]{20,}["\x27]'; then
            log_issue "CRITICAL" "$file" "$line_num" "Potential API key or secret detected" "Move to environment variables"
        fi
        
        # AWS credentials
        if echo "$line" | grep -qE 'AKIA[0-9A-Z]{16}'; then
            log_issue "CRITICAL" "$file" "$line_num" "AWS access key detected" "Use AWS IAM roles or environment variables"
        fi
        
        # High Issues
        
        # Hardcoded passwords
        if echo "$line" | grep -qiE '(password|pwd|pass)\s*[:=]\s*["\x27][^"\x27]{3,}["\x27]' && ! echo "$line" | grep -qE '(your-|placeholder|example|test)'; then
            log_issue "HIGH" "$file" "$line_num" "Potential hardcoded password" "Use environment variables for passwords"
        fi
        
        # Localhost with specific ports
        if echo "$line" | grep -qE 'localhost:[0-9]{4,5}' && ! echo "$line" | grep -qE '(your-|placeholder|example)'; then
            log_issue "HIGH" "$file" "$line_num" "Hardcoded localhost with port" "Use environment variables for host configuration"
        fi
        
        # Healthcare-specific patterns
        if echo "$line" | grep -qiE '(ssn|social.security.number)\s*[:=]\s*["\x27][0-9-]{9,11}["\x27]'; then
            log_issue "HIGH" "$file" "$line_num" "Potential hardcoded SSN detected" "Use test data generators for healthcare testing"
        fi
        
        # Medium Issues
        
        # Email addresses (excluding obvious placeholders)
        if echo "$line" | grep -qE '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' && ! echo "$line" | grep -qE '(example\.com|test@|your-|placeholder)'; then
            log_issue "MEDIUM" "$file" "$line_num" "Potential hardcoded email address" "Consider using environment variables"
        fi
        
        # Phone numbers
        if echo "$line" | grep -qE '\b\d{3}[-.]?\d{3}[-.]?\d{4}\b' && ! echo "$line" | grep -qE '(555-|000-|123-|test|example)'; then
            log_issue "MEDIUM" "$file" "$line_num" "Potential hardcoded phone number" "Use test data for development"
        fi
        
        # Hardcoded URLs (excluding localhost and common placeholders)
        if echo "$line" | grep -qE 'https?://[^/\s"'\'']+' && ! echo "$line" | grep -qE '(localhost|127\.0\.0\.1|example\.com|your-|placeholder)'; then
            log_issue "MEDIUM" "$file" "$line_num" "Hardcoded URL detected" "Consider using environment variables"
        fi
        
        # Low Issues
        
        # Console.log with sensitive-looking data
        if echo "$line" | grep -qiE 'console\.log.*\b(password|token|secret|key)\b'; then
            log_issue "LOW" "$file" "$line_num" "Console.log with potentially sensitive data" "Remove debug logging in production"
        fi
        
        # TODO comments with sensitive information
        if echo "$line" | grep -qiE '(todo|fixme).*\b(password|credential|secret|key)\b'; then
            log_issue "LOW" "$file" "$line_num" "TODO comment mentioning sensitive data" "Address before production deployment"
        fi
        
    done < "$file"
}

# Main scanning logic
echo "🔍 Starting security scan..."
echo ""

# Find files to scan
FILES_TO_SCAN=$(find . -type f \( -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" -o -name "*.vue" -o -name "*.py" -o -name "*.java" -o -name "*.cs" -o -name "*.php" -o -name "*.rb" -o -name "*.go" -o -name "*.rs" -o -name "*.swift" -o -name "*.kt" -o -name "*.json" -o -name "*.yaml" -o -name "*.yml" -o -name "*.sql" \) | grep -vE "\.(git|node_modules|dist|build|coverage|__pycache__|\.venv|venv)/" | head -1000)

TOTAL_FILES=$(echo "$FILES_TO_SCAN" | wc -l)
echo "📂 Scanning $TOTAL_FILES files..."

# Progress counter
CURRENT_FILE=0

# Scan each file
for file in $FILES_TO_SCAN; do
    if [ -f "$file" ] && [ -r "$file" ]; then
        ((CURRENT_FILE++))
        if [ "$VERBOSE" = true ]; then
            echo "[$CURRENT_FILE/$TOTAL_FILES] $file"
        elif [ $((CURRENT_FILE % 50)) -eq 0 ]; then
            echo "Progress: $CURRENT_FILE/$TOTAL_FILES files scanned"
        fi
        scan_file "$file"
    fi
done

# Check for .env files in the repository (should not be committed)
echo ""
echo "🔍 Checking for committed .env files..."
ENV_FILES=$(find . -name ".env" -not -path "./.git/*" | head -10)
if [ -n "$ENV_FILES" ]; then
    for env_file in $ENV_FILES; do
        log_issue "CRITICAL" "$env_file" "0" "Environment file committed to repository" "Add .env to .gitignore and remove from repository"
    done
fi

# Check for proper .gitignore
echo "🔍 Checking .gitignore configuration..."
if [ ! -f ".gitignore" ]; then
    log_issue "HIGH" ".gitignore" "0" "Missing .gitignore file" "Create .gitignore to exclude sensitive files"
elif ! grep -q "\.env" .gitignore; then
    log_issue "MEDIUM" ".gitignore" "0" ".env files not ignored" "Add .env* to .gitignore"
fi

# Generate summary
echo "" >> "$REPORT_FILE"
echo "## Issues Summary" >> "$REPORT_FILE"
echo "- **Critical**: $CRITICAL_ISSUES" >> "$REPORT_FILE"
echo "- **High**: $HIGH_ISSUES" >> "$REPORT_FILE"
echo "- **Medium**: $MEDIUM_ISSUES" >> "$REPORT_FILE"
echo "- **Low**: $LOW_ISSUES" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

TOTAL_ISSUES=$((CRITICAL_ISSUES + HIGH_ISSUES + MEDIUM_ISSUES + LOW_ISSUES))

# Final results
echo ""
echo -e "${BLUE}${BOLD}📊 Scan Results${NC}"
echo "==================="
echo -e "Critical Issues: ${RED}$CRITICAL_ISSUES${NC}"
echo -e "High Issues: ${RED}$HIGH_ISSUES${NC}"
echo -e "Medium Issues: ${YELLOW}$MEDIUM_ISSUES${NC}"
echo -e "Low Issues: ${BLUE}$LOW_ISSUES${NC}"
echo -e "Total Issues: ${BOLD}$TOTAL_ISSUES${NC}"
echo ""
echo -e "📄 Detailed report saved to: ${GREEN}$REPORT_FILE${NC}"

# Exit with appropriate code
if [ $CRITICAL_ISSUES -gt 0 ]; then
    echo -e "${RED}🚫 CRITICAL ISSUES FOUND - Deployment should be blocked${NC}"
    exit 1
elif [ $HIGH_ISSUES -gt 0 ]; then
    echo -e "${YELLOW}⚠️  HIGH PRIORITY ISSUES - Review before deployment${NC}"
    exit 1
elif [ $TOTAL_ISSUES -gt 0 ]; then
    echo -e "${YELLOW}ℹ️  Issues found - Review recommended${NC}"
    exit 0
else
    echo -e "${GREEN}✅ No security issues detected${NC}"
    exit 0
fi