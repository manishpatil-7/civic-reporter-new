# SYSTEM AUDIT REPORT (Civic Reporter)

**Date:** Oct 6, 2026
**Status:** Audit Complete (No code modified)

## 1. Backend API Inventory
- **`/api/ai`**: `analyze`, `validate-image`, `translate`, `chat`
- **`/api/complaints`**: CRUD for complaints, plus status patching and upvoting.
- **`/api/upload`**: Cloudinary integration for image storage.
- **`/api/authority`**: Admin auth (`/login`) and dashboard metrics.
- **`/api/users`**: Profile management and points retrieval.
- **`/api/notifications`**: Fetch and mark-read mechanisms.
- **`/api/otp`**: Handling OTP logic.
- **`/api/location`**: Extracting location from EXIF/Plus codes and resolving authority.
- **`/api/duplicates`**: AI embedding-based cosine similarity check for duplicates.

## 2. Authentication Flow
- **Citizens:** Uses Firebase Auth (client-side). Backend verifies token (`admin.auth().verifyIdToken`) in `auth.js` middleware.
- **Authorities/Admins:** Custom JWT + Bcrypt flow handled in `/api/authority/login` backed by MongoDB `Authority` collection.

## 3. User/Role Model
- Roles: `CITIZEN` (default Firebase user), `SUPER_ADMIN`, `CITY_ADMIN`, `VILLAGE_ADMIN` (Authority collection).
- `users` (Firestore) holds profile info and basic role fallback.

## 4. Complaint Schema
- Found in `models/Complaint.js`.
- Key fields: `imageUrl`, `afterImageUrl`, `problemType`, `severity`, `priority`, `description`, AI verifications (`imageValidation`, `categoryMatch`), Location (`lat`, `lng`, `address`, `state`, `district`, `city`, `area`), `status`, `timeline` array, `spamStatus`, and Gemini `embedding` (vector array).

## 5. Image Upload Process
- `POST /api/upload` using `multer` (disk storage on backend or memory storage for direct processing).
- Pipes file to **Cloudinary** (`cloudinary.uploader.upload`).
- Returns `secure_url`.

## 6. AI Process
- Uses `@google/generative-ai` (`gemini-2.5-flash`).
- Prompts extract `title`, `description`, `severity`, and `authorityType` directly from images.
- Checks if the image is truly a civic issue (`validate-image`).
- Text translation capability for formal letters.

## 7. Location Process
- Extract EXIF GPS data from images using `exifr` in memory (`multer.memoryStorage()`).
- Parses Google Plus Codes.
- Resolves coordinates into structured addresses using **Nominatim (OpenStreetMap)** reverse geocoding.

## 8. GIS Authority Process
- Mapped in `location.js` and `authorityData.js`.
- Logic looks at the Nominatim response (`town`, `village`, `city`, `county`).
- Assigns jurisdiction (e.g., `gram_panchayat` for villages, `municipal_corporation` for cities).

## 9. Duplicate Detection Process
- Found in `duplicate.js` and `utils/similarity.js`.
- Uses Gemini embeddings to turn complaints into mathematical vectors.
- Calculates **Cosine Similarity** (threshold 0.80 by default) against recent complaints in the same `district`/`city`/`area`.
- Max candidates: 50, Lookback: 7 days.

## 10. Notification Process
- Found in `Notification.js`. Simple MongoDB schema linked to `userId`.
- Contains `message`, `type`, `read` (boolean). 

## 11. Admin/Authority Process
- `Authority.js` stores credentials and jurisdiction boundaries (`state`, `district`, `city`, `area`).
- Only authorized admins can change a complaint's status to "Resolved".
- Metrics (open, resolved, escalated) are served to the dashboard based on jurisdiction.

## 12. Existing Environment Variables
- `PORT`
- `MONGO_URI`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `GEMINI_API_KEY`
- `EMAIL_USER`, `EMAIL_PASS` (for Nodemailer)
- `JWT_SECRET`

## 13. Client-Safe vs Server-Only Configuration
- **Server-Only (Must never leak to Android):** `MONGO_URI`, `CLOUDINARY_API_SECRET`, `GEMINI_API_KEY`, `JWT_SECRET`, `EMAIL_PASS`.
- **Client-Safe (Android can use):** Firebase config (App ID, API Key, Project ID), standard API base URL.

## 14. Existing Web Screens
- `frontend/src/pages/`: `Home`, `Login`, `Signup`, `Submit` (complaint flow wizard), `MyComplaints`, `Details`, `Dashboard` (Citizen), `Admin` (Super Admin), `authority/Dashboard`, `authority/ComplaintDetail`.
- Components: `LocationDetector`, `AIChatbot`, `UploadBox`, `StatusTracker`.

## 15. Reusable Business Logic
- The backend's duplicate detection, Nominatim GIS translation, Gemini prompts, and Cloudinary upload logic must remain exclusively on the backend. The Android app will merely invoke the endpoints and render the results.
