"use strict";

/**
 * GET /health
 * Simple liveness check. Returns 200 within the required 10s window.
 */
function healthCheck(req, res) {
  return res.status(200).json({
    status: "ok",
    service: "QueueStorm API",
    timestamp: new Date().toISOString(),
  });
}

module.exports = { healthCheck };
