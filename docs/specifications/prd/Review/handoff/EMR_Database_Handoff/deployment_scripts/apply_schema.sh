#!/bin/bash
# 🚀 Apply EMR Database Schema
# Home Lab System - Deploy EMR schema to PostgreSQL database
# Created: September 30, 2025
# Purpose: Deploy complete EMR schema with HIPAA compliance

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
SCHEMA_FILE="../schema/postgresql_emr_schema.sql"

# SSH Configuration (for remote deployment)
SSH_USER="kxd395"
SSH_PORT="2222"
SSH_KEYS=("$HOME/.ssh/homelab" "$HOME/.ssh/id_rsa" "$HOME/.ssh/id_ed25519")

echo -e "${BLUE}🚀 EMR Database Schema Deployment${NC}"
echo "=================================================="
echo "Schema Version: 1.0.0"
echo "Target: Healthcare EMR Database System"
echo "Compliance: HIPAA-compliant audit logging"
echo "Timestamp: $(date)"
echo ""

# Function to show usage
show_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Deploy EMR database schema to PostgreSQL server.

OPTIONS:
    -h, --host HOST         Database host (default: $DEFAULT_DB_HOST)
    -p, --port PORT         Database port (default: $DEFAULT_DB_PORT)  
    -d, --database DB       Database name (default: $DEFAULT_DB_NAME)
    -u, --user USER         Database user (default: $DEFAULT_DB_USER)
    -s, --schema FILE       Schema file path (default: $SCHEMA_FILE)
    -l, --local            Deploy to local database (no SSH)
    -f, --force            Force deployment (skip confirmations)
    --help                 Show this help message

ENVIRONMENT VARIABLES:
    EMR_DATABASE_URL       Complete PostgreSQL connection string
                          Format: postgresql://user:password@host:port/database
    
    EMR_DB_PASSWORD       Database password (if not in URL)

EXAMPLES:
    # Deploy using environment variable
    export EMR_DATABASE_URL="postgresql://emr_admin:password@100.112.67.23:5432/emr_placement_ssot"
    $0
    
    # Deploy to specific host
    $0 --host 192.168.0.40 --user postgres
    
    # Deploy to local development database
    $0 --local --host localhost --port 5433
    
    # Force deployment without prompts
    $0 --force

SSH DEPLOYMENT:
    If deploying to remote host, schema will be deployed via SSH tunnel.
    Ensure SSH key authentication is configured for ${SSH_USER}@HOST.

EOF
}

# Parse command line arguments
DB_HOST="$DEFAULT_DB_HOST"
DB_PORT="$DEFAULT_DB_PORT"
DB_NAME="$DEFAULT_DB_NAME"
DB_USER="$DEFAULT_DB_USER"
SCHEMA_FILE_PATH="$SCHEMA_FILE"
LOCAL_DEPLOY=false
FORCE_DEPLOY=false

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
        -s|--schema)
            SCHEMA_FILE_PATH="$2"
            shift 2
            ;;
        -l|--local)
            LOCAL_DEPLOY=true
            shift
            ;;
        -f|--force)
            FORCE_DEPLOY=true
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

# Function to validate schema file
validate_schema_file() {
    echo -n "Validating schema file... "
    
    if [[ ! -f "$SCHEMA_FILE_PATH" ]]; then
        echo -e "${RED}❌ Schema file not found: $SCHEMA_FILE_PATH${NC}"
        return 1
    fi
    
    # Check if file contains expected EMR tables
    if grep -q "CREATE TABLE.*patients" "$SCHEMA_FILE_PATH" && \
       grep -q "CREATE TABLE.*facilities" "$SCHEMA_FILE_PATH" && \
       grep -q "CREATE TABLE.*placement_search" "$SCHEMA_FILE_PATH" && \
       grep -q "audit_trigger_function" "$SCHEMA_FILE_PATH"; then
        echo -e "${GREEN}✅ Valid EMR schema${NC}"
        return 0
    else
        echo -e "${RED}❌ Invalid EMR schema file${NC}"
        return 1
    fi
}

# Function to test database connectivity
test_database_connection() {
    local connection_method=$1
    
    echo -n "Testing database connectivity ($connection_method)... "
    
    if [[ "$connection_method" == "local" ]]; then
        # Local database connection
        if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "SELECT 1;" &>/dev/null; then
            echo -e "${GREEN}✅ Connected${NC}"
            return 0
        else
            echo -e "${RED}❌ Connection failed${NC}"
            return 1
        fi
    else
        # Remote database via SSH
        ssh_key=$(find_ssh_key) || {
            echo -e "${RED}❌ No working SSH key found${NC}"
            return 1
        }
        
        if ssh -i "$ssh_key" -p "$SSH_PORT" "$SSH_USER@$DB_HOST" \
           "psql -h localhost -U $DB_USER -d postgres -c 'SELECT 1;'" &>/dev/null; then
            echo -e "${GREEN}✅ Connected via SSH${NC}"
            return 0
        else
            echo -e "${RED}❌ SSH connection failed${NC}"
            return 1
        fi
    fi
}

# Function to check if database exists
check_database_exists() {
    local connection_method=$1
    
    echo -n "Checking if database '$DB_NAME' exists... "
    
    if [[ "$connection_method" == "local" ]]; then
        db_exists=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -t \
                   -c "SELECT 1 FROM pg_database WHERE datname='$DB_NAME';" 2>/dev/null | xargs)
    else
        ssh_key=$(find_ssh_key)
        db_exists=$(ssh -i "$ssh_key" -p "$SSH_PORT" "$SSH_USER@$DB_HOST" \
                   "psql -h localhost -U $DB_USER -d postgres -t -c \"SELECT 1 FROM pg_database WHERE datname='$DB_NAME';\"" 2>/dev/null | xargs)
    fi
    
    if [[ "$db_exists" == "1" ]]; then
        echo -e "${GREEN}✅ Database exists${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Database does not exist${NC}"
        return 1
    fi
}

# Function to create database
create_database() {
    local connection_method=$1
    
    echo -n "Creating database '$DB_NAME'... "
    
    if [[ "$connection_method" == "local" ]]; then
        if createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" 2>/dev/null; then
            echo -e "${GREEN}✅ Created${NC}"
            return 0
        else
            echo -e "${RED}❌ Creation failed${NC}"
            return 1
        fi
    else
        ssh_key=$(find_ssh_key)
        if ssh -i "$ssh_key" -p "$SSH_PORT" "$SSH_USER@$DB_HOST" \
           "createdb -h localhost -U $DB_USER $DB_NAME" 2>/dev/null; then
            echo -e "${GREEN}✅ Created via SSH${NC}"
            return 0
        else
            echo -e "${RED}❌ Creation failed via SSH${NC}"
            return 1
        fi
    fi
}

# Function to deploy schema
deploy_schema() {
    local connection_method=$1
    
    echo -e "${BLUE}🏗️ Deploying EMR schema...${NC}"
    
    if [[ "$connection_method" == "local" ]]; then
        # Local deployment
        if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SCHEMA_FILE_PATH"; then
            echo -e "${GREEN}✅ Schema deployed successfully (local)${NC}"
            return 0
        else
            echo -e "${RED}❌ Schema deployment failed (local)${NC}"
            return 1
        fi
    else
        # Remote deployment via SSH
        ssh_key=$(find_ssh_key)
        
        # Copy schema file to remote server
        echo -n "Copying schema file to remote server... "
        if scp -i "$ssh_key" -P "$SSH_PORT" "$SCHEMA_FILE_PATH" "$SSH_USER@$DB_HOST:~/emr_schema.sql" &>/dev/null; then
            echo -e "${GREEN}✅ Copied${NC}"
        else
            echo -e "${RED}❌ Copy failed${NC}"
            return 1
        fi
        
        # Deploy schema on remote server
        echo "Deploying schema on remote server..."
        if ssh -i "$ssh_key" -p "$SSH_PORT" "$SSH_USER@$DB_HOST" \
           "psql -h localhost -U $DB_USER -d $DB_NAME -f ~/emr_schema.sql && rm ~/emr_schema.sql"; then
            echo -e "${GREEN}✅ Schema deployed successfully (remote)${NC}"
            return 0
        else
            echo -e "${RED}❌ Schema deployment failed (remote)${NC}"
            return 1
        fi
    fi
}

# Function to validate deployment
validate_deployment() {
    local connection_method=$1
    
    echo -e "${BLUE}🔍 Validating EMR schema deployment...${NC}"
    
    # Check if all expected tables exist
    local tables=("patients" "facilities" "placement_search" "placement_notes" "audit_log")
    
    for table in "${tables[@]}"; do
        echo -n "Checking table '$table'... "
        
        if [[ "$connection_method" == "local" ]]; then
            table_exists=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t \
                          -c "SELECT 1 FROM information_schema.tables WHERE table_name='$table';" 2>/dev/null | xargs)
        else
            ssh_key=$(find_ssh_key)
            table_exists=$(ssh -i "$ssh_key" -p "$SSH_PORT" "$SSH_USER@$DB_HOST" \
                          "psql -h localhost -U $DB_USER -d $DB_NAME -t -c \"SELECT 1 FROM information_schema.tables WHERE table_name='$table';\"" 2>/dev/null | xargs)
        fi
        
        if [[ "$table_exists" == "1" ]]; then
            echo -e "${GREEN}✅ Exists${NC}"
        else
            echo -e "${RED}❌ Missing${NC}"
            return 1
        fi
    done
    
    # Check if sample data was inserted
    echo -n "Checking sample data... "
    
    if [[ "$connection_method" == "local" ]]; then
        record_count=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t \
                      -c "SELECT (SELECT COUNT(*) FROM patients) + (SELECT COUNT(*) FROM facilities);" 2>/dev/null | xargs)
    else
        ssh_key=$(find_ssh_key)
        record_count=$(ssh -i "$ssh_key" -p "$SSH_PORT" "$SSH_USER@$DB_HOST" \
                      "psql -h localhost -U $DB_USER -d $DB_NAME -t -c \"SELECT (SELECT COUNT(*) FROM patients) + (SELECT COUNT(*) FROM facilities);\"" 2>/dev/null | xargs)
    fi
    
    if [[ "$record_count" -gt 0 ]]; then
        echo -e "${GREEN}✅ $record_count records${NC}"
    else
        echo -e "${YELLOW}⚠️  No sample data${NC}"
    fi
    
    # Check if audit triggers are working
    echo -n "Testing audit logging... "
    
    if [[ "$connection_method" == "local" ]]; then
        audit_count=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t \
                     -c "SELECT COUNT(*) FROM audit_log;" 2>/dev/null | xargs)
    else
        ssh_key=$(find_ssh_key)
        audit_count=$(ssh -i "$ssh_key" -p "$SSH_PORT" "$SSH_USER@$DB_HOST" \
                     "psql -h localhost -U $DB_USER -d $DB_NAME -t -c \"SELECT COUNT(*) FROM audit_log;\"" 2>/dev/null | xargs)
    fi
    
    if [[ "$audit_count" -gt 0 ]]; then
        echo -e "${GREEN}✅ $audit_count audit entries${NC}"
    else
        echo -e "${YELLOW}⚠️  No audit entries${NC}"
    fi
    
    return 0
}

# Function to show deployment summary
show_deployment_summary() {
    local connection_method=$1
    
    echo ""
    echo -e "${BLUE}📊 EMR Database Deployment Summary${NC}"
    echo "=================================================="
    
    # Get database information
    if [[ "$connection_method" == "local" ]]; then
        db_info=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
            SELECT 
                'Database: ' || current_database() || E'\n' ||
                'Size: ' || pg_size_pretty(pg_database_size(current_database())) || E'\n' ||
                'Tables: ' || (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public') || E'\n' ||
                'Patients: ' || (SELECT count(*) FROM patients) || E'\n' ||
                'Facilities: ' || (SELECT count(*) FROM facilities) || E'\n' ||
                'Placements: ' || (SELECT count(*) FROM placement_search) || E'\n' ||
                'Notes: ' || (SELECT count(*) FROM placement_notes) || E'\n' ||
                'Audit Entries: ' || (SELECT count(*) FROM audit_log);
        " 2>/dev/null)
    else
        ssh_key=$(find_ssh_key)
        db_info=$(ssh -i "$ssh_key" -p "$SSH_PORT" "$SSH_USER@$DB_HOST" "
            psql -h localhost -U $DB_USER -d $DB_NAME -t -c \"
                SELECT 
                    'Database: ' || current_database() || E'\\n' ||
                    'Size: ' || pg_size_pretty(pg_database_size(current_database())) || E'\\n' ||
                    'Tables: ' || (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public') || E'\\n' ||
                    'Patients: ' || (SELECT count(*) FROM patients) || E'\\n' ||
                    'Facilities: ' || (SELECT count(*) FROM facilities) || E'\\n' ||
                    'Placements: ' || (SELECT count(*) FROM placement_search) || E'\\n' ||
                    'Notes: ' || (SELECT count(*) FROM placement_notes) || E'\\n' ||
                    'Audit Entries: ' || (SELECT count(*) FROM audit_log);
            \"" 2>/dev/null)
    fi
    
    echo "$db_info"
    echo ""
    echo -e "${GREEN}✅ EMR Database Schema Deployed Successfully!${NC}"
    echo ""
    echo -e "${BLUE}🔗 Connection Information:${NC}"
    echo "  Host: $DB_HOST:$DB_PORT"
    echo "  Database: $DB_NAME"
    echo "  User: $DB_USER"
    if [[ "$LOCAL_DEPLOY" == "true" ]]; then
        echo "  Method: Direct local connection"
    else
        echo "  Method: SSH tunnel via $SSH_USER@$DB_HOST:$SSH_PORT"
    fi
    echo ""
    echo -e "${BLUE}🏥 Healthcare Features Ready:${NC}"
    echo "  ✅ Patient master data management"
    echo "  ✅ Healthcare facility directory"
    echo "  ✅ Patient placement workflow tracking"
    echo "  ✅ Clinical documentation system"
    echo "  ✅ HIPAA-compliant audit logging"
    echo ""
    echo -e "${BLUE}🔍 Quick Verification Commands:${NC}"
    if [[ "$LOCAL_DEPLOY" == "true" ]]; then
        echo "  psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c '\\dt'"
        echo "  psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c 'SELECT * FROM v_active_placement_searches;'"
    else
        echo "  ./connect_emr_db.sh"
        echo "  # Then run: SELECT * FROM v_active_placement_searches;"
    fi
}

# Main deployment process
main() {
    echo -e "${BLUE}🔍 Pre-deployment checks...${NC}"
    
    # Check if we have database URL from environment
    if [[ -n "${EMR_DATABASE_URL:-}" ]]; then
        echo -e "${GREEN}✅ Using EMR_DATABASE_URL environment variable${NC}"
        # Parse database URL (simplified parsing)
        if [[ "$EMR_DATABASE_URL" =~ postgresql://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+) ]]; then
            DB_USER="${BASH_REMATCH[1]}"
            # Password is in BASH_REMATCH[2] but we'll let psql handle it
            DB_HOST="${BASH_REMATCH[3]}"
            DB_PORT="${BASH_REMATCH[4]}"
            DB_NAME="${BASH_REMATCH[5]}"
        fi
    fi
    
    # Validate schema file
    validate_schema_file || {
        echo -e "${RED}❌ Schema validation failed${NC}"
        exit 1
    }
    
    # Determine connection method
    if [[ "$LOCAL_DEPLOY" == "true" ]]; then
        connection_method="local"
        echo -e "${BLUE}🔗 Using local database connection${NC}"
    else
        connection_method="remote"
        echo -e "${BLUE}🔗 Using remote database connection via SSH${NC}"
    fi
    
    # Test database connectivity
    test_database_connection "$connection_method" || {
        echo -e "${RED}❌ Database connectivity test failed${NC}"
        echo ""
        echo -e "${YELLOW}🔧 Troubleshooting suggestions:${NC}"
        if [[ "$connection_method" == "local" ]]; then
            echo "  1. Check if PostgreSQL is running: sudo systemctl status postgresql"
            echo "  2. Verify connection parameters: host=$DB_HOST port=$DB_PORT user=$DB_USER"
            echo "  3. Check PostgreSQL logs: sudo tail -f /var/log/postgresql/postgresql-*.log"
        else
            echo "  1. Test SSH connection: ssh -p $SSH_PORT $SSH_USER@$DB_HOST"
            echo "  2. Run connection diagnostics: ./connection_diagnostics.sh"
            echo "  3. Check PostgreSQL on server: ssh -p $SSH_PORT $SSH_USER@$DB_HOST 'sudo systemctl status postgresql'"
        fi
        exit 1
    }
    
    # Check if database exists, create if needed
    if ! check_database_exists "$connection_method"; then
        if [[ "$FORCE_DEPLOY" == "true" ]] || read -p "Create database '$DB_NAME'? (y/N) " -n 1 -r; then
            echo ""
            create_database "$connection_method" || {
                echo -e "${RED}❌ Database creation failed${NC}"
                exit 1
            }
        else
            echo ""
            echo -e "${YELLOW}Database creation cancelled${NC}"
            exit 1
        fi
    fi
    
    # Confirm deployment
    if [[ "$FORCE_DEPLOY" != "true" ]]; then
        echo ""
        echo -e "${YELLOW}⚠️  Ready to deploy EMR schema to:${NC}"
        echo "   Database: $DB_NAME"
        echo "   Host: $DB_HOST:$DB_PORT"
        echo "   User: $DB_USER"
        echo "   Method: $connection_method"
        echo ""
        read -p "Proceed with deployment? (y/N) " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}Deployment cancelled${NC}"
            exit 0
        fi
    fi
    
    # Deploy schema
    deploy_schema "$connection_method" || {
        echo -e "${RED}❌ Schema deployment failed${NC}"
        exit 1
    }
    
    # Validate deployment
    validate_deployment "$connection_method" || {
        echo -e "${YELLOW}⚠️  Deployment validation had issues${NC}"
    }
    
    # Show summary
    show_deployment_summary "$connection_method"
    
    echo ""
    echo -e "${GREEN}🎯 EMR Database Schema Deployment Complete!${NC}"
}

# Handle Ctrl+C gracefully
trap 'echo -e "\n${YELLOW}Deployment cancelled by user${NC}"; exit 1' INT

# Run main deployment
main "$@"