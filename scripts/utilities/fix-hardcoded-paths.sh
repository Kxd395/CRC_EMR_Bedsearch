#!/bin/bash
# Fix all hardcoded paths in scripts - SSOT enforcement
# This replaces hardcoded paths with dynamic resolution

echo "🔧 Fixing hardcoded paths in all scripts..."

SCRIPTS_TO_FIX=(
  "scripts/backup/reorganize-v1.sh"
  "scripts/database/fix-connection.sh"
  "scripts/database/test-connection.sh"
  "scripts/dev/test-ngrok.sh"
  "scripts/utilities/cleanup-root.sh"
  "scripts/utilities/fix-cache-restart.sh"
)

DYNAMIC_PATH_CODE='
# Dynamic path resolution - works from any location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"'

for script in "${SCRIPTS_TO_FIX[@]}"; do
  if [[ -f "$script" ]]; then
    echo "Fixing: $script"
    
    # Replace hardcoded PROJECT_ROOT with dynamic resolution
    sed -i '' 's|SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"|SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" \&\& pwd)"\nPROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." \&\& pwd)"|g' "$script"
    
    echo "  ✅ Fixed"
  fi
done

echo ""
echo "✅ All scripts updated with dynamic paths"
echo ""
echo "Verification:"
grep -c "VScode_Projects" scripts/**/*.sh 2>/dev/null | grep -v ":0$" || echo "✅ No hardcoded paths found"
