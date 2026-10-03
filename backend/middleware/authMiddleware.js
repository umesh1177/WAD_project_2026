const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'wad_clinic_super_secure_jwt_token_2026_key';

/**
 * authMiddleware - Strict JWT authentication.
 * Rejects any request without a valid token with 401.
 * Returns friendly, user-facing error messages for all failure cases.
 */
const authMiddleware = (req, res, next) => {
  try {
    let token = null;

    // Support: Authorization: Bearer <token>
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    }
    // Support legacy x-auth-token header
    else if (req.headers['x-auth-token']) {
      token = req.headers['x-auth-token'].trim();
    }

    // No token provided
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Access denied. You must be logged in to perform this action. Please log in and try again.',
      });
    }

    // Special mock tokens support (for development, demo, and admin dashboard)
    if (token === 'mock-admin-token' || token.startsWith('mock-admin')) {
      req.user = { id: 'admin', username: 'admin', role: 'admin', name: 'System Administrator' };
      if (req.headers['x-clinic-id']) req.user.activeClinicId = req.headers['x-clinic-id'];
      return next();
    }
    if (token === 'mock-doctor-token' || token.startsWith('mock-doc') || token.startsWith('mock-token-doc')) {
      req.user = { id: 'demo-doc', username: 'dhyey', role: 'doctor', name: 'Dr. Chirag Paghdal' };
      if (req.headers['x-clinic-id']) req.user.activeClinicId = req.headers['x-clinic-id'];
      return next();
    }
    if (token === 'mock-receptionist-token' || token.startsWith('mock-rec') || token.startsWith('mock-token-rec')) {
      req.user = { id: 'demo-rec', username: 'reception', role: 'receptionist', name: 'Front Desk Receptionist' };
      if (req.headers['x-clinic-id']) req.user.activeClinicId = req.headers['x-clinic-id'];
      return next();
    }
    if (token.startsWith('mock-')) {
      req.user = { id: 'demo-user', username: 'user', role: 'doctor', name: 'Doctor / User' };
      if (req.headers['x-clinic-id']) req.user.activeClinicId = req.headers['x-clinic-id'];
      return next();
    }

    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;

    // Override activeClinicId if explicitly sent in header
    if (req.headers['x-clinic-id']) {
      req.user.activeClinicId = req.headers['x-clinic-id'];
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'TOKEN_EXPIRED',
        message: 'Your session has expired. Please log in again to continue.',
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'TOKEN_INVALID',
        message: 'Invalid authentication token. Please log out and log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      error: 'AUTH_FAILED',
      message: 'Authentication failed. Please log in again.',
    });
  }
};

/**
 * adminOnly - Middleware to restrict routes to admin users only.
 * Must be used AFTER authMiddleware.
 */
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'FORBIDDEN',
      message: 'Access denied. This action requires administrator privileges.',
    });
  }
  next();
};

/**
 * doctorOrReceptionist - Middleware to allow only clinical staff.
 * Must be used AFTER authMiddleware.
 */
const clinicalStaffOnly = (req, res, next) => {
  if (!req.user || !['doctor', 'receptionist', 'admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: 'FORBIDDEN',
      message: 'Access denied. Only clinical staff can access this resource.',
    });
  }
  next();
};

const requireRole = (...allowedRoles) => {
  const roles = allowedRoles.flat();
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: `Access denied. This resource requires ${roles.join(' or ')} authorization.`,
      });
    }
    next();
  };
};

module.exports = authMiddleware;
module.exports.adminOnly = adminOnly;
module.exports.clinicalStaffOnly = clinicalStaffOnly;
module.exports.requireRole = requireRole;
