const { connectMongo } = require('./config/mongo');
const { JobModel } = require('./models/job.schema');

async function testJobStatus() {
  try {
    await connectMongo();
    
    // Get a job in DRAFT status
    const job = await JobModel.findOne({ currentStatus: "DRAFT" }).exec();
    console.log('Found job:', job);
    
    if (job) {
      console.log('Job ID type:', typeof job._id);
      console.log('Job ID string:', job._id.toString());
      console.log('Job virtual ID:', job.id);
      
      // Try to assign agency
      console.log('Attempting assignment...');
      const result = await JobModel.findByIdAndUpdate(
        job._id.toString(),
        { 
          assignedAgencyId: "69305a6a63a05a1d12357748", 
          currentStatus: "UNDER_TESTING",
          updatedAt: new Date() 
        },
        { new: true }
      ).lean().exec();
      
      console.log('Assignment result:', result);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Test error:', error);
    process.exit(1);
  }
}

testJobStatus();