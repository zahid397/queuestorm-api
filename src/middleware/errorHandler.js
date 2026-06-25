"use strict";

const logger = require("../utils/logger");

/**
 * requestLogger
 * Logs every incoming request: method, path, status, response time.
 */
function requestLogger(req, res, next) {
  const startMs = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - startMs;
    const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
    logger[level](`${req.method} ${req.path}`, {
      status: res.statusCode,
      ms,
      ip: req.ip,
    });
  });
  next();
}

/**
 * notFoundHandler
 * Catches any route that wasn't matched.
 */
function notFoundHandler(req, res) {
  logger.warn("Route not found", { method: req.method, path: req.path });
  return res.status(404).json({
    error: "Not found",
    message: `${req.method} ${req.path} is not a valid endpoint.`,
    available_endpoints: ["GET /health", "POST /sort-ticket"],
  });
}

/**
 * globalErrorHandler
 * Last-resort error handler. Ensures the service never crashes or hangs.
 */
// eslint-disable-next-line no-unused-vars
function globalErrorHandler(err, req, res, _next) {
  logger.error("Unhandled error", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    method: req.method,
    path: req.path,
  });

  // Never expose internal error details in production
  return res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "An unexpected error occurred. Please try again.",
  });
}

module.exports = { requestLogger, notFoundHandler, globalErrorHandler };
