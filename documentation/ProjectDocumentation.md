# DocuWise – AI-Powered Personal Document Organizer and Intelligent Expiry Management System

**Project Type:** CPAD (Cross-Platform Application Development) Mini-Project  
**Subject Code:** CPAD  
**Academic Year:** 2026–27 (Semester VII)  
**Technology Stack:** React Native + Expo | Node.js + Express | MongoDB Atlas | Gemini AI | Cloudinary

---

## Table of Contents

1. [Title and Abstract](#1-title-and-abstract)
2. [Introduction](#2-introduction)
3. [Problem Statement](#3-problem-statement)
4. [Project Objectives](#4-project-objectives)
5. [Existing System vs Proposed System](#5-existing-system-vs-proposed-system)
6. [Technology Stack and Justification](#6-technology-stack-and-justification)
7. [System Architecture](#7-system-architecture)
8. [Module Descriptions](#8-module-descriptions)
9. [Functional Requirements](#9-functional-requirements)
10. [Non-Functional Requirements](#10-non-functional-requirements)
11. [Database Design](#11-database-design)
12. [API Documentation](#12-api-documentation)
13. [Screen Descriptions](#13-screen-descriptions)
14. [Implementation Details](#14-implementation-details)
15. [Testing](#15-testing)
16. [Deployment](#16-deployment)
17. [Conclusion and Future Work](#17-conclusion-and-future-work)

---

## 1. Title and Abstract

### Title
**DocuWise – AI-Powered Personal Document Organizer and Intelligent Expiry Management System**

### Abstract

DocuWise is a full-stack cross-platform mobile application designed to solve the persistent challenge of managing personal documents. Users can securely upload, store, categorize, and retrieve important documents such as passports, driving licences, insurance policies, educational certificates, and more — all from a single app.

The application integrates Google Gemini AI on the backend to automatically analyze uploaded documents: extracting key information, classifying the document type, generating concise summaries, and identifying expiry dates. An automated expiry tracking system monitors documents and sends push notifications to users 30 days, 7 days, and 1 day before a document expires.

Built using React Native with Expo for the cross-platform mobile frontend, Node.js/Express for the backend REST API, MongoDB Atlas for data persistence, Cloudinary for secure file storage, and deployed on Render, DocuWise provides a complete, production-ready document management solution.

---

## 2. Introduction

In daily life, individuals manage dozens of important documents: government identity cards, vehicle registration papers, insurance policies, educational transcripts, bank statements, and property records. These documents are often stored in disparate physical or digital locations, making it difficult to locate them when needed. Moreover, many documents have expiry dates, and forgetting to renew them can have legal, financial, or personal consequences.

Existing solutions are either too generic (cloud storage without intelligence) or too expensive (enterprise document management systems). There is a clear need for an intelligent, affordable, and user-friendly personal document management system.

DocuWise addresses this gap by combining secure cloud storage with AI-powered document intelligence and proactive expiry notifications in a convenient mobile application.

---

## 3. Problem Statement

**Core Problems:**

1. **Document Disorganization:** Important documents are stored in multiple places — physical folders, email attachments, phone galleries — making retrieval slow and unreliable.

2. **Manual Data Entry Burden:** Users must manually categorize and tag documents, which is time-consuming and error-prone.

3. **Expiry Blindness:** Critical documents (passports, insurance policies, vehicle registrations) expire without adequate warning, causing last-minute renewals or legal non-compliance.

4. **Security Concerns:** Sensitive documents stored in general-purpose cloud drives (Google Drive, Dropbox) may not be adequately protected or organized.

5. **Lack of AI Intelligence:** Existing tools do not automatically understand document content, extract key information, or provide intelligent summaries.

---

## 4. Project Objectives

1. Build a **complete full-stack mobile application** with integrated frontend, backend, and database.
2. Implement **secure user authentication** using JWT and bcrypt.
3. Enable **document upload and storage** using Cloudinary with file type/size validation.
4. Integrate **Google Gemini AI** (backend only) to automatically classify, extract, and summarize document content.
5. Implement an **expiry tracking system** that categorizes documents by expiry status.
6. Send **push notifications** (via Expo Push Notifications) 30, 7, and 1 day before document expiry.
7. Provide a **search and filter system** for documents by title, category, and status.
8. Display an **intelligent dashboard** with statistics, recent uploads, and upcoming expiries.
9. Support **document versioning** when files are replaced.
10. Deploy the **backend on Render** and the mobile app via **Expo EAS Build**.

---

## 5. Existing System vs Proposed System

| Aspect | Existing Systems (Google Drive / Dropbox) | DocuWise (Proposed) |
|--------|------------------------------------------|---------------------|
| AI Classification | ❌ None | ✅ Gemini AI auto-classifies and extracts fields |
| Expiry Tracking | ❌ Manual or none | ✅ Automated with push notifications |
| Document Intelligence | ❌ Files only | ✅ Summaries, key highlights, extracted info |
| Organization | Generic folders | Category-based (Identity, Vehicle, Insurance, etc.) |
| Notifications | ❌ None | ✅ Push notifications at 30/7/1 days before expiry |
| Search | Basic filename search | Full-text + category + status filters |
| Dashboard | ❌ None | ✅ Stats, charts, recent uploads, upcoming expiries |
| Security | General access control | Per-user JWT auth + Cloudinary secure URLs |
| Mobile First | Web-first, mobile apps as afterthought | ✅ Native React Native mobile app |

---

## 6. Technology Stack and Justification

| Component | Technology | Justification |
|-----------|-----------|---------------|
| **Mobile Frontend** | React Native + Expo (SDK 51) + TypeScript | Cross-platform (iOS + Android) from one codebase; Expo simplifies builds; TypeScript for type safety |
| **Backend** | Node.js + Express.js + TypeScript | High performance, non-blocking I/O; large ecosystem; easy REST API creation |
| **Database** | MongoDB Atlas + Mongoose | Flexible document model suits varied document metadata; Atlas provides managed cloud hosting |
| **AI Integration** | Google Gemini API (`gemini-1.5-flash`) | State-of-the-art multimodal AI; can process images and PDFs; fast and cost-effective |
| **File Storage** | Cloudinary | Purpose-built for media/document management; provides CDN, transformations, secure URLs |
| **Authentication** | JWT + bcrypt | Industry-standard stateless auth; bcrypt for secure password hashing |
| **Push Notifications** | Expo Push Notifications | Unified push notification service for both iOS and Android via Expo infrastructure |
| **Scheduler** | node-cron | Lightweight cron job scheduler for daily expiry checks |
| **Backend Deployment** | Render | Free-tier friendly; supports Node.js; easy environment variable management |
| **Mobile Build** | Expo EAS Build | Cloud-based APK/IPA builds without local Xcode/Android Studio requirements |

---

## 7. System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   MOBILE CLIENT (React Native)           │
│   16 Screens | React Navigation | Axios HTTP Client      │
│   AuthContext | DocumentContext | Secure Token Storage   │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTPS REST API
                        ▼
┌─────────────────────────────────────────────────────────┐
│                BACKEND (Node.js + Express)               │
│  Routes: /auth /documents /ai /dashboard /notifications  │
│  Middleware: JWT Auth | Multer Upload | Error Handler    │
│  Services: Cloudinary | Gemini AI | Expiry | Notify      │
│  Cron Job: Daily expiry check at 09:00 AM               │
└──────┬────────────────┬────────────────┬────────────────┘
       │                │                │
       ▼                ▼                ▼
┌──────────┐   ┌───────────────┐  ┌─────────────┐
│ MongoDB  │   │  Cloudinary   │  │ Gemini AI   │
│  Atlas   │   │  (Files/CDN)  │  │   API       │
└──────────┘   └───────────────┘  └─────────────┘
                                        │
                                        ▼
                               ┌─────────────────┐
                               │ Expo Push Notif │
                               │   Service       │
                               └─────────────────┘
```

### Request Flow — Document Upload with AI Analysis

```
Mobile App
  → POST /api/documents/upload (multipart/form-data + JWT)
  → Backend validates file type/size
  → Uploads to Cloudinary → receives fileUrl + publicId
  → Saves Document to MongoDB
  → Returns document to mobile
  
Mobile App (optional next step)
  → POST /api/ai/analyze { documentId }
  → Backend fetches file buffer from Cloudinary URL
  → Sends to Gemini AI with structured prompt
  → Saves AIAnalysis to MongoDB
  → Updates Document fields (category, holderName, expiryDate, isAIProcessed)
  → Returns analysis to mobile
```

---

## 8. Module Descriptions

### Module 1: User Authentication and Profile Management
- **Register:** Creates user account with hashed password (bcrypt, 12 rounds). Returns JWT.
- **Login:** Validates credentials, returns JWT (7-day expiry).
- **Profile:** Authenticated endpoint returning user data.
- **Update Profile:** Name and email updates.
- **Change Password:** Requires current password verification.
- **Push Token:** Stores Expo push token for notifications.
- **Notification Preferences:** Configures expiry reminder days.

### Module 2: Document Upload and Management
- **Upload:** Accepts PDF and image files (max 10MB). Stores in Cloudinary. Creates MongoDB document.
- **List Documents:** Paginated list with search, filter by category/status, and sort options.
- **View Document:** Fetches single document by ID.
- **Update Document:** Edits metadata (title, description, dates, etc.).
- **Delete Document:** Removes from Cloudinary and MongoDB.
- **Replace File:** Uploads new file, deletes old Cloudinary asset, creates DocumentVersion record.
- **Categories:** Aggregated count of documents per category.
- **Expiry Tracker:** Groups documents into Expiring Soon / Expired / Valid / No Expiry.

### Module 3: AI-Powered Document Intelligence
- **Analyze Document:** Fetches document from Cloudinary, sends to Gemini API with a structured prompt requesting document type, category, holder name, issuing authority, document number, issue date, expiry date, summary, important details, and key-value extracted fields.
- **Get Analysis:** Retrieves stored AIAnalysis for a document.
- After analysis, the Document model is updated with AI-extracted fields and `isAIProcessed: true`.

### Module 4: Expiry Tracking and Notifications
- **Expiry Status Calculation:** Based on `expiryDate`, each document is classified as:
  - `Expired` (past expiry date)
  - `Expiring Soon` (within 30 days)
  - `Valid` (has expiry date, more than 30 days away)
  - `No Expiry` (no expiry date provided)
- **Daily Cron Job:** Runs at 09:00 AM. Checks all documents with expiry dates. For each document expiring in 1, 7, or 30 days (matching user's reminderDays preferences), sends a push notification and creates a Reminder record (deduplicated per document per reminderType per day).
- **Notification Preferences:** Users can toggle reminders and choose which reminder intervals to receive.

### Module 5: Dashboard and Search
- **Dashboard Stats:** Total document count, per-category counts, per-status counts, 5 most recently uploaded documents, and 5 upcoming expiries.
- **Search:** Full-text search across title, description, and tags. Filterable by category and status. Sortable by date, name, or expiry date.

---

## 9. Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-01 | Users can register with name, email, password | High |
| FR-02 | Users can log in and receive a JWT | High |
| FR-03 | JWT is stored securely on device (expo-secure-store) | High |
| FR-04 | Each user can only access their own documents | High |
| FR-05 | Upload PDF or image files (JPG, PNG, JPEG) | High |
| FR-06 | File size limit: 10MB | High |
| FR-07 | Documents stored in Cloudinary with secure URLs | High |
| FR-08 | AI automatically classifies document type and category | High |
| FR-09 | AI extracts holder name, document number, dates | High |
| FR-10 | AI generates a human-readable summary | High |
| FR-11 | Users can manually edit any extracted field | Medium |
| FR-12 | Expiry status auto-calculated from expiry date | High |
| FR-13 | Push notifications sent at 30/7/1 days before expiry | High |
| FR-14 | Users can configure notification preferences | Medium |
| FR-15 | Search documents by title/description/tags | Medium |
| FR-16 | Filter documents by category or expiry status | Medium |
| FR-17 | Dashboard shows statistics and upcoming expiries | Medium |
| FR-18 | Preview PDF and image documents in-app | Medium |
| FR-19 | Delete documents with confirmation | High |
| FR-20 | Replace document file (versioning) | Low |

---

## 10. Non-Functional Requirements

| ID | Requirement | Metric |
|----|-------------|--------|
| NFR-01 | API response time < 2s for CRUD operations | Performance |
| NFR-02 | AI analysis response < 15s | Performance |
| NFR-03 | App loads to home screen within 3s on first launch after login | Performance |
| NFR-04 | Gemini API key never exposed in mobile bundle | Security |
| NFR-05 | Passwords hashed with bcrypt (12 rounds) | Security |
| NFR-06 | JWT tokens expire in 7 days | Security |
| NFR-07 | File upload secured with JWT auth | Security |
| NFR-08 | Only PDF and image files accepted | Reliability |
| NFR-09 | Duplicate expiry notifications prevented (deduplication) | Reliability |
| NFR-10 | App works on Android 10+ | Compatibility |
| NFR-11 | Responsive on screen sizes from 5" to 7" | Usability |

---

## 11. Database Design

### Collection 1: Users

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Auto-generated MongoDB ID |
| `name` | String (required) | User's full name |
| `email` | String (unique, required) | User's email address |
| `password` | String (required) | bcrypt-hashed password |
| `notificationPreferences.expiryReminders` | Boolean | Master toggle for reminders |
| `notificationPreferences.reminderDays` | [Number] | Days before expiry to remind [30, 7, 1] |
| `pushToken` | String | Expo push notification token |
| `createdAt` | Date | Account creation timestamp |
| `updatedAt` | Date | Last update timestamp |

### Collection 2: Documents

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Auto-generated MongoDB ID |
| `userId` | ObjectId (ref: User) | Owner of the document |
| `title` | String (required) | Document display name |
| `category` | String (enum) | Identity/Educational/Vehicle/Insurance/Financial/Property/Medical/Legal/Other |
| `fileUrl` | String | Cloudinary secure URL |
| `fileType` | String (pdf/image) | Type of uploaded file |
| `fileSize` | Number | File size in bytes |
| `cloudinaryPublicId` | String | Cloudinary public ID for deletion/replacement |
| `originalFileName` | String | Original uploaded filename |
| `description` | String | Optional user description |
| `holderName` | String | Document holder's name |
| `documentNumber` | String | ID/registration/policy number |
| `issuingAuthority` | String | Government/organisation that issued it |
| `issueDate` | Date | Date of issue |
| `expiryDate` | Date | Date of expiry (null for non-expiring) |
| `expiryStatus` | String (enum) | Valid/Expiring Soon/Expired/No Expiry |
| `tags` | [String] | User-defined tags |
| `isAIProcessed` | Boolean | Whether AI analysis has been run |
| `createdAt` | Date | Upload timestamp |
| `updatedAt` | Date | Last modification timestamp |

### Collection 3: AIAnalysis

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Auto-generated MongoDB ID |
| `documentId` | ObjectId (ref: Document) | Associated document |
| `userId` | ObjectId (ref: User) | Document owner |
| `documentType` | String | Specific document type (e.g., "Indian Passport") |
| `category` | String | Broad category |
| `extractedFields` | Mixed | Key-value pairs of extracted information |
| `summary` | String | AI-generated plain-text summary |
| `importantDetails` | [String] | Key highlights as bullet points |
| `holderName` | String | Extracted holder name |
| `documentNumber` | String | Extracted document number |
| `issuingAuthority` | String | Extracted issuing authority |
| `issueDate` | Date | Extracted issue date |
| `expiryDate` | Date | Extracted expiry date |
| `confidence` | Number | AI confidence score (0–1) |
| `rawResponse` | String | Full Gemini API response |
| `createdAt` | Date | Analysis timestamp |

### Collection 4: Reminders

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Auto-generated MongoDB ID |
| `documentId` | ObjectId (ref: Document) | Document being reminded about |
| `userId` | ObjectId (ref: User) | User to notify |
| `reminderType` | String (enum) | '30_day' / '7_day' / '1_day' |
| `message` | String | Notification message text |
| `isRead` | Boolean | Whether user has viewed it |
| `sentAt` | Date | When notification was sent |
| `createdAt` | Date | Record creation timestamp |

### Collection 5: DocumentVersions

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Auto-generated MongoDB ID |
| `documentId` | ObjectId (ref: Document) | Parent document |
| `userId` | ObjectId (ref: User) | Document owner |
| `fileUrl` | String | Cloudinary URL of old version |
| `cloudinaryPublicId` | String | Old file's Cloudinary ID |
| `fileType` | String | File type |
| `fileSize` | Number | File size |
| `replacedAt` | Date | When this version was replaced |

---

## 12. API Documentation

See [API_Reference.md](./api-docs/API_Reference.md) for the complete REST API specification with request/response examples.

**Base URL (Local):** `http://localhost:5000/api`  
**Base URL (Production):** `https://docuwise-backend.onrender.com/api`

**Authentication:** All protected endpoints require `Authorization: Bearer <token>` header.

### Endpoint Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login user |
| GET | `/auth/me` | Yes | Get current user profile |
| PUT | `/auth/profile` | Yes | Update profile |
| PUT | `/auth/change-password` | Yes | Change password |
| PUT | `/auth/push-token` | Yes | Update push token |
| POST | `/documents/upload` | Yes | Upload document |
| GET | `/documents` | Yes | List/search documents |
| GET | `/documents/categories` | Yes | Category counts |
| GET | `/documents/expiry-tracker` | Yes | Grouped by expiry status |
| GET | `/documents/:id` | Yes | Get document by ID |
| PUT | `/documents/:id` | Yes | Update document |
| DELETE | `/documents/:id` | Yes | Delete document |
| PUT | `/documents/:id/replace` | Yes | Replace document file |
| POST | `/ai/analyze` | Yes | Analyze document with AI |
| GET | `/ai/analysis/:documentId` | Yes | Get stored AI analysis |
| GET | `/dashboard` | Yes | Dashboard statistics |
| GET | `/notifications` | Yes | List notifications |
| PUT | `/notifications/preferences` | Yes | Update notification prefs |

---

## 13. Screen Descriptions

| Screen | File | Purpose |
|--------|------|---------|
| Splash | `SplashScreen.tsx` | App logo with loading animation; auto-navigates after 2.5s |
| Login | `LoginScreen.tsx` | Email/password login with JWT storage |
| Register | `RegisterScreen.tsx` | New account creation |
| Home/Dashboard | `HomeScreen.tsx` | Stats, recent documents, upcoming expiries |
| My Documents | `MyDocumentsScreen.tsx` | Paginated list of all user documents |
| Document Categories | `DocumentCategoriesScreen.tsx` | Visual grid of categories with document counts |
| Upload Document | `UploadDocumentScreen.tsx` | File picker + metadata form + upload |
| Document Details | `DocumentDetailsScreen.tsx` | Full document info, preview and AI actions |
| Document Preview | `DocumentPreviewScreen.tsx` | In-app PDF/image viewer using WebView/Image |
| AI Analysis | `AIAnalysisScreen.tsx` | Trigger AI analysis, show results, edit fields |
| AI Summary | `AISummaryScreen.tsx` | Detailed view of AI analysis with confidence bar |
| Search | `SearchScreen.tsx` | Full-text search with category/status/sort filters |
| Expiry Tracker | `ExpiryTrackerScreen.tsx` | Tabbed view: Expiring Soon / Expired / Valid / No Expiry |
| Notifications | `NotificationsScreen.tsx` | List of expiry reminder notifications |
| Profile | `ProfileScreen.tsx` | User info display and edit, quick links |
| Settings | `SettingsScreen.tsx` | Notification preferences, password change, logout |

---

## 14. Implementation Details

### AI Document Analysis Flow

The Gemini integration uses the `gemini-1.5-flash` model. When a document is submitted for analysis:

1. The backend fetches the document's binary content from its Cloudinary URL using `node-fetch`.
2. For images, the binary data is base64-encoded and passed as an inline image part.
3. For PDFs, Cloudinary's URL transformation is used to fetch a JPEG preview of the first page.
4. A structured prompt instructs Gemini to return a JSON object with specific fields.
5. The JSON response is parsed and stored as an `AIAnalysis` record.
6. The parent `Document` record is updated with AI-extracted fields and `isAIProcessed: true`.

### Expiry Tracking

A `node-cron` job runs every day at 09:00 AM:
1. Fetches all documents with an `expiryDate` where the user has `expiryReminders: true`.
2. Calculates days until expiry.
3. For each document expiring in exactly 1, 7, or 30 days (matching user's `reminderDays`):
   - Checks if a Reminder record for that document + reminderType already exists for today (deduplication).
   - If not, creates a Reminder record and calls the Expo Push API to send a notification.

### Security Architecture

- Gemini API key, Cloudinary credentials, and MongoDB URI are stored server-side only in environment variables.
- The mobile app never receives or stores any cloud service credentials.
- JWT tokens are stored in Expo SecureStore (encrypted device storage, not AsyncStorage).
- All document queries include a `userId` filter, preventing cross-user data access.
- File uploads are validated for MIME type (`application/pdf`, `image/*`) and size (10MB limit).

---

## 15. Testing

### Manual Testing Checklist

**Authentication:**
- [ ] Register with valid email/password → receives JWT token
- [ ] Login with correct credentials → navigates to Home
- [ ] Invalid password → error message displayed
- [ ] Token persists across app restart
- [ ] Logout clears token and navigates to Login

**Document Management:**
- [ ] Upload PDF file → appears in My Documents
- [ ] Upload image file → appears in My Documents
- [ ] File > 10MB → rejected with error message
- [ ] Delete document → removed from list
- [ ] Update document title/description → changes reflected

**AI Analysis:**
- [ ] Trigger AI analysis on uploaded document → analysis displayed
- [ ] AI confidence score shown as percentage bar
- [ ] Extracted fields editable and saveable
- [ ] AI analysis persists after navigating away

**Expiry Tracking:**
- [ ] Document with past expiry date shows "Expired" status
- [ ] Document expiring within 30 days shows "Expiring Soon"
- [ ] Document with no expiry date shows "No Expiry"
- [ ] Expiry Tracker screen groups documents correctly

**Search:**
- [ ] Search by document title returns matching results
- [ ] Category filter narrows results
- [ ] Status filter works
- [ ] Sort by name and date works

### API Testing (Postman)
All 19 API endpoints were tested using Postman:
- Authentication flows tested with valid and invalid credentials
- Document CRUD operations verified with JWT tokens
- Multipart file upload tested with PDF and image files
- AI analysis endpoint tested with real documents
- Dashboard stats endpoint returns correct aggregated data

---

## 16. Deployment

### Backend Deployment (Render)

**Steps:**
1. Push the `backend/` directory to a GitHub repository.
2. Create a new **Web Service** on [render.com](https://render.com).
3. Connect the GitHub repository.
4. Set:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `node dist/index.js`
   - **Root Directory:** `backend`
5. Add all environment variables from `backend/.env.example` in the Render dashboard.
6. Deploy. The service URL will be `https://<service-name>.onrender.com`.
7. Update `mobile/.env`: `EXPO_PUBLIC_API_URL=https://<service-name>.onrender.com/api`

### Mobile App Build (Expo EAS)

**Prerequisites:**
- Expo account at [expo.dev](https://expo.dev)
- EAS CLI: `npm install -g eas-cli`
- Logged in: `eas login`

**Steps:**
1. Update `mobile/app.json` → set `extra.eas.projectId` to your Expo project ID.
2. From the `mobile/` directory:
   ```bash
   eas build --platform android --profile production
   ```
3. Download the generated `.apk` from the Expo dashboard.
4. Install on Android device for testing.

### Environment Variables Summary

**Backend (required):**
```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<long_random_string>
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
GEMINI_API_KEY=...
NODE_ENV=production
```

**Mobile (`.env`):**
```
EXPO_PUBLIC_API_URL=https://<your-render-url>.onrender.com/api
```

---

## 17. Conclusion and Future Work

### Conclusion

DocuWise successfully demonstrates a complete, production-ready full-stack mobile application integrating:
- Secure cross-platform mobile UI with React Native and Expo
- RESTful backend API with Node.js and Express
- NoSQL database with MongoDB Atlas
- Cloud file storage with Cloudinary
- AI-powered document intelligence with Google Gemini
- Automated expiry tracking with push notifications

The application meets all stated objectives and academic requirements, providing a genuinely useful tool for managing personal documents with AI assistance.

### Future Work

| Enhancement | Description |
|-------------|-------------|
| OCR Processing | Extract text from scanned paper documents |
| Document Sharing | Securely share documents with family members |
| Offline Mode | Cache recently accessed documents for offline viewing |
| iOS Support | TestFlight distribution and App Store submission |
| Multi-language | UI localization for regional languages |
| Biometric Auth | Face ID / fingerprint lock before accessing documents |
| Smart Reminders | AI-suggested renewal services based on document type |
| Bulk Upload | Upload multiple documents simultaneously |
| Export | Export all documents as a ZIP archive |
| Web Dashboard | Browser-based companion dashboard for desktop users |
