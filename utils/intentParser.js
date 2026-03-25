/**
 * utils/intentParser.js
 * ----------------------
 * Simulates Natural Language Understanding (NLU) for chat messages.
 * Detects the lifecycle intent (JOINER / MOVER / LEAVER) from a plain-text message
 * and extracts relevant entities: userName and role.
 *
 * NOTE: This is a rule-based simulation, not a true ML model.
 */

// Keywords that map to each intent
const JOINER_KEYWORDS = ["onboard", "join", "hire", "add", "create", "new employee"];
const MOVER_KEYWORDS  = ["change role", "move", "transfer", "promote", "update role", "switch role"];
const LEAVER_KEYWORDS = ["offboard", "remove", "terminate", "disable", "fire", "exit", "deactivate"];

// Known roles in the system (used for extraction)
const KNOWN_ROLES = ["Developer", "HR", "Manager", "Admin"];

/**
 * Parses a chat message and returns an intent object.
 *
 * @param {string} message - Raw user chat message
 * @returns {{ intent: string|null, userName: string|null, role: string|null, raw: string }}
 */
function parseIntent(message) {
  if (!message || typeof message !== "string") {
    return { intent: null, userName: null, role: null, raw: message };
  }

  const lowerMsg = message.toLowerCase().trim();

  // ── Determine Intent ──────────────────────────────────────────────────────
  let intent = null;

  if (LEAVER_KEYWORDS.some((kw) => lowerMsg.includes(kw))) {
    intent = "LEAVER";
  } else if (MOVER_KEYWORDS.some((kw) => lowerMsg.includes(kw))) {
    intent = "MOVER";
  } else if (JOINER_KEYWORDS.some((kw) => lowerMsg.includes(kw))) {
    intent = "JOINER";
  }

  // ── Extract Role ──────────────────────────────────────────────────────────
  // Case-insensitive match against known roles
  let role = null;
  for (const r of KNOWN_ROLES) {
    if (lowerMsg.includes(r.toLowerCase())) {
      role = r; // preserve original casing (e.g., "Developer")
      break;
    }
  }

  // ── Extract User Name ─────────────────────────────────────────────────────
  // Strategy: look for a capitalized word that is NOT a role keyword or intent keyword
  // Uses a simple regex to find proper nouns (Title Case words)
  let userName = null;

  // Remove known roles and common stopwords from message before name extraction
  const stopWords = [
    "onboard", "offboard", "hire", "fire", "add", "remove",
    "change", "role", "of", "to", "as", "the", "a", "an",
    "move", "transfer", "promote", "disable", "terminate",
    "join", "create", "update", "switch", "exit", "deactivate",
    ...KNOWN_ROLES.map(r => r.toLowerCase())
  ];

  // Tokenize and filter stopwords, then look for a Title Case token
  const tokens = message.split(/\s+/);
  for (const token of tokens) {
    const clean = token.replace(/[^a-zA-Z]/g, "");
    if (
      clean.length > 1 &&
      /^[A-Z][a-z]+$/.test(clean) && // Proper noun pattern
      !stopWords.includes(clean.toLowerCase())
    ) {
      userName = clean;
      break;
    }
  }

  return {
    intent,
    userName,
    role,
    raw: message,
  };
}

module.exports = { parseIntent };
