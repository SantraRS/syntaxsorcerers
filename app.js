/**
 * app.js
 * -------
 * Simulated IAM Automation Platform — Express.js Entry Point
 *
 * Bootstraps the server, wires all middleware and route modules,
 * and starts listening on the configured port.
 *
 * Run:
 *   node app.js          (production)
 *   npm run dev          (development, hot-reload via nodemon)
 */

const express      = require("express");
const path         = require("path");
const logger       = require("./utils/logger");

// ── Route modules ──────────────────────────────────────────────────────────
const authRoutes     = require("./routes/authRoutes");
const chatRoutes     = require("./routes/chatRoutes");
const approvalRoutes = require("./routes/approvalRoutes");
const userRoutes     = require("./routes/userRoutes");
const logRoutes      = require("./routes/logRoutes");

// ── Controllers (for granular route mounting) ──────────────────────────────
const { approve, reject } = require("./controllers/approvalController");

// ──────────────────────────────────────────────────────────────────────────
// App configuration
// ──────────────────────────────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 3000;

// ── CORS — allow all origins (needed for local dev & file:// frontend) ───────
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin",  "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// Parse incoming JSON request bodies
app.use(express.json());

// Parse URL-encoded form data (for completeness)
app.use(express.urlencoded({ extended: true }));

// Serve the frontend (index.html) at http://localhost:3000
app.use(express.static(path.join(__dirname)));

// Request logger middleware — logs every incoming HTTP request
app.use((req, _res, next) => {
  logger.info(`→ ${req.method} ${req.originalUrl}`);
  next();
});

// ── API Routes ─────────────────────────────────────────────────────────────

// POST /auth/login — Simulated credential validation
app.use("/auth", authRoutes);

// POST /chat — Natural language message intake
app.use("/chat", chatRoutes);

// GET /requests — Approval queue listing (status filter via ?status=)
app.use("/requests", approvalRoutes);

// POST /approve/:id and POST /reject/:id — explicit root-level mounts
// (avoids conflicts with static file serving and the health-check GET /)
app.post("/approve/:id", approve);
app.post("/reject/:id",  reject);

// GET /users — Employee directory
app.use("/users", userRoutes);

// GET /logs — Audit trail
app.use("/logs", logRoutes);

// ── Reset / Seed endpoint ─────────────────────────────────────────────────
// POST /reset — clears all in-memory data and re-seeds demo records
app.post("/reset", (_req, res) => {
  require("./seed").reset();
  logger.info("Demo data reset and re-seeded.");
  res.json({ success: true, message: "Demo data has been reset and re-seeded." });
});

// ── Health Check ──────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    service:     "Simulated IAM Automation Platform",
    version:     "1.0.0",
    environment: "SIMULATED — No real IAM systems are connected",
    status:      "running",
    endpoints: {
      chat:     "POST /chat",
      requests: "GET  /requests?status=pending|approved|rejected",
      approve:  "POST /approve/:id",
      reject:   "POST /reject/:id",
      users:    "GET  /users",
      logs:     "GET  /logs",
      reset:    "POST /reset",
      health:   "GET  /health",
    },
  });
});

// ── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error:   `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ── Global Error Handler ──────────────────────────────────────────────────
// Catches any unhandled errors thrown from route handlers
app.use((err, req, res, _next) => {
  logger.error(`Unhandled error on ${req.method} ${req.originalUrl}: ${err.message}`);
  res.status(500).json({
    success: false,
    error:   "An unexpected server error occurred.",
    detail:  err.message,
  });
});

// ── Start Server ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
  // Seed demo data on startup so dashboard opens populated
  require("./seed").reset();

  console.log("");
  console.log("╔═══════════════════════════════════════════════════════╗");
  console.log("║       Simulated IAM Automation Platform               ║");
  console.log("║       ⚠  SIMULATED ENVIRONMENT — No real IAM         ║");
  console.log(`║       Server running at http://localhost:${PORT}         ║`);
  console.log("╠═══════════════════════════════════════════════════════╣");
  console.log("║  POST /chat              — Submit NL message          ║");
  console.log("║  GET  /requests          — View approval queue        ║");
  console.log("║  POST /approve/:id       — Approve a request          ║");
  console.log("║  POST /reject/:id        — Reject a request           ║");
  console.log("║  GET  /users             — List all employees         ║");
  console.log("║  GET  /logs              — View audit logs            ║");
  console.log("║  POST /reset             — Reset & re-seed demo data  ║");
  console.log("╚═══════════════════════════════════════════════════════╝");
  console.log("");
});

module.exports = app;
