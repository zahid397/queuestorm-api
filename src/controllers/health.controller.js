"use strict";

/**
 * GET /health
 * Liveness check — must respond within 10 seconds (spec requirement).
 */
function healthCheck(req, res) {
  return res.status(200).json({
    status:    "ok",
    service:   "QueueStorm API",
    timestamp: new Date().toISOString(),
  });
}

module.exports = { healthCheck };
