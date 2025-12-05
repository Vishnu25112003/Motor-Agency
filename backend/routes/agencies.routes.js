const { Router } = require("express");
const {
  createAgency,
  getAgency,
  updateAgency,
  deleteAgency,
  getAgencyJobs,
  getAgencyStats,
  getAgencySubmissions,
  listAgencies,
} = require("../controllers/agencies.controller");
const { authMiddleware, roleMiddleware } = require("../middleware/auth.middleware");

const agenciesRouter = Router();
agenciesRouter.get("/", authMiddleware, listAgencies);
agenciesRouter.get("/:id", authMiddleware, getAgency);
agenciesRouter.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN"),
  createAgency,
);
agenciesRouter.put(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  updateAgency,
);
agenciesRouter.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  deleteAgency,
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

