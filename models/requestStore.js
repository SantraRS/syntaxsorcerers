/**
 * models/requestStore.js
 * -----------------------
 * In-memory store for IAM workflow approval requests.
 * Acts as the approval queue for the Joiner–Mover–Leaver lifecycle.
 *
 * Request shape:
 * {
 *   id: string,            // UUID — unique request identifier
 *   type: string,          // "JOINER" | "MOVER" | "LEAVER"
 *   user: string,          // Employee name
 *   role: string,          // Requested role (null for LEAVER)
 *   previousRole: string,  // Previous role (only for MOVER)
 *   status: string,        // "pending" | "approved" | "rejected"
 *   createdAt: string,     // ISO timestamp
 *   updatedAt: string,     // ISO timestamp
 * }
 */

const requests = [];

/**
 * Add a new approval request.
 * @param {Object} requestObj - Request conforming to the shape above
 * @returns {Object} The created request
 */
function addRequest(requestObj) {
  requests.push(requestObj);
  return requestObj;
}

/**
 * Get all requests (or optionally filter by status).
 * @param {string} [status] - Optional filter: "pending" | "approved" | "rejected"
 * @returns {Object[]} Filtered or full array of requests
 */
function getRequests(status) {
  if (status) {
    return requests.filter((r) => r.status === status);
  }
  return requests;
}

/**
 * Find a request by its unique ID.
 * @param {string} id - Request UUID
 * @returns {Object|undefined} Matching request or undefined
 */
function findRequest(id) {
  return requests.find((r) => r.id === id);
}

/**
 * Update fields on an existing request in-place.
 * @param {string} id - Request UUID
 * @param {Object} updates - Fields to merge into the request
 * @returns {Object|null} Updated request or null if not found
 */
function updateRequest(id, updates) {
  const req = findRequest(id);
  if (!req) return null;
  Object.assign(req, updates, { updatedAt: new Date().toISOString() });
  return req;
}

module.exports = { addRequest, getRequests, findRequest, updateRequest };
