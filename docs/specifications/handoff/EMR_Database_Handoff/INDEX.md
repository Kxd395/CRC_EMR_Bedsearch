# 📦 EMR Database Connection Fix - Handoff Package Index

**Created**: January 2025  
**Package Version**: 1.0  
**Purpose**: Fix PostgreSQL pg_hba.conf to restore database connectivity  
**Estimated Time**: 15 minutes

---

## 🎯 **QUICK START**

### **What's Broken?**

The EMR API server cannot connect to PostgreSQL database. Error:

```
FATAL: no pg_hba.conf entry for host "100.94.125.38"
```

### **What's the Fix?**

SSH to Linux server and add Tailscale network whitelist to pg_hba.conf:

```bash
ssh kevindialmb@100.112.67.23
echo "host    emr_crc_ssot    emr_admin    100.64.0.0/10    scram-sha-256" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf && sudo systemctl restart postgresql
```

### **How to Verify?**

Test connection from Mac:

```bash
PGPASSWORD='emr_secure_2024' psql -h 100.112.67.23 -p 5432 -U emr_admin -d emr_crc_ssot -c "SELECT 1;"
```

Should return: `1` ✅

---

## 📁 **PACKAGE CONTENTS**

### **1. Core Documentation**

| File | Purpose | When to Use |
|------|---------|-------------|
| **README.md** | Main handoff guide, overview, task checklist | **START HERE** - Read first |
| **CREDENTIALS.md** | SSH credentials, database connection details | When connecting to servers |
| **CONTEXT.md** | Technical background, root cause analysis | For understanding the problem |
| **FIX_COMMANDS.sh** | Exact commands to run (copy-paste ready) | During execution |
| **VERIFICATION.md** | Testing procedures, success validation | After running the fix |

### **2. Reference Documentation**

| File | Purpose | When to Use |
|------|---------|-------------|
| **NETWORK_TOPOLOGY.md** | Network diagram, IP addresses, architecture | Understanding network setup |
| **TROUBLESHOOTING.md** | Common errors, problem resolution | If something goes wrong |
| **fix-pg-hba.sh** | Automated fix script (from scripts/database/) | Alternative to manual commands |
| **COMPLETION_REPORT.md** | Results template, sign-off checklist | After completing the fix |

### **3. Historical References**

| Location | Contents |
|----------|----------|
| Old handoff package | `/Users/VScode_Projects/EMR/EMR_BACKUP_COMPLETE_20250930_043906/.../EMR_Database_Handoff/` |
| - README.md | Complete system documentation from Sept 2025 |
| - homelabSSH.md | Detailed SSH and home lab network guide |
| - CONFIGURATION_SUMMARY.md | Complete config package overview |
| - Schema files | PostgreSQL database schema and structure |
| - Deployment scripts | Database deployment automation |

---

## 📖 **READING ORDER (RECOMMENDED)**

### **For Quick Fix (15 minutes)**

1. ✅ **README.md** - Understand the task (5 min)
2. ✅ **CREDENTIALS.md** - Get login details (2 min)
3. ✅ **FIX_COMMANDS.sh** - Execute the fix (3 min)
4. ✅ **VERIFICATION.md** - Test success (5 min)

### **For Deep Understanding (1 hour)**

1. ✅ **README.md** - Task overview
2. ✅ **CONTEXT.md** - Full technical analysis
3. ✅ **NETWORK_TOPOLOGY.md** - Network architecture
4. ✅ **CREDENTIALS.md** - Access information
5. ✅ **FIX_COMMANDS.sh** - Command reference
6. ✅ **VERIFICATION.md** - Testing procedures
7. ✅ **TROUBLESHOOTING.md** - Problem resolution
8. ✅ Old handoff package - Historical context

---

## 🗺️ **FILE DEPENDENCIES**

```
README.md (START HERE)
    ├── References → CREDENTIALS.md (for SSH/DB access)
    ├── References → CONTEXT.md (for technical background)
    ├── References → FIX_COMMANDS.sh (for exact commands)
    ├── References → VERIFICATION.md (for testing)
    └── References → Old handoff package (for history)

CREDENTIALS.md
    ├── Used by → FIX_COMMANDS.sh (login details)
    └── Used by → VERIFICATION.md (test commands)

CONTEXT.md
    ├── References → NETWORK_TOPOLOGY.md (network details)
    └── Explains → Why the fix is needed

FIX_COMMANDS.sh
    ├── Implements → Solution from CONTEXT.md
    └── Tested by → VERIFICATION.md

VERIFICATION.md
    ├── Uses → CREDENTIALS.md (test credentials)
    └── Falls back to → TROUBLESHOOTING.md (if fails)

TROUBLESHOOTING.md
    ├── References → All other files
    └── Escalates to → Old handoff package

NETWORK_TOPOLOGY.md
    └── Referenced by → CONTEXT.md, TROUBLESHOOTING.md

fix-pg-hba.sh
    └── Automates → Commands from FIX_COMMANDS.sh

COMPLETION_REPORT.md
    └── Filled out → After completing all steps
```

---

## 🎯 **TASK WORKFLOW**

### **Phase 1: Preparation (5 minutes)**

```
1. Read README.md
   ↓
2. Review CONTEXT.md (understand the problem)
   ↓
3. Check CREDENTIALS.md (verify you have access)
   ↓
4. Pre-flight checks (ping, port test)
```

### **Phase 2: Execution (5 minutes)**

```
1. SSH to Linux server (using CREDENTIALS.md)
   ↓
2. Run fix command (from FIX_COMMANDS.sh)
   ↓
3. Verify PostgreSQL restarted
   ↓
4. Check pg_hba.conf entry added
   ↓
5. Exit SSH
```

### **Phase 3: Verification (5 minutes)**

```
1. Test database connection (from VERIFICATION.md)
   ↓
2. Restart API server
   ↓
3. Check API logs (no fallback messages)
   ↓
4. Test UI (patient names, assessments)
   ↓
5. Verify success criteria met
```

### **Phase 4: Documentation (Optional)**

```
1. Fill out COMPLETION_REPORT.md
   ↓
2. Record any issues in TROUBLESHOOTING.md
   ↓
3. Update runbook/wiki
   ↓
4. Archive handoff package
```

---

## 🔧 **TECHNICAL SUMMARY**

### **System Components**

- **Mac Client**: 100.94.125.38 (Tailscale)
  - API Server: localhost:3001
  - UI Server: localhost:5174

- **Linux Server**: 100.112.67.23 (Tailscale)
  - PostgreSQL: 5432
  - Database: emr_crc_ssot
  - User: emr_admin

### **The Problem**

PostgreSQL's `pg_hba.conf` is missing whitelist entry for Mac's Tailscale IP. This entry existed before but was lost (server rebuild or config reset).

### **The Solution**

Add this line to `/etc/postgresql/*/main/pg_hba.conf`:

```
host    emr_crc_ssot    emr_admin    100.64.0.0/10    scram-sha-256
```

Then restart PostgreSQL.

### **Why It Works**

- **host**: Allow TCP/IP connections
- **emr_crc_ssot**: Database name
- **emr_admin**: Database user
- **100.64.0.0/10**: Entire Tailscale network (includes 100.94.125.38)
- **scram-sha-256**: Secure password authentication

---

## 📞 **GETTING HELP**

### **If You Get Stuck**

1. **Check TROUBLESHOOTING.md** - Common errors and solutions
2. **Review CONTEXT.md** - Understand what should happen
3. **Consult old handoff** - Complete system documentation
4. **Test each layer**:
   - Network: `ping 100.112.67.23`
   - Port: `nc -zv 100.112.67.23 5432`
   - Database: `psql -h 100.112.67.23 ...`

### **Information to Collect**

When asking for help, include:

- Error messages (full text)
- Commands you ran
- Test results (from VERIFICATION.md)
- PostgreSQL status
- pg_hba.conf contents

---

## ✅ **SUCCESS INDICATORS**

You'll know the fix worked when:

1. ✅ `psql` test query returns `1` without error
2. ✅ API server logs: "Database connection successful"
3. ✅ No "fallback" or "pg_hba.conf" messages
4. ✅ Patient names display correctly in UI
5. ✅ Assessment data appears in UI
6. ✅ Can create new bed searches

---

## 📋 **QUICK REFERENCE**

### **Key Commands**

```bash
# SSH to server
ssh kevindialmb@100.112.67.23

# Fix pg_hba.conf (on Linux server)
echo "host    emr_crc_ssot    emr_admin    100.64.0.0/10    scram-sha-256" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf && sudo systemctl restart postgresql

# Test from Mac
PGPASSWORD='emr_secure_2024' psql -h 100.112.67.23 -p 5432 -U emr_admin -d emr_crc_ssot -c "SELECT 1;"

# Restart API server
cd /Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22 && npm run api
```

### **Key Credentials**

- **SSH**: kevindialmb@100.112.67.23
- **Database**: emr_crc_ssot on 100.112.67.23:5432
- **DB User**: emr_admin
- **DB Password**: emr_secure_2024

### **Key Files Modified**

- `/etc/postgresql/*/main/pg_hba.conf` (on Linux server)

---

## 📦 **PACKAGE LOCATION**

This handoff package is located at:

```
/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/docs/specifications/handoff/EMR_Database_Handoff/
```

**Contents**:

```
EMR_Database_Handoff/
├── INDEX.md                    # This file - package overview
├── README.md                   # Main handoff guide
├── CREDENTIALS.md              # Access credentials
├── CONTEXT.md                  # Technical background
├── FIX_COMMANDS.sh             # Command reference
├── VERIFICATION.md             # Testing procedures
├── NETWORK_TOPOLOGY.md         # Network architecture
├── TROUBLESHOOTING.md          # Problem resolution
├── COMPLETION_REPORT.md        # Results template
└── fix-pg-hba.sh              # Automated fix script
```

---

## 🔄 **VERSION HISTORY**

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 2025 | Initial handoff package created |
| | | - Complete documentation |
| | | - Fix commands and scripts |
| | | - Verification procedures |
| | | - Troubleshooting guide |

---

## 📝 **NEXT STEPS AFTER FIX**

1. ✅ Complete COMPLETION_REPORT.md
2. 📋 Update troubleshooting runbook
3. 🔐 Backup pg_hba.conf regularly
4. 📊 Set up database connection monitoring
5. 🔑 Consider SSH key authentication
6. 🗂️ Archive this handoff package

---

**Package Created**: January 2025  
**Package Version**: 1.0  
**Status**: ✅ Ready for Agent Execution  
**Estimated Completion Time**: 15 minutes
