const { storage } = require("../storage");

async function listJobs(req, res) {
  let jobs;
  switch (req.user.type) {
    case "ADMIN":
      jobs = await storage.getAllJobs();
      break;
    case "MSME":
      jobs = await storage.getJobsByMSME(req.user.id);
      break;
    case "AGENCY":
      jobs = await storage.getJobsByAgency(req.user.id);
      break;
    default:
      jobs = [];
  }
  return res.json(jobs);
}

async function getJob(req, res) {
  const { id } = req.params;
  if (!id || id === "undefined") {
    return res.status(400).json({ message: "Invalid job id" });
  }
  const job = await storage.getJobWithRelations(id);
  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  if (req.user.type === "MSME" && job.msmeId?.id?.toString() !== req.user.id) {
    console.log('MSME access check failed:');
    console.log('Job msmeId:', job.msmeId);
    console.log('Job msmeId.id:', job.msmeId?.id);
    console.log('Job msmeId.id?.toString():', job.msmeId?.id?.toString());
    console.log('Req.user.id:', req.user.id);
    console.log('Req.user.id type:', typeof req.user.id);
    console.log('Comparison result:', job.msmeId?.id?.toString() !== req.user.id);
    return res.status(403).json({ message: "Access denied" });
  }
  if (
    req.user.type === "AGENCY" &&
    job.assignedAgencyId?.id?.toString() !== req.user.id
  ) {
    console.log('Agency access check failed:');
    console.log('Job assignedAgencyId:', job.assignedAgencyId);
    console.log('Job assignedAgencyId.id:', job.assignedAgencyId?.id);
    console.log('Job assignedAgencyId.id?.toString():', job.assignedAgencyId?.id?.toString());
    console.log('Req.user.id:', req.user.id);
    console.log('Req.user.id type:', typeof req.user.id);
    console.log('Comparison result:', job.assignedAgencyId?.id?.toString() !== req.user.id);
    return res.status(403).json({ message: "Access denied" });
  }

  return res.json(job);
}

async function createJob(req, res) {
  const { productId, title, description, detailsFileId } = req.body;

  const product = await storage.getProduct(productId);
  if (!product) {
    return res.status(400).json({ message: "Product not found" });
  }

  const job = await storage.createJob({
    productId,
    msmeId: req.user.id,
    title,
    description,
    detailsFileId,
    currentStatus: "UNDER_TESTING",
  });

  await storage.createJobAudit({
    jobId: job.id,
    previousStatus: null,
    newStatus: "UNDER_TESTING",
    changedByType: "MSME",
    changedById: req.user.id,
    notes: "Job created",
  });

  const jobWithRelations = await storage.getJobWithRelations(job.id);
  return res.status(201).json(jobWithRelations);
}

async function assignJob(req, res) {
  const { id } = req.params;
  const { agencyId } = req.body;

  if (!id || id === "undefined") {
    return res.status(400).json({ message: "Invalid job id" });
  }

  const job = await storage.getJob(id);
  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  if (job.currentStatus !== "UNDER_TESTING") {
    return res
      .status(409)
      .json({ message: "Job cannot be assigned in current status" });
  }

  const agency = await storage.getTestingAgency(agencyId);
  if (!agency) {
    return res.status(400).json({ message: "Agency not found" });
  }

  await storage.assignJobAgency(id, agencyId);
  
  // Update status to ASSIGNED after agency assignment
  await storage.updateJobStatus(id, "ASSIGNED");

  await storage.createJobAudit({
    jobId: id,
    previousStatus: job.currentStatus,
    newStatus: "ASSIGNED",
    changedByType: "ADMIN",
    changedById: req.user.id,
    notes: `Assigned to agency: ${agency.name}`,
  });

  const updatedJob = await storage.getJobWithRelations(id);
  return res.json(updatedJob);
}

async function approveJob(req, res) {
  const { id } = req.params;
  const { approve, notes } = req.body;

  if (!id || id === "undefined") {
    return res.status(400).json({ message: "Invalid job id" });
  }

  const job = await storage.getJob(id);
  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  if (job.currentStatus !== "UNDER_REVIEW") {
    return res.status(409).json({ message: "Job is not under review" });
  }

  const newStatus = approve ? "APPROVED" : "REJECTED";
  await storage.updateJobStatus(id, newStatus);

  await storage.createJobAudit({
    jobId: id,
    previousStatus: job.currentStatus,
    newStatus,
    changedByType: "ADMIN",
    changedById: req.user.id,
    notes: notes || (approve ? "Job approved" : "Job rejected"),
  });

  const updatedJob = await storage.getJobWithRelations(id);
  return res.json(updatedJob);
}

async function submitTestResult(req, res) {
  const { jobId } = req.params;
  const { score, comments, resultFileId } = req.body;

  if (!jobId || jobId === "undefined") {
    return res.status(400).json({ message: "Invalid job id" });
  }

  const job = await storage.getJob(jobId);
  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  if (job.currentStatus !== "ASSIGNED") {
    return res.status(409).json({ message: "Job is not assigned for testing" });
  }

  if (job.assignedAgencyId?.toString() !== req.user.id) {
    return res.status(403).json({ message: "Not assigned to this job" });
  }

  const testResult = await storage.createTestResult({
    jobId,
    agencyId: req.user.id,
    score,
    comments,
    resultFileId,
    verified: false,
  });

  await storage.updateJobStatus(jobId, "UNDER_REVIEW");

  await storage.createJobAudit({
    jobId,
    previousStatus: job.currentStatus,
    newStatus: "UNDER_REVIEW",
    changedByType: "AGENCY",
    changedById: req.user.id,
    notes: "Test result submitted",
  });

  const updatedJob = await storage.getJobWithRelations(jobId);
  return res.status(201).json({ testResult, job: updatedJob });
}

async function getJobAudit(req, res) {
  const { jobId } = req.params;
  const audits = await storage.getJobAudits(jobId);
  return res.json(audits);
}

async function claimJob(req, res) {
  const { id } = req.params;
  const agencyId = req.user.id;

  if (!id || id === "undefined") {
    return res.status(400).json({ message: "Invalid job id" });
  }

  const job = await storage.getJob(id);
  if (!job) {
    return res.status(404).json({ message: "Job not found" });
  }

  if (job.currentStatus !== "UNDER_TESTING") {
    return res
      .status(409)
      .json({ message: "Job is not available for claiming" });
  }

  if (job.assignedAgencyId) {
    return res
      .status(409)
      .json({ message: "Job is already assigned" });
  }

  await storage.assignJobAgency(id, agencyId);
  
  // Update status to ASSIGNED after claiming
  await storage.updateJobStatus(id, "ASSIGNED");

  const agency = await storage.getTestingAgency(agencyId);

  await storage.createJobAudit({
    jobId: id,
    previousStatus: job.currentStatus,
    newStatus: "ASSIGNED",
    changedByType: "AGENCY",
    changedById: agencyId,
    notes: `Job claimed by agency: ${agency.name}`,
  });

  const updatedJob = await storage.getJobWithRelations(id);
  return res.json(updatedJob);
}

module.exports = {
  createJob,
  listJobs,
  getJob,
  assignJob,
  claimJob,
  approveJob,
  submitTestResult,
  getJobAudit,
};

