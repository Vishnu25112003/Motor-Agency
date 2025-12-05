const { Router } = require("express");
const {
  createMSME,
  getMSMEJobs,
  getMSMEStats,
  listMSMEs,
} = require("../controllers/msmes.controller");
const { authMiddleware, roleMiddleware } = require("../middleware/auth.middleware");

const msmesRouter = Router();
msmesRouter.get("/", authMiddleware, roleMiddleware("ADMIN"), listMSMEs);
msmesRouter.post("/", authMiddleware, roleMiddleware("ADMIN"), createMSME);

const msmeRouter = Router();
msmeRouter.get(
  "/stats",
  authMiddleware,
  roleMiddleware("MSME"),
  getMSMEStats,
);
msmeRouter.get("/jobs", authMiddleware, roleMiddleware("MSME"), getMSMEJobs);

module.exports = { msmesRouter, msmeRouter };

