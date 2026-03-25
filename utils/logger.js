/**
 * utils/logger.js
 * ---------------
 * A thin console logger with timestamp and level prefix.
 * Keeps server output readable during development.
 */

const LEVELS = {
  INFO:  "\x1b[36mINFO \x1b[0m",  // Cyan
  WARN:  "\x1b[33mWARN \x1b[0m",  // Yellow
  ERROR: "\x1b[31mERROR\x1b[0m",  // Red
  AUDIT: "\x1b[32mAUDIT\x1b[0m",  // Green
};

/**
 * Returns an ISO timestamp string for right now.
 */
function now() {
  return new Date().toISOString();
}

/**
 * Core log function.
 * @param {string} level - Log level key (INFO | WARN | ERROR | AUDIT)
 * @param {string} message - Log message
 */
function log(level, message) {
  const prefix = LEVELS[level] || LEVELS.INFO;
  console.log(`[${now()}] ${prefix} ${message}`);
}

module.exports = {
  info:  (msg) => log("INFO",  msg),
  warn:  (msg) => log("WARN",  msg),
  error: (msg) => log("ERROR", msg),
  audit: (msg) => log("AUDIT", msg),
};
