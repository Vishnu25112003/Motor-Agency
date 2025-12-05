const { Router } = require("express");
const {
  createAgency,
  getAgencyJobs,
  getAgencyStats,
  getAgencySubmissions,
  listAgencies,
} = require("../controllers/agencies.controller");
const { authMiddleware, roleMiddleware } = require("../middleware/auth.middleware");

const agenciesRouter = Router();
agenciesRouter.get("/", authMiddleware, listAgencies);
agenciesRouter.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN"),
  createAgency,
);

const agencyRouter = Router();
agencyRouter.get(
  "/stats",
  authMiddleware,
  roleMiddleware("AGENCY"),
  getAgencyStats,
);
agencyRouter.get(
  "/jobs",
  authMiddleware,
  roleMiddleware("AGENCY"),
  getAgencyJobs,
);
agencyRouter.get(
  "/submissions",
  authMiddleware,
  roleMiddleware("AGENCY"),
  getAgencySubmissions,
);

module.exports = { agenciesRouter, agencyRouter };

