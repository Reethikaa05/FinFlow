const { getDb } = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const getAll = (req, res) => {
  try {
    const db = getDb();
    const { role, status, search, page = 1, limit = 20 } = req.query;
    let where = [];
    let params = [];

    if (role) { where.push('role=?'); params.push(role); }
    if (status) { where.push('status=?'); params.push(status); }
    if (search) { where.push('(name LIKE ? OR email LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }

    const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const total = db.prepare(`SELECT COUNT(*) as count FROM users ${whereSQL}`).get(...params).count;

    const users = db.prepare(`
      SELECT id,name,email,role,status,avatar,created_at,updated_at FROM users ${whereSQL}
      ORDER BY created_at DESC LIMIT ? OFFSET ?
    `).all(...params, parseInt(limit), offset);

    res.json({
      success: true,
      data: {
        users,
        pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getOne = (req, res) => {
  try {
    const db = getDb();
    const user = db.prepare('SELECT id,name,email,role,status,avatar,created_at FROM users WHERE id=?').get(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: { user } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const update = (req, res) => {
  try {
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE id=?').get(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    // Prevent self-demotion for admin
    if (req.params.id === req.user.id && req.body.role && req.body.role !== 'admin') {
      return res.status(400).json({ success: false, error: 'Admins cannot change their own role' });
    }

    const { name, role, status, avatar } = req.body;
    const updates = [];
    const params = [];
    if (name) { updates.push('name=?'); params.push(name); }
    if (role) { updates.push('role=?'); params.push(role); }
    if (status) { updates.push('status=?'); params.push(status); }
    if (avatar) { updates.push('avatar=?'); params.push(avatar); }
    if (!updates.length) return res.status(400).json({ success: false, error: 'Nothing to update' });
    updates.push("updated_at=datetime('now')");
    params.push(req.params.id);

    db.prepare(`UPDATE users SET ${updates.join(',')} WHERE id=?`).run(...params);

    if (status) {
      db.prepare(`INSERT INTO notifications (id,user_id,title,message,type) VALUES (?,?,?,?,?)`)
        .run(uuidv4(), req.params.id,
          status === 'active' ? 'Account Activated' : 'Account Deactivated',
          status === 'active' ? 'Your account has been activated.' : 'Your account has been deactivated.',
          status === 'active' ? 'success' : 'warning');
    }

    const updated = db.prepare('SELECT id,name,email,role,status,avatar,created_at FROM users WHERE id=?').get(req.params.id);
    res.json({ success: true, message: 'User updated', data: { user: updated } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const remove = (req, res) => {
  try {
    const db = getDb();
    if (req.params.id === req.user.id)
      return res.status(400).json({ success: false, error: 'Cannot delete your own account' });
    const user = db.prepare('SELECT * FROM users WHERE id=?').get(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    db.prepare('DELETE FROM users WHERE id=?').run(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getStats = (req, res) => {
  try {
    const db = getDb();
    const stats = db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN role='admin' THEN 1 ELSE 0 END) as admins,
        SUM(CASE WHEN role='analyst' THEN 1 ELSE 0 END) as analysts,
        SUM(CASE WHEN role='viewer' THEN 1 ELSE 0 END) as viewers,
        SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status='inactive' THEN 1 ELSE 0 END) as inactive
      FROM users
    `).get();
    res.json({ success: true, data: { stats } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { getAll, getOne, update, remove, getStats };
