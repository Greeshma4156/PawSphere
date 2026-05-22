import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import logger from '../utils/logger.js';

// Protect routes
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretpawkey_123');

    // Fetch user and attach to request
    // If MongoDB is offline, use decodes as fallback
    let user = await User.findById(decoded.id);
    if (!user) {
      // Create a mock user object representing the verified JWT session
      // if mongoose failed to find it or if we are running in in-memory mode
      user = {
        _id: decoded.id,
        role: decoded.role,
        name: 'Mock Session User',
        email: 'mocksession@pawsphere.org',
        isVerified: true
      };
    }

    req.user = user;
    next();
  } catch (err) {
    logger.error(`JWT Auth Failure: ${err.message}`);
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user ? req.user.role : 'anonymous'} is not authorized to access this route`,
      });
    }
    next();
  };
};
