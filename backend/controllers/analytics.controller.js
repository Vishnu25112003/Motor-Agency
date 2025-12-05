const { storage } = require("../storage");

async function getAdminStats(req, res) {
  const stats = await storage.getAdminStats();
  return res.json(stats);
}

async function getAdminAnalytics(req, res) {
  const analytics = await storage.getAdminAnalytics();
  return res.json(analytics);
}

module.exports = {
  getAdminStats,
  getAdminAnalytics
};

