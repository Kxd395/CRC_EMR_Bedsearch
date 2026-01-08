# 🏗️ CRC SSOT EMR - Repository Scaffolding Guide

**Last Updated:** November 2024  
**Status:** 🔧 In Progress - Comprehensive Organization  

## 🎯 Purpose

This document provides the comprehensive scaffolding structure for the CRC SSOT EMR repository, ensuring proper organization, security compliance, and maintainability.

---

## 📂 Current Repository Structure

### Root Level
```
EMR/
├── AUDIT_REPORT.md                     # Security audit findings
├── database_fix_script.sh             # Database migration scripts  
├── ngrok.log                          # Development tunnel logs
├── server.log                         # Application server logs
├── CRC_SSOT_PRD_Package_2025-09-22/   # Main project package
└── data/                              # Fallback data structures
```

### Main Package Structure  
```
CRC_SSOT_PRD_Package_2025-09-22/
├── 📋 Documentation System
│   ├── README.md                      # Master SSOT index
│   ├── API_REFERENCE.md               # Complete API documentation  
│   ├── DATABASE_SCHEMA.md             # PostgreSQL schema definitions
│   ├── ENVIRONMENT_CONFIG.md          # Environment variable guide
│   ├── DEPLOYMENT_GUIDE.md            # Multi-platform deployment
│   ├── SECURITY_POLICIES.md           # Security standards & compliance
│   ├── TROUBLESHOOTING.md             # Issue resolution guide
│   └── SYSTEM_ARCHITECTURE.md         # Technical architecture
│
├── 🔧 Development Environment  
│   └── development/
│       ├── README.md                  # Development setup guide
│       ├── prototypes/
│       │   └── ui_prototype/          # Modular UI prototype
│       ├── specifications/            # Technical specifications
│       └── testing/                   # Test configurations
│
├── 📊 Production Systems
│   ├── production/
│   │   ├── api/                       # Production API configurations
│   │   └── database/                  # Production database schemas
│   └── tools/
│       ├── migration/                 # Database migration tools
│       ├── setup/                     # Environment setup scripts
│       └── validation/                # Data validation utilities
│
├── 📚 Documentation Archives
│   ├── doc/                           # Current documentation
│   ├── documentation/                 # Organized documentation system
│   └── archive/                       # Historical versions
│
└── 🛠️ Deployment & Operations
    ├── deploy.sh                      # Main deployment script
    ├── setup-railway.sh               # Railway deployment
    ├── setup-database-netlify.js     # Netlify database setup
    ├── prepare-netlify.js             # Netlify preparation
    ├── start-dev.js                   # Development server
    └── test-with-ngrok.sh             # Tunnel testing
```

---

## 🔐 Security & Compliance Structure

### Environment Configuration
```
🌍 Environment Files (NEVER commit .env)
├── .env.example                       # Template with dummy values
├── .env.local                         # Local development (gitignored)  
├── .env.staging                       # Staging environment (gitignored)
└── .env.production                    # Production environment (gitignored)
```

### Security Scanning
```
🔒 Security Integration
├── .eslintrc.js                      # ESLint security rules
├── .husky/                            # Git hooks for security scanning
│   ├── pre-commit                     # Lint & security checks
│   └── pre-push                       # Final validation
├── .gitignore                         # Comprehensive ignore patterns
└── security-audit.json               # Security audit results
```

---

## 🏥 Healthcare Compliance Structure

### UI Prototype Modular Architecture
```
development/prototypes/ui_prototype/
├── 📋 Configuration
│   ├── .nvmrc                         # Node.js version specification
│   ├── .env                           # Environment variables
│   ├── .env.example                   # Environment template
│   ├── package.json                   # Dependencies & scripts
│   ├── eslint.config.js              # ESLint configuration
│   └── RECOMMENDATIONS.md             # UI development guide
│
├── 🧩 Modular Components  
│   └── src/
│       ├── config/
│       │   └── environment.js         # Environment management
│       ├── features/
│       │   └── facilityFinder.js      # PA facility finder with commitment rules
│       ├── status/
│       │   └── derive.js              # Event-driven status derivation  
│       ├── persistence/
│       │   ├── api.js                 # API client with error handling
│       │   └── local.js               # Encrypted local storage (HIPAA)
│       └── docs/
│           └── dashboard.js           # Documentation state machine
│
├── 🧪 Testing Infrastructure
│   ├── tests/                         # E2E & unit tests
│   │   ├── e2e/                       # Playwright E2E tests
│   │   ├── unit/                      # Vitest unit tests
│   │   └── accessibility/             # Axe accessibility tests
│   └── coverage/                      # Test coverage reports
│
└── 📊 Development Tools
    ├── .husky/                        # Git hooks
    ├── lint-staged.config.js          # Pre-commit linting
    └── playwright.config.js           # E2E test configuration
```

---

## 🎨 Pennsylvania Healthcare Commitment Rules

### Commitment Matrix Implementation
```
PA Commitment Types:
├── 🏥 201 Commitment (Voluntary)
│   ├── SUD Programs: ❌ Not applicable  
│   ├── Mental Health: ✅ Available
│   └── Dual Diagnosis: ✅ Available with MH focus
│
├── ⚖️ 302 Commitment (Involuntary - Emergency)  
│   ├── SUD Programs: ❌ Not applicable
│   ├── Mental Health: ✅ Required for emergency cases
│   └── Dual Diagnosis: ✅ MH primary, SUD secondary
│
├── 📋 303 Commitment (Extended Involuntary)
│   ├── SUD Programs: ❌ Not applicable
│   ├── Mental Health: ✅ Court-ordered treatment
│   └── Dual Diagnosis: ✅ MH primary with SUD considerations
│
└── 🔄 SUD-Specific Programs
    ├── Commitment Types: ⚠️ Alternative pathways
    ├── Voluntary Admission: ✅ Standard process
    └── Court-Ordered Treatment: ⚠️ Different legal framework
```

---

## 📋 Development Workflow Standards

### Definition of Done Checklist
- [ ] **Code Quality**
  - [ ] ESLint passes with zero errors
  - [ ] All functions documented with JSDoc
  - [ ] No hardcoded values (use environment variables)
  - [ ] Browser compatibility validated
  
- [ ] **Security Requirements**  
  - [ ] No secrets in code (validated by pre-commit hooks)
  - [ ] Input sanitization implemented
  - [ ] HIPAA compliance maintained (encrypted storage)
  - [ ] API authentication properly configured

- [ ] **Testing Standards**
  - [ ] Unit tests for all new functions
  - [ ] E2E tests for user workflows  
  - [ ] Accessibility tests pass (Axe)
  - [ ] Cross-browser testing completed

- [ ] **Documentation Updates**
  - [ ] SSOT documentation updated (mandatory)
  - [ ] API changes documented
  - [ ] Environment variables documented
  - [ ] Deployment procedures updated

---

## 🚀 Deployment Pipeline Structure

### Environment Tiers
```
🏗️ Development (localhost)
├── Database: Fallback JSON files
├── API: localhost:3001
├── UI: localhost:5174 (Vite)
└── Testing: Playwright + Vitest

🧪 Staging (Railway/Netlify)  
├── Database: PostgreSQL @ 100.112.67.23:5432
├── API: Railway deployment  
├── UI: Netlify deployment
└── Testing: Automated CI/CD pipeline

🏥 Production (TBD - Healthcare Compliance)
├── Database: HIPAA-compliant PostgreSQL
├── API: Certified healthcare infrastructure
├── UI: CDN with healthcare compliance
└── Monitoring: 24/7 healthcare operations
```

---

## 📊 Data Architecture

### Database Structure  
```
PostgreSQL Database: emr_crc_ssot
├── 🏥 Core Tables
│   ├── facilities (id, name, type, location, capacity)
│   ├── patients (id, demographic_info, commitment_status)
│   ├── assessments (id, patient_id, assessment_data, timestamp)
│   └── placements (id, patient_id, facility_id, status, timestamps)
│
├── 🔍 Search & Persistence  
│   ├── searches (JSONB) - Active placement searches
│   ├── search_history (JSONB) - Historical search data  
│   └── mat_needs (JSONB) - MAT program requirements
│
└── 🔐 Audit & Compliance
    ├── audit_log (action, user, timestamp, data_changed)
    ├── user_sessions (session_id, user_id, login_time, ip_address)  
    └── compliance_flags (record_id, flag_type, status, review_date)
```

### Fallback Data Structure
```
data/fallback/
├── assessments/                       # Assessment templates
│   ├── standard-assessment.json       # Standard assessment form
│   └── emergency-assessment.json     # Emergency assessment form  
└── patients/                          # Patient data templates
    ├── new-patient-template.json      # New patient registration
    └── transfer-template.json         # Transfer patient template
```

---

## 🔧 Next Steps for Repository Organization

### Immediate Actions Required

1. **🔐 Complete Security Setup**
   ```bash
   # Install security dependencies (COMPLETED ✅)  
   npm install
   
   # Configure pre-commit hooks (COMPLETED ✅)
   husky install
   
   # Test security scanning
   npm run security-scan
   ```

2. **🏥 Finalize UI Prototype Modularization**
   ```bash
   # Fix remaining ESLint issues
   npm run lint --fix
   
   # Complete module integration testing
   npm run test:unit
   
   # Validate E2E workflows  
   npm run test:e2e
   ```

3. **💾 Database Schema Migration**
   ```bash
   # Whitelist IP: 70.16.142.31 in pg_hba.conf on 100.112.67.23
   # Then run: ./database_fix_script.sh
   ```

4. **📚 SSOT Documentation Validation**
   ```bash
   # Validate all 8 SSOT documents are current
   # Update API_REFERENCE.md with new modular endpoints  
   # Confirm SYSTEM_ARCHITECTURE.md reflects current structure
   ```

### Priority Sequence

| Order | Task | Status | Dependencies |
|-------|------|--------|--------------|  
| 1 | ESLint Configuration Complete | 🔄 In Progress | Node environment |
| 2 | Module Integration Testing | ⏳ Pending | ESLint fixes |
| 3 | Database IP Whitelist | ⏳ Pending | Server admin access |  
| 4 | Production Deployment Setup | ⏳ Pending | Database migration |
| 5 | Healthcare Compliance Audit | ⏳ Pending | Full system integration |

---

## 🏆 Success Metrics

### Repository Organization Goals
- [ ] **Zero Hardcoded Values**: All configuration via environment variables
- [ ] **Complete Modularization**: UI prototype fully componentized  
- [ ] **Security Compliance**: Automated scanning prevents vulnerabilities
- [ ] **Documentation Currency**: SSOT system always reflects current state
- [ ] **Healthcare Compliance**: PA commitment rules properly implemented
- [ ] **Testing Coverage**: >90% code coverage with E2E workflows
- [ ] **Deployment Automation**: One-command deployment to all environments

### Healthcare-Specific Outcomes
- [ ] **PA Commitment Compliance**: 201/302/303 rules properly enforced
- [ ] **HIPAA Data Handling**: All patient data encrypted and auditable  
- [ ] **Clinical Workflow Support**: Commitment/placement matrix operational
- [ ] **Emergency Response Ready**: 302 commitment workflows validated
- [ ] **Audit Trail Complete**: All actions logged for compliance review

---

## 📞 Support & Escalation

- **Development Issues**: Check TROUBLESHOOTING.md first
- **Security Concerns**: Follow SECURITY_POLICIES.md procedures  
- **Healthcare Compliance**: Consult PA mental health regulations
- **Database Problems**: Use database_fix_script.sh after IP whitelist

**Next Documentation Update Required:** Upon completion of UI prototype modularization

---
*This document is part of the CRC SSOT EMR system. It must be updated whenever repository structure changes.*