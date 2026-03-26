/**
 * controllers/approvalController.js
 * -----------------------------------
 * Handles the approval queue endpoints:
 *   GET  /requests          — list all requests (optional ?status= filter)
 *   POST /approve/:id       — approve and execute workflow
 *   POST /reject/:id        — reject request
 */

const { getAllRequests, approveRequest, rejectRequest } = require("../services/approvalService");
const { executeWorkflow } = require("../services/workflowService");
const auditService        = require("../services/auditService");

// ──────────────────────────────────────────────────────────────────────────────

/**
 * GET /requests?status=pending|approved|rejected
 * Returns all requests, optionally filtered by status query param.
 */
async function listRequests(req, res) {
  try {
    const { status } = req.query;
    const validStatuses = ["pending", "approved", "rejected"];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error:   `Invalid status filter. Use one of: ${validStatuses.join(", ")}`,
      });
    }

    const role = req.headers["x-user-role"];
    let requests = getAllRequests(status || undefined);

    if (role === "hr") {
      requests = [];
    } else if (role === "manager") {
      requests = requests.filter(r => r.type !== "LEAVER");
    }

    return res.status(200).json({
      success: true,
      count:   requests.length,
      filter:  status || "all",
      requests,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Internal server error.", detail: err.message });
  }
}

// ──────────────────────────────────────────────────────────────────────────────

/**
 * POST /approve/:id
 * Approves a pending request and triggers the workflow.
 */
async function approve(req, res) {
  try {
    const { id } = req.params;

    // Attempt approval
    const result = await approveRequest(id);

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message, request: result.request });
    }

    // Log approval decision in audit trail
    auditService.log(result.request.user, "Request Approved", "Approved", {
      details:  `Request ID: ${id} | Type: ${result.request.type}`,
      critical: result.request.type === "LEAVER",
    });

    // Execute the workflow now that it's approved
    const workflowResult = await executeWorkflow(result.request);

    return res.status(200).json({
      success:        true,
      message:        result.message,
      request:        result.request,
      workflowResult,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Internal server error.", detail: err.message });
  }
}

// ──────────────────────────────────────────────────────────────────────────────

/**
 * POST /reject/:id
 * Rejects a pending request. No workflow is executed.
 */
async function reject(req, res) {
  try {
    const { id } = req.params;

    const result = await rejectRequest(id);

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message, request: result.request });
    }

    // Log rejection in audit trail
    auditService.log(result.request.user, "Request Rejected", "Rejected", {
      details: `Request ID: ${id} | Type: ${result.request.type}`,
    });

    return res.status(200).json({
      success: true,
      message: result.message,
      request: result.request,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Internal server error.", detail: err.message });
  }
}

module.exports = { listRequests, approve, reject };
