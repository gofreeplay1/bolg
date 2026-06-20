require('dotenv').config();

let db = null;
let dbType = 'unknown';

// ---------- MySQL 连接 ----------
async function initMySQL() {
  const mysql = require('mysql2/promise');
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'blog_admin',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 3000,
  });

  // 测试连接
  const conn = await pool.getConnection();
  await conn.ping();
  conn.release();

  // 创建表
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(100) NOT NULL UNIQUE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      content LONGTEXT,
      tags JSON,
      post_date DATE NOT NULL,
      reading_time INT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_slug (slug),
      INDEX idx_post_date (post_date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS site_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      setting_key VARCHAR(100) NOT NULL UNIQUE,
      setting_value LONGTEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_setting_key (setting_key)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS custom_pages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(100) NOT NULL UNIQUE,
      title VARCHAR(255) NOT NULL,
      content LONGTEXT,
      is_published TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_page_slug (slug)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS comments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      post_slug VARCHAR(100) NOT NULL,
      author VARCHAR(100) NOT NULL,
      content TEXT NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_comments_post (post_slug),
      INDEX idx_comments_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS friend_links (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      url VARCHAR(500) NOT NULL,
      description VARCHAR(255) DEFAULT '',
      sort_order INT DEFAULT 0,
      is_visible TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS tags (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(50) NOT NULL UNIQUE,
      slug VARCHAR(50) NOT NULL UNIQUE,
      description VARCHAR(255) DEFAULT '',
      color VARCHAR(7) DEFAULT '#2563EB',
      post_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_tag_slug (slug)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS visitor_stats (
      id INT AUTO_INCREMENT PRIMARY KEY,
      visit_date DATE NOT NULL UNIQUE,
      visit_count INT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_visit_date (visit_date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  console.log('✅ 已连接 MySQL 数据库');

  return {
    type: 'mysql',
    pool,

    async execute(sql, params = []) {
      const [rows] = await pool.execute(sql, params);
      return rows;
    },

    async run(sql, params = []) {
      const [result] = await pool.execute(sql, params);
      return { lastID: result.insertId, changes: result.affectedRows };
    },

    async all(sql, params = []) {
      const [rows] = await pool.execute(sql, params);
      return rows;
    },

    async get(sql, params = []) {
      const [rows] = await pool.execute(sql, params);
      return rows[0] || null;
    },

    async close() {
      await pool.end();
    },
  };
}

// ---------- SQLite 连接 (回退) ----------
async function initSQLite() {
  const initSqlJs = require('sql.js');
  const path = require('path');
  const fs = require('fs');

  const SQL = await initSqlJs();
  const dbPath = path.join(__dirname, 'blog.db');

  // 如果已有数据库文件则加载，否则创建
  let sqlite;
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    sqlite = new SQL.Database(buffer);
  } else {
    sqlite = new SQL.Database();
  }

  // 创建表
  sqlite.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  sqlite.run(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT,
      content TEXT,
      tags TEXT,
      post_date TEXT NOT NULL,
      reading_time INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  sqlite.run('CREATE INDEX IF NOT EXISTS idx_slug ON posts(slug)');
  sqlite.run('CREATE INDEX IF NOT EXISTS idx_post_date ON posts(post_date)');

  sqlite.run(`
    CREATE TABLE IF NOT EXISTS site_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      setting_key TEXT NOT NULL UNIQUE,
      setting_value TEXT,
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  sqlite.run(`
    CREATE TABLE IF NOT EXISTS custom_pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      content TEXT,
      is_published INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  sqlite.run('CREATE INDEX IF NOT EXISTS idx_page_slug ON custom_pages(slug)');

  sqlite.run(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_slug TEXT NOT NULL,
      author TEXT NOT NULL,
      content TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  sqlite.run('CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_slug)');
  sqlite.run('CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status)');

  sqlite.run(`
    CREATE TABLE IF NOT EXISTS friend_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      description TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      is_visible INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  sqlite.run(`
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      description TEXT DEFAULT '',
      color TEXT DEFAULT '#2563EB',
      post_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  sqlite.run(`
    CREATE TABLE IF NOT EXISTS visitor_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      visit_date TEXT NOT NULL UNIQUE,
      visit_count INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);
  sqlite.run('CREATE INDEX IF NOT EXISTS idx_visit_date ON visitor_stats(visit_date)');

  // 定期保存到文件
  function saveToDisk() {
    const data = sqlite.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }

  // 每 30 秒自动保存
  setInterval(saveToDisk, 30000);

  console.log('✅ 已连接 SQLite 数据库（本地文件模式）');

  return {
    type: 'sqlite',
    sqlite,

    execute(sql, params = []) {
      sqlite.run(sql, params);
      saveToDisk();
      return [];
    },

    async run(sql, params = []) {
      sqlite.run(sql, params);
      // 立即获取 lastID，必须在 getRowsModified/saveToDisk 之前
      const result = sqlite.exec("SELECT last_insert_rowid() as id");
      const lastID = result[0]?.values?.[0]?.[0] || 0;
      const changes = sqlite.getRowsModified();
      saveToDisk();
      return { lastID, changes };
    },

    async all(sql, params = []) {
      const stmt = sqlite.prepare(sql);
      if (params.length > 0) stmt.bind(params);
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      return rows;
    },

    async get(sql, params = []) {
      const stmt = sqlite.prepare(sql);
      if (params.length > 0) stmt.bind(params);
      let row = null;
      if (stmt.step()) {
        row = stmt.getAsObject();
      }
      stmt.free();
      return row;
    },

    async close() {
      saveToDisk();
      sqlite.close();
    },
  };
}

// ---------- 初始化 ----------
async function initDatabase() {
  // 优先尝试 MySQL
  if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD) {
    try {
      db = await initMySQL();
      dbType = 'mysql';
      return db;
    } catch (err) {
      console.log(`⚠️  MySQL 连接失败 (${err.message})，回退到 SQLite`);
    }
  }

  // 回退到 SQLite
  try {
    db = await initSQLite();
    dbType = 'sqlite';
    console.log('💡 提示: 设置 .env 中的 MySQL 配置可切换到 MySQL 数据库');
    return db;
  } catch (err) {
    console.error('❌ 数据库初始化失败:', err);
    throw err;
  }
}

function getDb() {
  if (!db) throw new Error('数据库未初始化，请先调用 initDatabase()');
  return db;
}

function getDbType() {
  return dbType;
}

module.exports = { initDatabase, getDb, getDbType };
