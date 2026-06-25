"use strict";

const { classify } = require("../services/classifier.service");
const { validateTicket } = require("../services/validator.service");
const logger = require("../utils/logger");

/**
 * POST /sort-ticket
 *
 * 1. Validate request body
 * 2. Classify the ticket (rule-based, no external API)
 * 3. Return structured response matching spec exactly
 *    (strips internal _meta from public response)
 */
function sortTicket(req, res) {
  const startMs = Date.now();
  const body = req.body;

  // ── Validation ───────────────────────────────────────────────────
  const validation = validateTicket(body);
  if (!validation.valid) {
    logger.warn("Validation failed", { errors: validation.errors, body });
    return res.status(400).json({
      error: "Validation failed",
      details: validation.errors,
    });
  }

  // ── Classify ─────────────────────────────────────────────────────
  let result;
  try {
    result = classify(body);
  } catch (err) {
    logger.error("Classifier threw an error", { err: err.message, body });
    // Fallback safe response — never crashes the service
    return res.status(200).json({
      ticket_id: body.ticket_id || "unknown",
      case_type: "other",
      severity: "low",
      department: "customer_support",
      agent_summary:
        "Customer has submitted a support request. Unable to auto-classify; routed for manual review.",
      human_review_required: true,
      confidence: 0.30,
    });
  }

  // ── Build public response (strip _meta) ──────────────────────────
  const response = {
    ticket_id: result.ticket_id,
    case_type: result.case_type,
    severity: result.severity,
    department: result.department,
    agent_summary: result.agent_summary,
    human_review_required: result.human_review_required,
    confidence: result.confidence,
  };

  const elapsed = Date.now() - startMs;
  logger.info("Ticket classified", {
    ticket_id: result.ticket_id,
    case_type: result.case_type,
    severity: result.severity,
    confidence: result.confidence,
    hits: result._meta.total_hits,
    ms: elapsed,
  });

  return res.status(200).json(response);
}

module.exports = { sortTicket };
