import express from 'express';
import Job from '../models/job.js';
import Application from '../models/application.js';
import { authenticateToken, requireRecruiter } from '../middleware/auth.js';

const router = express.Router();

// GET all jobs (accessible to everyone) - Browse Jobs
// GET all jobs (accessible to everyone) - Browse Jobs with sorting/filtering
router.get('/', async (req, res) => {
  try {
    console.log('🔍 Fetching jobs with filters...');

    const { sort, minSalary, maxSalary, page = 1, limit = 20 } = req.query;

    // Build salary filter
    const filter = {};
    if (minSalary || maxSalary) {
      filter.salary = {};
      if (minSalary && !Number.isNaN(Number(minSalary))) {
        filter.salary.$gte = Number(minSalary);
      }
      if (maxSalary && !Number.isNaN(Number(maxSalary))) {
        filter.salary.$lte = Number(maxSalary);
      }
    }

    // Build sort order
    let sortObj = { createdAt: -1 }; // default: newest first
    if (sort === 'salary_asc') sortObj = { salary: 1 };
    if (sort === 'salary_desc') sortObj = { salary: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    // Query DB
    const [items, total] = await Promise.all([
      Job.find(filter)
        .populate('recruiter', 'name company email')
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit)),
      Job.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
        sort: sort || 'createdAt_desc',
        filterApplied: filter,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching jobs:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});


// Temporary route to create test jobs - REMOVE IN PRODUCTION
router.post('/create-sample-jobs', async (req, res) => {
  try {
    console.log('🔧 Creating sample jobs...');
    
    // First, find or create a recruiter
    const User = (await import('../models/User.js')).default;
    let recruiter = await User.findOne({ role: 'recruiter' });
    
    if (!recruiter) {
      console.log('👤 No recruiter found, creating one...');
      recruiter = new User({
        name: 'Sample Recruiter',
        email: 'recruiter@sample.com',
        password: 'password123',
        phone: '1234567890',
        role: 'recruiter',
        company: 'Tech Solutions Inc'
      });
      await recruiter.save();
      console.log('✅ Recruiter created:', recruiter.name);
    }
    
    // Create sample jobs
    const sampleJobs = [
      {
        title: 'Frontend Developer',
        company: recruiter.company,
        location: 'New York, NY',
        salary: '$70,000 - $90,000',
        description: 'We are looking for a skilled Frontend Developer to join our team.',
        requirements: ['React', 'JavaScript', 'CSS', 'HTML'],
        type: 'full-time',
        experience: 'mid',
        remote: true,
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        ageLimit: { min: 22, max: 45 },
        recruiter: recruiter._id,
        status: 'active'
      },
      {
        title: 'Backend Developer',
        company: recruiter.company,
        location: 'San Francisco, CA',
        salary: '$80,000 - $100,000',
        description: 'Looking for an experienced Backend Developer with Node.js expertise.',
        requirements: ['Node.js', 'MongoDB', 'Express', 'API Development'],
        type: 'full-time',
        experience: 'senior',
        remote: false,
        applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        ageLimit: { min: 25, max: 50 },
        recruiter: recruiter._id,
        status: 'active'
      },
      {
        title: 'Full Stack Developer',
        company: 'Innovation Labs',
        location: 'Austin, TX',
        salary: '$85,000 - $110,000',
        description: 'Join our dynamic team as a Full Stack Developer.',
        requirements: ['React', 'Node.js', 'PostgreSQL', 'Git'],
        type: 'full-time',
        experience: 'mid',
        remote: true,
        applicationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        ageLimit: { min: 24, max: 55 },
        recruiter: recruiter._id,
        status: 'active'
      }
    ];
    
    // Delete existing jobs to avoid duplicates
    await Job.deleteMany({});
    console.log('🗑️ Cleared existing jobs');
    
    // Insert new jobs
    const createdJobs = await Job.insertMany(sampleJobs);
    console.log(`✅ Created ${createdJobs.length} sample jobs`);
    
    res.json({
      success: true,
      message: `Successfully created ${createdJobs.length} sample jobs`,
      data: createdJobs
    });
  } catch (error) {
    console.error('❌ Error creating sample jobs:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET jobs created by current recruiter
router.get('/my-jobs', authenticateToken, requireRecruiter, async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user._id })
      .populate('recruiter', 'name company email')
      .sort({ createdAt: -1 });
    
    // Add application count for each job
    const jobsWithApplications = await Promise.all(
      jobs.map(async (job) => {
        const applicationCount = await Application.countDocuments({ job: job._id });
        return {
          ...job.toObject(),
          applicationsCount: applicationCount
        };
      })
    );
    
    console.log(`Found ${jobs.length} jobs for recruiter ${req.user._id}`);
    res.json({ success: true, data: jobsWithApplications });
  } catch (error) {
    console.error('Error fetching recruiter jobs:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET applications for a specific job (only by job creator)
router.get('/:jobId/applications', authenticateToken, requireRecruiter, async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Verify the job belongs to the recruiter
    const job = await Job.findOne({ _id: jobId, recruiter: req.user._id });
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or you are not authorized to view its applications'
      });
    }
    
    const applications = await Application.find({ job: jobId })
      .populate([
        { path: 'job', select: 'title company location salary type applicationDeadline ageLimit' },
        { 
          path: 'jobSeeker', 
          select: 'name email phone resume skills experience education dateOfBirth address'
        }
      ])
      .sort({ createdAt: -1 });
    
    // Add age calculation and eligibility check
    const applicationsWithAge = applications.map(app => {
      const appObj = app.toObject();
      if (appObj.jobSeeker.dateOfBirth) {
        const age = Math.floor((Date.now() - new Date(appObj.jobSeeker.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000));
        appObj.jobSeeker.age = age;
        appObj.ageEligible = job.isAgeEligible(age);
      }
      return appObj;
    });
    
    res.json({ 
      success: true, 
      data: {
        job: job,
        applications: applicationsWithAge
      }
    });
  } catch (error) {
    console.error('Error fetching job applications:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create new job (only recruiters)
router.post('/', authenticateToken, requireRecruiter, async (req, res) => {
  try {
    console.log('Creating job with data:', req.body);
    
    const { applicationDeadline, ageLimit, ...jobData } = req.body;
    
    // Validate application deadline
    const deadline = new Date(applicationDeadline);
    if (deadline <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Application deadline must be in the future'
      });
    }
    
    const newJobData = {
      ...jobData,
      recruiter: req.user._id,
      company: req.user.company,
      applicationDeadline: deadline,
      ageLimit: {
        min: ageLimit?.min || 18,
        max: ageLimit?.max || 65
      }
    };

    const job = new Job(newJobData);
    await job.save();
    
    // Populate recruiter data before sending response
    await job.populate('recruiter', 'name company email');
    
    console.log('Job created successfully:', job._id);
    res.status(201).json({ success: true, data: job });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT update job (only by job creator)
router.put('/:id', authenticateToken, requireRecruiter, async (req, res) => {
  try {
    console.log(`Updating job ${req.params.id} by user ${req.user._id}`);
    
    const { applicationDeadline, ageLimit, ...updateData } = req.body;
    
    // Validate application deadline if provided
    if (applicationDeadline) {
      const deadline = new Date(applicationDeadline);
      if (deadline <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Application deadline must be in the future'
        });
      }
      updateData.applicationDeadline = deadline;
    }
    
    if (ageLimit) {
      updateData.ageLimit = {
        min: ageLimit.min || 18,
        max: ageLimit.max || 65
      };
    }
    
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, recruiter: req.user._id },
      updateData,
      { new: true }
    ).populate('recruiter', 'name company email');

    if (!job) {
      return res.status(404).json({ 
        success: false, 
        message: 'Job not found or you are not authorized to update it' 
      });
    }

    console.log('Job updated successfully:', job._id);
    res.json({ success: true, data: job });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE job (only by job creator)
router.delete('/:id', authenticateToken, requireRecruiter, async (req, res) => {
  try {
    console.log(`Deleting job ${req.params.id} by user ${req.user._id}`);
    
    const job = await Job.findOneAndDelete({ 
      _id: req.params.id, 
      recruiter: req.user._id 
    });

    if (!job) {
      return res.status(404).json({ 
        success: false, 
        message: 'Job not found or you are not authorized to delete it' 
      });
    }

    // Also delete all applications for this job
    await Application.deleteMany({ job: req.params.id });

    console.log('Job deleted successfully:', req.params.id);
    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single job details
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('recruiter', 'name company email website');
    
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.json({ success: true, data: job });
  } catch (error) {
    console.error('Error fetching job details:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});


export default router;
