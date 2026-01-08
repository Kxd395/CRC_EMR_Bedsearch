#!/bin/bash
# Quick start script for CRC SSOT UI Prototype

echo "🚀 Starting CRC SSOT UI Prototype..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in ui_prototype directory"
    echo "Please run from: /Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/ui_prototype/"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "🔧 Starting Vite dev server..."
echo "⚠️  Do NOT use python -m http.server - this project requires Vite!"
echo ""

npm run dev