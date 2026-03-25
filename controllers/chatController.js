/**
 * controllers/chatController.js
 * ------------------------------
 * Handles POST /chat — the primary natural-language entry point.
 *
 * Flow:
 *   1. Parse the incoming message to determine intent + entities
 *   2. Validate parsed data
 *   3. Create a workflow request (auto-approve or queue for review)
 *   4. If auto-approved, execute the workflow immediately
 *   5. Return a structured response to the caller
 */

const { parseIntent }    = require("../utils/intentParser");
const { createRequest }  = require("../services/approvalService");
const { executeWorkflow }= require("../services/workflowService");
const auditService       = require("../services/auditService");

/**
 * POST /chat
 * Body: { message: string }
 */
async function handleChat(req, res) {
  try {
    const { message } = req.body;

    // ── Input validation ───────────────────────────────────────────────────
    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({
        success: false,
        error:   "Request body must include a non-empty `message` string.",
      });
    }

    // ── Step 1: Parse intent from the message ─────────────────────────────
    const parsed = parseIntent(message.trim());

    if (!parsed.intent) {
      return res.status(422).json({
        success: false,
        error:   "Could not determine intent from message. Try: 'Onboard John as Developer', 'Change role of Alice to HR', or 'Offboard Bob'.",
        parsed,
      });
    }

    // ── Step 2: Additional validation per intent ──────────────────────────
    if (!parsed.userName) {
      return res.status(422).json({
        success: false,
        error:   "Could not extract employee name from message. Please include a capitalized name (e.g., 'John').",
        parsed,
      });
    }

    if ((parsed.intent === "JOINER" || parsed.intent === "MOVER") && !parsed.role) {
      return res.status(422).json({
        success: false,
        error:   `Role is required for ${parsed.intent} intent. Known roles: Developer, HR, Manager, Admin.`,
        parsed,
      });
    }

    // ── Step 3: Log the incoming chat request ─────────────────────────────
    auditService.log(parsed.userName, `Chat — ${parsed.intent}`, "Received", {
      details: `Raw: "${message}"`,
    });

    // ── Step 4: Create approval request ───────────────────────────────────
    const request = await createRequest(
      parsed.intent,
      parsed.userName,
      parsed.role || null
    );

    let workflowResult = null;

    // ── Step 5: If auto-approved, execute workflow immediately ────────────
    if (request.status === "approved") {
      workflowResult = await executeWorkflow(request);
    }

    // ── Step 6: Build user-friendly response ─────────────────────────────
    const isPending  = request.status === "pending";
    const userMsg    = isPending
      ? `Request for "${parsed.userName}" (${parsed.intent}) is pending approval. Use GET /requests to see all pending items, then POST /approve/${request.id}.`
      : (workflowResult?.message || `Workflow executed for "${parsed.userName}".`);

    return res.status(200).json({
      success:    true,
      parsed,
      request,
      workflow:   workflowResult,
      userMessage: userMsg,
    });

  } catch (err) {
    console.error("[ChatController] Unexpected error:", err);
    return res.status(500).json({ success: false, error: "Internal server error.", detail: err.message });
  }
}

module.exports = { handleChat };
