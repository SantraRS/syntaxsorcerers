/**
 * controllers/userController.js
 * ------------------------------
 * Handles GET /users — returns all employee records from the in-memory store.
 */

const { getUsers } = require("../models/userStore");

/**
 * GET /users
 * Returns all users in the system (active and disabled).
 */
async function listUsers(req, res) {
  try {
    const users = getUsers();

    return res.status(200).json({
      success: true,
      count:   users.length,
      users,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: "Internal server error.", detail: err.message });
  }
}

module.exports = { listUsers };
