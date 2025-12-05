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
  const submissions = await storage.getTestResultsByAgency(req.user.id);
  return res.json(submissions);
}

async function getAgency(req, res) {
  const { id } = req.params;
  const agency = await storage.getTestingAgency(id);
  if (!agency) {
    return res.status(404).json({ message: "Agency not found" });
  }
  return res.json(agency);
}

async function updateAgency(req, res) {
  try {
    const { id } = req.params;
    const { password, ...rest } = req.body;
    
    const updateData = { ...rest };
    
    if (password) {
      const passwordHash = await hashPassword(password);
      updateData.passwordHash = passwordHash;
    }

    const agency = await storage.updateTestingAgency(id, updateData);
    if (!agency) {
      return res.status(404).json({ message: "Agency not found" });
    }
    
    return res.json(agency);
  } catch (error) {
    if (error?.code === 11000) {
      return res
        .status(400)
        .json({ message: "Email or Approval ID already exists" });
    }
    throw error;
  }
}

async function deleteAgency(req, res) {
  try {
    const { id } = req.params;
    
    const agency = await storage.getTestingAgency(id);
    if (!agency) {
      return res.status(404).json({ message: "Agency not found" });
    }
    
    await storage.deleteTestingAgency(id);
    return res.json({ message: "Agency deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete agency" });
  }
}

module.exports = {
  listAgencies,
  createAgency,
  getAgency,
  updateAgency,
  deleteAgency,
  getAgencyStats,
  getAgencyJobs,
  getAgencySubmissions
};

