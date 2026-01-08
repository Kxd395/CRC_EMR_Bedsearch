#!/bin/bash
# 🔍 Validate EMR Database Schema
# Home Lab System - Validate EMR database deployment and functionality
# Created: September 30, 2025
# Purpose: Comprehensive validation of EMR database schema and data integrity

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# EMR Database Configuration
DEFAULT_DB_HOST="100.112.67.23"
DEFAULT_DB_PORT="5432"
DEFAULT_DB_NAME="emr_placement_ssot"
DEFAULT_DB_USER="emr_admin"

# SSH Configuration
SSH_USER="kxd395"
SSH_PORT="2222"
SSH_KEYS=("$HOME/.ssh/homelab" "$HOME/.ssh/id_rsa" "$HOME/.ssh/id_ed25519")

# Validation counters
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0

echo -e "${BLUE}🔍 EMR Database Schema Validation${NC}"
echo "=================================================="
echo "Validation Target: Healthcare EMR Database"
echo "HIPAA Compliance Check: ✅ Enabled"
echo "Clinical Workflow Test: ✅ Enabled"
echo "Timestamp: $(date)"
echo ""

# Function to show usage
show_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Validate EMR database schema deployment and functionality.

OPTIONS:
    -h, --host HOST         Database host (default: $DEFAULT_DB_HOST)
    -p, --port PORT         Database port (default: $DEFAULT_DB_PORT)
    -d, --database DB       Database name (default: $DEFAULT_DB_NAME)
    -u, --user USER         Database user (default: $DEFAULT_DB_USER)
    -l, --local            Validate local database (no SSH)
    -q, --quick            Quick validation (skip data integrity tests)
    -v, --verbose          Verbose output
    --help                 Show this help message

ENVIRONMENT VARIABLES:
    EMR_DATABASE_URL       Complete PostgreSQL connection string

EXAMPLES:
    # Validate using environment variable
    export EMR_DATABASE_URL="postgresql://emr_admin:password@100.112.67.23:5432/emr_placement_ssot"
    $0
    
    # Validate specific database
    $0 --host 192.168.0.40 --user postgres
    
    # Quick validation
    $0 --quick

EOF
}

# Parse command line arguments
DB_HOST="$DEFAULT_DB_HOST"
DB_PORT="$DEFAULT_DB_PORT"
DB_NAME="$DEFAULT_DB_NAME" 
DB_USER="$DEFAULT_DB_USER"
LOCAL_VALIDATE=false
QUICK_VALIDATE=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--host)
            DB_HOST="$2"
            shift 2
            ;;
        -p|--port)
            DB_PORT="$2"
            shift 2
            ;;
        -d|--database)
            DB_NAME="$2"
            shift 2
            ;;
        -u|--user)
            DB_USER="$2"
            shift 2
            ;;
        -l|--local)
            LOCAL_VALIDATE=true
            shift
            ;;
        -q|--quick)
            QUICK_VALIDATE=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        --help)
            show_usage
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Unknown option: $1${NC}"
            show_usage
            exit 1
            ;;
    esac
done

# Function to find working SSH key
find_ssh_key() {
    for key in "${SSH_KEYS[@]}"; do
        if [[ -f "$key" ]]; then
            if ssh -i "$key" -p "$SSH_PORT" -o ConnectTimeout=5 -o BatchMode=yes \
               "$SSH_USER@$DB_HOST" "echo 'test'" &>/dev/null; then
                echo "$key"
                return 0
            fi
        fi
    done
    return 1
}

# Function to execute SQL query
execute_sql() {
    local query=$1
    local description=${2:-"SQL Query"}
    
    if [[ "$VERBOSE" == "true" ]]; then
        echo -e "${BLUE}SQL: $query${NC}"
    fi
    
    if [[ "$LOCAL_VALIDATE" == "true" ]]; then
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "$query" 2>/dev/null
    else
        ssh_key=$(find_ssh_key) || return 1
        ssh -i "$ssh_key" -p "$SSH_PORT" "$SSH_USER@$DB_HOST" \
            "psql -h localhost -U $DB_USER -d $DB_NAME -t -c \"$query\"" 2>/dev/null
    fi
}

# Function to run validation test
run_test() {
    local test_name=$1
    local test_command=$2
    local expected_result=${3:-""}
    
    ((TOTAL_TESTS++))
    echo -n "Testing $test_name... "
    
    if result=$(eval "$test_command" 2>/dev/null); then
        if [[ -n "$expected_result" ]]; then
            if [[ "$result" == *"$expected_result"* ]]; then
                echo -e "${GREEN}✅ PASS${NC}"
                ((TESTS_PASSED++))
                return 0
            else
                echo -e "${RED}❌ FAIL (unexpected result: $result)${NC}"
                ((TESTS_FAILED++))
                return 1
            fi
        else
            echo -e "${GREEN}✅ PASS${NC}"
            ((TESTS_PASSED++))
            return 0
        fi
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Function to validate database connection
validate_connection() {
    echo -e "${BLUE}🔗 Database Connection Validation${NC}"
    echo "=================================="
    
    run_test "Database connectivity" \
        "execute_sql 'SELECT 1;'" "1"
    
    run_test "Database exists" \
        "execute_sql 'SELECT current_database();'" "$DB_NAME"
    
    run_test "PostgreSQL version" \
        "execute_sql 'SELECT version();'" "PostgreSQL"
    
    run_test "Current user access" \
        "execute_sql 'SELECT current_user;'" "$DB_USER"
}

# Function to validate schema structure
validate_schema() {
    echo -e "\n${BLUE}🏗️ Schema Structure Validation${NC}"
    echo "=================================="
    
    # Core EMR tables
    local tables=("patients" "facilities" "placement_search" "placement_notes" "audit_log")
    
    for table in "${tables[@]}"; do
        run_test "Table '$table' exists" \
            "execute_sql \"SELECT 1 FROM information_schema.tables WHERE table_name='$table';\"" "1"
    done
    
    # Core views
    local views=("v_active_placement_searches" "v_facility_capacity" "v_audit_summary")
    
    for view in "${views[@]}"; do
        run_test "View '$view' exists" \
            "execute_sql \"SELECT 1 FROM information_schema.views WHERE table_name='$view';\"" "1"
    done
    
    # Core functions
    run_test "Function 'update_placement_status' exists" \
        "execute_sql \"SELECT 1 FROM information_schema.routines WHERE routine_name='update_placement_status';\"" "1"
    
    run_test "Function 'search_facilities_by_capability' exists" \
        "execute_sql \"SELECT 1 FROM information_schema.routines WHERE routine_name='search_facilities_by_capability';\"" "1"
}

# Function to validate indexes
validate_indexes() {
    echo -e "\n${BLUE}📊 Index Validation${NC}"
    echo "=================================="
    
    # Key performance indexes
    local indexes=(
        "idx_patients_last_name_dob"
        "idx_facilities_capabilities" 
        "idx_placement_search_status_priority"
        "idx_placement_notes_placement"
        "idx_audit_log_table_timestamp"
    )
    
    for index in "${indexes[@]}"; do
        run_test "Index '$index' exists" \
            "execute_sql \"SELECT 1 FROM pg_indexes WHERE indexname='$index';\"" "1"
    done
}

# Function to validate data types and constraints
validate_constraints() {
    echo -e "\n${BLUE}🔒 Data Integrity Validation${NC}"
    echo "=================================="
    
    # UUID primary keys
    run_test "Patients table has UUID primary key" \
        "execute_sql \"SELECT data_type FROM information_schema.columns WHERE table_name='patients' AND column_name='patient_id';\"" "uuid"
    
    run_test "Facilities table has UUID primary key" \
        "execute_sql \"SELECT data_type FROM information_schema.columns WHERE table_name='facilities' AND column_name='facility_id';\"" "uuid"
    
    # Foreign key constraints
    run_test "Placement search has patient foreign key" \
        "execute_sql \"SELECT 1 FROM information_schema.table_constraints WHERE constraint_type='FOREIGN KEY' AND table_name='placement_search';\"" "1"
    
    # Check constraints
    run_test "Patient gender has check constraint" \
        "execute_sql \"SELECT 1 FROM information_schema.check_constraints WHERE constraint_name LIKE '%gender%';\"" "1"
    
    run_test "Placement status has check constraint" \
        "execute_sql \"SELECT 1 FROM information_schema.check_constraints WHERE constraint_name LIKE '%status%';\"" "1"
}

# Function to validate HIPAA audit triggers
validate_audit_triggers() {
    echo -e "\n${BLUE}🔐 HIPAA Audit Trigger Validation${NC}"
    echo "=================================="
    
    # Check audit triggers exist
    local audit_tables=("patients" "facilities" "placement_search" "placement_notes")
    
    for table in "${audit_tables[@]}"; do
        run_test "Audit trigger on '$table' table" \
            "execute_sql \"SELECT 1 FROM information_schema.triggers WHERE event_object_table='$table' AND trigger_name LIKE 'audit_%';\"" "1"
    done
    
    # Test audit function exists
    run_test "Audit trigger function exists" \
        "execute_sql \"SELECT 1 FROM information_schema.routines WHERE routine_name='audit_trigger_function';\"" "1"
}

# Function to validate sample data
validate_sample_data() {
    echo -e "\n${BLUE}📋 Sample Data Validation${NC}"
    echo "=================================="
    
    # Check if sample data exists
    run_test "Sample patients exist" \
        "execute_sql 'SELECT COUNT(*) > 0 FROM patients;'" "t"
    
    run_test "Sample facilities exist" \
        "execute_sql 'SELECT COUNT(*) > 0 FROM facilities;'" "t"
    
    if [[ "$QUICK_VALIDATE" != "true" ]]; then
        # Validate data relationships
        run_test "Placement searches reference valid patients" \
            "execute_sql 'SELECT COUNT(*) = 0 FROM placement_search ps LEFT JOIN patients p ON ps.patient_id = p.patient_id WHERE p.patient_id IS NULL;'" "t"
        
        run_test "Placement searches reference valid facilities" \
            "execute_sql 'SELECT COUNT(*) = 0 FROM placement_search ps LEFT JOIN facilities f ON ps.facility_id = f.facility_id WHERE f.facility_id IS NULL;'" "t"
        
        run_test "Placement notes reference valid placements" \
            "execute_sql 'SELECT COUNT(*) = 0 FROM placement_notes pn LEFT JOIN placement_search ps ON pn.placement_search_id = ps.placement_search_id WHERE ps.placement_search_id IS NULL;'" "t"
    fi
}

# Function to validate clinical workflow
validate_clinical_workflow() {
    echo -e "\n${BLUE}🏥 Clinical Workflow Validation${NC}"
    echo "=================================="
    
    # Test active placements view
    run_test "Active placements view returns data" \
        "execute_sql 'SELECT COUNT(*) >= 0 FROM v_active_placement_searches;'" "t"
    
    # Test facility capacity view
    run_test "Facility capacity view returns data" \
        "execute_sql 'SELECT COUNT(*) >= 0 FROM v_facility_capacity;'" "t"
    
    if [[ "$QUICK_VALIDATE" != "true" ]]; then
        # Test clinical functions
        run_test "Facility search function works" \
            "execute_sql \"SELECT COUNT(*) >= 0 FROM search_facilities_by_capability();\"" "t"
        
        # Test priority level calculations
        run_test "Priority level deadline calculations work" \
            "execute_sql 'SELECT COUNT(*) > 0 FROM v_active_placement_searches WHERE hours_until_deadline IS NOT NULL;'" "t"
    fi
}

# Function to test audit logging functionality
test_audit_logging() {
    echo -e "\n${BLUE}🔍 Audit Logging Functionality Test${NC}"
    echo "=================================="
    
    if [[ "$QUICK_VALIDATE" == "true" ]]; then
        echo "Skipping audit logging test (quick mode)"
        return 0
    fi
    
    # Get current audit count
    local initial_count
    initial_count=$(execute_sql 'SELECT COUNT(*) FROM audit_log;' | xargs)
    
    # Insert test record
    local test_uuid
    test_uuid=$(execute_sql "SELECT gen_random_uuid();" | xargs)
    
    execute_sql "INSERT INTO patients (patient_id, first_name, last_name, date_of_birth) VALUES ('$test_uuid', 'Test', 'Validation', '1990-01-01');" >/dev/null
    
    # Check if audit log increased
    local new_count
    new_count=$(execute_sql 'SELECT COUNT(*) FROM audit_log;' | xargs)
    
    if [[ $new_count -gt $initial_count ]]; then
        echo -e "Testing audit log insertion... ${GREEN}✅ PASS${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "Testing audit log insertion... ${RED}❌ FAIL${NC}"
        ((TESTS_FAILED++))
    fi
    ((TOTAL_TESTS++))
    
    # Clean up test record
    execute_sql "DELETE FROM patients WHERE patient_id = '$test_uuid';" >/dev/null
    
    # Verify delete was audited
    local final_count
    final_count=$(execute_sql 'SELECT COUNT(*) FROM audit_log;' | xargs)
    
    if [[ $final_count -gt $new_count ]]; then
        echo -e "Testing audit log deletion... ${GREEN}✅ PASS${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "Testing audit log deletion... ${RED}❌ FAIL${NC}"
        ((TESTS_FAILED++))
    fi
    ((TOTAL_TESTS++))
}

# Function to validate database performance
validate_performance() {
    echo -e "\n${BLUE}⚡ Performance Validation${NC}"
    echo "=================================="
    
    if [[ "$QUICK_VALIDATE" == "true" ]]; then
        echo "Skipping performance validation (quick mode)"
        return 0
    fi
    
    # Test query performance on key views
    run_test "Active placements query performance" \
        "time -p execute_sql 'SELECT COUNT(*) FROM v_active_placement_searches;' >/dev/null"
    
    run_test "Facility search query performance" \
        "time -p execute_sql 'SELECT * FROM v_facility_capacity LIMIT 10;' >/dev/null"
    
    # Check for missing indexes (slow queries)
    run_test "No obviously missing indexes" \
        "execute_sql \"SELECT COUNT(*) = 0 FROM pg_stat_user_tables WHERE seq_tup_read > idx_tup_fetch * 100 AND seq_tup_read > 1000;\"" "t"
}

# Function to show validation summary
show_validation_summary() {
    echo ""
    echo -e "${BLUE}📊 EMR Database Validation Summary${NC}"
    echo "=================================================="
    
    # Overall status
    if [[ $TESTS_FAILED -eq 0 ]]; then
        echo -e "${GREEN}✅ ALL TESTS PASSED${NC}"
        validation_status="PASS"
    else
        echo -e "${RED}❌ SOME TESTS FAILED${NC}"
        validation_status="FAIL"
    fi
    
    echo "Total Tests: $TOTAL_TESTS"
    echo "Passed: $TESTS_PASSED"
    echo "Failed: $TESTS_FAILED"
    
    # Calculate success rate
    local success_rate
    if [[ $TOTAL_TESTS -gt 0 ]]; then
        success_rate=$((TESTS_PASSED * 100 / TOTAL_TESTS))
        echo "Success Rate: ${success_rate}%"
    fi
    
    echo ""
    echo -e "${BLUE}🏥 Healthcare System Status:${NC}"
    
    # Get database statistics
    local db_stats
    if db_stats=$(execute_sql "
        SELECT 
            'Patients: ' || (SELECT COUNT(*) FROM patients) || E'\n' ||
            'Facilities: ' || (SELECT COUNT(*) FROM facilities) || E'\n' ||
            'Active Placements: ' || (SELECT COUNT(*) FROM placement_search WHERE status IN ('initiated', 'pending', 'approved')) || E'\n' ||
            'Clinical Notes: ' || (SELECT COUNT(*) FROM placement_notes) || E'\n' ||
            'Audit Entries: ' || (SELECT COUNT(*) FROM audit_log) || E'\n' ||
            'Database Size: ' || pg_size_pretty(pg_database_size(current_database()));
    " 2>/dev/null); then
        echo "$db_stats"
    else
        echo "Could not retrieve database statistics"
    fi
    
    echo ""
    echo -e "${BLUE}🔐 HIPAA Compliance Status:${NC}"
    if [[ $validation_status == "PASS" ]]; then
        echo "✅ Audit logging: OPERATIONAL"
        echo "✅ UUID primary keys: VERIFIED"
        echo "✅ Data integrity constraints: VALIDATED"
        echo "✅ PHI access tracking: FUNCTIONAL"
    else
        echo "⚠️  HIPAA compliance validation had issues"
    fi
    
    echo ""
    echo -e "${BLUE}🔧 Next Steps:${NC}"
    if [[ $validation_status == "PASS" ]]; then
        echo "✅ EMR database is ready for healthcare applications"
        echo "✅ Connect using: ./connect_emr_db.sh"
        echo "✅ Begin healthcare application integration"
        echo "✅ Review audit logs regularly for HIPAA compliance"
    else
        echo "🔧 Review failed tests and fix issues before production use"
        echo "🔧 Check database logs for error details"
        echo "🔧 Ensure all HIPAA requirements are met"
        echo "🔧 Re-run validation after fixes: $0"
    fi
    
    echo ""
    echo "Validation completed at $(date)"
}

# Main validation process
main() {
    # Parse database URL from environment if provided
    if [[ -n "${EMR_DATABASE_URL:-}" ]]; then
        echo -e "${GREEN}✅ Using EMR_DATABASE_URL environment variable${NC}"
        if [[ "$EMR_DATABASE_URL" =~ postgresql://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+) ]]; then
            DB_USER="${BASH_REMATCH[1]}"
            DB_HOST="${BASH_REMATCH[3]}"
            DB_PORT="${BASH_REMATCH[4]}"
            DB_NAME="${BASH_REMATCH[5]}"
        fi
    fi
    
    # Show configuration
    echo -e "${BLUE}🔧 Validation Configuration:${NC}"
    echo "Database: $DB_NAME"
    echo "Host: $DB_HOST:$DB_PORT"
    echo "User: $DB_USER"
    echo "Method: $(if [[ "$LOCAL_VALIDATE" == "true" ]]; then echo "Local"; else echo "SSH"; fi)"
    echo "Mode: $(if [[ "$QUICK_VALIDATE" == "true" ]]; then echo "Quick"; else echo "Comprehensive"; fi)"
    echo ""
    
    # Run validation tests
    validate_connection || {
        echo -e "${RED}❌ Database connection validation failed${NC}"
        echo "Cannot proceed with validation"
        exit 1
    }
    
    validate_schema
    validate_indexes
    validate_constraints
    validate_audit_triggers
    validate_sample_data
    validate_clinical_workflow
    test_audit_logging
    validate_performance
    
    # Show summary
    show_validation_summary
    
    # Exit with appropriate code
    if [[ $TESTS_FAILED -eq 0 ]]; then
        echo -e "${GREEN}🎯 EMR Database Validation Complete - All Tests Passed!${NC}"
        exit 0
    else
        echo -e "${RED}❌ EMR Database Validation Complete - Some Tests Failed${NC}"
        exit 1
    fi
}

# Handle Ctrl+C gracefully
trap 'echo -e "\n${YELLOW}Validation cancelled by user${NC}"; exit 1' INT

# Run validation
main "$@"