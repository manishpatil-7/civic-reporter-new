# Mobile App Context & Architecture

This document provides the high-level context, constraints, and architecture rules for the new native Android application for Civic Reporter.

## 1. Clean Architecture (MVVM)
The project strictly follows the MVVM pattern to ensure clean separation of concerns:
`Screen (Compose) -> ViewModel -> Repository -> ApiService -> Backend`

**Rule:** No API logic or data fetching directly inside Compose UI screens.

## 2. Authentication Flow
Do NOT create a new login system. Use the existing flow:
1. Android uses Firebase Authentication SDK.
2. Token is sent to the Node backend.
3. Backend fetches user and returns roles (`CITIZEN`, `AUTHORITY_ADMIN`, etc.).

## 3. Networking
- Use **Retrofit + OkHttp**.
- Structured into specific services: `ApiService`, `AuthService`, `ComplaintService`, `UploadService`, `LocationService`, `NotificationService`.

## 4. Hardware Integration
- **Camera/Gallery:** Use native Android camera APIs. Support photo preview, retake, compress, and upload. Preserve original EXIF metadata.
- **Location:** Rely on Android GPS for lat/lng. Send coordinates to the backend for reverse geocoding and GIS boundary detection. (Fallback: GPS -> EXIF -> Manual map pin).

## 5. Machine Learning (Phased Approach)
1. **Initial Phase:** Backend relies on Gemini for analysis.
2. **Later Phase:** Integrate Local YOLO model on Android.
   - Flow: Photo -> Local YOLO -> Confidence Score.
   - High Confidence -> Accept.
   - Low Confidence -> Fallback to Backend Gemini analysis.

## 6. Offline Support (Draft Mode)
- Built using local storage (Room database) and background synchronization (WorkManager).
- Flow: No internet -> Take photo -> GPS saved -> Draft stored locally -> Internet returns -> Auto upload.

## 7. Push Notifications
- Integrated real push notifications (e.g., Assigned, In Progress, Resolved).
- Deep linking: Tapping a notification opens the Complaint Detail screen.

## 8. Development Phasing Constraints
- **Do not mix Authority features** into the citizen app initially. Stabilize the citizen flow first, then build the Authority dashboard.
- Enforce `authorityId` strictly on the backend when building Authority features.

## 9. Security Constraints
- **NEVER** place backend secrets inside the APK (e.g., MongoDB password, Gemini keys, JWT secrets, Firebase Admin credentials).
- The Android app acts purely as a client; it must communicate exclusively with the backend via APIs.

## 10. QA & Testing Strategy
- Testing must target **real Android hardware**, including mid-range/cheap devices to expose performance issues.
- Must test: Hardware (Camera/GPS), network edges (Slow/No internet), permission denials, edge cases (large/small photos), system back button navigation, auth states (login/logout/expiry), and variable screen sizes.

## 11. Build & Distribution
- **Milestone 1:** Debug APK.
- **Milestone 2:** Release Build -> Signed APK (e.g., `CivicReporter.apk` for the college demo).
- **Future:** AAB deployment for Google Play Store.
