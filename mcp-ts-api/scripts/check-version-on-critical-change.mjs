#!/usr/bin/env node
/**
 * Version Guard Script
 * 
 * Enforces semantic versioning when critical files change.
 * Prevents merging PRs that modify SSOT, ADRs, or core runtime
 * without bumping the version in package.json.
 * 
 * Usage: npm run guard:version
 * CI Usage: Runs automatically in GitHub Actions on PR
 */

import { execSync } from "node:child_process";
import fs from "node:fs";

const CRITICAL_FILES = [
  "docs/adrs/",
  "SSOT_DESIGN_AUTHORITY.md",
  "src/runModel.ts",
  "src/generateBindings.ts",
  "agent.constitution.md"
];

function getChangedFiles() {
  try {
    const output = execSync("git diff --name-only origin/main...HEAD", { encoding: "utf8" });
    return output.split("\n").filter(Boolean);
  } catch (error) {
    // Not in a git repo or no origin/main
    console.log("⚠️  Not in a git repo with origin/main, skipping version check");
    process.exit(0);
  }
}

function isCriticalChange(changedFiles) {
  return changedFiles.some(file => 
    CRITICAL_FILES.some(critical => file.startsWith(critical) || file === critical)
  );
}

function getVersion(ref = null) {
  try {
    const content = ref 
      ? execSync(`git show ${ref}:package.json`, { encoding: "utf8" })
      : fs.readFileSync("package.json", "utf8");
    return JSON.parse(content).version;
  } catch (error) {
    return null;
  }
}

// Main execution
const changedFiles = getChangedFiles();

if (changedFiles.length === 0) {
  console.log("✅ No file changes detected");
  process.exit(0);
}

const hasCriticalChange = isCriticalChange(changedFiles);

if (!hasCriticalChange) {
  console.log("✅ No critical files changed, version bump not required");
  process.exit(0);
}

console.log("🔍 Critical files changed:");
changedFiles
  .filter(file => CRITICAL_FILES.some(c => file.startsWith(c) || file === c))
  .forEach(file => console.log(`   - ${file}`));

const currentVersion = getVersion();
const baseVersion = getVersion("origin/main");

if (!baseVersion) {
  console.log("⚠️  Could not read base version from origin/main, skipping check");
  process.exit(0);
}

if (currentVersion === baseVersion) {
  console.error("\n❌ Version bump required!");
  console.error(`   Current version: ${currentVersion}`);
  console.error(`   Base version: ${baseVersion}`);
  console.error("\n   Critical files changed but package.json version not bumped.");
  console.error("   Please update version according to SSOT Section 6.3:");
  console.error("   - Major: Breaking changes (SSOT format, contracts, permissions)");
  console.error("   - Minor: New features (backward compatible)");
  console.error("   - Patch: Bug fixes, docs, performance\n");
  process.exit(1);
}

console.log(`✅ Version bumped: ${baseVersion} → ${currentVersion}`);
process.exit(0);
