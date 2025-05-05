const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// JWT secret key (in a real app, this would be in an environment variable)
const JWT_SECRET = 'ink-link-secret-key';

/**
 * Middleware to verify JWT token
 */
exports.verifyToken = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    // Format should be "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ message: 'Invalid token format' });
    }
    
    const token = parts[1];
    
    // Verify token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }
      
      // Add user ID to request
      req.userId = decoded.id;
      req.userRole = decoded.role;
      
      next();
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: error.message || 'Authentication error' });
  }
};

/**
 * Middleware to check if user is an artist
 */
exports.isArtist = async (req, res, next) => {
  try {
    const { userId, userRole } = req;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    if (userRole !== 'artist') {
      return res.status(403).json({ message: 'Access denied. Artist role required.' });
    }
    
    next();
  } catch (error) {
    console.error('isArtist middleware error:', error);
    res.status(500).json({ message: error.message || 'Authentication error' });
  }
};

/**
 * Middleware to check if user is a parlor owner
 */
exports.isParlorOwner = async (req, res, next) => {
  try {
    const { userId, userRole } = req;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    if (userRole !== 'parlor_owner') {
      return res.status(403).json({ message: 'Access denied. Parlor owner role required.' });
    }
    
    next();
  } catch (error) {
    console.error('isParlorOwner middleware error:', error);
    res.status(500).json({ message: error.message || 'Authentication error' });
  }
};

/**
 * Middleware to check if user is an admin
 */
exports.isAdmin = async (req, res, next) => {
  try {
    const { userId, userRole } = req;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }
    
    next();
  } catch (error) {
    console.error('isAdmin middleware error:', error);
    res.status(500).json({ message: error.message || 'Authentication error' });
  }
};