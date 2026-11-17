# DocuWise - Complete Deployment Guide 🚀

This document covers everything you need to deploy **DocuWise** into production for presentation, evaluation, or real-world use.

---

## 🌟 Architecture Overview

```
                      ┌──────────────────────────────────────┐
                      │             DocuWise App             │
                      │  (React Native / Expo SDK 58 / iOS)  │
                      └──────────────────┬───────────────────┘
                                         │ HTTPS Requests
                                         ▼
                      ┌──────────────────────────────────────┐
                      │        Node.js / Express API         │
                      │    (Hosted on Render / Railway)      │
                      └────┬──────────────┬─────────────┬────┘
                           │              │             │
              Mongoose SRV │   Signed API │  Direct API │
                           ▼              ▼             ▼
       ┌─────────────────────┐   ┌──────────────┐   ┌─────────────────┐
       │    MongoDB Atlas    │   │  Cloudinary  │   │ Google Gemini AI│
       │ (Cloud DB Cluster)  │   │(File Storage)│   │ (gemini-2.5)    │
       └─────────────────────┘   └──────────────┘   └─────────────────┘
```

> **Great news:** Your database (MongoDB Atlas), file storage (Cloudinary), and AI (Google Gemini) are **already fully hosted in the cloud**. You only need to host the Node.js backend server!

---

## Part 1: Deploy Backend to Render (Free & Recommended)

[Render](https://render.com) provides free cloud hosting with automatic SSL (`https://`), continuous deployment from GitHub, and zero server maintenance.

### Step 1.1: Push Project to GitHub

1. Open PowerShell in `D:\VJTI sem stuffs\sem7\CPAD\project`:
   ```powershell
   git add .
   git commit -m "feat: complete DocuWise production release"
   ```

2. Create a new repository on [GitHub](https://github.com/new) named `docuwise` (choose **Private** or **Public**).

3. Link and push your code to GitHub:
   ```powershell
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/docuwise.git
   git branch -M main
   git push -u origin main
   ```
   *(Note: Your `.env` files are in `.gitignore`, so your secret keys remain completely safe.)*

---

### Step 1.2: Create Web Service on Render

1. Sign up or log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **Web Service**.
3. Select **Build and deploy from a Git repository** → click **Next**.
4. Connect your GitHub account and select your `docuwise` repository.
5. Configure the service settings:
   - **Name:** `docuwise-api`
   - **Region:** Singapore / Oregon / Frankfurt (choose closest)
   - **Branch:** `main`
   - **Root Directory:** `backend` *(CRITICAL: Must set to `backend`)*
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`

---

### Step 1.3: Add Environment Variables on Render

Scroll down to **Environment Variables** and add the following keys from your `backend/.env`:

| Key | Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Production environment |
| `PORT` | `10000` | Port assigned by Render |
| `MONGODB_URI` | `mongodb+srv://docuwise_admin:diorvope@cluster0.y3cevvf.mongodb.net/docuwise?retryWrites=true&w=majority` | Your MongoDB Atlas connection |
| `JWT_SECRET` | *(Your secret from backend/.env)* | JWT token signing key |
| `JWT_EXPIRES_IN` | `30d` | Token lifetime |
| `CLOUDINARY_CLOUD_NAME` | `g5i3q6c2` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | `482438899754475` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | `qORWguZFddeKyimjH8CIVPcgkBI` | Cloudinary API secret |
| `GEMINI_API_KEY` | `AIzaSyBVGCoxexZFFSz224WZbFitMkn2OL7S9LY` | Active Gemini API key |

6. Click **Deploy Web Service**.
7. Render will build and deploy your app. Within 2–3 minutes, you will get your public live URL, for example:
   `https://docuwise-api.onrender.com`

---

### Step 1.4: Verify Backend is Live

Open your browser or run:
```bash
curl https://docuwise-api.onrender.com/health
```
You should receive:
```json
{
  "status": "ok",
  "timestamp": "2026-11-18T...",
  "service": "DocuWise API"
}
```

---

## Part 2: Connect Mobile App to Production Backend

Once your backend is live on Render:

1. Open `mobile/.env` on your computer:
   ```env
   EXPO_PUBLIC_API_URL=https://docuwise-api.onrender.com/api
   ```
   *(Replace with your actual Render URL + `/api`)*

2. Now you **no longer need local hotspot or IP matching**! Anyone on any Wi-Fi, 4G, or 5G can connect seamlessly.

---

## Part 3: Mobile Deployment Options

### Option A: Standalone Android APK (Best for College Submissions & Reviewers)

You can generate a `.apk` file that anyone can install directly on an Android device without running Expo Go or Metro.

1. Install EAS CLI globally:
   ```powershell
   npm install -g eas-cli
   ```

2. Log in to your Expo account (create one free at [expo.dev](https://expo.dev)):
   ```powershell
   eas login
   ```

3. Configure your project in `mobile/`:
   ```powershell
   cd mobile
   eas build:configure
   ```

4. Build a standalone APK:
   ```powershell
   eas build -p android --profile preview
   ```

5. EAS will build the `.apk` in the cloud. Once finished, it provides a download link (or QR code) to download `DocuWise.apk`.

---

### Option B: Running with Expo Go (Universal iOS & Android Demo)

With the production backend URL set in `mobile/.env`:

1. Start Metro:
   ```powershell
   cd mobile
   npx expo start -c
   ```
2. Scan the QR code using the Camera app (iOS) or Expo Go (Android).
3. The app loads in Expo Go and communicates directly with your 24/7 cloud API!

---

### Option C: Web Deployment (Netlify / Vercel)

DocuWise mobile code can also run as a web app:

1. Export the web bundle:
   ```powershell
   cd mobile
   npx expo export -p web
   ```
2. This creates a `dist/` web folder.
3. Deploy to Netlify or Vercel:
   ```powershell
   npx netlify deploy --dir=dist --prod
   # or
   npx vercel deploy dist --prod
   ```

---

## Part 4: Docker Deployment (Alternative Cloud Option)

If you prefer hosting with Docker (on **Railway**, **Fly.io**, or **AWS ECS**), a production-ready `backend/Dockerfile` is already created:

```powershell
cd backend
docker build -t docuwise-backend .
docker run -p 5000:5000 --env-file .env docuwise-backend
```

---

## 📋 Evaluation & Demo Checklist

- [x] **Database:** MongoDB Atlas active with indexes on users, documents, and reminders.
- [x] **File Storage:** Cloudinary cloud storage configured with PDF-to-image auto rasterization.
- [x] **AI OCR:** Google Gemini 2.5 Flash active with auto-tagging, metadata extraction, and categorization.
- [x] **Expiry Management:** Cron job automatically monitors expiries at 30, 7, and 1 day thresholds.
- [x] **Security:** Passwords hashed with bcrypt, JWT authentication, zero secrets in frontend bundle.
- [x] **Mobile:** SDK 58 React Native app with full dashboard, document vault, AI analysis, expiry tracker, and search.
