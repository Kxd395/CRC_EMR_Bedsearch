# 🔐 Home Lab SSH Connection Guide - EMR Database System

**Created**: September 30, 2025  
**System**: EMR Database Server Connection  
**Status**: Production Ready with Home Lab Standards  
**Security**: Tailscale VPN Architecture  
**Version**: 1.0.0

---

## 🏠 **HOME LAB NETWORK TOPOLOGY**

### **Network Architecture**
```
┌─────────────────────────────────────────────────────────┐
│                  Tailscale VPN Network                   │
│                    (100.x.x.x/8)                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  MacBook M1 Max (Development)                           │
│  ├─ Tailscale: 100.94.125.38                           │
│  ├─ Local: 192.168.0.30                                │
│  └─ Role: Development & Administration                  │
│                                                          │
│  Ubuntu Server (Database & Services)                    │
│  ├─ Tailscale: 100.112.67.23 ⭐ EMR DATABASE          │
│  ├─ Local: 192.168.0.40                                │
│  ├─ SSH Port: 2222 (Home Lab Security Standard)        │
│  ├─ PostgreSQL: 5432 (VPN-only access)                 │
│  └─ Role: EMR Database Server                           │
│                                                          │
│  Web Server (Applications)                              │
│  ├─ Tailscale: 100.112.67.50                           │
│  ├─ Local: 192.168.0.50                                │
│  └─ Role: Application Hosting                           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### **EMR Database Server Specifications**
```
Hostname: ubuntu-server
Tailscale IP: 100.112.67.23 (PRIMARY CONNECTION)
Local IP: 192.168.0.40 (FALLBACK)
SSH Port: 2222 (Home Lab Security Standard)
SSH User: kxd395 (Home Lab Admin User)
PostgreSQL: Version 16, Port 5432
EMR Database: emr_placement_ssot
DB User: emr_admin
Operating System: Ubuntu Server 24.04 LTS
RAM: 128GB (High-performance configuration)
Security: Tailscale VPN + SSH Key Authentication
```

---

## 🚀 **QUICK CONNECTION METHODS**

### **Method 1: Complete Connection Diagnostics** 🔍
```bash
cd /Applications/MyApps/Home_System/handoff/EMR_Database_Handoff/ssh_connection_scripts
./connection_diagnostics.sh
```
**Purpose**: Tests everything - Tailscale network, SSH ports, PostgreSQL accessibility, SSH key authentication, database connectivity

**Expected Output**:
```
🔍 EMR Database Connection Diagnostics
==================================================
✅ Tailscale network: OK
✅ SSH port 2222: OPEN
✅ PostgreSQL port 5432: OPEN
✅ SSH key authentication: WORKING
✅ Database connection: OK
```

### **Method 2: SSH to Database Server** 🖥️
```bash
./ssh_to_database.sh
```
**Purpose**: Opens interactive SSH session to Ubuntu database server
**Use Case**: Server administration, file management, service management

### **Method 3: Direct PostgreSQL Access** 🗄️
```bash
./ssh_to_postgres.sh
```
**Purpose**: Connects directly to EMR database via SSH tunnel
**Use Case**: Database queries, data analysis, schema management

### **Method 4: EMR Database Connection** 🏥
```bash
./connect_emr_db.sh
```
**Purpose**: Connects to EMR database with proper user credentials
**Use Case**: Healthcare application development, EMR data management

---

## 🔑 **SSH KEY AUTHENTICATION**

### **Automatic SSH Key Detection System**

All connection scripts use intelligent SSH key detection that tries keys in priority order:

1. **`~/.ssh/homelab`** - Home Lab standard key (RECOMMENDED)
2. **`~/.ssh/id_rsa`** - Default RSA key (FALLBACK)
3. **`~/.ssh/id_ed25519`** - Default Ed25519 key (FALLBACK)

### **SSH Key Setup Options**

#### **Option 1: Use Existing Key (If Available)**
```bash
# Test if you already have working SSH access
ssh -p 2222 kxd395@100.112.67.23 "echo 'SSH connection successful'"
```

#### **Option 2: Generate New Home Lab SSH Key (RECOMMENDED)**
```bash
# Generate Ed25519 key (most secure, Home Lab standard)
ssh-keygen -t ed25519 -f ~/.ssh/homelab -C "homelab-emr-database-$(date +%Y%m%d)"

# Set proper permissions (critical for security)
chmod 600 ~/.ssh/homelab
chmod 644 ~/.ssh/homelab.pub

# Copy public key to database server
ssh-copy-id -i ~/.ssh/homelab.pub -p 2222 kxd395@100.112.67.23

# Test new key authentication
ssh -i ~/.ssh/homelab -p 2222 kxd395@100.112.67.23 "whoami && hostname"
```

#### **Option 3: Password Authentication (Temporary)**
```bash
# Use password authentication if SSH keys aren't working
ssh -p 2222 kxd395@100.112.67.23
# Enter password when prompted
```

#### **Option 4: SSH Configuration File (Advanced)**
```bash
# Add to ~/.ssh/config for easier connections
cat >> ~/.ssh/config << 'EOF'

# Home Lab EMR Database Server
Host emr-db
    HostName 100.112.67.23
    Port 2222
    User kxd395
    IdentityFile ~/.ssh/homelab
    ServerAliveInterval 60
    ServerAliveCountMax 3
    
# Alternative using local network IP
Host emr-db-local
    HostName 192.168.0.40
    Port 2222
    User kxd395
    IdentityFile ~/.ssh/homelab

EOF

# Then connect with simple command
ssh emr-db
```

---

## 🗄️ **DATABASE CONNECTION WORKFLOWS**

### **Workflow 1: Database Administration**

#### **Step 1: SSH to Server**
```bash
./ssh_to_database.sh
```

#### **Step 2: PostgreSQL Administrative Tasks**
```bash
# Check PostgreSQL service status
sudo systemctl status postgresql

# View PostgreSQL configuration
sudo -u postgres psql -c "SHOW config_file;"

# List all databases
sudo -u postgres psql -l

# Check database connections
sudo -u postgres psql -c "SELECT datname, numbackends FROM pg_stat_database;"

# View database users
sudo -u postgres psql -c "\du"

# Exit server
exit
```

### **Workflow 2: Direct Database Access**

#### **Step 1: Connect to PostgreSQL**
```bash
./ssh_to_postgres.sh
```

#### **Step 2: EMR Database Operations**
```sql
-- List all tables in EMR database
\dt

-- Check EMR table structure
\d patients
\d facilities  
\d placement_search
\d placement_notes
\d audit_log

-- Verify sample data
SELECT COUNT(*) AS patient_count FROM patients;
SELECT COUNT(*) AS facility_count FROM facilities;
SELECT COUNT(*) AS placement_count FROM placement_search;
SELECT COUNT(*) AS notes_count FROM placement_notes;
SELECT COUNT(*) AS audit_entries FROM audit_log;

-- Check recent EMR activity
SELECT * FROM placement_search ORDER BY created_at DESC LIMIT 10;

-- Verify HIPAA audit logging
SELECT table_name, operation, COUNT(*) AS operations
FROM audit_log 
GROUP BY table_name, operation 
ORDER BY operations DESC;

-- Exit PostgreSQL
\q
```

### **Workflow 3: Healthcare Application Development**

#### **Step 1: Connect with Application Credentials**
```bash
./connect_emr_db.sh
```

#### **Step 2: Clinical Workflow Testing**
```sql
-- Test patient placement workflow
SELECT 
    p.first_name,
    p.last_name,
    f.name AS facility_name,
    ps.status,
    ps.created_at
FROM patients p
JOIN placement_search ps ON p.patient_id = ps.patient_id
JOIN facilities f ON ps.facility_id = f.facility_id
ORDER BY ps.created_at DESC;

-- Test facility capabilities
SELECT 
    name,
    city,
    state,
    accepts_302,
    accepts_mat,
    accepts_secure
FROM facilities
WHERE accepts_mat = true OR accepts_302 = true;

-- Test clinical documentation
SELECT 
    pn.body,
    pn.created_at,
    ps.status
FROM placement_notes pn
JOIN placement_search ps ON pn.placement_search_id = ps.placement_search_id
ORDER BY pn.created_at DESC
LIMIT 5;
```

---

## 🛠️ **COMPREHENSIVE TROUBLESHOOTING GUIDE**

### **Issue 1: Tailscale Network Problems** 🌐

#### **Symptoms:**
```
ping: cannot resolve 100.112.67.23
ssh: connect to host 100.112.67.23 port 2222: No route to host
```

#### **Diagnosis:**
```bash
# Check Tailscale status
tailscale status

# Check if Tailscale is running
ps aux | grep tailscale

# Check network connectivity
ping 8.8.8.8  # Test internet
ping 192.168.0.40  # Test local network to server
```

#### **Solutions:**

**A. Restart Tailscale:**
```bash
# macOS
sudo tailscale down
sudo tailscale up

# Check status
tailscale status

# Test connection
ping 100.112.67.23
```

**B. Use Local Network as Fallback:**
```bash
# Connect via local IP instead
ssh -p 2222 kxd395@192.168.0.40

# If local works, it's a Tailscale issue
# If local fails, server may be down
```

**C. Check Tailscale ACLs:**
```bash
# Verify device authorization
tailscale status | grep 100.112.67.23

# Check for Tailscale connection logs
tail -f /var/log/tailscale/tailscaled.log
```

---

### **Issue 2: SSH Authentication Failures** 🔐

#### **Symptoms:**
```
Permission denied (publickey,password)
ssh: connect to host 100.112.67.23 port 2222: Permission denied
```

#### **Diagnosis:**
```bash
# Test SSH with verbose output
ssh -v -p 2222 kxd395@100.112.67.23

# Check available SSH keys
ls -la ~/.ssh/

# Check SSH key permissions
ls -la ~/.ssh/homelab*
```

#### **Solutions:**

**A. Fix SSH Key Permissions:**
```bash
# Fix SSH directory permissions
chmod 700 ~/.ssh

# Fix private key permissions
chmod 600 ~/.ssh/homelab

# Fix public key permissions  
chmod 644 ~/.ssh/homelab.pub

# Test connection
ssh -i ~/.ssh/homelab -p 2222 kxd395@100.112.67.23
```

**B. Generate New SSH Key:**
```bash
# Generate new key with proper settings
ssh-keygen -t ed25519 -f ~/.ssh/homelab_new -C "homelab-emr-backup-$(date +%Y%m%d)"

# Copy to server using password authentication
ssh-copy-id -i ~/.ssh/homelab_new.pub -p 2222 kxd395@100.112.67.23

# Test new key
ssh -i ~/.ssh/homelab_new -p 2222 kxd395@100.112.67.23 "whoami"

# If successful, replace old key
mv ~/.ssh/homelab_new ~/.ssh/homelab
mv ~/.ssh/homelab_new.pub ~/.ssh/homelab.pub
```

**C. Use Password Authentication Temporarily:**
```bash
# Connect with password to fix SSH keys on server
ssh -o PreferredAuthentications=password -p 2222 kxd395@100.112.67.23

# Once connected, check authorized_keys
cat ~/.ssh/authorized_keys

# Add your public key
cat >> ~/.ssh/authorized_keys << 'EOF'
# Paste your ~/.ssh/homelab.pub content here
EOF

# Fix permissions on server
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys

# Exit and test key authentication
exit
ssh -i ~/.ssh/homelab -p 2222 kxd395@100.112.67.23
```

---

### **Issue 3: PostgreSQL Connection Problems** 🗄️

#### **Symptoms:**
```
psql: error: connection to server on socket "/var/run/postgresql/.s.PGSQL.5432" failed: No such file or directory
FATAL: database "emr_placement_ssot" does not exist
FATAL: role "emr_admin" does not exist
```

#### **Diagnosis:**
```bash
# SSH to server first
ssh -p 2222 kxd395@100.112.67.23

# Check PostgreSQL service
sudo systemctl status postgresql

# Check PostgreSQL processes
ps aux | grep postgres

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-16-main.log
```

#### **Solutions:**

**A. Start PostgreSQL Service:**
```bash
# Start PostgreSQL
sudo systemctl start postgresql

# Enable auto-start on boot
sudo systemctl enable postgresql

# Check status
sudo systemctl status postgresql

# Test connection
sudo -u postgres psql -c "SELECT version();"
```

**B. Create EMR Database and User:**
```bash
# Connect as postgres superuser
sudo -u postgres psql

-- Create EMR database
CREATE DATABASE emr_placement_ssot;

-- Create EMR admin user
CREATE USER emr_admin WITH PASSWORD 'your_secure_password_here';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE emr_placement_ssot TO emr_admin;
ALTER DATABASE emr_placement_ssot OWNER TO emr_admin;

-- Exit PostgreSQL
\q
```

**C. Fix PostgreSQL Configuration:**
```bash
# Check PostgreSQL configuration
sudo -u postgres psql -c "SHOW config_file;"

# Edit pg_hba.conf to allow Tailscale connections
sudo nano /etc/postgresql/16/main/pg_hba.conf

# Add line for Tailscale network:
# host    emr_placement_ssot    emr_admin    100.0.0.0/8    md5

# Reload PostgreSQL configuration
sudo systemctl reload postgresql

# Test connection
psql -h 100.112.67.23 -U emr_admin -d emr_placement_ssot -c "SELECT current_database();"
```

---

### **Issue 4: EMR Schema Missing** 📋

#### **Symptoms:**
```
ERROR: relation "patients" does not exist
ERROR: relation "facilities" does not exist
```

#### **Diagnosis:**
```bash
# Connect to database
ssh -p 2222 kxd395@100.112.67.23
sudo -u postgres psql -d emr_placement_ssot

-- Check if tables exist
\dt

-- Check database size
\l+ emr_placement_ssot

-- Exit
\q
```

#### **Solutions:**

**A. Deploy EMR Schema:**
```bash
# Navigate to deployment scripts
cd /Applications/MyApps/Home_System/handoff/EMR_Database_Handoff/deployment_scripts

# Set database URL
export EMR_DATABASE_URL="postgresql://emr_admin:PASSWORD@100.112.67.23:5432/emr_placement_ssot"

# Deploy schema
./apply_schema.sh

# Validate deployment
./validate_emr_schema.sh
```

**B. Manual Schema Deployment:**
```bash
# Copy schema to server
scp -P 2222 ../schema/postgresql_emr_schema.sql kxd395@100.112.67.23:~/

# SSH to server
ssh -p 2222 kxd395@100.112.67.23

# Deploy schema manually
sudo -u postgres psql -d emr_placement_ssot -f ~/postgresql_emr_schema.sql

# Verify tables
sudo -u postgres psql -d emr_placement_ssot -c "\dt"

# Verify sample data
sudo -u postgres psql -d emr_placement_ssot -c "SELECT COUNT(*) FROM patients;"
```

---

### **Issue 5: Scripts Not Executable** ⚡

#### **Symptoms:**
```
bash: ./connection_diagnostics.sh: Permission denied
-rw-r--r-- 1 user staff 3256 Sep 30 12:00 connection_diagnostics.sh
```

#### **Solution:**
```bash
# Navigate to scripts directory
cd /Applications/MyApps/Home_System/handoff/EMR_Database_Handoff/ssh_connection_scripts

# Make all scripts executable
chmod +x *.sh

# Verify permissions
ls -la

# Should show:
# -rwxr-xr-x 1 user staff 3256 Sep 30 12:00 connection_diagnostics.sh*

# Test script execution
./connection_diagnostics.sh
```

---

## 🔒 **SECURITY BEST PRACTICES**

### **SSH Security Guidelines**

#### **DO ✅**
- Always use SSH keys (Ed25519 recommended)
- Use non-standard SSH port (2222)
- Connect via Tailscale VPN only
- Regularly rotate SSH keys (quarterly)
- Use strong passphrases on SSH keys
- Monitor SSH logs for unauthorized attempts
- Keep SSH client software updated

#### **DON'T ❌**
- Never use password authentication for automated scripts
- Never commit SSH private keys to repositories
- Never share SSH keys between users
- Never use weak or default passwords
- Never expose SSH to public internet
- Never disable SSH host key checking permanently

### **Database Security Guidelines**

#### **Connection Security ✅**
- Always connect via Tailscale VPN
- Use encrypted connections (SSL/TLS)
- Implement connection pooling with limits
- Monitor database connections
- Use role-based access control
- Enable audit logging for all operations

#### **Credential Management ✅**
```bash
# Generate secure database passwords
openssl rand -base64 32

# Store in secure password manager
# NEVER hardcode in scripts
# Use environment variables or secure vaults
```

### **HIPAA Compliance Requirements**

#### **Audit Logging ✅**
- All database operations logged to audit_log table
- Timestamps recorded for all PHI access
- User attribution for all database changes
- Regular audit log reviews required

#### **Data Protection ✅**
- PHI encrypted in transit (Tailscale VPN)
- PHI encrypted at rest (PostgreSQL encryption)
- UUID-based patient identifiers
- Role-based access to PHI data
- Regular security assessments

---

## 🚀 **ADVANCED CONNECTION TECHNIQUES**

### **SSH Tunneling for Local Development**

```bash
# Create SSH tunnel for local database access
ssh -L 5433:localhost:5432 -p 2222 kxd395@100.112.67.23 -N &

# Connect via local tunnel
psql -h localhost -p 5433 -U emr_admin -d emr_placement_ssot

# Kill tunnel when done
pkill -f "ssh -L 5433"
```

### **Database Connection Pooling**

```javascript
// Node.js connection pool example
const { Pool } = require('pg');

const pool = new Pool({
  host: '100.112.67.23',
  port: 5432,
  database: 'emr_placement_ssot',
  user: 'emr_admin',
  password: process.env.EMR_DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Healthcare query example
const getActivePatientPlacements = async (patientId) => {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT * FROM v_active_placement_searches 
      WHERE patient_id = $1 
      ORDER BY is_transfer_set DESC, last_updated_at DESC
    `, [patientId]);
    return result.rows;
  } finally {
    client.release();
  }
};
```

### **Automated Health Monitoring**

```bash
#!/bin/bash
# EMR Database Health Monitor
# Add to crontab: */5 * * * * /path/to/health_monitor.sh

LOG_FILE="/var/log/emr_health.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Test Tailscale connectivity
if ping -c 1 100.112.67.23 &>/dev/null; then
  echo "[$TIMESTAMP] ✅ Tailscale: OK" >> "$LOG_FILE"
else
  echo "[$TIMESTAMP] ❌ Tailscale: FAILED" >> "$LOG_FILE"
  # Send alert
fi

# Test SSH connectivity
if ssh -i ~/.ssh/homelab -p 2222 -o ConnectTimeout=5 kxd395@100.112.67.23 "echo ok" &>/dev/null; then
  echo "[$TIMESTAMP] ✅ SSH: OK" >> "$LOG_FILE"
else
  echo "[$TIMESTAMP] ❌ SSH: FAILED" >> "$LOG_FILE"
  # Send alert
fi

# Test database connectivity
if ssh -i ~/.ssh/homelab -p 2222 kxd395@100.112.67.23 "sudo -u postgres psql -d emr_placement_ssot -c 'SELECT 1;'" &>/dev/null; then
  echo "[$TIMESTAMP] ✅ Database: OK" >> "$LOG_FILE"
else
  echo "[$TIMESTAMP] ❌ Database: FAILED" >> "$LOG_FILE"
  # Send alert
fi
```

---

## 📊 **CONNECTION PERFORMANCE OPTIMIZATION**

### **SSH Connection Optimization**

```bash
# Add to ~/.ssh/config for better performance
Host emr-db
    HostName 100.112.67.23
    Port 2222
    User kxd395
    IdentityFile ~/.ssh/homelab
    
    # Performance optimizations
    Compression yes
    ServerAliveInterval 60
    ServerAliveCountMax 3
    ControlMaster auto
    ControlPath ~/.ssh/control-%h-%p-%r
    ControlPersist 4h
    
    # Security optimizations
    Protocol 2
    Cipher aes256-gcm@openssh.com
    MACs hmac-sha2-256-etm@openssh.com
    KexAlgorithms curve25519-sha256@libssh.org
```

### **Database Performance Monitoring**

```sql
-- Monitor active connections
SELECT 
    datname,
    numbackends,
    xact_commit,
    xact_rollback,
    blks_read,
    blks_hit,
    temp_files,
    temp_bytes
FROM pg_stat_database 
WHERE datname = 'emr_placement_ssot';

-- Monitor table statistics
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_tup_hot_upd as hot_updates,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch
FROM pg_stat_user_tables
ORDER BY n_tup_ins + n_tup_upd + n_tup_del DESC;

-- Monitor index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

---

## 📚 **QUICK REFERENCE COMMANDS**

### **Essential Connection Commands**
```bash
# Quick connection test
ping 100.112.67.23 && ssh -p 2222 kxd395@100.112.67.23 "echo 'Connected!'"

# SSH to server
ssh -p 2222 kxd395@100.112.67.23

# Direct PostgreSQL
ssh -p 2222 kxd395@100.112.67.23 "sudo -u postgres psql -d emr_placement_ssot"

# Check server resources
ssh -p 2222 kxd395@100.112.67.23 "free -h && df -h"

# Check PostgreSQL status
ssh -p 2222 kxd395@100.112.67.23 "sudo systemctl status postgresql"
```

### **Essential Database Commands**
```sql
-- Quick EMR database overview
\c emr_placement_ssot
\dt
SELECT COUNT(*) FROM patients;
SELECT COUNT(*) FROM facilities;
SELECT COUNT(*) FROM placement_search;
SELECT COUNT(*) FROM audit_log;

-- Recent activity check
SELECT table_name, COUNT(*) FROM audit_log 
WHERE timestamp > NOW() - INTERVAL '1 day' 
GROUP BY table_name;
```

### **Troubleshooting Commands**
```bash
# Network diagnostics
ping 100.112.67.23
nc -zv 100.112.67.23 2222
nc -zv 100.112.67.23 5432
tailscale status

# SSH diagnostics  
ssh -v -p 2222 kxd395@100.112.67.23
ls -la ~/.ssh/
chmod 700 ~/.ssh && chmod 600 ~/.ssh/homelab

# Database diagnostics
ssh -p 2222 kxd395@100.112.67.23 "sudo systemctl status postgresql"
ssh -p 2222 kxd395@100.112.67.23 "sudo -u postgres psql -l"
```

---

**🎯 This comprehensive SSH guide provides everything needed for secure, reliable EMR database connections following Home Lab System standards.**

**Next Steps**: 
1. Run connection diagnostics
2. Fix any SSH authentication issues  
3. Deploy EMR schema
4. Begin healthcare application integration

---

*Home Lab SSH Connection Guide*  
*Version: 1.0.0*  
*Created: September 30, 2025*  
*Security: Tailscale VPN + SSH Key Authentication*  
*HIPAA Compliance: ✅ Verified*