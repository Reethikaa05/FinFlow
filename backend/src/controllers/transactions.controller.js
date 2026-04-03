const { getDb } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const getAll = (req, res) => {
  try {
    const db = getDb();
    const { type, category, startDate, endDate, search, page = 1, limit = 20, sortBy = 'date', sortOrder = 'desc' } = req.query;
    let where = ['t.is_deleted=0'];
    let params = [];

    // Viewers/analysts see own; admins see all (or filtered)
    if (req.user.role !== 'admin') {
      where.push('t.user_id=?');
      params.push(req.user.id);
    } else if (req.query.userId) {
      where.push('t.user_id=?');
      params.push(req.query.userId);
    }

    if (type) { where.push('t.type=?'); params.push(type); }
    if (category) { where.push('t.category=?'); params.push(category); }
    if (startDate) { where.push('t.date>=?'); params.push(startDate); }
    if (endDate) { where.push('t.date<=?'); params.push(endDate); }
    if (search) { where.push('(t.description LIKE ? OR t.category LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }

    const allowedSort = ['date', 'amount', 'category', 'created_at'];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : 'date';
    const safeOrder = sortOrder === 'asc' ? 'ASC' : 'DESC';
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const total = db.prepare(`SELECT COUNT(*) as count FROM transactions t WHERE ${where.join(' AND ')}`).get(...params).count;

    const rows = db.prepare(`
      SELECT t.*, u.name as user_name, u.email as user_email, u.avatar as user_avatar
      FROM transactions t
      LEFT JOIN users u ON t.user_id=u.id
      WHERE ${where.join(' AND ')}
      ORDER BY t.${safeSort} ${safeOrder}
      LIMIT ? OFFSET ?
    `).all(...params, parseInt(limit), offset);

    res.json({
      success: true,
      data: {
        transactions: rows,
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
    const tx = db.prepare(`
      SELECT t.*, u.name as user_name FROM transactions t
      LEFT JOIN users u ON t.user_id=u.id
      WHERE t.id=? AND t.is_deleted=0
    `).get(req.params.id);

    if (!tx) return res.status(404).json({ success: false, error: 'Transaction not found' });
    if (req.user.role === 'viewer' && tx.user_id !== req.user.id)
      return res.status(403).json({ success: false, error: 'Access denied' });

    res.json({ success: true, data: { transaction: tx } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const create = (req, res) => {
  try {
    const db = getDb();
    const { amount, type, category, description, date, tags = [] } = req.body;
    const id = uuidv4();
    const finalAmount = type === 'expense' ? -Math.abs(amount) : Math.abs(amount);

    db.prepare(`INSERT INTO transactions (id,user_id,amount,type,category,description,date,tags) VALUES (?,?,?,?,?,?,?,?)`)
      .run(id, req.user.id, finalAmount, type, category, description || '', date, JSON.stringify(tags));

    // Create notification for the user
    db.prepare(`INSERT INTO notifications (id,user_id,title,message,type) VALUES (?,?,?,?,?)`)
      .run(uuidv4(), req.user.id,
        `${type === 'income' ? '💰 Income' : '💸 Expense'} Recorded`,
        `${category} - ₹${Math.abs(finalAmount).toLocaleString()} on ${date}`,
        type === 'income' ? 'success' : 'info');

    const tx = db.prepare('SELECT * FROM transactions WHERE id=?').get(id);
    res.status(201).json({ success: true, message: 'Transaction created', data: { transaction: tx } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const update = (req, res) => {
  try {
    const db = getDb();
    const tx = db.prepare('SELECT * FROM transactions WHERE id=? AND is_deleted=0').get(req.params.id);
    if (!tx) return res.status(404).json({ success: false, error: 'Transaction not found' });
    if (req.user.role !== 'admin' && tx.user_id !== req.user.id)
      return res.status(403).json({ success: false, error: 'Cannot edit others transactions' });

    const { amount, type, category, description, date, tags } = req.body;
    const updates = [];
    const params = [];

    if (amount !== undefined) { updates.push('amount=?'); params.push(type === 'expense' ? -Math.abs(amount) : Math.abs(amount)); }
    if (type) { updates.push('type=?'); params.push(type); }
    if (category) { updates.push('category=?'); params.push(category); }
    if (description !== undefined) { updates.push('description=?'); params.push(description); }
    if (date) { updates.push('date=?'); params.push(date); }
    if (tags) { updates.push('tags=?'); params.push(JSON.stringify(tags)); }
    updates.push("updated_at=datetime('now')");
    params.push(req.params.id);

    db.prepare(`UPDATE transactions SET ${updates.join(',')} WHERE id=?`).run(...params);
    const updated = db.prepare('SELECT * FROM transactions WHERE id=?').get(req.params.id);
    res.json({ success: true, message: 'Transaction updated', data: { transaction: updated } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const remove = (req, res) => {
  try {
    const db = getDb();
    const tx = db.prepare('SELECT * FROM transactions WHERE id=? AND is_deleted=0').get(req.params.id);
    if (!tx) return res.status(404).json({ success: false, error: 'Transaction not found' });
    if (req.user.role !== 'admin' && tx.user_id !== req.user.id)
      return res.status(403).json({ success: false, error: 'Access denied' });

    // Soft delete
    db.prepare("UPDATE transactions SET is_deleted=1, updated_at=datetime('now') WHERE id=?").run(req.params.id);
    res.json({ success: true, message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { getAll, getOne, create, update, remove };
