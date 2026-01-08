# CRC SSOT Netlify Deployment Guide

## Overview
This guide covers deploying the CRC SSOT system with Netlify for the frontend and a separate service for the backend API.

## Architecture Options

### Option 1: Static Frontend + External API (Recommended)
- **Frontend**: Netlify (static hosting)
- **Backend**: Railway/Render/Heroku (Node.js API)
- **Database**: Your existing PostgreSQL or cloud database

### Option 2: Full Static with Mock Data
- **Frontend**: Netlify (static hosting)
- **Backend**: None (uses static data files)
- **Database**: JSON files in the repository

## Option 1: Production Deployment

### Step 1: Prepare the Backend for Cloud Deployment

Your backend needs to be deployed to a service that supports Node.js and PostgreSQL:

**Recommended Services:**
- **Railway** (easiest PostgreSQL integration)
- **Render** (good free tier with PostgreSQL)
- **Heroku** (requires paid PostgreSQL add-on)

### Step 2: Configure Environment Variables

Create production environment configuration:

```bash
# Production API URL (replace with your deployed API)
VITE_API_URL=https://your-api-domain.railway.app
VITE_NODE_ENV=production
```

### Step 3: Update Frontend Configuration

The frontend needs to point to your cloud API instead of localhost:3001.

### Step 4: Deploy to Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

## Option 2: Static-Only Deployment

If you want to deploy just the frontend as a demo without the backend:

### Benefits:
- ✅ Simple deployment
- ✅ No server costs
- ✅ Fast loading
- ✅ Works with existing Netlify setup

### Limitations:
- ❌ No data persistence
- ❌ Uses mock data only
- ❌ No database integration

## Current Netlify Configuration

The project already has `netlify.toml` configured:
- Build command: `npm run build`
- Publish directory: `dist`
- SPA routing handled with redirects

## Database Options for Production

### Your Existing Database
If you want to keep using your local PostgreSQL:
- Use a tunneling service (ngrok, Railway tunnel)
- Expose database securely to the internet

### Cloud Database Options
- **Railway PostgreSQL** (free tier available)
- **Supabase** (PostgreSQL with REST API)
- **PlanetScale** (MySQL-compatible)
- **Neon** (serverless PostgreSQL)

## Next Steps

Would you like me to:
1. ✅ Set up the frontend for static deployment with mock data?
2. ✅ Configure the frontend to work with a cloud API service?
3. ✅ Help you deploy the backend to Railway/Render?
4. ✅ Set up a cloud database connection?

Let me know which approach you prefer!