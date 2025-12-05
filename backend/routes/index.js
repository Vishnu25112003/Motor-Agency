const authRoutes = require("./auth.routes");
const filesRoutes = require("./files.routes");
const productsRoutes = require("./products.routes");
const { msmeRouter, msmesRouter } = require("./msmes.routes");
const { agencyRouter, agenciesRouter } = require("./agencies.routes");
const jobsRoutes = require("./jobs.routes");
const analyticsRoutes = require("./analytics.routes");

function registerRoutes(app) {
  app.use("/api/auth", authRoutes);
  app.use("/api/files", filesRoutes);
  app.use("/api/products", productsRoutes);
  app.use("/api/msmes", msmesRouter);
  app.use("/api/msme", msmeRouter);
  app.use("/api/agencies", agenciesRouter);
  app.use("/api/agency", agencyRouter);
  app.use("/api/jobs", jobsRoutes);
  app.use("/api/admin", analyticsRoutes);
}

module.exports = { registerRoutes };

