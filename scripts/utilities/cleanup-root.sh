#!/bin/bash
# Script: cleanup-root.sh
# Purpose: Enforce root directory rules - move misplaced files
# Location: scripts/utilities/cleanup-root.sh
# Created: 2025-09-30
# Last Updated: 2025-09-30

set -e

echo ""
echo "🧹 CLEANING ROOT DIRECTORY - ENFORCING RULES"
echo "============================================="
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

# Create directories if needed
mkdir -p scripts/utilities
mkdir -p scripts/backup
mkdir -p docs/reports
mkdir -p .archive/deprecated
mkdir -p logs
mkdir -p config/database

MOVED=0

# Move .sh files (scripts)
echo "Checking for .sh files in root..."
for file in *.sh; do
  if [[ -f "$file" ]]; then
    echo "  ❌ Found: $file"
    
    # Determine where it should go
    if [[ "$file" == *"reorganize"* ]] || [[ "$file" == *"REORGANIZE"* ]]; then
      echo "     → Moving to scripts/backup/"
      mv "$file" scripts/backup/
    else
      echo "     → Moving to scripts/utilities/"
      mv "$file" scripts/utilities/
    fi
    
    MOVED=$((MOVED + 1))
  fi
done

# Move .md files (except README.md)
echo ""
echo "Checking for .md files in root (except README.md)..."
for file in *.md; do
  if [[ -f "$file" && "$file" != "README.md" ]]; then
    echo "  ❌ Found: $file"
    
    # Determine where it should go
    if [[ "$file" == *"STATUS"* ]] || [[ "$file" == *"SUMMARY"* ]] || [[ "$file" == *"REPORT"* ]]; then
      echo "     → Moving to docs/reports/"
      mv "$file" docs/reports/
    else
      echo "     → Moving to docs/archive/"
      mv "$file" docs/archive/
    fi
    
    MOVED=$((MOVED + 1))
  fi
done

# Move .old, .backup, .bak files
echo ""
echo "Checking for backup files (.old, .backup, .bak)..."
for file in *.old *.backup *.bak; do
  if [[ -f "$file" ]]; then
    echo "  ❌ Found: $file"
    echo "     → Moving to .archive/deprecated/"
    mv "$file" .archive/deprecated/
    MOVED=$((MOVED + 1))
  fi
done

# Move .log files
echo ""
echo "Checking for log files..."
for file in *.log; do
  if [[ -f "$file" ]]; then
    echo "  ❌ Found: $file"
    echo "     → Moving to logs/"
    mv "$file" logs/
    MOVED=$((MOVED + 1))
  fi
done

# Move .sql files
echo ""
echo "Checking for SQL files..."
for file in *.sql; do
  if [[ -f "$file" ]]; then
    echo "  ❌ Found: $file"
    echo "     → Moving to config/database/"
    mv "$file" config/database/
    MOVED=$((MOVED + 1))
  fi
done

# Count files in root (excluding allowed ones)
echo ""
echo "============================================="
echo ""

ALLOWED_FILES=(
  "README.md"
  "package.json"
  "package-lock.json"
  "start"
  "stop"
  "health"
  ".gitignore"
  ".env.example"
  ".eslintrc.security.json"
  ".DS_Store"
)

VIOLATIONS=0
for file in *; do
  if [[ -f "$file" ]]; then
    if [[ ! " ${ALLOWED_FILES[@]} " =~ " ${file} " ]]; then
      echo "⚠️  WARNING: Unauthorized file still in root: $file"
      echo "   Manually move this file to appropriate directory"
      VIOLATIONS=$((VIOLATIONS + 1))
    fi
  fi
done

echo ""
if [[ $MOVED -gt 0 ]]; then
  echo "✅ Cleanup complete: Moved $MOVED files"
else
  echo "✅ Root directory already clean"
fi

if [[ $VIOLATIONS -gt 0 ]]; then
  echo "⚠️  Warning: $VIOLATIONS unauthorized files need manual review"
  echo ""
  echo "Root directory should ONLY contain:"
  echo "  - README.md"
  echo "  - package.json"
  echo "  - package-lock.json"
  echo "  - start (executable)"
  echo "  - stop (executable)"
  echo "  - health (executable)"
  echo "  - .gitignore, .env.example, .eslintrc.security.json (hidden)"
  exit 1
else
  echo "✅ Root directory is compliant with rules"
fi

echo ""
echo "Current root files:"
ls -la | grep -v "^d" | grep -v "total"
echo ""
