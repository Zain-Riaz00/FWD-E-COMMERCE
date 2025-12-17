# Quick Deployment Checklist

## Before You Deploy

- [ ] Code pushed to GitHub
- [ ] MongoDB Atlas database created and accessible
- [ ] Vercel account created
- [ ] Render account created

## Backend Deployment (Render)

1. **Create Web Service on Render**
   - [ ] Connect GitHub repository
   - [ ] Set Build Command: `npm install && npm run build:server`
   - [ ] Set Start Command: `npm run server:prod`

2. **Set Environment Variables**
   - [ ] `NODE_ENV=production`
   - [ ] `PORT=5000`
   - [ ] `MONGODB_URI=<your_connection_string>`
   - [ ] `JWT_SECRET=<random_secret>`
   - [ ] `EMAIL_USER=<your_email>`
   - [ ] `EMAIL_PASSWORD=<app_password>`
   - [ ] `FRONTEND_URL=<will_add_after_vercel>`

3. **Deploy**
   - [ ] Click "Create Web Service"
   - [ ] Wait for deployment
   - [ ] Note backend URL: `https://________.onrender.com`
   - [ ] Test: `https://________.onrender.com/api/health`

## Frontend Deployment (Vercel)

1. **Deploy via Vercel Dashboard**
   - [ ] Go to vercel.com/dashboard
   - [ ] Import GitHub repository
   - [ ] Framework: Vite
   - [ ] Build Command: `npm run build`
   - [ ] Output Directory: `dist`

2. **Set Environment Variables**
   - [ ] `VITE_API_URL=https://your-backend.onrender.com/api`

3. **Deploy**
   - [ ] Click "Deploy"
   - [ ] Wait for deployment
   - [ ] Note frontend URL: `https://________.vercel.app`

## Final Steps

- [ ] Update `FRONTEND_URL` in Render with your Vercel URL
- [ ] Redeploy backend on Render
- [ ] Test the deployed app
- [ ] Verify API calls work
- [ ] Test authentication
- [ ] Check MongoDB Atlas allows 0.0.0.0/0 in Network Access

## Test URLs

- Frontend: https://________.vercel.app
- Backend: https://________.onrender.com
- API Health: https://________.onrender.com/api/health

## Done! 🎉
