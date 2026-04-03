const jwt = require('jsonwebtoken');
const { getDb } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'finflow-super-secret-jwt-key-2024';
const JWT_EXPIRES = '7d';

const generateToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = getDb();
    const user = db.prepare('SELECT id,name,email,role,status,avatar,created_at FROM users WHERE id=?').get(decoded.id);
    if (!user) return res.status(401).json({ success: false, error: 'User not found' });
    if (user.status === 'inactive') return res.status(403).json({ success: false, error: 'Account is inactive' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Not authenticated' });
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, error: `Access denied. Required role: ${roles.join(' or ')}` });
  }
  next();
};

const requireAdmin = requireRole('admin');
const requireAnalystOrAdmin = requireRole('analyst', 'admin');

module.exports = { authenticate, requireRole, requireAdmin, requireAnalystOrAdmin, generateToken, JWT_SECRET };
