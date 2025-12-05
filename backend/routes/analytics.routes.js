const { Router } = require("express");
const {
  getAdminAnalytics,
  getAdminStats,
} = require("../controllers/analytics.controller");
const { authMiddleware, roleMiddleware } = require("../middleware/auth.middleware");

const router = Router();

router.get("/stats", authMiddleware, roleMiddleware("ADMIN"), getAdminStats);
router.get(
  "/analytics",
  authMiddleware,
  roleMiddleware("ADMIN"),
  getAdminAnalytics,
);

module.exports = router;

