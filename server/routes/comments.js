const express = require('express');
const { getDb } = require('../db');
const { authMiddleware } = require('../auth');

const router = express.Router();

// ========== Public: Submit comment + Get approved comments ==========

// GET /api/comments/:postSlug - 获取某篇文章已审核通过的评论
router.get('/:postSlug', async (req, res) => {
  try {
    const db = getDb();
    const rows = await db.all(
      'SELECT id, post_slug, author, content, status, created_at FROM comments WHERE post_slug = ? AND status = ? ORDER BY created_at ASC',
      [req.params.postSlug, 'approved']
    );
    res.json({ comments: rows });
  } catch (err) {
    console.error('Get comments error:', err);
    res.status(500).json({ error: '获取评论失败' });
  }
});

// POST /api/comments/:postSlug - 提交评论（公开）
router.post('/:postSlug', async (req, res) => {
  try {
    const { author, content } = req.body;
    const postSlug = req.params.postSlug;

    if (!author || !author.trim()) {
      return res.status(400).json({ error: '请输入昵称' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ error: '请输入评论内容' });
    }
    if (content.trim().length > 2000) {
      return res.status(400).json({ error: '评论内容不能超过2000字' });
    }

    const db = getDb();

    // 验证文章是否存在
    const post = await db.get('SELECT id FROM posts WHERE slug = ?', [postSlug]);
    if (!post) {
      return res.status(404).json({ error: '文章不存在' });
    }

    const result = await db.run(
      'INSERT INTO comments (post_slug, author, content, status) VALUES (?, ?, ?, ?)',
      [postSlug, author.trim(), content.trim(), 'pending']
    );

    const comment = await db.get('SELECT * FROM comments WHERE id = ?', [result.lastID]);
    res.status(201).json({ comment, message: '评论已提交，等待审核' });
  } catch (err) {
    console.error('Create comment error:', err);
    res.status(500).json({ error: '提交评论失败' });
  }
});

// ========== Admin: Comment Management (需认证) ==========

// GET /api/comments/admin/all - 获取所有评论（管理后台）
router.get('/admin/all', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    const { status, postSlug } = req.query;

    let sql = 'SELECT * FROM comments';
    const conditions = [];
    const params = [];

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    if (postSlug) {
      conditions.push('post_slug = ?');
      params.push(postSlug);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY created_at DESC';

    const rows = await db.all(sql, params);

    // 获取统计
    const stats = await db.all(
      "SELECT status, COUNT(*) as count FROM comments GROUP BY status"
    );

    res.json({ comments: rows, stats });
  } catch (err) {
    console.error('Get all comments error:', err);
    res.status(500).json({ error: '获取评论列表失败' });
  }
});

// PUT /api/comments/admin/:id - 审核评论（通过/拒绝/删除）
router.put('/admin/:id', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: '无效的状态值' });
    }

    const db = getDb();
    await db.run('UPDATE comments SET status = ? WHERE id = ?', [status, req.params.id]);

    const updated = await db.get('SELECT * FROM comments WHERE id = ?', [req.params.id]);
    if (!updated) {
      return res.status(404).json({ error: '评论不存在' });
    }

    res.json({ comment: updated, message: status === 'approved' ? '评论已通过' : '评论已拒绝' });
  } catch (err) {
    console.error('Update comment error:', err);
    res.status(500).json({ error: '审核评论失败' });
  }
});

// DELETE /api/comments/admin/:id - 删除评论
router.delete('/admin/:id', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    await db.run('DELETE FROM comments WHERE id = ?', [req.params.id]);
    res.json({ message: '评论已删除' });
  } catch (err) {
    console.error('Delete comment error:', err);
    res.status(500).json({ error: '删除评论失败' });
  }
});

module.exports = router;
