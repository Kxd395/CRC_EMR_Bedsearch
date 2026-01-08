#!/bin/bash
# Fix all hardcoded paths - manual approach

find scripts -name "*.sh" -type f -exec sed -i '' \
  -e 's|SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"|SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" \&\& pwd)"; PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." \&\& pwd)"|g' \
  -e 's|$PROJECT_ROOT|$PROJECT_ROOT|g' \
  {} \;

echo "✅ Fixed all hardcoded paths"
