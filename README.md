# 🏙️ Community Problem Reporter

> AI-powered civic complaint system — citizens upload a photo, Claude Vision auto-detects the issue, generates a formal complaint, and tracks resolution status.

![Hackathon](https://img.shields.io/badge/Hackathon-Project-blue)
![Stack](https://img.shields.io/badge/Stack-React%20%2B%20Node.js%20%2B%20MongoDB-green)
![AI](https://img.shields.io/badge/AI-Claude%20Vision%20API-orange)

---

## 📌 Problem Statement

Every day, citizens see potholes, broken streetlights, and garbage dumps — but reporting them is so complicated, most people give up. We fix that with one photo.

## ✅ Solution

1. Citizen uploads a photo + drops a map pin
2. Claude Vision AI auto-detects problem type, severity, and writes a formal complaint letter
3. Complaint is saved and shown on a live map dashboard
4. Admin updates status (Submitted → In Progress → Resolved)
5. Citizens can upvote complaints — high-priority issues get auto-flagged

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Tailwind CSS, Leaflet.js |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Image Storage | Cloudinary |
| AI | Anthropic Claude Vision API |
| Deployment | Vercel (frontend) + Render (backend) |

---

## 📁 Folder Structure

```
civic-reporter/
├── backend/
│   ├── models/
│   │   └── Complaint.js        # MongoDB schema
│   ├── routes/
│   │   ├── complaints.js       # CRUD routes
│   │   └── ai.js               # Claude Vision route
│   ├── middleware/
│   │   └── upload.js           # Cloudinary + Multer
│   ├── server.js               # Entry point
│   └── .env                    # Environment variables (do not commit)
└── frontend/
    └── src/
        ├── components/
        │   ├── UploadForm.jsx   # Photo + location picker
        │   ├── ComplaintCard.jsx
        │   ├── MapView.jsx      # Leaflet map
        │   └── AdminPanel.jsx
        ├── pages/
        │   ├── Home.jsx
        │   ├── Submit.jsx
        │   └── Admin.jsx
        └── App.jsx
```

---

## ⚙️ Setup Instructions

### 1. Clone the repo

```bash
git clone https://github.com/your-username/civic-reporter.git
cd civic-reporter
```

### 2. Create accounts (do this before the hackathon!)

- **MongoDB Atlas** — [mongodb.com/atlas](https://mongodb.com/atlas) → Free cluster → copy connection string
- **Cloudinary** — [cloudinary.com](https://cloudinary.com) → copy cloud name, API key, API secret
- **Anthropic API** — [console.anthropic.com](https://console.anthropic.com) → generate API key

### 3. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:

```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/civicdb
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

```bash
npm run dev
```

### 4. Frontend setup

```bash
cd frontend
npm install
```

Create a `.env` file in `/frontend`:

```env
REACT_APP_API_URL=http://localhost:5000
```

```bash
npm start
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ai/analyze` | Upload image → Claude Vision analysis |
| `POST` | `/api/complaints` | Save new complaint to DB |
| `GET` | `/api/complaints` | Fetch all complaints |
| `GET` | `/api/complaints/:id` | Single complaint details |
| `PATCH` | `/api/complaints/:id/status` | Admin updates status |
| `PATCH` | `/api/complaints/:id/upvote` | Citizen upvotes a complaint |

---

## 🤖 Claude Vision Prompt

```js
const CLAUDE_PROMPT = `
You are a civic complaint assistant for Indian municipal authorities.
Analyze this image of a public space issue.

Return ONLY valid JSON with exactly these fields:
{
  "problemType": "pothole" | "garbage" | "streetlight" | "waterLeak" | "other",
  "severity": "low" | "medium" | "high",
  "description": "One sentence describing what you see in the image",
  "formalLetter": "A 3-sentence formal complaint letter addressed to Municipal Commissioner.",
  "hindiDescription": "Same description in Hindi (one sentence)"
}

Rules:
- Return ONLY the JSON object, no extra text, no markdown
- severity high = safety hazard or major public inconvenience
- severity medium = significant issue affecting daily life
- severity low = cosmetic or minor issue
`;
```

---

## 🗃️ MongoDB Schema

```js
const ComplaintSchema = new mongoose.Schema({
  imageUrl:     { type: String, required: true },
  problemType:  { type: String, enum: ['pothole', 'garbage', 'streetlight', 'waterLeak', 'other'] },
  severity:     { type: String, enum: ['low', 'medium', 'high'] },
  description:  { type: String },
  formalLetter: { type: String },
  location: {
    lat: Number,
    lng: Number,
    address: String
  },
  status:        { type: String, default: 'Submitted', enum: ['Submitted', 'In Progress', 'Resolved'] },
  upvotes:       { type: Number, default: 0 },
  priority:      { type: Number, default: 0 },
  resolvedImage: { type: String },
  createdAt:     { type: Date, default: Date.now }
});
```

---

## ⏰ 24-Hour Build Timeline

| Hours | Task |
|-------|------|
| 0 – 2 | Setup: accounts, repos, .env, MongoDB + Cloudinary test |
| 2 – 5 | Backend: server, schema, upload middleware, Claude Vision route |
| 5 – 9 | **Submit page** (Priority 1): upload form, location, AI pre-fill |
| 9 – 13 | Dashboard + Leaflet map with colored markers |
| 13 – 17 | Admin panel, status updates, upvote system, priority scoring |
| 17 – 20 | Polish: Hindi toggle, duplicate detection, before/after photo |
| 20 – 23 | Demo prep: seed data, record backup video, pitch slides |
| 23 – 24 | Buffer / bug fixes only — no new features |

> **MVP cutoff at Hour 13:** If photo → AI → map marker works, you have a presentable project.

---

## 👥 Team Split

| Person | Role | Tasks |
|--------|------|-------|
| P1 | Frontend | React UI, upload form, map view, complaint dashboard |
| P2 | Backend | Express API, MongoDB, Cloudinary integration, status endpoints |
| P3 | AI + Integration | Claude Vision route, prompt engineering, glue code |

---

## 🚀 Deployment

### Backend → Render.com
1. Push backend folder to GitHub
2. Create new Web Service on [render.com](https://render.com)
3. Add all `.env` variables in the Render dashboard
4. Deploy — free tier, spins up in ~30 seconds

### Frontend → Vercel
1. Push frontend folder to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add `REACT_APP_API_URL=https://your-backend.onrender.com`
4. Deploy

---

## ✨ Wow Features

- **AI severity scoring** — Claude rates urgency; high severity complaints flagged red on map
- **Priority algorithm** — `priority = (severityScore × 10) + upvotes`
- **Duplicate detection** — same location + same problem type = auto-upvote instead of duplicate
- **Hindi complaint text** — toggle between English and Hindi formal letter
- **Before / After photos** — admin uploads a resolved photo; citizens see proof of action

---

## 📊 Priority Score Formula

```
severityWeight = { high: 3, medium: 2, low: 1 }
priority = (severityWeight[severity] × 10) + upvotes
```

Complaints with `priority >= 30` are auto-flagged as critical in the admin panel.

---

## 🔒 .gitignore

Make sure your `.env` files are never committed:

```
node_modules/
.env
.env.local
build/
dist/
```

---

## 📄 License

MIT — built for hackathon purposes.

---

> Built with ❤️ for [Hackathon Name] | Team: [Your Team Name]
