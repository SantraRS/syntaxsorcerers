/**
 * routes/userRoutes.js
 * ---------------------
 * Mounts the /users endpoint.
 */

const express          = require("express");
const { listUsers }    = require("../controllers/userController");

const router = express.Router();

// GET /users — return all employee records
router.get("/", listUsers);

module.exports = router;
