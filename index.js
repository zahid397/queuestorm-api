"use strict";

const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// ── Keywords ──────────────────────────────────────────────────────
const KEYWORDS = {
  wrong_transfer: [
    "wrong number","wrong recipient","wrong person",
    "sent to wrong","wrong transfer","wrong account",
    "wrong bkash","sent wrong","transferred wrong",
    "ভুল নম্বর","ভুল নাম্বার","ভুল নম্বরে",
    "ভুল একাউন্ট","ভুল ট্রান্সফার","ভুলে পাঠিয়ে",
    "vul number","vul nombore",
  ],
  payment_failed: [
    "payment failed","transaction failed","failed payment",
    "deducted but","money deducted","balance deducted",
    "not received","double charge","duplicate charge",
    "charged twice","কাটা গেছে","টাকা কেটেছে",
    "পেমেন্ট ফেইল","পেমেন্ট হয়নি","payment fail",
    "transaction fail","kete geche",
  ],
  refund_request: [
    "refund","get back","return money","return my money",
    "money back","want refund","need refund","cancel",
    "cancellation","reimburs","রিফান্ড","ফেরত চাই",
    "টাকা ফেরত","ফেরত দিন","ফিরিয়ে দিন",
    "refund chai","taka ferat",
  ],
  phishing_or_social_engineering: [
    "otp","pin","password","passcode","secret code",
    "asked for otp","asked my pin","share my otp",
    "give otp","send otp","verify otp","scam","fraud",
    "fake bkash","suspicious call","suspicious sms",
    "asking for pin","asking for otp","asking for password",
    "bkash agent called","someone called","lottery",
    "prize","won prize","account blocked","fake agent",
    "fake call","ওটিপি","পিন","পাসওয়ার্ড",
    "ওটিপি চেয়েছে","পিন চেয়েছে","স্ক্যাম",
    "প্রতারণা","ভুয়া বিকাশ","সন্দেহজনক","লটারি",
  ],
};

const SEVERITY = {
  wrong_transfer: "high",
  payment_failed: "high",
  refund_request: "medium",
  phishing_or_social_engineering: "critical",
  other: "low",
};

const DEPARTMENT = {
  wrong_transfer: "dispute_resolution",
  payment_failed: "payments_ops",
  refund_request: "dispute_resolution",
  phishing_or_social_engineering: "fraud_risk",
  other: "customer_support",
};

// ── Classifier ────────────────────────────────────────────────────
function classify(ticketId, message) {
  const msg = (message || "").toLowerCase()
    .replace(/[।,;!?""'']/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const scores = {};

  for (const [type, terms] of Object.entries(KEYWORDS)) {
    let hits = 0;
    for (const term of terms) {
      if (msg.includes(term.toLowerCase())) hits++;
    }
    if (hits > 0) {
      const weight = type === "phishing_or_social_engineering" ? 15 : 10;
      scores[type] = { score: hits * weight, hits };
    }
  }

  let caseType = "other";
  let bestHits = 0;
  let bestScore = 0;
  let totalScore = 0;

  for (const [type, data] of Object.entries(scores)) {
    totalScore += data.score;
    if (
      data.score > bestScore ||
      (data.score === bestScore && type === "phishing_or_social_engineering")
    ) {
      bestScore = data.score;
      bestHits = data.hits;
      caseType = type;
    }
  }

  // Confidence
  let confidence = 0.35;
  if (bestHits > 0) {
    confidence = Math.min(0.55 + (bestHits - 1) * 0.10, 0.90);
    const dominance = bestScore / (totalScore || 1);
    if (dominance > 0.9) confidence = Math.min(confidence + 0.05, 0.95);
    else if (dominance < 0.5) confidence = Math.max(confidence - 0.10, 0.40);
    confidence = Math.round(confidence * 100) / 100;
  }

  // Amount extraction
  let amt = null;
  const amtMatch =
    msg.match(/৳\s*[\d,]+/) ||
    msg.match(/(?:bdt|tk|taka)\s*[\d,]+/i) ||
    msg.match(/[\d,]+\s*(?:bdt|tk|taka)/i) ||
    msg.match(/[\d,]+\s*(?:টাকা)/);
  if (amtMatch) {
    amt = amtMatch[0].trim();
  } else {
    const numMatch = msg.match(/\b(\d{3,})\b/);
    if (numMatch) amt = numMatch[1] + " BDT";
  }

  // Summary
  const summaries = {
    wrong_transfer: amt
      ? `Customer reports sending ${amt} to an incorrect recipient and requests a transfer reversal.`
      : "Customer reports sending money to an incorrect recipient and requests recovery assistance.",
    payment_failed: amt
      ? `Customer reports a failed transaction where ${amt} may have been deducted without successful delivery.`
      : "Customer reports a transaction failure where balance may have been deducted but payment did not complete.",
    refund_request: amt
      ? `Customer is requesting a refund of ${amt} for a previous transaction.`
      : "Customer is requesting a refund or cancellation for a previous transaction.",
    phishing_or_social_engineering:
      "Customer reports a suspicious contact that may be a phishing or social engineering attempt. Immediate review required.",
    other:
      "Customer has submitted a support request that requires further review to determine the appropriate action.",
  };

  const severity = SEVERITY[caseType];
  const human_review_required =
    severity === "critical" || caseType === "phishing_or_social_engineering";

  return {
    ticket_id: ticketId,
    case_type: caseType,
    severity,
    department: DEPARTMENT[caseType],
    agent_summary: summaries[caseType],
    human_review_required,
    confidence,
  };
}

// ── Routes ────────────────────────────────────────────────────────

// GET /health
app.get("/health", (req, res) => {
  return res.status(200).json({
    status: "ok",
    service: "QueueStorm API",
    timestamp: new Date().toISOString(),
  });
});

// POST /sort-ticket
app.post("/sort-ticket", (req, res) => {
  const body = req.body || {};

  if (!body.ticket_id || !String(body.ticket_id).trim()) {
    return res.status(400).json({
      error: "Validation failed",
      details: ["'ticket_id' is required and must be a non-empty string."],
    });
  }

  if (!body.message || !String(body.message).trim()) {
    return res.status(400).json({
      error: "Validation failed",
      details: ["'message' is required and must be a non-empty string."],
    });
  }

  try {
    const result = classify(body.ticket_id, body.message);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(200).json({
      ticket_id: body.ticket_id,
      case_type: "other",
      severity: "low",
      department: "customer_support",
      agent_summary: "Support request received. Routed for manual review.",
      human_review_required: true,
      confidence: 0.30,
    });
  }
});

// 404
app.use((req, res) => {
  return res.status(404).json({
    error: "Not found",
    message: `${req.method} ${req.path} is not a valid endpoint.`,
    available_endpoints: ["GET /health", "POST /sort-ticket"],
  });
});

// ── Start (for Render/Railway) or Export (for Vercel) ─────────────
if (process.env.VERCEL) {
  module.exports = app;
} else {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`QueueStorm API running on port ${PORT}`);
  });
  module.exports = app;
}
