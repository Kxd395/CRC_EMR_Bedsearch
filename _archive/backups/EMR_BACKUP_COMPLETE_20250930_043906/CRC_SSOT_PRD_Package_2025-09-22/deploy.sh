#!/bin/bash

# Quick Netlify Deployment Setup
# This script helps you deploy to Netlify with different configurations

echo "🌐 CRC SSOT Netlify Deployment Setup"
echo "===================================="

echo ""
echo "Choose your deployment option:"
echo "1) Static Demo (no backend, uses mock data)"
echo "2) Connect to existing database (requires backend deployment)"
echo "3) Full production setup (backend + database + frontend)"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
  1)
    echo "📦 Setting up Static Demo Deployment..."
    node prepare-netlify.js static
    echo ""
    echo "🎯 NETLIFY SETUP INSTRUCTIONS:"
    echo "1. Go to https://netlify.com and sign in"
    echo "2. Click 'New site from Git'"
    echo "3. Connect your GitHub repository"
    echo "4. Use these settings:"
    echo "   - Build command: npm run build"
    echo "   - Publish directory: dist"
    echo "   - Base directory: development/prototypes/ui_prototype"
    echo ""
    echo "✅ Your site will work with demo data (no database needed)"
    ;;
    
  2)
    echo "🔌 Setting up Database-Connected Deployment..."
    echo ""
    echo "First, you need to deploy your API. Choose a platform:"
    echo "a) Railway (recommended - easy PostgreSQL)"
    echo "b) Render (good free tier)"
    echo "c) Heroku (requires paid database)"
    echo ""
    read -p "Enter choice (a-c): " api_choice
    
    case $api_choice in
      a)
        echo "🚂 Railway Deployment Instructions:"
        echo "1. Go to https://railway.app and sign in"
        echo "2. Click 'New Project' > 'Deploy from GitHub repo'"
        echo "3. Select your repository"
        echo "4. Set start command: cd production/api && node server.js"
        echo "5. Add PostgreSQL database service"
        echo "6. Copy the API URL when deployed"
        ;;
      b)
        echo "🎨 Render Deployment Instructions:"
        echo "1. Go to https://render.com and sign in"
        echo "2. Create 'New Web Service'"
        echo "3. Connect GitHub repository"
        echo "4. Set build command: cd production/api && npm install"
        echo "5. Set start command: node server.js"
        echo "6. Add PostgreSQL database"
        ;;
      c)
        echo "🟣 Heroku Deployment Instructions:"
        echo "1. Install Heroku CLI"
        echo "2. Run: heroku create your-app-name"
        echo "3. Add PostgreSQL: heroku addons:create heroku-postgresql:mini"
        echo "4. Deploy: git push heroku main"
        ;;
    esac
    
    echo ""
    read -p "Enter your deployed API URL (e.g., https://your-app.railway.app): " api_url
    
    if [ ! -z "$api_url" ]; then
      NETLIFY_API_URL="$api_url" node prepare-netlify.js api
      echo ""
      echo "🎯 NETLIFY ENVIRONMENT VARIABLES:"
      echo "Set these in Netlify Dashboard > Site Settings > Environment Variables:"
      echo "VITE_API_URL = $api_url"
      echo "VITE_NODE_ENV = production"
    fi
    ;;
    
  3)
    echo "🚀 Full Production Setup..."
    echo "This option sets up everything from scratch."
    echo ""
    echo "📋 What you'll get:"
    echo "- Backend API deployed to Railway"
    echo "- PostgreSQL database in the cloud"
    echo "- Frontend deployed to Netlify"
    echo "- All 19 patients and 25 facilities"
    echo ""
    echo "⚠️  This requires accounts on Railway and Netlify"
    read -p "Continue? (y/n): " confirm
    
    if [ "$confirm" = "y" ]; then
      echo ""
      echo "📝 STEP 1: Deploy Backend to Railway"
      echo "1. Go to https://railway.app"
      echo "2. Create new project from GitHub"
      echo "3. Add PostgreSQL service"
      echo "4. Set these environment variables:"
      echo "   DATABASE_URL = (automatically set by Railway)"
      echo "   PORT = (automatically set by Railway)"
      echo ""
      echo "📝 STEP 2: Import Your Data"
      echo "1. Connect to Railway PostgreSQL"
      echo "2. Run your database setup scripts"
      echo "3. Import the 19 patients using import_all_patients.js"
      echo ""
      echo "📝 STEP 3: Deploy Frontend to Netlify"
      echo "1. Get your Railway API URL"
      echo "2. Run this script again with option 2"
      echo "3. Use your Railway URL as the API endpoint"
    fi
    ;;
    
  *)
    echo "❌ Invalid choice"
    exit 1
    ;;
esac

echo ""
echo "📖 For detailed instructions, see:"
echo "- NETLIFY_DEPLOYMENT.md"
echo "- .env.example for environment variables"