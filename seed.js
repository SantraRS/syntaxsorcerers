/**
 * seed.js
 * --------
 * Demo data initializer for the IAM Automation Platform.
 * Populates the in-memory stores with realistic sample employees,
 * approval requests, and audit log entries so the dashboard opens
 * with meaningful data instead of empty tables.
 *
 * Called automatically on server start (and via POST /reset).
 */

const userStore    = require("./models/userStore");
const requestStore = require("./models/requestStore");
const auditStore   = require("./models/auditStore");
const { v4: uuidv4 } = require("uuid");

// ── Helper: subtract minutes from now ─────────────────────────────────────
function minsAgo(n) {
  return new Date(Date.now() - n * 60 * 1000).toISOString();
}

/**
 * Clears all in-memory stores and re-populates with demo data.
 * Safe to call multiple times — each call produces a fresh state.
 */
function reset() {
  // ── Clear existing data ────────────────────────────────────────────────
  const users    = userStore.getUsers();
  const requests = requestStore.getRequests();
  const logs     = auditStore._getLogsInternal();

  users.splice(0, users.length);
  requests.splice(0, requests.length);
  logs.splice(0, logs.length);
  auditStore._resetCounter(1);

  // ── Seed users ─────────────────────────────────────────────────────────
  const seedUsers = [
    { name: "Alice",  role: "Developer", access: ["GitHub", "Jira"],         status: "active",   createdAt: minsAgo(120), updatedAt: minsAgo(120) },
    { name: "Bob",    role: "HR",        access: ["HRMS"],                   status: "active",   createdAt: minsAgo(100), updatedAt: minsAgo(100) },
    { name: "Carol",  role: "Manager",   access: ["Dashboard", "Reports"],   status: "active",   createdAt: minsAgo(90),  updatedAt: minsAgo(90)  },
    { name: "Dave",   role: "Developer", access: ["GitHub", "Jira"],         status: "active",   createdAt: minsAgo(80),  updatedAt: minsAgo(80)  },
    { name: "Eve",    role: "Admin",     access: ["All Systems"],            status: "active",   createdAt: minsAgo(70),  updatedAt: minsAgo(70)  },
    { name: "Frank",  role: "Developer", access: [],                         status: "disabled", createdAt: minsAgo(200), updatedAt: minsAgo(30)  },
  ];
  seedUsers.forEach(u => userStore.addUser(u));

  // ── Seed approval requests ──────────────────────────────────────────────
  const seedRequests = [
    // Pending — awaiting manager approval
    { id: uuidv4(), type: "JOINER", user: "Grace",  role: "Manager",   previousRole: null,        status: "pending",  createdAt: minsAgo(25),  updatedAt: minsAgo(25)  },
    { id: uuidv4(), type: "JOINER", user: "Henry",  role: "Admin",     previousRole: null,        status: "pending",  createdAt: minsAgo(18),  updatedAt: minsAgo(18)  },
    { id: uuidv4(), type: "MOVER",  user: "Dave",   role: "Manager",   previousRole: "Developer", status: "pending",  createdAt: minsAgo(10),  updatedAt: minsAgo(10)  },
    // Historical — already processed
    { id: uuidv4(), type: "JOINER", user: "Alice",  role: "Developer", previousRole: null,        status: "approved", createdAt: minsAgo(120), updatedAt: minsAgo(118) },
    { id: uuidv4(), type: "JOINER", user: "Carol",  role: "Manager",   previousRole: null,        status: "approved", createdAt: minsAgo(90),  updatedAt: minsAgo(88)  },
    { id: uuidv4(), type: "LEAVER", user: "Frank",  role: null,        previousRole: null,        status: "approved", createdAt: minsAgo(32),  updatedAt: minsAgo(30)  },
    { id: uuidv4(), type: "JOINER", user: "Iris",   role: "Manager",   previousRole: null,        status: "rejected", createdAt: minsAgo(60),  updatedAt: minsAgo(58)  },
  ];
  seedRequests.forEach(r => requestStore.addRequest(r));

  // ── Seed audit logs ─────────────────────────────────────────────────────
  // Push directly into the internal array (with timestamps pre-set)
  const seedLogs = [
    { id: 1,  user: "System",  action: "Platform Started",   status: "Success",  details: "IAM demo environment initialized with seed data.",            critical: false, timestamp: minsAgo(121) },
    { id: 2,  user: "Alice",   action: "Onboard",            status: "Success",  details: "Role: Developer | Systems granted: [GitHub, Jira]",           critical: false, timestamp: minsAgo(118) },
    { id: 3,  user: "Bob",     action: "Onboard",            status: "Success",  details: "Role: HR | Systems granted: [HRMS]",                          critical: false, timestamp: minsAgo(100) },
    { id: 4,  user: "Carol",   action: "Onboard",            status: "Success",  details: "Role: Manager | Systems granted: [Dashboard, Reports]",        critical: false, timestamp: minsAgo(88)  },
    { id: 5,  user: "Dave",    action: "Onboard",            status: "Success",  details: "Role: Developer | Systems granted: [GitHub, Jira]",           critical: false, timestamp: minsAgo(80)  },
    { id: 6,  user: "Eve",     action: "Onboard",            status: "Success",  details: "Role: Admin | Systems granted: [All Systems]",                critical: false, timestamp: minsAgo(70)  },
    { id: 7,  user: "Iris",    action: "Chat — JOINER",      status: "Received", details: 'Raw: "Onboard Iris as Manager"',                             critical: false, timestamp: minsAgo(62)  },
    { id: 8,  user: "Iris",    action: "Request Rejected",   status: "Rejected", details: "Request Type: JOINER",                                       critical: false, timestamp: minsAgo(58)  },
    { id: 9,  user: "Frank",   action: "Chat — LEAVER",      status: "Received", details: 'Raw: "Offboard Frank"',                                      critical: false, timestamp: minsAgo(34)  },
    { id: 10, user: "Frank",   action: "Offboard",           status: "Success",  details: "Account disabled. All access revoked: [GitHub, Jira]",        critical: true,  timestamp: minsAgo(30)  },
    { id: 11, user: "Grace",   action: "Chat — JOINER",      status: "Received", details: 'Raw: "Onboard Grace as Manager"',                            critical: false, timestamp: minsAgo(25)  },
    { id: 12, user: "Henry",   action: "Chat — JOINER",      status: "Received", details: 'Raw: "Onboard Henry as Admin"',                              critical: false, timestamp: minsAgo(18)  },
    { id: 13, user: "Dave",    action: "Chat — MOVER",       status: "Received", details: 'Raw: "Change role of Dave to Manager"',                      critical: false, timestamp: minsAgo(10)  },
  ];
  logs.push(...seedLogs);
  auditStore._resetCounter(seedLogs.length + 1);
}

module.exports = { reset };
