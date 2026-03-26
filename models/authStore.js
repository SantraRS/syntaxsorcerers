/**
 * models/authStore.js
 * --------------------
 * Simulated credential store for the IAM demo login.
 * One account per role — no real DB, consistent with the SIMULATED ENV.
 *
 * Credential shape:
 * {
 *   username: string,
 *   password: string,  // plain-text (demo only)
 *   role:     string,  // 'hr' | 'manager' | 'itadmin'
 *   display:  string,  // friendly label shown in the UI
 * }
 */

const DEMO_USERS = [
  { username: 'hr_user',  password: 'hr123',    role: 'hr',      display: '👤 HR' },
  { username: 'manager',  password: 'mgr123',   role: 'manager', display: '📋 Manager' },
  { username: 'it_admin', password: 'admin123', role: 'itadmin', display: '⚙️ IT Admin' },
];

/**
 * Look up a user by username + password.
 * @param {string} username
 * @param {string} password
 * @returns {Object|null} Matching user record or null
 */
function findByCredentials(username, password) {
  return DEMO_USERS.find(
    (u) => u.username === username.trim() && u.password === password
  ) || null;
}

/**
 * Return the demo user whose role matches the given role string.
 * Useful for pre-filling the username hint in the login form.
 * @param {string} role
 * @returns {Object|undefined}
 */
function findByRole(role) {
  return DEMO_USERS.find((u) => u.role === role);
}

module.exports = { findByCredentials, findByRole };
