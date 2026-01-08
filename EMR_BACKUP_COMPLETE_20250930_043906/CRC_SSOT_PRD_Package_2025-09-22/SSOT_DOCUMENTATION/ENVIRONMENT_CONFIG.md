# ⚙️ EMR CRC SSOT - Environment Configuration (SSOT)

**Last Updated**: September 29, 2025  
**Configuration Management**: Environment Variables + `.env` files

## 🚨 UPDATE REQUIREMENTS

**MANDATORY**: Update this file whenever:

- ✅ New environment variable added
- ✅ Variable name changed
- ✅ Default value modified
- ✅ Required vs optional status changes
- ✅ Validation rules updated
- ✅ Security classification changes

## 🌍 Environment Overview

### Configuration Files

| File | Purpose | Environment |
|------|---------|-------------|
| `production/api/.env` | API server configuration | Development/Production |
| `development/prototypes/ui_prototype/.env` | UI client configuration | Development |
| `.env.example` | Template with secure placeholders | Documentation |
| `.env.local` | Local development overrides | Local only |

### Security Classification

- 🔴 **SECRET**: Never commit, rotate regularly
- 🟡 **SENSITIVE**: Commit only as placeholders  
- 🟢 **PUBLIC**: Safe to commit actual values

## 🏥 API Server Configuration

### Database Configuration (🔴 SECRET)

```bash
# PostgreSQL Database Connection
DB_HOST=100.112.67.23              # Database server IP
DB_PORT=5432                       # PostgreSQL port  
DB_NAME=emr_crc_ssot              # Database name
DB_USER=emr_admin                 # Database username
DB_PASSWORD=emr_secure_2024       # Database password (ROTATE REGULARLY)
```

**Validation Rules**:

- `DB_HOST`: Valid IP or hostname
- `DB_PORT`: Integer 1-65535
- `DB_NAME`: Alphanumeric + underscore only
- `DB_USER`: Valid PostgreSQL username
- `DB_PASSWORD`: Minimum 12 characters

**Security Notes**:

- Password must be rotated every 90 days
- Use different passwords for dev/staging/prod
- Never log database credentials

### API Server Configuration (🟡 SENSITIVE)

```bash
# Server Configuration
API_PORT=3001                     # API server port
NODE_ENV=development              # Environment: development|staging|production
```

**Validation Rules**:

- `API_PORT`: Integer 1024-65535 (avoid privileged ports)
- `NODE_ENV`: Must be `development`, `staging`, or `production`

### Security Configuration (🔴 SECRET)

```bash
# Authentication & Encryption  
JWT_SECRET=crc_ssot_jwt_secret_2024_secure        # JWT signing key
SESSION_SECRET=crc_ssot_session_secret_2024      # Session encryption key
ENCRYPTION_KEY=your-aes-256-encryption-key       # Data encryption key
```

**Security Requirements**:

- `JWT_SECRET`: Minimum 256 bits (32+ characters)
- `SESSION_SECRET`: Minimum 256 bits  
- `ENCRYPTION_KEY`: AES-256 compatible key
- All secrets must be cryptographically random

### HIPAA Compliance Configuration (🟡 SENSITIVE)

```bash
# Healthcare Data Protection
AUDIT_LOG_ENABLED=true            # Enable audit logging
DATA_RETENTION_DAYS=2555         # 7 years healthcare retention
PATIENT_DATA_ENCRYPTION=true     # Encrypt PHI at rest
```

**Compliance Notes**:

- `DATA_RETENTION_DAYS`: 2555 days = 7 years (healthcare requirement)
- `AUDIT_LOG_ENABLED`: MUST be true in production
- `PATIENT_DATA_ENCRYPTION`: MUST be true for HIPAA

### External API Configuration (🔴 SECRET)

```bash
# Healthcare System Integration
EMR_INTEGRATION_API_KEY=your-emr-api-key
FACILITY_DIRECTORY_API_KEY=your-facility-api-key  
INSURANCE_VERIFICATION_API_KEY=your-insurance-api-key
```

### Email/Notification Configuration (🔴 SECRET)

```bash
# SMTP Configuration
SMTP_HOST=your-smtp-host.com
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASSWORD=your-smtp-password
NOTIFICATION_EMAIL=notifications@your-domain.com
```

### File Storage Configuration (🔴 SECRET)

```bash
# Document Storage
UPLOAD_MAX_SIZE=10485760         # 10MB max file size
STORAGE_PROVIDER=s3              # local|s3|azure
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key  
S3_BUCKET_NAME=your-hipaa-compliant-s3-bucket
```

### Monitoring Configuration (🔴 SECRET)

```bash
# Error Tracking & Monitoring
ERROR_TRACKING_DSN=your-sentry-or-bugsnag-dsn
MONITORING_API_KEY=your-monitoring-service-key
LOG_LEVEL=info                   # debug|info|warn|error
```

## 🖥️ UI Client Configuration  

### API Connection (🟢 PUBLIC)

```bash
# Vite Environment Variables (must start with VITE_)
VITE_API_URL=http://localhost:3001    # API server endpoint
VITE_NODE_ENV=development            # Client environment
```

**Important**: Vite only includes variables starting with `VITE_`

### Feature Flags (🟢 PUBLIC)

```bash
# Healthcare Module Controls
VITE_ENABLE_PLACEMENT_SEARCH=true    # Enable placement search feature
VITE_ENABLE_ASSESSMENT_MODULE=true   # Enable patient assessments  
VITE_ENABLE_FACILITY_FINDER=true     # Enable facility finder
VITE_ENABLE_TRANSPORT_SCHEDULING=false  # Transport scheduling (future)
```

### Development Configuration (🟢 PUBLIC)

```bash
# Development Options
VITE_USE_MOCK_DATA=false            # Use mock data vs API
VITE_ENABLE_DEBUG=false             # Enable debug logging
VITE_API_TIMEOUT=30000              # API request timeout (ms)
```

### Healthcare System Integration (🟡 SENSITIVE)

```bash
# External System URLs
VITE_FACILITY_SYSTEM_URL=https://your-facility-system.com
VITE_ASSESSMENT_SYSTEM_URL=https://your-assessment-system.com
VITE_EMR_INTEGRATION_URL=https://your-emr-system.com
```

## 🚀 Deployment Platform Configuration

### Railway.app (🔴 SECRET)

```bash
RAILWAY_PROJECT_ID=your-railway-project-id
RAILWAY_SERVICE_ID=your-railway-service-id
```

### Render.com (🔴 SECRET)

```bash  
RENDER_SERVICE_ID=your-render-service-id
```

### Netlify Functions (🔴 SECRET)

```bash
NETLIFY_SITE_ID=your-netlify-site-id
NETLIFY_AUTH_TOKEN=your-netlify-auth-token
```

## 🔧 Environment-Specific Overrides

### Development Environment

```bash
# Override for local development
VITE_API_URL=http://localhost:3001
DB_HOST=localhost
NODE_ENV=development
DB_SSL=false
AUDIT_LOG_ENABLED=false
LOG_LEVEL=debug
```

### Staging Environment  

```bash
# Staging-specific values
NODE_ENV=staging
DB_SSL=true
AUDIT_LOG_ENABLED=true
LOG_LEVEL=info
VITE_API_URL=https://staging-api.your-domain.com
```

### Production Environment

```bash
# Production requirements
NODE_ENV=production
DB_SSL=true
AUDIT_LOG_ENABLED=true
PATIENT_DATA_ENCRYPTION=true
LOG_LEVEL=warn
VITE_API_URL=https://api.your-domain.com
```

## 🛡️ Security Best Practices

### Secret Management

1. **Never commit secrets** to version control
2. **Use different secrets** for each environment
3. **Rotate secrets** every 90 days
4. **Use secret management** services in production
5. **Audit secret access** regularly

### Environment File Security

```bash
# Correct .env file permissions
chmod 600 .env                    # Owner read/write only
chown app:app .env               # Correct ownership
```

### Validation Script

```bash
#!/bin/bash
# validate-config.sh - Check environment configuration

required_vars=("DB_HOST" "DB_NAME" "JWT_SECRET" "API_PORT")

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Missing required variable: $var"
    exit 1
  fi
done

echo "✅ All required configuration present"
```

## 🧪 Testing Configuration

### Test Environment Variables

```bash
# Testing-specific overrides
NODE_ENV=test
DB_NAME=emr_crc_ssot_test
USE_TEST_DATA=true
MOCK_EXTERNAL_APIS=true
SKIP_AUTH=true
```

## 🔍 Configuration Validation

### Startup Validation

The API server validates configuration on startup:

```javascript
// config-validation.js
const requiredVars = [
  'DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD',
  'JWT_SECRET', 'SESSION_SECRET', 'API_PORT'
];

requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`❌ Missing required environment variable: ${varName}`);
    process.exit(1);
  }
});
```

### Runtime Health Checks

```javascript
// Health check includes config validation
GET /api/health response:
{
  "config": {
    "database": "connected",
    "jwt": "configured", 
    "encryption": "enabled",
    "audit": "enabled"
  }
}
```

## 🆘 Troubleshooting

### Common Configuration Issues

**Issue**: "Missing environment variable"

**Solution**: Check `.env` file exists and has correct variables

**Issue**: "Database connection failed"  

**Solution**: Verify `DB_*` variables are correct

**Issue**: "JWT secret too short"

**Solution**: Generate new secret with `openssl rand -hex 32`

### Configuration Debugging

```bash
# Check loaded environment variables (NEVER in production)
npm run config:debug

# Validate configuration
npm run config:validate

# Test database connection
npm run db:test
```

### Emergency Configuration Reset

```bash
# Copy template and update values
cp .env.example .env
# Edit .env with correct values
# Restart services
```

## 📋 Configuration Checklist

### New Deployment Checklist

- [ ] Copy `.env.example` to `.env`
- [ ] Update all `your-*` placeholders  
- [ ] Generate new JWT and session secrets
- [ ] Configure database connection
- [ ] Set appropriate `NODE_ENV`
- [ ] Enable HIPAA compliance settings
- [ ] Test configuration with `npm run config:validate`
- [ ] Verify health check passes
- [ ] Document any custom configurations

### Security Review Checklist

- [ ] No secrets in version control
- [ ] Secrets are environment-appropriate
- [ ] File permissions are restrictive
- [ ] Validation rules are enforced
- [ ] Audit logging is enabled
- [ ] Encryption is configured
- [ ] Secret rotation schedule exists

---

**🔄 Last Updated**: September 29, 2025  
**✅ Configuration Status**: Current and validated  
**🚨 Next Update Required**: When any environment variable changes