/**
 * models/auditStore.js
 * ---------------------
 * In-memory store for immutable audit log entries.
 * Provides a tamper-evident trail of all IAM actions in the simulation.
 *
 * Audit log entry shape:
 * {
 *   id: number,            // Auto-incrementing integer ID for ordering
 *   user: string,          // Target employee name
 *   action: string,        // Human-readable action description
 *   status: string,        // "Success" | "Failed" | "Pending" | "Approved" | "Rejected" | "Received"
 *   details: string,       // Optional extra detail (e.g., systems granted)
 *   critical: boolean,     // true for LEAVER actions or admin changes
 *   timestamp: string,     // ISO timestamp
 * }
 */

const auditLogs = [];
let _idCounter = 1;

/**
 * Append a new audit log entry.
 * @param {Object} entry - Partial audit entry (id and timestamp auto-assigned)
 * @returns {Object} The completed log entry
 */
function addLog(entry) {
  const logEntry = {
    id: _idCounter++,
    timestamp: new Date().toISOString(),
    critical: false, // default; caller can override
    details: "",     // default; caller can override
    ...entry,
  };
  auditLogs.push(logEntry);
  return logEntry;
}

/**
 * Retrieve all audit log entries, newest first.
 * @returns {Object[]} All audit logs in reverse-chronological order
 */
function getLogs() {
  return [...auditLogs].reverse();
}

/**
 * Internal: get the raw mutable array reference (used by seed.js for reset).
 * Not intended for use in normal request handlers.
 * @returns {Object[]} The raw audit log array
 */
function _getLogsInternal() {
  return auditLogs;
}

/**
 * Internal: reset the ID counter (used by seed.js for reset).
 */
function _resetCounter(n = 1) {
  _idCounter = n;
}

module.exports = { addLog, getLogs, _getLogsInternal, _resetCounter };
