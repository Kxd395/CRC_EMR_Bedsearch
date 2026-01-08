# 🛡️ EMR CRC SSOT - Security Policies (SSOT)

**Last Updated**: September 29, 2025  
**Security Classification**: HIPAA Compliant Healthcare System

## 🚨 UPDATE REQUIREMENTS

**MANDATORY**: Update this file whenever:

- ✅ Security policy changes
- ✅ Compliance requirements updated
- ✅ New security tools added
- ✅ Incident response procedures change
- ✅ Access control modifications
- ✅ Audit requirements change

## 🏥 Healthcare Security Overview

### Regulatory Compliance

**Primary Frameworks:**

- **HIPAA** (Health Insurance Portability and Accountability Act)
- **HITECH** (Health Information Technology for Economic and Clinical Health)
- **State Healthcare Privacy Laws**
- **SOC 2 Type II** (Service Organization Control)

### Security Classification Levels

| Level | Data Type | Examples | Protection Requirements |
|-------|-----------|----------|------------------------|
| 🔴 **PHI** | Protected Health Information | Patient records, medical IDs | Encryption + Access Control + Audit |
| 🟡 **PII** | Personally Identifiable Information | Names, addresses, phone numbers | Encryption + Access Control |
| 🟢 **Internal** | Business Information | System configs, non-PHI data | Access Control |
| 🔵 **Public** | Public Information | Documentation, help text | Standard Protection |

## 🔐 Authentication & Authorization

### Multi-Factor Authentication (MFA)

**Required For:**

- All production system access
- Administrative functions
- Database access
- Source code repositories
- Deployment platforms

**Implementation:**

```javascript
// MFA enforcement in API
const requireMFA = async (req, res, next) => {
  const user = await User.findById(req.userId);
  
  if (!user.mfaEnabled) {
    return res.status(403).json({
      error: 'MFA_REQUIRED',
      message: 'Multi-factor authentication required for this action'
    });
  }
  
  // Verify MFA token
  const mfaValid = await verifyMFAToken(user.id, req.headers['x-mfa-token']);
  if (!mfaValid) {
    await logSecurityEvent('MFA_VERIFICATION_FAILED', user.id, req.ip);
    return res.status(403).json({
      error: 'MFA_INVALID',
      message: 'Invalid MFA token'
    });
  }
  
  next();
};
```

### Role-Based Access Control (RBAC)

**Healthcare Roles:**

```json
{
  "roles": {
    "healthcare_admin": {
      "permissions": ["read:all", "write:all", "delete:records", "manage:users"],
      "description": "Full system access for healthcare administrators"
    },
    "placement_coordinator": {
      "permissions": ["read:placements", "write:placements", "read:facilities"],
      "description": "Manage patient placement searches and facility coordination"
    },
    "assessment_specialist": {
      "permissions": ["read:assessments", "write:assessments", "read:patients"],
      "description": "Create and manage patient assessments"
    },
    "facility_manager": {
      "permissions": ["read:facilities", "write:own_facility", "read:placements"],
      "description": "Manage facility information and availability"
    },
    "read_only_user": {
      "permissions": ["read:public_data"],
      "description": "Limited read access to non-PHI data"
    }
  }
}
```

### Session Management

**Security Requirements:**

```javascript
// Secure session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  name: 'emr_session_id',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    secure: true,           // HTTPS only
    httpOnly: true,         // Prevent XSS
    maxAge: 30 * 60 * 1000, // 30 minutes
    sameSite: 'strict'      // CSRF protection
  },
  store: new RedisStore({
    client: redisClient,
    prefix: 'sess:',
    ttl: 1800 // 30 minutes
  })
};
```

## 🔒 Data Encryption

### Encryption at Rest

**Database Encryption:**

```sql
-- Enable PostgreSQL encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt PHI columns
CREATE TABLE patient_records (
  id SERIAL PRIMARY KEY,
  medical_record_number VARCHAR(255) UNIQUE NOT NULL,
  encrypted_name BYTEA, -- pgp_sym_encrypt(name, key)
  encrypted_dob BYTEA,  -- pgp_sym_encrypt(dob, key)
  encrypted_ssn BYTEA,  -- pgp_sym_encrypt(ssn, key)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create audit trigger
CREATE OR REPLACE FUNCTION audit_phi_access()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (
    table_name, 
    operation, 
    user_id, 
    timestamp, 
    ip_address
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    current_setting('app.user_id'),
    NOW(),
    current_setting('app.client_ip')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Encryption in Transit

**TLS Configuration:**

```javascript
// Express.js TLS configuration
const httpsOptions = {
  key: fs.readFileSync(process.env.SSL_PRIVATE_KEY),
  cert: fs.readFileSync(process.env.SSL_CERTIFICATE),
  ca: fs.readFileSync(process.env.SSL_CA_BUNDLE),
  minVersion: 'TLSv1.2',
  ciphers: [
    'TLS_AES_256_GCM_SHA384',
    'TLS_CHACHA20_POLY1305_SHA256',
    'TLS_AES_128_GCM_SHA256',
    'ECDHE-RSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES128-GCM-SHA256'
  ].join(':'),
  honorCipherOrder: true
};

const server = https.createServer(httpsOptions, app);
```

### Application-Level Encryption

**PHI Encryption Service:**

```javascript
const crypto = require('crypto');

class PHIEncryption {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyDerivation = 'pbkdf2';
    this.iterations = 100000;
  }

  async encrypt(data, userKey) {
    const salt = crypto.randomBytes(16);
    const iv = crypto.randomBytes(16);
    const key = crypto.pbkdf2Sync(userKey, salt, this.iterations, 32, 'sha256');
    
    const cipher = crypto.createCipher(this.algorithm, key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted: encrypted,
      salt: salt.toString('hex'),
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  async decrypt(encryptedData, userKey) {
    const { encrypted, salt, iv, authTag } = encryptedData;
    const key = crypto.pbkdf2Sync(userKey, Buffer.from(salt, 'hex'), this.iterations, 32, 'sha256');
    
    const decipher = crypto.createDecipher(this.algorithm, key, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

## 📊 Audit Logging

### Comprehensive Audit Trail

**Required Audit Events:**

```javascript
const AUDIT_EVENTS = {
  // Authentication events
  'USER_LOGIN': { level: 'INFO', retention: '7_YEARS' },
  'USER_LOGOUT': { level: 'INFO', retention: '7_YEARS' },
  'LOGIN_FAILED': { level: 'WARN', retention: '7_YEARS' },
  'MFA_ENABLED': { level: 'INFO', retention: '7_YEARS' },
  'MFA_DISABLED': { level: 'WARN', retention: '7_YEARS' },
  
  // PHI access events
  'PHI_ACCESSED': { level: 'INFO', retention: '7_YEARS' },
  'PHI_MODIFIED': { level: 'WARN', retention: '7_YEARS' },
  'PHI_DELETED': { level: 'ERROR', retention: '7_YEARS' },
  'PHI_EXPORTED': { level: 'WARN', retention: '7_YEARS' },
  
  // System events
  'SYSTEM_ERROR': { level: 'ERROR', retention: '3_YEARS' },
  'SECURITY_VIOLATION': { level: 'CRITICAL', retention: '7_YEARS' },
  'UNAUTHORIZED_ACCESS': { level: 'CRITICAL', retention: '7_YEARS' }
};

// Audit logging implementation
class AuditLogger {
  async logEvent(eventType, userId, data, request) {
    const auditEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      eventType: eventType,
      userId: userId,
      sessionId: request.sessionID,
      ipAddress: this.getClientIP(request),
      userAgent: request.get('User-Agent'),
      data: this.sanitizeData(data),
      level: AUDIT_EVENTS[eventType]?.level || 'INFO'
    };
    
    // Store in secure audit database
    await auditDB.collection('audit_log').insertOne(auditEntry);
    
    // Alert on critical events
    if (auditEntry.level === 'CRITICAL') {
      await this.sendSecurityAlert(auditEntry);
    }
  }

  sanitizeData(data) {
    // Remove sensitive information from audit logs
    const sanitized = { ...data };
    delete sanitized.password;
    delete sanitized.ssn;
    delete sanitized.creditCard;
    return sanitized;
  }
}
```

### Audit Log Protection

```sql
-- Audit log table with immutability
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  event_type VARCHAR(100) NOT NULL,
  user_id UUID REFERENCES users(id),
  session_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  data JSONB,
  level VARCHAR(20),
  checksum VARCHAR(64) -- SHA-256 hash for integrity
);

-- Prevent modifications to audit logs
CREATE RULE audit_log_no_update AS 
  ON UPDATE TO audit_log DO INSTEAD NOTHING;

CREATE RULE audit_log_no_delete AS 
  ON DELETE TO audit_log DO INSTEAD NOTHING;

-- Only allow inserts
GRANT INSERT ON audit_log TO application_user;
REVOKE UPDATE, DELETE ON audit_log FROM application_user;
```

## 🚫 Input Validation & Sanitization

### SQL Injection Prevention

```javascript
// Always use parameterized queries
const getUserByEmail = async (email) => {
  // ✅ CORRECT: Parameterized query
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await pool.query(query, [email]);
  
  // ❌ WRONG: String concatenation (vulnerable)
  // const query = `SELECT * FROM users WHERE email = '${email}'`;
  
  return result.rows[0];
};

// Input validation middleware
const validateInput = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        details: error.details.map(d => d.message)
      });
    }
    
    req.validatedData = value;
    next();
  };
};

// Healthcare-specific validation schemas
const patientSchema = Joi.object({
  medicalRecordNumber: Joi.string().pattern(/^MRN\d{8}$/).required(),
  firstName: Joi.string().min(1).max(50).pattern(/^[A-Za-z\s'-]+$/).required(),
  lastName: Joi.string().min(1).max(50).pattern(/^[A-Za-z\s'-]+$/).required(),
  dateOfBirth: Joi.date().max('now').required(),
  ssn: Joi.string().pattern(/^\d{3}-\d{2}-\d{4}$/).optional()
});
```

### Cross-Site Scripting (XSS) Prevention

```javascript
const helmet = require('helmet');
const DOMPurify = require('isomorphic-dompurify');

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  }
}));

// Input sanitization
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return DOMPurify.sanitize(input, { 
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
  }
  return input;
};
```

## 🔍 Security Monitoring

### Intrusion Detection

```javascript
// Rate limiting for security
const rateLimit = require('express-rate-limit');

const securityLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many failed attempts. Try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: async (req, res) => {
    await auditLogger.logEvent('RATE_LIMIT_EXCEEDED', null, {
      ip: req.ip,
      path: req.path
    }, req);
    
    res.status(429).json({
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests'
    });
  }
});

// Suspicious activity detection
const detectSuspiciousActivity = async (req, res, next) => {
  const suspiciousPatterns = [
    /union.*select/i,           // SQL injection
    /<script.*>/i,              // XSS attempts
    /\.\.\//,                   // Path traversal
    /proc\/self\/environ/i      // System file access
  ];
  
  const requestData = JSON.stringify({
    url: req.url,
    body: req.body,
    query: req.query
  });
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(requestData)) {
      await auditLogger.logEvent('SECURITY_VIOLATION', req.userId, {
        pattern: pattern.toString(),
        request: requestData
      }, req);
      
      return res.status(403).json({
        error: 'SECURITY_VIOLATION',
        message: 'Suspicious activity detected'
      });
    }
  }
  
  next();
};
```

### Security Alerts

```javascript
// Real-time security alerting
class SecurityAlertManager {
  constructor() {
    this.alertThresholds = {
      'LOGIN_FAILED': { count: 5, window: 300000 }, // 5 in 5 minutes
      'SECURITY_VIOLATION': { count: 1, window: 60000 }, // 1 in 1 minute
      'PHI_ACCESSED': { count: 100, window: 3600000 } // 100 in 1 hour
    };
  }

  async checkThresholds(eventType, data) {
    const threshold = this.alertThresholds[eventType];
    if (!threshold) return;

    const recentEvents = await this.getRecentEvents(
      eventType, 
      threshold.window
    );

    if (recentEvents.length >= threshold.count) {
      await this.sendAlert({
        type: 'SECURITY_THRESHOLD_EXCEEDED',
        eventType: eventType,
        count: recentEvents.length,
        timeWindow: threshold.window,
        data: data
      });
    }
  }

  async sendAlert(alert) {
    // Email to security team
    await emailService.send({
      to: process.env.SECURITY_TEAM_EMAIL,
      subject: `🚨 Security Alert: ${alert.type}`,
      template: 'security-alert',
      data: alert
    });

    // Slack notification
    await slackService.send({
      channel: '#security-alerts',
      text: `🚨 Security Alert: ${alert.type} - ${alert.eventType} threshold exceeded`
    });

    // Log the alert
    await auditLogger.logEvent('SECURITY_ALERT_SENT', null, alert, {});
  }
}
```

## 🔐 Hardcoded Value Prevention

### Automated Security Scanning

**Pre-commit Git Hook** (`.githooks/pre-commit`):

```bash
#!/bin/bash
# Security scan before commit

echo "🔍 Running security scan..."

# Check for hardcoded secrets
./tools/security-scanner.sh

if [ $? -ne 0 ]; then
    echo "❌ Security scan failed. Commit blocked."
    echo "Please remove hardcoded values before committing."
    exit 1
fi

echo "✅ Security scan passed"
exit 0
```

**Security Scanner** (`tools/security-scanner.sh`):

```bash
#!/bin/bash

FINDINGS=()
EXIT_CODE=0

# Check for hardcoded IPs
if grep -r --include="*.js" --include="*.ts" --include="*.json" -E '\b([0-9]{1,3}\.){3}[0-9]{1,3}\b' . --exclude-dir=node_modules; then
    FINDINGS+=("Hardcoded IP addresses found")
    EXIT_CODE=1
fi

# Check for hardcoded passwords
if grep -r --include="*.js" --include="*.ts" -i -E '(password|secret|key)\s*[:=]\s*["\'][^"\']+["\']' . --exclude-dir=node_modules; then
    FINDINGS+=("Hardcoded passwords/secrets found")
    EXIT_CODE=1
fi

# Check for database URLs
if grep -r --include="*.js" --include="*.ts" -E 'postgres://|mysql://|mongodb://' . --exclude-dir=node_modules; then
    FINDINGS+=("Hardcoded database URLs found")
    EXIT_CODE=1
fi

# Report findings
if [ ${#FINDINGS[@]} -gt 0 ]; then
    echo "🚨 SECURITY VIOLATIONS DETECTED:"
    for finding in "${FINDINGS[@]}"; do
        echo "  - $finding"
    done
    echo ""
    echo "Please replace hardcoded values with environment variables."
fi

exit $EXIT_CODE
```

### ESLint Security Rules

**`.eslintrc.js`**:

```javascript
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:security/recommended'
  ],
  plugins: ['security'],
  rules: {
    'security/detect-hardcoded-secrets': 'error',
    'security/detect-sql-injection': 'error',
    'security/detect-xss': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-non-literal-fs-filename': 'warn',
    'security/detect-unsafe-regex': 'error'
  }
};
```

## 🆘 Incident Response

### Security Incident Classification

| Severity | Description | Response Time | Examples |
|----------|-------------|---------------|----------|
| **P0 - Critical** | Active PHI breach | < 15 minutes | Data exfiltration, system compromise |
| **P1 - High** | Potential PHI exposure | < 1 hour | Failed authentication surge, suspicious access |
| **P2 - Medium** | Security policy violation | < 4 hours | Hardcoded credentials found, minor vulnerabilities |
| **P3 - Low** | Security concern | < 24 hours | Policy compliance issues, educational needs |

### Incident Response Procedures

**Immediate Response (0-15 minutes):**

1. **Assess and contain**
   - Determine scope of incident
   - Isolate affected systems
   - Preserve evidence

2. **Notify stakeholders**
   - Security team
   - Healthcare compliance officer
   - System administrators

3. **Document everything**
   - Time of discovery
   - Initial assessment
   - Actions taken

**Investigation Phase (15 minutes - 4 hours):**

1. **Forensic analysis**
   - Review audit logs
   - Identify affected data
   - Determine root cause

2. **Risk assessment**
   - Evaluate PHI exposure
   - Assess system integrity
   - Determine notification requirements

**Recovery Phase (4-24 hours):**

1. **System restoration**
   - Apply security patches
   - Update configurations
   - Verify system integrity

2. **Monitoring enhancement**
   - Implement additional controls
   - Increase monitoring
   - Update detection rules

### HIPAA Breach Notification

**Required Notifications:**

```javascript
// Breach notification requirements
const breachNotification = {
  // Must notify within 60 days
  hhs_notification: {
    deadline: '60_days',
    method: 'online_form',
    url: 'https://ocrportal.hhs.gov'
  },
  
  // Must notify individuals within 60 days
  individual_notification: {
    deadline: '60_days',
    method: 'written_notice',
    backup_method: 'email_or_phone'
  },
  
  // Must notify media if breach affects >500 individuals
  media_notification: {
    threshold: 500,
    deadline: '60_days',
    method: 'prominent_media_outlets'
  }
};
```

## 📋 Security Compliance Checklist

### HIPAA Compliance Verification

**Administrative Safeguards:**

- [ ] Security officer assigned
- [ ] Workforce training completed
- [ ] Access management procedures
- [ ] Information system access controls
- [ ] Security awareness training
- [ ] Incident response procedures
- [ ] Contingency plan exists
- [ ] Business associate agreements

**Physical Safeguards:**

- [ ] Facility access controls
- [ ] Workstation use restrictions
- [ ] Device and media controls
- [ ] Data center security measures

**Technical Safeguards:**

- [ ] Access control systems
- [ ] Audit controls implemented
- [ ] Data integrity measures
- [ ] Person or entity authentication
- [ ] Transmission security controls

### Security Assessment Schedule

| Assessment Type | Frequency | Responsible Party | Last Completed |
|----------------|-----------|-------------------|----------------|
| Vulnerability Scan | Weekly | Security Team | [Date] |
| Penetration Test | Quarterly | External Vendor | [Date] |
| HIPAA Risk Assessment | Annually | Compliance Officer | [Date] |
| Security Audit | Annually | Internal Audit | [Date] |
| Incident Response Drill | Bi-annually | IT Team | [Date] |

---

**🔄 Last Updated**: September 29, 2025  
**✅ Security Status**: All policies current and enforced  
**🚨 Next Update Required**: When security requirements change
