# 🔧 EMR Database Connection Fix - Agent Handoff Package

**Created**: January 2025  
**Priority**: 🔴 **CRITICAL - Database Connection Broken**  
**Task**: Fix PostgreSQL pg_hba.conf to restore remote database access  
**Estimated Time**: 15 minutes  
**Required Access**: SSH to Linux server with sudo privileges

---

## 🚨 **SITUATION OVERVIEW**

### **Current Problem**
The EMR application's API server (running on Mac) **cannot connect** to the PostgreSQL database (running on Linux server via Tailscale). 

**Error Message:**
```
FATAL: no pg_hba.conf entry for host "100.94.125.38", user "emr_admin", database "emr_crc_ssot", SSL encryption
```

### **Root Cause**
The PostgreSQL server's `pg_hba.conf` file is **missing the whitelist entry** for the Mac client's Tailscale IP address. This entry existed previously but was lost (likely during server maintenance or config reset).

### **Impact**
- ❌ API server cannot load data from PostgreSQL
- ⚠️ Application falling back to local file-based data storage
- ⚠️ Assessment data, patient records not syncing to database
- ⚠️ Multi-user collaboration not possible (no shared database)

### **What Was Working Before**
- Database connection was functional
- pg_hba.conf had proper Tailscale network whitelist
- API successfully stored/retrieved data from PostgreSQL
- No fallback messages in logs

---

## 🎯 **YOUR MISSION**

**Fix the PostgreSQL authentication configuration to allow the Mac client to connect.**

### **Success Criteria:**
1. ✅ SSH successfully to Linux server (100.112.67.23)
2. ✅ Add Tailscale network whitelist entry to pg_hba.conf
3. ✅ Restart PostgreSQL service
4. ✅ Test connection from Mac client succeeds
5. ✅ API server logs show database connection (no fallback messages)

---

## 📋 **COMPLETE TASK CHECKLIST**

### **Phase 1: Pre-Flight Checks** (5 minutes)
- [ ] Verify you have SSH credentials for Linux server
- [ ] Confirm Mac and Linux server are on Tailscale network
- [ ] Review this README and understand the fix
- [ ] Read `CONTEXT.md` for detailed background

### **Phase 2: Execute Fix** (5 minutes)
- [ ] SSH to Linux server using credentials from `CREDENTIALS.md`
- [ ] Run the fix command from `FIX_COMMANDS.sh`
- [ ] Verify PostgreSQL restarted successfully
- [ ] Check pg_hba.conf entry was added correctly

### **Phase 3: Verification** (5 minutes)
- [ ] Test database connection from Mac using test command
- [ ] Restart API server on Mac
- [ ] Check API logs for successful database connection
- [ ] Verify no "fallback" messages appear
- [ ] Test patient data loads from database

### **Phase 4: Documentation** (Optional)
- [ ] Update `COMPLETION_REPORT.md` with results
- [ ] Note any issues encountered
- [ ] Recommend pg_hba.conf backup/version control

---

## 📁 **HANDOFF PACKAGE CONTENTS**

### **Core Documentation**
- `README.md` (this file) - Main handoff guide and task overview
- `CONTEXT.md` - Detailed technical background and history
- `CREDENTIALS.md` - All SSH and database credentials
- `FIX_COMMANDS.sh` - Exact commands to run (copy-paste ready)
- `VERIFICATION.md` - Testing and validation procedures

### **Reference Files**
- `fix-pg-hba.sh` - Automated fix script (already created)
- `NETWORK_TOPOLOGY.md` - Tailscale network diagram
- `TROUBLESHOOTING.md` - Common issues and solutions

### **Historical Context**
- See: `/Users/VScode_Projects/EMR/EMR_BACKUP_COMPLETE_20250930_043906/CRC_SSOT_PRD_Package_2025-09-22/doc/Review/handoff/EMR_Database_Handoff/`
- Previous handoff package with complete system documentation
- homelabSSH.md contains home lab network details

---

## 🚀 **QUICK START (15 Minutes)**

### **Step 1: Review Credentials**
```bash
cat CREDENTIALS.md
```
Make note of:
- SSH login: `kevindialmb@100.112.67.23`
- Database: `emr_crc_ssot` on `100.112.67.23:5432`
- Database user: `emr_admin`

### **Step 2: SSH to Linux Server**

**⚠️ IMPORTANT: SSH Port is 2222 (not standard 22!)**

```bash
ssh -p 2222 kevindialmb@100.112.67.23
# Enter password when prompted
```

### **Step 3: Run Fix Command**
```bash
# Copy-paste this ENTIRE command (from FIX_COMMANDS.sh):
echo "host    emr_crc_ssot    emr_admin    100.64.0.0/10    scram-sha-256" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf && sudo systemctl restart postgresql
```

### **Step 4: Exit SSH and Test Connection**
```bash
# Exit SSH
exit

# Test from Mac (run in new terminal):
PGPASSWORD='emr_secure_2024' psql -h 100.112.67.23 -p 5432 -U emr_admin -d emr_crc_ssot -c "SELECT 1;"
```

**Expected Output:**
```
 ?column? 
----------
        1
(1 row)
```

### **Step 5: Restart API Server**
```bash
# Navigate to project directory
cd /Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22

# Restart API server (if running)
# Stop current server (Ctrl+C), then:
npm run api
```

### **Step 6: Verify Success**
Check API server logs for:
```
✅ Database connection successful
✅ Connected to emr_crc_ssot at 100.112.67.23:5432
```

**Should NOT see:**
```
❌ Database connection failed
❌ Falling back to local file storage
```

---

## 📊 **NETWORK TOPOLOGY**

```
┌─────────────────────────────────────────────────────────┐
│              Tailscale VPN Network (100.x.x.x/8)        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Mac Client (API Server)                                │
│  ├─ Tailscale IP: 100.94.125.38 ⭐ NEEDS WHITELIST    │
│  ├─ API Server: localhost:3001                          │
│  ├─ UI Server: localhost:5174                           │
│  └─ Trying to connect to PostgreSQL                     │
│                       ↓ (blocked by pg_hba.conf)        │
│                                                          │
│  Linux Server (PostgreSQL)                              │
│  ├─ Tailscale IP: 100.112.67.23 ⭐ DATABASE HOST      │
│  ├─ PostgreSQL: Port 5432 (OPEN and RUNNING)           │
│  ├─ Database: emr_crc_ssot                              │
│  ├─ User: emr_admin                                     │
│  └─ pg_hba.conf: MISSING Mac IP whitelist ❌           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 **SECURITY NOTES**

- **Tailscale Network**: 100.64.0.0/10 (entire Tailscale range)
- **Authentication**: scram-sha-256 (PostgreSQL secure auth)
- **SSH Access**: Password-based (no key configured)
- **Database Password**: Stored in `CREDENTIALS.md`
- **Credentials Security**: This handoff package contains SENSITIVE information - handle accordingly

---

## 📞 **SUPPORT RESOURCES**

### **Documentation References**
- Old handoff package: `/Users/VScode_Projects/EMR/EMR_BACKUP_COMPLETE_20250930_043906/CRC_SSOT_PRD_Package_2025-09-22/doc/Review/handoff/EMR_Database_Handoff/`
- Home lab SSH guide: `homelabSSH.md` in old handoff
- Network topology: See old handoff README.md

### **Key Files in This Package**
1. **CREDENTIALS.md** - All login credentials
2. **FIX_COMMANDS.sh** - Exact fix commands
3. **CONTEXT.md** - Full technical background
4. **VERIFICATION.md** - How to test success
5. **TROUBLESHOOTING.md** - Problem resolution guide

### **Error Messages to Watch For**
- ✅ Success: `SELECT 1;` query returns `1`
- ❌ Still broken: `no pg_hba.conf entry for host`
- ❌ Wrong password: `password authentication failed`
- ❌ Port closed: `Connection refused`

---

## ✅ **COMPLETION CHECKLIST**

When finished, verify:
- [ ] Can SSH to Linux server successfully
- [ ] pg_hba.conf has new entry for Tailscale network
- [ ] PostgreSQL service restarted without errors
- [ ] Test connection from Mac succeeds
- [ ] API server connects to database (no fallback)
- [ ] Patient data loads from PostgreSQL
- [ ] Assessment data appears in UI
- [ ] No error messages in API logs
- [ ] Update `COMPLETION_REPORT.md` with results

---

## 🎯 **NEXT STEPS AFTER FIX**

1. **Document the fix** in `COMPLETION_REPORT.md`
2. **Backup pg_hba.conf** to prevent future loss
3. **Consider automation** - script to verify pg_hba.conf on server restart
4. **Update monitoring** - alert if database connection fails
5. **Create recovery playbook** - standard process for this issue

---

**Last Updated**: January 2025  
**Package Version**: 1.0  
**Status**: Ready for Agent Execution
