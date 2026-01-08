# 🚀 EMR Database Fix - QUICK START (5 Minutes)

**Problem**: Database connection broken  
**Solution**: Fix pg_hba.conf whitelist  
**Time**: 5 minutes  
**Skill**: Basic SSH and terminal commands

---

## ⚡ **FASTEST PATH TO SOLUTION**

### **Step 1: Read This First** ⏱️ 1 minute

You're fixing a PostgreSQL authentication issue. The database is blocking your Mac's IP address. You'll SSH to the Linux server and add a whitelist entry.

**What you need**:
- SSH access to Linux server (kevindialmb@100.112.67.23)
- Password for SSH (you should have this)
- 5 minutes of time

---

### **Step 2: Run These Commands** ⏱️ 3 minutes

**Open Terminal on your Mac** and run:

```bash
# 1. SSH to Linux server
ssh kevindialmb@100.112.67.23
# (Enter password when prompted)

# 2. Fix pg_hba.conf (copy-paste this ENTIRE line)
echo "host    emr_crc_ssot    emr_admin    100.64.0.0/10    scram-sha-256" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf && sudo systemctl restart postgresql
# (Enter sudo password if prompted)

# 3. Exit SSH
exit

# 4. Test connection (back on Mac)
PGPASSWORD='emr_secure_2024' psql -h 100.112.67.23 -p 5432 -U emr_admin -d emr_crc_ssot -c "SELECT 1;"
```

**Expected output from test**:
```
 ?column? 
----------
        1
(1 row)
```

✅ If you see this, **YOU'RE DONE!** The fix worked.

---

### **Step 3: Restart API Server** ⏱️ 1 minute

```bash
# Navigate to project
cd /Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22

# Restart API server (if running, stop with Ctrl+C first)
npm run api
```

**Look for** in the logs:
```
✅ Database connection successful
✅ Connected to emr_crc_ssot at 100.112.67.23:5432
```

**Should NOT see**:
```
❌ Database connection failed
❌ Falling back to local file storage
```

---

## ✅ **SUCCESS CHECKLIST**

- [ ] SSH command worked (no "connection refused")
- [ ] pg_hba.conf update command ran (no errors)
- [ ] Test query returned `1` (not an error)
- [ ] API server logs show "Database connection successful"
- [ ] No "fallback" messages in API logs

**All checked?** ✅ **YOU'RE DONE! 🎉**

---

## 🚨 **IF SOMETHING GOES WRONG**

### **SSH fails (connection refused)**

Check Tailscale is running:
```bash
tailscale status
```

Should show both devices (100.94.125.38 and 100.112.67.23).

### **Test query fails**

Try this on the Linux server:
```bash
ssh kevindialmb@100.112.67.23 "sudo systemctl status postgresql"
```

Should show `active (running)`.

### **Still broken?**

Read the full documentation:
- **TROUBLESHOOTING.md** - Error solutions
- **README.md** - Complete guide
- **CONTEXT.md** - Technical background

---

## 📁 **WHAT'S IN THIS PACKAGE**

If you want more details, read these files in order:

1. **INDEX.md** - This package overview (start here for full workflow)
2. **README.md** - Complete task guide
3. **CREDENTIALS.md** - All login credentials
4. **FIX_COMMANDS.sh** - Detailed command reference
5. **VERIFICATION.md** - Full testing procedures
6. **TROUBLESHOOTING.md** - Problem resolution
7. **CONTEXT.md** - Why this happened
8. **NETWORK_TOPOLOGY.md** - Network architecture

---

## 🎯 **THAT'S IT!**

Most of the time, the 3 commands above are all you need. If they work, you're done in 5 minutes!

**Last Updated**: January 2025  
**Package**: EMR Database Connection Fix  
**Status**: ✅ Ready to Execute
