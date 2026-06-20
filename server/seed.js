const bcrypt = require('bcryptjs');
const { getDb } = require('./db');

const defaultPosts = [
  {
    slug: 'building-modern-web-apps-with-react',
    title: '使用 React + TypeScript 构建现代 Web 应用',
    description: '深入探讨如何利用 React 18 和 TypeScript 构建高性能、可维护的现代 Web 应用程序，涵盖项目架构、状态管理和性能优化。',
    date: '2026-06-15',
    tags: ['React', 'TypeScript', '前端开发'],
    readingTime: 8,
    content: `## 引言\n\n在现代 Web 开发中，React 和 TypeScript 的组合已经成为构建复杂应用的事实标准。TypeScript 的类型系统为 React 应用带来了更好的开发体验和代码质量保障。\n\n## 项目架构设计\n\n### 组件分层\n\n一个好的项目应该遵循清晰的分层架构：\n\n1. **UI 组件层** - 纯展示组件，无业务逻辑\n2. **容器组件层** - 连接数据和 UI\n3. **页面层** - 组合多个容器组件\n4. **服务层** - API 调用和数据处理\n\n### 状态管理策略\n\n- **简单应用**：React Context + useReducer\n- **中等复杂度**：Zustand\n- **复杂应用**：Redux Toolkit\n\n## 总结\n\nReact + TypeScript 的组合为现代 Web 开发提供了坚实的基础。`,
  },
  {
    slug: 'mastering-tailwind-css',
    title: '掌握 Tailwind CSS：实用优先的 CSS 框架',
    description: '从入门到精通 Tailwind CSS，学习如何利用原子化 CSS 类快速构建美观、响应式的用户界面，告别传统 CSS 的困扰。',
    date: '2026-06-10',
    tags: ['CSS', 'Tailwind', '前端开发'],
    readingTime: 6,
    content: `## 什么是 Tailwind CSS\n\nTailwind CSS 是一个**实用优先**（Utility-First）的 CSS 框架，它提供了大量的原子化 CSS 类，让你可以直接在 HTML 中构建任意设计。\n\n## 响应式设计\n\nTailwind 使用移动优先的断点系统：\n\n| 断点 | 最小宽度 | 适用设备 |\n|------|---------|---------|\n| sm | 640px | 大屏手机 |\n| md | 768px | 平板 |\n| lg | 1024px | 笔记本 |\n| xl | 1280px | 桌面 |\n\n## 最佳实践\n\n1. **提取组件模式** - 将重复的工具类组合提取为组件\n2. **使用 @apply 处理重复模式** - 在 CSS 中复用工具类\n3. **保持类名可读** - 合理组织类名顺序\n\n## 总结\n\nTailwind CSS 改变了我们编写 CSS 的方式。`,
  },
  {
    slug: 'nodejs-backend-best-practices',
    title: 'Node.js 后端开发最佳实践',
    description: '分享 Node.js 后端开发中的最佳实践，包括项目结构、错误处理、安全策略、性能优化以及生产环境部署建议。',
    date: '2026-06-05',
    tags: ['Node.js', '后端开发', '最佳实践'],
    readingTime: 10,
    content: `## 引言\n\nNode.js 已经成为构建高性能后端服务的主流选择。\n\n## 项目结构\n\n\`\`\`\nsrc/\n├── config/         # 配置文件\n├── controllers/    # 控制器层\n├── middleware/      # 中间件\n├── models/         # 数据模型\n├── routes/         # 路由定义\n├── services/       # 业务逻辑层\n└── app.js          # 应用入口\n\`\`\`\n\n## 安全最佳实践\n\n1. 使用 Helmet 设置安全头\n2. 速率限制\n3. 输入验证\n\n## 总结\n\n良好的后端实践不仅提升代码质量，更能保障服务的稳定性和安全性。`,
  },
  {
    slug: 'typescript-advanced-patterns',
    title: 'TypeScript 高级类型模式详解',
    description: '探索 TypeScript 中的高级类型模式，包括条件类型、映射类型、模板字面量类型以及类型体操实践。',
    date: '2026-05-28',
    tags: ['TypeScript', '编程语言'],
    readingTime: 12,
    content: `## 前言\n\nTypeScript 的类型系统是**图灵完备**的，这意味着我们可以用它来表达非常复杂的类型关系。\n\n## 条件类型\n\n\`\`\`typescript\ntype IsString<T> = T extends string ? true : false;\n\ntype A = IsString<'hello'>;  // true\ntype B = IsString<42>;        // false\n\`\`\`\n\n## 映射类型\n\n\`\`\`typescript\ntype Readonly<T> = {\n  readonly [K in keyof T]: T[K];\n};\n\`\`\`\n\n## 总结\n\n掌握 TypeScript 高级类型模式能让你写出更安全的代码。`,
  },
  {
    slug: 'docker-containerization-guide',
    title: 'Docker 容器化实战指南',
    description: '从零开始学习 Docker 容器化技术，涵盖 Dockerfile 编写、多阶段构建、Docker Compose 编排以及生产环境最佳实践。',
    date: '2026-05-20',
    tags: ['Docker', 'DevOps', '部署'],
    readingTime: 7,
    content: `## 为什么需要 Docker\n\nDocker 解决了"在我机器上能跑"这个经典问题。\n\n## Dockerfile 最佳实践\n\n### 多阶段构建\n\n\`\`\`dockerfile\nFROM node:20-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --only=production\nCOPY . .\nRUN npm run build\n\nFROM node:20-alpine\nWORKDIR /app\nCOPY --from=builder /app/dist ./dist\nEXPOSE 3000\nCMD ["node", "dist/index.js"]\n\`\`\`\n\n## 总结\n\nDocker 容器化是现代应用部署的标准方式。`,
  },
  {
    slug: 'git-workflow-team-collaboration',
    title: 'Git 工作流与团队协作实践',
    description: '探索高效的 Git 工作流程，学习如何在团队中规范使用 Git，包括分支策略、代码审查流程、Commit 规范。',
    date: '2026-05-15',
    tags: ['Git', 'DevOps', '团队协作'],
    readingTime: 5,
    content: `## 分支策略\n\n### Git Flow\n\n- **main** - 生产环境代码\n- **develop** - 开发主线\n- **feature/*** - 功能分支\n- **release/*** - 发布准备分支\n- **hotfix/*** - 紧急修复分支\n\n## Commit 规范\n\n\`\`\`\nfeat: 添加用户登录功能\nfix: 修复分页计算错误\ndocs: 更新 API 文档\n\`\`\`\n\n## 总结\n\n规范的 Git 工作流是高效团队协作的基础。`,
  },
];

async function seed() {
  console.log('🌱 开始初始化种子数据...\n');

  const db = getDb();

  // 1. 创建默认管理员账号
  const adminUser = process.env.ADMIN_USERNAME || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123';

  const existingUser = await db.get('SELECT id FROM users WHERE username = ?', [adminUser]);

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash(adminPass, 10);
    await db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [
      adminUser,
      hashedPassword,
      'admin',
    ]);
    console.log(`✅ 默认管理员账号已创建: ${adminUser} / ${adminPass}`);
  } else {
    console.log(`ℹ️  管理员账号已存在: ${adminUser}`);
  }

  // 2. 插入默认文章
  const existingPosts = await db.all('SELECT COUNT(*) as count FROM posts');
  const count = existingPosts[0]?.count || existingPosts[0]?.['COUNT(*)'] || 0;

  if (count === 0) {
    for (const post of defaultPosts) {
      await db.run(
        `INSERT INTO posts (slug, title, description, content, tags, post_date, reading_time)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          post.slug,
          post.title,
          post.description,
          post.content,
          JSON.stringify(post.tags),
          post.date,
          post.readingTime,
        ]
      );
    }
    console.log(`✅ 已插入 ${defaultPosts.length} 篇默认文章`);
  } else {
    console.log(`ℹ️  文章数据已存在 (${count} 篇)，跳过种子数据`);
  }

  // 3. 插入默认网站设置
  const existingSettings = await db.all('SELECT COUNT(*) as count FROM site_settings');
  const settingsCount = existingSettings[0]?.count || existingSettings[0]?.['COUNT(*)'] || 0;

  if (settingsCount === 0) {
    const defaultSettings = {
      site: {
        name: 'Blog',
        description: '记录思考，分享知识',
      },
      header: {
        navLinks: [
          { to: '/', label: '首页' },
          { to: '/tags', label: '标签' },
          { to: '/about', label: '关于' },
        ],
      },
      footer: {
        brandName: 'Blog',
        tagline: '记录思考，分享知识',
        socialLinks: [
          { label: 'GitHub', url: 'https://github.com', icon: 'github' },
          { label: 'Twitter', url: 'https://twitter.com', icon: 'twitter' },
        ],
        copyright: '© {year} Blog. Built with React + TypeScript.',
      },
      about: {
        name: '关于我',
        tagline: '全栈开发者，热爱技术与写作',
        bio: `## 👋 你好！

我是一名全栈开发者，专注于 Web 开发和软件工程。我热衷于探索新技术，并将其转化为实用的解决方案。

## 📝 关于本博客

这个博客是我记录技术探索、分享开发经验的个人空间。在这里，你会找到关于：

- 前端开发（React、TypeScript、CSS）
- 后端开发（Node.js、API 设计）
- DevOps 与部署（Docker、CI/CD）
- 团队协作与最佳实践（Git、代码审查）

每篇文章都力求深入浅出，既适合初学者入门，也能为有经验的开发者提供参考。

## 🛠️ 技术栈

日常工作中主要使用以下技术：

- **前端：**React、TypeScript、Tailwind CSS、Next.js
- **后端：**Node.js、Express、PostgreSQL、Redis
- **工具：**Git、Docker、VS Code、Figma
- **云服务：**AWS、Vercel、Cloudflare

## 📬 联系我

如果你有任何问题、建议或合作意向，欢迎通过以下方式联系我。我很乐意与你交流技术、分享想法！`,
        socialLinks: [
          { label: 'GitHub', url: 'https://github.com', icon: 'github' },
          { label: 'Twitter', url: 'https://twitter.com', icon: 'twitter' },
        ],
      },
    };

    for (const [key, value] of Object.entries(defaultSettings)) {
      await db.run(
        'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)',
        [key, JSON.stringify(value)]
      );
    }
    console.log('✅ 已插入默认网站设置');
  }

  // 4. 插入默认关于页面
  const existingPages = await db.all('SELECT COUNT(*) as count FROM custom_pages');
  const pagesCount = existingPages[0]?.count || existingPages[0]?.['COUNT(*)'] || 0;

  if (pagesCount === 0) {
    await db.run(
      'INSERT INTO custom_pages (slug, title, content, is_published) VALUES (?, ?, ?, ?)',
      [
        'about',
        '关于我',
        `## 👋 你好！

我是一名全栈开发者，专注于 Web 开发和软件工程。

## 📝 关于本博客

这个博客是我记录技术探索、分享开发经验的个人空间。

## 🛠️ 技术栈

- **前端：**React、TypeScript、Tailwind CSS
- **后端：**Node.js、Express
- **工具：**Git、Docker、VS Code`,
        1,
      ]
    );
    console.log('✅ 已插入默认关于页面');
  }

  // 5. 插入默认友情链接
  const existingLinks = await db.all('SELECT COUNT(*) as count FROM friend_links');
  const linksCount = existingLinks[0]?.count || existingLinks[0]?.['COUNT(*)'] || 0;

  if (linksCount === 0) {
    const defaultLinks = [
      { name: 'React 官方文档', url: 'https://react.dev', description: 'React 官方文档', sort: 0 },
      { name: 'TypeScript', url: 'https://www.typescriptlang.org', description: 'TypeScript 编程语言', sort: 1 },
      { name: 'Tailwind CSS', url: 'https://tailwindcss.com', description: '原子化 CSS 框架', sort: 2 },
      { name: 'Vite', url: 'https://vitejs.dev', description: '下一代前端构建工具', sort: 3 },
    ];
    for (const link of defaultLinks) {
      await db.run(
        'INSERT INTO friend_links (name, url, description, sort_order, is_visible) VALUES (?, ?, ?, ?, 1)',
        [link.name, link.url, link.description, link.sort]
      );
    }
    console.log(`✅ 已插入 ${defaultLinks.length} 条默认友情链接`);
  }

  console.log('\n🎉 种子数据初始化完成！');
}

module.exports = { seed };
