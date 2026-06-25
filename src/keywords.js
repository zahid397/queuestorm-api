/**
 * keywords.js
 * ─────────────────────────────────────────────────────────────────────
 * All keyword dictionaries used by the classifier.
 * Supports English, Bengali (Banglish transliteration), and mixed.
 * Adding new keywords here is the only change needed to improve accuracy.
 */

const KEYWORDS = {
  // ── wrong_transfer ───────────────────────────────────────────────────
  wrong_transfer: {
    weight: 10,
    terms: [
      // English
      "wrong number", "wrong recipient", "wrong person", "sent to wrong",
      "wrong transfer", "mistaken transfer", "wrong account",
      "wrong bkash", "sent wrong", "transferred wrong",
      "wrong mobile", "wrong no", "wrong num",
      // Bengali / Banglish
      "ভুল নম্বর", "ভুল নাম্বার", "ভুল নম্বরে", "ভুল একাউন্ট",
      "ভুল ট্রান্সফার", "ভুল মানুষকে", "অন্য নম্বরে",
      "vul number", "vul nombore", "ভুলে পাঠিয়ে",
    ],
  },

  // ── payment_failed ──────────────────────────────────────────────────
  payment_failed: {
    weight: 10,
    terms: [
      // English
      "payment failed", "transaction failed", "failed payment",
      "deducted but", "money deducted", "balance deducted", "not received",
      "deducted not", "charge failed", "failed transaction",
      "deduct hoise", "কাটা গেছে", "টাকা কাটা",
      "double charge", "duplicate charge", "charged twice",
      // Bengali / Banglish
      "পেমেন্ট ফেইল", "পেমেন্ট হয়নি", "ট্রানজেকশন ফেইল",
      "টাকা গেছে কিন্তু", "টাকা কেটেছে", "ব্যালেন্স কাটা",
      "payment fail", "transaction fail", "kete geche",
    ],
  },

  // ── refund_request ──────────────────────────────────────────────────
  refund_request: {
    weight: 10,
    terms: [
      // English
      "refund", "get back", "return money", "return my money",
      "get my money back", "want refund", "need refund",
      "cancel", "cancellation", "reversed", "reversal",
      "money back", "reimburs",
      // Bengali / Banglish
      "রিফান্ড", "ফেরত চাই", "টাকা ফেরত", "ফেরত দিন",
      "পাঠিয়ে ফেরত", "ফিরিয়ে দিন", "ফেরৎ",
      "refund chai", "taka ferat", "ferot chai",
    ],
  },

  // ── phishing_or_social_engineering ─────────────────────────────────
  phishing_or_social_engineering: {
    weight: 15,  // highest weight – safety critical
    terms: [
      // English
      "otp", "pin", "password", "passcode", "secret code",
      "asked for otp", "asked my pin", "share my otp", "give otp",
      "send otp", "verify otp", "scam", "fraud", "fake bkash",
      "impersonat", "pretend", "suspicious call", "suspicious sms",
      "asking for pin", "asking for otp", "asking for password",
      "bkash agent called", "bkash called", "someone called",
      "lottery", "prize", "won prize", "account suspended",
      "account blocked", "account will be blocked",
      // Bengali / Banglish
      "ওটিপি", "পিন", "পাসওয়ার্ড",
      "ওটিপি চেয়েছে", "পিন চেয়েছে", "পাসওয়ার্ড চেয়েছে",
      "ওটিপি দিতে বলেছে", "পিন দিতে বলেছে",
      "স্ক্যাম", "প্রতারণা", "ভুয়া বিকাশ", "ভুয়া এজেন্ট",
      "সন্দেহজনক", "লটারি", "পুরস্কার",
      "otp dite bolechhe", "pin dite bolechhe",
      "fake agent", "fake call", "bkash er name e",
    ],
  },
};

// ── Severity map ─────────────────────────────────────────────────────
const SEVERITY_MAP = {
  wrong_transfer: "high",
  payment_failed: "high",
  refund_request: "medium",
  phishing_or_social_engineering: "critical",
  other: "low",
};

// ── Department map ───────────────────────────────────────────────────
const DEPARTMENT_MAP = {
  wrong_transfer: "dispute_resolution",
  payment_failed: "payments_ops",
  refund_request: "dispute_resolution",
  phishing_or_social_engineering: "fraud_risk",
  other: "customer_support",
};

module.exports = { KEYWORDS, SEVERITY_MAP, DEPARTMENT_MAP };
