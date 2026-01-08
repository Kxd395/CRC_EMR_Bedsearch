# 🌐 EMR Database Network Topology

**Created**: January 2025  
**Purpose**: Visual network architecture reference  
**Scope**: Tailscale VPN home lab configuration

---

## 🏗️ **COMPLETE NETWORK ARCHITECTURE**

```
                         ┌─────────────────────────────────────┐
                         │      Tailscale VPN Cloud            │
                         │    (100.64.0.0/10 network)          │
                         │  - End-to-end encryption            │
                         │  - Zero-trust architecture          │
                         └─────────────────────────────────────┘
                                        ↓
                    ┌───────────────────┴────────────────────┐
                    ↓                                        ↓
        ┌───────────────────────┐              ┌────────────────────────┐
        │   Mac Client          │              │   Linux Server         │
        │   (Development)       │              │   (Database)           │
        ├───────────────────────┤              ├────────────────────────┤
        │ Tailscale IP:         │              │ Tailscale IP:          │
        │   100.94.125.38       │◄────VPN─────►│   100.112.67.23       │
        │                       │              │                        │
        │ Local IP:             │              │ Local IP:              │
        │   192.168.x.x         │              │   192.168.x.x          │
        ├───────────────────────┤              ├────────────────────────┤
        │ Services:             │              │ Services:              │
        │ • API Server :3001    │──queries───►│ • PostgreSQL :5432    │
        │ • UI Server  :5174    │              │   Database:            │
        │ • Development env     │              │   emr_crc_ssot         │
        │                       │              │                        │
        │ Status:               │              │ Status:                │
        │ ✅ Running            │              │ ✅ Running             │
        │ ❌ Can't connect DB   │              │ ❌ Blocking Mac IP     │
        └───────────────────────┘              └────────────────────────┘
                    ↑                                        ↑
                    │                                        │
                    └────────── ISSUE: pg_hba.conf ─────────┘
                               missing whitelist entry
```

---

## 📍 **DEVICE INVENTORY**

### **Mac Client (Development Machine)**

| Attribute | Value |
|-----------|-------|
| **Device Type** | MacBook (Development) |
| **Tailscale IP** | 100.94.125.38 |
| **Local Network IP** | 192.168.x.x (varies) |
| **Role** | Application host, development environment |
| **Services Running** | API Server (port 3001), UI Server (port 5174) |
| **SSH User** | kevindialmb (for SSH to Linux server) |
| **Status** | ✅ Operational, ❌ Database connection blocked |

### **Linux Server (Database Host)**

| Attribute | Value |
|-----------|-------|
| **Device Type** | Linux Server (Ubuntu/Debian) |
| **Tailscale IP** | 100.112.67.23 |
| **Local Network IP** | 192.168.x.x (varies) |
| **SSH Port** | 22 (default) |
| **SSH User** | kevindialmb |
| **Role** | PostgreSQL database server |
| **Services Running** | PostgreSQL 16 (port 5432) |
| **Database** | emr_crc_ssot |
| **Database User** | emr_admin |
| **Status** | ✅ Operational, ❌ Blocking Mac client access |

---

## 🔌 **PORT MAPPING**

### **Mac Client Ports (localhost)**

| Port | Service | Access |
|------|---------|--------|
| 3001 | API Server | HTTP (local only) |
| 5174 | UI Server (Vite) | HTTP (local only) |

### **Linux Server Ports**

| Port | Service | Access | Status |
|------|---------|--------|--------|
| 22 | SSH | Tailscale VPN | ✅ Open |
| 5432 | PostgreSQL | Tailscale VPN | ✅ Open, ❌ Blocked by pg_hba.conf |

---

## 🛣️ **DATA FLOW DIAGRAMS**

### **Current State (Broken)**

```
User Browser
    ↓ HTTP
UI Server (localhost:5174)
    ↓ HTTP GET /api/patients
API Server (localhost:3001)
    ↓ SQL query via pg library
PersistenceManager
    ↓ TCP/IP over Tailscale VPN
    ↓ Destination: 100.112.67.23:5432
    ↓
PostgreSQL Server
    ↓ Checks pg_hba.conf
    ↓ Source IP: 100.94.125.38
    ↓ Database: emr_crc_ssot
    ↓ User: emr_admin
    ↓
❌ NO MATCHING ENTRY FOUND
    ↓
FATAL: no pg_hba.conf entry
    ↓
Connection rejected
    ↓
API Server
    ↓ Catches error
    ↓
PersistenceManager
    ↓ Activates fallback
    ↓
Local File Storage (data/fallback/*.json)
    ↓ Returns data
API Server
    ↓ JSON response (from files)
UI Server
    ↓ Displays data (with warning)
User Browser
```

### **Target State (After Fix)**

```
User Browser
    ↓ HTTP
UI Server (localhost:5174)
    ↓ HTTP GET /api/patients
API Server (localhost:3001)
    ↓ SQL query via pg library
PersistenceManager
    ↓ TCP/IP over Tailscale VPN
    ↓ Destination: 100.112.67.23:5432
    ↓
PostgreSQL Server
    ↓ Checks pg_hba.conf
    ↓ Source IP: 100.94.125.38
    ↓ Database: emr_crc_ssot
    ↓ User: emr_admin
    ↓
✅ MATCH FOUND: host emr_crc_ssot emr_admin 100.64.0.0/10
    ↓
Authenticate with scram-sha-256
    ↓ Password: emr_secure_2024
    ↓
✅ Authentication successful
    ↓
Execute SQL query
    ↓ SELECT * FROM patients
    ↓
Return results
    ↓
API Server
    ↓ JSON response (from database)
UI Server
    ↓ Displays data
User Browser
```

---

## 🔐 **SECURITY ZONES**

### **Zone 1: Public Internet**

- **Access**: None
- **Security**: PostgreSQL NOT exposed to internet
- **Firewall**: Blocks all external access

### **Zone 2: Local Network (192.168.x.x)**

- **Access**: Local devices only
- **Security**: PostgreSQL only listens on Tailscale interface
- **Isolation**: Database not accessible from local network

### **Zone 3: Tailscale VPN (100.64.0.0/10)**

- **Access**: Only Tailscale-connected devices
- **Security**: End-to-end encryption, zero-trust
- **Authentication**: Device keys + user credentials
- **Coverage**: Mac client (100.94.125.38) and Linux server (100.112.67.23)

### **Zone 4: PostgreSQL Access Control**

- **Layer 1**: Tailscale VPN (network encryption)
- **Layer 2**: pg_hba.conf (IP whitelisting)
- **Layer 3**: PostgreSQL user authentication (scram-sha-256)
- **Layer 4**: Database permissions (GRANT/REVOKE)

---

## 📊 **TAILSCALE NETWORK DETAILS**

### **Network Range: 100.64.0.0/10**

- **First IP**: 100.64.0.0
- **Last IP**: 100.127.255.255
- **Total IPs**: ~4 million addresses
- **Purpose**: Carrier-Grade NAT (CGNAT) range, used by Tailscale
- **Our Devices**:
  - Mac: 100.94.125.38 (in range)
  - Linux: 100.112.67.23 (in range)

### **Why Whitelist Entire Range?**

Instead of just whitelisting `100.94.125.38`, we whitelist `100.64.0.0/10`:

**Pros:**
- ✅ Works if Mac's IP changes
- ✅ Allows other Tailscale devices (if added later)
- ✅ Easier maintenance (one rule)
- ✅ Follows Tailscale best practices

**Security:**
- ✅ Still requires Tailscale VPN membership (can't just guess an IP)
- ✅ Still requires database password
- ✅ Not open to internet or local network

---

## 🔍 **CONNECTION PATH ANALYSIS**

### **Successful Connection Requirements**

For the Mac client to connect to PostgreSQL:

1. ✅ **Network Connectivity**: Tailscale VPN active both sides
2. ✅ **Port Accessibility**: Port 5432 open on Linux server
3. ❌ **pg_hba.conf Entry**: Whitelist for 100.64.0.0/10 (MISSING - FIX NEEDED)
4. ✅ **Database User Exists**: emr_admin user created
5. ✅ **Correct Password**: emr_secure_2024
6. ✅ **Database Exists**: emr_crc_ssot database created

**Current Status**: 5/6 requirements met, only pg_hba.conf needs fixing

### **Testing Each Layer**

```bash
# Layer 1: Network (Tailscale)
ping 100.112.67.23
# ✅ Expected: Replies received

# Layer 2: Port (PostgreSQL running)
nc -zv 100.112.67.23 5432
# ✅ Expected: Connection succeeded

# Layer 3: pg_hba.conf (Currently broken)
PGPASSWORD='emr_secure_2024' psql -h 100.112.67.23 -p 5432 -U emr_admin -d emr_crc_ssot -c "SELECT 1;"
# ❌ Current: FATAL: no pg_hba.conf entry
# ✅ After fix: Returns 1
```

---

## 🗺️ **ROUTING & DNS**

### **How Packets Travel**

```
Mac (100.94.125.38)
    ↓
Tailscale client (encrypts)
    ↓
Tailscale relay server (if needed)
    ↓
Tailscale client on Linux (decrypts)
    ↓
PostgreSQL (100.112.67.23:5432)
```

### **DNS Resolution**

- **No DNS needed**: Using IP addresses directly
- **Tailscale MagicDNS**: Could use hostname if configured
- **Application**: Hardcoded to 100.112.67.23 (reliable)

---

## 📝 **NETWORK TROUBLESHOOTING QUICK REFERENCE**

### **Check Tailscale Status (Mac)**

```bash
tailscale status
```

Should show:

```
100.94.125.38   macbook-m1        kevindialmb@  macOS   -
100.112.67.23   ubuntu-server     kevindialmb@  linux   -
```

### **Check PostgreSQL Listening (Linux Server)**

```bash
sudo ss -tlnp | grep 5432
```

Should show:

```
LISTEN  0  128  *:5432  *:*  users:(("postgres",pid=12345,fd=6))
```

### **Test Connection Path**

```bash
# 1. Ping test (Layer 3)
ping 100.112.67.23

# 2. Port test (Layer 4)
nc -zv 100.112.67.23 5432

# 3. PostgreSQL test (Layer 7)
PGPASSWORD='emr_secure_2024' psql -h 100.112.67.23 -p 5432 -U emr_admin -d emr_crc_ssot -c "SELECT 1;"
```

---

**Last Updated**: January 2025  
**Network Version**: 1.0  
**Status**: Documented - awaiting pg_hba.conf fix
