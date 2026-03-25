/**
 * services/iamService.js
 * -----------------------
 *
 * ████████████████████████████████████████████████████████████
 * ██           SIMULATED IAM ENVIRONMENT                    ██
 * ██  No real API calls are made. All responses are mocked. ██
 * ████████████████████████████████████████████████████████████
 *
 * In a production system, these functions would call real IAM
 * providers (e.g., Okta, Azure AD, AWS IAM).
 *
 * For this hackathon MVP, each function returns a mock JSON
 * response to demonstrate the integration contract.
 */

const logger = require("../utils/logger");

// Simulated delay (ms) to make it feel like a real API call
const SIMULATED_LATENCY_MS = 50;

/**
 * Pause execution to simulate network latency.
 */
function simulateLatency() {
  return new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));
}

/**
 * [SIMULATED] Create a new user account in the IAM system.
 *
 * @param {string} userName - Employee name
 * @param {string} role     - Assigned role
 * @returns {Object} Mock IAM response
 */
async function createUser(userName, role) {
  await simulateLatency();
  logger.info(`[IAM-SIM] createUser → User: "${userName}", Role: "${role}"`);

  return {
    success:     true,
    operation:   "CREATE_USER",
    environment: "SIMULATED",
    data: {
      userId:    `UID-${Date.now()}`,
      userName,
      role,
      status:    "active",
      createdAt: new Date().toISOString(),
    },
    message: `[SIMULATED] User "${userName}" created successfully with role "${role}".`,
  };
}

/**
 * [SIMULATED] Assign a list of systems to a user.
 *
 * @param {string}   userName   - Employee name
 * @param {string[]} accessList - Systems to provision (e.g., ["GitHub", "Jira"])
 * @returns {Object} Mock IAM response
 */
async function assignAccess(userName, accessList) {
  await simulateLatency();
  logger.info(`[IAM-SIM] assignAccess → User: "${userName}", Systems: [${accessList.join(", ")}]`);

  return {
    success:     true,
    operation:   "ASSIGN_ACCESS",
    environment: "SIMULATED",
    data: {
      userName,
      systemsGranted: accessList,
      grantedAt:      new Date().toISOString(),
    },
    message: `[SIMULATED] Access granted to "${userName}" for: ${accessList.join(", ")}.`,
  };
}

/**
 * [SIMULATED] Revoke specific or all access from a user.
 * Prevents privilege creep when a user changes roles (MOVER).
 *
 * @param {string}   userName   - Employee name
 * @param {string[]} accessList - Systems to revoke (pass all current systems)
 * @returns {Object} Mock IAM response
 */
async function revokeAccess(userName, accessList) {
  await simulateLatency();
  logger.info(`[IAM-SIM] revokeAccess → User: "${userName}", Systems: [${accessList.join(", ")}]`);

  return {
    success:     true,
    operation:   "REVOKE_ACCESS",
    environment: "SIMULATED",
    data: {
      userName,
      systemsRevoked: accessList,
      revokedAt:      new Date().toISOString(),
    },
    message: `[SIMULATED] Access revoked from "${userName}" for: ${accessList.join(", ")}.`,
  };
}

/**
 * [SIMULATED] Disable a user account in the IAM system.
 * Used during the LEAVER workflow. Marked as CRITICAL.
 *
 * @param {string} userName - Employee name to disable
 * @returns {Object} Mock IAM response
 */
async function disableUser(userName) {
  await simulateLatency();
  logger.warn(`[IAM-SIM] ⚠ CRITICAL — disableUser → User: "${userName}"`);

  return {
    success:     true,
    operation:   "DISABLE_USER",
    environment: "SIMULATED",
    critical:    true,
    data: {
      userName,
      status:     "disabled",
      disabledAt: new Date().toISOString(),
    },
    message: `[SIMULATED] CRITICAL: User "${userName}" has been disabled and all sessions terminated.`,
  };
}

module.exports = { createUser, assignAccess, revokeAccess, disableUser };
