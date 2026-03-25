/**
 * services/auditService.js
 * -------------------------
 * Audit logging service — records all IAM actions for compliance tracking.
 *
 * Every significant action (chat requests, approval decisions, IAM operations)
 * is logged here with a structured, queryable entry.
 */

const { addLog, getLogs } = require("../models/auditStore");
const logger              = require("../utils/logger");

/**
 * Record an audit log entry.
 *
 * @param {string}  user     - Target employee name
 * @param {string}  action   - Human-readable action (e.g., "Onboard", "Role Change", "Disable Account")
 * @param {string}  status   - "Success" | "Failed" | "Pending" | "Approved" | "Rejected"
 * @param {Object}  [opts]   - Optional flags
 * @param {string}  [opts.details]  - Extra context (e.g., systems granted)
 * @param {boolean} [opts.critical] - true for LEAVER or admin-level changes
 * @returns {Object} The stored audit log entry
 */
function log(user, action, status, opts = {}) {
  const entry = addLog({
    user,
    action,
    status,
    details:  opts.details  || "",
    critical: opts.critical || false,
  });

  // Mirror to server console for real-time visibility
  const criticalTag = entry.critical ? " ⚠ CRITICAL" : "";
  logger.audit(
    `[${entry.id}]${criticalTag} User: "${user}" | Action: "${action}" | Status: "${status}"${
      entry.details ? ` | ${entry.details}` : ""
    }`
  );

  return entry;
}

/**
 * Retrieve all audit log entries (newest first).
 * @returns {Object[]}
 */
function getAuditLogs() {
  return getLogs();
}

module.exports = { log, getAuditLogs };
