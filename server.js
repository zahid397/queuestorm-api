"use strict";

/**
 * server.js — Entry point
 *
 * Render start command : node server.js
 * Local dev            : node --watch server.js
 *                        OR: npm run dev
 */

const { createApp } = require("./src/app");
const logger = require("./src/utils/logger");

const PORT = parseInt(process.env.PORT || "3000", 10);

const app = createApp();

const server = app.listen(PORT, "0.0.0.0", () => {
  logger.info(`QueueStorm API started`, {
    port: PORT,
    env: process.env.NODE_ENV || "production",
    endpoints: ["GET /health", "POST /sort-ticket"],
  });
});

// ── Graceful shutdown ─────────────────────────────────────────────
function shutdown(signal) {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(() => {
    logger.info("HTTP server closed.");
    process.exit(0);
  });
  // Force exit after 10s if connections hang
  setTimeout(() => {
    logger.warn("Force exit after 10s timeout");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));

// ── Unhandled rejection guard ─────────────────────────────────────
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Promise rejection", { reason: String(reason) });
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception — exiting", { message: err.message });
  process.exit(1);
});

module.exports = app; // exported for testing
