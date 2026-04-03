const { getDb } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const getAll = (req, res) => {
  try {
    const db = getDb();
    const { unread, page = 1, limit = 20 } = req.query;
    let where = ['user_id=?'];
    let params = [req.user.id];
    if (unread === 'true') { where.push('is_read=0'); }

    const total = db.prepare(`SELECT COUNT(*) as count FROM notifications WHERE ${where.join(' AND ')}`).get(...params).count;
    const unreadCount = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id=? AND is_read=0').get(req.user.id).count;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const notifications = db.prepare(`
      SELECT * FROM notifications WHERE ${where.join(' AND ')}
      ORDER BY created_at DESC LIMIT ? OFFSET ?
    `).all(...params, parseInt(limit), offset);

    res.json({
      success: true,
      data: { notifications, unreadCount, pagination: { total, page: parseInt(page), limit: parseInt(limit) } }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const markRead = (req, res) => {
  try {
    const db = getDb();
    db.prepare('UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
    res.json({ success: true, message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const markAllRead = (req, res) => {
  try {
    const db = getDb();
    db.prepare('UPDATE notifications SET is_read=1 WHERE user_id=?').run(req.user.id);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const deleteOne = (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM notifications WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Admin: broadcast
const broadcast = (req, res) => {
  try {
    const db = getDb();
    const { title, message, type = 'info', targetRole } = req.body;
    let users;
    if (targetRole) {
      users = db.prepare('SELECT id FROM users WHERE role=? AND status=?').all(targetRole, 'active');
    } else {
      users = db.prepare('SELECT id FROM users WHERE status=?').all('active');
    }
    const insert = db.prepare(`INSERT INTO notifications (id,user_id,title,message,type) VALUES (?,?,?,?,?)`);
    const insertMany = db.transaction((us) => us.forEach(u => insert.run(uuidv4(), u.id, title, message, type)));
    insertMany(users);
    res.json({ success: true, message: `Notification sent to ${users.length} users` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { getAll, markRead, markAllRead, deleteOne, broadcast };
