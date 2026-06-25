"use strict";

/**
 * validator.service.js
 * Validates the /sort-ticket request body.
 */

const VALID_CHANNELS = ["app", "sms", "call_center", "merchant_portal"];
const VALID_LOCALES  = ["bn", "en", "mixed"];

function validateTicket(body) {
  const errors = [];

  if (!body || typeof body !== "object") {
    return { valid: false, errors: ["Request body must be a JSON object."] };
  }

  if (!body.ticket_id || typeof body.ticket_id !== "string" || !body.ticket_id.trim()) {
    errors.push("'ticket_id' is required and must be a non-empty string.");
  }

  if (!body.message || typeof body.message !== "string" || !body.message.trim()) {
    errors.push("'message' is required and must be a non-empty string.");
  }

  if (body.channel !== undefined && !VALID_CHANNELS.includes(body.channel)) {
    errors.push(`'channel' must be one of: ${VALID_CHANNELS.join(", ")}.`);
  }

  if (body.locale !== undefined && !VALID_LOCALES.includes(body.locale)) {
    errors.push(`'locale' must be one of: ${VALID_LOCALES.join(", ")}.`);
  }

  return errors.length > 0 ? { valid: false, errors } : { valid: true };
}

module.exports = { validateTicket };
