# QueueStorm Warmup — Mock Preliminary Task API

**bKash · SUST CSE Carnival 2026 · Codex Community Hackathon**

A production-ready, rule-based ticket classification REST API built with Node.js + Express.

---

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Service liveness check |
| `POST` | `/sort-ticket` | Classify a customer support ticket |

---

## Quick Start (Local)

```bash
npm install
npm start          # production
npm run dev        # development (auto-reload)
```

Server starts on `http://localhost:3000`

---

## Deploy to Render (Recommended)

1. Push this repo to GitHub (public)
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your GitHub repo
4. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment:** Node
5. Click **Deploy**

Render automatically injects `PORT` — the app reads it via `process.env.PORT`.

---

## Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

`vercel.json` is already configured.

---

## Example Requests

### Health check
```bash
curl https://your-api.onrender.com/health
```
```json
{
  "status": "ok",
  "service": "QueueStorm API",
  "timestamp": "2026-06-26T10:00:00.000Z"
}
```

### Classify a ticket
```bash
curl -X POST https://your-api.onrender.com/sort-ticket \
  -H "Content-Type: application/json" \
  -d '{
    "ticket_id": "T-001",
    "channel": "app",
    "locale": "en",
    "message": "I sent 5000 taka to a wrong number this morning, please help me get it back"
  }'
```
```json
{
  "ticket_id": "T-001",
  "case_type": "wrong_transfer",
  "severity": "high",
  "department": "dispute_resolution",
  "agent_summary": "Customer reports sending 5000 BDT to an incorrect recipient and requests recovery assistance.",
  "human_review_required": false,
  "confidence": 0.85
}
```

---

## All 5 Public Test Cases

| # | Message | Expected | Severity |
|---|---------|----------|----------|
| 1 | "I sent 3000 to wrong number" | `wrong_transfer` | high |
| 2 | "Payment failed but balance deducted" | `payment_failed` | high |
| 3 | "Someone called asking my OTP, is that bKash?" | `phishing_or_social_engineering` | critical |
| 4 | "Please refund my last transaction, I changed my mind" | `refund_request` | low |
| 5 | "App crashed when I opened it" | `other` | low |

---

## LLM Used

**No** — fully rule-based keyword matching. Zero external APIs.

---

## Project Structure

```
queuestorm/
├── server.js                     # Entry point (Render start command)
├── package.json
├── render.yaml                   # Render deployment config
├── vercel.json                   # Vercel deployment config
└── src/
    ├── app.js                    # Express app factory
    ├── routes/
    │   ├── health.routes.js
    │   └── ticket.routes.js
    ├── controllers/
    │   ├── health.controller.js
    │   └── ticket.controller.js
    ├── services/
    │   ├── classifier.service.js  # Classification engine
    │   └── validator.service.js   # Input validation
    ├── middleware/
    │   └── errorHandler.js        # Request logger + error handler
    └── utils/
        ├── keywords.js            # All keyword dictionaries
        └── logger.js              # Structured logger
```
