# GUARDIEN.AI — Simulated IAM Automation Platform

GUARDIEN.AI is a powerful, simulated Identity and Access Management (IAM) automation platform that leverages a Natural Language chatbot to perform lifecycle operations (Joiner, Mover, Leaver). It features a sleek glassmorphism dashboard, real-time approval queues, comprehensive audit logging, and strict Role-Based Access Control (RBAC).

> **Note:** This project runs in a *simulated environment*. All user data, credentials, and approval paths are kept in-memory for immediate demonstration. No real database or identity provider is required.

## 🌟 Key Features

- **Natural Language Command Engine**: Request access, onboard new talent, or query logs using plain English (e.g., *"Onboard Sarah as Developer"*, *"Approve all pending"*, or *"Show critical logs"*).
- **Automated Workflow Engine**: Routes conversational intent into actionable API requests. Pending items queue up automatically for managerial review.
- **Strict Role-Based Access Control (RBAC)**: Enforces end-to-end record visibility. Managers strictly filter out offboarding logs, while HR delegates strictly to active requests. Verified both via UI components and robust backend middleware.
- **Audit Trails & Log Management**: Comprehensive tracking of every action in the system, complete with severity categorization for critical IAM events.
- **Role-Tailored Dashboards**: A dynamic SPA interface that adjusts logic, navigation tabs, and system prompts depending on your authorized credentials.
- **Vibrant UI**: Built natively utilizing modern CSS glassmorphism, responsive grid layouts, custom gradient accents, and professional FontAwesome 6 iconography.

## 🔑 Demo Setup
The application comes pre-populated with in-memory accounts representing the three distinct system roles.

| Role | Username | Password | Key Responsibilities & Capabilities |
|---|---|---|---|
| **HR** | `hr_user` | `hr123` | **Lifecycle Operations:** Uses the chat interface to submit Joiner, Mover, and Leaver (Offboarding) requests. Restricted from approving tickets. |
| **Manager** | `manager` | `mgr123` | **Authorization:** Accesses the Approvals panel. Can review, approve, and reject tickets individually or in bulk via chat. Excluded from viewing Leaver operations. |
| **IT Admin** | `it_admin` | `admin123` | **Reporting & Auditing:** Full access to the Active Users directory and comprehensive Audit Logs panel. Can query systems for advanced filtering configurations. |

## 🛠️ Tech Stack
- **Backend:** Node.js, Express.js (Controller, Service, Routing architecture)
- **Frontend:** HTML5, CSS3, Vanilla JS (ES6+), FontAwesome 6
- **Storage:** In-Memory Application Store (`dataStore.js` and `seed.js`)

## 🚀 Getting Started

1. **Install dependencies:**
   Make sure Node.js is installed, then run:
   ```bash
   npm install
   ```
2. **Start the server:**
   ```bash
   npm run dev
   # Alternatively: node app.js
   ```
3. **Open the platform:**
   Navigate your browser to `http://localhost:3000`. Select your desired role, log in with the demo credentials populated on-screen, and use the NLP bot to test the engine!

## 📂 Project Architecture

```
.
├── app.js                          # Main Express server and root application configuration
├── index.html                      # Primary Client-side View (Frontend JS, CSS, HTML SPA)
├── seed.js                         # Initialization script for populating the demo data store
├── controllers/                    # Express route controllers processing inbound HTTP requests
│   ├── approvalController.js       # List requests & handle approve/reject actions
│   ├── authController.js           # Simulated endpoint for credential validation
│   ├── chatController.js           # NLP intent mapping via natural language commands
│   ├── logController.js            # Returns audit logs arrays
│   └── userController.js           # Returns global user directory
├── models/                         # State/Memory storage logic
│   ├── authStore.js                # Hardcoded demo account credentials
│   ├── dataStore.js                # Core global arrays holding users, requests, and logs
│   └── userStore.js                # Utilities for fetching/creating IAM Account records
├── routes/                         # Express routers organizing endpoints per feature
└── services/                       # Centralized business logic functions
    ├── approvalService.js          # Create, list, approve, or reject ticket records
    ├── auditService.js             # Formats and appends chronological events to logs
    ├── workflowService.js          # Final application of execution rules if requests are approved
    └── intentParser.js             # Regex mapping logic converting raw chat → intent
```
