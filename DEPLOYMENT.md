# KC Voice Assistant Backend - Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying the KC Voice Assistant backend to Render and connecting it with the Vercel frontend.

## Prerequisites
- GitHub account with repository access
- Render account (free tier is sufficient)
- API keys for:
  - OpenAI API
  - Pinecone
  - ElevenLabs
  - Google Cloud (Service Account JSON)

## Environment Variables Required

The following environment variables must be configured in Render:

### Required API Keys
- `OPENAI_API_KEY`: Your OpenAI API key for GPT models
- `PINECONE_API_KEY`: Your Pinecone API key for vector database
- `ELEVENLABS_API_KEY`: Your ElevenLabs API key for voice synthesis
- `KC_VOICE_ID`: ElevenLabs voice ID for KC character

### Google Cloud Credentials
- `GOOGLE_CREDENTIALS`: Full JSON string of your service account credentials
  - Get this from your Google Cloud Console
  - Download the service account JSON file
  - Copy the entire JSON content as a string

### Optional Configuration
- `FRONTEND_URL`: Your Vercel frontend URL (e.g., https://your-app.vercel.app)
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Set to "production"

## Deployment Steps

### 1. Prepare Repository
```bash
# Ensure all changes are committed
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. Create Render Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: kc-voice-assistant-backend
   - **Region**: Oregon (US West)
   - **Branch**: main
   - **Runtime**: Node
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `node dist/server.js`
   - **Plan**: Free

### 3. Configure Environment Variables

In Render dashboard, go to your service → Environment:

1. Add each required environment variable
2. For `GOOGLE_CREDENTIALS`:
   - Copy your entire credentials.json content
   - Paste as a single-line JSON string
   - Example format: `{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}`

### 4. Deploy

1. Click "Manual Deploy" → "Deploy latest commit"
2. Monitor the build logs
3. Wait for "Live" status
4. Test the health endpoint: `https://your-service.onrender.com/health`

### 5. Update Frontend Configuration

In your Vercel frontend:

1. Go to Project Settings → Environment Variables
2. Add/Update: `NEXT_PUBLIC_API_URL` = `https://your-service.onrender.com`
3. Redeploy the frontend

## API Endpoints

Once deployed, your backend provides:

- `GET /health` - Health check
- `POST /api/voice/process` - Process voice input
- `POST /api/voice/translate` - Translate text
- `POST /api/knowledge/load` - Load knowledge documents
- `GET /api/knowledge/search` - Search knowledge base

## Troubleshooting

### Build Failures
- Check Node version compatibility (requires Node 18+)
- Verify all dependencies are in package.json
- Check TypeScript compilation errors

### Runtime Errors
- Verify all environment variables are set correctly
- Check Render logs for specific error messages
- Ensure Google credentials JSON is properly formatted

### CORS Issues
- Frontend URL must be added to allowed origins
- Check that credentials are included in frontend requests

### Memory Issues (Free Tier)
- Render free tier has 512MB RAM limit
- Consider optimizing imports and lazy loading
- Monitor memory usage in Render metrics

## Monitoring

- Use Render dashboard for logs and metrics
- Set up health check alerts
- Monitor API response times

## Local Testing

To test production build locally:
```bash
npm run build
NODE_ENV=production npm start
```

## Support

For issues specific to:
- Render deployment: Check Render documentation
- API integrations: Refer to respective service docs
- Application bugs: Check GitHub issues

## Security Notes

- Never commit `.env` file or credentials
- Rotate API keys regularly
- Use environment-specific keys for production
- Enable Render's auto-deploy only for stable branches