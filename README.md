# 📸 LectureSnap

Turn any study material into structured notes and flashcards using AI.

## Getting Started

### 1. Get a free Gemini API Key

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Sign in with your Google account
3. Click **Get API key** → **Create API key in new project**
4. Copy your key

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
GEMINI_API_KEY=your_key_here
```

### 3. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add `GEMINI_API_KEY` in **Settings → Environment Variables**
4. Click **Deploy**

> **Note:** Camera capture requires HTTPS. Vercel handles this automatically on deployment. On `localhost` most browsers will still allow camera access.

## Features

- 📷 Drag & drop upload or direct camera capture
- 🧠 AI-powered notes with key concepts, summaries, and LaTeX formulas
- 🃏 Flippable flashcards with shuffle and navigation
- 📤 Copy or download notes as Markdown
- 🕒 Last 5 sessions saved locally (no account needed)
- 🌙 Dark mode
- 📱 Fully mobile responsive