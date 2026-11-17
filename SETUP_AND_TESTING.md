# DocuWise – Setup & Testing Guide

## Step 1: Fill in Backend Credentials

Edit `backend/.env` and replace ALL placeholder values:

```
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/docuwise?retryWrites=true&w=majority
JWT_SECRET=docuwise_jwt_secret_at_least_32_chars_long_1234
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your_actual_api_secret
GEMINI_API_KEY=AIzaSy_your_actual_gemini_key
NODE_ENV=development
```

**Where to get credentials:**
- MongoDB Atlas: https://atlas.mongodb.com → Create free M0 cluster → Database Access → Add user → Network Access → Allow 0.0.0.0/0 → Databases → Connect → Drivers → copy URI
- Cloudinary: https://console.cloudinary.com → Dashboard → copy Cloud Name / API Key / API Secret  
- Gemini: https://aistudio.google.com/app/apikey → Create API key

---

## Step 2: Start Backend

```powershell
cd "d:\VJTI sem stuffs\sem7\CPAD\project\backend"
npm run dev
```

Expected output:
```
MongoDB connected: xxx.mongodb.net
Cloudinary configured
Gemini AI configured
[ExpiryReminder] Expiry reminder cron job scheduled (daily at 9:00 AM)
🚀 DocuWise API running on port 5000
```

---

## Step 3: Verify Backend with curl

```powershell
# Health check
Invoke-WebRequest -Uri "http://localhost:5000/health" -Method GET | Select-Object -ExpandProperty Content

# Register user
$body = '{"name":"Test User","email":"test@test.com","password":"password123"}'
Invoke-WebRequest -Uri "http://localhost:5000/api/auth/register" -Method POST -ContentType "application/json" -Body $body | Select-Object -ExpandProperty Content
```

---

## Step 4: Configure Mobile API URL

Find your computer's LAN IP:
```powershell
ipconfig | findstr "IPv4"
```

Edit `mobile/.env`:
```
EXPO_PUBLIC_API_URL=http://192.168.1.XXX:5000/api
```
(Replace with your actual IP — both phone and computer must be on same WiFi)

---

## Step 5: Start Mobile App

```powershell
cd "d:\VJTI sem stuffs\sem7\CPAD\project\mobile"
npx expo start
```

1. Install **Expo Go** on Android phone from Play Store
2. Scan QR code shown in terminal
3. App will load on phone

---

## Step 6: Test All Features

### Authentication
- [ ] Register new account
- [ ] Login with credentials
- [ ] Token persists after app restart (close and reopen)
- [ ] Logout clears session

### Document Upload
- [ ] Pick a PDF → fill title → Upload → success alert
- [ ] Pick an image → Upload → success alert  
- [ ] Try file > 10MB → should show error
- [ ] View document in My Documents list
- [ ] Open Document Details screen

### AI Analysis
- [ ] From Document Details → tap "AI Analysis"
- [ ] Wait 10-20s for Gemini to respond
- [ ] Check extracted fields (documentType, category, holderName, dates)
- [ ] Tap "View Summary" → AI Summary screen with confidence bar

### Document Preview
- [ ] From Document Details → tap "Preview Document"
- [ ] PDF: Opens in WebView
- [ ] Image: Displays full-screen

### Expiry Tracking
- [ ] Upload document with expiryDate = yesterday → shows "Expired" 
- [ ] Upload with expiryDate = 2 weeks from now → shows "Expiring Soon"
- [ ] Upload with expiryDate = next year → shows "Valid"
- [ ] Check Expiry Tracker tab — 4 tabs populated

### Search
- [ ] Home screen → tap Search icon (from HomeScreen bell → Notifications, or navigate to Documents → Search)
- [ ] Type document title → results appear
- [ ] Filter by category chip
- [ ] Filter by status chip

### Dashboard
- [ ] Home screen shows total count
- [ ] Stats cards show Valid/Expiring/Expired counts
- [ ] Recent Documents list shows uploaded files

### Profile & Settings
- [ ] Profile screen shows name and email
- [ ] Edit name → save → updated
- [ ] Settings → toggle notification prefs → save
- [ ] Settings → Change Password (requires current password)
- [ ] Logout from either screen

---

## Step 7: API Testing with Postman

1. Import `documentation/api-docs/DocuWise_Postman_Collection.json`
2. Set collection variable `BASE_URL` to `http://localhost:5000/api`
3. Run **Login** request → token auto-saved to `TOKEN` variable
4. Test all 19 endpoints

---

## Step 8: Deploy Backend to Render

1. Create GitHub repo, push entire project:
   ```bash
   git init
   git add .
   git commit -m "DocuWise CPAD project"
   git remote add origin https://github.com/YOUR_USERNAME/docuwise.git
   git push -u origin main
   ```
2. render.com → New → Web Service → Connect GitHub repo
3. Settings:
   - Root Directory: `backend`
   - Build: `npm install && npm run build`
   - Start: `node dist/index.js`
4. Environment tab → Add all variables from `backend/.env`
5. Create Web Service → wait 5 minutes → copy URL

---

## Step 9: Build Android APK

After backend is deployed and URL updated in `mobile/.env`:

```bash
npm install -g eas-cli
eas login  # Login with your expo.dev account

cd "d:\VJTI sem stuffs\sem7\CPAD\project\mobile"
eas build --platform android --profile apk
# Wait 15-20 minutes → download APK from expo.dev/builds
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "MongoDB connection failed" | Check URI format, whitelist IP 0.0.0.0/0 in Atlas Network Access |
| "Cannot connect to backend" on mobile | Verify phone and PC on same WiFi; use LAN IP not localhost |
| "Gemini API error" | Check API key is valid; check quota at aistudio.google.com |
| "Cloudinary upload failed" | Verify CLOUDINARY_* vars match your dashboard |
| Expo QR won't scan | Try tunnel mode: `npx expo start --tunnel` |
| TS errors after editing | Run `npx tsc --noEmit --skipLibCheck` in mobile/ to check |
