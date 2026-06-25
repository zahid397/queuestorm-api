
"use strict";

/**
 * server.js
 * Entry point for Render and Railway.
 * Uses app.listen() — do NOT use this for Vercel.
 * Vercel uses api/index.js instead.
 */

const { createApp } = require("./src/app");
const logger = require("./src/utils/logger");

const PORT = parseInt(process.env.PORT || "3000", 10);

const app = createApp();

const server = app.listen(PORT, "0.0.0.0", () => {
  logger.info("QueueStorm API started", {
    port: PORT,
    env: process.env.NODE_ENV || "production",
  });
});

// Graceful shutdown
function shutdown(signal) {
  logger.info(signal + " received — shutting down");
  server.close(() => {
    logger.info("Server closed.");
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled rejection", { reason: String(reason) });
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception", { message: err.message });
  process.exit(1);
});

module.exports = app;
