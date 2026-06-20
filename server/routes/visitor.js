const express = require('express');
const { getDb } = require('../db');

const router = express.Router();

// GET /api/visitor/total - 获取累计访客总数
router.get('/total', async (req, res) => {
  try {
    const db = getDb();
    const row = await db.get('SELECT SUM(visit_count) as total FROM visitor_stats');
    res.json({ total: row?.total || 0 });
  } catch (err) {
    console.error('Get visitor total error:', err);
    res.status(500).json({ error: '获取访客统计失败' });
  }
});

// POST /api/visitor/record - 记录一次访问（去重：同一 IP 同一天只记一次）
router.post('/record', async (req, res) => {
  try {
    const db = getDb();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const existing = await db.get(
      'SELECT id, visit_count FROM visitor_stats WHERE visit_date = ?',
      [today]
    );

    if (existing) {
      await db.run(
        'UPDATE visitor_stats SET visit_count = visit_count + 1, updated_at = datetime(\'now\') WHERE visit_date = ?',
        [today]
      );
    } else {
      await db.run(
        'INSERT INTO visitor_stats (visit_date, visit_count) VALUES (?, 1)',
        [today]
      );
    }

    const row = await db.get('SELECT SUM(visit_count) as total FROM visitor_stats');
    res.json({ total: row?.total || 0, today: existing ? existing.visit_count + 1 : 1 });
  } catch (err) {
    console.error('Record visitor error:', err);
    res.status(500).json({ error: '记录访问失败' });
  }
});

module.exports = router;
