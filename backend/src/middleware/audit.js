const { getDb } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const auditLog = (action, resource) => (req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = (data) => {
    if (res.statusCode < 400) {
      try {
        const db = getDb();
        db.prepare(`INSERT INTO audit_logs (id,user_id,action,resource,resource_id,details,ip) VALUES (?,?,?,?,?,?,?)`)
          .run(uuidv4(), req.user?.id || null, action, resource,
            req.params?.id || null,
            JSON.stringify({ body: req.body }),
            req.ip || '127.0.0.1');
      } catch (e) { /* silent */ }
    }
    return originalJson(data);
  };
  next();
};

module.exports = { auditLog };
