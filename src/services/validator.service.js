/**
 * validator.service.js
 * Validates the incoming /sort-ticket request body.
 * Returns { valid: true } or { valid: false, errors: [...] }
 */

"use strict";

const VALID_CHANNELS = ["app", "sms", "call_center", "merchant_portal"];
const VALID_LOCALES = ["bn", "en", "mixed"];

function validateTicket(body) {
  const errors = [];

  if (!body || typeof body !== "object") {
    return { valid: false, errors: ["Request body must be a JSON object."] };
  }

  // ticket_id — required string
  if (!body.ticket_id || typeof body.ticket_id !== "string" || !body.ticket_id.trim()) {
    errors.push("'ticket_id' is required and must be a non-empty string.");
  }

  // message — required string
  if (!body.message || typeof body.message !== "string" || !body.message.trim()) {
    errors.push("'message' is required and must be a non-empty string.");
  }

  // channel — optional but must be a known value if provided
  if (body.channel !== undefined && !VALID_CHANNELS.includes(body.channel)) {
    errors.push(
      `'channel' must be one of: ${VALID_CHANNELS.join(", ")}. Got: "${body.channel}"`
    );
  }

  // locale — optional but must be known if provided
  if (body.locale !== undefined && !VALID_LOCALES.includes(body.locale)) {
    errors.push(
      `'locale' must be one of: ${VALID_LOCALES.join(", ")}. Got: "${body.locale}"`
    );
  }

  return errors.length > 0
    ? { valid: false, errors }
    : { valid: true };
}

module.exports = { validateTicket };
