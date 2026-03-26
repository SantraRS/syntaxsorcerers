/**
 * services/approvalService.js
 * ----------------------------
 * Approval engine for IAM workflow requests.
 * Creates requests with auto-approval for low-privilege roles,
 * and queues high-privilege roles for manual review.
 */

const { v4: uuidv4 }          = require("uuid");
const { addRequest, getRequests, findRequest, updateRequest } = require("../models/requestStore");
const { requiresApproval }    = require("./rbacService");
const logger                  = require("../utils/logger");

/**
 * Create a new workflow request.
 * Auto-approves if the role doesn't require explicit approval.
 *
 * @param {string} type          - "JOINER" | "MOVER" | "LEAVER"
 * @param {string} user          - Employee name
 * @param {string} role          - New role (null for LEAVER)
 * @param {string} [previousRole] - Previous role (only for MOVER)
 * @returns {Object} The created request object
 */
async function createRequest(type, user, role, previousRole = null) {
  // JOINER + MOVER → always pending, Manager must approve before provisioning
  // LEAVER → auto-approved, offboarding executes immediately (IT Admin sees result)
  const status = type === "LEAVER" ? "approved" : "pending";

  const request = addRequest({
    id:           uuidv4(),
    type,
    user,
    role:         role || null,
    previousRole: previousRole || null,
    status,
    createdAt:    new Date().toISOString(),
    updatedAt:    new Date().toISOString(),
  });

  logger.info(
    `Request created — ID: ${request.id} | Type: ${type} | User: ${user} | Role: ${role || "N/A"} | Status: ${status}`
  );

  return request;
}

/**
 * Approve a pending request by ID.
 * @param {string} id - Request UUID
 * @returns {{ success: boolean, request: Object|null, message: string }}
 */
async function approveRequest(id) {
  const request = findRequest(id);

  if (!request) {
    return { success: false, request: null, message: `Request ${id} not found.` };
  }
  if (request.status !== "pending") {
    return {
      success: false,
      request,
      message: `Request ${id} cannot be approved — current status: ${request.status}.`,
    };
  }

  const updated = updateRequest(id, { status: "approved" });
  logger.info(`Request approved — ID: ${id} | User: ${updated.user}`);

  return { success: true, request: updated, message: "Request approved successfully." };
}

/**
 * Reject a pending request by ID.
 * @param {string} id - Request UUID
 * @returns {{ success: boolean, request: Object|null, message: string }}
 */
async function rejectRequest(id) {
  const request = findRequest(id);

  if (!request) {
    return { success: false, request: null, message: `Request ${id} not found.` };
  }
  if (request.status !== "pending") {
    return {
      success: false,
      request,
      message: `Request ${id} cannot be rejected — current status: ${request.status}.`,
    };
  }

  const updated = updateRequest(id, { status: "rejected" });
  logger.info(`Request rejected — ID: ${id} | User: ${updated.user}`);

  return { success: true, request: updated, message: "Request rejected." };
}

/**
 * Retrieve all requests, optionally filtered by status.
 * @param {string} [status] - Optional status filter
 * @returns {Object[]}
 */
function getAllRequests(status) {
  return getRequests(status);
}

module.exports = { createRequest, approveRequest, rejectRequest, getAllRequests };
