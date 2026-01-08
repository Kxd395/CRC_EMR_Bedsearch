#!/bin/bash

# Local PostgreSQL Setup for CRC SSOT EMR
# This script creates a local database instance to replace the remote connection

echo "🏥 CRC SSOT EMR - Local Database Setup"
echo "===================================="

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "📦 Installing PostgreSQL..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS - use Homebrew
        if ! command -v brew &> /dev/null; then
            echo "❌ Homebrew not found. Please install Homebrew first:"
            echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
            exit 1
        fi
        brew install postgresql@16
        brew services start postgresql@16
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux - use apt
        sudo apt update
        sudo apt install -y postgresql-16 postgresql-client-16
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
    else
        echo "❌ Unsupported OS. Please install PostgreSQL manually."
        exit 1
    fi
else
    echo "✅ PostgreSQL found"
fi

# Start PostgreSQL service if not running
if [[ "$OSTYPE" == "darwin"* ]]; then
    brew services start postgresql@16 2>/dev/null
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    sudo systemctl start postgresql 2>/dev/null
fi

echo ""
echo "🔧 Setting up EMR database..."

# Create database user
echo "👤 Creating database user..."
sudo -u postgres psql -c "CREATE USER emr_admin WITH ENCRYPTED PASSWORD 'emr_secure_2024';" 2>/dev/null || echo "   User may already exist"

# Create database
echo "🗄️  Creating database..."
sudo -u postgres psql -c "CREATE DATABASE emr_crc_ssot OWNER emr_admin;" 2>/dev/null || echo "   Database may already exist"

# Grant permissions
echo "🔑 Setting permissions..."
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE emr_crc_ssot TO emr_admin;" 2>/dev/null

# Create tables
echo "📋 Creating tables..."
sudo -u postgres psql -d emr_crc_ssot -c "
-- Patients table
CREATE TABLE IF NOT EXISTS patients (
    id VARCHAR(255) PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assessments table
CREATE TABLE IF NOT EXISTS assessments (
    id VARCHAR(255) PRIMARY KEY,
    patient_id VARCHAR(255) REFERENCES patients(id),
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Placements table
CREATE TABLE IF NOT EXISTS placements (
    id VARCHAR(255) PRIMARY KEY,
    patient_id VARCHAR(255) REFERENCES patients(id),
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Grant permissions to tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO emr_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO emr_admin;
"

echo ""
echo "🧪 Testing database connection..."
PGPASSWORD=emr_secure_2024 psql -h localhost -p 5432 -U emr_admin -d emr_crc_ssot -c "SELECT version();" >/dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Database connection successful!"
    echo ""
    echo "📝 Updating .env file..."
    
    # Update .env file to use localhost
    if [ -f ".env" ]; then
        sed -i.backup 's/DB_HOST=100.112.67.23/DB_HOST=localhost/' .env
        echo "   Updated DB_HOST to localhost"
    else
        echo "⚠️  .env file not found in current directory"
    fi
    
    echo ""
    echo "🎉 SUCCESS! Local database setup complete"
    echo "========================================="
    echo "Database: emr_crc_ssot"
    echo "Host: localhost:5432"
    echo "User: emr_admin"
    echo "Password: emr_secure_2024"
    echo ""
    echo "🚀 Now restart your API server to use the local database:"
    echo "   kill \$(ps aux | grep 'node server.js' | grep -v grep | awk '{print \$2}')"
    echo "   nohup node server.js > server.log 2>&1 &"
    
else
    echo "❌ Database connection failed"
    echo "Please check PostgreSQL installation and try again"
    exit 1
fi