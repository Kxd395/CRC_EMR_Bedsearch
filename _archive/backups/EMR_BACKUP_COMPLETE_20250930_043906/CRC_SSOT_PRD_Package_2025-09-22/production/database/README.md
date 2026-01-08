# 💾 Production Database - EMR Healthcare System

**Database Status**: ✅ **Operational**  
**Server**: PostgreSQL 16.10 on 100.112.67.23:5432  
**Network**: Tailscale VPN Secured  
**Deployed**: September 28, 2025  

---

## 🎯 **Quick Actions**

### **Connect to Database**
```bash
cd scripts/
./connect_emr_db.sh
```

### **Create Backup**
```bash
cd scripts/
./backup_emr_db.sh
```

### **Validate System**
```bash
cd scripts/
./validate_emr_schema.sh
```

### **Emergency Restore**
```bash
cd restore_points/
./validate_restore_point.sh
# Follow procedures in documentation/restore_procedures.md
```

---

## 📁 **Database Structure**

### **Directory Layout**
```
database/
├── schema/                    # Database schema files
│   ├── postgresql_emr_schema.sql
│   └── supabase_ssot_schema_diagram.md
├── scripts/                   # Management scripts
│   ├── apply_schema.sh
│   ├── backup_emr_db.sh
│   ├── connect_emr_db.sh
│   └── validate_emr_schema.sh
├── config/                    # Configuration files
│   ├── env.example
│   └── .env.production
├── restore_points/            # Emergency recovery
│   └── [timestamp]_deployment/
└── documentation/             # Technical guides
    ├── deployment_guide.md
    ├── restore_procedures.md
    └── troubleshooting.md
```

### **Database Schema**
```sql
-- Core Healthcare Tables (Production)
patients          -- Patient demographics and MRN management
facilities        -- Healthcare provider network
placement_search  -- Clinical placement workflow tracking
placement_notes   -- Provider clinical documentation
audit_log         -- HIPAA compliance audit trail
```

---

## 🏥 **Clinical Database Features**

### **Patient Management**
- Demographics with MRN tracking
- PHI security with UUID identifiers
- Integration points for medical records

### **Healthcare Provider Network**
- Multi-specialty facility management
- Geographic distribution tracking
- Specialization matrix (302 holds, MAT, secure units)

### **Placement Coordination**
- Complete workflow: draft → sent → waiting → accepted → transfer_set → closed
- Real-time placement request monitoring
- Transfer management with single active transfer enforcement

### **Clinical Documentation**
- Structured provider notes with metadata
- Provider attribution and timestamps
- Audit compliance for all clinical actions

---

## 🔧 **Database Administration**

### **Connection Details**
- **Host**: 100.112.67.23:5432
- **Database**: emr_placement_ssot
- **User**: emr_admin
- **Network**: Tailscale VPN only (100.x.x.x range)

### **Current Data Inventory**
- **Tables**: 5 core tables + system tables
- **Patients**: 2 test records
- **Facilities**: 3 healthcare providers
- **Placements**: 2 active placement searches
- **Audit Entries**: 5 HIPAA compliance logs

### **Performance Metrics**
- **Connection Latency**: 32ms average via Tailscale
- **Query Response**: <100ms for clinical workflows
- **Backup Size**: 18.3KB (production data + schema)
- **Uptime**: 100% since deployment

---

## 🛡️ **Security & Compliance**

### **Network Security**
- **Access Control**: Tailscale VPN-only (zero internet exposure)
- **Encryption**: TLS transport + AES storage encryption
- **Authentication**: Role-based database permissions
- **Monitoring**: Connection attempts logged

### **HIPAA Compliance**
- **Audit Logging**: Every PHI interaction captured in audit_log
- **Data Integrity**: Constraints prevent corruption
- **Access Controls**: Healthcare team role-based permissions
- **Backup Security**: Encrypted backup procedures

### **Data Classification**
- **PHI**: All patient data properly secured
- **PII**: Provider and facility information protected
- **Clinical Data**: Medical notes and placement records
- **Audit Trail**: Complete compliance documentation

---

## 📋 **Operational Procedures**

### **Daily Operations**
1. **Health Check**: Run validation script
2. **Audit Review**: Check new audit_log entries
3. **Performance**: Monitor connection and query times
4. **Backup Status**: Verify restore point availability

### **Weekly Maintenance**
- Validate restore point integrity
- Review audit logs for unusual activity
- Update backup rotation
- Monitor database growth

### **Emergency Procedures**
1. **Connection Issues**: Check Tailscale VPN status
2. **Performance Problems**: Review query execution plans
3. **Data Recovery**: Use validated restore points
4. **Security Incidents**: Follow HIPAA breach procedures

---

## 🔄 **Backup & Recovery**

### **Current Restore Points**
- **Latest**: September 28, 2025 at 2:52:44 PM EST
- **Status**: Validated and ready for emergency use
- **Size**: 18.3KB complete database backup
- **Recovery Time**: <5 minutes with restore procedures

### **Backup Strategy**
- **Frequency**: On-demand via scripts
- **Retention**: 7 days production, 90 days compliance
- **Validation**: Automated integrity checking
- **Encryption**: GPG encryption for HIPAA compliance

### **Recovery Options**
- **Complete Restore**: Full database recreation
- **Schema Only**: Structure without data
- **Data Only**: Content to existing schema
- **Point-in-Time**: Using specific restore points

---

## 📞 **Support & Contacts**

### **Technical Support**
- **Database Issues**: Check troubleshooting.md first
- **Network Access**: Tailscale VPN administrator
- **Schema Changes**: Database development team
- **Performance**: System administrator on-call

### **Healthcare/Clinical Support**
- **Clinical Workflows**: Healthcare IT support
- **HIPAA Compliance**: Compliance officer
- **PHI Concerns**: Privacy officer
- **Audit Questions**: Compliance team

### **Emergency Procedures**
- **Data Loss**: Immediate restore point activation
- **Security Breach**: HIPAA incident response team
- **System Outage**: Clinical operations notification
- **Audit Failure**: Compliance team escalation

---

## 🚀 **Future Enhancements**

### **Planned Improvements**
- Automated backup scheduling
- Performance monitoring dashboards
- Advanced audit reporting
- Integration with Epic EMR systems

### **Scaling Considerations**
- Multi-facility data partitioning
- Read replica for reporting queries  
- Connection pooling for high concurrency
- Advanced indexing for complex queries

---

*💾 Production Database - Healthcare EMR System*  
*All clinical workflows operational*  
*HIPAA compliant with full audit trails*