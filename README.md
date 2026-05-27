# Legal Case Reasoning Explorer — Lex.ai

A full-stack platform that transforms unstructured legal judgment text into interactive reasoning graphs, with an AI-powered legal assistant built in.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Local Setup & Run](#local-setup--run)
- [Deployment (GitHub Pages + Vercel)](#deployment-github-pages--vercel)
- [How to Use](#how-to-use)
- [Reasoning Model](#reasoning-model)
- [Data Contract](#data-contract)
- [Known Limitations](#known-limitations)

---

## Overview

Legal judgments are dense and hard to decode quickly. **Lex.ai** addresses this by:

- Accepting raw judgment text (paste or PDF upload).
- Running a rule-based NLP engine to classify every sentence into one of four node types: **claim**, **precedent**, **reasoning**, or **conclusion**.
- Building a directed acyclic graph of argumentative relations.
- Rendering the result as an interactive visual graph or raw JSON.
- Providing **Lex**, a context-aware AI legal assistant that already knows the loaded judgment.

---

## Features

| Feature | Status |
|---|---|
| Paste text or upload PDF (up to 5 MB) | Complete |
| 4-type NLP extraction engine (enhanced regex + legal abbreviation handling) | Complete |
| Interactive reasoning graph (React Flow + Dagre auto-layout) | Complete |
| JSON output view with toggle | Complete |
| Lex AI legal assistant (Groq LLM, context-aware) | Complete |
| JWT session authentication (name + email) | Complete |
| Protected routes with auto-redirect | Complete |
| PDF text extraction (pdfjs-dist) | Complete |
| Health check endpoint | Complete |

---

## System Architecture

```
┌─────────────────────────────────────────┐
│                Browser                  │
│  Landing Page (/)  ──►  /app (protected)│
│  JWT auth check via ProtectedRoute      │
└──────────────┬──────────────────────────┘
               │ HTTP (Axios)
               ▼
┌─────────────────────────────────────────┐
│         Express Backend (:5000)         │
│                                         │
│  POST /api/login       → JWT issue      │
│  GET  /api/verify      → token check    │
│  POST /api/process     → NLP + graph    │
│  POST /api/upload-pdf  → PDF extract    │
│  POST /api/chat        → Groq LLM       │
│  GET  /api/health      → status         │
└─────────────────────────────────────────┘
```

### Data Flow

1. User signs in with name and email → receives a 24-hour JWT.
2. User pastes judgment text or uploads a PDF.
3. Frontend `POST /api/process` → backend reasoning engine classifies sentences → graph builder constructs nodes and edges → JSON returned.
4. Frontend renders the result as a React Flow graph or raw JSON.
5. Lex AI chat is opened → `POST /api/chat` with the full judgment text and graph context → Groq LLM answers questions about the loaded case.

---

## Tech Stack

### Frontend

| Library | Version | Purpose |
|---|---|---|
| React | 18 | UI framework |
| TypeScript | 5 | Type safety |
| Vite | 5 | Dev server and bundler |
| React Router DOM | 7 | Client-side routing |
| React Flow (reactflow) | 11 | Interactive graph rendering |
| Dagre | 0.8.5 | Automatic DAG layout |
| Axios | 1.6 | HTTP client |

### Backend

| Library | Version | Purpose |
|---|---|---|
| Node.js | LTS | Runtime |
| Express | 4 | HTTP server |
| groq-sdk | 1.1 | Groq API (llama-3.3-70b-versatile) |
| jsonwebtoken | 9 | JWT auth |
| multer | 2 | PDF file upload |
| pdfjs-dist | 5 | PDF text extraction |
| compromise | 14 | NLP support |
| dotenv | 17 | Environment config |
| cors | 2 | Cross-origin requests |
| body-parser | 1 | JSON request parsing |

---

## Project Structure

```
legal-reasoning-explorer/
├── backend/
│   ├── models/
│   │   ├── nodeModel.js         # Node data model
│   │   ├── edgeModel.js         # Edge data model
│   │   └── caseModel.js         # Case graph model
│   ├── routes/
│   │   ├── process.js           # POST /api/process
│   │   ├── chat.js              # POST /api/chat (Lex AI)
│   │   └── upload.js            # POST /api/upload-pdf
│   ├── services/
│   │   ├── reasoningEngine.js   # Sentence classification (4 node types)
│   │   └── graphBuilder.js      # Node-to-edge graph construction
│   ├── db/
│   │   ├── index.js
│   │   ├── migrate.js
│   │   └── schema.sql
│   ├── .env                     # Environment variables (not committed)
│   ├── server.js                # Express entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── InputSection.tsx       # Text input + PDF upload
│   │   │   ├── ResultSection.tsx      # JSON / Graph output panel
│   │   │   ├── GraphVisualizer.tsx    # React Flow graph
│   │   │   ├── NodeLegend.tsx         # Graph legend
│   │   │   ├── ChatBot.tsx            # Lex AI chat panel
│   │   │   ├── CaseHistoryPanel.tsx   # Case history sidebar
│   │   │   └── ProtectedRoute.tsx     # JWT route guard
│   │   ├── services/
│   │   │   └── api.ts                 # Axios API client
│   │   ├── App.tsx                    # Router + routes
│   │   ├── LandingPage.tsx            # Public landing page
│   │   ├── MainApp.tsx                # Protected main explorer
│   │   ├── index.css
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── docs/
│   ├── architecture.md
│   ├── project_synopsis.md
│   ├── reasoning-model.md
│   └── roadmap.md
└── README.md
```

---

## API Reference

All endpoints run at `http://localhost:5000`.

### `POST /api/login`

Issues a 24-hour JWT token.

**Request**
```json
{ "name": "Jane Doe", "email": "jane@example.com" }
```

**Response**
```json
{ "token": "<jwt>", "user": { "name": "Jane Doe", "email": "jane@example.com" } }
```

---

### `GET /api/verify`

Validates the current token.

**Headers:** `Authorization: Bearer <token>`

**Response** `200` — `{ "valid": true, "user": { ... } }` or `401`/`403` on failure.

---

### `POST /api/process`

Runs the NLP reasoning engine and returns the case graph.

**Request**
```json
{ "text": "Full legal judgment text here..." }
```

**Response** `200`
```json
{
  "nodes": [
    { "id": "node-0", "type": "claim",      "text": "The appellant argued that..." },
    { "id": "node-3", "type": "conclusion", "text": "The court held that..."       }
  ],
  "edges": [
    { "source": "node-0", "target": "node-3", "relation": "supports" }
  ]
}
```

**Errors:** `400` if text is missing · `500` on processing failure.

---

### `POST /api/upload-pdf`

Extracts plain text from an uploaded PDF file.

**Request:** `multipart/form-data` with field `pdf` (max 5 MB).

**Response** `200`
```json
{ "text": "...", "pages": 12, "filename": "judgment.pdf", "size": 204800 }
```

**Errors:** `400` no file · `413` file too large · `422` scanned/image PDF · `500` parse error.

---

### `POST /api/chat`

Sends a message to Lex AI. Context (judgment text + graph) is injected into the LLM system prompt automatically.

**Request**
```json
{
  "messages": [{ "role": "user", "content": "What was the main claim?" }],
  "context": {
    "judgmentText": "...",
    "graphData": { "nodes": [...], "edges": [...] }
  }
}
```

**Response** `200` — `{ "reply": "..." }`

---

### `GET /api/health`

```json
{ "status": "ok", "phase": 2, "timestamp": "2026-04-21T..." }
```

---

## Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
GROQ_API_KEY=your_groq_api_key_here
JWT_SECRET=your_secret_key_here
```

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | **Yes** | Groq API key for the Lex AI assistant. Get one free at [console.groq.com](https://console.groq.com). |
| `JWT_SECRET` | No | Secret used to sign JWTs. Defaults to a built-in value if omitted. Set one for production. |
| `PORT` | No | Backend port. Defaults to `5000`. |

---

## Local Setup & Run

### Prerequisites

- **Node.js** LTS (v18 or newer)
- **npm**
- A **Groq API key** (free at [console.groq.com](https://console.groq.com))

---

### 1. Clone the repository

```bash
git clone https://github.com/KanishkSigar/legal-reasoning-explorer.git
cd legal-reasoning-explorer
```

---

### 2. Configure environment

```bash
cd backend
cp .env.example .env   # or create .env manually
```

Edit `backend/.env` and set `GROQ_API_KEY` to your key.

---

### 3. Start the backend

```bash
cd backend
npm install
npm start
```

Backend starts at **http://localhost:5000**.  
You should see:

```
[Server] Legal Case Reasoning Explorer backend running on http://localhost:5000
[Server] Phase 2 – Enhanced NLP engine enabled.
```

---

### 4. Start the frontend

Open a **second terminal**:

```bash
cd frontend
npm install
npm run dev
```

Frontend starts at **http://localhost:5173** (Vite default).

---

### 5. Open in browser

Navigate to **http://localhost:5173**.

---

## Deployment (GitHub Pages + Vercel)

Production deployment is split:

- **Frontend** → GitHub Pages (`https://kanishksigar.github.io/legal-reasoning-explorer/`). The NLP engine, graph builder, and PDF extraction all run **in the browser** — no backend needed for those.
- **Chat (Lex AI) only** → a Vercel serverless function at `api/chat.ts`. It's the only piece that still needs a server, because the Groq API key cannot ship to the browser.

### 1. Deploy the chat function to Vercel

```bash
# from the repo root
npm install                       # installs groq-sdk for the function
npx vercel                        # link to a new Vercel project
npx vercel env add GROQ_API_KEY   # paste your Groq key (Production scope)
npx vercel --prod
```

Vercel prints a production URL like `https://<your-project>.vercel.app`. The chat endpoint is at `https://<your-project>.vercel.app/api/chat`.

The `vercel.json` at the repo root tells Vercel **not** to build the frontend — only the `api/` folder is deployed.

### 2. Set the chat URL as a GitHub Actions secret

The frontend reads the chat URL from `VITE_CHAT_API_URL` at build time.

1. Go to **Settings → Secrets and variables → Actions** in the GitHub repo.
2. Create a new secret `VITE_CHAT_API_URL` with value `https://<your-project>.vercel.app/api/chat`.

### 3. Enable GitHub Pages

1. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Push to `main`. The workflow at `.github/workflows/deploy.yml` will:
   - `npm ci` and `npm run build` inside `frontend/`
   - Upload `frontend/dist` as the Pages artifact
   - Deploy to Pages

The site goes live at `https://<your-username>.github.io/legal-reasoning-explorer/`.

### How the deployed app differs from local dev

| | Local (`npm run dev` + `npm start`) | Production (GH Pages + Vercel) |
|---|---|---|
| NLP processing | Backend `/api/process` (Express) | Client-side (`src/lib/reasoningEngine.ts`) |
| PDF extraction | Backend `/api/upload-pdf` (multer + pdfjs) | Client-side (`src/lib/pdfExtractor.ts`) |
| Lex chat | Backend `/api/chat` (Groq SDK) | Vercel function `api/chat.ts` (Groq SDK) |
| Auth | Real JWT issued by Express | Client-side localStorage marker (soft gate) |
| Routing | `HashRouter` (works in both) | `HashRouter` (no SPA fallback needed) |

The `backend/` folder stays intact for local development — `npm start` inside it still works.

---

## How to Use

1. **Sign in** — Enter your name and email on the landing page. A 24-hour session token is issued.
2. **Input a judgment** — Paste judgment text into the text area, or click the upload button to drop a PDF (up to 5 MB).
3. **Analyze** — Click **Analyze**. The NLP engine processes the text and returns a reasoning graph.
4. **Explore the graph** — Switch to **Graph View** to see the interactive DAG. Click any node to read its full text. Use the toggle to switch to **JSON View** for the raw payload.
5. **Ask Lex** — Click the chat button to open the Lex AI assistant. It has already read your judgment and graph — ask anything about the case, the claims, precedents, or legal concepts involved.
6. **Sign out** — Use the Sign out button in the top-right header.

---

## Reasoning Model

### Node Types

| Type | Keywords / Patterns |
|---|---|
| `conclusion` | `held that`, `therefore`, `thus`, `accordingly`, `we conclude`, `dismissed`, `allowed`, `quashed`, `set aside`, … |
| `reasoning` | `because`, `since`, `in view of`, `having regard to`, `it follows that`, `the court is of the opinion`, … |
| `claim` | `argued`, `contended`, `submitted`, `alleged`, `pleaded`, `the petitioner claims`, `the appellant submits`, … |
| `precedent` | `vs.`, `cited`, `relied on`, `referred to`, `as held in`, `in the case of`, `the ratio in`, … |

**Priority order:** `conclusion` → `reasoning` → `claim` → `precedent`

### Edge Construction

| Relation | Rule |
|---|---|
| `supports` | Each `claim` → each `conclusion` |
| `cites` | Each `conclusion` → each `precedent` |
| `leads_to` | Each `reasoning` → each `conclusion` |

### Sentence Splitting

Legal abbreviations (`vs.`, `no.`, `art.`, `sec.`, `hon.`, etc.) are protected from splitting by a placeholder substitution pass before the sentence boundary regex runs.

---

## Data Contract

### Graph JSON (from `/api/process`)

```json
{
  "nodes": [
    {
      "id": "node-0",
      "type": "claim | precedent | reasoning | conclusion",
      "text": "Sentence text..."
    }
  ],
  "edges": [
    {
      "source": "node-0",
      "target": "node-3",
      "relation": "supports | cites | leads_to"
    }
  ]
}
```

---

## Known Limitations

- Rule-based extraction can miss nuanced or uncommon legal phrasing.
- Many-to-many edge linking by type group — not context-sensitive.
- Scanned or image-based PDFs are not supported (text-layer PDFs only).
- Results are session-only — no persistent database storage in the current build.
- No automated test suite yet (manual validation only).

---

## Author

Built by **Kanishk Sigar** · [GitHub](https://github.com/KanishkSigar/legal-reasoning-explorer)

---

_Last updated: May 2026_
