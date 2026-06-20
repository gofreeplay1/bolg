const express = require('express');
const path = require('path');
const fs = require('fs');
const { authMiddleware } = require('../auth');

const router = express.Router();

// 上传目录
const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads');

// 确保上传目录存在
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// 为图片和附件创建子目录
const IMG_DIR = path.join(UPLOAD_DIR, 'images');
const FILE_DIR = path.join(UPLOAD_DIR, 'files');
const BG_DIR = path.join(UPLOAD_DIR, 'backgrounds');
const LOGO_DIR = path.join(UPLOAD_DIR, 'logos');
if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });
if (!fs.existsSync(FILE_DIR)) fs.mkdirSync(FILE_DIR, { recursive: true });
if (!fs.existsSync(BG_DIR)) fs.mkdirSync(BG_DIR, { recursive: true });
if (!fs.existsSync(LOGO_DIR)) fs.mkdirSync(LOGO_DIR, { recursive: true });

// 生成唯一文件名
function generateFilename(originalName) {
  const ext = path.extname(originalName) || '';
  const base = path.basename(originalName, ext).replace(/[^\w\u4e00-\u9fff-]/g, '-').substring(0, 50);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${base}-${timestamp}-${random}${ext}`;
}

// POST /api/upload/image - 上传图片（base64 或文件）- 需认证
router.post('/image', authMiddleware, async (req, res) => {
  try {
    let imageData, filename, ext;

    // 支持 base64 数据
    if (req.body.data) {
      const matches = req.body.data.match(/^data:(image\/[\w+-]+);base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({ error: '无效的图片数据格式' });
      }
      const mimeType = matches[1];
      // 根据 MIME 类型推断扩展名
      if (mimeType === 'image/png') ext = '.png';
      else if (mimeType === 'image/gif') ext = '.gif';
      else if (mimeType === 'image/webp') ext = '.webp';
      else if (mimeType === 'image/svg+xml') ext = '.svg';
      else if (mimeType === 'image/jpeg') ext = '.jpg';
      else ext = '.png';
      imageData = Buffer.from(matches[2], 'base64');
      filename = generateFilename(req.body.filename || `image${ext}`);
    }
    // 支持直接二进制数据（当客户端用 FormData 发送）
    else if (req.body.buffer && req.body.type) {
      imageData = Buffer.from(req.body.buffer, 'base64');
      ext = path.extname(req.body.filename || 'image.png') || '.png';
      filename = generateFilename(req.body.filename || `image${ext}`);
    } else {
      return res.status(400).json({ error: '未提供图片数据' });
    }

    // 限制文件大小 10MB
    if (imageData.length > 10 * 1024 * 1024) {
      return res.status(400).json({ error: '图片大小不能超过 10MB' });
    }

    const filepath = path.join(IMG_DIR, filename);
    fs.writeFileSync(filepath, imageData);

    const url = `/uploads/images/${filename}`;
    res.json({ url, filename, size: imageData.length });
  } catch (err) {
    console.error('Upload image error:', err);
    res.status(500).json({ error: '上传图片失败' });
  }
});

// POST /api/upload/file - 上传附件 - 需认证
router.post('/file', authMiddleware, async (req, res) => {
  try {
    let fileData, filename;

    if (req.body.data) {
      const matches = req.body.data.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        fileData = Buffer.from(matches[2], 'base64');
      } else {
        fileData = Buffer.from(req.body.data, 'base64');
      }
      filename = generateFilename(req.body.filename || 'file.bin');
    } else if (req.body.buffer) {
      fileData = Buffer.from(req.body.buffer, 'base64');
      filename = generateFilename(req.body.filename || 'file.bin');
    } else {
      return res.status(400).json({ error: '未提供文件数据' });
    }

    // 限制文件大小 50MB
    if (fileData.length > 50 * 1024 * 1024) {
      return res.status(400).json({ error: '文件大小不能超过 50MB' });
    }

    const filepath = path.join(FILE_DIR, filename);
    fs.writeFileSync(filepath, fileData);

    const url = `/uploads/files/${filename}`;
    res.json({
      url,
      filename,
      originalName: req.body.filename || filename,
      size: fileData.length,
    });
  } catch (err) {
    console.error('Upload file error:', err);
    res.status(500).json({ error: '上传文件失败' });
  }
});

// POST /api/upload/site-image - 上传网站图片（Logo、背景图）- 需认证
router.post('/site-image', authMiddleware, async (req, res) => {
  try {
    const { data, filename: originalName, category } = req.body;
    if (!data) {
      return res.status(400).json({ error: '未提供图片数据' });
    }

    let imageData;
    let ext = '.png';
    const matches = data.match(/^data:(image\/[\w+-]+);base64,(.+)$/);
    if (matches) {
      imageData = Buffer.from(matches[2], 'base64');
      // 从 MIME 类型推断扩展名
      const mimeType = matches[1];
      if (mimeType === 'image/png') ext = '.png';
      else if (mimeType === 'image/gif') ext = '.gif';
      else if (mimeType === 'image/webp') ext = '.webp';
      else if (mimeType === 'image/svg+xml') ext = '.svg';
      else if (mimeType === 'image/jpeg') ext = '.jpg';
      else ext = '.png';
    } else {
      // 尝试纯 base64
      imageData = Buffer.from(data, 'base64');
    }

    if (!imageData || imageData.length === 0) {
      return res.status(400).json({ error: '图片数据无效或为空' });
    }

    if (imageData.length > 10 * 1024 * 1024) {
      return res.status(400).json({ error: '图片大小不能超过 10MB' });
    }

    const catDir = category === 'background' ? 'backgrounds' : category === 'logo' ? 'logos' : 'images';
    const dir = path.join(UPLOAD_DIR, catDir);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filename = generateFilename(originalName || `site-image${ext}`);
    const filepath = path.join(dir, filename);
    fs.writeFileSync(filepath, imageData);

    const url = `/uploads/${catDir}/${filename}`;
    res.json({ url, filename, size: imageData.length });
  } catch (err) {
    console.error('Upload site image error:', err);
    res.status(500).json({ error: '上传网站图片失败: ' + err.message });
  }
});

module.exports = router;
