# Deployment Guide: E-Commerce Project

This guide will walk you through deploying your e-commerce application with the **frontend on Vercel** and the **backend on Render**.

## 📋 Prerequisites

- GitHub account
- Vercel account (sign up at https://vercel.com)
- Render account (sign up at https://render.com)
- MongoDB Atlas account with a database set up
- Your code pushed to a GitHub repository

---

## 🚀 Part 1: Deploy Backend to Render

### Step 1: Prepare Your Repository
1. Make sure all changes are committed and pushed to GitHub:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

### Step 2: Create a New Web Service on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `ecom-fwd-backend` (or your preferred name)
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: Leave empty (uses root)
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build:server`
   - **Start Command**: `npm run server:prod`
   - **Plan**: Free (or choose paid for better performance)

### Step 3: Set Environment Variables on Render

In the Render dashboard for your service, go to **Environment** and add:

| Variable Name | Value |
|--------------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A secure random string (use: `openssl rand -base64 32`) |
| `EMAIL_USER` | Your email address (for notifications) |
| `EMAIL_PASSWORD` | Your email app password |
| `FRONTEND_URL` | `https://your-app.vercel.app` (update after Vercel deployment) |

### Step 4: Deploy Backend

1. Click **"Create Web Service"**
2. Wait for the deployment to complete (5-10 minutes)
3. Note your backend URL: `https://ecom-fwd-backend.onrender.com`
4. Test the health endpoint: `https://your-backend-url.onrender.com/api/health`

---

## 🌐 Part 2: Deploy Frontend to Vercel

### Step 1: Create Environment Variable File

1. In your local project, create a `.env` file in the root directory:
   ```bash
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```
   Replace `your-backend-url` with your actual Render backend URL.

2. Make sure `.env` is in your `.gitignore` (it should already be there)

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

1. Install Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```
   - Follow the prompts
   - Choose your project name
   - Link to existing project or create new one
   - Accept the default settings

4. Set environment variables:
   ```bash
   vercel env add VITE_API_URL production
   ```
   Enter your backend URL when prompted: `https://your-backend-url.onrender.com/api`

5. Deploy to production:
   ```bash
   vercel --prod
   ```

#### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add Environment Variables:
   - Click **"Environment Variables"**
   - Add: `VITE_API_URL` = `https://your-backend-url.onrender.com/api`

6. Click **"Deploy"**

### Step 3: Update Backend CORS Settings

1. Go back to your Render dashboard
2. Update the `FRONTEND_URL` environment variable with your Vercel URL:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
3. Redeploy the backend service (click "Manual Deploy" → "Deploy latest commit")

---

## ✅ Post-Deployment Checklist

### Test Your Deployment

1. **Frontend**: Visit your Vercel URL
   - Check if the homepage loads
   - Try navigating between pages
   
2. **Backend**: Test API endpoints
   ```bash
   curl https://your-backend-url.onrender.com/api/health
   ```

3. **Integration**: Test frontend → backend communication
   - Try loading products
   - Test authentication (sign up/login)
   - Test any API-dependent features

### MongoDB Atlas Network Access

1. Go to your MongoDB Atlas dashboard
2. Navigate to **Network Access**
3. Add IP address: `0.0.0.0/0` (allows all IPs - required for Render)
   - Note: This is standard for serverless deployments
   - Your connection is still secured by credentials

### Common Issues & Solutions

#### Backend Issues

**Issue**: Backend deployment fails
- Check build logs in Render dashboard
- Verify all environment variables are set
- Ensure MongoDB connection string is correct

**Issue**: "Cannot connect to database"
- Verify MongoDB Atlas allows connections from 0.0.0.0/0
- Check MONGODB_URI format: `mongodb+srv://username:password@cluster.mongodb.net/database`

**Issue**: "Health check failed"
- Wait a few minutes - cold starts can be slow on free tier
- Check the logs for errors

#### Frontend Issues

**Issue**: "Failed to fetch" or API errors
- Verify VITE_API_URL is correct in Vercel environment variables
- Check browser console for CORS errors
- Ensure backend FRONTEND_URL matches your Vercel domain

**Issue**: Blank page after deployment
- Check Vercel deployment logs
- Verify build completed successfully
- Check browser console for errors

#### CORS Issues

**Issue**: "Blocked by CORS policy"
- Verify FRONTEND_URL is set correctly in Render
- Make sure your Vercel URL (including https://) is in the allowed origins
- Redeploy backend after updating FRONTEND_URL

---

## 🔄 Continuous Deployment

### Automatic Deployments

Both Vercel and Render support automatic deployments:

- **Vercel**: Automatically deploys on every push to your main branch
- **Render**: Automatically deploys on every push to your main branch

### Manual Deployments

**Vercel**:
```bash
vercel --prod
```

**Render**:
- Go to your service dashboard
- Click "Manual Deploy" → "Deploy latest commit"

---

## 📊 Monitoring

### Vercel Analytics
- Available in Vercel dashboard
- Shows page views, performance metrics

### Render Logs
- Access logs from Render dashboard
- Monitor server health and errors
- Check resource usage

---

## 🔒 Security Recommendations

1. **Never commit `.env` files** to version control
2. **Use strong JWT secrets** (at least 32 characters)
3. **Rotate secrets periodically**
4. **Monitor logs** for suspicious activity
5. **Keep dependencies updated**:
   ```bash
   npm audit
   npm audit fix
   ```

---

## 📈 Scaling (When Needed)

### Render
- Upgrade from Free to Starter/Standard for:
  - No cold starts
  - More CPU/RAM
  - Better performance

### Vercel
- Free tier is generous
- Pro tier adds:
  - More team features
  - Better analytics
  - Priority support

---

## 🆘 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com

---

## 🎉 Your Deployment URLs

Once deployed, save these for reference:

- **Frontend (Vercel)**: `https://your-app.vercel.app`
- **Backend (Render)**: `https://your-backend.onrender.com`
- **Backend API**: `https://your-backend.onrender.com/api`
- **Health Check**: `https://your-backend.onrender.com/api/health`

---

## Quick Deploy Commands

```bash
# Deploy frontend to Vercel
vercel --prod

# Check backend logs (if using Render CLI)
render logs -s your-service-id

# Test backend health
curl https://your-backend.onrender.com/api/health

# Test with authentication
curl -X POST https://your-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass"}'
```

---

Good luck with your deployment! 🚀
