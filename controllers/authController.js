/**
 * controllers/authController.js
 * ------------------------------
 * Handles authentication requests for the simulated IAM demo.
 */

const { findByCredentials } = require('../models/authStore');
const logger = require('../utils/logger');

/**
 * POST /auth/login
 * Body: { username: string, password: string }
 *
 * Returns:
 *   200 { success: true,  role: string, display: string }
 *   401 { success: false, error: string }
 */
function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: 'Username and password are required.',
    });
  }

  const user = findByCredentials(username, password);

  if (!user) {
    logger.warn(`Failed login attempt for username: "${username}"`);
    return res.status(401).json({
      success: false,
      error: 'Invalid username or password.',
    });
  }

  logger.info(`Successful login: ${user.username} → role: ${user.role}`);
  return res.json({
    success:  true,
    role:     user.role,
    display:  user.display,
    username: user.username,
  });
}

module.exports = { login };
