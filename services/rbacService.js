/**
 * services/rbacService.js
 * ------------------------
 * Role-Based Access Control (RBAC) engine.
 * Defines which systems each role can access, and whether
 * a role requires manual approval before provisioning.
 *
 * This is a simulated RBAC model — no external directory is used.
 */

// ── Role → Systems Mapping ─────────────────────────────────────────────────
// Add new roles here to extend the system.
const ROLE_ACCESS_MAP = {
  Developer: ["GitHub", "Jira"],
  HR:        ["HRMS"],
  Manager:   ["Dashboard", "Reports"],
  Admin:     ["All Systems"],
};

// Roles that require a human approver before access is granted.
// All other roles are auto-approved.
const ROLES_REQUIRING_APPROVAL = ["Admin", "Manager"];

/**
 * Return the list of systems a given role has access to.
 * @param {string} role - Role name (e.g., "Developer")
 * @returns {string[]} Array of system names; empty array if role is unknown
 */
function getAccessList(role) {
  return ROLE_ACCESS_MAP[role] || [];
}

/**
 * Return all defined roles and their access lists.
 * Useful for RBAC admin dashboards.
 * @returns {Object} The full role-access map
 */
function getAllRoles() {
  return ROLE_ACCESS_MAP;
}

/**
 * Determine whether a role requires manual approval before provisioning.
 * @param {string} role - Role name
 * @returns {boolean} true if approval is required
 */
function requiresApproval(role) {
  return ROLES_REQUIRING_APPROVAL.includes(role);
}

/**
 * Check if a given role is a known/supported role.
 * @param {string} role - Role name
 * @returns {boolean}
 */
function isValidRole(role) {
  return Object.keys(ROLE_ACCESS_MAP).includes(role);
}

module.exports = { getAccessList, getAllRoles, requiresApproval, isValidRole };
