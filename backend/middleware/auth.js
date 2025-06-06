const jwt = require('jsonwebtoken');
const db = require('../config/database');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database to ensure they still exist
    const result = await db.query(
      'SELECT id, email, first_name, last_name, role, restaurant_id FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Define role hierarchy (higher number = more permissions)
const ROLE_HIERARCHY = {
  'employee': 1,
  'chef': 2,
  'manager': 3,
  'executive': 4,
  'admin': 5
};

// Middleware to check if user has admin role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Middleware to check if user has executive or admin role
const requireExecutive = (req, res, next) => {
  if (!['admin', 'executive'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Executive or admin access required' });
  }
  next();
};

// Middleware to check if user has manager or higher role
const requireManager = (req, res, next) => {
  if (!['admin', 'executive', 'manager'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Manager or higher access required' });
  }
  next();
};

// Middleware to check if user has chef or higher role
const requireChef = (req, res, next) => {
  if (!['admin', 'executive', 'manager', 'chef'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Chef or higher access required' });
  }
  next();
};

// Generic middleware to check minimum role level
const requireMinimumRole = (minimumRole) => {
  return (req, res, next) => {
    const userRoleLevel = ROLE_HIERARCHY[req.user.role] || 0;
    const requiredRoleLevel = ROLE_HIERARCHY[minimumRole] || 0;
    
    if (userRoleLevel < requiredRoleLevel) {
      return res.status(403).json({ 
        error: `${minimumRole} or higher access required` 
      });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireExecutive,
  requireManager,
  requireChef,
  requireMinimumRole,
  ROLE_HIERARCHY
};
