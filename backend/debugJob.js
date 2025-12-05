const { connectMongo } = require('./config/mongo');
const { JobModel } = require('./models/job.schema');

async function debugJobAssignment() {
  try {
    await connectMongo();
    
    // Get a sample job
    const job = await JobModel.findOne().exec();
    console.log('Sample job:', job);
    
    if (job) {
      console.log('Job ID type:', typeof job._id);
      console.log('Job ID string:', job._id.toString());
      console.log('Job ID as string:', job.id);
      
      // Test the assignment
      const result = await JobModel.findByIdAndUpdate(
        job._id.toString(),
        { assignedAgencyId: "69305a6a63a05a1d12357748", updatedAt: new Date() },
        { new: true }
      ).lean().exec();
      
      console.log('Assignment result:', result);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Debug error:', error);
    process.exit(1);
  }
}

debugJobAssignment();