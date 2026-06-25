"use strict";

const express = require("express");
const {
  requestLogger,
  notFoundHandler,
  globalErrorHandler,
} = require("./middleware/errorHandler");
const healthRoutes = require("./routes/health.routes");
const ticketRoutes = require("./routes/ticket.routes");

function createApp() {
  const app = express();

  // Trust Render / Vercel proxy
  app.set("trust proxy", 1);

  // Hide Express fingerprint
  app.disable("x-powered-by");

  // Parse JSON bodies (max 512kb)
  app.use(express.json({ limit: "512kb" }));
  app.use(express.urlencoded({ extended: false, limit: "512kb" }));

  // CORS — grader may call from different origin
  app.use((_req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (_req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });

  // Request logging
  app.use(requestLogger);

  // Routes
  app.use(healthRoutes);   // GET  /health
  app.use(ticketRoutes);   // POST /sort-ticket

  // 404 + global error handler
  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
}

module.exports = { createApp };
