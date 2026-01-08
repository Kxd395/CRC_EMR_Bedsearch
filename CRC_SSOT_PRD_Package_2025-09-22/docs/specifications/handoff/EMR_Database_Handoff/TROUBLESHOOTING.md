# 🔧 EMR Database Connection - Troubleshooting Guide

**Created**: January 2025  
**Purpose**: Problem resolution for database connection issues  
**Scope**: PostgreSQL authentication and connectivity

---

## 🎯 **QUICK DIAGNOSIS**

### **Is This the Right Guide?**

Use this guide if you see:

- ❌ `FATAL: no pg_hba.conf entry for host`
- ❌ `Connection refused`
- ❌ `password authentication failed`
- ❌ `database "emr_crc_ssot" does not exist`
- ❌ API server logs showing "Falling back to local file storage"

---

## 📋 **SYSTEMATIC TROUBLESHOOTING**

### **Step 1: Verify Network Connectivity**

**Problem**: Can't reach Linux server at all

**Test**:

```bash
ping -c 3 100.112.67.23
```

**Expected**: Replies received

**If Fails**:

- Check Tailscale is running on Mac:

  ```bash
  tailscale status
  ```

  Should show both devices

- Check Tailscale is running on Linux server:

  ```bash
  ssh kevindialmb@100.112.67.23 "tailscale status"
  ```

- Restart Tailscale on Mac:

  ```bash
  sudo tailscale down
  sudo tailscale up
  ```

### **Step 2: Verify PostgreSQL Port is Open**

**Problem**: PostgreSQL not running or firewall blocking

**Test**:

```bash
nc -zv 100.112.67.23 5432
```

**Expected**: `Connection to 100.112.67.23 port 5432 [tcp/postgresql] succeeded!`

**If Fails**:

- Check PostgreSQL is running on Linux server:

  ```bash
  ssh kevindialmb@100.112.67.23 "sudo systemctl status postgresql"
  ```

  Should show `active (running)`

- Start PostgreSQL if stopped:

  ```bash
  ssh kevindialmb@100.112.67.23 "sudo systemctl start postgresql"
  ```

- Check PostgreSQL is listening on correct port:

  ```bash
  ssh kevindialmb@100.112.67.23 "sudo ss -tlnp | grep 5432"
  ```

  Should show PostgreSQL process

### **Step 3: Test Database Connection**

**Problem**: pg_hba.conf authentication failing

**Test**:

```bash
PGPASSWORD='emr_secure_2024' psql -h 100.112.67.23 -p 5432 -U emr_admin -d emr_crc_ssot -c "SELECT 1;"
```

**Expected**: Returns `1`

**If Fails with "no pg_hba.conf entry"**:

This is the main issue this handoff package fixes! Run the fix from `FIX_COMMANDS.sh`:

```bash
ssh kevindialmb@100.112.67.23
echo "host    emr_crc_ssot    emr_admin    100.64.0.0/10    scram-sha-256" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf && sudo systemctl restart postgresql
```

**If Fails with "password authentication failed"**:

- Verify password is correct (check `CREDENTIALS.md`)
- Verify user exists on Linux server:

  ```bash
  ssh kevindialmb@100.112.67.23 "sudo -u postgres psql -c '\du emr_admin'"
  ```

- If user doesn't exist, create it:

  ```bash
  ssh kevindialmb@100.112.67.23 "sudo -u postgres psql -c \"CREATE USER emr_admin WITH PASSWORD 'emr_secure_2024';\""
  ```

**If Fails with "database does not exist"**:

- Verify database exists on Linux server:

  ```bash
  ssh kevindialmb@100.112.67.23 "sudo -u postgres psql -c '\l emr_crc_ssot'"
  ```

- If database doesn't exist, create it:

  ```bash
  ssh kevindialmb@100.112.67.23 "sudo -u postgres psql -c 'CREATE DATABASE emr_crc_ssot OWNER emr_admin;'"
  ```

---

## 🚨 **COMMON ERROR MESSAGES**

### **Error: "no pg_hba.conf entry for host"**

**Full Error**:

```
FATAL: no pg_hba.conf entry for host "100.94.125.38", user "emr_admin", database "emr_crc_ssot", SSL encryption
```

**Meaning**: PostgreSQL is blocking your connection because your IP isn't whitelisted

**Solution**: Add Tailscale network to pg_hba.conf (this is the main fix)

**Steps**:

1. SSH to Linux server
2. Run: `echo "host emr_crc_ssot emr_admin 100.64.0.0/10 scram-sha-256" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf`
3. Restart PostgreSQL: `sudo systemctl restart postgresql`

**Verify Fix**:

```bash
PGPASSWORD='emr_secure_2024' psql -h 100.112.67.23 -p 5432 -U emr_admin -d emr_crc_ssot -c "SELECT 1;"
```

---

### **Error: "Connection refused"**

**Full Error**:

```
psql: error: could not connect to server: Connection refused
    Is the server running on host "100.112.67.23" and accepting TCP/IP connections on port 5432?
```

**Meaning**: Either PostgreSQL is not running, or it's not listening on port 5432

**Solution**: Start PostgreSQL and verify configuration

**Steps**:

1. Check if PostgreSQL is running:

   ```bash
   ssh kevindialmb@100.112.67.23 "sudo systemctl status postgresql"
   ```

2. If not running, start it:

   ```bash
   ssh kevindialmb@100.112.67.23 "sudo systemctl start postgresql"
   ```

3. Verify it's listening on port 5432:

   ```bash
   ssh kevindialmb@100.112.67.23 "sudo ss -tlnp | grep 5432"
   ```

4. Check PostgreSQL config allows network connections:

   ```bash
   ssh kevindialmb@100.112.67.23 "sudo grep listen_addresses /etc/postgresql/*/main/postgresql.conf"
   ```

   Should show: `listen_addresses = '*'` or `listen_addresses = '0.0.0.0'`

---

### **Error: "password authentication failed"**

**Full Error**:

```
psql: error: FATAL: password authentication failed for user "emr_admin"
```

**Meaning**: Password is incorrect or user doesn't exist

**Solution**: Verify credentials and user existence

**Steps**:

1. Check if user exists:

   ```bash
   ssh kevindialmb@100.112.67.23 "sudo -u postgres psql -c '\du emr_admin'"
   ```

2. If user doesn't exist, create it:

   ```bash
   ssh kevindialmb@100.112.67.23 "sudo -u postgres psql -c \"CREATE USER emr_admin WITH PASSWORD 'emr_secure_2024';\""
   ```

3. Grant permissions:

   ```bash
   ssh kevindialmb@100.112.67.23 "sudo -u postgres psql -c 'GRANT ALL PRIVILEGES ON DATABASE emr_crc_ssot TO emr_admin;'"
   ```

4. If password is wrong, reset it:

   ```bash
   ssh kevindialmb@100.112.67.23 "sudo -u postgres psql -c \"ALTER USER emr_admin WITH PASSWORD 'emr_secure_2024';\""
   ```

---

### **Error: "database does not exist"**

**Full Error**:

```
psql: error: FATAL: database "emr_crc_ssot" does not exist
```

**Meaning**: Database hasn't been created yet

**Solution**: Create the database

**Steps**:

1. Verify database doesn't exist:

   ```bash
   ssh kevindialmb@100.112.67.23 "sudo -u postgres psql -c '\l'"
   ```

2. Create database:

   ```bash
   ssh kevindialmb@100.112.67.23 "sudo -u postgres psql -c 'CREATE DATABASE emr_crc_ssot OWNER emr_admin;'"
   ```

3. Apply schema (if you have schema file):

   ```bash
   ssh kevindialmb@100.112.67.23 "sudo -u postgres psql -d emr_crc_ssot -f /path/to/schema.sql"
   ```

---

### **Error: "API server falling back to local storage"**

**Symptom**: API server logs show:

```
⚠️ Database connection failed
⚠️ Falling back to local file storage
```

**Meaning**: API server can't connect to PostgreSQL, using files instead

**Solution**: Fix database connection (usually pg_hba.conf issue)

**Steps**:

1. Test database connection manually:

   ```bash
   PGPASSWORD='emr_secure_2024' psql -h 100.112.67.23 -p 5432 -U emr_admin -d emr_crc_ssot -c "SELECT 1;"
   ```

2. If that fails, follow error message troubleshooting above

3. If manual connection works but API still fails:
   - Restart API server: `Ctrl+C` then `npm run api`
   - Check API server environment variables
   - Verify database credentials in `src/api/server.js`

---

## 🔍 **ADVANCED DIAGNOSTICS**

### **Check PostgreSQL Logs**

On Linux server:

```bash
ssh kevindialmb@100.112.67.23 "sudo tail -50 /var/log/postgresql/postgresql-*-main.log"
```

Look for:

- Connection attempts
- Authentication failures
- Error messages

### **Check pg_hba.conf Current Rules**

On Linux server:

```bash
ssh kevindialmb@100.112.67.23 "sudo cat /etc/postgresql/*/main/pg_hba.conf"
```

Verify you have this line:

```
host    emr_crc_ssot    emr_admin    100.64.0.0/10    scram-sha-256
```

### **Test as postgres Superuser**

On Linux server:

```bash
ssh kevindialmb@100.112.67.23 "sudo -u postgres psql -d emr_crc_ssot -c 'SELECT * FROM patients LIMIT 1;'"
```

If this works but emr_admin doesn't:

- Check user permissions
- Verify password is correct

### **Check Database Permissions**

On Linux server:

```bash
ssh kevindialmb@100.112.67.23 "sudo -u postgres psql -d emr_crc_ssot -c '\dp patients'"
```

Verify emr_admin has access to tables.

---

## 🛠️ **RECOVERY PROCEDURES**

### **Reset PostgreSQL to Working State**

If everything is broken:

1. **Backup current pg_hba.conf**:

   ```bash
   ssh kevindialmb@100.112.67.23 "sudo cp /etc/postgresql/*/main/pg_hba.conf /tmp/pg_hba.conf.broken"
   ```

2. **Restore from backup** (if you have one):

   ```bash
   ssh kevindialmb@100.112.67.23 "sudo cp /etc/postgresql/*/main/pg_hba.conf.backup /etc/postgresql/*/main/pg_hba.conf"
   ```

3. **Or recreate minimal pg_hba.conf**:

   ```bash
   ssh kevindialmb@100.112.67.23
   sudo bash -c 'cat > /etc/postgresql/*/main/pg_hba.conf' << EOF
   # PostgreSQL Client Authentication Configuration
   local   all             postgres                                peer
   local   all             all                                     peer
   host    all             all             127.0.0.1/32            scram-sha-256
   host    all             all             ::1/128                 scram-sha-256
   host    emr_crc_ssot    emr_admin       100.64.0.0/10           scram-sha-256
   EOF
   ```

4. **Restart PostgreSQL**:

   ```bash
   ssh kevindialmb@100.112.67.23 "sudo systemctl restart postgresql"
   ```

### **Complete PostgreSQL Reinstall (Nuclear Option)**

**⚠️ WARNING: This will delete all data! Backup first!**

Only use if PostgreSQL is completely broken:

1. **Backup database**:

   ```bash
   ssh kevindialmb@100.112.67.23 "sudo -u postgres pg_dump emr_crc_ssot > /tmp/emr_backup.sql"
   ```

2. **Remove PostgreSQL**:

   ```bash
   ssh kevindialmb@100.112.67.23 "sudo apt remove --purge postgresql postgresql-*"
   ```

3. **Reinstall**:

   ```bash
   ssh kevindialmb@100.112.67.23 "sudo apt update && sudo apt install postgresql-16"
   ```

4. **Restore from backup and reconfigure** (see original handoff package)

---

## 📞 **GETTING HELP**

### **What to Include When Asking for Help**

1. **Error message** (full text)
2. **What you tried** (commands you ran)
3. **Test results**:

   ```bash
   ping 100.112.67.23
   nc -zv 100.112.67.23 5432
   PGPASSWORD='emr_secure_2024' psql -h 100.112.67.23 -p 5432 -U emr_admin -d emr_crc_ssot -c "SELECT 1;"
   ```

4. **PostgreSQL status**:

   ```bash
   ssh kevindialmb@100.112.67.23 "sudo systemctl status postgresql"
   ```

5. **pg_hba.conf last few lines**:

   ```bash
   ssh kevindialmb@100.112.67.23 "sudo tail -10 /etc/postgresql/*/main/pg_hba.conf"
   ```

### **Documentation References**

- This handoff package: `README.md`, `CONTEXT.md`, `CREDENTIALS.md`
- Old handoff package: `/Users/VScode_Projects/EMR/EMR_BACKUP_COMPLETE_20250930_043906/.../EMR_Database_Handoff/`
- PostgreSQL docs: https://www.postgresql.org/docs/current/auth-pg-hba-conf.html
- Tailscale docs: https://tailscale.com/kb/

---

**Last Updated**: January 2025  
**Troubleshooting Version**: 1.0  
**Status**: Ready for use
