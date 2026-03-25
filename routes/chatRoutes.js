/**
 * routes/chatRoutes.js
 * ---------------------
 * Mounts the /chat endpoint.
 */

const express        = require("express");
const { handleChat } = require("../controllers/chatController");

const router = express.Router();

// POST /chat — NL message intake
router.post("/", handleChat);

module.exports = router;
