# 🔧 EMR CRC SSOT - Troubleshooting Guide (SSOT)

**Last Updated**: September 29, 2025  
**Support Classification**: Healthcare System Troubleshooting

## 🚨 UPDATE REQUIREMENTS

**MANDATORY**: Update this file whenever:

- ✅ New issues identified and resolved
- ✅ Solution procedures change
- ✅ Diagnostic tools updated
- ✅ Error codes added/modified
- ✅ Escalation procedures change
- ✅ System monitoring updates

## 🚑 Emergency Procedures

### Critical System Issues (P0)

**Symptoms**: System completely down, PHI inaccessible, data breach suspected

**Immediate Actions**:

1. **Check system status**: `curl https://your-api.com/api/health`
2. **Review error logs**: `tail -f /var/log/emr-api.log`
3. **Verify database**: `psql -h 100.112.67.23 -U emr_admin -d emr_crc_ssot -c "SELECT 1;"`
4. **Contact emergency support**: Use emergency contact list
5. **Document incident**: Create incident ticket immediately

### High Priority Issues (P1)

**Symptoms**: Performance degraded, some features unavailable, authentication issues

**Immediate Actions**:

1. **Check health endpoints**: All API health checks
2. **Monitor system resources**: CPU, memory, disk usage
3. **Review recent deployments**: Check for recent changes
4. **Scale resources**: If cloud-hosted, increase capacity
5. **Notify stakeholders**: Alert management within 1 hour

## 🔍 Diagnostic Tools & Commands

### System Health Checks

```bash
# Complete system health check script
#!/bin/bash
# health-check.sh

echo "🏥 EMR CRC SSOT Health Check"
echo "================================"

# API Server Health
echo "🔍 Checking API Server..."
API_HEALTH=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:3001/api/health)
if [ "$API_HEALTH" = "200" ]; then
    echo "✅ API Server: Healthy"
else
    echo "❌ API Server: Unhealthy (HTTP $API_HEALTH)"
fi

# Database Connection
echo "🔍 Checking Database Connection..."
DB_CHECK=$(psql -h 100.112.67.23 -U emr_admin -d emr_crc_ssot -t -c "SELECT 'connected';" 2>/dev/null | tr -d ' \n')
if [ "$DB_CHECK" = "connected" ]; then
    echo "✅ Database: Connected"
else
    echo "❌ Database: Connection failed"
fi

# UI Server Health
echo "🔍 Checking UI Server..."
UI_HEALTH=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:5174)
if [ "$UI_HEALTH" = "200" ]; then
    echo "✅ UI Server: Healthy"
else
    echo "❌ UI Server: Unhealthy (HTTP $UI_HEALTH)"
fi

# Check server processes
echo "🔍 Checking Server Processes..."
if pgrep -f "node.*server.js" > /dev/null; then
    echo "✅ API Process: Running"
else
    echo "❌ API Process: Not running"
fi

if pgrep -f "vite" > /dev/null; then
    echo "✅ UI Process: Running"
else
    echo "❌ UI Process: Not running"
fi

# Check disk space
echo "🔍 Checking Disk Space..."
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    echo "✅ Disk Space: $DISK_USAGE% used"
else
    echo "⚠️ Disk Space: $DISK_USAGE% used (WARNING)"
fi

# Check memory usage
echo "🔍 Checking Memory Usage..."
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
if [ "$MEMORY_USAGE" -lt 80 ]; then
    echo "✅ Memory Usage: $MEMORY_USAGE%"
else
    echo "⚠️ Memory Usage: $MEMORY_USAGE% (HIGH)"
fi

echo "================================"
echo "Health check completed: $(date)"
```

### Database Diagnostic Queries

```sql
-- Database health diagnostics
-- Check database connections
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    state_change
FROM pg_stat_activity 
WHERE datname = 'emr_crc_ssot';

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check for missing indexes
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats
WHERE schemaname = 'public'
    AND n_distinct > 100
    AND correlation < 0.1;

-- Check slow queries
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements
WHERE mean_time > 1000
ORDER BY mean_time DESC
LIMIT 10;
```

### Log Analysis Commands

```bash
# API server log analysis
tail -f production/api/logs/app.log | grep ERROR

# Search for specific errors
grep -i "database connection" production/api/logs/*.log | tail -20

# Count error types
grep -o "Error: [^"]*" production/api/logs/app.log | sort | uniq -c | sort -nr

# Check for memory leaks
grep -i "memory" production/api/logs/*.log | grep -v "Memory usage: normal"

# Monitor real-time errors
tail -f production/api/logs/app.log | grep --line-buffered ERROR | while read line; do
    echo "$(date): $line"
done
```

## 🐛 Common Issues & Solutions

### Database Connection Issues

**Issue**: "Database connection failed" / "Connection timeout"

**Symptoms**:

- API returns 503 Service Unavailable
- Health check shows database disconnected
- Application logs show connection errors

**Diagnostics**:

```bash
# Test database connectivity
telnet 100.112.67.23 5432

# Check if database is accepting connections
psql -h 100.112.67.23 -U emr_admin -d emr_crc_ssot -c "SELECT version();"

# Verify IP is whitelisted
# Check pg_hba.conf on database server
```

**Solutions**:

1. **IP Whitelist Issue**:
   ```bash
   # Add current IP to database whitelist
   # Contact database administrator to add IP: 70.16.142.31
   ```

2. **Connection Pool Exhausted**:
   ```javascript
   // Check connection pool status
   console.log('Pool status:', pool.totalCount, pool.idleCount, pool.waitingCount);
   
   // Increase pool size
   const pool = new Pool({
     host: process.env.DB_HOST,
     max: 20, // Increase from default 10
     idleTimeoutMillis: 30000,
     connectionTimeoutMillis: 2000
   });
   ```

3. **Database Server Down**:
   ```bash
   # Check database server status
   sudo systemctl status postgresql
   
   # Restart if needed (contact DBA)
   sudo systemctl restart postgresql
   ```

**Prevention**:

- Monitor connection pool metrics
- Implement connection retry logic
- Set up database server monitoring
- Maintain IP whitelist documentation

### Search Persistence Failures

**Issue**: "Active Placement Searches is not persistent" / "Will not save any of my additions"

**Symptoms**:

- Search entries disappear after page refresh
- "Add to search" button appears to work but data doesn't persist
- No error messages displayed to user

**Root Cause**: Missing JSONB columns in database schema

**Diagnostics**:

```sql
-- Check if JSONB columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'active_placements' 
  AND column_name IN ('searches', 'search_history', 'mat_needs');

-- Expected result should show 3 JSONB columns
-- If empty, columns are missing
```

**Solution**:

```sql
-- Add missing JSONB columns
ALTER TABLE active_placements 
ADD COLUMN IF NOT EXISTS searches JSONB DEFAULT '{}';

ALTER TABLE active_placements 
ADD COLUMN IF NOT EXISTS search_history JSONB DEFAULT '[]';

ALTER TABLE active_placements 
ADD COLUMN IF NOT EXISTS mat_needs JSONB DEFAULT '{}';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_active_placements_searches 
ON active_placements USING gin(searches);

CREATE INDEX IF NOT EXISTS idx_active_placements_search_history 
ON active_placements USING gin(search_history);
```

**Prevention**:

- Run database schema validation on startup
- Implement proper database migrations
- Add column existence checks in API endpoints

### "Publish to SSOT" Freezing

**Issue**: Application freezes when clicking "Publish to SSOT" button

**Symptoms**:

- Button becomes unresponsive
- No API requests visible in network tab
- Application requires refresh to restore functionality

**Diagnostics**:

```javascript
// Check for JavaScript errors
console.log('Checking SSOT publish function...');

// Enable detailed logging
localStorage.setItem('debug', 'emr:*');

// Monitor network requests
// Open browser dev tools, check Network tab during publish attempt
```

**Solutions**:

1. **Database Connection Issue**:
   ```javascript
   // API endpoint should handle database failures gracefully
   app.post('/api/ssot/publish', async (req, res) => {
     try {
       const result = await publishToSSOT(req.body);
       res.json(result);
     } catch (error) {
       console.error('SSOT publish error:', error);
       res.status(500).json({
         error: 'SSOT_PUBLISH_FAILED',
         message: 'Failed to publish to SSOT',
         details: error.message
       });
     }
   });
   ```

2. **Frontend Error Handling**:
   ```javascript
   // Add proper error handling in UI
   const publishToSSOT = async (data) => {
     try {
       setLoading(true);
       const response = await fetch('/api/ssot/publish', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(data)
       });
       
       if (!response.ok) {
         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
       }
       
       const result = await response.json();
       return result;
     } catch (error) {
       console.error('Publish failed:', error);
       throw error;
     } finally {
       setLoading(false);
     }
   };
   ```

### Environment Variable Issues

**Issue**: "Missing environment variable" / Configuration errors

**Symptoms**:

- Application fails to start
- Features not working as expected
- Authentication failures

**Diagnostics**:

```bash
# Check environment variables are loaded
node -e "console.log('DB_HOST:', process.env.DB_HOST)"

# Validate configuration
npm run config:validate

# Check .env file exists and has correct permissions
ls -la .env
```

**Solutions**:

1. **Missing .env file**:
   ```bash
   cp .env.example .env
   # Edit .env with correct values
   ```

2. **Incorrect variable names**:
   ```bash
   # Check for typos in variable names
   grep -n "DB_HOST" .env
   ```

3. **File permissions**:
   ```bash
   chmod 600 .env
   ```

### Server Startup Failures

**Issue**: API or UI server won't start

**Symptoms**:

- Process exits immediately
- Port already in use errors
- Permission denied errors

**Diagnostics**:

```bash
# Check what's using the ports
lsof -i :3001  # API port
lsof -i :5174  # UI port

# Check for zombie processes
ps aux | grep node

# Check server logs
tail -f production/api/logs/startup.log
```

**Solutions**:

1. **Port already in use**:
   ```bash
   # Kill processes on ports
   sudo lsof -t -i:3001 | xargs kill -9
   sudo lsof -t -i:5174 | xargs kill -9
   ```

2. **Permission issues**:
   ```bash
   # Check file permissions
   ls -la production/api/
   
   # Fix permissions if needed
   chmod +x start-dev.sh
   ```

3. **Missing dependencies**:
   ```bash
   cd production/api && npm install
   cd development/prototypes/ui_prototype && npm install
   ```

### Memory and Performance Issues

**Issue**: High memory usage / Slow response times

**Symptoms**:

- Application becomes sluggish
- High CPU usage
- Out of memory errors

**Diagnostics**:

```bash
# Monitor system resources
top -p $(pgrep -f "node")

# Check memory usage by process
ps aux --sort=-%mem | head -10

# Monitor Node.js memory usage
node --inspect production/api/server.js
# Open chrome://inspect to view memory profiles
```

**Solutions**:

1. **Memory leaks**:
   ```javascript
   // Add memory monitoring
   setInterval(() => {
     const used = process.memoryUsage();
     console.log('Memory usage:', {
       rss: Math.round(used.rss / 1024 / 1024) + 'MB',
       heapTotal: Math.round(used.heapTotal / 1024 / 1024) + 'MB',
       heapUsed: Math.round(used.heapUsed / 1024 / 1024) + 'MB'
     });
   }, 30000);
   ```

2. **Database connection cleanup**:
   ```javascript
   // Ensure connections are properly closed
   process.on('SIGINT', async () => {
     console.log('Closing database connections...');
     await pool.end();
     process.exit(0);
   });
   ```

## 🚨 Error Codes Reference

### API Error Codes

| Code | Description | Severity | Action |
|------|-------------|----------|--------|
| `DB_CONNECTION_FAILED` | Database connection lost | High | Check database status, IP whitelist |
| `AUTH_TOKEN_EXPIRED` | Authentication token expired | Low | Re-authenticate user |
| `VALIDATION_ERROR` | Input validation failed | Low | Fix client input validation |
| `PERMISSION_DENIED` | Insufficient permissions | Medium | Check user roles and permissions |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Medium | Implement client-side rate limiting |
| `INTERNAL_SERVER_ERROR` | Unexpected server error | High | Check server logs, contact support |
| `SERVICE_UNAVAILABLE` | Service temporarily down | High | Check system health, scale resources |

### Database Error Codes

| PostgreSQL Code | Description | Common Cause | Solution |
|-----------------|-------------|--------------|----------|
| `08006` | Connection failure | Network/auth issue | Check connection string, credentials |
| `23505` | Unique violation | Duplicate key | Handle uniqueness in application |
| `42P01` | Table doesn't exist | Migration not run | Run database migrations |
| `42703` | Column doesn't exist | Schema out of sync | Update database schema |
| `53300` | Too many connections | Connection pool exhausted | Increase pool size or fix leaks |

### Frontend Error Patterns

```javascript
// Common error handling patterns
const errorHandlers = {
  'DB_CONNECTION_FAILED': (error) => {
    showNotification('Database temporarily unavailable. Please try again.', 'error');
    // Retry logic or fallback to cached data
  },
  
  'AUTH_TOKEN_EXPIRED': (error) => {
    // Redirect to login
    window.location.href = '/login';
  },
  
  'VALIDATION_ERROR': (error) => {
    // Show field-specific errors
    displayFieldErrors(error.details);
  },
  
  'NETWORK_ERROR': (error) => {
    showNotification('Network connection lost. Check your connection.', 'warning');
    // Implement offline mode if applicable
  }
};
```

## 🔄 System Recovery Procedures

### Automatic Recovery

```javascript
// Implement circuit breaker pattern
class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.threshold = threshold;
    this.timeout = timeout;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
  }

  async execute(operation) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
    }
  }
}
```

### Manual Recovery Steps

**Complete System Reset**:

1. **Stop all services**:
   ```bash
   pkill -f "node.*server.js"
   pkill -f "vite"
   ```

2. **Clear caches and temporary files**:
   ```bash
   rm -rf node_modules/.cache
   rm -rf development/prototypes/ui_prototype/dist
   npm run clean
   ```

3. **Reinstall dependencies**:
   ```bash
   cd production/api && npm ci
   cd development/prototypes/ui_prototype && npm ci
   ```

4. **Reset database connection**:
   ```sql
   -- Kill existing connections
   SELECT pg_terminate_backend(pid)
   FROM pg_stat_activity
   WHERE datname = 'emr_crc_ssot' AND pid <> pg_backend_pid();
   ```

5. **Restart services**:
   ```bash
   ./start-both-servers.sh
   ```

## 📞 Escalation Procedures

### Support Tiers

**Tier 1 - Application Support**:

- Response Time: 15 minutes (business hours)
- Scope: Application issues, user questions
- Contact: Internal IT support

**Tier 2 - System Administration**:

- Response Time: 30 minutes (24/7)
- Scope: Server issues, database problems
- Contact: System administrators

**Tier 3 - Emergency Response**:

- Response Time: 15 minutes (24/7)
- Scope: Security incidents, data breaches
- Contact: Security team, compliance officer

### Emergency Contacts

```json
{
  "emergency_contacts": {
    "security_team": {
      "email": "security@healthcare-org.com",
      "phone": "+1-555-SECURITY",
      "escalation_time": "15_minutes"
    },
    "database_admin": {
      "email": "dba@healthcare-org.com", 
      "phone": "+1-555-DATABASE",
      "escalation_time": "30_minutes"
    },
    "system_admin": {
      "email": "sysadmin@healthcare-org.com",
      "phone": "+1-555-SYSTEMS",
      "escalation_time": "30_minutes"
    },
    "compliance_officer": {
      "email": "compliance@healthcare-org.com",
      "phone": "+1-555-COMPLY",
      "escalation_time": "60_minutes"
    }
  }
}
```

## 📊 Monitoring & Alerting

### Key Metrics to Monitor

```javascript
// Monitoring dashboard metrics
const monitoringMetrics = {
  system_health: {
    api_response_time: { threshold: 500, unit: 'ms' },
    database_connection_time: { threshold: 100, unit: 'ms' },
    memory_usage: { threshold: 80, unit: 'percent' },
    cpu_usage: { threshold: 70, unit: 'percent' },
    disk_usage: { threshold: 85, unit: 'percent' }
  },
  
  application_metrics: {
    active_users: { threshold: 1000, unit: 'count' },
    failed_logins: { threshold: 50, unit: 'per_hour' },
    api_error_rate: { threshold: 5, unit: 'percent' },
    search_success_rate: { threshold: 95, unit: 'percent' }
  },
  
  security_metrics: {
    failed_auth_attempts: { threshold: 10, unit: 'per_minute' },
    suspicious_activity: { threshold: 1, unit: 'per_hour' },
    audit_log_size: { threshold: 1000, unit: 'mb_per_day' }
  }
};
```

### Alert Configuration

```bash
# Example monitoring script
#!/bin/bash
# monitor-system.sh

# Check API health
API_RESPONSE=$(curl -s -w "%{time_total}" -o /dev/null http://localhost:3001/api/health)
if (( $(echo "$API_RESPONSE > 0.5" | bc -l) )); then
    echo "ALERT: API response time high: ${API_RESPONSE}s"
    # Send alert
fi

# Check database connection
DB_TIME=$(psql -h 100.112.67.23 -U emr_admin -d emr_crc_ssot -t -c "\timing" -c "SELECT 1;" 2>&1 | grep "Time:" | awk '{print $2}')
if (( $(echo "$DB_TIME > 100" | bc -l) )); then
    echo "ALERT: Database connection slow: ${DB_TIME}ms"
    # Send alert
fi

# Run every minute via cron
# */1 * * * * /path/to/monitor-system.sh
```

---

**🔄 Last Updated**: September 29, 2025  
**✅ Troubleshooting Status**: All procedures current and tested  
**🚨 Next Update Required**: When new issues are identified and resolved