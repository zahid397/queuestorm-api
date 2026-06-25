"use strict";

const express = require("express");

// ── Keywords ─────────────────────────────────────────────────────────
const KEYWORDS = {
  wrong_transfer: {
    weight: 10,
    terms: [
      "wrong number","wrong recipient","wrong person","sent to wrong",
      "wrong transfer","wrong account","wrong bkash","sent wrong",
      "transferred wrong","wrong mobile","wrong no","wrong num",
      "ভুল নম্বর","ভুল নাম্বার","ভুল নম্বরে","ভুল একাউন্ট",
      "ভুল ট্রান্সফার","ভুলে পাঠিয়ে","vul number",
    ],
  },
  payment_failed: {
    weight: 10,
    terms: [
      "payment failed","transaction failed","failed payment",
      "deducted but","money deducted","balance deducted","not received",
      "double charge","duplicate charge","charged twice",
      "পেমেন্ট ফেইল","পেমেন্ট হয়নি","টাকা কেটেছে","কাটা গেছে",
      "payment fail","transaction fail","kete geche",
    ],
  },
  refund_request: {
    weight: 10,
    terms: [
      "refund","get back","return money","return my money",
      "get my money back","want refund","need refund",
      "cancel","cancellation","money back","reimburs",
      "রিফান্ড","ফেরত চাই","টাকা ফেরত","ফেরত দিন","ফিরিয়ে দিন",
      "refund chai","taka ferat",
    ],
  },
  phishing_or_social_engineering: {
    weight: 15,
    terms: [
      "otp","pin","password","pass
