# SkinVeda.ai

**Understand your skin. Build a better routine.**

SkinVeda.ai is an AI-assisted skincare platform: scan your face, understand the visible concerns in plain language, follow a personalised routine, learn which ingredients suit you, optionally explore products, consult a dermatologist if you want professional guidance, and track your progress over time.

> SkinVeda.ai provides AI-assisted skincare guidance and does not replace professional medical diagnosis.

## User journey

Face scan → Skin report → Personalised routine → Ingredients for you → Optional products → Optional dermatologist consultation → Progress tracking

| Area | What it does |
|---|---|
| **Scan** | Upload or camera capture with a face guide, lighting tips, optional questions, quality checks and a retake prompt |
| **My Skin** | Summary sentence, top visible concerns, face map, 5 measurements, confidence, next steps; routine and ingredient tabs |
| **Products** | Filters (skin type, concern, category, ingredient, price, brand), "Why recommended?" explanations, clearly labelled sponsored section, detail pages |
| **Doctors** | Directory with filters, profiles, video / chat / clinic booking, "your consultations" |
| **Progress** | Day 1 / 14 / 30 comparison, graph, routine consistency, before/after, per-scan notes |
| **Safety** | Escalation to a dermatologist when a concern looks extensive, is worsening, or the assessment is uncertain |

Also included: mood tracking, an AI wellbeing companion, UV & weather guidance and printable reports. Light and dark mode, mobile bottom navigation, keyboard and screen-reader support.

## Honest notes

- **Skin analysis** is a *preview* model built on explainable image measurements (colour, brightness, local texture per face zone) — not a trained medical model. Results are deterministic per photo and always show a confidence level. `src/lib/analysis.js` isolates feature extraction so a trained model can replace it.
- **Products and dermatologists are sample data** (fictional brands, placeholder profiles, no ratings or reviews) and are labelled as such in the UI. Replace them via `src/lib/catalog.js` with a real catalogue / verified directory.
- Consultation bookings are stored, but no real appointment is made.

## Tech stack

- **Frontend:** React 19 + Vite, modular token-based CSS (`src/styles/`), hash routing
- **Backend:** FastAPI + asyncpg on PostgreSQL (Supabase), JWT auth, bcrypt

## Run locally

**1. Backend**

```bash
cd backend
pip install -r requirements.txt
```

Create `backend/.env`:

```
DATABASE_URL=postgresql://postgres:<password>@<host>:5432/postgres
JWT_SECRET=<a long random string>
```

Write any `@` in the password as `%40`. Tables are created automatically on start.

```bash
python main.py        # http://localhost:8000  (API docs: /api/docs)
```

**2. Frontend**

```bash
npm install
npm run dev           # http://localhost:5173
```

Use **Explore the demo** on the sign-in page to try everything without an account (demo data stays in your browser).

## Project structure

```
src/
  pages/            Screens (Scan, MySkin/, Products, Doctors, Progress, Dashboard, …)
  components/       ui.jsx (primitives), skin.jsx, commerce.jsx, navigation
  lib/              analysis, routine, records, catalog, theme, image
  data/             skincare knowledge base, sample products & doctors
  styles/           tokens, base, components, layout, pages
backend/
  app/routers/      auth, diagnosis, mood, progress, routine, appointments
  app/config/       settings, database (schema + retrying pool)
```
