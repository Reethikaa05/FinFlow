const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../config/database');
const { generateToken } = require('../middleware/auth');

const register = async (req, res) => {
  try {
    const db = getDb();
    const { name, email, password, role = 'viewer' } = req.body;
    const existing = db.prepare('SELECT id FROM users WHERE email=?').get(email);
    if (existing) return res.status(409).json({ success: false, error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const id = uuidv4();
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    db.prepare(`INSERT INTO users (id,name,email,password,role,status,avatar) VALUES (?,?,?,?,?,?,?)`)
      .run(id, name, email, hashed, role, 'active', initials);

    // Welcome notification
    db.prepare(`INSERT INTO notifications (id,user_id,title,message,type) VALUES (?,?,?,?,?)`)
      .run(uuidv4(), id, 'Welcome to FinFlow!', `Hi ${name}, your account is ready.`, 'success');

    const user = db.prepare('SELECT id,name,email,role,status,avatar,created_at FROM users WHERE id=?').get(id);
    const token = generateToken({ id, email, role });

    res.status(201).json({ success: true, message: 'Registered successfully', data: { token, user } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const db = getDb();
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email=?').get(email);
    if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    if (user.status === 'inactive') return res.status(403).json({ success: false, error: 'Account is inactive' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    const { password: _, ...safeUser } = user;

    res.json({ success: true, message: 'Login successful', data: { token, user: safeUser } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const me = (req, res) => {
  res.json({ success: true, data: { user: req.user } });
};

const updateProfile = async (req, res) => {
  try {
    const db = getDb();
    const { name, avatar } = req.body;
    const updates = [];
    const params = [];
    if (name) { updates.push('name=?'); params.push(name); }
    if (avatar) { updates.push('avatar=?'); params.push(avatar); }
    if (!updates.length) return res.status(400).json({ success: false, error: 'Nothing to update' });
    updates.push("updated_at=datetime('now')");
    params.push(req.user.id);
    db.prepare(`UPDATE users SET ${updates.join(',')} WHERE id=?`).run(...params);
    const updated = db.prepare('SELECT id,name,email,role,status,avatar,created_at FROM users WHERE id=?').get(req.user.id);
    res.json({ success: true, data: { user: updated } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const db = getDb();
    const { currentPassword, newPassword } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE id=?').get(req.user.id);
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ success: false, error: 'Current password is incorrect' });
    const hashed = await bcrypt.hash(newPassword, 10);
    db.prepare("UPDATE users SET password=?, updated_at=datetime('now') WHERE id=?").run(hashed, req.user.id);
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { register, login, me, updateProfile, changePassword };
