# AUI — Apple-Style Frosted Glass WebUI 设计规范与 AI Agent 脚手架

> **仓库地址**：[https://github.com/Level6me/Aui](https://github.com/Level6me/Aui)  
> **设计定位**：基于 Apple HIG 磨砂毛玻璃美学与高密度自解释布局的现代 Web 界面设计系统。  
> **核心准则**：*“Avoid unnecessary secondary labels and descriptions. Let the layout do the explaining.”*

---

## 🚀 如何交给 AI Agent 开发新 Web 项目？

当你需要创建任何新的 Web 控制台、数据监控看板、管理系统或独立 WebUI 时，只需将本仓库地址 [`https://github.com/Level6me/Aui`](https://github.com/Level6me/Aui) 提供给 AI Agent（或克隆到本地工作区），并发送以下指令：

```text
请拉取并参照 https://github.com/Level6me/Aui 仓库中的 AGENTS.md 与 DESIGN_SPEC.md 规范来开发本项目的 Web 界面。直接复用该仓库的 CSS 变量、毛玻璃组件与布局范式。
```

### 一行命令克隆本规范库：
```bash
git clone https://github.com/Level6me/Aui.git
```

本仓库内置了全主流 AI 编程助手的自动识别入口文件：
- [`AGENTS.md`](./AGENTS.md) — 通用 AI Agent 强制开发守则与速查表（Antigravity / Codex / OpenAI）
- [`CLAUDE.md`](./CLAUDE.md) — Claude Code 专用工程规范入口
- [`.cursorrules`](./.cursorrules) — Cursor / Windsurf 编辑器自动加载规则
- [`DESIGN_SPEC.md`](./DESIGN_SPEC.md) — 完整视觉设计规范文档（色彩 Token、SF Pro 字体阶梯、响应式栅格、核心组件、图表规范与“布局自解释”反模式清单）

---

## 📁 仓库目录结构

```text
Aui/
├── AGENTS.md                        # AI Agent 核心开发准则与组件类名速查表
├── CLAUDE.md                        # Claude Code 自动读取入口
├── .cursorrules                     # Cursor / Windsurf 自动读取规则
├── DESIGN_SPEC.md                   # 完整 Web UI 视觉与交互设计规范白皮书
├── index.html                       # 交互式全组件预览演练场 (Live Showcase)
├── src/
│   ├── css/
│   │   ├── variables.css            # Light (#f2f2f7) / Pure OLED Dark (#000000) 色彩与毛玻璃 Token
│   │   ├── base.css                 # SF Pro 字体栈、tabular-nums 数字防抖、安全区容器
│   │   ├── layout.css               # 自适应顶栏 (.header)、吸顶毛玻璃栏、响应式栅格 (.grid-2/3/4/6)
│   │   ├── components.css           # 胶囊按钮 (.pill-btn)、分段控件、徽标、iOS 开关、Toast、悬浮小窗
│   │   ├── data-display.css         # 双视图卡片网格 (.item-card)、高密度表格、Top-N 进度排行榜
│   │   ├── dock.css                 # 标志性底部悬浮毛玻璃导航栏 (Floating Glass Dock)
│   │   ├── modal.css                # 磨砂弹窗 (.modal-sheet) 与设置列表行 (.setting-row)
│   │   └── aui.css                  # 模块化 CSS 统一引用入口
│   └── js/
│       └── aui-core.js              # 零依赖核心交互运行时 (三态主题切换、Dock 路由、快捷键 1-9/Esc、Modal、Toast)
├── dist/
│   ├── aui.bundle.css               # 合并后的单文件全量样式表
│   └── aui.bundle.js                # 合并后的单文件核心运行时脚本
├── templates/
│   ├── single-file-starter.html     # 【架构 A：单文件内联模式】零依赖单文件 HTML 起步模板
│   └── modular-starter.html         # 【架构 B：多文件模块模式】模块化 WebUI 起步模板
└── scripts/
    └── build.js                     # 零依赖一键打包脚本 (生成 dist/ 与单文件模板)
```

---

## 🛠️ 构建与本地预览

```bash
# 克隆仓库
git clone https://github.com/Level6me/Aui.git
cd Aui

# 重新打包生成 dist/aui.bundle.css、dist/aui.bundle.js 及 templates/single-file-starter.html
npm run build
# 或直接运行：
node scripts/build.js
```
