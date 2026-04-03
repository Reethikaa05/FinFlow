const { getDb } = require('../config/database');

const getSummary = (req, res) => {
  try {
    const db = getDb();
    const userId = req.user.role === 'admin' ? null : req.user.id;
    const { startDate, endDate, userId: filterUser } = req.query;

    let userFilter = userId ? 'AND t.user_id=?' : '';
    let params = userId ? [userId] : [];
    if (!userId && filterUser) { userFilter = 'AND t.user_id=?'; params = [filterUser]; }

    const dateFilter = startDate && endDate ? `AND t.date BETWEEN '${startDate}' AND '${endDate}'` : '';

    const totals = db.prepare(`
      SELECT
        COALESCE(SUM(CASE WHEN type='income' THEN ABS(amount) ELSE 0 END),0) as total_income,
        COALESCE(SUM(CASE WHEN type='expense' THEN ABS(amount) ELSE 0 END),0) as total_expenses,
        COALESCE(SUM(CASE WHEN type='income' THEN ABS(amount) ELSE -ABS(amount) END),0) as net_balance,
        COUNT(*) as total_transactions,
        COUNT(CASE WHEN type='income' THEN 1 END) as income_count,
        COUNT(CASE WHEN type='expense' THEN 1 END) as expense_count
      FROM transactions t WHERE is_deleted=0 ${userFilter} ${dateFilter}
    `).get(...params);

    // Category breakdown
    const byCategory = db.prepare(`
      SELECT category, type,
        COUNT(*) as count,
        SUM(ABS(amount)) as total,
        AVG(ABS(amount)) as avg_amount
      FROM transactions t WHERE is_deleted=0 ${userFilter} ${dateFilter}
      GROUP BY category, type ORDER BY total DESC
    `).all(...params);

    // Monthly trend (last 6 months)
    const monthlyTrend = db.prepare(`
      SELECT
        strftime('%Y-%m', date) as month,
        SUM(CASE WHEN type='income' THEN ABS(amount) ELSE 0 END) as income,
        SUM(CASE WHEN type='expense' THEN ABS(amount) ELSE 0 END) as expenses,
        COUNT(*) as count
      FROM transactions t WHERE is_deleted=0 ${userFilter}
        AND date >= date('now', '-6 months')
      GROUP BY strftime('%Y-%m', date) ORDER BY month ASC
    `).all(...params);

    // Recent transactions
    const recent = db.prepare(`
      SELECT t.*, u.name as user_name, u.avatar
      FROM transactions t
      LEFT JOIN users u ON t.user_id=u.id
      WHERE t.is_deleted=0 ${userFilter} ${dateFilter}
      ORDER BY t.created_at DESC LIMIT 10
    `).all(...params);

    // Top spending categories
    const topExpenses = db.prepare(`
      SELECT category, SUM(ABS(amount)) as total, COUNT(*) as count
      FROM transactions t WHERE type='expense' AND is_deleted=0 ${userFilter}
      GROUP BY category ORDER BY total DESC LIMIT 5
    `).all(...params);

    // Weekly spending (last 7 days)
    const weeklySpend = db.prepare(`
      SELECT date, SUM(ABS(amount)) as total, type
      FROM transactions t WHERE is_deleted=0 ${userFilter}
        AND date >= date('now', '-7 days')
      GROUP BY date, type ORDER BY date ASC
    `).all(...params);

    // Savings rate
    const savingsRate = totals.total_income > 0
      ? ((totals.net_balance / totals.total_income) * 100).toFixed(1)
      : '0.0';

    res.json({
      success: true,
      data: {
        summary: { ...totals, savings_rate: parseFloat(savingsRate) },
        categoryBreakdown: byCategory,
        monthlyTrend,
        recentTransactions: recent,
        topExpenses,
        weeklySpend
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getAnalytics = (req, res) => {
  try {
    const db = getDb();
    const userId = req.user.role !== 'admin' ? req.user.id : (req.query.userId || null);
    let userFilter = userId ? 'AND user_id=?' : '';
    let params = userId ? [userId] : [];

    // Month over month comparison
    const mom = db.prepare(`
      SELECT
        strftime('%Y-%m', date) as month,
        type,
        SUM(ABS(amount)) as total
      FROM transactions WHERE is_deleted=0 ${userFilter}
        AND date >= date('now', '-12 months')
      GROUP BY strftime('%Y-%m', date), type
      ORDER BY month
    `).all(...params);

    // Day of week spending pattern
    const dowPattern = db.prepare(`
      SELECT
        CAST(strftime('%w', date) AS INTEGER) as dow,
        type,
        AVG(ABS(amount)) as avg_amount,
        COUNT(*) as count
      FROM transactions WHERE is_deleted=0 ${userFilter}
      GROUP BY dow, type ORDER BY dow
    `).all(...params);

    // Top income sources
    const incomeSources = db.prepare(`
      SELECT category, description, SUM(ABS(amount)) as total, COUNT(*) as count
      FROM transactions WHERE type='income' AND is_deleted=0 ${userFilter}
      GROUP BY category ORDER BY total DESC LIMIT 5
    `).all(...params);

    res.json({
      success: true,
      data: { monthOverMonth: mom, dayOfWeekPattern: dowPattern, incomeSources }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { getSummary, getAnalytics };
