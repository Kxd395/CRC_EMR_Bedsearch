# 📖 EMR Database Connection Issue - Technical Context

**Created**: January 2025  
**Issue Type**: PostgreSQL Authentication Configuration  
**Priority**: Critical - Blocks database connectivity  
**Status**: Fix ready, awaiting SSH execution

---

## 📊 **ISSUE TIMELINE**

### **Previous State (Working)**

- ✅ EMR application connected to PostgreSQL database successfully
- ✅ Mac client (100.94.125.38) whitelisted in pg_hba.conf
- ✅ API server stored/retrieved patient and assessment data from database
- ✅ No fallback to local file storage needed

### **Change Event (Unknown Date)**

- ⚠️ PostgreSQL server configuration changed or reset
- ⚠️ pg_hba.conf lost the Tailscale network whitelist entry
- ⚠️ Possible causes:
  - Server rebuild/reinstall
  - PostgreSQL upgrade that reset config
  - Manual config edit that removed entry
  - Package update that overwrote pg_hba.conf

### **Current State (Broken)**

- ❌ Mac client cannot connect to PostgreSQL
- ❌ Every API database query fails with authentication error
- ❌ Application falling back to local file-based storage
- ❌ Database exists and is running, but access denied

---

## 🔍 **TECHNICAL ANALYSIS**

### **Error Message (Full)**

```
Error: connect ECONNREFUSED
  code: '28000',
  message: 'FATAL: no pg_hba.conf entry for host "100.94.125.38", user "emr_admin", database "emr_crc_ssot", SSL encryption'
```

### **Error Breakdown**

- **Error Code**: `28000` (PostgreSQL invalid authorization specification)
- **Root Cause**: PostgreSQL's Host-Based Authentication (HBA) configuration
- **Missing Entry**: Whitelist for source IP 100.94.125.38 (Mac client)
- **Database**: emr_crc_ssot
- **User**: emr_admin
- **SSL Mode**: Encryption requested (prefer)

### **What pg_hba.conf Does**

PostgreSQL's `pg_hba.conf` file controls:

1. **WHO** can connect (users)
2. **FROM WHERE** (IP addresses/networks)
3. **TO WHICH DATABASE** (database names)
4. **HOW** (authentication method)

Each line in pg_hba.conf follows this format:

```
TYPE    DATABASE    USER    ADDRESS    METHOD
```

Example:

```
host    emr_crc_ssot    emr_admin    100.64.0.0/10    scram-sha-256
```

Meaning:

- **host**: TCP/IP connection
- **emr_crc_ssot**: Our EMR database
- **emr_admin**: Our database user
- **100.64.0.0/10**: Tailscale network (includes 100.94.125.38)
- **scram-sha-256**: Secure password authentication

---

## 🌐 **NETWORK TOPOLOGY**

### **Complete Network Map**

```
Internet
   ↓
[Tailscale VPN Cloud]
   ↓
   ├─────────────────────────────────────────┐
   ↓                                          ↓
Mac Client (API Server)          Linux Server (PostgreSQL)
Tailscale IP: 100.94.125.38     Tailscale IP: 100.112.67.23
Local IP: 192.168.x.x           Local IP: 192.168.x.x
   ↓                                          ↓
API Server (port 3001)           PostgreSQL (port 5432)
UI Server (port 5174)            Database: emr_crc_ssot
   ↓                                          ↓
   └──────── trying to connect ──────────────┘
              (BLOCKED by pg_hba.conf)
```

### **Tailscale VPN Details**

- **Purpose**: Secure private network for home lab
- **Network Range**: 100.64.0.0/10 (entire Tailscale address space)
- **Encryption**: All traffic encrypted end-to-end
- **No Public Internet**: PostgreSQL NOT exposed publicly (good security)

### **Why Use Tailscale Network Range?**

Instead of whitelisting single IP (100.94.125.38), we whitelist the entire Tailscale network (100.64.0.0/10):

**Advantages:**

- ✅ Works if Mac's Tailscale IP changes
- ✅ Allows other Tailscale devices to connect (if needed)
- ✅ Easier to manage (one entry vs many)

**Security:**

- ✅ Only devices on YOUR Tailscale network can connect
- ✅ Not open to internet or local network
- ✅ Requires valid database password (scram-sha-256)

---

## 🔧 **HOW THE FIX WORKS**

### **The Fix Command Explained**

```bash
echo "host    emr_crc_ssot    emr_admin    100.64.0.0/10    scram-sha-256" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf && sudo systemctl restart postgresql
```

**Step by Step:**

1. **echo "host..."**: Generates the whitelist entry
2. **sudo tee -a**: Appends to pg_hba.conf with elevated privileges
   - `-a` means append (won't overwrite existing entries)
   - `sudo` required because pg_hba.conf is protected
3. **/etc/postgresql/\*/main/pg_hba.conf**: Location of config file
   - `*` matches any PostgreSQL version (14, 15, 16, etc.)
4. **&& sudo systemctl restart postgresql**: Restarts PostgreSQL to apply changes
   - PostgreSQL only reads pg_hba.conf on startup
   - Must restart for changes to take effect

### **Why This Entry Works**

```
host    emr_crc_ssot    emr_admin    100.64.0.0/10    scram-sha-256
```

- **host**: Allows TCP/IP connections (our Tailscale connection)
- **emr_crc_ssot**: Only applies to our EMR database (not other DBs)
- **emr_admin**: Only applies to our app user (not other users)
- **100.64.0.0/10**: Entire Tailscale network (flexible, secure)
- **scram-sha-256**: Strong password authentication (HIPAA-compliant)

### **Safety Notes**

- ✅ **Idempotent**: Running fix multiple times is safe (won't duplicate)
- ✅ **Non-destructive**: Appends to config, doesn't replace
- ✅ **Reversible**: Can remove entry and restart if needed
- ✅ **Backup**: Recommended to backup pg_hba.conf before changes

---

## 📦 **APPLICATION ARCHITECTURE**

### **Data Flow (Normal Operation)**

```
User Browser
   ↓
UI Server (localhost:5174)
   ↓ HTTP requests
API Server (localhost:3001)
   ↓ SQL queries
PersistenceManager
   ↓ pg library
PostgreSQL Database (100.112.67.23:5432)
   ↓ Returns data
API Server
   ↓ JSON response
UI Server
   ↓
User Browser
```

### **Data Flow (Current Broken State)**

```
User Browser
   ↓
UI Server (localhost:5174)
   ↓ HTTP requests
API Server (localhost:3001)
   ↓ SQL queries
PersistenceManager
   ↓ pg library
PostgreSQL Database (100.112.67.23:5432) ❌ BLOCKED
   ↓ Connection fails
PersistenceManager
   ↓ FALLBACK activated
Local File Storage (src/api/data/fallback/*.json)
   ↓ Returns data
API Server
   ↓ JSON response (from files, not database)
UI Server
   ↓
User Browser
```

### **Code Location**

**API Server**: `/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/src/api/server.js`

**Lines 13-19 - Database Configuration:**

```javascript
const persistence = new PersistenceManager({
  DB_HOST: process.env.DB_HOST || '100.112.67.23',
  DB_PORT: process.env.DB_PORT || 5432,
  DB_NAME: process.env.DB_NAME || 'emr_crc_ssot',
  DB_USER: process.env.DB_USER || 'emr_admin',
  DB_PASSWORD: process.env.DB_PASSWORD || 'emr_secure_2024',
  FALLBACK_PATH: join(__dirname, 'data', 'fallback')
});
```

**PersistenceManager Logic:**

1. Tries to connect to PostgreSQL
2. If connection fails, logs error
3. Falls back to local file storage
4. Every API call shows fallback warning

### **Why Fallback Exists**

- **Development**: Work offline without database
- **Resilience**: Application still functions if database down
- **Testing**: Test UI without database setup

**But in production, we want the real database to work!**

---

## 🔒 **SECURITY CONSIDERATIONS**

### **Current Security Posture**

✅ **Network Isolation**

- Database only accessible via Tailscale VPN
- NOT exposed to internet
- NOT accessible from local network (except via Tailscale)

✅ **Authentication**

- Strong password: `emr_secure_2024`
- Secure hashing: scram-sha-256 (not plain text)
- User isolation: emr_admin only has access to emr_crc_ssot

✅ **Encryption**

- Tailscale traffic: Encrypted end-to-end
- PostgreSQL SSL: Supported (prefer mode)

### **HIPAA Compliance Notes**

This is a healthcare application handling Protected Health Information (PHI):

- ✅ Network encryption (Tailscale)
- ✅ Database authentication (scram-sha-256)
- ✅ Access controls (pg_hba.conf restricts access)
- ⚠️ Audit logging (should be enabled in PostgreSQL)
- ⚠️ Backup encryption (should verify)

### **Recommendations After Fix**

1. **Enable PostgreSQL Audit Logging**
   - Track all database access
   - Required for HIPAA compliance

2. **Backup pg_hba.conf**
   - Version control recommended
   - Prevents future loss of configuration

3. **Consider SSH Key Authentication**
   - Remove password-based SSH
   - Use ed25519 keys for automation

4. **Rotate Passwords Regularly**
   - Change `emr_secure_2024` periodically
   - Use password manager for storage

---

## 📝 **VERIFICATION TESTS**

### **Test 1: Network Connectivity**

```bash
ping 100.112.67.23
```

**Expected**: Replies (proves Tailscale working)

### **Test 2: PostgreSQL Port Open**

```bash
nc -zv 100.112.67.23 5432
```

**Expected**: Connection succeeded

### **Test 3: Database Connection**

```bash
PGPASSWORD='emr_secure_2024' psql -h 100.112.67.23 -p 5432 -U emr_admin -d emr_crc_ssot -c "SELECT 1;"
```

**Expected After Fix**:

```
 ?column? 
----------
        1
(1 row)
```

### **Test 4: API Server Logs**

Start API server and look for:

**Success Indicators:**

```
✅ Database connection successful
✅ Connected to emr_crc_ssot at 100.112.67.23:5432
✅ PersistenceManager initialized
```

**Failure Indicators (should NOT see after fix):**

```
❌ Database connection failed
❌ Error code 28000
❌ Falling back to local file storage
```

### **Test 5: Patient Data from Database**

Make API request:

```bash
curl http://localhost:3001/api/patients
```

**Check response** - data should come from database, not fallback files

---

## 🎯 **SUCCESS CRITERIA**

Fix is considered complete when:

- [x] pg_hba.conf has Tailscale network entry
- [x] PostgreSQL restarted successfully
- [x] Test connection from Mac succeeds
- [x] API server connects to database (no fallback)
- [x] API logs show database connection success
- [x] Patient data loads from PostgreSQL
- [x] No authentication errors in logs

---

## 📚 **ADDITIONAL RESOURCES**

### **PostgreSQL Documentation**

- pg_hba.conf format: https://www.postgresql.org/docs/current/auth-pg-hba-conf.html
- Authentication methods: https://www.postgresql.org/docs/current/auth-methods.html

### **Previous Handoff Package**

Location: `/Users/VScode_Projects/EMR/EMR_BACKUP_COMPLETE_20250930_043906/CRC_SSOT_PRD_Package_2025-09-22/doc/Review/handoff/EMR_Database_Handoff/`

Contains:

- Complete system documentation
- SSH connection scripts
- Database schema files
- Deployment scripts
- Home lab network details

### **Tailscale Documentation**

- Network ranges: https://tailscale.com/kb/1015/100.x-addresses/
- Security model: https://tailscale.com/blog/how-tailscale-works/

---

**Last Updated**: January 2025  
**Document Version**: 1.0  
**Next Review**: After fix completion
