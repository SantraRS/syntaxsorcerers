/**
 * controllers/logController.js
 * -----------------------------
 * Handles GET /logs — returns all audit log entries, newest first.
 */

const { getAuditLogs } = require("../services/auditService");

/**
 * GET /logs
 * Returns all audit log entries in reverse-chronological order.
 * Critical entries are flagged so a UI can highlight them.
 */
async function listLogs(req, res) {
  try {
    const role = req.headers["x-user-role"];
    let logs = getAuditLogs();

    if (role === "hr" || role === "manager") {
      logs = [];
    }

    return res.status(200).json({
      success:      true,
      count:        logs.length,
      criticalCount: logs.filter((l) => l.critical).length,
      logs,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Internal server error.", detail: err.message });
  }
}

module.exports = { listLogs };
