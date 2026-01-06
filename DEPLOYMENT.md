# 🚀 Deployment Guide - Smart Attendance System

This guide will help you deploy the complete Smart Attendance System with:
- **Frontend** → Vercel
- **Backend** → Render
- **AI-ML Service** → Render
- **Database** → MongoDB Atlas

---

## 📋 Prerequisites

1. GitHub account with repo containing this code
2. Vercel account (https://vercel.com)
3. Render account (https://render.com)
4. MongoDB Atlas account (https://cloud.mongodb.com)

---

## Step 1: MongoDB Atlas Setup (Database)

1. Go to https://cloud.mongodb.com
2. Create a free account or login
3. Create a new **FREE** cluster (M0 Sandbox)
4. Click "Connect" → "Connect your application"
5. Copy the connection string, it looks like:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/attendance_db?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password

**Save this connection string - you'll need it for backend!**

---

## Step 2: Deploy AI-ML Service (Render)

### Option A: Via Render Dashboard

1. Go to https://render.com and login
2. Click "New" → "Web Service"
3. Connect your GitHub repo
4. Configure:
   - **Name**: `attendance-ai-service`
   - **Root Directory**: `ai-ml`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn --bind 0.0.0.0:$PORT --timeout 120 --workers 1 api.app:app`
   - **Plan**: Free
5. Add Environment Variables:
   - `PYTHON_VERSION`: `3.10.0`
6. Click "Create Web Service"
7. Wait for deployment (5-10 minutes)
8. Copy the URL: `https://attendance-ai-service.onrender.com`

### Option B: Via render.yaml (Already created)
- Just connect repo in Render, it will auto-detect `render.yaml`

---

## Step 3: Deploy Backend (Render)

1. In Render, click "New" → "Web Service"
2. Connect same GitHub repo
3. Configure:
   - **Name**: `attendance-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
4. Add Environment Variables:
   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `5001` |
   | `MONGODB_URI` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | (Generate a random 32-char string) |
   | `JWT_EXPIRE` | `7d` |
   | `AI_SERVICE_URL` | `https://attendance-ai-service.onrender.com/api` |
   | `FRONTEND_URL` | (Will update after Vercel deploy) |

5. Click "Create Web Service"
6. Wait for deployment
7. Copy the URL: `https://attendance-backend.onrender.com`

---

## Step 4: Deploy Frontend (Vercel)

1. Go to https://vercel.com and login with GitHub
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variables:
   | Key | Value |
   |-----|-------|
   | `VITE_API_BASE_URL` | `https://attendance-backend.onrender.com/api/v1` |
   | `VITE_AI_SERVICE_URL` | `https://attendance-ai-service.onrender.com/api` |
   | `VITE_APP_NAME` | `Smart Attendance System` |

6. Click "Deploy"
7. Wait for deployment (2-3 minutes)
8. Copy your URL: `https://your-project.vercel.app`

---

## Step 5: Update Backend FRONTEND_URL

1. Go back to Render → Backend Service → Environment
2. Update `FRONTEND_URL` to your Vercel URL: `https://your-project.vercel.app`
3. Click "Save Changes" - service will redeploy

---

## ✅ Deployment Complete!

Your URLs:
- **Frontend**: `https://your-project.vercel.app`
- **Backend**: `https://attendance-backend.onrender.com`
- **AI Service**: `https://attendance-ai-service.onrender.com`

---

## 🔧 Troubleshooting

### "Free tier spinning down"
Render free services spin down after 15 mins of inactivity. First request after spin-down takes 30-60 seconds.

### "CORS Error"
Make sure `FRONTEND_URL` in backend matches exactly your Vercel URL.

### "MongoDB Connection Failed"
1. In MongoDB Atlas, go to "Network Access"
2. Click "Add IP Address" → "Allow Access from Anywhere" (0.0.0.0/0)

### "AI Service Timeout"
Free tier has limited resources. First face detection may be slow.

---

## 📝 Quick Reference Commands

### Local Development
```bash
# Run all services locally
cd ai-ml && python api/app.py
cd backend && npm run dev
cd frontend && npm run dev
```

### Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🔒 Production Checklist

- [ ] MongoDB Atlas IP whitelist configured
- [ ] JWT_SECRET is unique and secure
- [ ] All environment variables set correctly
- [ ] HTTPS enabled (automatic on Vercel/Render)
- [ ] CORS configured properly

---

## 📧 Support

If you face any issues:
1. Check Render/Vercel deployment logs
2. Check browser console for errors
3. Verify all environment variables are set

Happy Deploying! 🎉
