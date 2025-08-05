import express from 'express';
import Application from '../models/application.js';
import Job from '../models/job.js';
import { authenticateToken, requireJobSeeker, requireRecruiter } from '../middleware/auth.js';

const router = express.Router();

// Apply for a job (only job seekers)
router.post('/apply', authenticateToken, requireJobSeeker, async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      jobSeeker: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Create new application
    const application = new Application({
      job: jobId,
      jobSeeker: req.user._id,
      recruiter: job.recruiter,
      coverLetter: coverLetter || ''
    });

    await application.save();
    
    // Populate job and job seeker data
    await application.populate([
      { path: 'job', select: 'title company location' },
      { path: 'jobSeeker', select: 'name email phone resume skills experience' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get applications for current job seeker
router.get('/my-applications', authenticateToken, requireJobSeeker, async (req, res) => {
  try {
    const applications = await Application.find({ jobSeeker: req.user._id })
      .populate([
        { path: 'job', select: 'title company location salary type' },
        { path: 'recruiter', select: 'name company email' }
      ])
      .sort({ createdAt: -1 });

    res.json({ success: true, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get applications for recruiter's jobs
router.get('/received-applications', authenticateToken, requireRecruiter, async (req, res) => {
  try {
    const applications = await Application.find({ recruiter: req.user._id })
      .populate([
        { path: 'job', select: 'title company location salary type' },
        { path: 'jobSeeker', select: 'name email phone resume skills experience education' }
      ])
      .sort({ createdAt: -1 });

    res.json({ success: true, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update application status (only recruiters)
router.put('/:id/status', authenticateToken, requireRecruiter, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, recruiter: req.user._id },
      { status },
      { new: true }
    ).populate([
      { path: 'job', select: 'title company location' },
      { path: 'jobSeeker', select: 'name email phone' }
    ]);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or you are not authorized'
      });
    }

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: application
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

export default router;
