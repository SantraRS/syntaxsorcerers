/**
 * services/workflowService.js
 * ----------------------------
 * Central Workflow Orchestrator — the "brain" of the IAM platform.
 *
 * Orchestrates the full Joiner–Mover–Leaver lifecycle:
 *   1. Receives an approved request
 *   2. Dispatches to the correct flow (JOINER / MOVER / LEAVER)
 *   3. Calls the IAM simulation layer
 *   4. Updates the user store
 *   5. Records audit logs
 *
 * This is the ONLY service that coordinates between iamService,
 * rbacService, userStore, and auditService.
 */

const iamService    = require("./iamService");
const rbacService   = require("./rbacService");
const auditService  = require("./auditService");
const userStore     = require("../models/userStore");
const logger        = require("../utils/logger");

// ──────────────────────────────────────────────────────────────────────────────
// JOINER Flow
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Executes the JOINER workflow for a new employee.
 *
 * Steps:
 *   1. Check if user already exists (prevent duplicate onboarding)
 *   2. Get RBAC access list for the role
 *   3. [IAM-SIM] Create user account
 *   4. [IAM-SIM] Assign access
 *   5. Update in-memory user store
 *   6. Log all actions in audit trail
 *
 * @param {string} userName - New employee name
 * @param {string} role     - Assigned role
 * @returns {Object} Workflow result summary
 */
async function runJoiner(userName, role) {
  logger.info(`Workflow JOINER started — User: "${userName}", Role: "${role}"`);

  // Guard: prevent duplicate users
  const existing = userStore.findUser(userName);
  if (existing && existing.status === "active") {
    const msg = `User "${userName}" already exists and is active.`;
    auditService.log(userName, "Onboard", "Failed", { details: msg });
    return { success: false, message: msg };
  }

  const accessList = rbacService.getAccessList(role);

  // [IAM SIMULATION] — Step 1: Create user
  const createResult  = await iamService.createUser(userName, role);

  // [IAM SIMULATION] — Step 2: Assign access
  const accessResult  = await iamService.assignAccess(userName, accessList);

  // Update in-memory user store
  userStore.addUser({
    name:      userName,
    role,
    access:    accessList,
    status:    "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Audit log
  auditService.log(userName, "Onboard", "Success", {
    details: `Role: ${role} | Systems granted: [${accessList.join(", ")}]`,
  });

  return {
    success:  true,
    message:  `User "${userName}" successfully onboarded as "${role}".`,
    iamSteps: [createResult, accessResult],
    user:     userStore.findUser(userName),
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// MOVER Flow
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Executes the MOVER workflow for a role change.
 *
 * Steps:
 *   1. Verify user exists and is active
 *   2. Determine old access to revoke (prevents privilege creep)
 *   3. [IAM-SIM] Revoke old access
 *   4. [IAM-SIM] Assign new access
 *   5. Update user store (new role, new access)
 *   6. Audit log both revoke and grant actions
 *
 * @param {string} userName - Employee name
 * @param {string} newRole  - New role to assign
 * @returns {Object} Workflow result summary
 */
async function runMover(userName, newRole) {
  logger.info(`Workflow MOVER started — User: "${userName}", New Role: "${newRole}"`);

  const user = userStore.findUser(userName);
  if (!user || user.status === "disabled") {
    const msg = `User "${userName}" not found or is disabled. Cannot change role.`;
    auditService.log(userName, "Role Change", "Failed", { details: msg });
    return { success: false, message: msg };
  }

  const oldRole       = user.role;
  const oldAccess     = user.access || rbacService.getAccessList(oldRole);
  const newAccessList = rbacService.getAccessList(newRole);

  // [IAM SIMULATION] — Step 1: Revoke old access (prevent privilege creep)
  const revokeResult = await iamService.revokeAccess(userName, oldAccess);
  auditService.log(userName, "Access Revoked", "Success", {
    details: `Old role: ${oldRole} | Revoked: [${oldAccess.join(", ")}]`,
  });

  // [IAM SIMULATION] — Step 2: Assign new access
  const assignResult = await iamService.assignAccess(userName, newAccessList);
  auditService.log(userName, "Role Change", "Success", {
    details: `${oldRole} → ${newRole} | New systems: [${newAccessList.join(", ")}]`,
  });

  // Update user store to reflect new role/access
  userStore.updateUser(userName, { role: newRole, access: newAccessList });

  return {
    success:  true,
    message:  `User "${userName}" moved from "${oldRole}" to "${newRole}". Privilege creep prevented.`,
    iamSteps: [revokeResult, assignResult],
    user:     userStore.findUser(userName),
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// LEAVER Flow
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Executes the LEAVER workflow for an employee departure.
 *
 * ⚠ CRITICAL ACTION — marked critical in audit logs for compliance.
 *
 * Steps:
 *   1. Verify user exists
 *   2. [IAM-SIM] Disable user account (terminates all sessions)
 *   3. [IAM-SIM] Revoke all access
 *   4. Mark user as disabled in store
 *   5. Audit log as CRITICAL
 *
 * @param {string} userName - Employee name to offboard
 * @returns {Object} Workflow result summary
 */
async function runLeaver(userName) {
  logger.warn(`Workflow LEAVER started — ⚠ User: "${userName}" — CRITICAL ACTION`);

  const user = userStore.findUser(userName);
  if (!user) {
    const msg = `User "${userName}" not found in system.`;
    auditService.log(userName, "Offboard", "Failed", { details: msg });
    return { success: false, message: msg };
  }

  if (user.status === "disabled") {
    const msg = `User "${userName}" is already disabled.`;
    auditService.log(userName, "Offboard", "Failed", { details: msg });
    return { success: false, message: msg };
  }

  const currentAccess = user.access || [];

  // [IAM SIMULATION] — Step 1: Disable user account
  const disableResult = await iamService.disableUser(userName);

  // [IAM SIMULATION] — Step 2: Revoke all access
  const revokeResult  = await iamService.revokeAccess(userName, currentAccess);

  // Update user store
  userStore.updateUser(userName, { status: "disabled", access: [] });

  // Audit log — marked CRITICAL
  auditService.log(userName, "Offboard", "Success", {
    details:  `Account disabled. All access revoked: [${currentAccess.join(", ") || "none"}]`,
    critical: true,
  });

  return {
    success:  true,
    message:  `⚠ CRITICAL: User "${userName}" has been offboarded. Account disabled and all access revoked.`,
    iamSteps: [disableResult, revokeResult],
    user:     userStore.findUser(userName),
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Workflow Dispatcher
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Dispatches an approved request to the correct workflow runner.
 *
 * @param {Object} request - Approved request from the requestStore
 * @returns {Object} Result from the specific workflow runner
 */
async function executeWorkflow(request) {
  const { type, user, role, previousRole } = request;

  logger.info(`Dispatching workflow — Type: ${type} | User: ${user}`);

  switch (type) {
    case "JOINER":
      return runJoiner(user, role);

    case "MOVER":
      // If previousRole is stored on the request, pass it; otherwise workflow auto-detects
      return runMover(user, role);

    case "LEAVER":
      return runLeaver(user);

    default:
      return { success: false, message: `Unknown workflow type: "${type}"` };
  }
}

module.exports = { executeWorkflow, runJoiner, runMover, runLeaver };
