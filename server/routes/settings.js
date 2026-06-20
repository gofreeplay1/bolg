const express = require('express');
const { getDb } = require('../db');
const { authMiddleware } = require('../auth');

const router = express.Router();

// ========== Site Settings (Header/Footer config) ==========

// GET /api/settings - 获取所有网站设置
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const rows = await db.all('SELECT setting_key, setting_value FROM site_settings');
    const settings = {};
    rows.forEach(row => {
      try {
        settings[row.setting_key] = JSON.parse(row.setting_value);
      } catch {
        settings[row.setting_key] = row.setting_value;
      }
    });
    res.json({ settings });
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ error: '获取设置失败' });
  }
});

// PUT /api/settings/:key - 更新单个设置（需认证）
router.put('/:key', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    const { key } = req.params;
    const value = JSON.stringify(req.body);

    // Upsert
    const existing = await db.get('SELECT id FROM site_settings WHERE setting_key = ?', [key]);
    if (existing) {
      await db.run('UPDATE site_settings SET setting_value = ? WHERE setting_key = ?', [value, key]);
    } else {
      await db.run('INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)', [key, value]);
    }

    res.json({ message: '设置已更新', key });
  } catch (err) {
    console.error('Update setting error:', err);
    res.status(500).json({ error: '更新设置失败' });
  }
});

// ========== Custom Pages CRUD (需认证) ==========

// GET /api/settings/pages - 获取所有自定义页面列表
router.get('/pages', async (req, res) => {
  try {
    const db = getDb();
    const rows = await db.all(
      'SELECT id, slug, title, is_published, created_at, updated_at FROM custom_pages ORDER BY created_at DESC'
    );
    res.json({ pages: rows });
  } catch (err) {
    console.error('Get pages error:', err);
    res.status(500).json({ error: '获取页面列表失败' });
  }
});

// GET /api/settings/pages/:slug - 获取单个页面详情（公开）
// 注意：slug 可能包含特殊字符，Express 的 :slug 默认不匹配 /，但前端已 encodeURIComponent
router.get('/pages/:slug', async (req, res) => {
  try {
    const db = getDb();
    const slug = decodeURIComponent(req.params.slug);
    const row = await db.get(
      'SELECT * FROM custom_pages WHERE slug = ? AND is_published = 1',
      [slug]
    );
    if (!row) {
      return res.status(404).json({ error: '页面不存在' });
    }
    res.json({ page: row });
  } catch (err) {
    console.error('Get page error:', err);
    res.status(500).json({ error: '获取页面失败' });
  }
});

// POST /api/settings/pages - 创建自定义页面（需认证）
router.post('/pages', authMiddleware, async (req, res) => {
  try {
    const { slug, title, content, is_published } = req.body;

    if (!slug || !title) {
      return res.status(400).json({ error: 'slug 和标题为必填项' });
    }

    const db = getDb();

    const existing = await db.get('SELECT id FROM custom_pages WHERE slug = ?', [slug]);
    if (existing) {
      return res.status(400).json({ error: '该页面 Slug 已存在' });
    }

    const result = await db.run(
      'INSERT INTO custom_pages (slug, title, content, is_published) VALUES (?, ?, ?, ?)',
      [slug, title, content || '', is_published !== undefined ? is_published : 1]
    );

    const newPage = await db.get('SELECT * FROM custom_pages WHERE id = ?', [result.lastID]);

    // 如果查询不到（lastID 可能有问题），用 slug 再查一次
    if (!newPage) {
      const fallback = await db.get('SELECT * FROM custom_pages WHERE slug = ?', [slug]);
      if (fallback) {
        return res.status(201).json({ page: fallback });
      }
      return res.status(201).json({
        page: { slug, title, content: content || '', is_published: is_published !== undefined ? is_published : 1 }
      });
    }

    res.status(201).json({ page: newPage });
  } catch (err) {
    console.error('Create page error:', err);
    res.status(500).json({ error: '创建页面失败' });
  }
});

// PUT /api/settings/pages/:slug - 更新自定义页面（需认证）
router.put('/pages/:slug', authMiddleware, async (req, res) => {
  try {
    const { title, content, is_published, newSlug } = req.body;
    const oldSlug = decodeURIComponent(req.params.slug);
    const db = getDb();

    if (newSlug && newSlug !== oldSlug) {
      const existing = await db.get('SELECT id FROM custom_pages WHERE slug = ?', [newSlug]);
      if (existing) {
        return res.status(400).json({ error: '新 Slug 已存在' });
      }
    }

    const slug = newSlug || oldSlug;

    await db.run(
      'UPDATE custom_pages SET slug = ?, title = ?, content = ?, is_published = ?, updated_at = datetime(\'now\') WHERE slug = ?',
      [slug, title, content, is_published !== undefined ? is_published : 1, oldSlug]
    );

    const updated = await db.get('SELECT * FROM custom_pages WHERE slug = ?', [slug]);
    if (!updated) {
      return res.status(404).json({ error: '页面不存在' });
    }

    res.json({ page: updated });
  } catch (err) {
    console.error('Update page error:', err);
    res.status(500).json({ error: '更新页面失败' });
  }
});

// DELETE /api/settings/pages/:slug - 删除自定义页面（需认证）
// 注意：slug 可能包含 / 等特殊字符，前端使用 encodeURIComponent 编码
router.delete('/pages/:slug', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    const slug = decodeURIComponent(req.params.slug);
    const result = await db.run('DELETE FROM custom_pages WHERE slug = ?', [slug]);
    if (result.changes === 0) {
      return res.status(404).json({ error: '页面不存在或已被删除' });
    }
    res.json({ message: '页面已删除' });
  } catch (err) {
    console.error('Delete page error:', err);
    res.status(500).json({ error: '删除页面失败' });
  }
});

module.exports = router;
