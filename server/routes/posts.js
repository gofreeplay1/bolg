const express = require('express');
const { getDb, getDbType } = require('../db');
const { authMiddleware } = require('../auth');

const router = express.Router();

// 所有文章路由都需要认证
router.use(authMiddleware);

// GET /api/posts - 获取所有文章（管理后台用，含全文）
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const rows = await db.all('SELECT * FROM posts ORDER BY post_date DESC');
    const posts = rows.map(formatPost);
    res.json({ posts });
  } catch (err) {
    console.error('Get posts error:', err);
    res.status(500).json({ error: '获取文章列表失败' });
  }
});

// GET /api/posts/:slug - 获取单篇文章
router.get('/:slug', async (req, res) => {
  try {
    const db = getDb();
    const row = await db.get('SELECT * FROM posts WHERE slug = ?', [req.params.slug]);
    if (!row) {
      return res.status(404).json({ error: '文章不存在' });
    }
    res.json({ post: formatPost(row) });
  } catch (err) {
    console.error('Get post error:', err);
    res.status(500).json({ error: '获取文章失败' });
  }
});

// POST /api/posts - 创建文章
router.post('/', async (req, res) => {
  try {
    const { slug, title, description, content, tags, date, readingTime } = req.body;

    if (!slug || !title || !content) {
      return res.status(400).json({ error: 'slug、标题和内容为必填项' });
    }

    const db = getDb();

    // 检查 slug 是否已存在
    const existing = await db.get('SELECT id FROM posts WHERE slug = ?', [slug]);
    if (existing) {
      return res.status(400).json({ error: '该 Slug 已存在，请更换' });
    }

    const result = await db.run(
      `INSERT INTO posts (slug, title, description, content, tags, post_date, reading_time)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        slug,
        title,
        description || title,
        content,
        JSON.stringify(tags || []),
        date || new Date().toISOString().split('T')[0],
        readingTime || 1,
      ]
    );

    const newPost = await db.get('SELECT * FROM posts WHERE id = ?', [result.lastID]);

    // 如果查询不到（某些数据库 lastID 可能有问题），用 slug 再查一次
    if (!newPost) {
      const fallback = await db.get('SELECT * FROM posts WHERE slug = ?', [slug]);
      if (fallback) {
        return res.status(201).json({ post: formatPost(fallback) });
      }
      // 如果还是查不到，至少返回请求的数据
      return res.status(201).json({
        post: {
          slug, title, description: description || title, content,
          tags: tags || [], date: date || new Date().toISOString().split('T')[0],
          readingTime: readingTime || 1
        }
      });
    }

    res.status(201).json({ post: formatPost(newPost) });
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ error: '创建文章失败' });
  }
});

// PUT /api/posts/:slug - 更新文章
router.put('/:slug', async (req, res) => {
  try {
    const { title, description, content, tags, date, readingTime, newSlug } = req.body;
    const oldSlug = req.params.slug;
    const db = getDb();

    // 如果要修改 slug，检查新 slug 是否已被占用
    if (newSlug && newSlug !== oldSlug) {
      const existing = await db.get('SELECT id FROM posts WHERE slug = ?', [newSlug]);
      if (existing) {
        return res.status(400).json({ error: '新 Slug 已存在，请更换' });
      }
    }

    const slug = newSlug || oldSlug;

    await db.run(
      `UPDATE posts
       SET slug = ?, title = ?, description = ?, content = ?, tags = ?, post_date = ?, reading_time = ?, updated_at = datetime('now')
       WHERE slug = ?`,
      [
        slug,
        title,
        description || title,
        content,
        JSON.stringify(tags || []),
        date,
        readingTime || 1,
        oldSlug,
      ]
    );

    const updatedPost = await db.get('SELECT * FROM posts WHERE slug = ?', [slug]);

    if (!updatedPost) {
      // 更新操作成功但查不到，返回请求数据
      return res.json({
        post: {
          slug, title, description: description || title, content,
          tags: tags || [], date: date || new Date().toISOString().split('T')[0],
          readingTime: readingTime || 1
        }
      });
    }

    res.json({ post: formatPost(updatedPost) });
  } catch (err) {
    console.error('Update post error:', err);
    res.status(500).json({ error: '更新文章失败' });
  }
});

// DELETE /api/posts/:slug - 删除文章
router.delete('/:slug', async (req, res) => {
  try {
    const db = getDb();
    await db.run('DELETE FROM posts WHERE slug = ?', [req.params.slug]);
    res.json({ message: '文章已删除' });
  } catch (err) {
    console.error('Delete post error:', err);
    res.status(500).json({ error: '删除文章失败' });
  }
});

// 格式化数据库记录为前端需要的格式
function formatPost(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    content: row.content,
    tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : (row.tags || []),
    date: row.post_date,
    readingTime: row.reading_time,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

module.exports = router;
