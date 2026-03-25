/**
 * models/userStore.js
 * --------------------
 * In-memory store for employee/user records.
 * Each user represents an employee managed by the IAM platform.
 *
 * User shape:
 * {
 *   name: string,          // Employee name (used as unique identifier for simplicity)
 *   role: string,          // Current role (Developer | HR | Manager | Admin)
 *   access: string[],      // List of systems currently provisioned
 *   status: string,        // "active" | "disabled"
 *   createdAt: string,     // ISO timestamp
 *   updatedAt: string,     // ISO timestamp
 * }
 */

// Central in-memory array — persists for the lifetime of the server process
const users = [];

/**
 * Add a new user to the store.
 * @param {Object} userObj - User object conforming to the shape above
 * @returns {Object} The created user object
 */
function addUser(userObj) {
  users.push(userObj);
  return userObj;
}

/**
 * Retrieve all users.
 * @returns {Object[]} Array of all user records
 */
function getUsers() {
  return users;
}

/**
 * Find a single user by name (case-insensitive).
 * @param {string} name - Employee name to search
 * @returns {Object|undefined} Matching user or undefined
 */
function findUser(name) {
  return users.find(
    (u) => u.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Update fields on an existing user in-place.
 * @param {string} name - Employee name to find
 * @param {Object} updates - Fields to merge into the user record
 * @returns {Object|null} Updated user or null if not found
 */
function updateUser(name, updates) {
  const user = findUser(name);
  if (!user) return null;
  Object.assign(user, updates, { updatedAt: new Date().toISOString() });
  return user;
}

module.exports = { addUser, getUsers, findUser, updateUser };
