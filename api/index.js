"use strict";

/**
 * api/index.js
 * Vercel Serverless Entry Point.
 *
 * Vercel CANNOT use app.listen().
 * It imports the Express app directly.
 * Any file inside /api/ is treated as a serverless function by Vercel.
 */

const { createApp } = require("../src/app");

const app = createApp();

module.exports = app;
