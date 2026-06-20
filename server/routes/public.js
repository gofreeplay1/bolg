const express = require('express');
const { getDb } = require('../db');

const router = express.Router();

// GET /api/public/posts - 公开文章列表（不需要认证，仅返回摘要）
router.get('/posts', async (req, res) => {
  try {
    const db = getDb();
    const rows = await db.all(
      'SELECT slug, title, description, tags, post_date, reading_time FROM posts ORDER BY post_date DESC'
    );
    const posts = rows.map(formatMeta);
    res.json({ posts });
  } catch (err) {
    console.error('Get public posts error:', err);
    res.status(500).json({ error: '获取文章列表失败' });
  }
});

// GET /api/public/posts/:slug - 公开单篇文章（不需要认证）
router.get('/posts/:slug', async (req, res) => {
  try {
    const db = getDb();
    const row = await db.get('SELECT * FROM posts WHERE slug = ?', [req.params.slug]);
    if (!row) {
      return res.status(404).json({ error: '文章不存在' });
    }
    res.json({ post: formatFull(row) });
  } catch (err) {
    console.error('Get public post error:', err);
    res.status(500).json({ error: '获取文章失败' });
  }
});

// GET /api/public/tags - 获取所有标签
router.get('/tags', async (req, res) => {
  try {
    const db = getDb();
    const rows = await db.all('SELECT tags FROM posts');
    const tagSet = new Set();
    rows.forEach(row => {
      const tags = typeof row.tags === 'string' ? JSON.parse(row.tags) : (row.tags || []);
      tags.forEach(t => tagSet.add(t));
    });
    res.json({ tags: Array.from(tagSet).sort() });
  } catch (err) {
    console.error('Get tags error:', err);
    res.status(500).json({ error: '获取标签失败' });
  }
});

// GET /api/public/tags/:tag - 按标签获取文章
router.get('/tags/:tag', async (req, res) => {
  try {
    const db = getDb();
    const rows = await db.all(
      'SELECT slug, title, description, tags, post_date, reading_time FROM posts ORDER BY post_date DESC'
    );
    const posts = rows
      .map(formatMeta)
      .filter(p => p.tags.includes(req.params.tag));
    res.json({ posts });
  } catch (err) {
    console.error('Get posts by tag error:', err);
    res.status(500).json({ error: '获取文章失败' });
  }
});

function formatMeta(row) {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    date: row.post_date,
    tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : (row.tags || []),
    readingTime: row.reading_time,
  };
}

function formatFull(row) {
  return {
    ...formatMeta(row),
    content: row.content,
  };
}

module.exports = router;
