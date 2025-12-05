const { Router } = require("express");
const {
  approveJob,
  assignJob,
  claimJob,
  createJob,
  getJob,
  getJobAudit,
  listJobs,
  submitTestResult,
} = require("../controllers/jobs.controller");
const { authMiddleware, roleMiddleware } = require("../middleware/auth.middleware");

const router = Router();

router.get("/", authMiddleware, listJobs);
router.get("/:id", authMiddleware, getJob);
router.post("/", authMiddleware, roleMiddleware("MSME"), createJob);
router.put("/:id/assign", authMiddleware, roleMiddleware("ADMIN"), assignJob);
router.put("/:id/claim", authMiddleware, roleMiddleware("AGENCY"), claimJob);
router.put("/:id/approve", authMiddleware, roleMiddleware("ADMIN"), approveJob);
router.post(
  "/:jobId/test-results",
  authMiddleware,
  roleMiddleware("AGENCY"),
  submitTestResult,
);
router.get("/:jobId/audit", authMiddleware, getJobAudit);

module.exports = router;

