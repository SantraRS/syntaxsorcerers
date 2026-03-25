/**
 * routes/logRoutes.js
 * --------------------
 * Mounts the /logs endpoint.
 */

const express        = require("express");
const { listLogs }   = require("../controllers/logController");

const router = express.Router();

// GET /logs — return all audit logs (newest first)
router.get("/", listLogs);

module.exports = router;
