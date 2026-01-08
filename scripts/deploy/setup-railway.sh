# Railway Backend Deployment Configuration
# Use this to deploy your API server to Railway with your existing PostgreSQL database

# 1. CREATE RAILWAY PROJECT
echo "Creating Railway deployment configuration..."

# 2. RAILWAY CONFIGURATION
cat > railway.json << EOF
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd src/api && node server.js",
    "healthcheckPath": "/api/health"
  }
}
EOF

# 3. DOCKERFILE (optional - Railway can use this instead of nixpacks)
cat > Dockerfile << EOF
FROM node:18-alpine

# Set working directory  
WORKDIR /app

# Copy API files
COPY src/api/ ./

# Install dependencies
RUN npm install

# Expose port
EXPOSE \${PORT:-3001}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:\${PORT:-3001}/api/health || exit 1

# Start the server
CMD ["node", "server.js"]
EOF

# 4. ENVIRONMENT VARIABLES FOR RAILWAY
cat > railway-env.md << EOF
# Set these environment variables in Railway dashboard:

## Required:
- DATABASE_URL: Your PostgreSQL connection string
- PORT: (Railway sets this automatically)

## Example DATABASE_URL formats:
- Local: postgresql://emr_admin:password@localhost:5432/emr_crc_ssot  
- Cloud: postgresql://user:pass@host:5432/dbname?sslmode=require

## Optional:
- NODE_ENV: production
- LOG_LEVEL: info
EOF

echo "✅ Railway configuration files created!"
echo ""
echo "📋 Next steps:"
echo "1. Push these files to your GitHub repository"
echo "2. Go to https://railway.app and create new project"  
echo "3. Connect your GitHub repository"
echo "4. Set environment variables from railway-env.md"
echo "5. Deploy and get your API URL"
echo "6. Use that URL for Netlify frontend deployment"