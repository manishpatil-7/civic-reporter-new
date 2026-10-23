# Mobile UI Specification

This document defines the UI/UX guidelines, components, and user flows specifically for the Civic Reporter Android application built with Jetpack Compose.

## 1. Design System

### Colors
- **Primary Green:** `#2E7D32`
- **Dark Green:** `#1B5E20`
- **Light Green:** `#4CAF50`
- **White:** `#FFFFFF`
- **Off-white:** `#F5F5F5`
- **Dark Charcoal:** `#333333`
- **Muted Gray:** `#9E9E9E`
- **Amber:** `#FFC107`
- **Red:** `#D32F2F`

### Core Components
- **Button:** Primary, Secondary, Text variants.
- **TextField:** Outlined, with error state support.
- **Card:** Elevated with rounded corners for issues.
- **Badge:** Status indicators.
- **StatusChip:** For 'Pending', 'In Progress', 'Resolved'.
- **BottomSheet:** For contextual actions (e.g., photo source selection).
- **Dialog:** For confirmations (e.g., duplicate warnings).
- **TopBar:** Consistent branding header.
- **BottomNavigation:** For citizen navigation.
- **LoadingSkeleton:** Content placeholders (no basic "Loading..." text).
- **EmptyState:** For lists with no items.
- **ErrorState:** Network or API failure views with clear actions.
- **IssueCard:** Complaint feed items.
- **Timeline:** To show complaint lifecycle.
- **MapCard:** Mini map display.
- **AuthorityCard:** Admin specific metrics.
- **AIAnalysisCard:** For AI detected insights.

## 2. Navigation Architecture

**Citizen Navigation (Bottom Bar):**
1. **Home:** Feed of nearby/recent issues.
2. **Map:** GIS view of issues.
3. **Report:** Prominent floating action button (FAB) or center tab.
4. **My Reports:** User's history.
5. **Profile:** Settings and auth.

## 3. UI/UX Polishing Guidelines

**A. Loading States**
Never use plain "Loading..." text.
- **Dashboards & Lists:** Use Skeleton Cards/Rows.
- **Map:** Use Map Skeleton.
- **AI Processing:** Use sequenced animated states (e.g., ✓ Uploading... ◉ Analyzing image...).

**B. Error Handling**
Every failure must have a useful action/explanation.
- **GPS denied:** "Location permission is required to automatically identify the responsible authority."
- **AI unavailable:** "We couldn't complete AI analysis. You can retry or continue with manual review."
- **Duplicate:** "A similar issue already exists nearby."
- **No Internet:** "You're offline. Your report has been saved as a draft."
- **Upload failed:** "Upload failed. Your photo is still saved locally. Retry."

**C. Complaint Detail Screen (Hero Screen)**
Must be visually striking and detailed:
- ID, Category, Priority Badge.
- Large Photo.
- Location Pin & Authority details.
- Visual Status Timeline (Submitted -> Verified -> Identified -> In Progress -> Resolved).
- Before / After photo comparison layout.
- Officer remarks and resolution date.

**D. Public Issue Map**
- Uses clustered markers.
- Filter chips: All, Potholes, Garbage, Streetlights, Drainage, High Priority.
- Tapping a marker shows a preview card, which leads to Complaint Detail.
