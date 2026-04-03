const { getDb } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const getAll = (req, res) => {
  try {
    const db = getDb();
    const { type } = req.query;
    let where = type ? 'WHERE type=? OR type=\'both\'' : '';
    const params = type ? [type] : [];
    const cats = db.prepare(`SELECT * FROM categories ${where} ORDER BY name`).all(...params);
    res.json({ success: true, data: { categories: cats } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const create = (req, res) => {
  try {
    const db = getDb();
    const { name, type, color = '#6366f1', icon = '💰' } = req.body;
    const existing = db.prepare('SELECT id FROM categories WHERE name=?').get(name);
    if (existing) return res.status(409).json({ success: false, error: 'Category already exists' });
    const id = uuidv4();
    db.prepare('INSERT INTO categories (id,name,type,color,icon) VALUES (?,?,?,?,?)').run(id, name, type, color, icon);
    const cat = db.prepare('SELECT * FROM categories WHERE id=?').get(id);
    res.status(201).json({ success: true, data: { category: cat } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const remove = (req, res) => {
  try {
    const db = getDb();
    const cat = db.prepare('SELECT * FROM categories WHERE id=?').get(req.params.id);
    if (!cat) return res.status(404).json({ success: false, error: 'Category not found' });
    db.prepare('DELETE FROM categories WHERE id=?').run(req.params.id);
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { getAll, create, remove };
