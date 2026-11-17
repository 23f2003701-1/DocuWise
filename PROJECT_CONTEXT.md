# DocuWise – Project Context

**Purpose:** Reference document for resuming development. Summarizes architecture, stack, decisions, and current state.  
**Last Updated:** 2026-11-17

---

## Project Identity
- **Name:** DocuWise – AI-Powered Personal Document Organizer and Intelligent Expiry Management System
- **Type:** CPAD (Cross-Platform Application Development) Academic Mini-Project, Semester 7
- **Workspace:** `d:\VJTI sem stuffs\sem7\CPAD\project`

---

## Technology Stack (Fixed — Do Not Change)

| Component | Technology | Version |
|-----------|-----------|---------|
| Mobile | React Native + Expo | SDK 51 |
| Mobile Language | TypeScript | ^5.3 |
| Backend | Node.js + Express.js | - |
| Backend Language | TypeScript | ^5.4.5 |
| Database | MongoDB Atlas + Mongoose | ^8.4.1 |
| AI | Google Gemini API | gemini-1.5-flash |
| AI SDK | @google/generative-ai | ^0.21.0 |
| File Storage | Cloudinary | ^1.41.3 |
| Auth | JWT (jsonwebtoken) + bcryptjs | - |
| Push Notifications | Expo Push Notifications | ^0.28.9 |
| Scheduler | node-cron | ^3.0.3 |
| HTTP Client | axios | ^1.7.2 |
| Navigation | React Navigation v6 | - |
| Icons | @expo/vector-icons (MaterialCommunityIcons) | ^14 |

---

## Folder Structure

```
d:\VJTI sem stuffs\sem7\CPAD\project\
├── backend/                      ← Node.js + Express API
│   ├── src/
│   │   ├── index.ts              ← Express app entry point
│   │   ├── config/
│   │   │   ├── db.ts             ← MongoDB Atlas connection
│   │   │   ├── cloudinary.ts     ← Cloudinary SDK setup
│   │   │   └── gemini.ts         ← Gemini AI singleton
│   │   ├── models/
│   │   │   ├── User.ts           ← User schema (bcrypt, pushToken, prefs)
│   │   │   ├── Document.ts       ← Document schema (cloudinaryPublicId)
│   │   │   ├── AIAnalysis.ts     ← AI results (extractedFields, importantDetails)
│   │   │   ├── Reminder.ts       ← Notification records (30_day|7_day|1_day)
│   │   │   └── DocumentVersion.ts ← File replacement history
│   │   ├── middleware/
│   │   │   ├── auth.ts           ← JWT verification middleware
│   │   │   ├── upload.ts         ← Multer disk storage (10MB limit)
│   │   │   └── errorHandler.ts   ← Global error handler
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── documentController.ts ← 8 functions
│   │   │   ├── aiController.ts
│   │   │   ├── dashboardController.ts
│   │   │   └── notificationController.ts
│   │   ├── routes/
│   │   │   ├── auth.ts           ← /api/auth/*
│   │   │   ├── documents.ts      ← /api/documents/* (static before /:id)
│   │   │   ├── ai.ts             ← /api/ai/*
│   │   │   ├── dashboard.ts      ← /api/dashboard
│   │   │   └── notifications.ts  ← /api/notifications/*
│   │   ├── services/
│   │   │   ├── cloudinaryService.ts  ← upload/delete/getFileBuffer
│   │   │   ├── geminiService.ts      ← analyzeDocument (structured JSON prompt)
│   │   │   ├── expiryService.ts      ← calculateExpiryStatus/update/getExpiring
│   │   │   └── notificationService.ts ← Expo push API
│   │   ├── jobs/
│   │   │   └── expiryReminder.ts ← Daily 09:00 cron, deduplication
│   │   └── utils/
│   │       ├── responseHelper.ts ← sendSuccess/sendError
│   │       └── validators.ts     ← express-validator rules
│   ├── dist/                     ← Compiled JS (run: npm run build)
│   ├── uploads/                  ← Temp multer storage (auto-cleaned)
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env                      ← FILL IN CREDENTIALS
│   └── .env.example
│
├── mobile/                       ← React Native + Expo app
│   ├── App.tsx                   ← Root: SafeAreaProvider + Providers + AppNavigator
│   ├── app.json                  ← Expo config (SDK 51, Android package)
│   ├── eas.json                  ← EAS Build profiles
│   ├── .env                      ← EXPO_PUBLIC_API_URL
│   ├── node_modules/             ← 1131 packages installed
│   └── src/
│       ├── types/index.ts        ← All TypeScript types (harmonized with backend)
│       ├── theme/
│       │   ├── colors.ts         ← Primary palette + category/expiry color maps
│       │   ├── typography.ts
│       │   └── spacing.ts        ← xs/sm/md/lg/xl/xxl/xxxl + borderRadius + iconSize
│       ├── utils/
│       │   ├── helpers.ts        ← formatDate/formatFileSize/getExpiryStatusText/etc
│       │   └── validators.ts
│       ├── services/
│       │   ├── api.ts            ← axios instance (EXPO_PUBLIC_API_URL, JWT interceptor)
│       │   ├── authService.ts
│       │   ├── documentService.ts
│       │   └── notificationService.ts ← Expo push registration
│       ├── context/
│       │   ├── AuthContext.tsx   ← user/token/isAuthenticated/login/logout/etc
│       │   └── DocumentContext.tsx ← documents/dashboardStats/fetchDashboard/etc
│       ├── navigation/
│       │   ├── AppNavigator.tsx  ← Root: NavigationContainer, auth-aware
│       │   ├── AuthNavigator.tsx ← Splash → Login → Register
│       │   └── MainNavigator.tsx ← BottomTabs (Home/Documents/Upload/Expiry/Profile)
│       │                           DocumentsStack inside Documents tab
│       ├── components/
│       │   ├── common/           ← Button/Input/Card/LoadingSpinner/EmptyState/ErrorBoundary
│       │   ├── documents/        ← DocumentCard/DocumentStatusBadge
│       │   ├── dashboard/        ← StatCard/RecentDocuments
│       │   └── notifications/    ← NotificationItem
│       └── screens/
│           ├── auth/             ← SplashScreen/LoginScreen/RegisterScreen
│           ├── dashboard/        ← HomeScreen
│           ├── documents/        ← MyDocuments/Categories/Upload/Details/Preview/AIAnalysis/AISummary/Search
│           ├── expiry/           ← ExpiryTrackerScreen (4 tabs)
│           ├── notifications/    ← NotificationsScreen
│           ├── profile/          ← ProfileScreen
│           └── settings/         ← SettingsScreen
│
├── documentation/
│   ├── ProjectDocumentation.md   ← Full academic report (17 sections)
│   └── api-docs/
│       ├── API_Reference.md      ← 19 endpoints documented
│       └── DocuWise_Postman_Collection.json ← Importable Postman collection
│
├── DEVELOPMENT_STATUS.md         ← Phase-wise completion tracker
├── PROJECT_CONTEXT.md            ← This file
├── README.md                     ← Setup instructions
├── render.yaml                   ← Render deployment config
└── .gitignore
```

---

## API Endpoints (19 total)

| # | Method | Endpoint | Auth |
|---|--------|----------|------|
| 1 | POST | `/api/auth/register` | No |
| 2 | POST | `/api/auth/login` | No |
| 3 | GET | `/api/auth/me` | Yes |
| 4 | PUT | `/api/auth/profile` | Yes |
| 5 | PUT | `/api/auth/change-password` | Yes |
| 6 | PUT | `/api/auth/push-token` | Yes |
| 7 | POST | `/api/documents/upload` | Yes |
| 8 | GET | `/api/documents` | Yes |
| 9 | GET | `/api/documents/categories` | Yes |
| 10 | GET | `/api/documents/expiry-tracker` | Yes |
| 11 | GET | `/api/documents/:id` | Yes |
| 12 | PUT | `/api/documents/:id` | Yes |
| 13 | DELETE | `/api/documents/:id` | Yes |
| 14 | PUT | `/api/documents/:id/replace` | Yes |
| 15 | POST | `/api/ai/analyze` | Yes |
| 16 | GET | `/api/ai/analysis/:documentId` | Yes |
| 17 | GET | `/api/dashboard` | Yes |
| 18 | GET | `/api/notifications` | Yes |
| 19 | PUT | `/api/notifications/preferences` | Yes |

---

## Key Architectural Decisions

1. **API URL isolation:** Gemini API key, Cloudinary keys, JWT secret — ALL server-side only. Mobile uses `EXPO_PUBLIC_API_URL` only.
2. **Cloudinary over local storage:** Files stored on Cloudinary CDN (never on the server disk permanently — `uploads/` dir is auto-cleaned after Cloudinary upload).
3. **Route ordering:** `/categories` and `/expiry-tracker` are registered BEFORE `/:id` in `documents.ts` to prevent parameter collision.
4. **AI analysis is on-demand:** AI analysis is triggered explicitly by user (not auto-on-upload) to avoid Gemini API costs.
5. **Deduplication:** Reminder records are checked before sending push notifications to prevent duplicate notifications.
6. **expiryStatus stored:** `expiryStatus` is stored and recalculated on update, not calculated at query time, for performance.

---

## MongoDB Collections (5)

| Collection | Key Fields |
|-----------|-----------|
| `users` | email, password(hash), pushToken, notificationPreferences |
| `documents` | userId, title, category, cloudinaryPublicId, fileUrl, expiryStatus |
| `aianalyses` | documentId, userId, extractedFields, importantDetails, confidence |
| `reminders` | documentId, userId, reminderType('30_day'/'7_day'/'1_day'), isRead |
| `documentversions` | documentId, userId, cloudinaryPublicId (old version) |

---

## Important Import Patterns

```typescript
// Theme
import { colors, getCategoryColor, getExpiryColor } from '../../theme/colors';
import { spacing, borderRadius, iconSize } from '../../theme/spacing';
import { typography } from '../../theme/typography';

// Types
import { DocumentItem, AIAnalysisResult, DocumentStackParamList } from '../../types';

// Navigation
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Services
import { documentService } from '../../services/documentService';
import { authService } from '../../services/authService';
import { notificationService } from '../../services/notificationService';

// Context
import { useAuth } from '../../context/AuthContext';
import { useDocuments } from '../../context/DocumentContext';

// EmptyState props: icon, title, message (NOT "description")
// NotificationItem props: reminder (NOT "notification")
```

---

## Environment Variables Reference

### Backend (`backend/.env`)
```
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/docuwise?retryWrites=true&w=majority
JWT_SECRET=<any_long_random_string>
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=<name>
CLOUDINARY_API_KEY=<key>
CLOUDINARY_API_SECRET=<secret>
GEMINI_API_KEY=<key>
NODE_ENV=development
```

### Mobile (`mobile/.env`)
```
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api   # Android emulator
# OR
EXPO_PUBLIC_API_URL=http://192.168.x.x:5000/api  # Physical device (use your LAN IP)
# OR (after Render deploy)
EXPO_PUBLIC_API_URL=https://your-service.onrender.com/api
```
