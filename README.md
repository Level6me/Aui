# AUI 2.0 — Apple HIG Frosted Glass WebUI 设计规范与 AI Agent 脚手架

> **仓库地址**：[https://github.com/Level6me/Aui](https://github.com/Level6me/Aui)  
> **设计定位**：基于 Apple HIG 磨砂毛玻璃美学（Light / Pure OLED Dark 明度校准）与高密度自解释布局的零依赖 Web 界面设计系统。  
> **核心准则**：*“Avoid unnecessary secondary labels and descriptions. Let the layout do the explaining.”*

---

## ✨ AUI 2.0 核心特性（对照 Apple HIG 全面升级）

- **Apple HIG Dark Mode 明度校准与扩展色板**：深色模式下语义色自动提亮（`#0a84ff` / `#30d158` / `#ff9f0a` / `#ff453a` / `#bf5af2`），新增 `--indigo` / `--teal` / `--pink` / `--yellow` 与 4 级系统 Fill Token。
- **四档光学玻璃材质 + 顶部内高光**：`--glass-ultra-thin` ~ `--glass-thick` 配合 `--glass-rim` 高光描边，并支持 `prefers-reduced-transparency` 与 `prefers-contrast` 自动降级/增强。
- **标志性 Apple HIG 组件库**：
  - 同心圆角 **Floating Glass Dock**（`.dock`）与 SF Symbols 风格线性图标（`.aui-icon`）
  - **物理弹簧滑块分段控制器**（`.segmented-control` 自动生成 `.segment-indicator`）与无外框吸顶栏（`.sticky-toolbar.bare`）
  - **Adaptive Bottom Sheet**（移动端 `<640px` 自动底部贴边滑出 + `.sheet-grabber`）与 **Apple Alert 确认框**（`await auiConfirm(...)`）
  - **Spotlight 命令面板**（`⌘K` / `Ctrl+K` + `AUI.registerCommands`）
  - **Frosted Popover 上下文菜单**（`.popover-menu`）、**Inset Grouped 设置列表**（`.list-group`）
  - **骨架屏（`.skeleton`）**、**极简空状态（`.empty-state`）**、**实时活动胶囊（`.live-pill`）**、**一键复制芯片（`.copy-chip`）** 与 **`.kbd` 快捷键微标**
- **完整无障碍与现代运行时**：Modal 焦点锁定（Focus Trap）与还原、触屏 `44×44px` 隐式热区保护、Hover 粘滞隔离、URL Hash 路由同步、CSP 友好 `data-aui-*` 声明式触发与零 FOUC 主题初始化。

---

## 🚀 如何交给 AI Agent 开发新 Web 项目？

将本仓库地址提供给 AI Agent（或克隆至工作区），并发送指令：

```text
请拉取并参照 https://github.com/Level6me/Aui 仓库中的 AGENTS.md 与 DESIGN_SPEC.md 规范来开发本项目的 Web 界面。直接复用该仓库的 CSS 变量、毛玻璃组件与布局范式。
```

内置全主流 AI 编程助手自动入口：
- [`AGENTS.md`](./AGENTS.md) — 通用 AI Agent 强制开发守则与速查表（Antigravity / Codex / OpenAI）
- [`CLAUDE.md`](./CLAUDE.md) — Claude Code 专用工程规范入口
- [`.cursorrules`](./.cursorrules) — Cursor / Windsurf 编辑器自动加载规则
- [`DESIGN_SPEC.md`](./DESIGN_SPEC.md) — 完整视觉与交互设计规范白皮书

---

## 📁 仓库目录结构

```text
Aui/
├── AGENTS.md                        # AI Agent 核心开发准则与组件类名/API 速查表
├── CLAUDE.md                        # Claude Code 自动读取入口
├── .cursorrules                     # Cursor / Windsurf 自动读取规则
├── DESIGN_SPEC.md                   # 完整 Apple HIG Web UI 设计规范白皮书
├── index.html                       # 交互式全组件预览演练场 (Live Showcase)
├── src/
│   ├── css/
│   │   ├── variables.css            # Light / OLED Dark 明度校准色板、4档玻璃材质、无障碍降级 Token
│   │   ├── base.css                 # SF Pro 字体栈、tabular-nums、.aui-icon、减弱动效兜底
│   │   ├── layout.css               # 自适应顶栏、吸顶栏 (.sticky-toolbar / .bare)、响应式栅格
│   │   ├── components.css           # 按钮、滑块分段器、绿色开关、Grouped List、Popover、Toast、Live Pill
│   │   ├── data-display.css         # 双视图卡片网格、高密度表格、Top-N 排行、骨架屏与极简空状态
│   │   ├── dock.css                 # 同心圆角底部悬浮毛玻璃导航栏 (Floating Glass Dock)
│   │   ├── modal.css                # Adaptive Bottom Sheet、Apple Alert Dialog、⌘K Command Palette
│   │   └── aui.css                  # 模块化 CSS 统一引用入口
│   └── js/
│       └── aui-core.js              # 零依赖核心运行时 (主题、路由、滑块、焦点锁弹窗、确认框、⌘K、Popover、Toast)
├── dist/
│   ├── aui.bundle.css               # 合并后的单文件全量样式表
│   └── aui.bundle.js                # 合并后的单文件核心运行时脚本
├── templates/
│   ├── single-file-starter.html     # 【架构 A：单文件内联模式】零依赖单文件 HTML 起步模板
│   └── modular-starter.html         # 【架构 B：多文件模块模式】模块化 WebUI 起步模板
└── scripts/
    └── build.js                     # 零依赖一键打包、压缩 (--minify) 与产物同步校验 (--check) 脚本
```

---

## 🛠️ 构建与校验

```bash
# 打包生成 dist/aui.bundle.css、dist/aui.bundle.js 与 templates/single-file-starter.html
npm run build

# 同时输出轻量化压缩版 dist/aui.bundle.min.css 与 dist/aui.bundle.min.js
npm run build:min

# 校验 dist/ 与单文件模板是否与 src/ 最新同步（可用于 CI）
npm run check
```
