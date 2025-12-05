const {
  AssociationModel,
} = require("./models/association.schema");
const { AdminModel } = require("./models/admin.schema");
const { ProductModel } = require("./models/product.schema");
const { MSMEModel } = require("./models/msme.schema");
const {
  TestingAgencyModel,
} = require("./models/testingAgency.schema");
const { FileModel } = require("./models/file.schema");
const { JobModel } = require("./models/job.schema");
const {
  TestResultModel,
} = require("./models/testResult.schema");
const {
  JobAuditModel,
} = require("./models/jobAudit.schema");

class MongoStorage {
  async createAssociation(data) {
    const association = await AssociationModel.create(data);
    return association.toJSON();
  }

  async getAssociation(id) {
    return AssociationModel.findById(id).lean().exec();
  }

  async createAdmin(data) {
    const admin = await AdminModel.create(data);
    return admin.toJSON();
  }

  async getAdmin(id) {
    return AdminModel.findById(id).lean().exec();
  }

  async getAdminByEmail(email) {
    const user = await AdminModel.findOne({ email }).exec();
    return user ? user.toJSON() : null;
  }

  async createProduct(data) {
    const product = await ProductModel.create(data);
    return product.toJSON();
  }

  async getProduct(id) {
    return ProductModel.findById(id).lean().exec();
  }

  async getAllProducts() {
    const products = await ProductModel.find()
      .sort({ createdAt: -1 })
      .exec();
    return products.map(product => product.toJSON());
  }

  async updateProduct(id, data) {
    return ProductModel.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true },
    )
      .lean()
      .exec();
  }

  async deleteProduct(id) {
    await ProductModel.findByIdAndDelete(id).exec();
  }

  async createMSME(data) {
    const msme = await MSMEModel.create(data);
    return msme.toJSON();
  }

  async getMSME(id) {
    return MSMEModel.findById(id).lean().exec();
  }

  async getMSMEByEmail(email) {
    const user = await MSMEModel.findOne({ email }).exec();
    return user ? user.toJSON() : null;
  }

  async getAllMSMEs() {
    return MSMEModel.find()
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async createTestingAgency(data) {
    const agency = await TestingAgencyModel.create(data);
    return agency.toJSON();
  }

  async getTestingAgency(id) {
    return TestingAgencyModel.findById(id)
      .lean()
      .exec();
  }

  async getTestingAgencyByEmail(email) {
    const user = await TestingAgencyModel.findOne({ email }).exec();
    return user ? user.toJSON() : null;
  }

  async getAllTestingAgencies() {
    return TestingAgencyModel.find()
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async createFile(data) {
    const file = await FileModel.create(data);
    return file.toJSON();
  }

  async getFile(id) {
    return FileModel.findOne({ _id: id, deletedAt: { $exists: false } })
      .lean()
      .exec();
  }

  async softDeleteFile(id) {
    await FileModel.findByIdAndUpdate(id, {
      deletedAt: new Date(),
    }).exec();
  }

  async createJob(data) {
    const job = await JobModel.create(data);
    return job.toJSON();
  }

  async getJob(id) {
    if (!id || id === "undefined") return null;
    return JobModel.findById(id).lean().exec();
  }

  async getJobWithRelations(id) {
    if (!id || id === "undefined") return null;
    const job = await JobModel.findById(id)
      .populate("productId")
      .populate("msmeId")
      .populate("detailsFileId")
      .populate("assignedAgencyId")
      .exec();
    if (!job) return null;

    const testResults = await this.getTestResultsByJob(id);
    const audits = await this.getJobAudits(id);

    return {
      ...job.toJSON(),
      product: job.productId,
      msme: job.msmeId,
      detailsFile: job.detailsFileId,
      assignedAgency: job.assignedAgencyId,
      testResults,
      audits,
    };
  }

  async getAllJobs() {
    const jobs = await JobModel.find()
      .sort({ createdAt: -1 })
      .populate("productId")
      .populate("msmeId")
      .populate("assignedAgencyId")
      .populate("detailsFileId")
      .lean()
      .exec();

    return jobs.map((job) => ({
      ...job,
      product: job.productId,
      msme: job.msmeId,
      assignedAgency: job.assignedAgencyId,
      detailsFile: job.detailsFileId,
    }));
  }

  async getJobsByMSME(msmeId) {
    const jobs = await JobModel.find({ msmeId })
      .sort({ createdAt: -1 })
      .populate("productId")
      .populate("assignedAgencyId")
      .populate("detailsFileId")
      .exec();

    return jobs.map((job) => ({
      ...job.toJSON(),
      product: job.productId,
      assignedAgency: job.assignedAgencyId,
      detailsFile: job.detailsFileId,
    }));
  }

  async getJobsByAgency(agencyId) {
    const jobs = await JobModel.find({ assignedAgencyId: agencyId })
      .sort({ createdAt: -1 })
      .populate("productId")
      .populate("msmeId")
      .populate("detailsFileId")
      .exec();

    return jobs.map((job) => ({
      ...job.toJSON(),
      product: job.productId,
      msme: job.msmeId,
      detailsFile: job.detailsFileId,
    }));
  }

  async updateJobStatus(id, status) {
    if (!id || id === "undefined") return null;
    return JobModel.findByIdAndUpdate(
      id.toString(),
      { currentStatus: status, statusUpdatedAt: new Date(), updatedAt: new Date() },
      { new: true },
    )
      .lean()
      .exec();
  }

  async assignJobAgency(id, agencyId) {
    if (!id || id === "undefined") return null;
    return JobModel.findByIdAndUpdate(
      id.toString(),
      { assignedAgencyId: agencyId, updatedAt: new Date() },
      { new: true },
    )
      .lean()
      .exec();
  }

  async getUnassignedJobs() {
    const jobs = await JobModel.find({ 
      assignedAgencyId: { $exists: false },
      currentStatus: "UNDER_TESTING"
    })
      .sort({ createdAt: -1 })
      .populate("productId")
      .populate("msmeId")
      .populate("detailsFileId")
      .lean()
      .exec();

    return jobs.map((job) => ({
      ...job,
      product: job.productId,
      msme: job.msmeId,
      detailsFile: job.detailsFileId,
    }));
  }

  async createTestResult(data) {
    const result = await TestResultModel.create(data);
    return result.toJSON();
  }

  async getTestResultsByJob(jobId) {
    const results = await TestResultModel.find({ jobId })
      .sort({ submittedAt: -1 })
      .populate("agencyId")
      .populate("resultFileId")
      .lean()
      .exec();

    return results.map((result) => ({
      ...result,
      agency: result.agencyId,
      resultFile: result.resultFileId,
    }));
  }

  async getTestResultsByAgency(agencyId) {
    const results = await TestResultModel.find({ agencyId })
      .sort({ submittedAt: -1 })
      .populate({
        path: "jobId",
        populate: [{ path: "productId" }, { path: "msmeId" }],
      })
      .exec();

    return results.map((result) => {
      const job = result.jobId;
      if (!job) {
        return { ...result, job: undefined };
      }
      return {
        ...result.toJSON(),
        job: {
          ...job.toJSON(),
          product: job.productId,
          msme: job.msmeId,
        },
      };
    });
  }

  async createJobAudit(data) {
    const audit = await JobAuditModel.create(data);
    return audit.toJSON();
  }

  async getJobAudits(jobId) {
    return JobAuditModel.find({ jobId })
      .sort({ changedAt: -1 })
      .lean()
      .exec();
  }

  async getAdminStats() {
    const [jobCount, pendingReviewCount, completedCount, msmeCount, agencyCount, productCount] =
      await Promise.all([
        JobModel.countDocuments().exec(),
        JobModel.countDocuments({ currentStatus: "UNDER_REVIEW" }).exec(),
        TestResultModel.countDocuments().exec(),
        MSMEModel.countDocuments().exec(),
        TestingAgencyModel.countDocuments().exec(),
        ProductModel.countDocuments().exec(),
      ]);

    const recentJobsRaw = await JobModel.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("productId")
      .populate("msmeId")
      .lean()
      .exec();

    const recentJobs = recentJobsRaw.map((job) => ({
      ...job,
      product: job.productId,
      msme: job.msmeId,
    }));

    const statusCountsAgg = await JobModel.aggregate([
      { $group: { _id: "$currentStatus", count: { $sum: 1 } } },
    ]).exec();
    const statusBreakdown = {};
    statusCountsAgg.forEach((entry) => {
      statusBreakdown[entry._id] = entry.count;
    });

    return {
      totalJobs: jobCount,
      pendingReviews: pendingReviewCount,
      completedTests: completedCount,
      activeMsmes: msmeCount,
      activeAgencies: agencyCount,
      totalProducts: productCount,
      recentJobs,
      statusBreakdown,
    };
  }

  async getAdminAnalytics() {
    const [jobCount, approvedCount, rejectedCount, pendingReviewCount, msmeCount, agencyCount] =
      await Promise.all([
        JobModel.countDocuments().exec(),
        JobModel.countDocuments({ currentStatus: "APPROVED" }).exec(),
        JobModel.countDocuments({ currentStatus: "REJECTED" }).exec(),
        JobModel.countDocuments({ currentStatus: "UNDER_REVIEW" }).exec(),
        MSMEModel.countDocuments().exec(),
        TestingAgencyModel.countDocuments().exec(),
      ]);

    const statusCountsAgg = await JobModel.aggregate([
      { $group: { _id: "$currentStatus", count: { $sum: 1 } } },
    ]).exec();
    const statusBreakdown = {};
    statusCountsAgg.forEach((entry) => {
      statusBreakdown[entry._id] = entry.count;
    });

    const agencyPerformanceAgg = await TestResultModel.aggregate([
      { $group: { _id: "$agencyId", completed: { $sum: 1 } } },
    ]).exec();

    const agencyIds = agencyPerformanceAgg.map((a) => a._id).filter(Boolean);
    const agencies = await TestingAgencyModel.find({ _id: { $in: agencyIds } })
      .lean()
      .exec();
    const agencyMap = new Map(
      agencies.map((a) => [a._id.toString(), a.name ?? "Unknown"]),
    );

    const agencyPerformance = agencyPerformanceAgg.map((perf) => ({
      name: agencyMap.get(perf._id?.toString() ?? "") ?? "Unknown",
      completed: perf.completed,
    }));

    return {
      totalJobs: jobCount,
      approvedJobs: approvedCount,
      rejectedJobs: rejectedCount,
      pendingReviews: pendingReviewCount,
      activeMsmes: msmeCount,
      activeAgencies: agencyCount,
      statusBreakdown,
      monthlyJobs: [],
      agencyPerformance,
    };
  }

  async getMSMEStats(msmeId) {
    const [totalCount, pendingCount, approvedCount, rejectedCount] =
      await Promise.all([
        JobModel.countDocuments({ msmeId }).exec(),
        JobModel.countDocuments({
          msmeId,
          currentStatus: { $in: ["UNDER_TESTING", "UNDER_REVIEW"] },
        }).exec(),
        JobModel.countDocuments({ msmeId, currentStatus: "APPROVED" }).exec(),
        JobModel.countDocuments({ msmeId, currentStatus: "REJECTED" }).exec(),
      ]);

    const recentJobsRaw = await JobModel.find({ msmeId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("productId")
      .lean()
      .exec();

    const recentJobs = recentJobsRaw.map((job) => ({
      ...job,
      product: job.productId,
    }));

    return {
      totalJobs: totalCount,
      pendingJobs: pendingCount,
      approvedJobs: approvedCount,
      rejectedJobs: rejectedCount,
      recentJobs,
    };
  }

  async getAgencyStats(agencyId) {
    const [availableCount, completedCount, pendingCount] = await Promise.all([
      // Count unassigned jobs that are available to claim
      JobModel.countDocuments({
        assignedAgencyId: { $exists: false },
        currentStatus: "UNDER_TESTING",
      }).exec(),
      TestResultModel.countDocuments({ agencyId }).exec(),
      JobModel.countDocuments({
        assignedAgencyId: agencyId,
        currentStatus: "UNDER_REVIEW",
      }).exec(),
    ]);

    const recentJobsRaw = await JobModel.find({
      assignedAgencyId: agencyId,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("productId")
      .populate("msmeId")
      .lean()
      .exec();

    const recentJobs = recentJobsRaw.map((job) => ({
      ...job,
      product: job.productId,
      msme: job.msmeId,
    }));

    return {
      availableJobs: availableCount,
      completedTests: completedCount,
      pendingSubmissions: pendingCount,
      recentJobs,
    };
  }
}

const storage = new MongoStorage();

module.exports = { storage, MongoStorage };