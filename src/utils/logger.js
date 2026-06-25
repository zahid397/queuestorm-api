"use strict";

/**
 * logger.js
 * Lightweight structured logger. Zero dependencies.
 */

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const COLORS = {
  debug: "\x1b[90m",
  info:  "\x1b[36m",
  warn:  "\x1b[33m",
  error: "\x1b[31m",
  reset: "\x1b[0m",
};

const MIN_LEVEL = LEVELS[process.env.LOG_LEVEL || "info"];

function log(level, message, meta) {
  if (LEVELS[level] < MIN_LEVEL) return;

  const ts    = new Date().toISOString();
  const color = COLORS[level] || "";
  const reset = COLORS.reset;
  const tag   = level.toUpperCase().padEnd(5);
  const extra = meta ? "  " + JSON.stringify(meta) : "";
  const line  = `${color}[${ts}] ${tag}${reset}  ${message}${extra}`;

  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

module.exports = {
  debug: (msg, meta) => log("debug", msg, meta),
  info:  (msg, meta) => log("info",  msg, meta),
  warn:  (msg, meta) => log("warn",  msg, meta),
  error: (msg, meta) => log("error", msg, meta),
};
