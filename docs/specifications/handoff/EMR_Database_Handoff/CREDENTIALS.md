# 🔐 EMR Database Connection - Credentials & Access Information

**⚠️ SENSITIVE INFORMATION - HANDLE SECURELY**  
**Created**: January 2025  
**Purpose**: Database connection fix credentials  
**Security Level**: CONFIDENTIAL

---

## 🖥️ **SSH ACCESS - LINUX SERVER**

### **Connection Details**

```bash
Host: 100.112.67.23
User: kevindialmb
Port: 22 (default)
Network: Tailscale VPN
Authentication: Password (interactive)
```

### **SSH Command**

```bash
ssh kevindialmb@100.112.67.23
# Enter password when prompted
```

### **Server Information**

- **Server Type**: Linux (Ubuntu/Debian)
- **Tailscale IP**: 100.112.67.23
- **Role**: PostgreSQL Database Host
- **Services**: PostgreSQL 16 on port 5432
- **Admin Access**: User has sudo privileges

---

## 🗄️ **POSTGRESQL DATABASE**

### **Connection Parameters**

```bash
Host: 100.112.67.23
Port: 5432
Database: emr_crc_ssot
User: emr_admin
Password: emr_secure_2024
SSL Mode: prefer
```

### **Connection String**

```bash
postgresql://emr_admin:emr_secure_2024@100.112.67.23:5432/emr_crc_ssot
```

### **Environment Variables**

```bash
export DB_HOST="100.112.67.23"
export DB_PORT="5432"
export DB_NAME="emr_crc_ssot"
export DB_USER="emr_admin"
export DB_PASSWORD="emr_secure_2024"
```

### **psql Connection Command**

```bash
PGPASSWORD='emr_secure_2024' psql -h 100.112.67.23 -p 5432 -U emr_admin -d emr_crc_ssot
```

---

## 🌐 **NETWORK INFORMATION**

### **Mac Client (API Server)**

```bash
Tailscale IP: 100.94.125.38
API Server Port: 3001
UI Server Port: 5174
Role: Application host (trying to connect to database)
```

### **Linux Server (PostgreSQL)**

```bash
Tailscale IP: 100.112.67.23
PostgreSQL Port: 5432
Database: emr_crc_ssot
Role: Database server
```

### **Tailscale Network**

```bash
Network Range: 100.64.0.0/10
Purpose: Secure VPN for home lab
All Devices: Can communicate within this network
```

---

## 🔑 **AUTHENTICATION METHODS**

### **PostgreSQL Authentication**

- **Method**: scram-sha-256 (secure password authentication)
- **Configured in**: pg_hba.conf on Linux server
- **Required Entry**: `host emr_crc_ssot emr_admin 100.64.0.0/10 scram-sha-256`

### **SSH Authentication**

- **Method**: Password-based (interactive)
- **No SSH Key**: Currently not configured for passwordless access
- **User**: kevindialmb
- **Sudo Access**: Yes (required for fixing pg_hba.conf)

---

## 📋 **QUICK REFERENCE COMMANDS**

### **Test Database Connection (from Mac)**

```bash
PGPASSWORD='emr_secure_2024' psql -h 100.112.67.23 -p 5432 -U emr_admin -d emr_crc_ssot -c "SELECT 1;"
```

**Expected Success Output:**

```
 ?column? 
----------
        1
(1 row)
```

### **Test Database Connection (from Linux Server)**

```bash
# After SSH to server
sudo -u postgres psql -d emr_crc_ssot -c "SELECT 1;"
```

### **Check PostgreSQL Status (on Linux Server)**

```bash
sudo systemctl status postgresql
```

### **View pg_hba.conf (on Linux Server)**

```bash
sudo cat /etc/postgresql/*/main/pg_hba.conf
```

### **Restart PostgreSQL (on Linux Server)**

```bash
sudo systemctl restart postgresql
```

---

## 🛡️ **SECURITY CONSIDERATIONS**

### **Credential Protection**

- ✅ **Tailscale VPN**: All traffic encrypted and isolated
- ✅ **scram-sha-256**: PostgreSQL uses secure password hashing
- ✅ **Limited Access**: Database only accessible from Tailscale network
- ⚠️ **No Public Access**: Database NOT exposed to internet

### **Best Practices**

1. **Don't commit credentials to Git** - This file should be in `.gitignore`
2. **Secure transmission** - Share via encrypted channel if sending to another person
3. **Rotate passwords** - Consider changing `emr_secure_2024` to dated password
4. **SSH keys** - Consider setting up passwordless SSH with keys for automation
5. **Backup credentials** - Store securely in password manager

### **After Fix Completion**

- [ ] Consider rotating database password
- [ ] Set up SSH key authentication for automation
- [ ] Document credentials in team password manager
- [ ] Create pg_hba.conf backup to prevent future loss

---

## 📞 **ACCESS VERIFICATION CHECKLIST**

Before starting the fix, verify you can:

- [ ] SSH to Linux server: `ssh kevindialmb@100.112.67.23`
- [ ] Have sudo access on Linux server: `sudo -v`
- [ ] Find PostgreSQL config: `sudo ls /etc/postgresql/*/main/pg_hba.conf`
- [ ] Restart PostgreSQL: `sudo systemctl restart postgresql`
- [ ] Know the database password: `emr_secure_2024`

If ANY of these fail, troubleshoot BEFORE attempting the fix.

---

## 🔄 **CREDENTIAL UPDATES**

If credentials change, update these locations:

### **Application Configuration**

```bash
/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/src/api/server.js
```

Lines 13-18 (default values):

```javascript
const persistence = new PersistenceManager({
  DB_HOST: process.env.DB_HOST || '100.112.67.23',
  DB_PORT: process.env.DB_PORT || 5432,
  DB_NAME: process.env.DB_NAME || 'emr_crc_ssot',
  DB_USER: process.env.DB_USER || 'emr_admin',
  DB_PASSWORD: process.env.DB_PASSWORD || 'emr_secure_2024',
  // ...
});
```

### **Environment Files** (if they exist)

- `.env` in project root
- `.env.production` for production config
- `.env.local` for local overrides

### **Documentation**

- This file (`CREDENTIALS.md`)
- Main README.md
- FIX_COMMANDS.sh

---

**Last Updated**: January 2025  
**Credential Set Version**: Current  
**Next Review**: After successful fix completion
