# API Reference

This document maps the existing Node.js + Express backend endpoints that the Android application will consume.

## Base URL
`https://<your-backend-url>/api`

## Authentication Flow
- **Citizen App:** Firebase Auth. Android app gets a token from Firebase SDK, sends it as `Bearer <token>` in `Authorization` header.
- **Authority App:** JWT Auth. `Authority.js` uses email/password, returning a JWT token for headers.

## API Inventory

### 1. Upload
- `POST /upload`
  - **Body:** `multipart/form-data` with `image` file.
  - **Returns:** `{ imageUrl: "https://cloudinary..." }`
  
### 2. Complaints
- `POST /complaints` - Create a new complaint (needs Auth)
- `GET /complaints` - Fetch all complaints (public/auth)
- `GET /complaints/user` - Fetch logged-in user's complaints
- `GET /complaints/:id` - Fetch single complaint details
- `PATCH /complaints/:id/status` - Update status (Admin)
- `POST /complaints/:id/upvote` - Upvote a complaint

### 3. AI Capabilities
- `POST /ai/analyze` - Analyzes image using Gemini (returns title, desc, severity)
- `POST /ai/validate-image` - Validates if image is civic issue
- `POST /ai/translate` - Translates text
- `POST /ai/chat` - Chatbot endpoint

### 4. GIS / Location
- `POST /location/detect-authority` - Determines the administrative body based on lat/lng (gram_panchayat, municipal_corporation, etc.)

### 5. Authority
- `POST /authority/login` - Login for officials
- `GET /authority/dashboard` - Authority dashboard metrics

### 6. Notifications
- `GET /notifications` - Fetch user notifications
- `POST /notifications/mark-read` - Mark read

### 7. Duplicates
- `POST /duplicates/check` - Check for duplicate complaints based on embeddings/location.
