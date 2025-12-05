const { storage } = require("../storage");
const { hashPassword } = require("../auth");

async function listAgencies(req, res) {
  const agencies = await storage.getAllTestingAgencies();
  return res.json(agencies);
}

async function createAgency(req, res) {
  try {
    const { password, ...rest } = req.body;
    const passwordHash = await hashPassword(password);

    const data = {
      ...rest,
      passwordHash,
      addedById: req.user.id,
    };

    const agency = await storage.createTestingAgency(data);
    return res.status(201).json(agency);
  } catch (error) {
    if (error?.code === 11000) {
      return res
        .status(400)
        .json({ message: "Email or Approval ID already exists" });
    }
    throw error;
  }
}

async function getAgencyStats(req, res) {
  const stats = await storage.getAgencyStats(req.user.id);
  return res.json(stats);
}

async function getAgencyJobs(req, res) {
  const [assignedJobs, availableJobs] = await Promise.all([
    storage.getJobsByAgency(req.user.id),
    storage.getUnassignedJobs()
  ]);
  
  return res.json({
    assigned: assignedJobs,
    available: availableJobs
  });
}

async function getAgencySubmissions(req, res) {
  console.log('Getting submissions for agency:', req.user.id);
  const submissions = await storage.getTestResultsByAgency(req.user.id);
  console.log('Found submissions:', submissions.length);
  return res.json(submissions);
}

module.exports = {
  listAgencies,
  createAgency,
  getAgencyStats,
  getAgencyJobs,
  getAgencySubmissions
};

