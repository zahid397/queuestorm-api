
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
  app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.use(express.json({ limit: "512kb" }));
  app.use(express.urlencoded({ extended: false, limit: "512kb" }));
  app.use((_req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (_req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });
  app.use(requestLogger);
  app.use(healthRoutes);
  app.use(ticketRoutes);
  app.use(notFoundHandler);
  app.use(globalErrorHandler);
  return app;
}

// ONLY named export — NO module.exports = app (that caused the crash)
module.exports = { createApp };
