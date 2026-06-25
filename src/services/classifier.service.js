"use strict";

/**
 * classifier.service.js
 * Pure rule-based ticket classifier. No external API, no database.
 *
 * Steps:
 *  1. Normalize message (lowercase, strip punctuation)
 *  2. Score each case_type by keyword hits × weight
 *  3. Pick the highest scoring type (or "other")
 *  4. Derive severity, department, human_review_required
 *  5. Compute confidence from score distribution
 *  6. Generate safe agent_summary (NEVER asks for PIN/OTP/password)
 */

const { KEYWORDS, SEVERITY_MAP, DEPARTMENT_MAP } = require("../utils/keywords");

// Words that must NEVER appear in agent_summary
const FORBIDDEN = ["pin", "otp", "password", "card number", "passcode", "secret code"];

// ── Normalize ────────────────────────────────────────────────────────
function normalize(text) {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[।,;!?""'']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ── Score every category ─────────────────────────────────────────────
function scoreMessage(msg) {
  const scores = {};
  for (const [caseType, { weight, terms }] of Object.entries(KEYWORDS)) {
    let hits = 0;
    const matched = [];
    for (const term of terms) {
      if (msg.includes(term.toLowerCase())) {
        hits++;
        matched.push(term);
      }
    }
    if (hits > 0) {
      scores[caseType] = { score: hits * weight, hits, matched };
    }
  }
  return scores;
}

// ── Pick the best case_type ──────────────────────────────────────────
function pickBest(scores) {
  if (Object.keys(scores).length === 0) {
    return { caseType: "other", score: 0, hits: 0, matched: [] };
  }
  const sorted = Object.entries(scores).sort(([aType, a], [bType, b]) => {
    if (b.score !== a.score) return b.score - a.score;
    // Phishing wins ties (safety first)
    if (bType === "phishing_or_social_engineering") return 1;
    if (aType === "phishing_or_social_engineering") return -1;
    return 0;
  });
  const [caseType, data] = sorted[0];
  return { caseType, ...data };
}

// ── Confidence ───────────────────────────────────────────────────────
function computeConfidence(bestScore, hits, allScores) {
  if (hits === 0) return 0.35;
  const total = Object.values(allScores).reduce((s, d) => s + d.score, 0);
  const dominance = bestScore / (total || 1);
  let base = Math.min(0.55 + (hits - 1) * 0.10, 0.90);
  if (dominance > 0.9) base = Math.min(base + 0.05, 0.95);
  else if (dominance < 0.5) base = Math.max(base - 0.10, 0.40);
  return Math.round(base * 100) / 100;
}

// ── Extract amount from message ──────────────────────────────────────
function extractAmount(msg) {
  const patterns = [
    /৳\s*[\d,]+/,
    /(?:bdt|tk|taka)\s*[\d,]+/i,
    /[\d,]+\s*(?:bdt|tk|taka)/i,
    /[\d,]+\s*(?:টাকা)/,
  ];
  for (const p of patterns) {
    const m = msg.match(p);
    if (m) return m[0].trim();
  }
  const num = msg.match(/\b(\d{3,})\b/);
  if (num) return num[1] + " BDT";
  return null;
}

// ── Safe summaries (no forbidden words) ─────────────────────────────
const SUMMARIES = {
  wrong_transfer: (msg) => {
    const amt = extractAmount(msg);
    return amt
      ? `Customer reports sending ${amt} to an incorrect recipient and requests a transfer reversal.`
      : "Customer reports sending money to an incorrect recipient and requests recovery assistance.";
  },
  payment_failed: (msg) => {
    const amt = extractAmount(msg);
    return amt
      ? `Customer reports a failed transaction where ${amt} may have been deducted without successful delivery.`
      : "Customer reports a transaction failure where the balance may have been deducted but payment did not complete.";
  },
  refund_request: (msg) => {
    const amt = extractAmount(msg);
    return amt
      ? `Customer is requesting a refund of ${amt} for a previous transaction.`
      : "Customer is requesting a refund or cancellation for a previous transaction.";
  },
  phishing_or_social_engineering: () =>
    "Customer reports a suspicious contact that may be a phishing or social engineering attempt. Immediate review required.",
  other: () =>
    "Customer has submitted a support request that requires further review to determine the appropriate action.",
};

function sanitize(summary) {
  let safe = summary;
  for (const word of FORBIDDEN) {
    safe = safe.replace(new RegExp(word, "gi"), "[REDACTED]");
  }
  return safe;
}

// ── Main classify function ────────────────────────────────────────────
function classify(ticket) {
  const {
    ticket_id,
    channel = "unknown",
    locale  = "mixed",
    message,
  } = ticket;

  const msg    = normalize(message);
  const scores = scoreMessage(msg);
  const { caseType, score: bestScore, hits, matched } = pickBest(scores);

  const severity            = SEVERITY_MAP[caseType];
  const department          = DEPARTMENT_MAP[caseType];
  const humanReviewRequired =
    severity === "critical" || caseType === "phishing_or_social_engineering";
  const confidence          = computeConfidence(bestScore, hits || 0, scores);
  const agentSummary        = sanitize(SUMMARIES[caseType](msg));

  return {
    ticket_id,
    case_type:             caseType,
    severity,
    department,
    agent_summary:         agentSummary,
    human_review_required: humanReviewRequired,
    confidence,
    _meta: { channel, locale, matched_terms: matched, total_hits: hits || 0 },
  };
}

module.exports = { classify };
