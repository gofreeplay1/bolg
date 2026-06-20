const express = require('express');
const { getDb } = require('../db');
const { authMiddleware } = require('../auth');

const router = express.Router();

// GET /api/friend-links - 获取所有可见的友情链接（公开）
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const rows = await db.all(
      'SELECT * FROM friend_links WHERE is_visible = 1 ORDER BY sort_order ASC, id ASC'
    );
    res.json({ links: rows });
  } catch (err) {
    console.error('Get friend links error:', err);
    res.status(500).json({ error: '获取友情链接失败' });
  }
});

// GET /api/friend-links/admin/all - 获取所有友情链接（管理后台，需认证）
router.get('/admin/all', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    const rows = await db.all('SELECT * FROM friend_links ORDER BY sort_order ASC, id ASC');
    res.json({ links: rows });
  } catch (err) {
    console.error('Get all friend links error:', err);
    res.status(500).json({ error: '获取友情链接列表失败' });
  }
});

// POST /api/friend-links - 创建友情链接（需认证）
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, url, description, sort_order, is_visible } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: '请输入链接名称' });
    }
    if (!url || !url.trim()) {
      return res.status(400).json({ error: '请输入链接地址' });
    }

    const db = getDb();
    const result = await db.run(
      'INSERT INTO friend_links (name, url, description, sort_order, is_visible) VALUES (?, ?, ?, ?, ?)',
      [
        name.trim(),
        url.trim(),
        (description || '').trim(),
        sort_order || 0,
        is_visible !== undefined ? (is_visible ? 1 : 0) : 1,
      ]
    );

    const link = await db.get('SELECT * FROM friend_links WHERE id = ?', [result.lastID]);
    res.status(201).json({ link });
  } catch (err) {
    console.error('Create friend link error:', err);
    res.status(500).json({ error: '创建友情链接失败' });
  }
});

// PUT /api/friend-links/:id - 更新友情链接（需认证）
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, url, description, sort_order, is_visible } = req.body;
    const db = getDb();

    await db.run(
      'UPDATE friend_links SET name = ?, url = ?, description = ?, sort_order = ?, is_visible = ? WHERE id = ?',
      [
        name?.trim() || '',
        url?.trim() || '',
        (description || '').trim(),
        sort_order || 0,
        is_visible !== undefined ? (is_visible ? 1 : 0) : 1,
        req.params.id,
      ]
    );

    const updated = await db.get('SELECT * FROM friend_links WHERE id = ?', [req.params.id]);
    if (!updated) {
      return res.status(404).json({ error: '友情链接不存在' });
    }

    res.json({ link: updated });
  } catch (err) {
    console.error('Update friend link error:', err);
    res.status(500).json({ error: '更新友情链接失败' });
  }
});

// DELETE /api/friend-links/:id - 删除友情链接（需认证）
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    await db.run('DELETE FROM friend_links WHERE id = ?', [req.params.id]);
    res.json({ message: '友情链接已删除' });
  } catch (err) {
    console.error('Delete friend link error:', err);
    res.status(500).json({ error: '删除友情链接失败' });
  }
});

// PUT /api/friend-links/admin/reorder - 批量排序（需认证）
router.put('/admin/reorder', authMiddleware, async (req, res) => {
  try {
    const { ids } = req.body; // 有序的 ID 数组
    if (!Array.isArray(ids)) {
      return res.status(400).json({ error: '请提供 ID 数组' });
    }

    const db = getDb();
    for (let i = 0; i < ids.length; i++) {
      await db.run('UPDATE friend_links SET sort_order = ? WHERE id = ?', [i, ids[i]]);
    }

    res.json({ message: '排序已更新' });
  } catch (err) {
    console.error('Reorder friend links error:', err);
    res.status(500).json({ error: '排序更新失败' });
  }
});

module.exports = router;
