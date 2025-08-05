import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import userRoutes from './routes/users.js';
import jobRoutes from './routes/jobs.js';
import applicationRoutes from './routes/applications.js';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jobportal';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB successfully!');
    
    // Debug: Check if we have data
    try {
      const User = (await import('./models/User.js')).default;
      const Job = (await import('./models/job.js')).default;
      
      const userCount = await User.countDocuments();
      const jobCount = await Job.countDocuments();
      
      console.log(`👥 Total users in database: ${userCount}`);
      console.log(`💼 Total jobs in database: ${jobCount}`);
      
      if (jobCount > 0) {
        console.log('📋 Sample jobs:');
        const sampleJobs = await Job.find().limit(3);
        sampleJobs.forEach(job => {
          console.log(`- ${job.title} at ${job.company} (ID: ${job._id})`);
          console.log(`  Recruiter ID: ${job.recruiter}`);
          console.log(`  Status: ${job.status}`);
          console.log(`  Created: ${job.createdAt}`);
        });
      } else {
        console.log('❌ No jobs found in database');
      }
      
      if (userCount > 0) {
        console.log('👤 Sample users:');
        const sampleUsers = await User.find().limit(3);
        sampleUsers.forEach(user => {
          console.log(`- ${user.name} (${user.role}) - ID: ${user._id}`);
        });
      }
    } catch (error) {
      console.error('❌ Error checking database:', error);
    }
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed:', error);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);

// Test route with database check
app.get('/', async (req, res) => {
  try {
    const Job = (await import('./models/job.js')).default;
    const jobCount = await Job.countDocuments();
    
    res.json({ 
      message: 'Job Portal API is running!',
      mongodb_status: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
      total_jobs: jobCount
    });
  } catch (error) {
    res.json({ 
      message: 'Job Portal API is running!',
      mongodb_status: 'Error checking database',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
