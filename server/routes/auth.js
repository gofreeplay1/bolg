const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../db');
const { generateToken, authMiddleware } = require('../auth');

const router = express.Router();

// POST /api/auth/login - 登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '请输入用户名和密码' });
    }

    const db = getDb();
    const user = await db.get(
      'SELECT id, username, password, role FROM users WHERE username = ?',
      [username]
    );

    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

// GET /api/auth/me - 获取当前用户信息
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const db = getDb();
    const user = await db.get(
      'SELECT id, username, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({ user });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

module.exports = router;
