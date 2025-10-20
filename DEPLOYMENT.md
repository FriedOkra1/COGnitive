# Deployment Guide

This guide covers deploying COGnitive to production using Vercel (frontend) and Railway (backend).

## Table of Contents

- [Prerequisites](#prerequisites)
- [Overview](#overview)
- [Backend Deployment (Railway)](#backend-deployment-railway)
- [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
- [Environment Variables](#environment-variables)
- [Post-Deployment](#post-deployment)
- [Alternative Hosting Options](#alternative-hosting-options)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Git repository hosted on GitHub, GitLab, or Bitbucket
- OpenAI API key with credits
- Accounts on:
  - [Railway](https://railway.app) (backend)
  - [Vercel](https://vercel.com) (frontend)

## Overview

### Architecture

```
Internet
    │
    ├─── Vercel (Frontend)
    │    ├── React/Vite SPA
    │    ├── Global CDN
    │    └── Auto-scaling
    │
    └─── Railway (Backend)
         ├── Express API Server
         ├── OpenAI Integration
         └── File Storage
```

### Why This Setup?

- **Vercel**: Optimized for React/Vite, free tier, global CDN, zero-config deployments
- **Railway**: Better for Node.js backends than Vercel serverless, includes persistent file storage

## Backend Deployment (Railway)

### Step 1: Sign Up & Create Project

1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose your COGnitive repository
6. Select the `backend` directory (if Railway doesn't auto-detect)

### Step 2: Configure Build Settings

Railway should auto-detect Node.js, but verify:

**Root Directory**: `/backend`

**Build Command**:
```bash
npm install && npm run build
```

**Start Command**:
```bash
npm start
```

The `railway.json` file in the backend directory provides these settings automatically.

### Step 3: Add Environment Variables

In Railway project settings, add these variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `OPENAI_API_KEY` | `sk-...` | Your OpenAI API key |
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `3001` | Server port (Railway will override) |
| `FRONTEND_URL` | (leave empty for now) | Add after deploying frontend |

**Important**: Railway automatically provides a `PORT` variable. Your app should use `process.env.PORT`.

### Step 4: Deploy

1. Click **"Deploy"**
2. Railway will:
   - Install dependencies
   - Build TypeScript
   - Start the server
3. Monitor logs for any errors

### Step 5: Get Backend URL

Once deployed:
1. Go to **Settings** → **Domains**
2. Click **"Generate Domain"**
3. Copy the URL (e.g., `https://your-app.railway.app`)
4. Save this for frontend configuration

### Step 6: Verify Deployment

Test your backend:

```bash
curl https://your-app.railway.app/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "COGnitive backend is running"
}
```

Visit API documentation:
```
https://your-app.railway.app/api/docs
```

## Frontend Deployment (Vercel)

### Step 1: Sign Up & Import Project

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **"Add New..."** → **"Project"**
4. Import your COGnitive repository
5. Vercel auto-detects Vite configuration

### Step 2: Configure Build Settings

**Framework Preset**: Vite
**Root Directory**: `frontend`
**Build Command**: `npm run build`
**Output Directory**: `dist`

The `vercel.json` file in the root directory provides these settings.

### Step 3: Add Environment Variables

In Vercel project settings → Environment Variables:

| Variable | Value | Example |
|----------|-------|---------|
| `VITE_API_URL` | Your Railway backend URL | `https://your-app.railway.app` |

**Important**: 
- Make sure there's no trailing slash
- This must be your Railway backend URL from Step 5 of backend deployment

### Step 4: Deploy

1. Click **"Deploy"**
2. Vercel will:
   - Install dependencies
   - Build the Vite app
   - Deploy to global CDN
3. Wait for deployment to complete (usually 1-2 minutes)

### Step 5: Get Frontend URL

Once deployed:
1. Vercel provides a URL like `https://your-app.vercel.app`
2. You can also add a custom domain in **Settings** → **Domains**

### Step 6: Update Backend CORS

Return to Railway and add the frontend URL:

1. Go to your Railway project
2. Add/update environment variable:
   - `FRONTEND_URL` = `https://your-app.vercel.app`
3. Redeploy the backend (Railway will auto-redeploy on env change)

## Environment Variables

### Backend Environment Variables

Create a `.env` file for local development (already in `.gitignore`):

```bash
# Required
OPENAI_API_KEY=sk-your-key-here

# Server Config
PORT=3001
NODE_ENV=development

# Production (add in Railway)
FRONTEND_URL=https://your-app.vercel.app
```

### Frontend Environment Variables

Create a `.env` file for local development:

```bash
# API Backend URL
VITE_API_URL=http://localhost:3001
```

For production, set in Vercel:
```bash
VITE_API_URL=https://your-backend.railway.app
```

## Post-Deployment

### Verify Full Integration

1. **Open your frontend URL** in a browser
2. **Test features**:
   - Lecture recording/upload
   - Chat with documents
   - YouTube analysis
   - Flashcard generation
3. **Check browser console** for errors
4. **Monitor Railway logs** for backend errors

### Set Up Custom Domains (Optional)

**Vercel** (Frontend):
1. Go to **Settings** → **Domains**
2. Add your domain (e.g., `cognitive.yourdomain.com`)
3. Update DNS records as instructed
4. Vercel automatically provisions SSL

**Railway** (Backend):
1. Go to **Settings** → **Domains**
2. Add custom domain (e.g., `api.yourdomain.com`)
3. Update DNS CNAME record
4. Railway provides automatic SSL

**Update Environment Variables**:
- Update `VITE_API_URL` in Vercel with new backend domain
- Update `FRONTEND_URL` in Railway with new frontend domain

### Enable Monitoring

**Railway**:
- Built-in metrics available in dashboard
- Consider adding external monitoring (e.g., Sentry, LogRocket)

**Vercel**:
- Analytics available in dashboard
- Uptime monitoring included

### Set Up Alerts

Configure alerts for:
- Backend downtime
- High error rates
- OpenAI API quota warnings
- Disk space usage (Railway)

## Alternative Hosting Options

### Backend Alternatives

**1. Render**
- Similar to Railway
- Free tier available
- [render.com](https://render.com)

**2. Fly.io**
- Global edge deployment
- [fly.io](https://fly.io)

**3. DigitalOcean App Platform**
- Simple deployment
- [digitalocean.com](https://www.digitalocean.com/products/app-platform)

**4. AWS (Advanced)**
- Elastic Beanstalk or ECS
- More configuration required
- Better for large scale

### Frontend Alternatives

**1. Netlify**
- Similar to Vercel
- [netlify.com](https://www.netlify.com)

**2. Cloudflare Pages**
- Free with generous limits
- [pages.cloudflare.com](https://pages.cloudflare.com)

**3. AWS S3 + CloudFront**
- More manual setup
- Very cost-effective at scale

## Troubleshooting

### Backend Issues

**Problem**: Backend won't start
```
Solution:
1. Check Railway logs for errors
2. Verify environment variables are set
3. Ensure OPENAI_API_KEY is valid
4. Check build logs for TypeScript errors
```

**Problem**: File uploads fail
```
Solution:
1. Railway has disk space limits
2. Implement automatic cleanup in code
3. Consider using S3 for file storage
4. Check Railway volume settings
```

**Problem**: API timeout errors
```
Solution:
1. Railway may have timeout limits
2. Optimize long-running operations
3. Implement job queues for long tasks
4. Consider upgrading Railway plan
```

### Frontend Issues

**Problem**: Can't connect to backend
```
Solution:
1. Verify VITE_API_URL is correct (no trailing slash)
2. Check CORS settings in backend
3. Ensure FRONTEND_URL is set in Railway
4. Check browser console for CORS errors
```

**Problem**: Environment variables not working
```
Solution:
1. Redeploy after adding variables
2. Variables must start with VITE_ for Vite
3. Check Vercel deployment logs
4. Try hard refresh (Ctrl+Shift+R)
```

**Problem**: Build fails
```
Solution:
1. Check Vercel build logs
2. Ensure all dependencies are in package.json
3. Verify TypeScript compiles locally
4. Check for import errors
```

### OpenAI API Issues

**Problem**: API key errors
```
Solution:
1. Verify key is correctly set in Railway
2. Check OpenAI dashboard for key status
3. Ensure key has sufficient credits
4. Check for rate limit errors
```

**Problem**: Slow transcription
```
Solution:
1. This is normal for large files
2. Whisper API can take time
3. Consider implementing progress indicators
4. Optimize audio chunking
```

### General Debugging

**Check Backend Logs**:
```bash
# Railway CLI (install first: npm i -g @railway/cli)
railway logs
```

**Check Frontend Logs**:
- Browser Developer Console (F12)
- Network tab for failed requests
- Vercel deployment logs

**Test Backend Locally**:
```bash
cd backend
npm run dev
# Test with frontend pointing to localhost
```

**Test Frontend Locally**:
```bash
cd frontend
VITE_API_URL=https://your-backend.railway.app npm run dev
# Test with production backend
```

## Security Best Practices

### Production Checklist

- [ ] Use HTTPS for all connections (automatic with Vercel/Railway)
- [ ] Never commit `.env` files
- [ ] Rotate OpenAI API keys periodically
- [ ] Set up rate limiting (consider adding express-rate-limit)
- [ ] Enable CORS only for your frontend domain
- [ ] Monitor API usage and costs
- [ ] Set up error tracking (Sentry recommended)
- [ ] Implement request validation
- [ ] Add authentication if storing user data
- [ ] Regular dependency updates (`npm audit fix`)

## Cost Estimates

### Vercel (Frontend)
- **Hobby Plan**: Free
  - 100GB bandwidth
  - Unlimited deployments
  - Automatic SSL

- **Pro Plan**: $20/month (if needed)
  - More bandwidth
  - Analytics
  - Team features

### Railway (Backend)
- **Starter Plan**: $5/month
  - Includes $5 credit
  - Pay for usage beyond credit
  - ~50-100 hours runtime

- **Developer Plan**: $10/month
  - Includes $10 credit
  - Priority support

### OpenAI API
- **GPT-4o-mini**: ~$0.15 per 1M input tokens
- **Whisper**: $0.006 per minute of audio
- Estimate: $10-50/month depending on usage

**Total Estimate**: $15-80/month for production deployment

## Maintenance

### Regular Tasks

**Weekly**:
- Monitor error logs
- Check API usage and costs
- Review application performance

**Monthly**:
- Update dependencies
- Review and rotate API keys
- Check disk space usage (Railway)
- Analyze user feedback

**Quarterly**:
- Security audit
- Performance optimization
- Feature prioritization

## Getting Help

- **Railway Support**: [docs.railway.app](https://docs.railway.app)
- **Vercel Support**: [vercel.com/docs](https://vercel.com/docs)
- **Project Issues**: GitHub Issues for this repo

---

## Quick Reference

### Deploy Commands

**Backend** (Railway auto-deploys from Git):
```bash
git push origin main
```

**Frontend** (Vercel auto-deploys from Git):
```bash
git push origin main
```

### Useful Links

- Railway Dashboard: https://railway.app/dashboard
- Vercel Dashboard: https://vercel.com/dashboard
- OpenAI Usage: https://platform.openai.com/usage
- API Docs (Production): https://your-backend.railway.app/api/docs

---

Congratulations! Your COGnitive app is now deployed! 🚀

