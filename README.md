# DocuWise – AI-Powered Personal Document Organizer

> **CPAD Mini-Project** | React Native + Expo | Node.js + Express | MongoDB Atlas | Google Gemini AI

DocuWise is a full-stack mobile application that lets users securely upload, organize, and manage personal documents with AI-powered classification and intelligent expiry tracking.

---

## ✨ Features

- 📄 **Document Upload** — PDF and image files via Cloudinary
- 🤖 **AI Analysis** — Google Gemini AI classifies, extracts, and summarizes documents
- ⏰ **Expiry Tracking** — Auto-calculates status (Valid / Expiring Soon / Expired)
- 🔔 **Push Notifications** — Reminders at 30, 7, and 1 day before expiry
- 🔍 **Search & Filter** — Full-text search with category and status filters
- 📊 **Dashboard** — Document stats, upcoming expiries, recent uploads
- 🔒 **Secure Auth** — JWT + bcrypt, SecureStore for token storage

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native + Expo SDK 51 + TypeScript |
| Backend | Node.js + Express.js + TypeScript |
| Database | MongoDB Atlas + Mongoose |
| AI | Google Gemini API (`gemini-1.5-flash`) |
| Storage | Cloudinary |
| Auth | JWT + bcrypt |
| Notifications | Expo Push Notifications |
| Deployment | Render (backend) + Expo EAS (mobile) |

---

## 📁 Project Structure

```
project/
├── backend/          ← Node.js REST API
├── mobile/           ← React Native + Expo app
├── documentation/    ← Academic docs + API reference
├── render.yaml       ← Render deployment config
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- MongoDB Atlas account (free M0 cluster)
- Cloudinary account (free tier)
- Google AI Studio account (free Gemini API key)
- Expo Go app on Android device

---

### 1. Backend Setup

```powershell
cd backend

# Copy and fill in credentials
copy .env.example .env
# Edit .env with your MONGODB_URI, CLOUDINARY_*, GEMINI_API_KEY, JWT_SECRET

# Install dependencies
npm install

# Development mode (auto-restart on file change)
npm run dev

# Production build + start
npm run build
npm start
```

**Verify:** Open `http://localhost:5000/health` — should return `{"status":"ok"}`

---

### 2. Mobile Setup

```powershell
cd mobile

# Install dependencies
npm install

# Set API URL (use your computer's LAN IP for physical device testing)
# Edit .env:
#   EXPO_PUBLIC_API_URL=http://192.168.x.x:5000/api  (physical device)
#   EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api     (Android emulator)

# Start development server
npx expo start

# Scan QR code with Expo Go app on your Android phone
```

---

## 🌐 Deployment

### Backend → Render

1. Push repository to GitHub
2. Create a **Web Service** on [render.com](https://render.com)
3. Settings:
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `node dist/index.js`
4. Add environment variables from `backend/.env.example` in Render dashboard
5. After deploy, copy the `https://xxx.onrender.com` URL

### Mobile → Android APK (Expo EAS)

```bash
npm install -g eas-cli
eas login

cd mobile
# Update .env: EXPO_PUBLIC_API_URL=https://your-service.onrender.com/api
# Update app.json extra.eas.projectId with your Expo project ID

eas build --platform android --profile production
# Download APK from expo.dev dashboard
```

---

## 📱 Screens (16 total)

| # | Screen | Description |
|---|--------|-------------|
| 1 | Splash | Logo animation |
| 2 | Login | Email + password auth |
| 3 | Register | New account creation |
| 4 | Home/Dashboard | Stats + recent docs + upcoming expiries |
| 5 | My Documents | Paginated document list |
| 6 | Categories | Visual category grid |
| 7 | Upload | File picker + metadata form |
| 8 | Document Details | Full info + actions |
| 9 | Document Preview | In-app PDF/image viewer |
| 10 | AI Analysis | Trigger and display AI results |
| 11 | AI Summary | Detailed AI report with confidence |
| 12 | Search | Full-text search + filters |
| 13 | Expiry Tracker | 4-tab status view |
| 14 | Notifications | Expiry reminders list |
| 15 | Profile | User info + edit |
| 16 | Settings | Notification prefs + password change |

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/docuwise?retryWrites=true&w=majority
JWT_SECRET=your_very_long_random_secret_key_here
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=development
```

### Mobile (`mobile/.env`)
```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 📚 Documentation

- [Project Documentation](./documentation/ProjectDocumentation.md) — Full academic report
- [API Reference](./documentation/api-docs/API_Reference.md) — 19 REST endpoints
- [Postman Collection](./documentation/api-docs/DocuWise_Postman_Collection.json) — Import to Postman
- [Development Status](./DEVELOPMENT_STATUS.md) — Implementation tracker
- [Project Context](./PROJECT_CONTEXT.md) — Architecture reference

---

## ⚠️ Security Notes

- **Gemini API key is NEVER exposed in the mobile app** — backend only
- **Cloudinary credentials are NEVER in mobile** — backend only
- **JWT tokens stored in Expo SecureStore** (encrypted device storage)
- **All document queries filtered by userId** (no cross-user data leakage)

---

## 📝 License

Academic project — VJTI, Mumbai. For educational purposes only.
