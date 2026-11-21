# AUI (Apple-Style Frosted Glass WebUI) 完整设计规范

> **定位**：面向现代 Web 控制台、数据监控看板与独立 Web 应用的 Apple HIG 磨砂毛玻璃设计系统。
> **核心信条**：**“Avoid unnecessary secondary labels and descriptions. Let the layout do the explaining.”（避免冗余的次级标签与解释性描述，让空间布局、字重对比与色彩语义自己说话。）**

---

## 一、 核心设计哲学（5 大铁律）

1. **布局自解释原则（Self-Explanatory Layout）**
   - **严禁冗余解释文案**：不要在卡片标题下方堆砌“本模块用于展示…”、“在此处您可以配置…”等废话段落。
   - **视觉层级直接传达语义**：用 **大号等宽数字（`.val-big` 28px/800）+ 语义色彩（蓝/绿/橙/红/紫）+ 紧凑微标签（`.val-sub` 11px/600）** 直接构成信息单元，用户一眼即懂。
2. **Apple HIG 磨砂毛玻璃质感（Frosted Glass & Pure OLED Dark）**
   - 浅色模式采用 iOS 系统分组灰底（`#f2f2f7`）衬托纯白卡片（`#ffffff`）；深色模式采用 **纯黑 OLED 底色（`#000000`）** 衬托深灰卡片（`#1c1c1e`）与次级容器（`#2c2c2e`）。
   - 悬浮层（底部 Dock、吸顶工具栏 `.sticky-toolbar`、顶部 Toast、模态框遮罩、悬浮小窗 HUD）统一使用高透毛玻璃：`backdrop-filter: blur(28px) saturate(190%)`。
3. **高信息密度与呼吸感并存（High-Density Clarity）**
   - 容器最大宽度 `1100px ~ 1400px`，栅格间距统一为 `12px ~ 14px`，卡片内边距 `16px 18px`（移动端自适应缩至 `12px 14px`），圆角 `18px ~ 20px`。
   - 所有栅格列必须使用 `minmax(0, 1fr)`，严禁长文本、标识符或编码撑破卡片边界。
4. **触觉级微交互反馈（Spring Tactile Feedback）**
   - 全局交互曲线采用 Apple 弹簧阻尼：`cubic-bezier(0.1, 0.8, 0.25, 1)`。
   - 按钮按下（`:active`）必须有物理微缩放反馈：常规按钮 `scale(0.97)`、胶囊按钮 `scale(0.95)`、圆形图标与 Dock 按钮 `scale(0.92)`；可点击卡片悬停上浮 `translateY(-2px)`。
   - 页面顶端下拉与底部上拉保留 iOS / macOS 原生弹簧阻尼回弹（`overscroll-behavior-x: none; overscroll-behavior-y: auto; -webkit-overflow-scrolling: touch;`），不通过 JS 强行劫持原生滚动。
5. **零重型依赖与双模工程架构（Zero-Bloat Architecture）**
   - 不依赖重型第三方 UI 组件库，纯原生 CSS 变量 + 模块化 CSS + 原生 JS 即可驱动。
   - 支持 **单文件内联交付（Pattern A）** 与 **模块化开发 + 一键构建单文件/PWA 产物（Pattern B）**。

---

## 二、 色彩系统与自适应主题 Token (`src/css/variables.css`)

### 2.1 基础背景与表面层级（Surface Tokens）

| Token 变量名 | 浅色模式 (`light`) | 深色模式 (`dark`) | 用途规范 |
| :--- | :--- | :--- | :--- |
| `--bg` | `#f2f2f7` | `#000000` | 页面全局底色（iOS System Grouped Background / OLED 纯黑） |
| `--card` | `#ffffff` | `#1c1c1e` | 一级卡片、表格容器、激活分段按钮背景 |
| `--card-sec` | `#f8f8fa` | `#2c2c2e` | 次级内嵌区块、表头 `th`、输入框默认底色、分段槽背景 |
| `--card-hover` | `#f5f5f7` | `#262629` | 表格行悬停、卡片悬停、胶囊按钮悬停背景 |
| `--dock` | `rgba(255,255,255,0.85)` | `rgba(28,28,30,0.88)` | 底部悬浮 Dock 栏、吸顶毛玻璃工具栏、顶部 Toast 背景 |
| `--card-translucent` | `rgba(255,255,255,0.88)` | `rgba(28,28,30,0.88)` | 悬浮横幅、画中画微型监控 HUD 背景 |
| `--modal-bg` | `rgba(255,255,255,0.95)` | `rgba(28,28,30,0.96)` | 模态弹窗卡片背景 |
| `--border` | `rgba(120,120,128,0.15)` | `rgba(255,255,255,0.12)` | 卡片、输入框、表格外框、模态框标准 1px 描边 |
| `--border-subtle` | `rgba(120,120,128,0.08)` | `rgba(255,255,255,0.06)` | 表格内部行分割线、设置项行分割线、卡片内部分割线 |

### 2.2 文本层级（Typography Color Tokens）

| Token 变量名 | 浅色模式 (`light`) | 深色模式 (`dark`) | 用途规范 |
| :--- | :--- | :--- | :--- |
| `--text` | `#1c1c1e` | `#ffffff` | 主标题、卡片标题、核心数值、表格正文 |
| `--text-sec` | `#8e8e93` | `#98989d` | 眉标（`.date-badge`）、KPI 标签（`.val-sub`）、表头文字、未激活导航 |
| `--text-ter` | `#aeaeb2` | `#636366` | 占位符（Placeholder）、禁用态、辅助时间戳 |

### 2.3 语义色板与柔光背景（Semantic Palette）

每个语义色均配对一个 **实色前景 Token** 与一个 **10%~18% 透明度的柔光背景 Token**（用于徽标 `.badge`/`.tag`、选中高亮、焦点光环）：

| 语义角色 | 实色前景 Token | 浅色柔光背景 | 深色柔光背景 | 典型应用场景 |
| :--- | :--- | :--- | :--- | :--- |
| **主强调色 (Accent)** | `--accent: #007aff` | `rgba(0,122,255,0.10)` | `rgba(0,122,255,0.18)` | 主操作按钮、激活态导航、上行流量、主标识符链接、焦点外发光 |
| **成功/正常 (Success)** | `--success: #34c759` | `rgba(52,199,89,0.12)` | `rgba(52,199,89,0.16)` | 在线状态呼吸灯、下行速率、已完成徽标、正常放行状态 |
| **警告/限流 (Warning)** | `--warning: #ff9500` | `rgba(255,149,0,0.12)` | `rgba(255,149,0,0.16)` | 限流保护激活（发光橙）、排队中、中度告警、暂停状态灯 |
| **危险/异常 (Danger)** | `--danger: #ff3b30` | `rgba(255,59,48,0.12)` | `rgba(255,59,48,0.16)` | 删除/阻断操作、高危告警标签、离线状态灯、异常进度条 |
| **扩展分类 (Purple)** | `--purple: #af52de` | `rgba(175,82,222,0.12)` | `rgba(175,82,222,0.16)` | 分类标签（Category）、分发状态、多维统计指标 |

### 2.4 三态主题切换机制（`auto` / `light` / `dark`）

- HTML 根节点默认声明 `<html lang="zh-CN" data-theme="auto">`。
- 通过 `cycleTheme()` 在 `auto`（🌓 自动跟随系统）➔ `light`（☀️ 浅色）➔ `dark`（🌙 深色）间循环切换，并持久化至 `localStorage`。
- 切换主题时，若页面包含 Canvas / Chart.js 图表，通过 `AUI.onThemeChange((isDark) => ...)` 实时更新坐标轴网格线与文字颜色，无需刷新页面。

---

## 三、 字体排印与数字对齐规范 (`src/css/base.css`)

1. **无衬线主字体栈（Apple SF Pro 优先）**：
   ```css
   --font-sans: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
   ```
2. **等宽技术字体栈（用于地址、端口、编号、实时速率、代码块）**：
   ```css
   --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
   ```
3. **动态数值防抖铁律（`tabular-nums`）**：
   - 所有实时跳动的 KPI 大数字（`.val-big`）、速率指示器（`.mini-hud-speed`）、表格统计列必须声明 `font-variant-numeric: tabular-nums;`，确保轮询刷新时数字宽度恒定、界面零抖动。
4. **字号与字重阶梯（Type Scale）**：

| 层级名称 | 类名 / 选择器 | 桌面字号 | 移动字号 (`<640px`) | 字重 (`font-weight`) | 字间距 / 行高 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **页面主标题** | `.title` | `28px ~ 32px` | `20px ~ 24px` | `800` (ExtraBold) | `letter-spacing: -0.03em; line-height: 1.15` |
| **顶部状态眉标** | `.date-badge` | `11px` | `10px` | `700` (Bold) | `letter-spacing: 0.04em; text-transform: uppercase` |
| **KPI 核心大数字** | `.val-big` | `26px ~ 30px` | `24px` | `800` (ExtraBold) | `letter-spacing: -0.03em; tabular-nums` |
| **区块标题** | `.card-title` | `15px` | `14px` | `700` (Bold) | `letter-spacing: -0.01em` |
| **卡片名称/条目主标题** | `.item-card-title` | `14px` | `14px` | `700` (Bold) | `line-height: 1.35; -webkit-line-clamp: 2` |
| **正文 / 表格 / 表单** | `body`, `td`, `.input-box` | `13px` | `12px ~ 13px` | `500 ~ 600` | `line-height: 1.4` |
| **胶囊按钮 / 分段按钮** | `.pill-btn`, `.segment-btn` | `12px` | `11px ~ 12px` | `600 ~ 700` | `white-space: nowrap` |
| **KPI 辅助标签 / 表头** | `.val-sub`, `th` | `11px ~ 12px` | `10px ~ 11px` | `600 ~ 700` | `color: var(--text-sec)` |
| **徽标 / Dock 标签** | `.badge`, `.tag`, `.dock-btn span` | `10px ~ 11px` | `10px` | `700` (Bold) | `letter-spacing: -0.01em` |

---

## 四、 空间架构与响应式栅格系统 (`src/css/layout.css`)

### 4.1 页面骨架结构（Standard App Shell）

每个基于 AUI 的页面严格遵循以下 4 层垂直流结构：
```html
<body>
  <!-- 1. 全局悬浮反馈层：Toast 容器 + 可选的悬浮监控小窗 -->
  <div class="toast-container" id="toast-container"></div>

  <!-- 2. 主内容响应式容器 -->
  <div class="container">
    <!-- 2.1 顶部自适应状态与工具栏 Header -->
    <header class="header">
      <div class="header-left">
        <div class="date-badge"><span class="status-dot"></span><span>SYSTEM · RUNNING</span></div>
        <h1 class="title" id="page-title">系统总览</h1>
      </div>
      <div class="header-actions">
        <button class="pill-btn" onclick="cycleTheme()"><span id="theme-icon">🌓</span><span id="theme-label" class="pill-text">自动</span></button>
      </div>
    </header>

    <!-- 2.2 多标签页内容区 (.page.active) -->
    <main id="p-overview" class="page active">
      <!-- 栅格与卡片内容 -->
      <div class="bottom-spacer"></div>
    </main>
  </div>

  <!-- 3. 底部悬浮毛玻璃导航栏 (Floating Glass Dock) -->
  <nav class="dock">...</nav>

  <!-- 4. 模态框弹层区 (.modal-overlay) -->
  <div class="modal-overlay" id="modal-example">...</div>
</body>
```

### 4.2 响应式栅格断点规则

- `.grid-4`（4 列核心 KPI 卡片）：桌面端 `repeat(4, minmax(0, 1fr))`，`≤ 860px` 自动折为 `2 × 2` 双列网格（严禁在手机端折成冗长的单列 4 行，保持紧凑对称的 `2 × 2` 视觉矩阵）。
- `.grid-6`（6 维深度分析指标卡）：桌面端 `6` 列，`≤ 1100px` 折为 `3` 列，`≤ 600px` 折为 `2` 列。
- `.grid-3`（3 列分布图表/功能卡片）：桌面端 `3` 列，`≤ 960px` 折为 `2` 列，`≤ 600px` 折为 `1` 列。
- `.grid-2`（双列对比趋势图/排行卡）：桌面端 `2` 列，`≤ 768px` 折为 `1` 列。

### 4.3 顶部 Header 移动端自适应折叠

- 在桌面端，`.header-actions .pill-btn` 同时展示 Emoji/SVG 图标与 `.pill-text` 文字标签（如 `🌓 自动`）。
- 在移动端（`≤ 640px`），自动隐藏 `.pill-text`（或切换为简短 `.btn-text-mobile`），使右上角工具按钮瞬间化身为精致的圆角图标胶囊，绝不挤压左侧主标题 `.title`。

---

## 五、 标志性组件规范 (`src/css/components.css` & `data-display.css`)

### 5.1 悬浮毛玻璃底栏（Floating Glass Dock — `.dock`）
- **定位与尺寸**：`position: fixed; bottom: calc(14px + env(safe-area-inset-bottom)); left: 50%; transform: translateX(-50%); width: 94%; max-width: 500px; height: 64px; border-radius: 33px;`
- **光学材质**：`background: var(--dock); backdrop-filter: blur(28px) saturate(190%); border: 0.5px solid var(--dock-border); box-shadow: var(--shadow-lg);`
- **子按钮（`.dock-btn`）**：垂直居中排列 `19px × 19px` 纯色 SVG 图标与 `10px` 粗体文字；激活态 `.dock-btn.active` 赋予 `color: var(--accent); background: var(--accent-bg);`。
- **快捷键联动**：数字键 `1 ~ 9` 直接映射触发对应序号的 `.dock-btn`（弹窗激活或聚焦输入控件时自动屏蔽）。

### 5.2 吸顶毛玻璃过滤工具栏（Sticky Glass Toolbar — `.sticky-toolbar` & `.sticky-toolbar.bare`）
- **标准卡片形态（`.sticky-toolbar`）**：用于列表页、检索页、系统设置页顶部，随页面滚动吸顶（`position: sticky; top: max(10px, env(safe-area-inset-top, 10px)); z-index: 500`），内部集成搜索框 `.search-box`、下拉筛选 `.select-custom`、分段控制器 `.segmented-control` 或子标签栏 `.tab-bar`。
- **轻量无外框形态（`.sticky-toolbar.bare` + `.sticky-toolbar-row`）**：采用轻盈无外框的顶部胶囊切换布局，去除整条横幅外框与遮罩，仅在内部浮动组件（`.capsule-switcher`、`.segmented-control`、`.pill-btn`、`.search-box` 等）周圈施加柔和渐变阴影（`--sticky-float-shadow`），既不遮挡顶部背景又能在滚动时保持清晰层次。
- 为确保 `position: sticky` 在各端稳定生效，`html, body` 仅在 `@supports (overflow-x: clip)` 条件块中声明 `overflow-x: clip`（避免旧浏览器回退到 `overflow-x: hidden` 破坏吸顶）。

### 5.3 核心 KPI 指标卡与交互联动（`.card.interactive` & `.stat-interactive`）
- KPI 卡片采用 **三行式紧凑结构**（上：语义色微标签 `.val-sub`；中：大号数值 `.val-big`；下：简短补充状态 `.val-sub`），或者 **二行式极简结构**（直接 `.val-sub` + `.val-big`）。
- 支持点击卡片直接跳转至对应过滤状态的列表视图。

### 5.4 双形态切换控制器（`.segmented-control` vs `.capsule-switcher`）
1. **iOS 经典分段控件（`.segmented-control` + `.segment-btn`）**：圆角矩形槽（`border-radius: 12px`），激活项浮起纯白/深灰卡片背景（`background: var(--card); box-shadow: var(--shadow-sm)`），适用于状态过滤与时间范围切换（24h/7d/30d）。
2. **跑道胶囊子视图切换器（`.capsule-switcher` + `.pill-btn`）**：全圆角跑道槽（`border-radius: 99px; padding: 2px`），激活项使用实心主色（`.pill-btn.accent`），适用于页面顶部的模式切换（如“📊 实时概览 / 🔬 多维分析”）。

### 5.5 双视图数据展示：卡片网格（`.item-card`）与高密度表格（`.table-wrap`）
- **卡片网格视图（`.item-grid-container` + `.item-card`）**：响应式 `1 / 2 / 3` 列网格，每张卡片包含头部（双行截断标题 + 状态 `.badge`）、中部进度条 `.progress-track`、底部元数据与圆形快捷操作按钮组 `.icon-btn`。
- **高密度数据表格（`.table-wrap` + `table`）**：表头 `th` 采用 `--card-sec` 底色与 `11px` 次级粗体字；单元格 `td` 保持 `white-space: nowrap` 配合外层横向平滑滚动；主标识符使用 `.ip-text`（等宽蓝字 + 点击触发详情弹窗），并在下方附带单行截断的 `.geo-subline` 次级元数据小字，避免拆成多列导致表格过宽。

### 5.6 Top-N 进度排行榜（`.rank-item` & `.diag-row-item`）
- 序号徽标 `.rank-num` 对前三名赋予高辨识度色彩：`top1`（`#ef4444` 红）、`top2`（`#f97316` 橙）、`top3`（`#eab308` 黄），其余为 `.normal` 中性灰底。
- 右侧数值与底部进度条 `.rank-bar-fill` 联动展示占比。

### 5.7 磨砂模态弹窗（`.modal-overlay` + `.modal-sheet`）与异步确认框（`auiConfirm`）
- 遮罩层采用 `rgba(0,0,0,0.6)` + `backdrop-filter: blur(16px)`。
- 弹窗主体 `.modal-sheet` 圆角 `22px`，弹出动画采用 `scale(0.95) translateY(8px)` ➔ `scale(1) translateY(0)`。
- 支持点击背景遮罩或按 `Esc` 键关闭；需要二次确认时统一使用 `await auiConfirm(message, { title, confirmText, cancelText, danger })`（禁止阻塞式 `window.confirm()`）。

### 5.8 顶部悬浮胶囊通知（`.toast-pill`）与微型监控悬浮窗（`.mini-floating-hud`）
- 所有操作反馈严禁使用浏览器原生阻塞式 `alert()`，统一调用 `showToast('...')` 从顶部中心滑入毛玻璃胶囊提示。
- 实时监控类应用可提供右下角 `.mini-floating-hud` 微型卡片，使用等宽字体展示核心实时速率。

---

## 六、 图表视觉集成规范

在 AUI 中绘制趋势图或分布图时，必须遵循以下极简规范：
1. **平滑面积折线图（Live Area Line Chart）**：
   - `tension: 0.4`（平滑贝塞尔曲线）
   - `borderWidth: 2.5`，`pointRadius: 0`（隐藏常态数据点，仅在悬停时高亮，保持线条干净）
   - `fill: true`，填充色采用对应语义色的 `0.08 ~ 0.16` 透明度
2. **坐标轴克制原则**：
   - 迷你实时走势图（`.chart-mini`）：直接隐藏 X/Y 轴（`display: false`）与内置图例，由卡片头部右侧的彩色圆点标签自解释。
   - 多维时序分析图（`.chart-box`）：仅保留水平细线网格（`color: tokens.gridColor`），隐藏垂直网格线与坐标轴边框。

---

## 七、 “布局自解释”反模式对照表（AI 开发自检清单）

| ❌ 错误做法（违背 AUI 规范） | ✅ 正确做法（遵循 AUI 布局自解释原则） |
| :--- | :--- |
| 在页面顶部放一段 Alert 说明：“欢迎使用管理后台，您可以在下方查看各项监控指标并管理规则。” | 直接展示 `.header` + `.grid-4` 核心 KPI 卡片，零寒暄废话。 |
| 在每个卡片标题下方都写一行长句解释：“此表格展示了所有节点的列表，点击操作按钮可以修改状态。” | 卡片头部左侧仅放 `.card-title`，右侧直接放搜索框与操作胶囊按钮。 |
| 把节点地址、地区、城市、服务商拆成 5 个独立的表格列，导致表格横向严重溢出。 | 合并为单列：第一行 `.ip-text` 展示等宽可点击主标识符，第二行 `.geo-subline` 展示 `🇸🇬 新加坡 · 核心网关节点`。 |
| 表单每个输入框下面都挂一行灰色 helper text 重复解释字段含义。 | 使用紧凑的 `.form-label`（11px 粗体）+ 清晰的 `placeholder` 示例值，省去底部赘述。 |
| 使用浏览器原生 `alert()` 或直角实心红框报错。 | 统一使用顶部毛玻璃胶囊 `showToast('✅ 配置已保存')` 与柔光语义徽标 `.tag.danger`。 |
