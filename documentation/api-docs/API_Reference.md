# DocuWise – REST API Reference

**Version:** 1.0.0  
**Base URL (Local):** `http://localhost:5000/api`  
**Base URL (Production):** `https://docuwise-backend.onrender.com/api`  
**Content-Type:** `application/json` (unless noted otherwise)  
**Authentication:** `Authorization: Bearer <jwt_token>` header required on all protected endpoints.

---

## Standard Response Format

```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... }
}
```

Error response:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (dev mode only)"
}
```

---

## 1. Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "password": "securepassword123"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64abc123...",
      "name": "Rahul Sharma",
      "email": "rahul@example.com",
      "notificationPreferences": {
        "expiryReminders": true,
        "reminderDays": [30, 7, 1]
      },
      "createdAt": "2026-11-01T10:00:00.000Z"
    }
  }
}
```

---

### POST /auth/login
Login and receive JWT token.

**Request Body:**
```json
{
  "email": "rahul@example.com",
  "password": "securepassword123"
}
```

**Response 200:** Same as `/auth/register` response.

---

### GET /auth/me
Get authenticated user's profile.

**Response 200:**
```json
{
  "success": true,
  "message": "Profile retrieved",
  "data": {
    "id": "64abc123...",
    "name": "Rahul Sharma",
    "email": "rahul@example.com",
    "notificationPreferences": { "expiryReminders": true, "reminderDays": [30, 7, 1] },
    "createdAt": "2026-11-01T10:00:00.000Z"
  }
}
```

---

### PUT /auth/profile
Update user name and/or email.

**Request Body:**
```json
{
  "name": "Rahul Kumar Sharma",
  "email": "rahulnew@example.com"
}
```

**Response 200:** Returns updated user object.

---

### PUT /auth/change-password
Change user password.

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**Response 200:**
```json
{ "success": true, "message": "Password changed successfully" }
```

---

### PUT /auth/push-token
Store Expo push notification token.

**Request Body:**
```json
{ "pushToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]" }
```

**Response 200:**
```json
{ "success": true, "message": "Push token updated" }
```

---

## 2. Document Endpoints

### POST /documents/upload
Upload a new document.

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `document` (file, required): PDF or image file (max 10MB)
- `title` (string, required): Document display name
- `category` (string, optional): One of Identity/Educational/Vehicle/Insurance/Financial/Property/Medical/Legal/Other
- `description` (string, optional): Notes about the document
- `holderName` (string, optional): Name on the document
- `documentNumber` (string, optional): ID/registration number
- `issuingAuthority` (string, optional): Issuing body
- `issueDate` (string, optional): ISO date string
- `expiryDate` (string, optional): ISO date string

**Response 201:**
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "_id": "64def456...",
    "userId": "64abc123...",
    "title": "Indian Passport",
    "category": "Identity",
    "fileUrl": "https://res.cloudinary.com/...",
    "fileType": "pdf",
    "fileSize": 1245678,
    "cloudinaryPublicId": "docuwise/...",
    "originalFileName": "passport.pdf",
    "expiryStatus": "Valid",
    "isAIProcessed": false,
    "tags": [],
    "createdAt": "2026-11-01T10:00:00.000Z",
    "updatedAt": "2026-11-01T10:00:00.000Z"
  }
}
```

---

### GET /documents
List and search documents.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Full-text search |
| `category` | string | Filter by category |
| `status` | string | Filter by expiryStatus |
| `sortBy` | string | Field to sort by (default: `createdAt`) |
| `order` | string | `asc` or `desc` (default: `desc`) |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10) |

**Response 200:**
```json
{
  "success": true,
  "message": "Documents retrieved",
  "data": {
    "documents": [ { ... } ],
    "pagination": {
      "total": 42,
      "page": 1,
      "pages": 5
    }
  }
}
```

---

### GET /documents/categories
Get document count per category.

**Response 200:**
```json
{
  "success": true,
  "data": [
    { "category": "Identity", "count": 5 },
    { "category": "Vehicle", "count": 3 }
  ]
}
```

---

### GET /documents/expiry-tracker
Get documents grouped by expiry status.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "expiringSoon": [ { ... } ],
    "expired": [ { ... } ],
    "valid": [ { ... } ],
    "noExpiry": [ { ... } ]
  }
}
```

---

### GET /documents/:id
Get a single document by ID.

**Response 200:** Returns document object.

---

### PUT /documents/:id
Update document metadata.

**Request Body:** Any subset of document fields (title, description, category, holderName, documentNumber, issuingAuthority, issueDate, expiryDate, tags).

**Response 200:** Returns updated document object.

---

### DELETE /documents/:id
Delete a document and its Cloudinary file.

**Response 200:**
```json
{ "success": true, "message": "Document deleted successfully" }
```

---

### PUT /documents/:id/replace
Replace the document file (creates a version record).

**Content-Type:** `multipart/form-data`  
**Form Fields:** `document` (file, required)

**Response 200:** Returns updated document object with new fileUrl.

---

## 3. AI Analysis Endpoints

### POST /ai/analyze
Run Gemini AI analysis on a document.

**Request Body:**
```json
{ "documentId": "64def456..." }
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "analysis": {
      "_id": "64ghi789...",
      "documentId": "64def456...",
      "documentType": "Indian Passport",
      "category": "Identity",
      "extractedFields": {
        "surname": "Sharma",
        "givenNames": "Rahul Kumar",
        "nationality": "Indian",
        "passportNumber": "A1234567"
      },
      "summary": "This is an Indian passport issued to Rahul Kumar Sharma...",
      "importantDetails": [
        "Valid until 2030-05-15",
        "Issued by Ministry of External Affairs",
        "Machine Readable Passport"
      ],
      "holderName": "Rahul Kumar Sharma",
      "documentNumber": "A1234567",
      "issuingAuthority": "Ministry of External Affairs, India",
      "issueDate": "2020-05-15T00:00:00.000Z",
      "expiryDate": "2030-05-15T00:00:00.000Z",
      "confidence": 0.95,
      "createdAt": "2026-11-01T10:05:00.000Z"
    },
    "document": { ... }
  }
}
```

---

### GET /ai/analysis/:documentId
Get the stored AI analysis for a document.

**Response 200:** Returns the AIAnalysis object.

---

## 4. Dashboard Endpoint

### GET /dashboard
Get dashboard statistics.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "totalDocuments": 42,
    "categoryCounts": [
      { "category": "Identity", "count": 8 },
      { "category": "Vehicle", "count": 5 }
    ],
    "statusCounts": [
      { "status": "Valid", "count": 30 },
      { "status": "Expiring Soon", "count": 7 },
      { "status": "Expired", "count": 3 },
      { "status": "No Expiry", "count": 2 }
    ],
    "recentDocuments": [ { ... } ],
    "upcomingExpiries": [ { ... } ]
  }
}
```

---

## 5. Notification Endpoints

### GET /notifications
Get paginated list of notifications (Reminders).

**Query Parameters:**
| Param | Default | Description |
|-------|---------|-------------|
| `page` | 1 | Page number |
| `limit` | 20 | Items per page |

**Response 200:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "_id": "64jkl012...",
        "documentId": { "_id": "64def456...", "title": "Car Insurance" },
        "reminderType": "7_day",
        "message": "Your document 'Car Insurance' expires in 7 days (2026-11-24).",
        "isRead": false,
        "sentAt": "2026-11-17T09:00:00.000Z",
        "createdAt": "2026-11-17T09:00:00.000Z"
      }
    ],
    "pagination": { "total": 5, "page": 1, "pages": 1 }
  }
}
```

---

### PUT /notifications/preferences
Update notification preferences.

**Request Body:**
```json
{
  "expiryReminders": true,
  "reminderDays": [30, 7, 1]
}
```

**Response 200:**
```json
{
  "success": true,
  "data": { "expiryReminders": true, "reminderDays": [30, 7, 1] }
}
```
