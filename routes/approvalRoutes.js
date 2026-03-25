/**
 * routes/approvalRoutes.js
 * -------------------------
 * Mounts the GET /requests endpoint.
 * NOTE: POST /approve/:id and POST /reject/:id are mounted directly
 * in app.js to avoid routing conflicts with the static file server.
 */

const express              = require("express");
const { listRequests }     = require("../controllers/approvalController");

const router = express.Router();

// GET /requests?status=pending|approved|rejected — list all requests
router.get("/", listRequests);

module.exports = router;
