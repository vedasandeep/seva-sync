# Deployment Setup Guide

Complete step-by-step guide to deploying SevaSync to production using Render (backend) and Vercel (frontend).

---

## 🎯 Deployment Overview

**Architecture**:
```
┌─────────────────────────────────────────────────────────┐
│                    Client Browser                       │
│  Dashboard: sevasync-dashboard.vercel.app              │
│  PWA: sevasync-pwa.vercel.app                          │
└────────────┬─────────────────────────────────┬─────────┘
             │ HTTPS                           │ HTTPS
             └──────────────┬──────────────────┘
                            │
                  ┌─────────▼─────────┐
                  │  Render Backend   │
                  │  API + WebSocket  │
                  │ sevasync-api      │
                  │ .render.com       │
                  └──────────┬────────┘
                             │
                  ┌──────────▼──────────┐
                  │ Render PostgreSQL   │
                  │ Production Database │
                  └─────────────────────┘
```

---

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ GitHub account with SevaSync repo
- ✅ Render account (https://render.com)
- ✅ Vercel account (https://vercel.com)
- ✅ Backend and frontend code ready to deploy
- ✅ All environment variables documented

---

## Phase 1: Prepare Environment Files

### Step 1.1: Backend Production Environment

Create `backend/.env.production`:

```bash
# Copy template
cp backend/.env.production.example backend/.env.production

# Edit with your values
# Key sections:
# - DATABASE_URL (from Render PostgreSQL)
# - ACCESS_TOKEN_SECRET (generate: openssl rand -base64 32)
# - REFRESH_TOKEN_SECRET (generate: openssl rand -base64 32)
# - ENCRYPTION_KEY (generate: openssl rand -hex 32)
# - BASE_URL (your Render backend URL)
# - ALLOWED_ORIGINS (your Vercel frontend URLs)
```

**Important**: Do NOT commit `.env.production` to Git (it contains secrets!)

### Step 1.2: Frontend Environment Files

Create for Dashboard:
```bash
cp frontend-dashboard/.env.production.example frontend-dashboard/.env.production.local
# Edit with Render backend URL
```

Create for PWA:
```bash
cp frontend-pwa/.env.production.example frontend-pwa/.env.production.local
# Edit with Render backend URL
```

### Step 1.3: Validate Environment Variables

```bash
cd backend
npm run validate:env

# Expected output:
# ✅ All required variables are valid!
```

---

## Phase 2: Deploy Backend to Render

### Step 2.1: Create Render PostgreSQL Database

1. Go to https://render.com
2. Click "New+" in top right
3. Select "PostgreSQL"
4. Configure:
   - **Name**: sevasync
   - **Database**: sevasync
   - **User**: sevasync_user
   - **Region**: (choose closest to your location)
   - **Version**: 15
   - **Instance Type**: Free (for demo) or Starter Plus (production)
5. Click "Create Database"
6. Wait for database to be ready (1-2 minutes)
7. Copy the connection string (looks like: `postgresql://user:password@host:5432/sevasync`)
8. Save this for later (needed for backend environment variables)

**Note**: Free tier expires after 30 days; upgrade if using for real deployment.

### Step 2.2: Create Render Backend Service

1. Go to https://render.com/dashboard
2. Click "New+" → "Web Service"
3. Select "Deploy an existing repository"
4. Choose your GitHub repository (SevaSync)
5. Configure:
   - **Name**: sevasync-api
   - **Region**: (same as PostgreSQL)
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (for demo) or Starter Plus (production)
6. Click "Create Web Service"

### Step 2.3: Configure Environment Variables on Render

In Render dashboard, go to your service → Environment:

Add these variables:

```
DATABASE_URL: postgresql://user:password@host:5432/sevasync
NODE_ENV: production
PORT: 10000
BASE_URL: https://sevasync-api.render.com  # (Render will assign actual URL)
ACCESS_TOKEN_SECRET: [generate: openssl rand -base64 32]
REFRESH_TOKEN_SECRET: [generate: openssl rand -base64 32]
ENCRYPTION_KEY: [generate: openssl rand -hex 32]
ALLOWED_ORIGINS: https://sevasync-dashboard.vercel.app,https://sevasync-pwa.vercel.app
LOG_LEVEL: info
RESEND_API_KEY: [if using email service]
```

### Step 2.4: Run Migrations and Seed Data

Once service is deployed:

1. Open Render dashboard → sevasync-api → Shell
2. Run migrations:
   ```bash
   npm run prisma:migrate -- --name init
   ```
3. Seed demo data:
   ```bash
   npm run prisma:seed
   ```
4. Verify output shows created records

### Step 2.5: Verify Backend Deployment

Test the health endpoint:

```bash
curl https://sevasync-api.render.com/health

# Expected response:
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-04-22T12:00:00Z",
  "uptime": 45.123,
  "memory": "85.2%"
}
```

Save your backend URL: `https://sevasync-api.render.com`

---

## Phase 3: Deploy Frontends to Vercel

### Step 3.1: Deploy Dashboard

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Project Name**: sevasync-dashboard
   - **Framework**: Vite
   - **Root Directory**: `frontend-dashboard`
   - **Build Command**: `npm run build` (should auto-detect)
   - **Output Directory**: `dist`
5. Click "Deploy"
6. Wait for deployment (2-5 minutes)
7. Save the URL (format: `sevasync-dashboard.vercel.app`)

### Step 3.2: Set Dashboard Environment Variables

1. In Vercel dashboard → sevasync-dashboard → Settings → Environment Variables
2. Add:
   ```
   VITE_API_URL: https://sevasync-api.render.com
   VITE_SOCKET_URL: https://sevasync-api.render.com
   ```
3. Redeploy to apply variables

### Step 3.3: Deploy PWA

1. Go to Vercel dashboard
2. Click "Add New" → "Project"
3. Import same GitHub repository
4. Configure:
   - **Project Name**: sevasync-pwa
   - **Framework**: Vite
   - **Root Directory**: `frontend-pwa`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click "Deploy"
6. Save the URL (format: `sevasync-pwa.vercel.app`)

### Step 3.4: Set PWA Environment Variables

1. In Vercel dashboard → sevasync-pwa → Settings → Environment Variables
2. Add:
   ```
   VITE_API_URL: https://sevasync-api.render.com
   VITE_SOCKET_URL: https://sevasync-api.render.com
   VITE_ENABLE_SERVICE_WORKER: true
   VITE_ENABLE_OFFLINE_SYNC: true
   ```
3. Redeploy

### Step 3.5: Update Backend CORS

Back in Render dashboard → sevasync-api → Environment Variables:

Update `ALLOWED_ORIGINS`:
```
ALLOWED_ORIGINS: https://sevasync-dashboard.vercel.app,https://sevasync-pwa.vercel.app,http://localhost:5173,http://localhost:5174
```

Click "Save" and service will auto-redeploy.

---

## Phase 4: Verification Checklist

✅ **Backend**:
- [ ] Health endpoint responds (https://sevasync-api.render.com/health)
- [ ] Metrics endpoint works (https://sevasync-api.render.com/metrics)
- [ ] Database connected and seeded
- [ ] No errors in Render logs

✅ **Dashboard**:
- [ ] Loads at https://sevasync-dashboard.vercel.app
- [ ] Can login with test credentials
- [ ] API calls work (check DevTools Network tab)
- [ ] Real-time updates work (check WebSocket connection)

✅ **PWA**:
- [ ] Loads at https://sevasync-pwa.vercel.app
- [ ] Works on mobile (open in mobile browser)
- [ ] Can login as volunteer
- [ ] Offline mode works (DevTools → Network → Offline)

✅ **End-to-End**:
- [ ] Create disaster on dashboard
- [ ] See it appear on PWA
- [ ] Assign volunteer
- [ ] See real-time updates
- [ ] Test offline sync

---

## Troubleshooting

### Backend Won't Deploy

**Problem**: Build fails or service crashes

**Solutions**:
1. Check Render logs: Dashboard → sevasync-api → Logs
2. Verify environment variables are set
3. Ensure migrations run successfully
4. Check Node version compatibility

### CORS Error: "No 'Access-Control-Allow-Origin' header"

**Problem**: Frontend can't call backend API

**Solutions**:
1. Verify ALLOWED_ORIGINS on backend includes your Vercel URL
2. Check that frontend VITE_API_URL matches backend BASE_URL
3. Redeploy backend after changing CORS
4. Wait 1-2 minutes for changes to propagate

### "Free tier PostgreSQL expired"

**Problem**: Database no longer available after 30 days

**Solutions**:
1. Upgrade to Starter Plus tier on Render
2. Or migrate to AWS RDS / managed service
3. Keep a backup of important data

### WebSocket Not Connecting

**Problem**: Real-time updates don't work

**Solutions**:
1. Verify Socket.io is installed and configured
2. Check VITE_SOCKET_URL matches API URL
3. Ensure WebSocket is not blocked by firewall
4. Check browser console for connection errors

---

## Production Best Practices

### Database

- ✅ Enable automated backups (daily minimum)
- ✅ Use strong passwords (20+ characters)
- ✅ Monitor connection pool health
- ✅ Regular maintenance (analyze, vacuum)

### Security

- ✅ Rotate JWT secrets quarterly
- ✅ Monitor access logs for suspicious activity
- ✅ Enable HTTPS only (no HTTP)
- ✅ Regular security audits
- ✅ Keep dependencies updated

### Monitoring

- ✅ Enable error tracking (Sentry)
- ✅ Monitor API response times
- ✅ Track database performance
- ✅ Alert on high error rates
- ✅ Review logs weekly

### Scaling

When you outgrow free tier:

**Backend**:
- Upgrade Render instance type (more CPU/RAM)
- Add horizontal scaling with load balancer
- Consider Kubernetes for large scale

**Database**:
- Move to managed service (AWS RDS, Render Starter Plus)
- Enable read replicas for reporting
- Implement database caching (Redis)

**Frontend**:
- Vercel handles scaling automatically
- Monitor build times and optimize
- Use CDN edge caching

---

## Redeployment Process

**When you make code changes**:

1. Commit and push to main branch on GitHub
2. Render automatically redeploys backend
3. Vercel automatically redeploys frontends
4. Changes live in 2-5 minutes

**To manually trigger redeploy**:

**Render**: Dashboard → sevasync-api → Manual Deploy → Deploy Latest Commit

**Vercel**: Dashboard → sevasync-dashboard → Deployments → Redeploy

---

## Rollback Procedure

If deployment breaks production:

**Render**:
1. Dashboard → sevasync-api → Deployments
2. Find last known good deployment
3. Click "Redeploy"
4. Service reverts to previous version

**Vercel**:
1. Dashboard → sevasync-dashboard → Deployments
2. Find last good deployment
3. Click "..." → "Promote to Production"

---

## Monitoring & Support

**Render Logs**:
- Dashboard → Service → Logs (last 100 lines)
- Real-time streaming of service logs

**Vercel Logs**:
- Dashboard → Project → Deployments → Logs
- Build logs and runtime logs

**Database Issues**:
- Render PostgreSQL → Logs
- Monitor query performance
- Check connection count

---

## Next Steps

After successful deployment:

1. ✅ Run full QA checklist
2. ✅ Create demo fallback (videos + screenshots)
3. ✅ Prepare presentation slides
4. ✅ Create viva Q&A bank
5. ✅ Finalize README with URLs
6. ✅ Full end-to-end demo rehearsal

---

**Status**: ✅ Deployment guide complete  
**Last Updated**: April 22, 2026  
**Version**: 1.0.0
