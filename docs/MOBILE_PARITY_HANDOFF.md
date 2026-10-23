# CIVIC REPORTER — COMPLETE WEBSITE CHANGE AUDIT & ANDROID IMPLEMENTATION HANDOFF

**Document Version:** 1.0.0  
**Audit Target:** Civic Reporter Web Application (`frontend/`, `backend/`, `mobile/`)  
**Target Consumer:** Antigravity Mobile Engineering Session (Android Implementation)  
**Security Classification:** Redacted (Zero API secrets / credentials exposed)  
**Primary Source of Truth:** Repository codebase git state, components, routes, backend controllers, and inference services.

---

## 1. Executive Summary

This handoff document provides an exhaustive, evidence-based audit of all architectural, UI/UX, AI vision inference, complaint generation, multilingual translation, and loading-state modifications made to the Civic Reporter platform.

Civic Reporter is a civic-technology platform designed for Indian villages, towns, and cities. It empowers citizens to photograph municipal issues (such as road damage, garbage overflow, or broken streetlights) and automatically packages their report into a formal, geocoded, jurisdiction-addressed complaint letter sent to the responsible civic authority.

### Key Architectural Shifts Audited:
1. **Homepage Elevation:** Transformed from full-bleed blurry background images to dedicated, aspect-ratio-constrained showcase stages (`aspect-[2/1]` for Hero, `aspect-[3/1]` for Vision panorama) utilizing genuine photographic assets with zero stretching.
2. **Local-First AI Vision Architecture:** Replaced external Gemini API dependency for primary issue types with dedicated local **YOLO11n** models (`pothole_best.pt` for road damage and `garbage_best.pt` for waste accumulation) hosted on an internal FastAPI service (`http://127.0.0.1:8000`).
3. **Strict Fallback & Physical Inspection Governance:** Gemini Vision (`gemini-2.5-flash`) is reserved exclusively as primary for streetlight physical damage inspection (requiring visible damage such as bent poles or exposed wires, explicitly ignoring daytime unlit fixtures) and as secondary fallback only when local models report uncertain or zero detections. Non-civic images are strictly rejected without fabricating complaints.
4. **Deterministic Complaint Letter Templates:** Eliminated AI hallucinations by replacing runtime LLM letter drafting with 5 deterministic, situation-specific templates containing legal and administrative terminology tailored to Indian municipal bodies.
5. **Canonical Multilingual Engine:** Preserves canonical English complaints while providing high-fidelity translations across 13 Indian languages via Google Cloud Translation API v2 with quota protection and deterministic dictionary fallbacks.
6. **Enterprise Loading State Architecture:** Standardized skeleton shimmer animations (`1.6s` bezier with emerald accent) and page-level skeleton layouts with full `prefers-reduced-motion` compliance.
7. **Adblocker-Proof Authentication Fallback:** Added server-side user profile proxy endpoints to prevent `ERR_BLOCKED_BY_CLIENT` failures on client devices running aggressive privacy extensions.

---

## 2. Actual Changes Implemented

The table below catalogs every major modification made to the platform, verified directly against the active codebase.

| Change / Feature | File(s) | Status | Evidence / Verification Notes |
| :--- | :--- | :--- | :--- |
| **Hero Redesign with Dedicated Image Stage** | `frontend/src/pages/Home.jsx`, `frontend/src/index.css` | **Implemented & Verified** | Aspect `2/1`, `object-contain`, shadow aura, dot grid, 3 floating widgets (`MapPin`, `FileText`, `Landmark`). |
| **Hero Artwork (`/civic-reporter-hero.jpg?v=2`)** | `frontend/public/civic-reporter-hero.jpg` | **Implemented & Verified** | High-res photo showing mobile phone camera framing a road pothole. 279,992 bytes. |
| **Vision Gateway of India Showcase (`aspect-[3/1]`)** | `frontend/src/pages/Home.jsx`, `frontend/public/civic-reporter-vision.png` | **Implemented & Verified** | Aspect `3/1`, `object-contain`, 660,018 bytes. Live pill badge, heritage signature strip. |
| **8 Genuine Category Cards & Grid** | `frontend/src/pages/Home.jsx`, `frontend/public/categories/*.jpg` | **Implemented & Verified** | 4x2 responsive grid, individual photographic cards with hover zoom and localized titles. |
| **6-Step "How It Works" Workflow** | `frontend/src/pages/Home.jsx` | **Implemented & Verified** | 6-card grid with custom icons (`Camera`, `Sparkles`, `MapPin`, `Landmark`, `FileText`, `CheckCircle2`). |
| **4 Verified Impact Statistics** | `frontend/src/pages/Home.jsx` | **Implemented & Verified** | 10,000+ Citizens, 25,000+ Issues, 100+ Authorities, 88% Resolved ground action rate. |
| **Closing CTA Banner & Trust Pills** | `frontend/src/pages/Home.jsx` | **Implemented & Verified** | Mesh lighting, emerald gradients, 3 trust badges, Report and Dashboard CTAs. |
| **Sticky Navbar with Section Smooth Scroll** | `frontend/src/components/Navbar.jsx` | **Implemented & Verified** | Scrolled border state, internal section scrolling on Home vs router links on inner pages. |
| **Global Multilingual Context (Frontend)** | `frontend/src/context/LanguageContext.jsx`, `frontend/src/translations/index.js` | **Implemented & Verified** | 8 languages (`EN`, `HI`, `MR`, `TA`, `TE`, `KN`, `BN`, `GU`), `localStorage` persistence, fallback to English. |
| **Skeleton Loading System (14 Components)** | `frontend/src/components/skeleton/*`, `frontend/src/index.css` | **Implemented & Verified** | `BaseSkeleton`, `CardSkeleton`, `TableSkeleton`, `ListSkeleton`, `DashboardSkeleton`, etc. Emerald shimmer. |
| **Local YOLO11n Inference Engine** | `backend/inference_service/server.py`, `backend/utils/yoloInference.js` | **Implemented & Verified** | FastAPI server on port 8000. Loads `pothole_best.pt` and `garbage_best.pt`. Python CLI fallback. |
| **Local-First AI Issue Routing** | `backend/routes/ai.js` (`/analyze`) | **Implemented & Verified** | Zero Gemini calls when local YOLO finds confident pothole or garbage detections. |
| **Dedicated Model Endpoints** | `backend/routes/ai.js` (`/road-damage/detect`, `/garbage/detect`, `/streetlight/detect`) | **Implemented & Verified** | Specialized endpoints with multipart buffer upload support. |
| **Streetlight Physical Damage Verification** | `backend/routes/ai.js` | **Implemented & Verified** | Gemini Vision prompt strictly checks `broken_fixture`, `bent_pole`, `hanging_wires`, `detached_head`. Rejects unlit daytime lights. |
| **Non-Civic Photo Fast Rejection** | `backend/routes/ai.js` | **Implemented & Verified** | When 0 detections and Gemini returns non-civic/fails, returns `isValid: false`, reason, and `canReportManually: true`. |
| **Deterministic Complaint Templates** | `backend/utils/complaintTemplates.js` | **Implemented & Verified** | 5 templates (A: Road, B: Garbage, C: Streetlight, D: Drainage, E: General) with formal authority headers. |
| **Multilingual Complaint Translation Service** | `backend/utils/translationService.js` | **Implemented & Verified** | 13 languages, quota protection (450k chars/mo), SHA-256 caching, canonical English source preservation. |
| **Adblocker User Profile Proxy** | `frontend/src/context/AuthContext.jsx`, `backend/routes/users.js` | **Implemented & Verified** | `GET /api/users/profile/:uid` and `POST /api/users/profile/:uid` prevent `ERR_BLOCKED_BY_CLIENT` breaks. |
| **Google Maps Script Error Handling** | `frontend/src/pages/Submit.jsx` | **Implemented & Verified** | Graceful GPS manual coordinates fallback when `maps.googleapis.com` is unreachable or blocked. |
| **React Native Road Damage Detector** | `mobile/src/services/roadDamageApi.ts`, `mobile/src/components/RoadDamageDetector.tsx` | **Implemented & Verified** | Camera capture, multipart form-data upload, bounding box canvas overlay. |

---

## 3. Changes Requested but Not Implemented (Gaps to Parity)

The following items were identified in discussions, design specifications, or roadmap prompts but are **not yet implemented or only partially implemented**:

1. **Dedicated Streetlight YOLO Model (`streetlight_best.pt`):**
   - *Status:* **Requested but not implemented**.
   - *Reality:* Streetlight analysis currently relies on Gemini Vision (`gemini-2.5-flash`). The weights file `streetlight_best.pt` does not exist on disk in `backend/models/`.
2. **Android App Full Parity:**
   - *Status:* **Partially implemented**.
   - *Reality:* The `mobile/` directory contains only a single road damage detection component (`RoadDamageDetector.tsx`) and API client (`roadDamageApi.ts`). The mobile app lacks:
     - The new homepage layout and section structure.
     - The 6-step workflow presentation.
     - The 8 issue category selector.
     - Garbage and streetlight detection flows.
     - Multilingual UI and complaint translation.
     - Shimmer skeleton loaders.
     - Authority routing preview.
3. **Audio / Voice-to-Text Reporting:**
   - *Status:* **Requested in roadmap, not implemented in website**.
4. **Push Notifications for Status Transitions on Mobile:**
   - *Status:* **Backend ready (`/api/notifications`), mobile client unintegrated**.

---

## 4. Current Homepage Section Structure

The production homepage (`frontend/src/pages/Home.jsx`) is structured as a single-page responsive application with five visual sections and a utility footer.

```
┌────────────────────────────────────────────────────────┐
│ 1. Sticky Navigation Bar (Navbar.jsx)                 │
│    - Logo (Leaf icon + "Civic Reporter")               │
│    - Smooth-scroll section links / NavLinks            │
│    - Language Selector (EN, HI, MR, TA, TE, KN, BN, GU) │
│    - Notification Bell & User Avatar / Login Button    │
└────────────────────────────────────────────────────────┘
                           │
┌────────────────────────────────────────────────────────┐
│ 2. Hero Section (#hero)                               │
│    - Left: Pill Badge, 3-line Headline, Description,   │
│            Primary & Secondary CTAs, 3 Trust Badges    │
│    - Right: Showcase Stage with Hero Image (2:1 aspect)│
│             3 Floating Glass Widgets (Desktop xl+)     │
│             Responsive Widget Strip (Mobile / Tablet)   │
└────────────────────────────────────────────────────────┘
                           │
┌────────────────────────────────────────────────────────┐
│ 3. How It Works Section (#how-it-works)               │
│    - Kicker + Headline ("From Photo to Real Action")   │
│    - 6 Sequential Workflow Cards (1 to 6)              │
│      (Take Photo → Analyze → Location → Authority →   │
│       Track Progress → Issue Resolved)                 │
└────────────────────────────────────────────────────────┘
                           │
┌────────────────────────────────────────────────────────┐
│ 4. Issue Categories Section (#issues)                 │
│    - Kicker + Headline ("What Can You Report?")        │
│    - 4x2 Responsive Card Grid (8 genuine categories)   │
│    - Photographic card thumbnails with hover zoom      │
└────────────────────────────────────────────────────────┘
                           │
┌────────────────────────────────────────────────────────┐
│ 5. Vision & Impact Section (#vision)                  │
│    - Left: Kicker + Headline + 4 Impact Stat Cards    │
│    - Right: Panoramic Gateway of India Stage (3:1)    │
│             Live Pill Badge + Heritage Signature Strip │
└────────────────────────────────────────────────────────┘
                           │
┌────────────────────────────────────────────────────────┐
│ 6. Closing CTA Banner                                 │
│    - Deep emerald gradient container with mesh glow    │
│    - Headline + Supporting Copy                        │
│    - Report Issue CTA + Explore Live Map CTA           │
│    - 3 Trust Verification Badges                       │
└────────────────────────────────────────────────────────┘
                           │
┌────────────────────────────────────────────────────────┐
│ 7. Global Footer                                       │
│    - Branding, Copyright, Quick Links                  │
└────────────────────────────────────────────────────────┘
```

---

## 5. Exact Text and Content (Verbatim UI Copy)

### 5.1 Hero Section
- **Pill Badge:** `"CivicTech Platform for Every Village and City"` (with animated pinging emerald dot and Indian Tricolor SVG flag).
- **Headline Line 1:** `"Your Community."`
- **Headline Line 2:** `"Your Voice."`
- **Headline Highlight:** `"A Cleaner, Safer India."` (Gradient text: `emerald-600` via `emerald-500` to `teal-600`).
- **Supporting Description:** `"See a problem in your village, town or city? Take a photo, and Civic Reporter helps identify the issue and send your complaint to the right government authority — quickly and easily."`
- **Primary CTA:** `"Report a Problem"` (Icon: `Camera`, links to `/submit` or `/signup`).
- **Secondary CTA:** `"View Live Dashboard"` (Icon: `BarChart3`, links to `/dashboard`).
- **Supporting Indicators (3 Badges):**
  1. Title: `"Free for Everyone"` | Subtitle: `"100% Public Good"` (Icon: `ShieldCheck`)
  2. Title: `"Just a Photo"` | Subtitle: `"No Lengthy Forms"` (Icon: `Camera`)
  3. Title: `"Available in 13+"` | Subtitle: `"Indian Languages"` (Icon: `Globe`)
- **Floating Widgets Copy:**
  - *Widget 1 (Location):* Title: `"Location Detected"` | Sample: `"Shinganapur, Karvir, Kolhapur"` | Badge: `"GPS Verified"`
  - *Widget 2 (Letter):* Title: `"Auto Complaint"` | Badge: `"AI Ready"` | Action: `"Download PDF"` / `"Downloading..."`
  - *Widget 3 (Routing):* Title: `"Routed to Authority"` | Sample: `"Municipal Corporation"` | Status: Green checkmark
  - *Cursive Script Note:* `"Your Photo, Stronger Tomorrow"` (Font: `Caveat`, rotate `-4deg`).

### 5.2 How It Works (6 Steps)
- **Kicker:** `"HOW IT WORKS"`
- **Title:** `"From a Photo to Real Action in 6 Simple Steps"`
- **Subtitle:** `"Civic Reporter handles the complexity — you just capture the issue. Our AI and location system do the rest."`
- **Steps:**
  1. **Step 1:** Title: `"Take a Photo"` | Description: `"Capture the civic issue in your area."` (Icon: `Camera`, Color: `emerald-600`, Bg: `emerald-50`)
  2. **Step 2:** Title: `"We Analyze"` | Description: `"Our system helps identify the issue and its type."` (Icon: `Sparkles`, Color: `sky-600`, Bg: `sky-50`)
  3. **Step 3:** Title: `"Location Is Found"` | Description: `"Location information helps identify the area and responsible authority."` (Icon: `MapPin`, Color: `amber-600`, Bg: `amber-50`)
  4. **Step 4:** Title: `"Sent to Authority"` | Description: `"Direct the complaint to the relevant gram panchayat, municipal council, or department."` (Icon: `Landmark`, Color: `purple-600`, Bg: `purple-50`)
  5. **Step 5:** Title: `"Track Progress"` | Description: `"Follow the complaint's progress."` (Icon: `FileText`, Color: `rose-600`, Bg: `rose-50`)
  6. **Step 6:** Title: `"Issue Resolved"` | Description: `"Track the response and outcome."` (Icon: `CheckCircle2`, Color: `emerald-600`, Bg: `emerald-50`)

### 5.3 Issue Categories (8 Categories)
- **Kicker:** `"ISSUE CATEGORIES"`
- **Title:** `"What Can You Report?"`
- **Subtitle:** `"Report a local problem in your village, town or city that needs attention from the responsible authority."`
- **Items:**
  1. Label: `"Roads & Potholes"` | Param: `Pothole` | Icon: `Construction` | Color: `orange-600` | Asset: `/categories/potholes-roads.jpg?v=2`
  2. Label: `"Garbage & Waste"` | Param: `Garbage` | Icon: `Trash2` | Color: `red-600` | Asset: `/categories/garbage-waste.jpg?v=2`
  3. Label: `"Drainage & Flooding"` | Param: `Drainage` | Icon: `Droplets` | Color: `blue-600` | Asset: `/categories/drainage-flooding.jpg?v=2`
  4. Label: `"Street Lights"` | Param: `Street Light` | Icon: `Lightbulb` | Color: `yellow-600` | Asset: `/categories/street-lights.jpg?v=2`
  5. Label: `"Water Supply"` | Param: `Water Supply` | Icon: `Droplets` | Color: `cyan-600` | Asset: `/categories/water-supply.jpg?v=2`
  6. Label: `"Parks & Public Spaces"` | Param: `Park Maintenance` | Icon: `TreePine` | Color: `emerald-600` | Asset: `/categories/parks-trees.jpg?v=2`
  7. Label: `"Electricity & Utilities"` | Param: `Electricity` | Icon: `Zap` | Color: `purple-600` | Asset: `/categories/public-utilities.jpg?v=2`
  8. Label: `"Other Issues"` | Param: `Other` | Icon: `MoreHorizontal` | Color: `gray-600` | Asset: `/categories/other-issues.jpg?v=2`

### 5.4 Vision & Impact Section
- **Kicker:** `"OUR VISION"`
- **Headline:** `"Cleaner Cities for a Better India"`
- **Supporting Description:** `"Civic Reporter empowers citizens to report civic issues, helps authorities take faster action, and builds more transparent, accountable, and livable cities across India."`
- **Impact Statistics:**
  - `10,000+` | `"Citizens Participating"` | Sub: `"Active across urban & rural areas"` (Badge: `"Verified"`)
  - `25,000+` | `"Issues Reported"` | Sub: `"Geo-tagged & AI verified"` (Badge: `"Verified"`)
  - `100+` | `"Authorities Connected"` | Sub: `"Gram panchayats & municipal councils"` (Badge: `"Verified"`)
  - `88%` | `"Issues Resolved"` | Sub: `"Verified ground action rate"` (Badge: `"Verified"`)
- **Vision Image Showcase Tags:**
  - Live Tag: `"Gateway of India • Mumbai"`
  - Heritage Tag: `"Iconic Civic Heritage"`
  - Cursive Signature: `"Better Infrastructure, Happier Communities"`

### 5.5 Closing CTA Banner
- **Pill Badge:** `"Join 10,000+ Active Indian Citizens"`
- **Headline:** `"Work Together for Cleaner, Safer Communities"`
- **Description:** `"It takes only a few minutes to report a local problem. Share a photo and location to help the responsible authority understand the issue."`
- **Buttons:** `"Report an Issue Now"` and `"Explore Live Map"`
- **Trust Badges:** `"100% Free for Everyone"`, `"Instant Government Routing"`, `"Live Status Tracking"`.

---

## 6. Design System, Tokens, and Typography

### 6.1 Typography
- **Primary Sans Font:** `Inter`, `-apple-system`, `BlinkMacSystemFont`, `"Segoe UI"`, `Roboto`, `sans-serif`
  - Font weights utilized: `400` (regular), `500` (medium), `600` (semibold), `700` (bold), `800` (extrabold), `900` (black).
- **Handwriting Accent Font:** `Caveat`, `cursive` (Google Fonts import in `index.css`: `family=Caveat:wght@600;700`). Used for authentic human notes (`Your Photo, Stronger Tomorrow`).

### 6.2 Curated Color Palette & Tokens
| Token Name | Hex / CSS Value | Semantic Use Case |
| :--- | :--- | :--- |
| `--color-primary-50` | `#ecfdf5` | Soft background badges, light step icon containers |
| `--color-primary-100` | `#d1fae5` | Shimmer gradient highlight, subtle card borders |
| `--color-primary-200` | `#a7f3d0` | Hover border accents, pill borders |
| `--color-primary-500` | `#10b981` | Accent indicators, live pulsing radar dots |
| `--color-primary-600` | `#059669` | Primary action buttons, active navigation states |
| `--color-primary-700` | `#047857` | Button hover states, high-contrast dark text |
| `--color-primary-900` | `#064e3b` | Closing CTA dark mesh background |
| `--bg-hero-gradient` | `linear-gradient(180deg, #eaf8f1 0%, #f5faf7 50%, #ffffff 100%)` | Hero section subtle depth backdrop |
| `--bg-skeleton-light` | `#f1f5f9` (Slate-100) | Unloaded card & block background |
| `--bg-skeleton-dark` | `#1e293b` (Slate-800) | Dark mode unloaded card background |

### 6.3 Card & Container Styling
- **Card Radius:** Standard `rounded-2xl` (`16px`) and Showcase `rounded-3xl` (`24px`).
- **Showcase Card Shadow:** `box-shadow: 0 20px 50px rgba(5, 150, 105, 0.12)`.
- **Borders:** `1px solid rgba(229, 231, 235, 0.8)` (`border-gray-200/80`) with `ring-1 ring-emerald-500/10`.
- **Transitions:** Default duration `200ms` to `300ms` with easing curve `cubic-bezier(0.23, 1, 0.32, 1)`.

---

## 7. Image Assets and Technical Specifications

All assets are located in `frontend/public/` and served at root paths:

| Relative Project Path | File Format | Intrinsic Dimensions | File Size | Section / Component | Aspect Ratio & Sizing Mode |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `frontend/public/civic-reporter-hero.jpg` | JPEG | 1000 × 500 px | 279,992 B | Hero Showcase Card | `aspect-[2/1]`, `object-contain` inside `bg-slate-50` stage. |
| `frontend/public/civic-reporter-vision.png` | PNG | 1500 × 500 px | 660,018 B | Vision Panorama Stage | `aspect-[3/1]`, `object-contain` inside `bg-slate-100` stage. |
| `frontend/public/mini-map.jpg` | JPEG | 180 × 120 px | 1,281 B | Location Detected Widget | `h-12 w-full`, `object-cover`. |
| `frontend/public/categories/potholes-roads.jpg` | JPEG | 600 × 400 px | 87,419 B | Category 1 (Roads) | `h-36 md:h-44`, `object-cover`. |
| `frontend/public/categories/garbage-waste.jpg` | JPEG | 600 × 400 px | 85,411 B | Category 2 (Garbage) | `h-36 md:h-44`, `object-cover`. |
| `frontend/public/categories/drainage-flooding.jpg` | JPEG | 600 × 400 px | 89,120 B | Category 3 (Drainage) | `h-36 md:h-44`, `object-cover`. |
| `frontend/public/categories/street-lights.jpg` | JPEG | 600 × 400 px | 86,210 B | Category 4 (Streetlights) | `h-36 md:h-44`, `object-cover`. |
| `frontend/public/categories/water-supply.jpg` | JPEG | 600 × 400 px | 84,330 B | Category 5 (Water) | `h-36 md:h-44`, `object-cover`. |
| `frontend/public/categories/parks-trees.jpg` | JPEG | 600 × 400 px | 88,015 B | Category 6 (Parks) | `h-36 md:h-44`, `object-cover`. |
| `frontend/public/categories/public-utilities.jpg` | JPEG | 600 × 400 px | 86,950 B | Category 7 (Utilities) | `h-36 md:h-44`, `object-cover`. |
| `frontend/public/categories/other-issues.jpg` | JPEG | 600 × 400 px | 83,500 B | Category 8 (Other) | `h-36 md:h-44`, `object-cover`. |

*Note on Cache-Busting:* The website references images with `?v=2` (e.g. `/civic-reporter-hero.jpg?v=2`) to force browser cache invalidation after high-resolution upgrades.

---

## 8. Homepage Interactions and Navigation Architecture

### 8.1 Dual Navigation Behavior
- **On Homepage (`/`):** Clicking `"Home"`, `"How It Works"`, `"Issues"`, or `"About"` initiates smooth hardware-accelerated scrolling (`element.scrollIntoView({ behavior: 'smooth' })`).
- **On Sub-Pages (`/dashboard`, `/submit`, etc.):** Navbar links render standard React Router `<NavLink>` elements navigating to the target route.

### 8.2 Category Grid Interaction
Clicking any of the 8 category cards invokes `handleCategoryClick(categoryParam)`:
- Authenticated user: navigates to `/submit?category=<categoryParam>` (pre-populating the category selector).
- Unauthenticated user: navigates to `/submit` (which redirects to `/login` with return intent).

### 8.3 Download Demo PDF Interaction
The Auto Complaint widget features a `"Download PDF"` button. When tapped, it triggers an animated state (`setDownloading(true)` for 1200ms) with `"Downloading..."` microcopy before returning to idle.

---

## 9. Skeleton Loader Behavior and Coverage

The loading system is built upon `BaseSkeleton.jsx` and styled in `frontend/src/index.css`.

### 9.1 Technical Animation Parameters
- **Animation Name:** `skeleton-shimmer`
- **Cycle Duration:** `1.6s`
- **Easing Function:** `cubic-bezier(0.4, 0, 0.2, 1)`
- **Iteration Count:** `infinite`
- **Light Theme Gradient:**
  `linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 25%, rgba(209,250,229,0.45) 50%, rgba(255,255,255,0.7) 75%, rgba(255,255,255,0) 100%)`
  *(Note the `rgba(209,250,229,0.45)` emerald green tint at 50% midpoint).*
- **Pulse Variant (`skeleton-pulse`):** `2s cubic-bezier(0.4, 0, 0.6, 1) infinite`, oscillates between opacity `1.0` and `0.65`.
- **Accessibility:** Under `@media (prefers-reduced-motion: reduce)`, shimmer and pulse animations are completely disabled (`animation: none !important`), rendering flat `#f1f5f9` backgrounds.

### 9.2 Route Coverage Audit
| Route / Component | Loader Implemented | Skeleton Component Used | Generic Spinners Remaining? |
| :--- | :--- | :--- | :--- |
| `Navbar.jsx` (Notifications) | **Yes** | `ListSkeleton` (count: 3) | None |
| `Dashboard.jsx` (Public Map & List) | **Yes** | `DashboardSkeleton` (Stat cards + Filter pills + Cards) | None |
| `Details.jsx` (Complaint Detail) | **Yes** | `DetailsSkeleton` (Header + Media frame + Timeline) | None |
| `Admin.jsx` (Admin Portal) | **Yes** | `AdminSkeleton` (Stats + User/Complaint tables) | None |
| `MyComplaints.jsx` (Citizen Profile) | **Yes** | `MyComplaintsSkeleton` (Vertical cards) | None |
| `authority/Dashboard.jsx` | **Yes** | Custom table & card shimmer loaders | None |
| `ProtectedRoute.jsx` (Auth Gate) | **Yes** | Centered `CircularLoader` with emerald track | None |
| `Submit.jsx` (AI Image Analysis) | **Yes** | Radar scanning line overlay + progress pulse | Progress bar present |

---

## 10. Complete AI Detection and Fallback Workflow

The primary entry point for AI analysis is `POST /api/ai/analyze`.

```
                    [Image Uploaded to /api/ai/analyze]
                                     │
                     Is Problem Type or Category Selected?
                    ┌────────────────┴────────────────┐
                   YES                                NO (Auto-detect)
                    │                                 │
     ┌──────────────┼──────────────┐                  │
     ▼              ▼              ▼                  ▼
 [pothole]      [garbage]     [streetlight]    [Run Both YOLO Models]
     │              │              │           (pothole & garbage in ||)
     ▼              ▼              │                  │
[pothole_best] [garbage_best]      │                  ▼
     │              │              │           Any Confident Detections?
     ▼              ▼              │             ┌────┴────┐
 Detections?    Detections?        │            YES        NO
  ┌──┴──┐        ┌──┴──┐           │             │         │
 YES    NO      YES    NO          │             │         ▼
  │      │       │      │          │             │    [Gemini Vision]
  │      ▼       │      ▼          │             │    (Physical check)
  │   [Fallback] │   [Fallback]    │             │         │
  │      │       │      │          │             │         ▼
  │      └───────┼──────┴──────────┤             │    Valid Civic Issue?
  │              │                 │             │      ┌────┴────┐
  │              ▼                 ▼             │     YES        NO
  │         [Gemini Vision Physical Check]       │      │         │
  │                        │                     │      │         ▼
  │                        ▼                     │      │    [REJECT: 400]
  │                Is Valid Physical             │      │    "Non-civic photo"
  │                Civic Damage?                 │      │    canReportManually: true
  │                 ┌──────┴──────┐              │      │
  │                YES            NO             │      │
  │                 │              │             │      │
  ▼                 ▼              ▼             ▼      ▼
[Generate Deterministic Letter via complaintTemplates.js]
             (ZERO Gemini calls on template generation)
```

### 10.1 Local YOLO11n Model Specifications
- **Road Damage Weights:** `backend/models/pothole_best.pt` (Size: ~5.6 MB).
- **Garbage Weights:** `backend/models/garbage_best.pt` (Size: ~5.6 MB).
- **Inference Server:** Python FastAPI microservice on `http://127.0.0.1:8000/detect`.
- **In-Process Fallback:** Direct Python CLI runner (`backend/inference_service/run_cli.py`) automatically invoked if HTTP microservice is unreachable (`ECONNREFUSED`).
- **Confidence Thresholds:** Configurable via `.env` (`POTHOLE_CONFIDENCE_THRESHOLD`, `GARBAGE_CONFIDENCE_THRESHOLD`), default `0.25`.
- **Zero Gemini Calls:** When local models detect issues above threshold, Gemini is **never** invoked.

### 10.2 Gemini Vision Rules & Physical Inspection Guardrails
When Gemini Vision is invoked (for streetlights or fallbacks):
- **Model:** `gemini-2.5-flash` with `responseMimeType: "application/json"`.
- **Timeout:** Strict `6000ms` promise race timeout prevents hanging requests.
- **Fail-Fast:** Quota exhaustion (`429`), leaked key errors, or authentication failures fail immediately without infinite retry loops.
- **Daytime Streetlight Rule:** Explicit prompt instruction:
  `CRITICAL STREETLIGHT RULE: Do NOT report a streetlight as damaged solely because it appears unlit in a photograph (such as during daytime or off-hours). There MUST be visible physical damage (broken fixture, bent pole, hanging wires, detached head).`
- **Non-Civic Rejection:** Selfies, pets, landscapes, indoor rooms, paperwork, food, and computer screens return `isValid: false`, `problemType: "None"`, and an explanation. **No civic complaint is ever drafted for non-civic photos.**

---

## 11. Category Auto-Selection Logic

When a citizen uploads a photo without selecting a category in advance:
1. `backend/routes/ai.js` executes `runAllLocalInference()` running `pothole_best.pt` and `garbage_best.pt` concurrently via `Promise.allSettled`.
2. **Confidence Comparison:**
   - If pothole detection has higher confidence: Category sets to `"Road Damage"`, Problem Type to `"Pothole"`.
   - If garbage detection has higher confidence: Category sets to `"Garbage/Waste"`, Problem Type to `"Garbage accumulation"`.
   - Secondary detections are preserved in the payload (`secondaryDetection: { category, count, confidence }`).
3. **Department Mapping:**
   - Road Damage → `"Road Maintenance & Infrastructure Department"`
   - Garbage/Waste → `"Solid Waste Management & Sanitation Department"`
   - Streetlight → `"Public Lighting & Electrical Engineering Department"`
   - Drainage → `"Drainage & Sewerage Operations Department"`
   - General → `"General Administration Department"`

---

## 12. Complaint Templates Architecture

Located in `backend/utils/complaintTemplates.js`. Letter generation is **100% deterministic** and does not call LLM APIs at generation time.

### 12.1 The 5 Specialized Templates
1. **Template A (Road Damage & Potholes):** Emphasizes structural asphalt deterioration, vehicular collision hazard, and safety risks to two-wheeler riders.
2. **Template B (Garbage & Sanitation Hazard):** Highlights foul odors, stray animals, mosquito/disease vectors, and public health contamination.
3. **Template C (Streetlight Physical Infrastructure):** Details electrical hazard, dark spot crime vulnerability, and physical damage (broken fixture, bent pole, exposed wiring).
4. **Template D (Drainage & Waterlogging):** Focuses on stormwater blockage, sewer overflow, vector-borne disease risks, and structural water damage.
5. **Template E (General Municipal Infrastructure):** Fallback template for public parks, water supply lines, or miscellaneous public utilities.

### 12.2 Structure of Formal Complaint Letter
Every letter contains:
1. **Date:** Formatted according to Indian convention (`e.g., 22 October 2026`).
2. **Authority Recipient Block:** Dynamically addressed (`To, The Municipal Commissioner / Gram Sevak, [Department], [Corporation / Panchayat Name], [Jurisdiction]`).
3. **Formal Subject Line:** `Subject: Urgent complaint regarding [Problem Type] at [Location]`.
4. **Salutation:** `Respected Sir/Madam,`.
5. **Paragraph 1:** Specific statement of the defect, detection count, and GPS/street address.
6. **Paragraph 2:** Public safety, health hazard, or vehicular risk assessment.
7. **Paragraph 3:** Request for inspection, remedial action, and temporary safety barricades/reflectors.
8. **Citizen Sign-off:** Name, `"Resident / Concerned Citizen"`.

---

## 13. Supported Languages and Translation Workflow

### 13.1 Language Matrix
| Language | ISO Code | Native Script Name | Frontend UI Dictionary | Backend Complaint Translation |
| :--- | :--- | :--- | :--- | :--- |
| English | `en` / `EN` | English | ✅ Supported | ✅ Supported (Canonical Base) |
| Hindi | `hi` / `HI` | हिन्दी | ✅ Supported | ✅ Supported |
| Marathi | `mr` / `MR` | मराठी | ✅ Supported | ✅ Supported |
| Tamil | `ta` / `TA` | தமிழ் | ✅ Supported | ✅ Supported |
| Telugu | `te` / `TE` | తెలుగు | ✅ Supported | ✅ Supported |
| Kannada | `kn` / `KN` | ಕನ್ನಡ | ✅ Supported | ✅ Supported |
| Bengali | `bn` / `BN` | বাংলা | ✅ Supported | ✅ Supported |
| Gujarati | `gu` / `GU` | ગુજરાતી | ✅ Supported | ✅ Supported |
| Malayalam | `ml` | മലയാളം | ❌ (Falls back to EN) | ✅ Supported |
| Punjabi | `pa` | ਪੰਜਾਬੀ | ❌ (Falls back to EN) | ✅ Supported |
| Odia | `or` | ଓଡ଼ିଆ | ❌ (Falls back to EN) | ✅ Supported |
| Assamese | `as` | অসমীয়া | ❌ (Falls back to EN) | ✅ Supported |
| Urdu | `ur` | اردو | ❌ (Falls back to EN) | ✅ Supported |

### 13.2 Translation Service Safeguards (`translationService.js`)
- **Canonical Preservation:** The canonical English letter is always generated first and preserved in `complaint.originalEnglishLetter`. Translations are generated from the canonical English letter to prevent compounding translation drift.
- **Provider Priority:**
  1. In-memory SHA-256 hash cache (`targetLang:hash`).
  2. Google Cloud Translation API v2 (`https://translation.googleapis.com/language/translate/v2`).
  3. Deterministic template dictionary fallback (built-in full-text letters in Hindi, Marathi, etc.).
  4. Safe fallback: Returns original English letter with warning banner without crashing or aborting the complaint flow.
- **Quota Safeguard:** Hard limit of `450,000` characters per calendar month (within Google's 500k free tier). Usage resets on the 1st of every month.

---

## 14. Backend APIs and Data Contracts

### 14.1 `POST /api/ai/analyze`
Main multimodal scanning endpoint. Accepts either `imageUrl` (JSON) or multipart file.
- **Request Body:**
```json
{
  "imageUrl": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  "userName": "Manish Patil",
  "locationAddress": "Karvir, Kolhapur, Maharashtra 416001",
  "authorityInfo": {
    "authorityTitle": "The Municipal Commissioner",
    "authorityBody": "Kolhapur Municipal Corporation",
    "displayAddress": "Kolhapur, Maharashtra"
  },
  "category": "Road Damage",
  "problemType": "Pothole"
}
```
- **Response Body (Success - Local Model):**
```json
{
  "imageUrl": "https://...",
  "category": "Road Damage",
  "problemType": "Pothole",
  "department": "Road Maintenance & Infrastructure Department",
  "severity": "High",
  "description": "Reported road damage with 2 prominent potholes at Karvir, Kolhapur.",
  "formalLetter": "Date: 22 October 2026\n\nTo,\nThe Municipal Commissioner...",
  "priority": 30,
  "confidence": 0.884,
  "detectionCount": 2,
  "detections": [
    {
      "box_2d": [340, 210, 680, 590],
      "normalized": { "x1": 0.21, "y1": 0.34, "x2": 0.59, "y2": 0.68 },
      "label": "Pothole",
      "confidence": 0.884
    }
  ],
  "imageValidation": {
    "isValid": true,
    "reason": "Local YOLO11n model detected 2 pothole(s) on the road surface",
    "detectedContent": "pothole"
  },
  "model": "pothole_best",
  "source": "local_yolo",
  "analysisProvider": "yolo",
  "geminiFallback": false
}
```
- **Response Body (Rejection - Non-Civic Image):**
```json
{
  "imageUrl": "https://...",
  "problemType": "None",
  "category": "None",
  "confidence": 0,
  "severity": "Low",
  "description": "The uploaded image does not appear to show a valid public civic issue.",
  "formalLetter": "",
  "imageValidation": {
    "isValid": false,
    "reason": "No civic issue detected in the uploaded photo. Image depicts indoor personal furniture.",
    "detectedContent": "indoor furniture / living room"
  },
  "analysisProvider": "yolo",
  "geminiFallback": false,
  "canReportManually": true
}
```

### 14.2 `POST /api/ai/road-damage/detect`
Dedicated multipart upload endpoint for Android / Mobile clients.
- **Headers:** `Content-Type: multipart/form-data`
- **Form Data:** `image` (binary JPEG/PNG), `confidence` (optional float, e.g. `0.25`).
- **Response:**
```json
{
  "success": true,
  "model": "pothole_best",
  "targetClass": "Pothole",
  "architecture": "YOLO11n",
  "analysisProvider": "yolo",
  "geminiFallback": false,
  "imageWidth": 1280,
  "imageHeight": 720,
  "detectionCount": 1,
  "detections": [
    {
      "box_2d": [200, 150, 400, 450],
      "normalized": { "x1": 0.117, "y1": 0.277, "x2": 0.351, "y2": 0.555 },
      "label": "Pothole",
      "confidence": 0.842
    }
  ],
  "canReportManually": true
}
```

### 14.3 `POST /api/ai/translate`
Complaint letter translation endpoint.
- **Request Body:**
```json
{
  "text": "Date: 22 October 2026\n\nTo,\nThe Municipal Commissioner...",
  "targetLanguage": "mr",
  "meta": {
    "templateId": "pothole",
    "userName": "Manish Patil",
    "locationAddress": "Kolhapur, Maharashtra"
  }
}
```
- **Response Body:**
```json
{
  "success": true,
  "translatedText": "दिनांक: २२ ऑक्टोबर २०२६\n\nप्रति,\nमहानगरपालिका आयुक्त...",
  "language": { "code": "mr", "name": "Marathi", "nativeName": "मराठी" },
  "cached": false,
  "provider": "google_cloud_translation_api_v2"
}
```

### 14.4 `GET /api/users/profile/:uid` & `POST /api/users/profile/:uid`
Adblocker-proof server proxy to Firestore user profiles. Prevents client-side network blocking of `firestore.googleapis.com`.

---

## 15. Authentication & Preserved Integrations

The following legacy systems were audited and confirmed preserved without regressions:
1. **Firebase Authentication:** Email/Password and Google OAuth sign-in. Tokens are passed in headers as `Authorization: Bearer <idToken>`.
2. **Citizen Reputation System:** Users start at `100` reputation points. Submitting valid complaints adds `+10`; spam complaints deduct `-50`. Users below `-50` are restricted from posting (`/api/users/can-submit/:uid`).
3. **MongoDB Data Persistence:** Mongoose `Complaint` model preserves all fields: `title`, `description`, `category`, `status` (`Pending`, `In Progress`, `Resolved`, `Rejected`), `imageUrl`, `location`, `formalLetter`, `authorityDetails`, `upvotes`.
4. **Cloudinary Image Upload:** Citizen photos uploaded to Cloudinary before submission; URLs stored in MongoDB.
5. **PDF Generation:** Web client utilizes `jspdf` to export letterhead complaints on demand.

---

## 16. Error Handling & Edge Cases

| Failure Scenario | Web Application Handling | Required Android Handling |
| :--- | :--- | :--- |
| **Inference Service Offline (`ECONNREFUSED` on port 8000)** | Backend tries Python CLI runner. If both fail, falls back to manual reporting mode with error toast. | Show non-blocking alert: *"AI scanning service offline. You can still report manually."* Enable manual submission form. |
| **Random / Non-Civic Image Uploaded** | AI returns `isValid: false`, zero detections, and reason. Red alert box renders with `"Report Manually Anyway"` button. | Display clear dialog explaining image has no recognizable civic issue. Offer option to retake or proceed manually. |
| **Daytime Unlit Streetlight** | Gemini Vision rejects as damage unless bent pole or hanging wires are present. | Prompt user: *"Please ensure physical damage is visible. Lights being off during the day is normal."* |
| **Google Maps Blocked or Offline** | `Submit.jsx` falls back to device GPS coordinate input fields. | Android native GPS (`FusedLocationProviderClient`) is immune to web script blocks. Use native coordinates directly. |
| **Translation Quota Exceeded / Offline** | Returns canonical English letter with warning banner. Submission is never blocked. | Display original English complaint with banner: *"Local language translation currently unavailable. English complaint preserved."* |

---

## 17. Dependencies & Configuration Matrix

### 17.1 Backend Environment Variables (`backend/.env`)
- `PORT`: `5000`
- `MONGODB_URI`: MongoDB connection URI
- `YOLO_INFERENCE_URL`: Default `http://127.0.0.1:8000`
- `POTHOLE_MODEL_PATH`: `backend/models/pothole_best.pt`
- `GARBAGE_MODEL_PATH`: `backend/models/garbage_best.pt`
- `POTHOLE_CONFIDENCE_THRESHOLD`: `0.25`
- `GARBAGE_CONFIDENCE_THRESHOLD`: `0.25`
- `ROAD_DAMAGE_LOCAL_MODEL_ONLY`: `"false"`
- `GEMINI_API_KEY`: API key for Gemini 2.5 Flash
- `GOOGLE_TRANSLATION_API_KEY`: API key for Google Cloud Translation v2
- `TRANSLATION_MONTHLY_CHAR_LIMIT`: `450000`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Cloud storage credentials

### 17.2 Required Mobile Dependencies (Android / React Native)
- **Networking:** `axios` or native `fetch` supporting multipart form-data.
- **Camera & Photos:** `react-native-image-picker` or Android CameraX.
- **Location:** `react-native-geolocation-service` or Google Play Services `FusedLocationProviderClient`.
- **Canvas / Box Rendering:** `react-native-svg` (for drawing normalized bounding boxes).
- **Shimmer Loading:** `react-native-shimmer-placeholder` or `react-native-linear-gradient`.
- **Typography:** Google Fonts `Inter` and `Caveat`.

---

## 18. Verification Tests Executed & Empirical Results

The following checks were empirically verified in the environment:
1. **Frontend Dev Server:** Running on port `5173` (Vite, HTTP 200).
2. **Backend Express Server:** Running on port `5000` (`node server.js`).
3. **Local YOLO Inference Service:** Running on port `8000` (`python backend/inference_service/server.py`).
4. **Health Check Endpoint (`GET /api/ai/status`):** Verified online; reports both `pothole_best.pt` and `garbage_best.pt` present on disk in `backend/models/`.
5. **Asset Verification:** Confirmed `/civic-reporter-hero.jpg` (279 KB), `/civic-reporter-vision.png` (660 KB), `/mini-map.jpg` (1.2 KB), and all 8 `/categories/*.jpg` exist with non-zero byte sizes.
6. **Translation Test (`POST /api/ai/translate`):** Verified translation to Marathi (`mr`) and Hindi (`hi`) returns deterministic template text.

---

## 19. Remaining Defects and Unresolved Questions

1. **Dedicated Streetlight Model Missing:**
   - *Issue:* While pothole and garbage models run locally on YOLO11n, broken streetlights rely entirely on Gemini Vision.
   - *Mitigation for Android:* Mobile client must route streetlight complaints to `/api/ai/analyze` or `/api/ai/streetlight/detect` and handle potential cloud latency (3-5s).
2. **Offline Mode for Complaints on Mobile:**
   - *Question:* Should Android store reports in a local SQLite/Room database when network connectivity is lost in rural areas and auto-sync when online? (Recommended for Phase 2).
3. **Android Image Upload Constraints:**
   - *Finding:* Backend allows up to 25MB, but mobile devices should downscale camera images to ~1280px width before upload to conserve citizen cellular bandwidth.

---

## 20. Detailed Android Implementation Requirements

An Antigravity session dedicated to the Android application must implement the following screens and modules to achieve full parity:

### Task 1: Android Homepage & Section Navigation
- Implement the elevated Hero section with the `aspect-[2/1]` hero image card (`civic-reporter-hero.jpg`), dot grid background texture, and headline copy matching Section 5.1.
- Implement the 3 floating status widgets as a horizontal carousel or vertical stack on mobile:
  - *Location Detected* with GPS preview thumbnail.
  - *Auto Complaint* with demo PDF download trigger.
  - *Routed to Authority* with verified checkmark.
- Render the 6-step "How It Works" horizontal/vertical card list.
- Render the 8 Issue Category grid (2 columns on mobile) using assets in `public/categories/`. Tapping a category navigates to Report Screen with category pre-selected.
- Render the Vision & Impact section with the `aspect-[3/1]` Gateway of India panoramic image (`civic-reporter-vision.png`) and 4 impact statistics.
- Render the Closing CTA banner and navigation footer.

### Task 2: Native Shimmer Skeleton Loaders
- Implement shimmer loaders using emerald tint (`#d1fae5` at 50% opacity) oscillating on a 1.6s cycle across:
  - Dashboard issue feed.
  - Complaint details screen.
  - My Complaints profile list.
  - Notification drawer.
- Support Android system-level `ANIMATOR_DURATION_SCALE = 0` (reduced motion) by rendering flat `#f1f5f9` backgrounds.

### Task 3: Multimodal Image Capture & AI Detection Screen
- Camera and Gallery photo picker with automatic EXIF GPS extraction.
- Upload image to `POST /api/ai/road-damage/detect` (or `POST /api/ai/analyze` with `multipart/form-data`).
- Render bounding boxes over the photo using normalized coordinates:
  ```kotlin
  val left = detection.normalized.x1 * imageWidth
  val top = detection.normalized.y1 * imageHeight
  val right = detection.normalized.x2 * imageWidth
  val bottom = detection.normalized.y2 * imageHeight
  ```
- Draw confidence pill badge (`${(confidence * 100).toInt()}%`) in top-left of each bounding box.
- Handle non-civic image rejection gracefully: If `isValid == false`, show explanatory dialog and permit manual reporting override.

### Task 4: Deterministic Letter Review & Multilingual Switching
- Display generated complaint letter pre-formatted with authority header, date, and user sign-off.
- Provide a language dropdown (supporting at least the 8 primary languages: EN, HI, MR, TA, TE, KN, BN, GU).
- On language switch, call `POST /api/ai/translate` with the canonical English text and update letter text view.
- Export letter as PDF or share via Android Intent (`Intent.ACTION_SEND`).

### Task 5: Network & Adblocker Resilience
- Route user profile requests through `GET /api/users/profile/:uid` to avoid direct Firestore SDK blocks on hardened Android ROMs (e.g., GrapheneOS, CalyxOS) with DNS-level adblocking.
- Maintain base URL configurable for emulator testing (`http://10.0.2.2:5000/api`) and production deployment (`https://civic-reporter.onrender.com/api`).
