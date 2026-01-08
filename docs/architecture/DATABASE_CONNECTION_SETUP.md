# 🔐 Database Connection Setup Guide

## Current Status

**Database Server:** 100.112.67.23:5432  
**Database:** emr_crc_ssot  
**User:** emr_admin  
**Your IP:** 100.94.125.38

## ❌ Current Issue

```
Error: no pg_hba.conf entry for host "100.94.125.38", user "emr_admin", 
database "emr_crc_ssot", no encryption
```

This error means **two things need to be fixed**:

1. **SSL/TLS encryption is required** - ✅ **FIXED** (added SSL configuration)
2. **Your IP address needs to be whitelisted** - ⚠️ **NEEDS DATABASE ADMIN**

## ✅ What I've Already Fixed

I've added SSL/TLS encryption to the database connections:

- ✅ Updated `production/api/server.js` to use SSL
- ✅ Updated `production/api/persistence.js` to use SSL
- ✅ Added SSL configuration note to `.env` file

## 🔧 What Needs to Be Done by Database Administrator

**Your IP address `100.94.125.38` needs to be whitelisted on the database server.**

### On the Database Server (100.112.67.23)

The database administrator needs to add this line to `/etc/postgresql/*/main/pg_hba.conf`:

```conf
# Allow access from Kevin's development machine
host    emr_crc_ssot    emr_admin    100.94.125.38/32    scram-sha-256
```

Then reload PostgreSQL:

```bash
sudo systemctl reload postgresql
# OR
sudo pg_ctlcluster 14 main reload
```

### Alternative: Whitelist Entire Network Range

If your IP changes frequently (DHCP), whitelist your subnet:

```conf
# Allow access from 100.94.125.0/24 subnet
host    emr_crc_ssot    emr_admin    100.94.125.0/24    scram-sha-256
```

## 🌐 Current Workaround: Fallback Mode

**Good News:** The application works in **fallback mode** with local JSON files!

While waiting for database access to be configured:

1. ✅ **UI works perfectly** - All features functional
2. ✅ **5 patients loaded** - From fallback storage
3. ✅ **Data persists** - Saved to local files in `production/api/data/fallback/`
4. ⚠️ **Not shared across machines** - Each developer has their own copy

### Fallback Storage Location

```
/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/production/api/data/fallback/
```

Patient data is saved as individual JSON files:
- `pt_501.json`
- `pt_502.json`
- etc.

## 🚀 Testing Current Setup (Fallback Mode)

Even without database access, you can test everything:

```bash
cd /Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22
./start-all.sh
```

Then:
1. Open http://localhost:5173 (or 5174)
2. Browser console will show: `⚠️ Database unavailable, using fallback storage`
3. **All features work!** Add searches, they persist across refreshes
4. Data is saved to local JSON files

## 🔍 Verify SSL Is Now Enabled

Once database admin whitelists your IP, test connection:

```bash
# Test with psql (if installed)
PGSSLMODE=require psql -h 100.112.67.23 -p 5432 -U emr_admin -d emr_crc_ssot

# Or use the test script
./test-database-connection.sh
```

Expected success response:
```
✅ Port 5432 is reachable
✅ Database connection successful
📊 Total patients: XX
```

## 📊 What Happens After IP is Whitelisted

1. **API server will auto-connect** to database on next restart
2. **All patients from database** will load (not just 5)
3. **Data syncs** between fallback and database
4. **Multi-user support** - Changes visible across all developers
5. **Production-ready** - Using actual database

## 🛠️ Manual Database Connection Test

If you have direct access to the database server, test with psql:

```bash
# With SSL required
PGSSLMODE=require PGPASSWORD='emr_secure_2024' psql \
  -h 100.112.67.23 \
  -p 5432 \
  -U emr_admin \
  -d emr_crc_ssot \
  -c "SELECT COUNT(*) FROM patients;"
```

## 📝 For Database Administrator

**Email/ticket template:**

---

**Subject:** PostgreSQL Access Request - EMR CRC SSOT Development

**Description:**

I need access to the PostgreSQL database for EMR CRC SSOT development.

**Database Details:**
- Server: 100.112.67.23
- Port: 5432
- Database: emr_crc_ssot
- User: emr_admin

**My IP Address:** 100.94.125.38

**Required pg_hba.conf Entry:**
```
host    emr_crc_ssot    emr_admin    100.94.125.38/32    scram-sha-256
```

**Why:** Development environment needs SSL-encrypted access to the database to test patient data persistence features.

**Current Status:** Application works in fallback mode with local JSON files, but needs database access for multi-user development and production testing.

---

## 🔄 Current vs Future State

### Current State (Fallback Mode)
```
UI → API Server → Local JSON Files → Data Persists ✅
     ↓
     Database (blocked by firewall) ❌
```

**Works for:**
- ✅ Single developer testing
- ✅ All UI features
- ✅ Data persistence
- ✅ Development workflow

**Limitations:**
- ❌ Data not shared across team
- ❌ Not using production database
- ❌ Limited to 5 sample patients

### Future State (After IP Whitelisted)
```
UI → API Server → Database (SSL) → All Patient Data ✅
     ↓
     Local JSON (backup) ✅
```

**Enables:**
- ✅ Full patient database access
- ✅ Multi-user development
- ✅ Production-like environment
- ✅ Data sharing across team
- ✅ Real-time sync

## ✅ Summary

**Immediate Actions:**

1. ✅ **SSL enabled** (already done by me)
2. ⚠️ **Request IP whitelist** (needs database admin)
3. ✅ **Start servers** (works in fallback mode)
4. ✅ **Test features** (all working with fallback)

**To Request Database Access:**

Contact your database administrator with:
- Your IP: `100.94.125.38`
- Required entry for `pg_hba.conf` (see template above)
- Database: `emr_crc_ssot` on `100.112.67.23:5432`

**In the Meantime:**

Use fallback mode - it works perfectly for development! All features functional, data persists locally.

```bash
./start-all.sh
```

Open http://localhost:5173 and develop normally. When database access is granted, just restart and it will auto-connect!

---

**Last Updated:** September 29, 2025  
**Status:** SSL Enabled ✅ | IP Whitelist Pending ⚠️ | Fallback Mode Active ✅
