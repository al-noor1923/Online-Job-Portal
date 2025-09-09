import express from 'express';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import { authenticateAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

// GET /admin/dashboard - Admin dashboard statistics
router.get('/dashboard', authenticateAdmin, async (req, res) => {
  try {
    // Get total counts
    const totalUsers = await User.countDocuments();
    const totalJobSeekers = await User.countDocuments({ role: 'job_seeker' });
    const totalRecruiters = await User.countDocuments({ role: 'recruiter' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'active' });
    const totalApplications = await Application.countDocuments();

    // Get recent activities
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email role createdAt');

    const recentJobs = await Job.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('postedBy', 'name company')
      .select('title company location status createdAt postedBy');

    const recentApplications = await Application.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('applicant', 'name email')
      .populate('job', 'title company')
      .select('applicant job status createdAt');

    // Calculate statistics by month for charts
    const monthlyStats = await getMonthlyStats();

    res.json({
      success: true,
      data: {
        totalCounts: {
          totalUsers,
          totalJobSeekers,
          totalRecruiters,
          totalAdmins,
          totalJobs,
          activeJobs,
          totalApplications
        },
        recentActivities: {
          recentUsers,
          recentJobs,
          recentApplications
        },
        monthlyStats
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
});

// GET /admin/users - Get all users with filters
router.get('/users', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role && role !== 'all') query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalUsers = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
        currentPage: parseInt(page)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// PUT /admin/users/:id/role - Update user role
router.put('/users/:id/role', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['job_seeker', 'recruiter', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role'
    });
  }
});

// DELETE /admin/users/:id - Delete user
router.delete('/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Also delete user's applications and jobs
    await Application.deleteMany({ applicant: id });
    await Job.deleteMany({ postedBy: id });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

// GET /admin/jobs - Get all jobs
router.get('/jobs', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    const jobs = await Job.find(query)
      .populate('postedBy', 'name email company')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalJobs = await Job.countDocuments(query);

    res.json({
      success: true,
      data: {
        jobs,
        totalJobs,
        totalPages: Math.ceil(totalJobs / limit),
        currentPage: parseInt(page)
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs'
    });
  }
});

// GET /admin/applications - Get all applications
router.get('/applications', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status && status !== 'all') query.status = status;

    const applications = await Application.find(query)
      .populate('applicant', 'name email')
      .populate('job', 'title company')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalApplications = await Application.countDocuments(query);

    res.json({
      success: true,
      data: {
        applications,
        totalApplications,
        totalPages: Math.ceil(totalApplications / limit),
        currentPage: parseInt(page)
      }
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications'
    });
  }
});

// Helper function to get monthly statistics
async function getMonthlyStats() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const userStats = await User.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  const jobStats = await Job.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  const applicationStats = await Application.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  return {
    users: userStats,
    jobs: jobStats,
    applications: applicationStats
  };
}

export default router;
