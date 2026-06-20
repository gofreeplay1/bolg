const express = require('express');
const { getDb } = require('../db');
const { authMiddleware } = require('../auth');

const router = express.Router();

// GET /api/tags - 获取所有标签（公开）
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const rows = await db.all('SELECT * FROM tags ORDER BY post_count DESC, name ASC');
    res.json({ tags: rows });
  } catch (err) {
    console.error('Get tags error:', err);
    res.status(500).json({ error: '获取标签列表失败' });
  }
});

// POST /api/tags/sync - 从现有文章标签同步（需认证）
// 注意：此路由必须在 GET /:slug 之前定义，避免被通配符路由拦截
router.post('/sync', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    const posts = await db.all('SELECT tags FROM posts');
    const tagMap = new Map();

    posts.forEach(post => {
      try {
        const tags = typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags;
        if (Array.isArray(tags)) {
          tags.forEach(tag => {
            if (tag && tag.trim()) {
              const slug = tag
                .toLowerCase()
                .replace(/[^\w\u4e00-\u9fff]+/g, '-')
                .replace(/^-+|-+$/g, '');
              if (slug) {
                tagMap.set(slug, { name: tag.trim(), count: (tagMap.get(slug)?.count || 0) + 1 });
              }
            }
          });
        }
      } catch {}
    });

    let created = 0;
    let updated = 0;
    for (const [slug, { name, count }] of tagMap) {
      try {
        const existing = await db.get('SELECT id FROM tags WHERE slug = ?', [slug]);
        if (existing) {
          await db.run('UPDATE tags SET post_count = ?, updated_at = datetime(\'now\') WHERE slug = ?', [count, slug]);
          updated++;
        } else {
          await db.run(
            'INSERT INTO tags (name, slug, description, color, post_count) VALUES (?, ?, ?, ?, ?)',
            [name, slug, '', '#2563EB', count]
          );
          created++;
        }
      } catch (innerErr) {
        // 如果单个标签同步失败（如 UNIQUE 约束冲突），跳过并继续
        console.error(`Sync tag "${slug}" error:`, innerErr.message);
      }
    }

    res.json({ message: `同步完成，新增 ${created} 个标签，更新 ${updated} 个标签`, created, updated });
  } catch (err) {
    console.error('Sync tags error:', err);
    res.status(500).json({ error: '同步标签失败: ' + err.message });
  }
});

// GET /api/tags/:slug - 获取单个标签（公开）
router.get('/:slug', async (req, res) => {
  try {
    const db = getDb();
    const row = await db.get('SELECT * FROM tags WHERE slug = ?', [req.params.slug]);
    if (!row) {
      return res.status(404).json({ error: '标签不存在' });
    }
    res.json({ tag: row });
  } catch (err) {
    console.error('Get tag error:', err);
    res.status(500).json({ error: '获取标签失败' });
  }
});

// POST /api/tags - 创建标签（需认证）
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, color } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: '标签名称为必填项' });
    }

    // 生成 slug
    const slug = name
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fff]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);

    if (!slug) {
      return res.status(400).json({ error: '标签名称无效，无法生成 slug' });
    }

    const db = getDb();

    const existing = await db.get('SELECT id FROM tags WHERE slug = ?', [slug]);
    if (existing) {
      return res.status(400).json({ error: '该标签已存在' });
    }

    const result = await db.run(
      'INSERT INTO tags (name, slug, description, color) VALUES (?, ?, ?, ?)',
      [name.trim(), slug, description || '', color || '#2563EB']
    );

    const tag = await db.get('SELECT * FROM tags WHERE id = ?', [result.lastID]);
    res.status(201).json({ tag });
  } catch (err) {
    console.error('Create tag error:', err);
    res.status(500).json({ error: '创建标签失败' });
  }
});

// PUT /api/tags/:slug - 更新标签（需认证）
router.put('/:slug', authMiddleware, async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const db = getDb();

    const existing = await db.get('SELECT * FROM tags WHERE slug = ?', [req.params.slug]);
    if (!existing) {
      return res.status(404).json({ error: '标签不存在' });
    }

    const newName = name || existing.name;
    const newSlug = name
      ? name
          .toLowerCase()
          .replace(/[^\w\u4e00-\u9fff]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .substring(0, 50)
      : existing.slug;

    // 如果 slug 变了，检查冲突
    if (newSlug !== existing.slug) {
      const conflict = await db.get('SELECT id FROM tags WHERE slug = ? AND id != ?', [newSlug, existing.id]);
      if (conflict) {
        return res.status(400).json({ error: '新标签名称与已有标签冲突' });
      }
    }

    await db.run(
      'UPDATE tags SET name = ?, slug = ?, description = ?, color = ?, updated_at = datetime(\'now\') WHERE id = ?',
      [newName, newSlug, description !== undefined ? description : existing.description, color || existing.color, existing.id]
    );

    const updated = await db.get('SELECT * FROM tags WHERE id = ?', [existing.id]);
    res.json({ tag: updated });
  } catch (err) {
    console.error('Update tag error:', err);
    res.status(500).json({ error: '更新标签失败' });
  }
});

// DELETE /api/tags/:slug - 删除标签（需认证）
router.delete('/:slug', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    const result = await db.run('DELETE FROM tags WHERE slug = ?', [req.params.slug]);
    if (result.changes === 0) {
      return res.status(404).json({ error: '标签不存在或已被删除' });
    }
    res.json({ message: '标签已删除' });
  } catch (err) {
    console.error('Delete tag error:', err);
    res.status(500).json({ error: '删除标签失败' });
  }
});

module.exports = router;
