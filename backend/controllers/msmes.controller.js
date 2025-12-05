const { storage } = require("../storage");
const { hashPassword } = require("../auth");

async function listMSMEs(req, res) {
  const msmes = await storage.getAllMSMEs();
  return res.json(msmes);
}

async function createMSME(req, res) {
  try {
    const { password, ...rest } = req.body;
    const passwordHash = await hashPassword(password);

    const data = {
      ...rest,
      passwordHash,
      addedById: req.user.id,
      contactEmail: rest.contactEmail || null,
    };

    const msme = await storage.createMSME(data);
    return res.status(201).json(msme);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    throw error;
  }
}

async function getMSMEStats(req, res) {
  const stats = await storage.getMSMEStats(req.user.id);
  return res.json(stats);
}

async function getMSMEJobs(req, res) {
  const jobs = await storage.getJobsByMSME(req.user.id);
  return res.json(jobs);
}

module.exports = {
  listMSMEs,
  createMSME,
  getMSMEStats,
  getMSMEJobs
};

