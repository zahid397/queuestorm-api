/**
 * logger.js
 * Lightweight structured logger. No external dependencies.
 * Format: [ISO timestamp] LEVEL  message  {meta}
 */

"use strict";

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const COLORS = {
  debug: "\x1b[90m",   // grey
  info:  "\x1b[36m",   // cyan
  warn:  "\x1b[33m",   // yellow
  error: "\x1b[31m",   // red
  reset: "\x1b[0m",
};

const MIN_LEVEL = LEVELS[process.env.LOG_LEVEL || "info"];

function log(level, message, meta) {
  if (LEVELS[level] < MIN_LEVEL) return;

  const ts = new Date().toISOString();
  const color = COLORS[level] || "";
  const reset = COLORS.reset;
  const levelTag = level.toUpperCase().padEnd(5);
  const metaStr = meta ? `  ${JSON.stringify(meta)}` : "";

  const line = `${color}[${ts}] ${levelTag}${reset}  ${message}${metaStr}`;

  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

const logger = {
  debug: (msg, meta) => log("debug", msg, meta),
  info:  (msg, meta) => log("info",  msg, meta),
  warn:  (msg, meta) => log("warn",  msg, meta),
  error: (msg, meta) => log("error", msg, meta),
};

module.exports = logger;
