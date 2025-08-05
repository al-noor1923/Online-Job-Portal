import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify token
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Middleware to check if user is recruiter
export const requireRecruiter = (req, res, next) => {
  if (req.user.role !== 'recruiter') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Recruiter role required.'
    });
  }
  next();
};

// Middleware to check if user is job seeker
export const requireJobSeeker = (req, res, next) => {
  if (req.user.role !== 'job_seeker') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Job seeker role required.'
    });
  }
  next();
};
