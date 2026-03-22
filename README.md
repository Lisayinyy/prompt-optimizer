# ✨ prompt.ai

**让小白也能写出专业 prompt** — AI 提示词一键优化 Chrome 插件

> 输入一句大白话 → AI 自动优化为专业 prompt → 一键填入任何 AI 对话框

## 🎯 产品定位

prompt.ai 是 AI 对话领域的 [Simplify.jobs](https://simplify.jobs)。就像 Simplify 帮你一键填写求职申请一样，prompt.ai 帮你一键优化 AI 提问——安装即用，零学习成本。

## ✅ 功能特性

### Phase 1 — Prompt 优化引擎
- 🚀 一键将粗糙 prompt 优化为高质量结构化 prompt
- 💡 智能诊断：告诉你原始 prompt 差在哪
- 📊 优化评分：清晰度、具体性、结构性三维评估
- 🌐 中英双语支持

### Phase 2 — 自动填充
- 📥 「填入对话框」按钮：优化结果一键填入 AI 网站输入框
- 🤖 支持 8 大 AI 平台：ChatGPT、Claude、Kimi、豆包、DeepSeek、Gemini、海螺AI、通义千问

### Phase 3 — 使用洞察（开发中）
- 📈 AI 使用数据分析面板
- 🏷️ 任务类型自动分类
- 📅 年度报告（类似 Spotify Wrapped）

## 🏗 项目结构

```
prompt.ai/
├── src/                          # 前端源码（React + TypeScript）
│   ├── app/
│   │   ├── App.tsx               # 应用入口组件
│   │   └── components/
│   │       ├── Sidebar.tsx       # 核心组件：优化面板 + 历史 + 洞察 + 设置
│   │       ├── figma/            # Figma 导出的辅助组件
│   │       └── ui/               # shadcn/ui 组件库
│   ├── styles/                   # 样式文件（Tailwind CSS）
│   └── main.tsx                  # React 入口
│
├── worker/                       # 后端（Cloudflare Worker）
│   ├── worker.js                 # API 代理 + prompt 优化引擎
│   ├── wrangler.toml             # Cloudflare 部署配置
│   └── README.md                 # 后端部署指南
│
├── manifest.json                 # Chrome Extension 配置（MV3）
├── background.js                 # 插件后台脚本（Side Panel 控制）
├── content.js                    # Content Script（AI 网站注入）
├── content.css                   # Content Script 样式
├── icons/                        # 插件图标
├── index.html                    # 前端入口 / Side Panel 页面
├── package.json                  # 依赖管理
├── vite.config.ts                # Vite 构建配置
└── postcss.config.mjs            # PostCSS 配置
```

## 🛠 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript |
| UI 组件 | shadcn/ui + Tailwind CSS |
| 动画 | Framer Motion |
| 图表 | Recharts |
| 构建工具 | Vite |
| 后端 | Cloudflare Worker |
| AI 模型 | MiniMax M2.7 |
| 插件 | Chrome Extension MV3 (Side Panel) |

## 🚀 快速开始

### 开发模式
```bash
npm install
npm run dev
```

### 构建 Chrome 插件
```bash
npm run build
# 在 Chrome 中加载 dist/ 目录作为解压扩展
```

### 部署后端
```bash
cd worker
npm install -g wrangler
wrangler login
wrangler secret put MINIMAX_API_KEY
wrangler deploy
```

## 📄 License

MIT
