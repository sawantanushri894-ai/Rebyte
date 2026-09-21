const jwt = require('jsonwebtoken');
const { localStore } = require('../config/supabase');

const JWT_SECRET = process.env.JWT_SECRET || 'rebyte-secret-jwt-key-2026';

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token missing or invalid'
    });
  }

  const token = authHeader.split(' ')[1];

  // Demo bypass tokens for quick testing and UI role switching
  if (token === 'admin-mock-token') {
    const adminUser = localStore.users.find(u => u.role === 'admin') || {
      id: 'usr-admin-01',
      email: 'admin@viva.edu.in',
      role: 'admin',
      name: 'Prof. K. Venkatesh (Lab In-Charge)'
    };
    req.user = adminUser;
    return next();
  }

  if (token === 'student-mock-token') {
    const studentUser = localStore.users.find(u => u.email === 'anushka.ece@viva.edu.in') || {
      id: 'usr-student-01',
      email: 'anushka.ece@viva.edu.in',
      role: 'student',
      name: 'Anushka Sharma'
    };
    req.user = studentUser;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = localStore.users.find(u => u.id === decoded.id || u.email === decoded.email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to token no longer exists'
      });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '403 Forbidden: Admin privileges required. Access denied to this resource.'
    });
  }
  next();
}

module.exports = {
  authenticate,
  requireAdmin,
  JWT_SECRET
};
