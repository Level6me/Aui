# AUI 2.0 (Apple HIG Frosted Glass WebUI) 完整设计规范

> **定位**：面向现代 Web 控制台、数据监控看板与独立 Web 应用的 Apple HIG 磨砂毛玻璃设计系统。
> **核心信条**：**“Avoid unnecessary secondary labels and descriptions. Let the layout do the explaining.”（避免冗余的次级标签与解释性描述，让空间布局、字重对比与色彩语义自己说话。）**

---

## 一、 核心设计哲学（5 大铁律）

1. **布局自解释原则（Self-Explanatory Layout）**
   - **严禁冗余解释文案**：不要在卡片标题下方堆砌“本模块用于展示…”、“在此处您可以配置…”等废话段落。
   - **视觉层级直接传达语义**：用 **大号等宽数字（`.val-big` 28px/800）+ 语义色彩 + 紧凑微标签（`.val-sub` 11px/600）** 直接构成信息单元，用户一眼即懂。
2. **Apple HIG 磨砂光学玻璃与 OLED 深色明度校准**
   - 浅色模式采用 iOS 系统分组灰底（`#f2f2f7`）衬托纯白卡片（`#ffffff`）；深色模式采用 **纯黑 OLED 底色（`#000000`）** 衬托深灰卡片（`#1c1c1e`）、次级表面（`#2c2c2e`）与抬升表面（`#3a3a3c`），并自动切换 **Apple HIG Dark 提亮语义色**（如 `#0a84ff`、`#30d158`、`#ff9f0a`、`#ff453a`、`#bf5af2`）。
   - 悬浮玻璃层区分 4 档模糊厚度（`--glass-ultra-thin` / `--glass-thin` / `--glass-regular` / `--glass-thick`），并统一叠加顶部内高光描边（`--glass-rim`）营造立体光学质感。
3. **同心几何与高信息密度（Concentric Geometry & High-Density Clarity）**
   - 容器最大宽度 `1100px ~ 1400px`，栅格间距 `12px ~ 14px`，所有栅格列强制使用 `minmax(0, 1fr)` 防止溢出。
   - 嵌套圆角遵循 Apple 同心公式 `R_inner = R_outer - padding`（如 `.segmented-control` `12px - 3px = 9px`；`.dock` `33px` 内嵌 `.dock-btn` `24px`）。
4. **触觉级弹簧微交互与无障碍适配（Spring Feedback & HIG Accessibility）**
   - 全局交互曲线：`cubic-bezier(0.1, 0.8, 0.25, 1)`；保留 iOS/macOS 原生纵向阻尼回弹。
   - 完整支持 `:focus-visible` 键盘焦点环、Modal 焦点锁定（Focus Trap）与还原、触屏端 `44×44px` 隐式热区扩展、`@media (hover: hover)` 防触屏悬停粘滞，以及 `prefers-reduced-motion`、`prefers-reduced-transparency`、`prefers-contrast` 三大系统辅助模式。
5. **零重型依赖与双模工程架构（Zero-Bloat Architecture）**
   - 纯原生 CSS 变量 + 模块化 CSS + 原生 JS 驱动，支持 **单文件内联交付（Pattern A）** 与 **模块化开发 + 一键构建/校验产物（Pattern B）**。

---

## 二、 色彩系统、材质与自适应主题 Token (`src/css/variables.css`)

### 2.1 基础背景、系统 Fill 与表面层级

| Token 变量名 | 浅色模式 (`light`) | 深色模式 (`dark`) | 用途规范 |
| :--- | :--- | :--- | :--- |
| `--bg` | `#f2f2f7` | `#000000` | 页面全局底色（iOS System Grouped / OLED 纯黑） |
| `--card` | `#ffffff` | `#1c1c1e` | 一级卡片、表格容器、激活分段滑块底板 |
| `--card-sec` | `#f8f8fa` | `#2c2c2e` | 次级内嵌区块、表头 `th`、输入框默认底色 |
| `--surface-elevated` | `#ffffff` | `#2c2c2e` | 弹窗与悬浮层内嵌套卡片的抬升底色 |
| `--surface-elevated-sec` | `#f2f2f7` | `#3a3a3c` | 抬升层中的次级控件与输入框底色 |
| `--dock` | `rgba(255,255,255,0.82)` | `rgba(28,28,30,0.86)` | 底部 Dock、吸顶工具栏、Popover、Toast 玻璃底色 |
| `--modal-bg` | `rgba(255,255,255,0.94)` | `rgba(28,28,30,0.94)` | 模态弹窗、Bottom Sheet、Command Palette 底色 |
| `--fill-primary` ~ `--fill-quaternary` | `rgba(120,120,128, 0.20~0.08)` | `rgba(120,120,128, 0.36~0.18)` | Apple HIG 四级自适应半透明填充色（图标按钮、轨道、分割槽） |
| `--border` / `--border-subtle` | `rgba(120,120,128, 0.15/0.08)` | `rgba(255,255,255, 0.12/0.06)` | 标准 1px 描边与细分割线（`prefers-contrast: more` 自动加深） |

### 2.2 材质厚度与高光描边（Apple Materials）

| Token 变量名 | 值 | 适用层级 |
| :--- | :--- | :--- |
| `--glass-ultra-thin` | `blur(16px) saturate(160%)` | Modal / Command Palette 背景遮罩 |
| `--glass-thin` | `blur(22px) saturate(180%)` | 轻量悬浮提示条 |
| `--glass-regular` | `blur(28px) saturate(190%)` | Floating Glass Dock、吸顶工具栏、Toast、Mini HUD |
| `--glass-thick` | `blur(40px) saturate(200%)` | Popover 上下文菜单、模态弹窗、Command Palette |
| `--glass-rim` | 浅 `inset 0 1px 0 rgba(255,255,255,0.58)` / 深 `inset 0 0.5px 0 rgba(255,255,255,0.16)` | 玻璃面板顶部高光内描边 |

### 2.3 Apple HIG Light / Dark 自适应语义色板

| 语义角色 | 浅色实色 (`light`) | 深色提亮 (`dark`) | 典型应用场景 |
| :--- | :--- | :--- | :--- |
| **主强调色 (`--accent`)** | `#007aff` | `#0a84ff` | 主按钮、激活导航、上行流量、标识符链接、焦点环 |
| **成功/正常 (`--success`)** | `#34c759` | `#30d158` | iOS 开关开启态、在线呼吸灯、下行速率、正常放行 |
| **警告/限流 (`--warning`)** | `#ff9500` | `#ff9f0a` | 限流保护、排队中、中度告警、Top 2 排行 |
| **危险/异常 (`--danger`)** | `#ff3b30` | `#ff453a` | 破坏性确认、异常告警、离线灯、Top 1 排行 |
| **扩展紫 (`--purple`)** | `#af52de` | `#bf5af2` | 分类标签、分发状态、多维统计 |
| **扩展靛 (`--indigo`)** | `#5856d6` | `#5e5ce6` | 扩展图表系列、设置图标色、归档分类 |
| **扩展青 (`--teal`)** | `#30b0c7` | `#40c8e0` | 缓存命中率、网络路由分类 |
| **扩展粉 (`--pink`)** | `#ff2d55` | `#ff375f` | 高亮事件标签、辅助数据系列 |
| **扩展黄 (`--yellow`)** | `#ffcc00` | `#ffd60a` | Top 3 徽标、提醒标记 |

### 2.4 三态主题切换与零闪烁（FOUC）防护

- HTML 根节点声明 `<html lang="zh-CN" data-theme="auto">`，并在 `<head>` 引入 1 行内联初始化脚本提前应用持久化 `data-theme`，彻底消除深色模式首屏白屏闪烁。
- CSS 声明 `color-scheme: light` / `dark`，使原生表单控件与滚动条自动适配深浅主题。
- `cycleTheme()` 在 `auto` ➔ `light` ➔ `dark` 循环切换；Canvas / Chart.js 通过 `AUI.onThemeChange((isDark, mode) => ...)` 实时刷新配色。

---

## 三、 字体排印、图标与数字对齐规范 (`src/css/base.css`)

1. **SF Pro 优先无衬线栈**：`--font-sans`，等宽技术字体栈：`--font-mono`。
2. **动态数值防抖铁律（`tabular-nums`）**：所有 KPI（`.val-big`）、速率（`.mini-hud-speed`）、列表数值（`.list-row-value`）与表格统计列必须开启 `font-variant-numeric: tabular-nums;`。
3. **SF Symbols 风格线性 SVG 规范（`.aui-icon`）**：
   - 统一 `1.8px` 圆头描边（`fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round;`），尺寸默认 `16px`（`.sm` `14px` / `.lg` `20px` / Dock 内 `20px`）。
   - 控制台导航与工具栏优先使用 `.aui-icon` 线性 SVG，减少跨平台风格割裂的杂乱 Emoji。

---

## 四、 空间架构与响应式栅格系统 (`src/css/layout.css`)

- **标准 4 层结构**：悬浮通知层（`.toast-container`）➔ 主内容容器（`.container` + `.header` + `.page.active` + `.bottom-spacer`）➔ 底部悬浮玻璃 Dock（`<nav class="dock">`）➔ 弹层区（`.modal-overlay` / `.popover-menu` / 动态 `⌘K` 命令面板）。
- **响应式栅格断点**：
  - `.grid-4`：桌面 `4` 列，`≤ 860px` 折为 `2 × 2`；
  - `.grid-6`：桌面 `6` 列，`≤ 1100px` 折为 `3` 列，`≤ 600px` 折为 `2` 列；
  - `.grid-3`：桌面 `3` 列，`≤ 960px` 折为 `2` 列，`≤ 600px` 折为 `1` 列；
  - `.grid-2`：桌面 `2` 列，`≤ 768px` 折为 `1` 列。
- **顶部 Header 移动端折叠**：`≤ 640px` 自动隐藏 `.header-actions .pill-btn` 内的 `.pill-text` 与 `.kbd`，保留纯净图标胶囊。

---

## 五、 标志性组件规范 (`components.css` / `data-display.css` / `dock.css` / `modal.css`)

### 5.1 悬浮毛玻璃底栏（`.dock`）
- 外圆角 `33px`，内部 `.dock-btn` 采用同心圆角 `24px`，配合 `--glass-regular` 与顶部高光 `--glass-rim`。
- 快捷键 `1 ~ 9` 映射切换对应页面；开启 `<html data-aui-hash>` 时支持 URL Hash 路由深链与 `aria-current="page"` 自动同步。

### 5.2 吸顶工具栏（`.sticky-toolbar` 与 `.sticky-toolbar.bare`）
- **标准形态（`.sticky-toolbar`）**：毛玻璃吸顶卡片，内置搜索框、下拉筛选与分段控制器。
- **无外框轻量形态（`.sticky-toolbar.bare` + `.sticky-toolbar-row`）**：去掉横幅外框，仅对内部胶囊/分段器/实时胶囊施加柔和周圈阴影（`--sticky-float-shadow`）。

### 5.3 物理弹簧滑块分段器（`.segmented-control`）与跑道胶囊（`.capsule-switcher`）
- `aui-core.js` 自动为 `.segmented-control` 注入 `.segment-indicator` 底板，切换选项时按 Apple 弹簧曲线平滑滑动，resize 及页面切换自动重算位置。

### 5.4 Adaptive Bottom Sheet 与 Apple Alert 确认框（`.modal-sheet` & `auiConfirm`）
- **桌面端**：居中磨砂模态弹窗（`border-radius: 22px`），自动注入 `role="dialog" aria-modal="true"`、Tab 焦点锁定（Focus Trap）与关闭后焦点还原。
- **移动端（`≤ 640px`）**：自动变形为从底部贴边滑出的 **iOS Bottom Sheet**，顶部显示 `.sheet-grabber`（`36×5px` 圆角拖拽条），底部贴合安全区。
- **高危确认（`await auiConfirm(msg, { title, confirmText, cancelText, danger })`）**：始终采用 Apple 经典居中精简 `.alert-sheet`（危险态默认聚焦取消按钮防止误按回车）。

### 5.5 Spotlight 命令面板（`⌘K` / `Ctrl+K`）
- 按 `⌘K` / `Ctrl+K` 或点击带 `data-aui-cmd` 的按钮唤醒毛玻璃悬浮命令面板；默认自动聚合 `.dock` 导航项与主题切换，并支持 `AUI.registerCommands([...])` 注入业务快捷命令，支持模糊检索与 `↑/↓/↵/Esc` 全键盘操作。

### 5.6 Inset Grouped List（`.list-group`）与 Frosted Popover（`.popover-menu`）
- **Inset Grouped List**：`.list-group-header` + `.list-group` + `.list-row`（支持 `.list-row-icon`、`.list-row-value`、`.list-chevron` 与 Apple 绿色 `.switch`），用于设置页与详情键值分组。
- **Frosted Popover**：`togglePopover(triggerEl, menuId)` 或 `data-aui-popover="menuId"` 触发，自动避让视口边缘，替代原生 `<select>` 或拥挤的表格行内按钮。

### 5.7 骨架屏（`.skeleton`）、极简空状态（`.empty-state`）、实时胶囊（`.live-pill`）与复制芯片（`.copy-chip`）
- `.skeleton` / `.skeleton-line` 提供低对比度脉冲占位，消除异步加载布局抖动；
- `.empty-state` 仅保留图标 + 简短标题 + 单一主动作按钮，严禁大段说明文字；
- `.live-pill` 展示实时状态与进度；`.copy-chip` 配合 `data-aui-copy="值"` 一键复制并绿态反馈；`.kbd` 展示快捷键微标。
- `showToast(msg, { type: 'info' | 'success' | 'warning' | 'danger', duration })` 支持语义色点、悬停暂停、`aria-live="polite"` 与最大 3 条防刷屏上限。

---

## 六、 “布局自解释”反模式对照表（AI 开发自检清单）

| ❌ 错误做法（违背 AUI 规范） | ✅ 正确做法（遵循 AUI 布局自解释原则） |
| :--- | :--- |
| 在页面顶部放一段 Alert 欢迎语或长段使用教程。 | 直接展示 `.header` + `.grid-4` 核心 KPI 卡片，零寒暄废话。 |
| 表格行尾堆叠 5 个操作按钮挤爆横向宽度。 | 保留 1 个高频按钮 + `⋯` 触发 `.popover-menu` 毛玻璃上下文菜单。 |
| 暗黑模式沿用浅色模式的 `#007aff` / `#ff3b30`，或禁用 `user-scalable=no`。 | 直接使用 `var(--accent)` 等自适应变量（Dark 自动提亮），保留移动端无障碍缩放。 |
| 使用浏览器原生 `alert()` / `confirm()` 或纯文字空列表。 | 统一使用 `showToast(..., { type })`、`await auiConfirm(...)` 与 `.empty-state`。 |
| 表单每个输入框下方都挂一行灰色 helper text 重复解释字段。 | 使用紧凑的 `.form-label` + 清晰 `placeholder` 示例值。 |
