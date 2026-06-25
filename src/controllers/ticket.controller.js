"use strict";

const { classify }       = require("../services/classifier.service");
const { validateTicket } = require("../services/validator.service");
const logger             = require("../utils/logger");

/**
 * POST /sort-ticket
 * 1. Validate request body
 * 2. Classify ticket (rule-based)
 * 3. Return structured JSON matching spec exactly
 */
function sortTicket(req, res) {
  const start = Date.now();
  const body  = req.body;

  // Validate
  const validation = validateTicket(body);
  if (!validation.valid) {
    logger.warn("Validation failed", { errors: validation.errors });
    return res.status(400).json({
      error:   "Validation failed",
      details: validation.errors,
    });
  }

  // Classify
  let result;
  try {
    result = classify(body);
  } catch (err) {
    logger.error("Classifier error", { message: err.message });
    // Safe fallback — service never returns 500 for a ticket
    return res.status(200).json({
      ticket_id:             body.ticket_id || "unknown",
      case_type:             "other",
      severity:              "low",
      department:            "customer_support",
      agent_summary:         "Support request received. Unable to auto-classify; routed for manual review.",
      human_review_required: true,
      confidence:            0.30,
    });
  }

  // Build public response — strip internal _meta
  const response = {
    ticket_id:             result.ticket_id,
    case_type:             result.case_type,
    severity:              result.severity,
    department:            result.department,
    agent_summary:         result.agent_summary,
    human_review_required: result.human_review_required,
    confidence:            result.confidence,
  };

  logger.info("Ticket classified", {
    ticket_id:  result.ticket_id,
    case_type:  result.case_type,
    severity:   result.severity,
    confidence: result.confidence,
    ms:         Date.now() - start,
  });

  return res.status(200).json(response);
}

module.exports = { sortTicket };
