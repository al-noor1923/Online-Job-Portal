import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';
import { authenticateToken, requireJobSeeker } from './middleware/auth.js';
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Register user (job seeker or recruiter)
// Register user (job seeker or recruiter)
router.post('/register', async (req, res) => {
  try {
    console.log('🔍 Registration request body:', req.body);
    
    const { name, email, password, phone, role, company, companyDescription, website, dateOfBirth } = req.body;

    console.log('🔍 Extracted fields:');
    console.log('  - name:', name);
    console.log('  - email:', email);
    console.log('  - role:', role);
    console.log('  - dateOfBirth:', dateOfBirth);
    console.log('  - company:', company);

    // Validate role
    if (!['job_seeker', 'recruiter'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either job_seeker or recruiter'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Validate recruiter-specific fields
    if (role === 'recruiter' && !company) {
      return res.status(400).json({
        success: false,
        message: 'Company name is required for recruiters'
      });
    }

    // Validate job seeker-specific fields
    if (role === 'job_seeker' && !dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: 'Date of birth is required for job seekers'
      });
    }

    // Create new user
    const userData = {
      name,
      email,
      password,
      phone,
      role
    };

    // Add role-specific fields
    if (role === 'recruiter') {
      userData.company = company;
      userData.companyDescription = companyDescription || '';
      userData.website = website || '';
    } else if (role === 'job_seeker') {
      userData.dateOfBirth = dateOfBirth;
    }

    console.log('🔍 Final userData to save:', userData);

    const user = new User(userData);
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    const responseUserData = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    };

    // Add role-specific data to response
    if (role === 'recruiter') {
      responseUserData.company = user.company;
      responseUserData.companyDescription = user.companyDescription;
      responseUserData.website = user.website;
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: responseUserData,
        token
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});


// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    };

    // Add role-specific data
    if (user.role === 'recruiter') {
      userData.company = user.company;
      userData.companyDescription = user.companyDescription;
      userData.website = user.website;
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get current user profile
// Get current user profile (full for job seeker)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean();

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const base = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      address: user.address,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    if (user.role === 'recruiter') {
      return res.json({
        success: true,
        data: {
          user: {
            ...base,
            company: user.company,
            companyDescription: user.companyDescription,
            website: user.website
          }
        }
      });
    }

    // job_seeker → send expanded profile
    return res.json({
      success: true,
      data: {
        user: {
          ...base,
          dateOfBirth: user.dateOfBirth,
          skills: user.skills || [],
          experience: user.experience || '',
          education: user.education || '',
          expertise: user.expertise || [],
          hobbies: user.hobbies || [],
          experienceEntries: user.experienceEntries || [],
          educationEntries: user.educationEntries || [],
          resume: user.resume || ''
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// Temporary route to fix user roles - REMOVE IN PRODUCTION
router.post('/fix-user-role', async (req, res) => {
  try {
    const { email, newRole } = req.body;
    
    if (!['job_seeker', 'recruiter'].includes(newRole)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be job_seeker or recruiter'
      });
    }
    
    const User = (await import('../models/User.js')).default;
    
    const user = await User.findOneAndUpdate(
      { email: email },
      { role: newRole },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User role updated successfully',
      data: {
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
