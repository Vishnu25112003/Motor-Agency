const {
  authMiddleware: baseAuthMiddleware,
  roleMiddleware: baseRoleMiddleware,
} = require("../auth");

// Auth middleware (JWT) and role guard, sourced from existing auth utilities.
const authMiddleware = baseAuthMiddleware;
const roleMiddleware = baseRoleMiddleware;

module.exports = { authMiddleware, roleMiddleware };

