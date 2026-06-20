const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDatabase } = require('./db');
const { seed } = require('./seed');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const publicRoutes = require('./routes/public');
const settingsRoutes = require('./routes/settings');
const commentsRoutes = require('./routes/comments');
const friendLinksRoutes = require('./routes/friendLinks');
const tagsRoutes = require('./routes/tags');
const uploadRoutes = require('./routes/upload');
const visitorRoutes = require('./routes/visitor');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 静态文件服务 - 提供上传文件访问
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/friend-links', friendLinksRoutes);
app.use('/api/tags', tagsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/visitor', visitorRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 启动服务器
async function start() {
  try {
    // 初始化数据库表
    await initDatabase();

    // 插入种子数据
    await seed();

    app.listen(PORT, () => {
      console.log(`\n🚀 Blog Admin API 服务器已启动`);
      console.log(`📡 地址: http://localhost:${PORT}`);
      console.log(`📋 API 文档:`);
      console.log(`   POST /api/auth/login     - 登录`);
      console.log(`   GET  /api/auth/me         - 获取当前用户`);
      console.log(`   GET  /api/posts           - 文章列表(需认证)`);
      console.log(`   GET  /api/posts/:slug     - 文章详情(需认证)`);
      console.log(`   POST /api/posts           - 创建文章(需认证)`);
      console.log(`   PUT  /api/posts/:slug     - 更新文章(需认证)`);
      console.log(`   DELETE /api/posts/:slug   - 删除文章(需认证)`);
      console.log(`   GET  /api/public/posts    - 公开文章列表`);
      console.log(`   GET  /api/public/posts/:slug - 公开文章详情`);
      console.log(`   GET  /api/public/tags     - 所有标签`);
      console.log(`   GET  /api/public/tags/:tag - 按标签获取文章`);
    });
  } catch (err) {
    console.error('❌ 服务器启动失败:', err);
    process.exit(1);
  }
}

start();
