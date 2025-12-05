const { connectMongo } = require("./config/mongo");
const { AdminModel } = require("./models/admin.schema");
const { MSMEModel } = require("./models/msme.schema");
const { TestingAgencyModel } = require("./models/testingAgency.schema");
const { ProductModel } = require("./models/product.schema");
const { JobModel } = require("./models/job.schema");
const { TestResultModel } = require("./models/testResult.schema");
const { JobAuditModel } = require("./models/jobAudit.schema");
const { FileModel } = require("./models/file.schema");
const bcrypt = require("bcryptjs");

// Sample data
const sampleProducts = [
  {
    name: "Engine Control Module",
    category: "Electronics",
    description: "Advanced engine control unit with diagnostic capabilities"
  },
  {
    name: "Brake Testing System",
    category: "Brakes",
    description: "Comprehensive brake performance testing equipment"
  },
  {
    name: "Transmission Analyzer",
    category: "Transmission",
    description: "Automated transmission testing and analysis system"
  },
  {
    name: "Emission Testing Kit",
    category: "Emissions",
    description: "Vehicle emission testing and compliance system"
  },
  {
    name: "Suspension Testing Rig",
    category: "Suspension",
    description: "Complete suspension and shock absorber testing system"
  },
  {
    name: "Fuel System Tester",
    category: "Fuel System",
    description: "Fuel injection and fuel system diagnostic equipment"
  },
  {
    name: "Airbag Testing System",
    category: "Safety Systems",
    description: "Airbag and safety systems testing equipment"
  },
  {
    name: "Battery Testing Unit",
    category: "Electrical",
    description: "Battery and electrical system testing equipment"
  }
];

const sampleMSMEs = [
  {
    name: "AutoParts Manufacturing Ltd",
    governmentApprovalId: "GOV2024001",
    productCategory: "Automotive Components",
    contactEmail: "contact@autoparts.com",
    contactPhone: "+91-9876543210"
  },
  {
    name: "TechAuto Solutions",
    governmentApprovalId: "GOV2024002", 
    productCategory: "Electronics Manufacturing",
    contactEmail: "info@techauto.com",
    contactPhone: "+91-9876543211"
  },
  {
    name: "Precision Engineering Co",
    governmentApprovalId: "GOV2024003",
    productCategory: "Mechanical Components",
    contactEmail: "admin@precisioneng.com",
    contactPhone: "+91-9876543212"
  },
  {
    name: "Green Motors Pvt Ltd",
    governmentApprovalId: "GOV2024004",
    productCategory: "Electric Vehicle Components",
    contactEmail: "support@greenmotors.com",
    contactPhone: "+91-9876543213"
  },
  {
    name: "Safety Systems India",
    governmentApprovalId: "GOV2024005",
    productCategory: "Safety Equipment",
    contactEmail: "test@safetysystems.com",
    contactPhone: "+91-9876543214"
  }
];

const sampleAgencies = [
  {
    name: "National Automotive Testing Agency",
    approvalId: "NATA2024001",
    location: "Mumbai, Maharashtra",
    agencyType: "Government Authorized"
  },
  {
    name: "AutoTech Testing Labs",
    approvalId: "ATL2024002",
    location: "Pune, Maharashtra", 
    agencyType: "Private Accredited"
  },
  {
    name: "Quality Control Services",
    approvalId: "QCS2024003",
    location: "Chennai, Tamil Nadu",
    agencyType: "ISO Certified"
  },
  {
    name: "Vehicle Certification Center",
    approvalId: "VCC2024004",
    location: "Delhi NCR",
    agencyType: "Government Authorized"
  },
  {
    name: "Precision Testing Laboratories",
    approvalId: "PTL2024005",
    location: "Bangalore, Karnataka",
    agencyType: "NABL Accredited"
  }
];

async function createMockData() {
  console.log("🌱 Creating comprehensive mock data for EventBotAnalytics...");
  
  try {
    await connectMongo();
    
    // Get existing admin for associations
    const admin = await AdminModel.findOne({ email: "admin@motortest.local" }).exec();
    if (!admin) {
      throw new Error("Admin user not found. Please run seed.js first.");
    }

    console.log("📦 Creating sample products...");
    const createdProducts = [];
    for (const product of sampleProducts) {
      const existingProduct = await ProductModel.findOne({ name: product.name }).exec();
      if (!existingProduct) {
        const newProduct = await ProductModel.create({
          ...product,
          addedById: admin._id
        });
        createdProducts.push(newProduct);
        console.log(`  ✅ Created product: ${product.name} (${product.category})`);
      } else {
        createdProducts.push(existingProduct);
        console.log(`  ⏭️ Product already exists: ${product.name}`);
      }
    }

    console.log("🏭 Creating sample MSMEs...");
    const createdMSMEs = [];
    for (const msme of sampleMSMEs) {
      const existingMSME = await MSMEModel.findOne({ email: `msme_${msme.name.toLowerCase().replace(/\s+/g, '_')}@test.com` }).exec();
      if (!existingMSME) {
        const passwordHash = await bcrypt.hash("Test123!", 12);
        const newMSME = await MSMEModel.create({
          ...msme,
          email: `msme_${msme.name.toLowerCase().replace(/\s+/g, '_')}@test.com`,
          passwordHash,
          addedById: admin._id
        });
        createdMSMEs.push(newMSME);
        console.log(`  ✅ Created MSME: ${msme.name}`);
      } else {
        createdMSMEs.push(existingMSME);
        console.log(`  ⏭️ MSME already exists: ${msme.name}`);
      }
    }

    console.log("🧪 Creating sample Testing Agencies...");
    const createdAgencies = [];
    for (const agency of sampleAgencies) {
      const existingAgency = await TestingAgencyModel.findOne({ email: `agency_${agency.name.toLowerCase().replace(/\s+/g, '_')}@test.com` }).exec();
      if (!existingAgency) {
        const passwordHash = await bcrypt.hash("Test123!", 12);
        const newAgency = await TestingAgencyModel.create({
          ...agency,
          email: `agency_${agency.name.toLowerCase().replace(/\s+/g, '_')}@test.com`,
          passwordHash,
          addedById: admin._id
        });
        createdAgencies.push(newAgency);
        console.log(`  ✅ Created Agency: ${agency.name}`);
      } else {
        createdAgencies.push(existingAgency);
        console.log(`  ⏭️ Agency already exists: ${agency.name}`);
      }
    }

    console.log("📋 Creating sample Jobs with different statuses...");
    const jobStatuses = ["DRAFT", "UNDER_TESTING", "UNDER_REVIEW", "APPROVED", "REJECTED"];
    const createdJobs = [];

    for (let i = 0; i < 15; i++) {
      const randomMSME = createdMSMEs[Math.floor(Math.random() * createdMSMEs.length)];
      const randomProduct = createdProducts[Math.floor(Math.random() * createdProducts.length)];
      const randomAgency = i > 2 ? createdAgencies[Math.floor(Math.random() * createdAgencies.length)] : null;
      const status = jobStatuses[Math.floor(Math.random() * jobStatuses.length)];
      
      const existingJob = await JobModel.findOne({
        title: `Testing Job ${i + 1} for ${randomMSME.name}`
      }).exec();
      
      if (!existingJob) {
        const job = await JobModel.create({
          productId: randomProduct._id,
          msmeId: randomMSME._id,
          title: `Testing Job ${i + 1} for ${randomMSME.name}`,
          description: `Comprehensive testing of ${randomProduct.name} for compliance and quality assurance. Job includes detailed analysis and reporting.`,
          currentStatus: status,
          assignedAgencyId: randomAgency ? randomAgency._id : null,
          statusUpdatedAt: new Date()
        });
        createdJobs.push(job);
        console.log(`  ✅ Created Job: ${job.title} (${status})`);
      }
    }

    console.log("📊 Creating sample Test Results...");
    const testScores = [85, 92, 78, 95, 88, 91, 83, 89, 94, 87, 90];
    const createdTestResults = [];

    for (let i = 0; i < 10; i++) {
      const testingJobs = createdJobs.filter(job => job.currentStatus === "UNDER_TESTING" || job.currentStatus === "APPROVED");
      if (testingJobs.length > 0) {
        const randomJob = testingJobs[Math.floor(Math.random() * testingJobs.length)];
        const randomAgency = createdAgencies[Math.floor(Math.random() * createdAgencies.length)];
        
        const existingResult = await TestResultModel.findOne({
          jobId: randomJob._id,
          agencyId: randomAgency._id
        }).exec();
        
        if (!existingResult) {
          const testResult = await TestResultModel.create({
            jobId: randomJob._id,
            agencyId: randomAgency._id,
            score: testScores[i % testScores.length],
            comments: `Testing completed successfully. All parameters within acceptable limits. Minor recommendations for optimization provided in detailed report.`,
            verified: Math.random() > 0.3,
            submittedAt: new Date()
          });
          createdTestResults.push(testResult);
          console.log(`  ✅ Created Test Result: Score ${testScores[i % testScores.length]} for ${randomJob.title}`);
        }
      }
    }

    console.log("📝 Creating Job Audit Trail...");
    const createdAudits = [];
    
    for (const job of createdJobs) {
      if (job.currentStatus !== "DRAFT") {
        const audit = await JobAuditModel.create({
          jobId: job._id,
          previousStatus: "DRAFT",
          newStatus: job.currentStatus,
          changedByType: "MSME",
          changedById: job.msmeId,
          notes: `Job status updated from DRAFT to ${job.currentStatus}`,
          changedAt: new Date()
        });
        createdAudits.push(audit);
        console.log(`  ✅ Created Audit: ${job.title} → ${job.currentStatus}`);
      }
    }

    console.log("\n🎉 Mock Data Creation Complete!");
    console.log("\n📊 Summary:");
    console.log(`  📦 Products: ${createdProducts.length}`);
    console.log(`  🏭 MSMEs: ${createdMSMEs.length}`);
    console.log(`  🧪 Agencies: ${createdAgencies.length}`);
    console.log(`  📋 Jobs: ${createdJobs.length}`);
    console.log(`  📊 Test Results: ${createdTestResults.length}`);
    console.log(`  📝 Audit Logs: ${createdAudits.length}`);
    
    console.log("\n🔑 Sample Login Credentials:");
    console.log("\n📋 MSME Accounts:");
    createdMSMEs.forEach((msme, index) => {
      console.log(`  ${index + 1}. ${msme.email} / Test123!`);
    });
    
    console.log("\n🧪 Agency Accounts:");
    createdAgencies.forEach((agency, index) => {
      console.log(`  ${index + 1}. ${agency.email} / Test123!`);
    });
    
    console.log("\n🛡️ Admin Account:");
    console.log(`  1. admin@motortest.local / P@ssw0rd!`);
    
    console.log("\n✨ Use these credentials to test the application!");
    
  } catch (error) {
    console.error("❌ Error creating mock data:", error);
    throw error;
  }
}

createMockData().then(() => {
  console.log("\n🚀 Mock data successfully loaded!");
  process.exit(0);
}).catch((error) => {
  console.error("\n💥 Failed to create mock data:", error);
  process.exit(1);
});