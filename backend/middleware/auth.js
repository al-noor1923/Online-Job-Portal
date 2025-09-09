import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify token and attach user to req
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
    console.log('Decoded JWT payload:', decoded);

    // Try common user ID fields in token
    const userId = decoded.userId || decoded.id || decoded._id;
    console.log('Extracted userId from token:', userId);

    if (!userId) {
      return res.status(403).json({
        success: false,
        message: 'Invalid token payload: user ID missing'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found in DB for ID:', userId);
      return res.status(403).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('Authenticated user:', user.name, 'Role:', user.role);
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
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
