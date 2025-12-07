# Vercel Deployment Guide

## Important Notes

### PDF Features Disabled on Production

The following features are **only available in local development**:

- 📄 PDF Report (HTML Template) - Requires Puppeteer (too large for Vercel free plan)
- 📕 Word→PDF - Requires Microsoft Office (not available in serverless)
- 📝 Word Document - Requires docxtemplater and Word processing

These features exceed Vercel's free plan limits:

- Function size: 50MB limit (Puppeteer alone is ~300MB)
- Runtime: No Windows/Office support in serverless environment

### Production Features

Available on Vercel deployment:

- ✅ View all equipment
- ✅ Filter by equipment number, serial number, manufacturer, location
- ✅ Create new equipment
- ✅ Edit existing equipment
- ✅ Delete equipment
- ✅ Real-time data from Microsoft Dataverse

## Deployment Steps

### 1. Environment Variables

Add these in Vercel Dashboard → Project Settings → Environment Variables:

```
TENANT_ID=ea892f8a-fd9a-4e66-8244-74bf9533cbac
CLIENT_ID=de7f189f-71cb-4cb6-8565-5c21c4882b41
CLIENT_SECRET=<your-secret>
```

### 2. Deploy

```bash
vercel --prod
```

Or connect GitHub repo to Vercel for automatic deployments.

### 3. Testing

- Production URL: `https://indus-control.vercel.app`
- API Health: `https://indus-control.vercel.app/api/health`

## Local Development

To use PDF features, run locally:

```bash
# Backend (with PDF features)
cd backend
npm install
npm start

# Frontend
cd frontend
npm install
npm start
```

PDF buttons will appear only in development mode.

## Architecture

### Production (Vercel)

- Frontend: Static React build served by Vercel CDN
- Backend: Serverless functions in `/api` directory
- Database: Microsoft Dataverse (Power Apps)
- Auth: Azure AD with client credentials

### Local Development

- Frontend: React dev server (port 3000)
- Backend: Express server (port 5000) with full features
- PDF: Puppeteer, Word COM automation available
