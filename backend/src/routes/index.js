const express = require('express');
const router = express.Router();

const { authenticate, requireAdmin, requireAnalystOrAdmin } = require('../middleware/auth');
const { authValidators, txValidators, userValidators } = require('../middleware/validate');
const { auditLog } = require('../middleware/audit');

const authCtrl = require('../controllers/auth.controller');
const txCtrl = require('../controllers/transactions.controller');
const dashCtrl = require('../controllers/dashboard.controller');
const userCtrl = require('../controllers/users.controller');
const notifCtrl = require('../controllers/notifications.controller');
const catCtrl = require('../controllers/categories.controller');

// ─── AUTH ─────────────────────────────────────────────────────────────
router.post('/auth/register', authValidators.register, authCtrl.register);
router.post('/auth/login', authValidators.login, authCtrl.login);
router.get('/auth/me', authenticate, authCtrl.me);
router.put('/auth/profile', authenticate, authCtrl.updateProfile);
router.put('/auth/password', authenticate, authCtrl.changePassword);

// ─── DASHBOARD ────────────────────────────────────────────────────────
router.get('/dashboard/summary', authenticate, dashCtrl.getSummary);
router.get('/dashboard/analytics', authenticate, requireAnalystOrAdmin, dashCtrl.getAnalytics);

// ─── TRANSACTIONS ─────────────────────────────────────────────────────
router.get('/transactions', authenticate, txCtrl.getAll);
router.get('/transactions/:id', authenticate, txCtrl.getOne);
router.post('/transactions', authenticate, requireAnalystOrAdmin, txValidators.create, auditLog('CREATE', 'transaction'), txCtrl.create);
router.put('/transactions/:id', authenticate, requireAnalystOrAdmin, txValidators.update, auditLog('UPDATE', 'transaction'), txCtrl.update);
router.delete('/transactions/:id', authenticate, requireAdmin, auditLog('DELETE', 'transaction'), txCtrl.remove);

// ─── USERS (Admin only) ───────────────────────────────────────────────
router.get('/users', authenticate, requireAdmin, userCtrl.getAll);
router.get('/users/stats', authenticate, requireAdmin, userCtrl.getStats);
router.get('/users/:id', authenticate, requireAdmin, userCtrl.getOne);
router.put('/users/:id', authenticate, requireAdmin, userValidators.update, auditLog('UPDATE', 'user'), userCtrl.update);
router.delete('/users/:id', authenticate, requireAdmin, auditLog('DELETE', 'user'), userCtrl.remove);

// ─── NOTIFICATIONS ────────────────────────────────────────────────────
router.get('/notifications', authenticate, notifCtrl.getAll);
router.put('/notifications/read-all', authenticate, notifCtrl.markAllRead);
router.put('/notifications/:id/read', authenticate, notifCtrl.markRead);
router.delete('/notifications/:id', authenticate, notifCtrl.deleteOne);
router.post('/notifications/broadcast', authenticate, requireAdmin, notifCtrl.broadcast);

// ─── CATEGORIES ───────────────────────────────────────────────────────
router.get('/categories', authenticate, catCtrl.getAll);
router.post('/categories', authenticate, requireAdmin, catCtrl.create);
router.delete('/categories/:id', authenticate, requireAdmin, catCtrl.remove);

// ─── AUDIT LOGS (Admin) ───────────────────────────────────────────────
router.get('/audit-logs', authenticate, requireAdmin, (req, res) => {
  const { getDb } = require('../config/database');
  const db = getDb();
  const { page = 1, limit = 50 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const total = db.prepare('SELECT COUNT(*) as count FROM audit_logs').get().count;
  const logs = db.prepare(`
    SELECT a.*, u.name as user_name, u.email as user_email
    FROM audit_logs a LEFT JOIN users u ON a.user_id=u.id
    ORDER BY a.created_at DESC LIMIT ? OFFSET ?
  `).all(parseInt(limit), offset);
  res.json({ success: true, data: { logs, pagination: { total, page: parseInt(page), limit: parseInt(limit) } } });
});

module.exports = router;
