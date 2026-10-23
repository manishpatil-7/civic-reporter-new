# Mobile Implementation Plan — Civic Reporter React Native App

## 1. Current Architecture Audit

### Existing Backend APIs (Express.js on port 5000)
| Route Prefix | File | Purpose |
|---|---|---|
| `/api/ai` | `routes/ai.js` | Gemini image analysis + translation |
| `/api/complaints` | `routes/complaint.js` | CRUD, upvote, status updates |
| `/api/upload` | `routes/upload.js` | Cloudinary image upload (multer) |
| `/api/authority` | `routes/authority.js` | Reverse geocoding + authority detection |
| `/api/users` | `routes/users.js` | User management, RBAC, admin requests |
| `/api/notifications` | `routes/notification.js` | Notification CRUD |
| `/api/otp` | `routes/otp.js` | Email OTP verification |
| `/api/location` | `routes/location.js` | EXIF location extraction + reverse geocode |
| `/api/duplicates` | `routes/duplicate.js` | AI-based duplicate detection |

### Authentication Flow
- Firebase Auth (email/password) — client-side SDK
- Firebase ID Token sent as `Authorization: Bearer <token>` header
- Backend verifies via Firebase Admin SDK (`middleware/auth.js`)
- User roles stored in Firestore `users` collection (citizen / admin)

### Complaint Workflow (from web `api.js`)
1. `uploadImage(file)` → POST `/api/upload` → Cloudinary URL
2. `analyzeImage(file, context)` → uploads then POST `/api/ai/analyze` → AI result
3. `checkDuplicate(type, desc, location)` → POST `/api/duplicates/check`
4. `detectAuthority(lat, lng)` → POST `/api/authority/detect`
5. `translateLetter(text, lang)` → POST `/api/ai/translate`
6. `createComplaint(data)` → POST `/api/complaints`
7. Tracking: `getComplaintsByUser(uid)`, `getComplaintById(id)`, `upvoteComplaint(id)`

### Database Model (MongoDB — `Complaint.js`)
Key fields: imageUrl, afterImageUrl, problemType, severity, priority, description, formalLetter, userId, userName, department, authorityType, authorityBody, translatedLetter, translatedLanguage, location{lat,lng,address}, status, state, district, city, area, upvotes, upvotedBy[], timeline[], verificationStatus, embedding[], etc.

### Backend Changes Required
- **None for core functionality.** All APIs are already RESTful and accept JSON + multipart/form-data.
- The mobile app will use the exact same endpoints with the same auth contract.

---

## 2. Required Mobile Screens

### Auth Stack
- LoginScreen
- SignupScreen

### Main Tab Navigator (Citizen)
- HomeScreen — branding, quick report, recent complaints, stats
- ReportIssueScreen (multi-step flow)
- MyComplaintsScreen — list of user's complaints
- NotificationsScreen — notification list
- ProfileScreen — user info, logout, request admin

### Complaint Flow Stack
- Step 1: CaptureScreen (camera / gallery)
- Step 2: LocationScreen (GPS + map picker)
- Step 3: AnalysisScreen (AI processing + results)
- Step 4: DuplicateCheckScreen (if duplicates found)
- Step 5: AuthorityScreen (authority detection result)
- Step 6: ReviewScreen (full review + translate)
- Step 7: SuccessScreen (complaint submitted)

### Complaint Detail Stack
- ComplaintDetailsScreen (image, info, map, timeline, upvote)

### Admin Stack (role-gated)
- AdminDashboardScreen
- AdminComplaintListScreen
- AdminComplaintDetailScreen (status update, remarks, proof upload)

---

## 3. Technology Choices

| Concern | Choice | Rationale |
|---|---|---|
| Framework | React Native (Expo managed → prebuild) | Camera, maps, file system all supported. Easy Android builds. |
| Language | TypeScript | Per README requirement |
| Navigation | React Navigation 7 | Industry standard for RN |
| Maps | react-native-maps | Native MapView, markers, regions |
| Camera/Gallery | expo-image-picker | Camera + gallery + permissions |
| HTTP | Axios | Match web app pattern |
| Auth | @react-native-firebase/auth + @react-native-firebase/firestore | Same Firebase project |
| Storage | expo-secure-store | Secure token persistence |
| PDF | react-native-print or expo-print | Share/print complaint letters |
| Theme | Green + White design system | Per README requirement |

---

## 4. Risk Areas
1. **Firebase config** — need `google-services.json` for Android
2. **Google Maps API key** — needs Android restriction in Google Cloud Console
3. **Image upload** — multipart/form-data from RN (use FormData API)
4. **Expo prebuild** — needed for native modules (maps, camera)
5. **Backend CORS** — already uses `cors()` middleware, should work

---

## 5. Implementation Phases

### Phase 2: Scaffold ← START HERE
### Phase 3: Authentication
### Phase 4: Core Citizen Flow (Report Issue)
### Phase 5: Tracking (My Complaints, Details, Notifications)
### Phase 6: Admin
### Phase 7: Polish
### Phase 8: Testing
