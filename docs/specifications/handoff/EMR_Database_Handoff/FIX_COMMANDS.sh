#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# EMR Database Connection Fix - Command Reference
# ═══════════════════════════════════════════════════════════════════════════
# Purpose: Fix PostgreSQL pg_hba.conf to allow Tailscale network access
# Run Location: Linux server (100.112.67.23) after SSH
# Required Access: sudo privileges
# Estimated Time: 5 minutes
# ═══════════════════════════════════════════════════════════════════════════

# ────────────────────────────────────────────────────────────────────────────
# STEP 1: SSH TO LINUX SERVER
# ────────────────────────────────────────────────────────────────────────────

# Run this command from your Mac terminal:

ssh kevindialmb@100.112.67.23

# When prompted, enter the password for kevindialmb user
# You should see a prompt like: kevindialmb@ubuntu-server:~$

# ────────────────────────────────────────────────────────────────────────────
# STEP 2: RUN THE FIX COMMAND (ON LINUX SERVER)
# ────────────────────────────────────────────────────────────────────────────

# Copy and paste this ENTIRE line:

echo "host    emr_crc_ssot    emr_admin    100.64.0.0/10    scram-sha-256" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf && sudo systemctl restart postgresql

# This command does 3 things:
# 1. Adds the Tailscale network whitelist to pg_hba.conf
# 2. Appends the entry (won't duplicate if run multiple times)
# 3. Restarts PostgreSQL to apply changes

# Expected output:
# host    emr_crc_ssot    emr_admin    100.64.0.0/10    scram-sha-256
# [sudo] password for kevindialmb: 
# (enter password)

# ────────────────────────────────────────────────────────────────────────────
# STEP 3: VERIFY THE FIX (ON LINUX SERVER)
# ────────────────────────────────────────────────────────────────────────────

# Check that PostgreSQL restarted successfully:
sudo systemctl status postgresql

# Expected output should show:
# Active: active (running)

# Verify the pg_hba.conf entry was added:
sudo tail -5 /etc/postgresql/*/main/pg_hba.conf

# You should see:
# host    emr_crc_ssot    emr_admin    100.64.0.0/10    scram-sha-256

# ────────────────────────────────────────────────────────────────────────────
# STEP 4: EXIT SSH
# ────────────────────────────────────────────────────────────────────────────

exit

# You're now back on your Mac

# ────────────────────────────────────────────────────────────────────────────
# STEP 5: TEST CONNECTION FROM MAC
# ────────────────────────────────────────────────────────────────────────────

# Run this command on your Mac:

PGPASSWORD='emr_secure_2024' psql -h 100.112.67.23 -p 5432 -U emr_admin -d emr_crc_ssot -c "SELECT 1;"

# Expected SUCCESS output:
#  ?column? 
# ----------
#         1
# (1 row)

# If you see this, the fix worked! ✅

# ────────────────────────────────────────────────────────────────────────────
# STEP 6: RESTART API SERVER (ON MAC)
# ────────────────────────────────────────────────────────────────────────────

# Navigate to your project directory:
cd /Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22

# If the API server is running, stop it (Ctrl+C)
# Then restart it:
npm run api

# Or if you're using the start script:
./start

# ────────────────────────────────────────────────────────────────────────────
# STEP 7: VERIFY API SERVER CONNECTION
# ────────────────────────────────────────────────────────────────────────────

# Check the API server logs for:
# ✅ Database connection successful
# ✅ Connected to emr_crc_ssot at 100.112.67.23:5432

# You should NOT see:
# ❌ Database connection failed
# ❌ Falling back to local file storage

# If you see the success messages, the database connection is fixed! 🎉

# ═══════════════════════════════════════════════════════════════════════════
# TROUBLESHOOTING
# ═══════════════════════════════════════════════════════════════════════════

# ────────────────────────────────────────────────────────────────────────────
# Problem: SSH connection refused
# ────────────────────────────────────────────────────────────────────────────
# Solution: Check Tailscale is running on both Mac and Linux server
ping 100.112.67.23
# If no response, Tailscale may be down

# ────────────────────────────────────────────────────────────────────────────
# Problem: PostgreSQL won't restart
# ────────────────────────────────────────────────────────────────────────────
# Check logs on Linux server:
sudo journalctl -u postgresql -n 50

# Check syntax in pg_hba.conf:
sudo nano /etc/postgresql/*/main/pg_hba.conf
# Look for syntax errors, remove duplicate entries

# ────────────────────────────────────────────────────────────────────────────
# Problem: Connection still fails after fix
# ────────────────────────────────────────────────────────────────────────────
# Verify the entry was added correctly:
sudo grep "100.64.0.0" /etc/postgresql/*/main/pg_hba.conf

# Should show:
# host    emr_crc_ssot    emr_admin    100.64.0.0/10    scram-sha-256

# Force reload PostgreSQL configuration:
sudo systemctl reload postgresql

# ────────────────────────────────────────────────────────────────────────────
# Problem: Wrong password error
# ────────────────────────────────────────────────────────────────────────────
# Verify database user exists:
sudo -u postgres psql -c "\du emr_admin"

# If user doesn't exist, create it:
sudo -u postgres psql -c "CREATE USER emr_admin WITH PASSWORD 'emr_secure_2024';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE emr_crc_ssot TO emr_admin;"

# ═══════════════════════════════════════════════════════════════════════════
# BACKUP/ROLLBACK
# ═══════════════════════════════════════════════════════════════════════════

# Before making changes, backup pg_hba.conf:
sudo cp /etc/postgresql/*/main/pg_hba.conf /etc/postgresql/*/main/pg_hba.conf.backup.$(date +%Y%m%d_%H%M%S)

# To rollback if something goes wrong:
sudo cp /etc/postgresql/*/main/pg_hba.conf.backup.YYYYMMDD_HHMMSS /etc/postgresql/*/main/pg_hba.conf
sudo systemctl restart postgresql

# ═══════════════════════════════════════════════════════════════════════════
# QUICK REFERENCE
# ═══════════════════════════════════════════════════════════════════════════

# SSH to server:
# ssh kevindialmb@100.112.67.23

# Fix command (run on Linux server):
# echo "host    emr_crc_ssot    emr_admin    100.64.0.0/10    scram-sha-256" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf && sudo systemctl restart postgresql

# Test from Mac:
# PGPASSWORD='emr_secure_2024' psql -h 100.112.67.23 -p 5432 -U emr_admin -d emr_crc_ssot -c "SELECT 1;"

# Restart API server:
# cd /Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22 && npm run api

# ═══════════════════════════════════════════════════════════════════════════
# END OF COMMANDS
# ═══════════════════════════════════════════════════════════════════════════
