# ✅ EMR Database Connection Fix - Verification Guide

**Purpose**: Step-by-step verification procedures to confirm the fix worked  
**Created**: January 2025  
**Run From**: Mac client (100.94.125.38)

---

## 🎯 **VERIFICATION OVERVIEW**

After running the fix on the Linux server, you need to verify:

1. ✅ PostgreSQL service restarted successfully
2. ✅ pg_hba.conf has the correct entry
3. ✅ Database connection works from Mac
4. ✅ API server connects to database
5. ✅ Application loads data from PostgreSQL

---

## 📋 **PRE-FIX VERIFICATION** (Baseline)

Before running the fix, confirm the problem exists:

### **Test 1: Network Connectivity**

```bash
ping -c 3 100.112.67.23
```

**Expected**: Should succeed (proves Tailscale working)

```
PING 100.112.67.23: 56 data bytes
64 bytes from 100.112.67.23: icmp_seq=0 ttl=64 time=5.2 ms
...
--- 100.112.67.23 ping statistics ---
3 packets transmitted, 3 packets received, 0.0% packet loss
```

### **Test 2: PostgreSQL Port Accessibility**

```bash
nc -zv 100.112.67.23 5432
```

**Expected**: Should succeed (proves PostgreSQL running)

```
Connection to 100.112.67.23 port 5432 [tcp/postgresql] succeeded!
```

### **Test 3: Database Connection (Should FAIL before fix)**

```bash
PGPASSWORD='emr_secure_2024' psql -h 100.112.67.23 -p 5432 -U emr_admin -d emr_crc_ssot -c "SELECT 1;"
```

**Expected Before Fix**: Should FAIL with authentication error

```
psql: error: FATAL: no pg_hba.conf entry for host "100.94.125.38", user "emr_admin", database "emr_crc_ssot", SSL encryption
```

This confirms the problem exists and the fix is needed.

---

## 🔧 **DURING FIX VERIFICATION** (On Linux Server)

While SSH'd into the Linux server, verify each step:

### **Step 1: Verify PostgreSQL Config File Location**

```bash
sudo ls -la /etc/postgresql/*/main/pg_hba.conf
```

**Expected**: Should show path to pg_hba.conf

```
-rw-r--r-- 1 postgres postgres 4942 Dec 15 10:30 /etc/postgresql/16/main/pg_hba.conf
```

### **Step 2: Backup Original Config (Recommended)**

```bash
sudo cp /etc/postgresql/*/main/pg_hba.conf /etc/postgresql/*/main/pg_hba.conf.backup.$(date +%Y%m%d_%H%M%S)
```

**Expected**: No output, but verify backup exists:

```bash
ls -la /etc/postgresql/*/main/pg_hba.conf*
```

### **Step 3: Check Current pg_hba.conf (Before Adding Entry)**

```bash
sudo tail -10 /etc/postgresql/*/main/pg_hba.conf
```

**Expected**: Should NOT have the Tailscale entry yet

### **Step 4: Run the Fix Command**

```bash
echo "host    emr_crc_ssot    emr_admin    100.64.0.0/10    scram-sha-256" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf
```

**Expected Output**: The line you just added

```
host    emr_crc_ssot    emr_admin    100.64.0.0/10    scram-sha-256
```

### **Step 5: Verify Entry Was Added**

```bash
sudo tail -5 /etc/postgresql/*/main/pg_hba.conf
```

**Expected**: Should show the new entry at the end

```
# ... other entries ...
host    emr_crc_ssot    emr_admin    100.64.0.0/10    scram-sha-256
```

### **Step 6: Restart PostgreSQL**

```bash
sudo systemctl restart postgresql
```

**Expected**: No output on success

### **Step 7: Check PostgreSQL Status**

```bash
sudo systemctl status postgresql
```

**Expected**: Should show "active (running)"

```
● postgresql.service - PostgreSQL RDBMS
     Loaded: loaded (/lib/systemd/system/postgresql.service; enabled; vendor preset: enabled)
     Active: active (exited) since Wed 2025-01-15 14:30:00 UTC; 5s ago
   Main PID: 12345 (code=exited, status=0/SUCCESS)
```

### **Step 8: Check PostgreSQL Logs for Errors**

```bash
sudo tail -20 /var/log/postgresql/postgresql-*-main.log
```

**Expected**: Should show restart, no errors

```
2025-01-15 14:30:00 UTC [12345] LOG:  received fast shutdown request
2025-01-15 14:30:00 UTC [12345] LOG:  shutting down
2025-01-15 14:30:01 UTC [12346] LOG:  database system is ready to accept connections
```

If you see errors about pg_hba.conf syntax, check the file for typos.

---

## ✅ **POST-FIX VERIFICATION** (On Mac)

After exiting SSH, verify from your Mac:

### **Test 1: Database Connection (Should SUCCEED after fix)**

```bash
PGPASSWORD='emr_secure_2024' psql -h 100.112.67.23 -p 5432 -U emr_admin -d emr_crc_ssot -c "SELECT 1;"
```

**Expected After Fix**: Should succeed with this output

```
 ?column? 
----------
        1
(1 row)
```

**🎉 If you see this, the pg_hba.conf fix worked!**

### **Test 2: Query Patient Table**

```bash
PGPASSWORD='emr_secure_2024' psql -h 100.112.67.23 -p 5432 -U emr_admin -d emr_crc_ssot -c "SELECT COUNT(*) FROM patients;"
```

**Expected**: Should show patient count

```
 count 
-------
    27
(1 row)
```

### **Test 3: Query Placement Searches**

```bash
PGPASSWORD='emr_secure_2024' psql -h 100.112.67.23 -p 5432 -U emr_admin -d emr_crc_ssot -c "SELECT COUNT(*) FROM placement_searches;"
```

**Expected**: Should show search count

### **Test 4: Interactive psql Session**

```bash
PGPASSWORD='emr_secure_2024' psql -h 100.112.67.23 -p 5432 -U emr_admin -d emr_crc_ssot
```

**Expected**: PostgreSQL prompt

```
psql (16.1)
Type "help" for help.

emr_crc_ssot=>
```

Try some queries:

```sql
\dt                           -- List tables
\d patients                   -- Describe patients table
SELECT * FROM patients LIMIT 5;
\q                            -- Quit
```

---

## 🚀 **API SERVER VERIFICATION**

Now verify the API server can connect to the database:

### **Step 1: Navigate to Project Directory**

```bash
cd /Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22
```

### **Step 2: Stop Current API Server (If Running)**

If the API server is already running, stop it:

- Press `Ctrl+C` in the terminal running the server
- Or find the process and kill it:

```bash
lsof -ti:3001 | xargs kill -9
```

### **Step 3: Start API Server**

```bash
npm run api
```

Or if using start script:

```bash
./start
```

### **Step 4: Watch API Server Startup Logs**

Look for these SUCCESS messages:

```
✅ Database connection successful
✅ Connected to emr_crc_ssot at 100.112.67.23:5432
✅ PersistenceManager initialized with database backend
Server running on http://localhost:3001
```

**Should NOT see:**

```
❌ Database connection failed
❌ Error: no pg_hba.conf entry
❌ Falling back to local file storage
⚠️ Using fallback file storage
```

### **Step 5: Test API Endpoints**

In a new terminal:

```bash
# Test patients endpoint
curl http://localhost:3001/api/patients | jq '.' | head -20

# Test specific patient
curl http://localhost:3001/api/patients/pt_501 | jq '.'

# Test placement searches
curl http://localhost:3001/api/bed-searches | jq '.'
```

**Expected**: Should return data from database (not fallback files)

### **Step 6: Check API Logs for Database Queries**

In the API server terminal, you should see database queries:

```
Database query: SELECT * FROM patients
Database query: SELECT * FROM placement_searches WHERE patient_id = $1
```

**Should NOT see:**

```
Reading from fallback file: data/fallback/patients/pt_501.json
```

---

## 🌐 **UI VERIFICATION**

### **Step 1: Start UI Server (If Not Running)**

```bash
# In project directory
npm run dev
```

Or:

```bash
./start
```

### **Step 2: Open Browser**

Navigate to: http://localhost:5174

### **Step 3: Test Patient Dropdown**

- Patient names should appear (not "Unknown, Unknown")
- Example: "Nguyen, Dana" or "Test, Patient"

### **Step 4: Test Assessment Overview Tab**

- Select a patient
- Click "Assessment Overview" tab
- Should show bed searches and assessment data
- Data should load from database, not empty

### **Step 5: Open Browser Console**

Press `F12` or `Cmd+Option+I`, then:

- Go to Network tab
- Click on API requests to `/api/patients`
- Check response - should have `bedSearches` array

### **Step 6: Check for Errors**

In browser console, should NOT see:

```
Failed to load patient data
Error: Database connection failed
```

---

## 📊 **COMPREHENSIVE VERIFICATION CHECKLIST**

Use this checklist to confirm everything is working:

### **Network & Connectivity**

- [ ] Mac can ping Linux server (100.112.67.23)
- [ ] PostgreSQL port 5432 is accessible
- [ ] Tailscale VPN is active on both devices

### **PostgreSQL Server (Linux)**

- [ ] pg_hba.conf has entry: `host emr_crc_ssot emr_admin 100.64.0.0/10 scram-sha-256`
- [ ] PostgreSQL service is running (`active (running)`)
- [ ] No errors in PostgreSQL logs

### **Database Connection (Mac)**

- [ ] `psql` connection succeeds from Mac
- [ ] Can query patient table
- [ ] Can query placement_searches table
- [ ] Interactive psql session works

### **API Server (Mac)**

- [ ] API server starts without errors
- [ ] Logs show "Database connection successful"
- [ ] No "fallback" messages in logs
- [ ] API endpoints return data from database
- [ ] No "pg_hba.conf" errors in logs

### **User Interface (Browser)**

- [ ] Patient names display correctly (not "Unknown")
- [ ] Assessment Overview tab shows data
- [ ] Bed searches appear in UI
- [ ] No errors in browser console
- [ ] Dashboard link is visible

### **Data Integrity**

- [ ] Patient count matches between database and UI
- [ ] Search history displays correctly
- [ ] Can create new bed searches
- [ ] Data persists after page refresh

---

## 🚨 **TROUBLESHOOTING VERIFICATION FAILURES**

### **If Database Connection Still Fails**

**Check 1: Verify pg_hba.conf entry is correct**

On Linux server:

```bash
sudo grep "100.64.0.0" /etc/postgresql/*/main/pg_hba.conf
```

Should show:

```
host    emr_crc_ssot    emr_admin    100.64.0.0/10    scram-sha-256
```

**Check 2: Verify PostgreSQL restarted**

```bash
sudo systemctl status postgresql
```

Should show recent start time (a few minutes ago).

**Check 3: Check PostgreSQL is listening on correct port**

On Linux server:

```bash
sudo ss -tlnp | grep 5432
```

Should show:

```
LISTEN  0  128  *:5432  *:*  users:(("postgres",pid=12345,fd=6))
```

**Check 4: Force reload PostgreSQL config**

```bash
sudo systemctl reload postgresql
```

### **If API Server Shows Fallback Messages**

**Check 1: Restart API server**

- Stop API server (Ctrl+C)
- Clear any cached connections
- Start again: `npm run api`

**Check 2: Check environment variables**

```bash
echo $DB_HOST
echo $DB_PORT
```

Should be empty (using defaults from code) or set to correct values.

**Check 3: Check API server code**

Verify `src/api/server.js` has correct database credentials:

```javascript
DB_HOST: process.env.DB_HOST || '100.112.67.23',
DB_USER: process.env.DB_USER || 'emr_admin',
DB_PASSWORD: process.env.DB_PASSWORD || 'emr_secure_2024',
```

### **If Patient Names Still Show "Unknown"**

This indicates data issue, not connection issue:

**Check 1: Verify patient data exists**

```bash
PGPASSWORD='emr_secure_2024' psql -h 100.112.67.23 -p 5432 -U emr_admin -d emr_crc_ssot -c "SELECT id, first_name, last_name FROM patients LIMIT 5;"
```

**Check 2: Check API response structure**

```bash
curl http://localhost:3001/api/patients | jq '.[0]'
```

Should show `name`, `firstName`, `lastName` fields.

---

## ✅ **SUCCESS INDICATORS**

**You know the fix is complete when:**

1. ✅ `psql` test query returns `1` without error
2. ✅ API server logs show "Database connection successful"
3. ✅ No "fallback" or "pg_hba.conf" messages anywhere
4. ✅ Patient names display correctly in UI
5. ✅ Assessment data appears in UI
6. ✅ Can create new bed searches and see them saved
7. ✅ Data persists across server restarts

---

## 📝 **COMPLETION REPORT**

After successful verification, document the results:

### **What to Record**

- Date and time of fix
- Commands executed
- Any issues encountered
- Test results (all passing)
- pg_hba.conf backup location
- Recommendations for preventing future issues

### **Recommended Actions**

1. **Backup pg_hba.conf regularly**
   - Add to automated backup script
   - Version control in Git (separate secure repo)

2. **Create monitoring**
   - Alert if database connection fails
   - Daily health check script

3. **Document in runbook**
   - Add this issue to troubleshooting guide
   - Include fix procedure

4. **Consider automation**
   - Script to verify pg_hba.conf on server restart
   - Auto-add entry if missing

---

**Last Updated**: January 2025  
**Verification Version**: 1.0  
**Status**: Ready for use
