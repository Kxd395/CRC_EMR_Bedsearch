# 🚀 Quick Start Guide - CRC SSOT EMR Development Environment

## ⚡ One-Command Startup

```bash
cd /Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22
./start-all.sh
```

This single command will:
- ✅ Install all dependencies (if needed)
- ✅ Start API server on port 3001 (connects to database at 100.112.67.23)
- ✅ Start UI server on port 5173/5174 (Vite development server)
- ✅ Display server status and health checks
- ✅ Show live logs from both servers
- ✅ Connect to your production database with **all your patients**

## 📊 What You'll See

After running the startup script, you'll see:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ CRC SSOT Development Environment Ready!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Server Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  API Server:    http://localhost:3001
  UI Server:     http://localhost:5173 (or 5174)
  Database:      100.112.67.23:5432
  Patients:      XX loaded
```

## 🌐 Access the Application

**Open your browser to:** http://localhost:5173 (or the port shown in the startup output)

> **Note:** If you see port 5173 not working, try port 5174. The startup script will tell you which port Vite is using.

## 🧪 Test Database Persistence

1. **Open browser console** (F12 or Cmd+Option+I)
2. Look for: `✅ Loaded XX patients from database`
3. Select a patient with **●** prefix (these are database patients)
4. Add a facility search via Quick Update
5. Watch console for: `✅ Facility search saved to database`
6. **Refresh the page** (Cmd+R or Ctrl+R)
7. Search should still be there! ✅

## 🔍 Test Database Connection

Before starting the full environment, you can test your database connection:

```bash
./test-database-connection.sh
```

This will:
- Test network connectivity to 100.112.67.23:5432
- Test PostgreSQL connection (if psql installed)
- Start API server and check patient count

## 📝 Useful Commands

### View Live Logs

```bash
# API server logs
tail -f /Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/logs/api-server.log

# UI server logs
tail -f /Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/logs/ui-server.log
```

### Test API Endpoints

```bash
# Health check
curl http://localhost:3001/health | jq

# List all patients
curl http://localhost:3001/api/patients | jq

# Get specific patient
curl http://localhost:3001/api/patients/pt_501 | jq
```

### Stop Servers

**Press Ctrl+C in the terminal running start-all.sh**

The script will gracefully shut down both servers and clean up.

## 🛠️ Manual Startup (Alternative)

If you prefer to start servers separately:

### Start API Server (Terminal 1)

```bash
cd /Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/production/api
npm install  # First time only
node server.js
```

### Start UI Server (Terminal 2)

```bash
cd /Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/development/prototypes/ui_prototype
npm install  # First time only
npm run dev
```

## 🔧 Troubleshooting

### Port Already in Use

If you see "port already in use" errors:

```bash
# Kill process on port 3001 (API)
lsof -ti:3001 | xargs kill -9

# Kill process on port 5173 (UI)
lsof -ti:5173 | xargs kill -9

# Kill process on port 5174 (UI alternative)
lsof -ti:5174 | xargs kill -9
```

Then restart using `./start-all.sh`

### Database Connection Issues

Check these:

1. **Network connectivity:**
   ```bash
   nc -z -w5 100.112.67.23 5432
   ```
   Should show success (exit code 0)

2. **Database credentials in `.env` file:**
   ```bash
   cat /Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/production/api/.env
   ```
   Should show:
   - DB_HOST=100.112.67.23
   - DB_PORT=5432
   - DB_NAME=emr_crc_ssot
   - DB_USER=emr_admin

3. **Run connection test:**
   ```bash
   ./test-database-connection.sh
   ```

### Browser Shows "Unable to Connect"

1. **Check which port Vite is using:**
   ```bash
   lsof -i :5173
   lsof -i :5174
   ```

2. **Try both URLs:**
   - http://localhost:5173
   - http://localhost:5174
   - http://127.0.0.1:5173
   - http://127.0.0.1:5174

3. **Check UI server logs:**
   ```bash
   tail -f /Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/logs/ui-server.log
   ```

4. **Hard refresh browser:**
   - Mac: Cmd+Shift+R
   - Windows/Linux: Ctrl+Shift+R

### CORS Errors in Browser Console

If you see CORS errors:

1. **Verify API server is running:**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Check API server logs:**
   ```bash
   tail -f /Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/logs/api-server.log
   ```

3. **Restart both servers:**
   ```bash
   # Stop: Press Ctrl+C
   # Start: ./start-all.sh
   ```

## 📁 Important Files

| File | Purpose |
|------|---------|
| `start-all.sh` | One-command startup for both servers |
| `test-database-connection.sh` | Test database connectivity |
| `production/api/server.js` | Database API server |
| `production/api/.env` | Database credentials |
| `development/prototypes/ui_prototype/src/app.js` | Main application logic |
| `logs/api-server.log` | API server logs |
| `logs/ui-server.log` | UI server logs |

## 🎯 Database Configuration

The application connects to:

- **Host:** 100.112.67.23
- **Port:** 5432
- **Database:** emr_crc_ssot
- **User:** emr_admin
- **Patient Count:** All patients from your database

## ✅ Success Checklist

Before reporting issues, verify:

- [ ] Ran `./start-all.sh` from correct directory
- [ ] Both servers show "running" status
- [ ] API health check responds: `curl http://localhost:3001/health`
- [ ] Browser can access UI (try both port 5173 and 5174)
- [ ] Browser console shows: "✅ Loaded XX patients from database"
- [ ] No CORS errors in browser console

## 🆘 Getting Help

If you're still having issues:

1. **Check API logs:**
   ```bash
   tail -50 /Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/logs/api-server.log
   ```

2. **Check UI logs:**
   ```bash
   tail -50 /Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/logs/ui-server.log
   ```

3. **Test database connection:**
   ```bash
   ./test-database-connection.sh
   ```

4. **Provide these details:**
   - Error messages from logs
   - Browser console errors
   - Result of health check: `curl http://localhost:3001/health`
   - Result of connection test

## 🚀 Next Steps

Once servers are running:

1. ✅ Test database persistence (add facility search → refresh → verify it persists)
2. ✅ Check Patient Progress Dashboard (5th tab in navigation)
3. ✅ Verify all patients from database are loaded
4. ✅ Test CRUD operations on patient data

---

**Last Updated:** September 29, 2025
**Database:** 100.112.67.23:5432 (emr_crc_ssot)
**Support:** Check logs in `/Users/VScode_Projects/EMR/CRC_SSOT_PRD_Package_2025-09-22/logs/`
