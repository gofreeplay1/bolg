# Blog Admin - 个人技术博客系统

一个功能完整的个人博客系统，前后端分离架构，支持暗色模式、Markdown 写作、评论管理、友链管理等功能。

## ✨ 功能特性

- 📝 **Markdown 写作** - 支持 GFM 语法、代码高亮、目录生成
- 🌓 **暗色模式** - 支持浅色/暗色主题切换，跟随系统偏好
- 🖼️ **网站背景图** - 支持上传自定义背景图，暗色模式自动适配
- 📊 **访客统计** - 累计访客数量统计
- 💬 **评论系统** - 支持评论提交、审核、回复
- 🔗 **友情链接** - 可自定义排序的友链管理
- 📄 **自定义页面** - 支持创建独立页面（关于、归档等）
- 🏷️ **标签管理** - 文章标签分类与颜色自定义
- 📋 **版权声明** - 文章底部自定义版权信息，支持变量替换
- 💰 **赞赏功能** - 悬浮赞赏按钮，支持二维码展示
- 🔗 **外链跳转** - 外部链接安全跳转提示
- 📥 **文件下载** - 附件下载确认页面
- 📱 **响应式设计** - 完美适配桌面端和移动端

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| **前端** | React 19 + TypeScript + Vite + Tailwind CSS |
| **后端** | Node.js + Express 5 |
| **数据库** | MySQL 8 / SQLite（双模式，自动切换） |
| **认证** | JWT (JSON Web Token) |
| **Markdown** | react-markdown + remark-gfm + rehype-highlight |

## 📁 项目结构

```
blog-admin/
├── app/                    # 前端项目 (React + Vite)
│   ├── src/
│   │   ├── api/            # API 请求封装
│   │   ├── components/     # 公共组件
│   │   ├── pages/          # 页面组件
│   │   │   └── admin/      # 管理后台页面
│   │   ├── store/          # Zustand 状态管理
│   │   └── types/          # TypeScript 类型定义
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── server/                 # 后端项目 (Express)
│   ├── routes/             # API 路由
│   │   ├── auth.js         # 认证
│   │   ├── posts.js        # 文章管理
│   │   ├── public.js       # 公开接口
│   │   ├── settings.js     # 网站设置
│   │   ├── comments.js     # 评论管理
│   │   ├── friendLinks.js  # 友情链接
│   │   ├── tags.js         # 标签管理
│   │   ├── upload.js       # 文件上传
│   │   └── visitor.js      # 访客统计
│   ├── db.js               # 数据库连接（MySQL/SQLite 双模式）
│   ├── seed.js             # 初始数据填充
│   ├── index.js            # 服务入口
│   └── package.json
├── .gitignore
└── README.md
```

## 🚀 快速开始

### 环境要求

- **Node.js** >= 18.x
- **npm** >= 9.x
- **MySQL** 8.x（可选，不安装则自动使用 SQLite）

### 1. 克隆项目

```bash
git clone https://github.com/gofreeplay1/bolg.git
cd blog-admin
```

### 2. 配置后端

```bash
cd server

# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件（修改 JWT 密钥和管理员密码）
# 如需使用 MySQL，取消注释并填写数据库连接信息
```

`.env` 配置说明：

```env
# 使用 SQLite（默认，无需额外配置）
# 留空 MySQL 相关配置即可

# 使用 MySQL（可选）
# DB_HOST=localhost
# DB_PORT=3306
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=blog_admin

# JWT 密钥（务必修改为随机字符串）
JWT_SECRET=your_random_secret_key

# 服务器端口
PORT=3001

# 默认管理员账号
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_strong_password
```

### 3. 安装依赖

```bash
# 安装后端依赖
cd server
npm install

# 安装前端依赖
cd ../app
npm install
```

### 4. 启动项目

**启动后端服务**（终端 1）：

```bash
cd server
npm start
```

后端默认运行在 `http://localhost:3001`，首次启动会自动：
- 创建数据库表结构
- 生成默认管理员账号
- 插入示例数据

**启动前端开发服务器**（终端 2）：

```bash
cd app
npm run dev
```

前端默认运行在 `http://localhost:5173`，API 请求自动代理到后端。

### 5. 访问系统

| 地址 | 说明 |
|------|------|
| `http://localhost:5173` | 博客前台 |
| `http://localhost:5173/admin/login` | 管理后台登录 |
| `http://localhost:3001/api/health` | API 健康检查 |

**默认管理员账号**：在 `.env` 文件中配置的 `ADMIN_USERNAME` / `ADMIN_PASSWORD`

## 📦 生产环境部署

### 构建前端

```bash
cd app
npm run build
```

构建产物在 `app/dist/` 目录。

### 部署方式

#### 方式一：Nginx 反向代理（推荐）

将 `app/dist/` 作为静态文件部署，API 请求代理到后端：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    root /path/to/app/dist;
    index index.html;

    # SPA 路由回退
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 上传文件代理
    location /uploads {
        proxy_pass http://localhost:3001;
    }
}
```

#### 方式二：PM2 进程管理

```bash
npm install -g pm2
cd server
pm2 start index.js --name blog-admin
pm2 save
pm2 startup
```

## 🔧 数据库切换

项目支持 MySQL 和 SQLite 两种数据库，通过 `.env` 配置自动切换：

| 场景 | 配置方式 | 适用 |
|------|----------|------|
| **开发/测试** | 留空 MySQL 配置 | 无需安装数据库 |
| **生产环境** | 填写 MySQL 配置 | 高并发、大数据量 |

切换数据库后无需修改任何代码，首次启动会自动建表。

## 📡 API 概览

### 公开接口（无需认证）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/public/posts` | 文章列表 |
| GET | `/api/public/posts/:slug` | 文章详情 |
| GET | `/api/public/tags` | 标签列表 |
| GET | `/api/public/tags/:tag` | 按标签筛选 |
| GET | `/api/comments/:postSlug` | 获取评论 |
| POST | `/api/comments/:postSlug` | 提交评论 |
| GET | `/api/settings` | 网站设置 |
| GET | `/api/friend-links` | 友情链接 |
| POST | `/api/visitor/record` | 记录访问 |
| GET | `/api/visitor/total` | 访客总数 |

### 管理接口（需 JWT 认证）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/login` | 管理员登录 |
| GET | `/api/posts` | 文章管理列表 |
| POST | `/api/posts` | 创建文章 |
| PUT | `/api/posts/:slug` | 更新文章 |
| DELETE | `/api/posts/:slug` | 删除文章 |
| PUT | `/api/settings/:key` | 更新设置 |
| POST | `/api/upload` | 上传文件 |
| GET/PUT/DELETE | `/api/comments/admin/*` | 评论管理 |
| POST/PUT/DELETE | `/api/friend-links` | 友链管理 |
| POST/PUT/DELETE | `/api/tags` | 标签管理 |

## 🎨 自定义配置

登录管理后台 → 网站设置，可自定义：

- 网站标题、描述、Logo
- 导航菜单链接
- 首页欢迎语
- 页脚信息
- 网站背景图
- 文章版权声明（支持 `{title}` `{date}` `{year}` 变量）
- 赞赏二维码和文案
- 关于页面内容

## 📄 License

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request。
